// praytime.ts - Prayer Times Calculator (v3.2)
// Copyright (c) 2007-2025 Hamid Zarrabi-Zadeh
// Source: https://praytimes.org
// License: MIT

//------------------------- User Interface ------------------------
/*
    method(method)          // set calculation method
    location(coordinates)   // set location
    timezone(timezone)      // set timezone
    utcOffset(number)       // set UTC offset in minutes or hours
    adjust(parameters)      // adjust calculation parameters
    tune(mins)              // tune times by given minutes
    format(format)          // options: 24h, 12h, 12H, x, X
    round(method)           // options: nearest, up, down, none
    getTimes(date)          // options: date, array, timestamp


//------------------------- Sample Usage --------------------------

    const praytime = new PrayTime('ISNA');
    praytime.location([43, -80]).timezone('America/Toronto');
    praytime.getTimes();

*/

//------------------------- Type Definitions ------------------------
type CalculationMethod =
  | "MWL"
  | "ISNA"
  | "Egypt"
  | "Makkah"
  | "Karachi"
  | "Tehran"
  | "Jafari"
  | "France"
  | "Russia"
  | "Singapore"
  | "NU"
  | "MU";
type HighLatitudeMethod = "NightMiddle" | "OneSeventh" | "AngleBased" | "None";
type AsrMethod = "Standard" | "Hanafi" | number | string;
type MidnightMethod = "Standard" | "Jafari";
type RoundingMethod = "nearest" | "up" | "down" | "none";
type TimeFormat =
  | "24h"
  | "12h"
  | "12H"
  | "x"
  | "X"
  | ((timestamp: number) => string);

interface MethodParams {
  fajr?: number;
  dhuhr?: string;
  asr?: AsrMethod;
  maghrib?: number | string;
  isha?: number | string;
  midnight?: MidnightMethod;
  highLats?: HighLatitudeMethod;
}

interface Settings {
  dhuhr: string;
  asr: AsrMethod;
  highLats: HighLatitudeMethod;
  tune: Record<string, number>;
  format: TimeFormat;
  rounding: RoundingMethod;
  utcOffset: number | "auto";
  timezone: string;
  location: [number, number];
  iterations: number;
  fajr?: number;
  isha?: number | string;
  maghrib?: number | string;
  midnight?: MidnightMethod;
}

interface Times {
  fajr: number;
  sunrise: number;
  dhuhr: number;
  asr: number;
  sunset: number;
  maghrib: number;
  isha: number;
  midnight: number;
  [key: string]: number;
}

interface SunPosition {
  declination: number;
  equation: number;
}

//------------------------- PrayTime Class ------------------------

class PrayTime {
  private methods: Record<string, MethodParams>;
  private settings: Settings;
  private labels: string[];
  private utcTime: number = 0;
  private adjusted: boolean = false;
  private sunPositionCache: Record<number, SunPosition> = {}; // Cache for sun positions

  constructor(method?: CalculationMethod) {
    this.methods = {
      MWL: { fajr: 18, isha: 17 },
      ISNA: { fajr: 15, isha: 15 },
      Egypt: { fajr: 19.5, isha: 17.5 },
      Makkah: { fajr: 18.5, isha: "90 min" },
      Karachi: { fajr: 18, isha: 18 },
      Tehran: { fajr: 17.7, maghrib: 4.5, midnight: "Jafari" },
      Jafari: { fajr: 16, maghrib: 4, midnight: "Jafari" },
      France: { fajr: 12, isha: 12 },
      Russia: { fajr: 16, isha: 15 },
      Singapore: { fajr: 20, isha: 18 },
      NU: { fajr: 20, isha: 18 },
      MU: { fajr: 18, isha: 18 },
      defaults: { isha: 14, maghrib: "1 min", midnight: "Standard" },
    };

    this.settings = {
      dhuhr: "0 min",
      asr: "Standard",
      highLats: "NightMiddle",
      tune: {},
      format: "24h",
      rounding: "nearest",
      utcOffset: "auto",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      location: [0, -new Date().getTimezoneOffset() / 4],
      iterations: 1,
    };

    this.labels = [
      "Fajr",
      "Sunrise",
      "Dhuhr",
      "Asr",
      "Sunset",
      "Maghrib",
      "Isha",
      "Midnight",
    ];

    this.method(method || "MWL");
  }

  //---------------------- Setters ------------------------

  // set calculation method
  public method(method: CalculationMethod): PrayTime {
    return this.set(this.methods.defaults).set(this.methods[method]);
  }

