import { AsYouType, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';

export function formatPhoneInput(value: string, country: CountryCode = 'IN'): string {
  return new AsYouType(country).input(value);
}

export function normalizePhoneNumber(value: string, country: CountryCode = 'IN'): string | undefined {
  const phoneNumber = parsePhoneNumberFromString(value, country);

  return phoneNumber?.isValid() ? phoneNumber.number : undefined;
}

export function getPhoneInputParts(value: string, fallbackCountry: CountryCode = 'IN') {
  const phoneNumber = parsePhoneNumberFromString(value, fallbackCountry);

  return phoneNumber
    ? { value: phoneNumber.nationalNumber, country: phoneNumber.country ?? fallbackCountry }
    : { value, country: fallbackCountry };
}

export function getPhoneDisplayParts(value: string, fallbackCountry: CountryCode = 'IN') {
  const phoneNumber = parsePhoneNumberFromString(value, fallbackCountry);

  return phoneNumber
    ? { value: phoneNumber.formatInternational(), country: phoneNumber.country ?? fallbackCountry }
    : { value, country: fallbackCountry };
}