import { AsYouType, getCountries, getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';
import { Check, ChevronDown, CircleCheck, CircleX } from 'lucide-react';
import { useRef, useState } from 'react';
import { formatPhoneInput } from '../../lib/phone';
import { CountryFlag } from './CountryFlag';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';

interface PhoneNumberInputProps {
    value: string;
    country: CountryCode;
    onChange: (value: string, country: CountryCode) => void;
    placeholder?: string;
    required?: boolean;
    className?: string;
}

const countryNames = new Intl.DisplayNames(['en'], { type: 'region' });

const countryOptions = getCountries()
    .map(country => ({
        country,
        name: countryNames.of(country) ?? country,
        callingCode: getCountryCallingCode(country),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));

export function PhoneNumberInput({
    value,
    country,
    onChange,
    placeholder = 'Phone number',
    required = false,
    className = '',
}: PhoneNumberInputProps) {
    const [isCountryListOpen, setIsCountryListOpen] = useState(false);
    const [countryFilter, setCountryFilter] = useState('');
    const phoneInputRef = useRef<HTMLInputElement>(null);
    const selectedCountry = countryOptions.find(option => option.country === country) ?? countryOptions[0];
    const phoneNumber = value ? parsePhoneNumberFromString(value, country) : undefined;
    const isValid = phoneNumber?.isValid() ?? false;
    const filteredCountries = countryOptions.filter(option =>
        `${option.name} +${option.callingCode}`.toLowerCase().includes(countryFilter.trim().toLowerCase())
    );

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.currentTarget.value;
        const cursor = event.currentTarget.selectionStart ?? inputValue.length;
        const digitsBeforeCursor = inputValue.slice(0, cursor).replace(/\D/g, '').length;
        let nationalNumber = inputValue.replace(/\D/g, '');
        let nextCountry = country;
        let nextCursorDigits = digitsBeforeCursor;

        if (inputValue.trimStart().startsWith('+')) {
            const internationalFormatter = new AsYouType();
            internationalFormatter.input(inputValue);
            const internationalNumber = internationalFormatter.getNumber();
            if (internationalNumber?.country) {
                nationalNumber = internationalNumber.nationalNumber;
                nextCountry = internationalNumber.country;
                nextCursorDigits = nationalNumber.length;
            } else {
                nationalNumber = inputValue;
            }
        } else {
            const formatter = new AsYouType(country);
            formatter.input(nationalNumber);
            nextCountry = formatter.getCountry() ?? country;
        }

        onChange(nationalNumber, nextCountry);

        const formattedValue = formatPhoneInput(nationalNumber, nextCountry);
        let formattedCursor = formattedValue.length;
        let seenDigits = 0;
        for (let index = 0; index < formattedValue.length; index += 1) {
            if (/\d/.test(formattedValue[index])) seenDigits += 1;
            if (seenDigits >= nextCursorDigits) {
                formattedCursor = index + 1;
                break;
            }
        }

        requestAnimationFrame(() => {
            phoneInputRef.current?.setSelectionRange(formattedCursor, formattedCursor);
        });
    };

    return (
        <div className={className}>
            <div className="flex h-10 w-full items-stretch overflow-hidden rounded-lg border border-[var(--input)] bg-[var(--background)] focus-within:ring-2 focus-within:ring-[var(--primary)]/30">
                <Popover
                    open={isCountryListOpen}
                    onOpenChange={open => {
                        setIsCountryListOpen(open);
                        if (!open) setCountryFilter('');
                    }}
                >
                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            aria-label={`Country code: ${selectedCountry.name} +${selectedCountry.callingCode}`}
                            className="flex shrink-0 items-center gap-1.5 border-r border-[var(--border)] px-2.5 text-xs text-[var(--foreground)] hover:bg-[var(--muted)] focus-visible:outline-none"
                        >
                            <CountryFlag country={country} countryName={selectedCountry.name} />
                            <span>+{selectedCountry.callingCode}</span>
                            <ChevronDown className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" sideOffset={6} className="w-[300px] p-2">
                        <input
                            autoFocus
                            type="search"
                            value={countryFilter}
                            onChange={event => setCountryFilter(event.target.value)}
                            placeholder="Search country or code"
                            aria-label="Search countries"
                            className="mb-2 h-9 w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                        />
                        <div
                            className="max-h-60 overflow-y-auto overscroll-contain touch-pan-y"
                            style={{ maxHeight: 'min(60dvh, 15rem)', WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
                            onWheel={event => event.stopPropagation()}
                            onTouchMove={event => event.stopPropagation()}
                            role="listbox"
                            aria-label="Countries"
                        >
                            {filteredCountries.map(option => (
                                <button
                                    key={option.country}
                                    type="button"
                                    role="option"
                                    aria-selected={country === option.country}
                                    onClick={() => {
                                        onChange(value, option.country);
                                        setIsCountryListOpen(false);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)] focus-visible:bg-[var(--muted)] focus-visible:outline-none"
                                >
                                    <CountryFlag country={option.country} countryName={option.name} />
                                    <span className="min-w-0 flex-1 truncate">{option.name}</span>
                                    <span className="text-[var(--muted-foreground)]">+{option.callingCode}</span>
                                    {country === option.country && <Check className="h-4 w-4 text-[var(--primary)]" />}
                                </button>
                            ))}
                            {filteredCountries.length === 0 && (
                                <p className="px-2.5 py-3 text-sm text-[var(--muted-foreground)]">No countries found.</p>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>

                <input
                    ref={phoneInputRef}
                    type="tel"
                    autoComplete="tel-national"
                    inputMode="tel"
                    value={formatPhoneInput(value, country)}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    required={required}
                    aria-label="Phone number"
                    className="min-w-0 flex-1 bg-transparent px-3 text-sm text-[var(--foreground)] outline-none"
                />
                {value && (
                    <span
                        className={`flex shrink-0 items-center gap-1 px-2 text-[11px] font-medium ${isValid ? 'text-emerald-600' : 'text-rose-500'}`}
                        role="status"
                        aria-live="polite"
                    >
                        {isValid ? <CircleCheck className="h-4 w-4" /> : <CircleX className="h-4 w-4" />}
                        <span className="hidden sm:inline">{isValid ? 'Valid' : 'Invalid'}</span>
                    </span>
                )}
            </div>
        </div>
    );
}