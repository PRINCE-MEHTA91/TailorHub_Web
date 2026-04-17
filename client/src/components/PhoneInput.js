import React, { useState, useRef, useEffect } from 'react';

const COUNTRY_CODES = [
  { code: '+91',  flag: '🇮🇳', name: 'India',          digits: 10 },
  { code: '+1',   flag: '🇺🇸', name: 'USA',             digits: 10 },
  { code: '+44',  flag: '🇬🇧', name: 'UK',              digits: 10 },
  { code: '+61',  flag: '🇦🇺', name: 'Australia',       digits: 9  },
  { code: '+971', flag: '🇦🇪', name: 'UAE',             digits: 9  },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia',    digits: 9  },
  { code: '+65',  flag: '🇸🇬', name: 'Singapore',       digits: 8  },
  { code: '+60',  flag: '🇲🇾', name: 'Malaysia',        digits: 9  },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh',      digits: 10 },
  { code: '+92',  flag: '🇵🇰', name: 'Pakistan',        digits: 10 },
  { code: '+94',  flag: '🇱🇰', name: 'Sri Lanka',       digits: 9  },
  { code: '+977', flag: '🇳🇵', name: 'Nepal',           digits: 10 },
  { code: '+49',  flag: '🇩🇪', name: 'Germany',         digits: 10 },
  { code: '+33',  flag: '🇫🇷', name: 'France',          digits: 9  },
  { code: '+81',  flag: '🇯🇵', name: 'Japan',           digits: 10 },
  { code: '+86',  flag: '🇨🇳', name: 'China',           digits: 11 },
  { code: '+55',  flag: '🇧🇷', name: 'Brazil',          digits: 11 },
  { code: '+27',  flag: '🇿🇦', name: 'South Africa',    digits: 9  },
];

const DEFAULT_COUNTRY = COUNTRY_CODES[0];

function parseStoredPhone(stored) {
  if (!stored) return { country: DEFAULT_COUNTRY, number: '' };
  const match = COUNTRY_CODES.find(c => stored.startsWith(c.code));
  if (match) {
    return { country: match, number: stored.slice(match.code.length) };
  }
  return { country: DEFAULT_COUNTRY, number: stored.replace(/^\+\d+/, '') };
}