  // set calculating parameters
  /**
   * Adjust the calculation parameters for prayer times calculation
   * see https://praytimes.org/docs/manual for more details
   *
   * @param params - an object composed of any number of the following parameters:
   *                  - fajr: twilight angle
   *                  - dhuhr: minutes after mid-day
   *                  - asr: asr juristic method Standard: Shafii, Maliki, Jafari, and Hanbali (shadow factor = 1), Hanafi school of thought (shadow factor = 2)
   *                  - maghrib: twilight angle or minutes after Maghrib
   *                  - isha: twilight angle or minutes after Maghrib
   *                  - midnight: midnight method, Standard: the mean time from Sunset to Sunrise, Jafari: the mean time from Maghrib to Fajr
   *                  - highLats: higher latitudes adjustment
   * @returns The adjusted PrayTime instance
   */
  public adjust(params: Partial<MethodParams>): PrayTime {
    return this.set(params);
  }

  /**
   * Set the geographical location for prayer times calculation
   *
   * @param location - An array containing latitude and longitude coordinates [latitude, longitude]
   *                  Latitude ranges from -90 to 90 (negative for South, positive for North)
   *                  Longitude ranges from -180 to 180 (negative for West, positive for East)
   *
   * @example
   * // Set location for Mecca, Saudi Arabia
   * praytime.location([21.4225, 39.8262]);
   *
   * @example
   * // Set location for Jakarta, Indonesia (South of equator, East longitude)
   * praytime.location([-6.2088, 106.8456]);
   *
   * @example
   * // Set location for New York, USA (North of equator, West longitude)
   * praytime.location([40.7128, -74.0060]);
   *
   * @returns The PrayTime instance for method chaining
   */
  public location(location: [number, number]): PrayTime {
    return this.set({ location });
  }

  /**
   * Set the timezone for prayer times calculation
   *
   * @param timezone - A string representing the IANA timezone identifier
   *                  (e.g., 'America/New_York', 'Asia/Jakarta', 'Europe/London')
   *
   * @example
   * // Set timezone for Indonesia
   * praytime.timezone('Asia/Jakarta');
   *
   * @example
   * // Set timezone for Saudi Arabia
   * praytime.timezone('Asia/Riyadh');
   *
   * @example
   * // Set timezone for New York
   * praytime.timezone('America/New_York');
   *
   * @returns The PrayTime instance for method chaining
   */
  public timezone(timezone: string): PrayTime {
    return this.set({ timezone });
  }

  // set tuning minutes
  public tune(tune: Record<string, number>): PrayTime {
    return this.set({ tune });
  }

  // set rounding method
  public round(rounding: RoundingMethod = "nearest"): PrayTime {
    return this.set({ rounding });
  }

  // set time format
  public format(format: TimeFormat): PrayTime {
    return this.set({ format });
  }

  // set settings parameters
  public set(settings: Partial<Settings | MethodParams>): PrayTime {
    Object.assign(this.settings, settings);
    return this;
  }

  // set utc offset
  public utcOffset(utcOffset: number | "auto" = "auto"): PrayTime {
    if (typeof utcOffset === "number" && Math.abs(utcOffset) < 16)
      utcOffset *= 60;
    this.set({ timezone: "UTC" });
    return this.set({ utcOffset });
  }

  //---------------------- Getters ------------------------

  // get prayer times
  public times(
    date: number | Date | [number, number, number] = 0,
  ): Record<string, string> {
    if (typeof date === "number")
      date = new Date(date < 1000 ? Date.now() + date * 864e5 : date);
    if (date instanceof Date)
      date = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
    this.utcTime = Date.UTC(date[0], date[1] - 1, date[2]);

    let times = this.computeTimes();
    this.formatTimes(times);
    return times as unknown as Record<string, string>;
  }

  /**
   * Get prayer times for a specific date, location and timezone
   *
   * @param date - The date for which to calculate prayer times
   *              Can be a Date object, timestamp, days offset (number < 1000),
   *              or [year, month, day] array
   * @param location - An array containing [latitude, longitude] coordinates
   *                  Latitude ranges from -90 to 90 (negative for South, positive for North)
   *                  Longitude ranges from -180 to 180 (negative for West, positive for East)
   * @param timezone - IANA timezone string (e.g., 'Asia/Jakarta') or UTC offset in hours
   * @param dst - Daylight Saving Time adjustment in hours (usually 0 or 1)
   * @param format - Output time format: '24h', '12h' (with AM/PM), '12H' (without AM/PM)
   *
   * @example
   * // Get prayer times for Jakarta, Indonesia
   * praytime.getTimes(
   *   new Date(), // current date
   *   [-6.2088, 106.8456], // Jakarta coordinates
   *   'Asia/Jakarta' // timezone
   * );
   *
   * @example
   * // Get prayer times for Mecca with custom format
   * praytime.getTimes(
   *   new Date(), // current date
   *   [21.4225, 39.8262], // Mecca coordinates
   *   'Asia/Riyadh', // timezone
   *   0, // no DST
   *   '12h' // 12-hour format with AM/PM
   * );
   *
   * @returns An object containing prayer times with time names as keys
   */
  public getTimes(
    date?: number | Date | [number, number, number],
    location?: [number, number],
    timezone: string | number = "auto",
    dst: number = 0,
    format: TimeFormat = "24h",
  ): Record<string, string> {
    if (!location) return this.times(date);
    const utcOffset =
      timezone === "auto" ? timezone : (timezone as number) + dst;
    this.location(location).utcOffset(utcOffset).format(format);
    return this.times(date);
  }

