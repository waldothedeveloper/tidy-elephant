// Phone number formatting utility
export const formatPhoneNumber = (value: string): string => {
  // Remove all non-numeric characters
  const phoneNumber = value.replace(/\D/g, "");

  // Don't format if empty
  if (!phoneNumber) return "";

  // Don't format if more than 10 digits
  if (phoneNumber.length > 10) return phoneNumber.slice(0, 10);

  // Format based on length
  if (phoneNumber.length < 4) {
    return `(${phoneNumber}`;
  } else if (phoneNumber.length < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  } else {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
  }
};