export default function PhoneInput({
  value = '',
  onChange,
  placeholder = 'Enter phone number',
  label,
  icon = '📱',
  iconBg = 'bg-indigo-50',
  inputStyle = 'customer',
  id,
  error: externalError,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [touched, setTouched] = useState(false);
  const dropRef = useRef(null);

  const parsed = parseStoredPhone(value);
  const [selectedCountry, setSelectedCountry] = useState(parsed.country);
  const [digits, setDigits] = useState(parsed.number);

  useEffect(() => {
    const p = parseStoredPhone(value);
    setSelectedCountry(p.country);
    setDigits(p.number);
  }, [value]);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setOpen(false);
    setSearch('');

    const trimmed = digits.slice(0, country.digits);
    const combined = trimmed ? `${country.code}${trimmed}` : '';
    if (onChange) onChange(combined);
  };

  const handleDigitChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    const limited = raw.slice(0, selectedCountry.digits);
    setDigits(limited);
    const combined = limited ? `${selectedCountry.code}${limited}` : '';
    if (onChange) onChange(combined);
    setTouched(true);
  };

  const filtered = COUNTRY_CODES.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.includes(search)
  );

  const internalError =
    touched && digits.length > 0 && digits.length < selectedCountry.digits
      ? `Please enter a valid ${selectedCountry.digits}-digit phone number`
      : touched && digits.length === 0 && value
      ? 'Please enter a phone number'
      : '';

  const showError = externalError || internalError;

  if (inputStyle === 'tailor') {
    return (
      <div className="flex flex-col gap-1" ref={dropRef}>
        {label && (
          <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            {label}
          </label>
        )}
        <div
          className={`flex items-center bg-stone-50 border rounded-xl overflow-visible focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition relative ${showError ? 'border-red-400' : 'border-stone-200'}`}
        >
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-1.5 px-3 py-2.5 border-r border-stone-200 hover:bg-stone-100 transition rounded-l-xl flex-shrink-0"
          >
            <span className="text-base leading-none">{selectedCountry.flag}</span>
            <span className="text-xs font-bold text-stone-700">{selectedCountry.code}</span>
            <span className="text-stone-400 text-[10px]">▼</span>
          </button>
          <input
            id={id}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            value={digits}
            onChange={handleDigitChange}
            onBlur={() => setTouched(true)}
            placeholder={placeholder}
            maxLength={selectedCountry.digits}
            className="flex-1 bg-transparent text-sm font-semibold text-stone-800 outline-none placeholder:text-stone-300 placeholder:font-normal px-3 py-2.5"
          />
          {digits.length === selectedCountry.digits && (
            <span className="text-green-500 text-sm pr-3 flex-shrink-0">✓</span>
          )}
          {open && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-stone-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="p-2 border-b border-stone-100">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search country…"
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-orange-400"
                  autoFocus
                />
              </div>
              <div className="max-h-52 overflow-y-auto">
                {filtered.map(c => (
                  <button
                    key={c.code}
                    type="button"
                    onMouseDown={() => handleCountrySelect(c)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-orange-50 text-left transition ${selectedCountry.code === c.code ? 'bg-orange-50' : ''}`}
                  >
                    <span className="text-base">{c.flag}</span>
                    <span className="text-xs font-bold text-stone-700 flex-1 truncate">{c.name}</span>
                    <span className="text-xs text-stone-400 font-mono">{c.code}</span>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="text-center text-xs text-stone-400 py-4">No results</p>
                )}
              </div>
            </div>
          )}
        </div>
        {showError && (
          <p className="text-red-500 text-[11px] font-semibold mt-0.5">⚠ {showError}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1" ref={dropRef}>
      {label && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</span>
      )}
      <div
        className={`flex items-center gap-3 bg-gray-50 border rounded-xl px-0 focus-within:ring-2 focus-within:ring-indigo-300 transition relative overflow-visible ${showError ? 'border-red-400' : 'border-gray-200'}`}
      >
        <div className={`w-9 h-9 ${iconBg} rounded-l-xl flex items-center justify-center text-base flex-shrink-0`}>
          {icon}
        </div>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1 py-2.5 border-r border-gray-200 pr-2.5 hover:bg-gray-100 transition flex-shrink-0"
        >
          <span className="text-base leading-none">{selectedCountry.flag}</span>
          <span className="text-xs font-bold text-gray-600">{selectedCountry.code}</span>
          <span className="text-gray-400 text-[10px]">▼</span>
        </button>
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          value={digits}
          onChange={handleDigitChange}
          onBlur={() => setTouched(true)}
          placeholder={placeholder}
          maxLength={selectedCountry.digits}
          className="flex-1 bg-transparent text-sm font-semibold text-gray-800 outline-none placeholder:text-gray-400 placeholder:font-normal py-2.5 pr-3"
        />
        {digits.length === selectedCountry.digits && (
          <span className="text-green-500 text-sm pr-3 flex-shrink-0">✓</span>
        )}
        {open && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-2 border-b border-gray-100">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search country…"
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400"
                autoFocus
              />
            </div>
            <div className="max-h-52 overflow-y-auto">
              {filtered.map(c => (
                <button
                  key={c.code}
                  type="button"
                  onMouseDown={() => handleCountrySelect(c)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-indigo-50 text-left transition ${selectedCountry.code === c.code ? 'bg-indigo-50' : ''}`}
                >
                  <span className="text-base">{c.flag}</span>
                  <span className="text-xs font-bold text-gray-700 flex-1 truncate">{c.name}</span>
                  <span className="text-xs text-gray-400 font-mono">{c.code}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-4">No results</p>
              )}
            </div>
          </div>
        )}
      </div>
      {showError && (
        <p className="text-red-500 text-xs font-semibold mt-0.5">⚠ {showError}</p>
      )}
    </div>
  );
}
