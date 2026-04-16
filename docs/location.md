# Location

Geo-location utilities: countries, currencies, timezones, and locale-aware formatting. Integrates with `@repo/i18n` for locale detection.

## Installation

```bash
pnpm add @repo/location
```

## Quick Start

```ts
import { getLocationFromRequest } from "@repo/location";

export default {
  async fetch(request: Request) {
    const location = getLocationFromRequest(request);
    
    return Response.json({
      country: location.country?.name,      // "United States"
      currency: location.currency?.code,    // "USD"
      timezone: location.timezone?.id,      // "America/New_York"
      dateFormat: location.dateFormat,      // "MM/dd/yyyy"
    });
  }
}
```

## Countries

```ts
import {
  getCountry,
  getAllCountries,
  searchCountries,
  getCountryFlag,
  COUNTRY_FLAGS,
  COUNTRY_NAMES,
} from "@repo/location/countries";

// Get country by code
const us = getCountry("US");
// { code: "US", name: "United States", flag: "🇺🇸" }

// Get all countries
const countries = getAllCountries();

// Search countries
const results = searchCountries("united");
// [{ code: "US", name: "United States", ... }, { code: "GB", name: "United Kingdom", ... }]

// Get flag emoji
const flag = getCountryFlag("JP"); // "🇯🇵"
```

## Currencies

```ts
import {
  getCurrency,
  getCurrencyForCountry,
  getAllCurrencies,
  formatCurrency,
  parseCurrencyAmount,
  CURRENCIES,
} from "@repo/location/currencies";

// Get currency by code
const usd = getCurrency("USD");
// { code: "USD", name: "US Dollar", symbol: "$", decimals: 2 }

// Get currency for country
const currency = getCurrencyForCountry("JP");
// { code: "JPY", name: "Japanese Yen", symbol: "¥", decimals: 0 }

// Format currency
formatCurrency(1234.56, "USD", "en-US"); // "$1,234.56"
formatCurrency(1234, "JPY", "ja-JP");    // "¥1,234"
formatCurrency(1234.56, "EUR", "de-DE"); // "1.234,56 €"

// Parse currency amount (handles various formats)
parseCurrencyAmount("$1,234.56");  // 1234.56
parseCurrencyAmount("1.234,56");   // 1234.56 (EU format)
parseCurrencyAmount("€1,234.56");  // 1234.56
```

## Timezones

```ts
import {
  getTimezone,
  getTimezoneForCountry,
  getAllTimezones,
  getTimeInTimezone,
  getDateInTimezone,
  convertTimezone,
  TIMEZONES,
} from "@repo/location/timezones";

// Get timezone by ID
const tz = getTimezone("America/New_York");
// { id: "America/New_York", name: "Eastern Time (US & Canada)", offset: "UTC-05:00", offsetMinutes: -300 }

// Get timezone for country
const jpTz = getTimezoneForCountry("JP");
// { id: "Asia/Tokyo", name: "Tokyo", offset: "UTC+09:00", offsetMinutes: 540 }

// Get current time in timezone
getTimeInTimezone("Asia/Tokyo"); // "10:30 PM"

// Get date in timezone
getDateInTimezone("Europe/London", new Date(), "en-GB"); // "13 January 2025"

// Convert between timezones
const nyTime = convertTimezone(new Date(), "UTC", "America/New_York");
```

## Location Detection

Uses Cloudflare's geo headers to detect user location.

```ts
import { getLocationFromRequest, getLocationByCountry } from "@repo/location";

// From Cloudflare request (uses cf.country, cf.timezone, etc.)
const location = getLocationFromRequest(request);

console.log(location.countryCode);      // "US"
console.log(location.country?.name);    // "United States"
console.log(location.country?.flag);    // "🇺🇸"
console.log(location.currency?.code);   // "USD"
console.log(location.currency?.symbol); // "$"
console.log(location.timezone?.id);     // "America/New_York"
console.log(location.detectedTimezone); // "America/Chicago" (actual CF detection)
console.log(location.dateFormat);       // "MM/dd/yyyy"
console.log(location.city);             // "New York"
console.log(location.region);           // "NY"

// By country code (without request)
const jpLocation = getLocationByCountry("JP");
```

## Date Formats

```ts
import { getDateFormat } from "@repo/location";

getDateFormat("US"); // "MM/dd/yyyy"
getDateFormat("GB"); // "dd/MM/yyyy"
getDateFormat("DE"); // "dd.MM.yyyy"
getDateFormat("JP"); // "yyyy/MM/dd"
getDateFormat("SE"); // "yyyy-MM-dd"
```

## Integration with i18n

Location re-exports useful functions from `@repo/i18n`:

```ts
import { getGeoData, detectLocale, COUNTRY_LOCALE_MAP } from "@repo/location";

// Get raw geo data from Cloudflare
const geo = getGeoData(request);
// { country: "US", timezone: "America/New_York", city: "...", ... }

// Detect locale with full options
const result = detectLocale(request, {
  supportedLocales: ["en", "es", "fr"],
  defaultLocale: "en",
  useCountryFallback: true,
});
```

## Use Cases

### Pricing Display

```ts
import { getLocationFromRequest, formatCurrency } from "@repo/location";

app.get("/pricing", async (c) => {
  const location = getLocationFromRequest(c.req.raw);
  const currency = location.currency?.code || "USD";
  
  const prices = {
    USD: 9.99,
    EUR: 8.99,
    GBP: 7.99,
    JPY: 1200,
  };
  
  const price = prices[currency] || prices.USD;
  const formatted = formatCurrency(price, currency);
  
  return c.json({ price: formatted, currency });
});
```

### Timezone-Aware Scheduling

```ts
import { getLocationFromRequest, getTimeInTimezone } from "@repo/location";

app.get("/schedule", async (c) => {
  const location = getLocationFromRequest(c.req.raw);
  const tz = location.detectedTimezone || location.timezone?.id || "UTC";
  
  const slots = ["09:00", "14:00", "18:00"].map(time => ({
    utc: time,
    local: getTimeInTimezone(tz),
  }));
  
  return c.json({ timezone: tz, slots });
});
```

### Country Selector

```tsx
import { getAllCountries } from "@repo/location/countries";

function CountrySelect({ value, onChange }) {
  const countries = getAllCountries();
  
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {countries.map((c) => (
        <option key={c.code} value={c.code}>
          {c.flag} {c.name}
        </option>
      ))}
    </select>
  );
}
```
