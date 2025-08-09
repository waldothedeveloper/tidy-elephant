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

// Valid EIN prefixes according to IRS
export const VALID_EIN_PREFIXES = [
  // Andover
  "10",
  "12",
  // Atlanta
  "60",
  "67",
  // Austin
  "50",
  "53",
  // Brookhaven
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "11",
  "13",
  "14",
  "16",
  "21",
  "22",
  "23",
  "25",
  "34",
  "51",
  "52",
  "54",
  "55",
  "56",
  "57",
  "58",
  "59",
  "65",
  // Cincinnati
  "30",
  "32",
  "35",
  "36",
  "37",
  "38",
  "61",
  // Fresno
  "15",
  "24",
  // Kansas City
  "40",
  "44",
  // Memphis
  "94",
  "95",
  // Ogden
  "80",
  "90",
  // Philadelphia
  "33",
  "39",
  "41",
  "42",
  "43",
  "46",
  "48",
  "62",
  "63",
  "64",
  "66",
  "68",
  "71",
  "72",
  "73",
  "74",
  "75",
  "76",
  "77",
  "85",
  "86",
  "87",
  "88",
  "91",
  "92",
  "93",
  "98",
  "99",
  // Internet
  "20",
  "26",
  "27",
  "45",
  "47",
  "81",
  "82",
  "83",
  "84",
  // SBA
  "31",
];
