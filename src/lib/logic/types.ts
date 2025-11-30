export type PrayerName = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export interface PrayerTimes {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    [key: string]: string; // Allow other keys like midnight, sunset if needed, but primary ones are typed
}

export interface PrayerDisplay {
    name: PrayerName;
    time: string;
    enabled: boolean;
}
