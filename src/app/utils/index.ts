// Phone number formatting utility
export const formatPhoneNumber = (value: string): string => {
  const phoneNumber = value.replace(/\D/g, "");

  if (!phoneNumber) return "";
  if (phoneNumber.length > 10) return phoneNumber.slice(0, 10);

  if (phoneNumber.length < 4) {
    return `(${phoneNumber}`;
  } else if (phoneNumber.length < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  } else {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
  }
};

export const convertToE164 = (phoneNumber: string): string => {
  const digits = phoneNumber.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  throw new Error("Invalid US phone number format");
};