  //---------------------- Deprecated -------------------------

  // deprecated: set calculation method
  public setMethod(method: CalculationMethod): void {
    this.method(method);
  }

  //---------------------- Compute Times -----------------------

  // compute prayer times
  private computeTimes(): Times {
    // Clear the sun position cache for this calculation cycle
    this.sunPositionCache = {};

    let times: Times = {
      fajr: 5,
      sunrise: 6,
      dhuhr: 12,
      asr: 13,
      sunset: 18,
      maghrib: 18,
      isha: 18,
      midnight: 24,
    };

    for (let i = 0; i < this.settings.iterations; i++)
      times = this.processTimes(times);

    this.adjustHighLats(times);
    this.updateTimes(times);
    this.tuneTimes(times);
    this.convertTimes(times);
    return times;
  }

  // process prayer times
  private processTimes(times: Times): Times {
    const params = this.settings;
    const horizon = 0.833;

    return {
      fajr: this.angleTime(params.fajr || 0, times.fajr, -1),
      sunrise: this.angleTime(horizon, times.sunrise, -1),
      dhuhr: this.midDay(times.dhuhr),
      asr: this.angleTime(this.asrAngle(params.asr, times.asr), times.asr),
      sunset: this.angleTime(horizon, times.sunset),
      maghrib: this.angleTime(params.maghrib || 0, times.maghrib),
      isha: this.angleTime(params.isha || 0, times.isha),
      midnight: this.midDay(times.midnight) + 12,
    };
  }

  // update times
  private updateTimes(times: Times): void {
    const params = this.settings;

    if (params.maghrib !== undefined && this.isMin(params.maghrib))
      times.maghrib = times.sunset + this.value(params.maghrib) / 60;
    if (params.isha !== undefined && this.isMin(params.isha))
      times.isha = times.maghrib + this.value(params.isha) / 60;
    if (params.midnight === "Jafari" && params.fajr !== undefined) {
      const nextFajr = this.angleTime(params.fajr, 29, -1) + 24;
      times.midnight =
        (times.sunset + (this.adjusted ? times.fajr + 24 : nextFajr)) / 2;
    }
    times.dhuhr += this.value(params.dhuhr) / 60;
  }

  // tune times
  private tuneTimes(times: Times): void {
    const mins = this.settings.tune;
    for (let i in times) {
      if (i in mins) {
        times[i] += mins[i] / 60;
      }
    }
  }

  // convert times
  private convertTimes(times: Times): void {
    const lng = this.settings.location[1];
    for (let i in times) {
      const time = times[i] - lng / 15;
      const timestamp = this.utcTime + Math.floor(time * 36e5);
      times[i] = this.roundTime(timestamp);
    }
  }

  // round time
  private roundTime(timestamp: number): number {
    const roundingMethod = this.settings.rounding;
    const rounding = {
      up: "ceil",
      down: "floor",
      nearest: "round",
      none: null,
    }[roundingMethod];

    if (!rounding) return timestamp;

    const OneMinute = 6e4;
    return (
      Math[rounding as "ceil" | "floor" | "round"](timestamp / OneMinute) *
      OneMinute
    );
  }

  //---------------------- Calculation Functions -----------------------

  // compute sun position
  private sunPosition(time: number): SunPosition {
    // Check if the sun position for this time is already cached
    if (this.sunPositionCache[time]) {
      return this.sunPositionCache[time];
    }

    const lng = this.settings.location[1];
    const D =
      this.utcTime / 864e5 - 10957.5 + this.value(time) / 24 - lng / 360;

    const g = this.mod(357.529 + 0.98560028 * D, 360);
    const q = this.mod(280.459 + 0.98564736 * D, 360);
    const L = this.mod(q + 1.915 * this.sin(g) + 0.02 * this.sin(2 * g), 360);
    const e = 23.439 - 0.00000036 * D;
    const RA = this.mod(
      this.arctan2(this.cos(e) * this.sin(L), this.cos(L)) / 15,
      24,
    );

    const sunPos = {
      declination: this.arcsin(this.sin(e) * this.sin(L)),
      equation: q / 15 - RA,
    };

    // Cache the result
    this.sunPositionCache[time] = sunPos;
    return sunPos;
  }

