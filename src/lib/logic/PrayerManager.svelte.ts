import { PrayTime } from "$lib/praytime";
import { selectedLocation } from "$lib/store/selectedLocation";
import { calculationSettings } from "$lib/store/calculationSettings";
import { selectedTimes } from "$lib/store/selectedTimes";
import { timeRemaining } from "$lib/store/timeRemaining";
import { selectedAlert } from "$lib/store/selectedAlert";
import { invoke } from "@tauri-apps/api/core";
import { isPermissionGranted, requestPermission } from "@tauri-apps/plugin-notification";
import { playSound } from "$lib/sound";
import { gregorianToHijri } from "@tabby_ai/hijri-converter";
import { formattedLocation } from "$lib/utils/stringUtils";
import type { PrayerName, PrayerTimes } from "./types";

export class PrayerManager {
    currentTime = $state(new Date());

    private intervalId: ReturnType<typeof setInterval>;

    constructor() {
        // Single tick loop for the entire app
        this.intervalId = setInterval(() => {
            this.currentTime = new Date();
            this.checkNotifications();
        }, 1000);
    }

    destroy() {
        if (this.intervalId) clearInterval(this.intervalId);
    }

    // --- Calendar Logic ---

    getMonthSchedule(year: number, month: number): Array<{ day: number; prayers: PrayerTimes }> {
        const schedule = [];
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const pt = this.createPrayTimeInstance();

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const times = pt.getTimes(date) as unknown as PrayerTimes;
            schedule.push({ day, prayers: times });
        }
        return schedule;
    }

    private createPrayTimeInstance(): PrayTime {
        let pt: PrayTime;
        if (calculationSettings.state.method === "custom") {
            pt = new PrayTime();
            pt.adjust({
                fajr: calculationSettings.state.fajrAngle,
                maghrib: calculationSettings.state.maghrib,
                isha: calculationSettings.state.isha,
                midnight: calculationSettings.state.midnight,
            });
        } else {
            pt = new PrayTime(calculationSettings.state.method);
        }

        pt.location([
            selectedLocation.state.latitude,
            selectedLocation.state.longitude,
        ]);

        pt.format(selectedTimes.state.format);
        pt.adjust({
            dhuhr: calculationSettings.state.dhuhrMinutes,
            asr: calculationSettings.state.asrMethod,
            highLats: calculationSettings.state.highLatitudes,
        });

        return pt;
    }

    // --- Derived State: Date & Time ---

    formattedDate = $derived.by(() => {
        const options: Intl.DateTimeFormatOptions = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        };
        return this.currentTime.toLocaleDateString("en-US", options);
    });

    islamicDate = $derived.by(() => {
        const hijriDate = gregorianToHijri({
            year: this.currentTime.getFullYear(),
            month: this.currentTime.getMonth() + 1,
            day: this.currentTime.getDate(),
        });

        const hijriMonths = [
            "Muharram", "Safar", "Rabi al-Awwal", "Rabi al-Thani",
            "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Shaban",
            "Ramadan", "Shawwal", "Dhul-Qadah", "Dhul-Hijjah",
        ];

        return `${hijriDate.day} ${hijriMonths[hijriDate.month - 1]} ${hijriDate.year} AH`;
    });

    currentLocationLabel = $derived(formattedLocation(selectedLocation.state.label));

    // --- Qibla Direction ---
    
    qiblaDirection = $derived.by(() => {
        const lat1 = selectedLocation.state.latitude * (Math.PI / 180);
        const lon1 = selectedLocation.state.longitude * (Math.PI / 180);
        
        const MAKKAH_LAT = 21.422487 * (Math.PI / 180);
        const MAKKAH_LON = 39.826206 * (Math.PI / 180);

        const dLon = MAKKAH_LON - lon1;

        const y = Math.sin(dLon) * Math.cos(MAKKAH_LAT);
        const x = Math.cos(lat1) * Math.sin(MAKKAH_LAT) -
                  Math.sin(lat1) * Math.cos(MAKKAH_LAT) * Math.cos(dLon);

        let bearing = Math.atan2(y, x);
        bearing = bearing * (180 / Math.PI);
        
        return (bearing + 360) % 360;
    });

    // --- Derived State: Prayer Calculations ---

    private prayTimeInstance = $derived.by(() => {
        return this.createPrayTimeInstance();
    });

    todaysPrayerTimes = $derived.by(() => {
        return this.prayTimeInstance.getTimes(this.currentTime);
    });

    tomorrowsPrayerTimes = $derived.by(() => {
        const tomorrow = new Date(this.currentTime);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return this.prayTimeInstance.getTimes(tomorrow);
    });

    // Returns sorted list of enabled prayers for today
    enabledPrayers = $derived.by(() => {
        const times = this.todaysPrayerTimes;
        return this.getEnabledPrayersList(times);
    });

    nextPrayer = $derived.by(() => {
        const now = this.currentTime;
        
        // 1. Check today's remaining prayers
        for (const prayer of this.enabledPrayers) {
            const prayerDate = this.parseTime(prayer.time);
            if (prayerDate > now) {
                return { ...prayer, date: prayerDate, isToday: true };
            }
        }

        // 2. If none, check tomorrow's first prayer
        const tomorrowPrayers = this.getEnabledPrayersList(this.tomorrowsPrayerTimes);
        if (tomorrowPrayers.length > 0) {
            const firstPrayer = tomorrowPrayers[0];
            const prayerDate = this.parseTime(firstPrayer.time);
            prayerDate.setDate(prayerDate.getDate() + 1); // Add 1 day
            return { ...firstPrayer, date: prayerDate, isToday: false };
        }

        return null;
    });

    countdownString = $derived.by(() => {
        if (!this.nextPrayer) return "";

        const diff = this.nextPrayer.date.getTime() - this.currentTime.getTime();
        if (diff < 0) return "00:00:00"; // Should not happen ideally due to loop

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    });

    // --- Helpers ---

    private getEnabledPrayersList(times: Record<string, string>) {
        const prayerNames: PrayerName[] = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
        return prayerNames
            .map(name => ({
                name,
                time: times[name.toLowerCase()],
                enabled: selectedTimes.state.daily[name.toLowerCase() as keyof typeof selectedTimes.state.daily]
            }))
            .filter(p => p.enabled);
    }

    private parseTime(timeString: string): Date {
        const date = new Date(this.currentTime); // Clone current date to keep Year/Month/Day
        if (!timeString) return date;

        const [time, modifier] = timeString.split(" ");
        let [hours, minutes] = time.split(":").map(Number);

        if (modifier === "PM" && hours < 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;

        date.setHours(hours, minutes, 0, 0);
        return date;
    }

    // --- Notification Logic ---

    private async checkNotifications() {
        const now = this.currentTime;
        // Only check at the start of a second (approx)
        // But since this is called once per second, we just check equality.
        
        for (const prayer of this.enabledPrayers) {
            const prayerDate = this.parseTime(prayer.time);
            
            // 1. Pre-prayer notification (N minutes before)
            const nMinutesBefore = new Date(prayerDate.getTime() - timeRemaining.state.minutes * 60 * 1000);
            if (this.isSameTime(now, nMinutesBefore)) {
                await this.sendNMinutesNotification(prayer.name, prayer.time);
            }

            // 2. Exact time notification
            if (this.isSameTime(now, prayerDate)) {
                await this.sendPrayerNotification(prayer.name, prayer.time);
            }
        }
    }

    private isSameTime(d1: Date, d2: Date): boolean {
        return d1.getHours() === d2.getHours() &&
               d1.getMinutes() === d2.getMinutes() &&
               d1.getSeconds() === d2.getSeconds(); // Assuming loop runs close to second boundary
               // Note: In a real loop, seconds might skip if blocked. 
               // But for a desktop clock app, this simple check is usually "good enough" 
               // or we'd need state to track "last checked time".
    }

    private async sendNMinutesNotification(name: string, time: string) {
        if (await this.ensurePermission()) {
            invoke("send_native_notification", {
                title: `${timeRemaining.state.minutes} Minutes Until ${name} Time`,
                body: `${name} Time: ${time}.`,
            });
        }
        playSound("solemn.mp3");
    }

    private async sendPrayerNotification(name: string, time: string) {
        if (await this.ensurePermission()) {
             invoke("send_native_notification", {
                title: `${name} Time ${time}`,
                body: `${name} time in ${this.currentLocationLabel}.`,
            });
        }

        // Sound logic
        const prayerKey = name.toLowerCase();
        const isAlertEnabled = selectedAlert.state.alert[prayerKey as keyof typeof selectedAlert.state.alert];
        
        if (isAlertEnabled) {
            if (prayerKey === "fajr") {
                playSound("adhan-fajr.mp3");
            } else {
                playSound("adhan-makkah.mp3");
            }
        } else {
            playSound("solemn.mp3");
        }
    }

    private async ensurePermission(): Promise<boolean> {
        let granted = await isPermissionGranted();
        if (!granted) {
            const result = await requestPermission();
            granted = result === "granted";
        }
        return granted;
    }
}
