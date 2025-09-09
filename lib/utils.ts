import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parseStringify = (value: any) => {
  if (value === undefined || value === null) {
    return value;
  }
  return JSON.parse(JSON.stringify(value));
};

export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

// FORMAT DATE TIME
export const formatDateTime = (dateString: Date | string, timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    weekday: "long", // pełna nazwa dnia tygodnia (e.g., 'poniedziałek')
    month: "long", // pełna nazwa miesiąca (e.g., 'październik')
    day: "numeric", // numer dnia miesiąca (e.g., '25')
    year: "numeric", // rok (e.g., '2023')
    hour: "2-digit", // godzina (e.g., '08')
    minute: "2-digit", // minuta (e.g., '30')
    hour12: false, // format 24-godzinny
    timeZone, // strefa czasowa
  };

  const dateDayOptions: Intl.DateTimeFormatOptions = {
    weekday: "long", // pełna nazwa dnia tygodnia (e.g., 'poniedziałek')
    year: "numeric", // rok (e.g., '2023')
    month: "2-digit", // miesiąc (e.g., '10')
    day: "2-digit", // dzień (e.g., '25')
    timeZone, // strefa czasowa
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: "long", // pełna nazwa miesiąca (e.g., 'październik')
    year: "numeric", // rok (e.g., '2023')
    day: "numeric", // dzień miesiąca (e.g., '25')
    timeZone, // strefa czasowa
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit", // godzina (e.g., '08')
    minute: "2-digit", // minuta (e.g., '30')
    hour12: false, // format 24-godzinny
    timeZone, // strefa czasowa
  };

  const formattedDateTime: string = new Date(dateString).toLocaleString(
    "pl-PL",
    dateTimeOptions
  );

  const formattedDateDay: string = new Date(dateString).toLocaleString(
    "pl-PL",
    dateDayOptions
  );

  const formattedDate: string = new Date(dateString).toLocaleString(
    "pl-PL",
    dateOptions
  );

  const formattedTime: string = new Date(dateString).toLocaleString(
    "pl-PL",
    timeOptions
  );

  return {
    dateTime: formattedDateTime,
    dateDay: formattedDateDay,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

export function encryptKey(passkey: string) {
  return btoa(passkey);
}

export function decryptKey(passkey: string) {
  return atob(passkey);
}
