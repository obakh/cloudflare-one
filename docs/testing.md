# Testing Guide

Comprehensive testing strategy for the monorepo.

## Testing Philosophy

We follow a testing pyramid approach:
- **Unit Tests** (70%): Fast, isolated tests for individual functions
- **Integration Tests** (20%): Tests for component interactions
- **E2E Tests** (10%): Full user flow tests

## Test Coverage Goals

| Package | Target Coverage | Priority |
|---------|----------------|----------|
| @repo/auth | 90% | Critical |
| @repo/db | 90% | Critical |
| @repo/security | 90% | Critical |
| @repo/payments | 85% | High |
| @repo/ui | 80% | High |
| @repo/utils | 80% | Medium |
| Others | 70% | Medium |

## Running Tests

### All Tests
```bash
# Run all unit tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run in watch mode
pnpm test -- --watch
```

### Specific Package
```bash
# Test specific package
pnpm --filter @repo/security test

# Watch mode for package
pnpm --filter @repo/security test:watch
```

### E2E Tests
```bash
# Run all E2E tests
pnpm test:e2e

# Run with UI
pnpm test:e2e:ui

# Run specific test file
pnpm test:e2e e2e/web.spec.ts
```

## Writing Unit Tests

### Test Structure

```typescript
import { describe, expect, it, beforeEach, afterEach } from "vitest";

describe("Feature Name", () => {
  // Setup
  beforeEach(() => {
    // Runs before each test
  });

  afterEach(() => {
    // Runs after each test
  });

  describe("Specific functionality", () => {
    it("should do something specific", () => {
      // Arrange
      const input = "test";

      // Act
      const result = myFunction(input);

      // Assert
      expect(result).toBe("expected");
    });

    it("should handle edge cases", () => {
      expect(() => myFunction(null)).toThrow();
    });
  });
});
```

### Testing Best Practices

1. **Test behavior, not implementation**
   ```typescript
   // ❌ Bad - tests implementation
   it("should call internal method", () => {
     expect(obj.internalMethod).toHaveBeenCalled();
   });

   // ✅ Good - tests behavior
   it("should return formatted user data", () => {
     const result = formatUser(user);
     expect(result).toEqual({ name: "John", age: 30 });
   });
   ```

2. **Use descriptive test names**
   ```typescript
   // ❌ Bad
   it("works", () => {});

   // ✅ Good
   it("should return null when user is not found", () => {});
   ```

3. **One assertion per test (when possible)**
   ```typescript
   // ❌ Bad - testing multiple things
   it("should validate user", () => {
     expect(user.name).toBe("John");
     expect(user.age).toBe(30);
     expect(user.email).toBe("john@example.com");
   });

   // ✅ Good - separate tests
   it("should have correct name", () => {
     expect(user.name).toBe("John");
   });

   it("should have correct age", () => {
     expect(user.age).toBe(30);
   });
   ```

4. **Test edge cases**
   - Empty inputs
   - Null/undefined
   - Very large inputs
   - Invalid data types
   - Boundary conditions

## Testing Cloudflare Workers

We use `@cloudflare/vitest-pool-workers` for testing Workers:

```typescript
import { env, SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("Worker", () => {
  it("should respond to requests", async () => {
    const response = await SELF.fetch("http://example.com");
    expect(response.status).toBe(200);
  });

  it("should access environment variables", () => {
    expect(env.MY_VAR).toBeDefined();
  });
});
```

## Testing Database Code

### Without Database Connection

```typescript
import { describe, expect, it, vi } from "vitest";

describe("Database queries", () => {
  it("should build correct query", () => {
    const query = buildUserQuery({ id: 1 });
    expect(query).toContain("SELECT * FROM users WHERE id = $1");
  });

  it("should sanitize inputs", () => {
    const query = buildUserQuery({ id: "1; DROP TABLE users;" });
    expect(query).not.toContain("DROP TABLE");
  });
});
```

### With Mock Database

```typescript
import { describe, expect, it, vi } from "vitest";

describe("User repository", () => {
  it("should fetch user by id", async () => {
    const mockDb = {
      query: vi.fn().mockResolvedValue([{ id: 1, name: "John" }])
    };

    const user = await getUserById(mockDb, 1);
    expect(user).toEqual({ id: 1, name: "John" });
    expect(mockDb.query).toHaveBeenCalledWith(
      expect.stringContaining("SELECT"),
      [1]
    );
  });
});
```

## Testing React Components

```typescript
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("should render with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("should call onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);

    await userEvent.click(screen.getByText("Click me"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
```

