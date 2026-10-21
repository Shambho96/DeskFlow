import type { CountryCode } from 'libphonenumber-js';

interface CountryFlagProps {
    country: CountryCode;
    countryName: string;
    className?: string;
}

export function CountryFlag({ country, countryName, className = '' }: CountryFlagProps) {
    return (
        <img
            src={`https://flagcdn.com/w40/${country.toLowerCase()}.png`}
            alt=""
            aria-hidden="true"
            title={countryName}
            width={20}
            height={15}
            loading="lazy"
            className={`h-[15px] w-5 shrink-0 rounded-[2px] object-cover ${className}`}
        />
    );
}