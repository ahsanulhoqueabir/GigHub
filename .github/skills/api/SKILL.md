# API Routing and Response Format Skill

This skill ensures that all backend API routes, service methods, error handling, payload validation, pagination, and authentication remain consistent across this Next.js App Router codebase.

---

## 1. Consistent Response Formatting

All route handlers MUST return standard response payloads using the utilities from `@/lib/api/api-response`.

### Success Responses (`ok`)

```typescript
import { NextRequest } from "next/server";
import { ok } from "@/lib/api/api-response";

export async function GET() {
  return ok({ data: result, message: "Data retrieved successfully" });
}
```

The `ok` utility accepts an object:

| Option       | Type      | Default | Description                        |
| ------------ | --------- | ------- | ---------------------------------- |
| `data`       | `unknown` | —       | Response payload (object / array)  |
| `message`    | `string`  | —       | Optional human-readable message    |
| `statusCode` | `number`  | `200`   | HTTP status (use `201` for create) |

Response shape:

```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {}
}
```

### Error Responses (`fail`)

```typescript
import { fail } from "@/lib/api/api-response";

// Simple error
return fail({ error: "Not found" });

// With custom status
return fail({ error: "Unauthorized", statusCode: 401 });

// With extra context
return fail({ error: "Validation failed", data: errors, statusCode: 422 });
```

The `fail` utility accepts:

| Option       | Type      | Default | Description                 |
| ------------ | --------- | ------- | --------------------------- |
| `error`      | `string`  | —       | **Required.** Error message |
| `data`       | `unknown` | —       | Optional extra context      |
| `statusCode` | `number`  | `400`   | HTTP status                 |

Response shape:

```json
{
  "success": false,
  "error": "Not found"
}
```

### Service-level helpers (`success` / `error`)

Service methods (in `@/services/`) return a discriminated union using the lightweight helpers from `@/lib/api/api-response`:

```typescript
import { success, error } from "@/lib/api/api-response";

// On success
return success(data);

// On failure
return error("Something went wrong");
```

- `success<T>(data: T)` → `{ success: true as const, data: T }`
- `error(error: string)` → `{ success: false as const, error: string }`

Route handlers then destructure the result:

```typescript
const result = await SomeService.list();
if (!result.success) {
  return fail({ error: result.error, statusCode: 404 });
}
return ok({ data: result.data });
```

---

## 2. Pagination

Every **list endpoint** MUST support pagination using the shared utilities in `@/lib/pagination.ts` and the types in `@/types/pagination.types.ts`.

### Types

```typescript
// PaginationMeta — returned to the client
interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// PaginatedData<T> — wraps items + meta
interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}
```

### In route handlers — parse query params

Use `parsePagination` and `parseSorting` from `@/lib/api/request-payload`:

```typescript
import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { parsePagination, parseSorting } from "@/lib/api/request-payload";
import { paginationMeta } from "@/lib/pagination";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const { page, limit } = parsePagination(searchParams);
    const { sortBy, sortOrder } = parseSorting(searchParams, [
      "name",
      "created_at",
    ]);

    const result = await SomeService.list({ page, limit, sortBy, sortOrder });

    if (!result.success) {
      return fail({ error: result.error });
    }

    const pagination = paginationMeta({
      page,
      limit,
      totalItems: result.data.total,
    });

    return ok({
      data: {
        items: result.data.items,
        pagination,
      },
    });
  } catch (err) {
    return fail({
      error: (err as Error).message || "An unknown error occurred",
      statusCode: 500,
    });
  }
}
```

### In services — use `paginationParams`

```typescript
import { paginationParams } from "@/lib/pagination";

static async list(options?: PaginationOptions) {
  try {
    const { page, limit, offset } = paginationParams(options);

    const { data, count } = await supabase
      .from("table_name")
      .select("*", { count: "exact" })
      .range(offset, offset + limit - 1);

    return success({ items: data, total: count });
  } catch (err) {
    return error((err as Error).message);
  }
}
```

### Default constants

| Constant             | Value | Defined in                    |
| -------------------- | ----- | ----------------------------- |
| `DEFAULT_PAGE_LIMIT` | 20    | `@/types/pagination.types.ts` |
| `MAX_PAGE_LIMIT`     | 50    | `@/types/pagination.types.ts` |

`parsePagination` uses its own defaults: `defaultLimit = 50`, `maxLimit = 1000`.

---

## 3. Payload Sanitisation (not DTOs)

Instead of NestJS-style DTOs with `class-validator`, this project uses **sanitizer functions** in `@/lib/payload/`.

Each domain gets a file (e.g. `auth-payload.ts`) that exports:

1. A **TypeScript interface** describing the expected shape.
2. A **sanitize function** that strips unexpected fields and trims strings.

```typescript
// lib/payload/auth-payload.ts
export interface SanitizedLoginPayload {
  emailOrUsername: string;
  password: string;
}

export function sanitizeLoginPayload(
  body: Record<string, unknown>,
): SanitizedLoginPayload {
  const emailOrUsername =
    typeof body.emailOrUsername === "string" ? body.emailOrUsername.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  return { emailOrUsername, password };
}
```

Route usage:

```typescript
const body = await request.json();
const payload = sanitizeLoginPayload(body);

if (!payload.emailOrUsername || !payload.password) {
  return fail({ error: "Email/Username and password are required" });
}
```

