import type { CountryCode } from 'libphonenumber-js';
import { getPhoneDisplayParts } from '../../lib/phone';
import { CountryFlag } from './CountryFlag';

interface PhoneNumberDisplayProps {
    value: string;
    className?: string;
    country?: CountryCode;
}

const countryNames = new Intl.DisplayNames(['en'], { type: 'region' });

export function PhoneNumberDisplay({
    value,
    className = '',
    country = 'IN',
}: PhoneNumberDisplayProps) {
    const phone = getPhoneDisplayParts(value, country);
    const countryName = countryNames.of(phone.country) ?? phone.country;

    return (
        <span className={`inline-flex items-center gap-1.5 ${className}`} title={`${countryName}: ${phone.value}`}>
            <CountryFlag country={phone.country} countryName={countryName} />
            <span>{phone.value}</span>
        </span>
    );
}