## E2E Testing with Playwright

### Basic Test

```typescript
import { expect, test } from "@playwright/test";

test("user can login", async ({ page }) => {
  // Navigate
  await page.goto("http://localhost:5173/login");

  // Fill form
  await page.fill('input[name="email"]', "user@example.com");
  await page.fill('input[name="password"]', "password123");

  // Submit
  await page.click('button[type="submit"]');

  // Assert
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText("Welcome back")).toBeVisible();
});
```

### Advanced Patterns

```typescript
// Use fixtures for common setup
test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:5173");
  await page.evaluate(() => localStorage.clear());
});

// Test with authentication
test("authenticated user can access dashboard", async ({ page }) => {
  // Set auth token
  await page.evaluate(() => {
    localStorage.setItem("token", "fake-token");
  });

  await page.goto("http://localhost:5173/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});

// Test API calls
test("should fetch user data", async ({ page }) => {
  await page.route("**/api/user", (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ name: "John", email: "john@example.com" })
    });
  });

  await page.goto("http://localhost:5173/profile");
  await expect(page.getByText("John")).toBeVisible();
});
```

## Mocking

### Mock Functions

```typescript
import { vi } from "vitest";

const mockFn = vi.fn();
mockFn.mockReturnValue(42);
mockFn.mockResolvedValue({ data: "async" });
mockFn.mockRejectedValue(new Error("failed"));

expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
expect(mockFn).toHaveBeenCalledTimes(3);
```

### Mock Modules

```typescript
vi.mock("@repo/utils", () => ({
  formatDate: vi.fn(() => "2024-01-01"),
  generateId: vi.fn(() => "test-id")
}));
```

### Mock Timers

```typescript
import { vi } from "vitest";

it("should delay execution", async () => {
  vi.useFakeTimers();

  const callback = vi.fn();
  setTimeout(callback, 1000);

  vi.advanceTimersByTime(1000);
  expect(callback).toHaveBeenCalled();

  vi.useRealTimers();
});
```

## Coverage Reports

### Viewing Coverage

```bash
# Generate coverage report
pnpm test:coverage

# Open HTML report
open coverage/index.html  # Mac
start coverage/index.html  # Windows
xdg-open coverage/index.html  # Linux
```

### Coverage Thresholds

Configure in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      },
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.spec.ts'
      ]
    }
  }
});
```

## CI/CD Integration

Tests run automatically in CI:
- On every push
- On every pull request
- Before deployment

### CI Test Commands

```yaml
# .github/workflows/ci.yml
- name: Run tests
  run: pnpm test

- name: Run E2E tests
  run: pnpm test:e2e

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Debugging Tests

### VS Code Debugging

1. Set breakpoint in test file
2. Press F5 or use "Debug Unit Tests (Current File)" launch config
3. Test will pause at breakpoint

### Console Debugging

```typescript
it("should debug", () => {
  console.log("Debug value:", myValue);
  console.table(myArray);
  console.dir(myObject, { depth: null });
});
```

### Playwright Debugging

```bash
# Run with UI
pnpm test:e2e:ui

# Run with headed browser
pnpm test:e2e -- --headed

# Run with debug mode
pnpm test:e2e -- --debug
```

## Common Testing Patterns

### Testing Async Code

```typescript
it("should handle async operations", async () => {
  const result = await fetchData();
  expect(result).toBeDefined();
});

it("should handle promises", () => {
  return expect(fetchData()).resolves.toBe("data");
});

it("should handle rejections", () => {
  return expect(fetchData()).rejects.toThrow("error");
});
```

### Testing Errors

```typescript
it("should throw error for invalid input", () => {
  expect(() => myFunction(null)).toThrow("Invalid input");
  expect(() => myFunction(null)).toThrow(ValidationError);
});
```

### Snapshot Testing

```typescript
it("should match snapshot", () => {
  const result = generateHTML();
  expect(result).toMatchSnapshot();
});

// Update snapshots with: pnpm test -- -u
```

## Performance Testing

```typescript
import { performance } from "node:perf_hooks";

it("should complete within time limit", () => {
  const start = performance.now();

  myExpensiveFunction();

  const duration = performance.now() - start;
  expect(duration).toBeLessThan(100); // 100ms
});
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Cloudflare Workers Testing](https://developers.cloudflare.com/workers/testing/vitest-integration/)

## Getting Help

If tests are failing:
1. Check [troubleshooting.md](./troubleshooting.md)
2. Run tests locally with `--reporter=verbose`
3. Check CI logs for detailed error messages
4. Ask in pull request comments