---

## 4. Protecting Routes (Authentication)

Use the `withAuth` higher-order function from `@/lib/api/auth-middleware` for protected endpoints.  
It accepts a **single object** with `handler` and optional `options`.

```typescript
import { withAuth } from "@/lib/api/auth-middleware";
import { ok, fail } from "@/lib/api/api-response";

// Any authenticated user
export const GET = withAuth({
  handler: async ({ req, user }) => {
    // `user` is the decoded JWT payload: { profile, email, role }
    const result = await SomeService.getById(user.profile);

    if (!result.success) {
      return fail({ error: result.error, statusCode: 404 });
    }

    return ok({ data: result.data });
  },
});

// Admin only
export const POST = withAuth({
  handler: async ({ req }) => {
    // ...
  },
  options: { allowedRoles: ["ADMIN"] },
});

// Multiple roles
export const PATCH = withAuth({
  handler: async ({ req, params }) => {
    // `params` is auto-resolved from Next.js route context
    const id = params?.id;
    // ...
  },
  options: { allowedRoles: ["USER", "ADMIN"] },
});
```

The handler context (`AuthenticatedHandlerContext`) provides:

| Property | Type                                  | Description                             |
| -------- | ------------------------------------- | --------------------------------------- |
| `req`    | `NextRequest`                         | The incoming request object             |
| `user`   | `JwtPayload`                          | Decoded JWT: `{ profile, email, role }` |
| `params` | `Record<string, string \| undefined>` | Route params (auto-resolved)            |

For public endpoints, use a standard `POST` / `GET` export without `withAuth`:

```typescript
export async function POST(request: NextRequest) {
  // no auth required
}
```

---

## 5. Service Layer Pattern

All business logic lives in `@/services/`. Services are **static classes** that:

- Use `getSupabaseServerClient()` from `@/lib/api/supabase` for database access.
- Return `ServiceResult<T>` — the `{ success, data } | { success, error }` discriminated union.
- Never call `ok()` / `fail()` directly — those belong in route handlers only.

```typescript
import { getSupabaseServerClient } from "@/lib/api/supabase";
import { success, error } from "@/lib/api/api-response";

type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export class SomeService {
  static async getById(id: string): Promise<ServiceResult<Profile>> {
    try {
      const supabase = getSupabaseServerClient();
      const { data, error: sbError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (sbError) return error(sbError.message);
      if (!data) return error("Not found");

      return success(data as Profile);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }
}
```

---

## 6. Multi-Step DB Operations (RPC / Transactions)

Whenever an API flow requires **multiple database queries that must be atomic** (e.g. create profile + wallet in one go, delete a category only if unused), follow this pattern:

### Step 1 — Write a PostgreSQL function in `schema/`

Create a new file like `schema/993_your_feature.sql` with a `CREATE OR REPLACE FUNCTION` that wraps all steps in a single `plpgsql` block. Use `SECURITY DEFINER` if the function needs to bypass RLS.

```sql
-- ============================================================
-- 993 — your_feature: description of what it does atomically
-- Priority: 99 (run after all tables exist)
-- ============================================================

CREATE OR REPLACE FUNCTION your_function_name(
  p_param1 TEXT,
  p_param2 UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Step 1: validate / check references
  -- Step 2: perform the main operation
  -- Step 3: perform dependent operations
  -- Step 4: return result as JSONB

  RETURN jsonb_build_object('success', true, 'key', 'value');
END;
$$;
```

### Step 2 — Call the function from the service layer

Use `supabase.rpc()` to invoke the function from `@/services/`:

```typescript
import { getSupabaseServerClient } from "@/lib/api/supabase";
import { success, error } from "@/lib/api/api-response";

export class SomeService {
  static async doAtomicOperation(id: string) {
    try {
      const supabase = getSupabaseServerClient();
      const { data, error: rpcError } = await supabase.rpc(
        "your_function_name",
        { p_param1: id },
      );

      if (rpcError) return error(rpcError.message);

      const result = data as { success: boolean; [key: string]: unknown };
      if (!result.success) {
        return error((result as any).error || "Operation failed");
      }

      return success(result);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }
}
```

### Step 3 — Do NOT run the SQL yourself

The SQL file is committed to the repo. The developer manually runs it via the Supabase dashboard SQL Editor.

### Existing examples

| File                                       | Purpose                              |
| ------------------------------------------ | ------------------------------------ |
| `schema/991_signup_transaction.sql`        | Create profile + wallet atomically   |
| `schema/992_delete_category_if_unused.sql` | Delete category with FK safety check |
| `schema/990_stored_procedures.sql`         | Simple helper functions              |

---

## 7. Bruno Collection Syncing

The Bruno collection lives in `bruno/` at the project root. For every new API route:

1. Create a **happy-path** `.bru` file (e.g. `POST Login - Success.bru`).
2. Create **edge-case / error-path** `.bru` files (e.g. `POST Login - Missing Fields.bru`, `POST Login - Wrong Password.bru`).
3. Assert against the correct response shape:
   - Success: `res.body.success === true`, data at `res.body.data`
   - Error: `res.body.success === false`, error at `res.body.error`
   - Paginated: `res.body.data.items`, `res.body.data.pagination`
