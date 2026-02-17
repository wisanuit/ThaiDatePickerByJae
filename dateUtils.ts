// Constants
export const BE_OFFSET = 543;

export const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

export const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
];

/**
 * Converts a Gregorian Date object to a Thai Buddhist Era year string (DD/MM/YYYY)
 */
export const formatThaiDate = (date: Date | null): string => {
  if (!date || isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const yearBE = date.getFullYear() + BE_OFFSET;
  return `${day}/${month}/${yearBE}`;
};

/**
 * Converts a Gregorian Date object to a Thai Buddhist Era year string with Time (DD/MM/YYYY HH:mm)
 */
export const formatThaiDateTime = (date: Date | null): string => {
  if (!date || isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const yearBE = date.getFullYear() + BE_OFFSET;
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${yearBE} ${hour}:${minute}`;
};

/**
 * Converts a Gregorian Date object to an AD string (YYYY-MM-DD)
 */
export const formatADDate = (date: Date | null): string => {
  if (!date || isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};

/**
 * Converts a Gregorian Date object to an AD string with Time (YYYY-MM-DD HH:mm)
 */
export const formatADDateTime = (date: Date | null): string => {
  if (!date || isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}`;
};

/**
 * Parses a Thai Date string (DD/MM/YYYY) back to a Gregorian Date object.
 * Returns null if invalid or year is out of range (+/- 100 years from now).
 */
export const parseThaiDate = (value: string): Date | null => {
  if (value.length !== 10) return null;
  
  const parts = value.split('/');
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const yearBE = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(yearBE)) return null;

  // Basic range checks
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  const yearAD = yearBE - BE_OFFSET;
  
  // Year Range Validation: Current Year +/- 100
  const currentYear = new Date().getFullYear();
  if (yearAD > currentYear + 100 || yearAD < currentYear - 100) {
      return null;
  }
  
  // Create date and verify it matches
  const date = new Date(yearAD, month - 1, day);
  
  if (
    date.getFullYear() !== yearAD ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

/**
 * Parses a Thai Date Time string (DD/MM/YYYY HH:mm) back to a Gregorian Date object.
 */
export const parseThaiDateTime = (value: string): Date | null => {
  if (value.length !== 16) return null;
  
  const [dateStr, timeStr] = value.split(' ');
  if (!dateStr || !timeStr) return null;

  const date = parseThaiDate(dateStr);
  if (!date) return null;

  const [hourStr, minuteStr] = timeStr.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (isNaN(hour) || isNaN(minute)) return null;
  if (hour < 0 || hour > 23) return null;
  if (minute < 0 || minute > 59) return null;

  date.setHours(hour);
  date.setMinutes(minute);

  return date;
};

/**
 * Parses an AD Date string (YYYY-MM-DD) to a Gregorian Date object.
 */
export const parseADDate = (value: string): Date | null => {
  if (!value || value.length !== 10) return null;
  const parts = value.split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
};

/**
 * Parses an AD Date Time string (YYYY-MM-DD HH:mm) to a Gregorian Date object.
 */
export const parseADDateTime = (value: string): Date | null => {
    if (!value || value.length !== 16) return null;
    const [dateStr, timeStr] = value.split(' ');
    if (!dateStr || !timeStr) return null;

    const date = parseADDate(dateStr);
    if (!date) return null;

    const [hourStr, minuteStr] = timeStr.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    if (isNaN(hour) || isNaN(minute)) return null;
    if (hour < 0 || hour > 23) return null;
    if (minute < 0 || minute > 59) return null;

    date.setHours(hour);
    date.setMinutes(minute);
    return date;
}

/**
 * Checks if a string input is potentially part of a valid date format (digits and slashes)
 */
export const isValidDateInputChar = (char: string): boolean => {
  return /[\d\/]/.test(char);
};

export const getDaysInMonth = (yearAD: number, monthIndex: number): number => {
  return new Date(yearAD, monthIndex + 1, 0).getDate();
};

export const getFirstDayOfMonth = (yearAD: number, monthIndex: number): number => {
  return new Date(yearAD, monthIndex, 1).getDay();
};