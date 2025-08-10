import { RuneStore } from "@tauri-store/svelte";

export interface CalculationSettings {
  method:"MWL"
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
  | "MU"
  | "custom";
  fajrAngle: number;
  dhuhrMinutes: string;
  asrMethod: 'Standard' | 'Hanafi';
  maghrib: number | string; // angle or minutes
  maghribMode: 'degrees' | 'minutes';
  isha: number | string; // angle or minutes
  ishaMode: 'degrees' | 'minutes';
  midnight: 'Standard' | 'Jafari';
  highLatitudes: 'NightMiddle' | 'OneSeventh' | 'AngleBased' | 'None';
  [key: string]: any; // Add index signature for RuneStore compatibility
}

export const defaultCalculationSettings: CalculationSettings = {
  method: 'NU',
  fajrAngle: 20,
  dhuhrMinutes: '1 min',
  asrMethod: 'Standard',
  maghrib: '1 min',
  maghribMode: 'minutes',
  isha: 18,
  ishaMode: 'degrees',
  midnight: 'Standard',
  highLatitudes: 'NightMiddle'
};

export const calculationSettings = new RuneStore('calculationSettings', defaultCalculationSettings, {
  saveOnChange: true,
  saveStrategy: 'debounce',
  saveInterval: 1000,
  autoStart: true,
});

export const calculationMethods = [
  { value: 'MWL', label: 'Muslim World League' },
  { value: 'ISNA', label: 'Islamic Society of North America' },
  { value: 'Egypt', label: 'Egyptian General Authority of Survey' },
  { value: 'Makkah', label: 'Umm Al-Qura University, Makkah' },
  { value: 'Karachi', label: 'University of Islamic Sciences, Karachi' },
  { value: 'Tehran', label: 'Institute of Geophysics, University of Tehran' },
  { value: 'Jafari', label: 'Leva Research Institute, Qom' },
  { value: 'France', label: 'Muslims of France' },
  { value: 'Russia', label: 'Spiritual Administration of Muslims of Russia' },
  { value: 'Singapore', label: 'Islamic Religious Council of Singapore ' },
  { value: 'NU', label: 'Lembaga Falakiyah NU, Indonesia' },
  { value: 'MU', label: 'Muhammadiyah, Indonesia' },
  { value: 'custom', label: 'Custom' }
];

export const asrMethods = [
  { value: 'Standard', label: 'Standard (Shafii, Maliki, Jafari, Hanbali)' },
  { value: 'Hanafi', label: 'Hanafi' }
];

export const midnightMethods = [
  { value: 'Standard', label: 'Standard (mean time from Sunset to Sunrise)' },
  { value: 'Jafari', label: 'Jafari (mean time from Maghrib to Fajr)' }
];

export const highLatitudeMethods = [
  { value: 'NightMiddle', label: 'Middle of the Night' },
  { value: 'OneSeventh', label: 'One Seventh' },
  { value: 'AngleBased', label: 'Angle-Based' },
  { value: 'None', label: 'None' }
];