  // compute mid-day
  private midDay(time: number): number {
    const eqt = this.sunPosition(time).equation;
    const noon = this.mod(12 - eqt, 24);
    return noon;
  }

  // compute the time when sun reaches a specific angle below horizon
  private angleTime(
    angle: number | string,
    time: number,
    direction: number = 1,
  ): number {
    const lat = this.settings.location[0];
    const decl = this.sunPosition(time).declination;
    const numerator =
      -this.sin(this.value(angle)) - this.sin(lat) * this.sin(decl);
    const diff = this.arccos(numerator / (this.cos(lat) * this.cos(decl))) / 15;
    return this.midDay(time) + diff * direction;
  }

  // compute asr angle
  private asrAngle(asrParam: AsrMethod, time: number): number {
    const shadowFactor =
      { Standard: 1, Hanafi: 2 }[asrParam as string] || this.value(asrParam);
    const lat = this.settings.location[0];
    const decl = this.sunPosition(time).declination;
    return -this.arccot(shadowFactor + this.tan(Math.abs(lat - decl)));
  }

  //---------------------- Higher Latitudes -----------------------

  // adjust times for higher latitudes
  private adjustHighLats(times: Times): void {
    const params = this.settings;
    if (params.highLats === "None") return;

    this.adjusted = false;
    const night = 24 + times.sunrise - times.sunset;

    Object.assign(times, {
      fajr: this.adjustTime(
        times.fajr,
        times.sunrise,
        params.fajr || 0,
        night,
        -1,
      ),
      isha: this.adjustTime(times.isha, times.sunset, params.isha || 0, night),
      maghrib: this.adjustTime(
        times.maghrib,
        times.sunset,
        params.maghrib || 0,
        night,
      ),
    });
  }

  // adjust time in higher latitudes
  private adjustTime(
    time: number,
    base: number,
    angle: number | string,
    night: number,
    direction: number = 1,
  ): number {
    const factors: Record<HighLatitudeMethod, number> = {
      NightMiddle: 1 / 2,
      OneSeventh: 1 / 7,
      AngleBased: (1 / 60) * this.value(angle),
      None: 0,
    };
    const portion = factors[this.settings.highLats] * night;
    const timeDiff = (time - base) * direction;
    if (isNaN(time) || timeDiff > portion) {
      time = base + portion * direction;
      this.adjusted = true;
    }
    return time;
  }

  //---------------------- Formatting Functions ---------------------

  // format times
  private formatTimes(times: Times): void {
    for (let i in times) {
      (times as any)[i] = this.formatTime(times[i]);
    }
  }

  // format time
  private formatTime(timestamp: number): string {
    const format = this.settings.format;
    const InvalidTime = "-----";
    if (isNaN(timestamp)) return InvalidTime;
    if (typeof format === "function") return format(timestamp);
    if (format.toLowerCase() === "x")
      return Math.floor(timestamp / (format === "X" ? 1000 : 1)).toString();
    return this.timeToString(timestamp, format);
  }

  // convert time to string
  private timeToString(timestamp: number, format: TimeFormat): string {
    const utcOffset = this.settings.utcOffset;
    const date = new Date(
      timestamp + (utcOffset === "auto" ? 0 : (utcOffset as number)) * 6e4,
    );
    const str = date.toLocaleTimeString("en-US", {
      timeZone: this.settings.timezone,
      hour12: format === "24h" ? false : true,
      hour: format === "24h" ? "2-digit" : "numeric",
      minute: "2-digit",
    });
    return format === "12H" ? str.replace(/ ?[AP]M/, "") : str;
  }

  //---------------------- Misc Functions -----------------------

  // convert string to number
  private value(str: number | string): number {
    return +String(str).split(/[^0-9.+-]/)[0];
  }

  // detect if input contains 'min'
  private isMin(str: number | string): boolean {
    return String(str).indexOf("min") !== -1;
  }

  // positive modulo
  private mod(a: number, b: number): number {
    return ((a % b) + b) % b;
  }

  //--------------------- Degree-Based Trigonometry -----------------

  private dtr = (d: number): number => (d * Math.PI) / 180;
  private rtd = (r: number): number => (r * 180) / Math.PI;

  private sin = (d: number): number => Math.sin(this.dtr(d));
  private cos = (d: number): number => Math.cos(this.dtr(d));
  private tan = (d: number): number => Math.tan(this.dtr(d));

  private arcsin = (d: number): number => this.rtd(Math.asin(d));
  private arccos = (d: number): number => this.rtd(Math.acos(d));
  private arctan = (d: number): number => this.rtd(Math.atan(d));

  private arccot = (x: number): number => this.rtd(Math.atan(1 / x));
  private arctan2 = (y: number, x: number): number =>
    this.rtd(Math.atan2(y, x));
}

//------------------------- Export ------------------------

export { PrayTime };
