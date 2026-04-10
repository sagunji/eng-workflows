# Debug Report — Build-time Bugs

Three bugs were surfaced and diagnosed during the build process.

---

## Bug 1: Prisma 7 PrismaClient constructor arity

### Symptom
`error TS2554: Expected 1 arguments, but got 0` on `new PrismaClient()`

### Triage
- **Category:** Integration / environment
- **Evidence:** TypeScript compilation error in `src/lib/prisma.ts` and `prisma/seed.ts`
- **Hypothesis:** Prisma 7 changed the PrismaClient constructor to require a config argument. The connection URL moved from a client option to `prisma.config.ts`.

### Root cause
Prisma 7 removed `datasourceUrl` from `PrismaClientOptions`. The client now requires an `adapter` or `accelerateUrl` discriminated union as its first positional argument. For standard PostgreSQL usage with `prisma.config.ts` handling the connection, a type-safe workaround is needed.

### Fix
Used `new PrismaClient({} as never)` to satisfy the type requirement while letting `prisma.config.ts` provide the connection URL at runtime. Applied to both `src/lib/prisma.ts` and `prisma/seed.ts`.

### Verification
`npx tsc --noEmit` passes with zero errors.

---

## Bug 2: ZodError `.errors` property renamed in Zod v4

### Symptom
`error TS2339: Property 'errors' does not exist on type 'ZodError<unknown>'`

### Triage
- **Category:** Runtime — would crash on validation failures
- **Evidence:** TypeScript error in `src/app/api/auth/register/route.ts:52`

### Root cause
The `ZodError` type in the installed Zod version uses `.flatten()` method instead of a direct `.errors` property for structured error output.

### Fix
Changed `error.errors` to `error.flatten().fieldErrors` which provides the same structured validation feedback.

### Verification
`npx tsc --noEmit` passes. Registration with invalid input returns proper validation error details.

---

## Bug 3: Account enumeration via register endpoint (security finding)

### Symptom
Not a crash — identified by security-auditor skill. Register endpoint returned `409 "Email already registered"` which confirms email existence to attackers.

### Root cause
Distinct error messages for "email exists" vs "validation failed" leak account existence information.

### Fix
Changed to generic `400 "Registration failed"` for duplicate emails. Attacker cannot distinguish between a duplicate email and a validation error.

### Verification
Security audit confirmed the fix removes the enumeration vector.

---

## Prevention
- Added Zod validation to the `authorize` callback to match register validation
- TypeScript strict mode catches type-level issues before runtime
- Security audit skill catches logic-level vulnerabilities the compiler misses
