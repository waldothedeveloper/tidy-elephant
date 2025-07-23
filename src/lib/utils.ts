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
