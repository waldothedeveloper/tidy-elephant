import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function dollarsToCents(dollarString: string) {
  // Remove any non-digit characters except decimal point
  const cleaned = dollarString.replace(/[^\d.]/g, "");

  if (!/^\d+(\.\d{0,2})?$/.test(cleaned)) {
    throw new Error("Invalid currency format");
  }

  // Split on decimal point
  const parts = cleaned.split(".");
  const dollars = parseInt(parts[0]) || 0;
  const cents = parts[1] ? parseInt(parts[1].padEnd(2, "0")) : 0;

  return dollars * 100 + cents;
}

export function centsToDollars(cents: number): string {
  if (typeof cents !== "number" || cents < 0) {
    throw new Error("Invalid cents value");
  }

  const dollars = Math.floor(cents / 100);
  const remainingCents = cents % 100;

  // For whole dollar amounts, don't show .00
  if (remainingCents === 0) {
    return dollars.toString();
  }

  return `${dollars}.${remainingCents.toString().padStart(2, "0")}`;
}

/* *** 
      https://www.zeitverschiebung.net/en/country/us#timezones
      United States United States North America

      Current Local Time & Date, Time Zone and Time Difference

      The USA is located in North America, bordered to the south by Mexico and to the north by Canada. Hawaii, an island state, is in the Pacific Ocean and Alaska is separated from the rest of the country by Canada. The capital, Washington DC, is in the north east. The time zones for the mainland states are Eastern Time, Central Time, Mountain Time and Pacific Time. Unusually, Arizona does not observe Daylight Savings Time.

      How many time zones does United States have?

      United States has 29 time zones and a time difference from UTC-10 to UTC-5.

*** */

export const US_TIMEZONE_IDENTIFIERS = [
  "America/Adak",
  "Pacific/Honolulu",
  "America/Anchorage",
  "America/Juneau",
  "America/Metlakatla",
  "America/Nome",
  "America/Sitka",
  "America/Yakutat",
  "America/Los_Angeles",
  "America/Boise",
  "America/Denver",
  "America/Phoenix",
  "America/Chicago",
  "America/Indiana/Knox",
  "America/Indiana/Tell_City",
  "America/Menominee",
  "America/North_Dakota/Beulah",
  "America/North_Dakota/Center",
  "America/North_Dakota/New_Salem",
  "America/Detroit",
  "America/Indiana/Indianapolis",
  "America/Indiana/Marengo",
  "America/Indiana/Petersburg",
  "America/Indiana/Vevay",
  "America/Indiana/Vincennes",
  "America/Indiana/Winamac",
  "America/Kentucky/Louisville",
  "America/Kentucky/Monticello",
  "America/New_York",
] as const;
