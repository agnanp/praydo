export interface Location {
 id: number;
 lokasi: string;
}

export interface Daily {
    tanggal: string,
    imsak: string,
    subuh: string,
    terbit: string,
    dhuha: string,
    dzuhur: string,
    ashar: string,
    maghrib: string,
    isya: string,
    date: string
}

export interface Schedule {
    id: number;
    lokasi: string;
    daerah: string;
    jadwal: Daily;
}

export interface Path {
    path: string;
}

export interface LocationResponse {
  status: boolean;
  request: Path;
  data: Location[];
}

export interface ScheduleResponse {
    status: boolean;
    request: Path;
    data: Schedule;
}

export interface ComboboxData {
  label: string;
  value: string;
}