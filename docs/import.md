# Import

Data import utilities: CSV parsing, data transformation, and validation. Integrates with `@repo/location` for currency/amount parsing.

## Installation

```bash
pnpm add @repo/import
```

## Quick Start

```ts
import { parseCSV, mapData, parseDate, parseAmount } from "@repo/import";

interface Transaction {
  date: Date | null;
  description: string;
  amount: number;
}

const csv = await file.text();
const raw = parseCSV(csv);

const { data, errors } = mapData<Transaction>(raw, [
  { source: "Date", target: "date", transform: parseDate },
  { source: ["Description", "Memo", "Note"], target: "description" },
  { source: "Amount", target: "amount", transform: parseAmount },
]);
```

## CSV Parsing

### Parse CSV to Objects

```ts
import { parseCSV } from "@repo/import/csv";

const csv = `name,email,age
John,john@example.com,30
Jane,jane@example.com,25`;

const data = parseCSV(csv);
// [
//   { name: "John", email: "john@example.com", age: "30" },
//   { name: "Jane", email: "jane@example.com", age: "25" }
// ]
```

### Parse Options

```ts
const data = parseCSV(csv, {
  delimiter: ";",           // Auto-detected by default
  quote: '"',               // Quote character
  hasHeader: true,          // First row is header
  skipEmpty: true,          // Skip empty rows
  trim: true,               // Trim whitespace
  columns: ["a", "b", "c"], // Override column names
});
```

### Parse to Raw Arrays

```ts
import { parseCSVRaw } from "@repo/import/csv";

const rows = parseCSVRaw(csv);
// [["name", "email", "age"], ["John", "john@example.com", "30"], ...]
```

### Generate CSV

```ts
import { generateCSV } from "@repo/import/csv";

const csv = generateCSV([
  { name: "John", email: "john@example.com", createdAt: "2025-01-13" },
  { name: "Jane", email: "jane@example.com", createdAt: "2025-01-12" },
], {
  columns: ["name", "email", "createdAt"],
  headers: { createdAt: "Created Date" },
  delimiter: ",",
  includeHeader: true,
});
```

### Validate CSV

```ts
import { validateCSV } from "@repo/import/csv";

const { valid, errors } = validateCSV(csv, {
  requiredColumns: ["name", "email"],
  minRows: 1,
  maxRows: 1000,
});

if (!valid) {
  console.error("Validation errors:", errors);
}
```

### Detect Delimiter

```ts
import { detectDelimiter } from "@repo/import/csv";

detectDelimiter("a,b,c\n1,2,3");   // ","
detectDelimiter("a;b;c\n1;2;3");   // ";"
detectDelimiter("a\tb\tc\n1\t2\t3"); // "\t"
```

## Data Transformation

### Date Parsing

```ts
import { parseDate, formatDateISO } from "@repo/import/transform";

// Parse various formats
parseDate("2025-01-13");      // Date
parseDate("01/13/2025");      // Date (US format)
parseDate("13/01/2025");      // Date (EU format)
parseDate("Jan 13, 2025");    // Date
parseDate("13 January 2025"); // Date
parseDate("invalid");         // null

// Format to ISO
formatDateISO(new Date());           // "2025-01-13"
formatDateISO("Jan 13, 2025");       // "2025-01-13"
```

### Amount Parsing

```ts
import { parseAmount, formatAmount } from "@repo/import/transform";

// Parse various formats
parseAmount("1,234.56");      // 1234.56
parseAmount("1.234,56");      // 1234.56 (EU format)
parseAmount("$1,234.56");     // 1234.56
parseAmount("(100.00)");      // -100 (accounting negative)
parseAmount("-$50.00");       // -50
parseAmount("€1.234,56");     // 1234.56

// Invert sign (for expense imports)
parseAmount("100.00", { inverted: true }); // -100

// Format amount
formatAmount(1234.56);                    // "1,234.56"
formatAmount(1234.56, { decimals: 0 });   // "1,235"
formatAmount(1234.56, { 
  thousandsSeparator: ".", 
  decimalSeparator: "," 
}); // "1.234,56"
```

### String Transformations

```ts
import {
  normalizeString,
  toTitleCase,
  toSentenceCase,
  slugify,
} from "@repo/import/transform";

normalizeString("  hello   world  "); // "hello world"
toTitleCase("hello world");           // "Hello World"
toSentenceCase("HELLO WORLD");        // "Hello world"
slugify("Hello World!");              // "hello-world"
```

## Data Mapping

Map source data to target schema with transformations.

```ts
import { mapData, parseDate, parseAmount, type FieldMapping } from "@repo/import";

interface Transaction {
  date: Date | null;
  description: string;
  amount: number;
  category: string;
}

const mappings: FieldMapping<Transaction>[] = [
  // Multiple source names (first match wins)
  { source: ["Date", "Transaction Date", "date"], target: "date", transform: parseDate },
  
  // Simple mapping
  { source: "Description", target: "description" },
  
  // With transform
  { source: "Amount", target: "amount", transform: parseAmount },
  
  // With default value
  { source: "Category", target: "category", default: "uncategorized" },
  
  // Required field
  { source: "Amount", target: "amount", required: true },
  
  // Custom transform with access to full row
  { 
    source: "Type", 
    target: "amount", 
    transform: (value, row) => {
      const amount = parseAmount(row.Amount);
      return value === "debit" ? -Math.abs(amount) : Math.abs(amount);
    }
  },
];

const { data, errors } = mapData<Transaction>(csvData, mappings);

if (errors.length > 0) {
  console.error("Mapping errors:", errors);
  // [{ row: 5, field: "amount", message: "Required field is missing" }]
}
```

## Validation

```ts
import {
  isValidEmail,
  isValidUrl,
  isValidPhone,
  cleanPhone,
} from "@repo/import/transform";

// Email validation
isValidEmail("user@example.com"); // true
isValidEmail("invalid");          // false

// URL validation
isValidUrl("https://example.com"); // true
isValidUrl("not-a-url");           // false

// Phone validation (basic)
isValidPhone("+1 (555) 123-4567"); // true
isValidPhone("123");               // false

// Clean phone number
cleanPhone("+1 (555) 123-4567"); // "+15551234567"
```

## Complete Example

```ts
import { parseCSV, mapData, validateCSV, parseDate, parseAmount } from "@repo/import";

async function importTransactions(file: File) {
  const csv = await file.text();
  
  // Validate structure
  const validation = validateCSV(csv, {
    requiredColumns: ["Date", "Amount"],
    minRows: 1,
    maxRows: 10000,
  });
  
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }
  
  // Parse CSV
  const raw = parseCSV(csv);
  
  // Map to schema
  const { data, errors } = mapData<{
    date: Date | null;
    description: string;
    amount: number;
    category: string;
  }>(raw, [
    { source: ["Date", "Transaction Date"], target: "date", transform: parseDate, required: true },
    { source: ["Description", "Memo"], target: "description", default: "" },
    { source: "Amount", target: "amount", transform: parseAmount, required: true },
    { source: "Category", target: "category", default: "uncategorized" },
  ]);
  
  if (errors.length > 0) {
    return { success: false, errors };
  }
  
  // Filter valid entries
  const valid = data.filter(t => t.date !== null && !isNaN(t.amount));
  
  return { success: true, data: valid, count: valid.length };
}
```

## Integration with Location

The import package uses `@repo/location` for currency parsing:

```ts
import { parseCurrencyAmount, formatCurrency } from "@repo/import";

// These are re-exported from @repo/location
parseCurrencyAmount("$1,234.56"); // 1234.56
formatCurrency(1234.56, "USD");   // "$1,234.56"
```
