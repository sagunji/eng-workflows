# Security Audit — Auth Routes and Middleware

## Summary

The authentication implementation uses NextAuth.js with JWT sessions and
bcrypt password hashing — a solid foundation. One major issue around account
enumeration and one critical issue around the NEXTAUTH_SECRET value need
to be addressed before shipping. Input validation via Zod on the register
endpoint is well done.

---

## Findings

### 🔴 Critical — exploit path exists, fix before shipping

- **Secrets and credentials** `.env:2` — The `NEXTAUTH_SECRET` is set to
  `"dev-secret-change-in-production"`. If this value reaches production,
  any attacker can forge JWT session tokens and impersonate any user.
  Exploit: Craft a JWT with any user ID, sign it with the known secret,
  and send it as a session cookie.
  Fix: Generate a cryptographically random secret for production:
  `openssl rand -base64 32`. Add `.env` to `.gitignore` (already done by
  Next.js scaffold). Add a startup check that fails if the secret matches
  the dev default.

### 🟡 Major — significant risk, fix soon

- **Authentication** `src/lib/auth.ts` — The `authorize` function returns
  different error messages for "user not found" vs "wrong password" to the
  internal handler, but both are caught by NextAuth and returned as a
  generic error. Currently safe because NextAuth abstracts this, but if
  error handling changes, account enumeration becomes possible. The
  registration endpoint at `/api/auth/register` returns HTTP 409 for
  duplicate emails — this confirms email existence to an attacker.
  Fix: Return a generic `400` with `"Registration failed"` instead of
  `409` with `"Email already registered"`. The UX tradeoff is acceptable
  for security.

- **Input validation** `src/lib/auth.ts` — The `authorize` callback does
  basic null checks but does not validate email format or password length
  before querying the database. Malformed or extremely long inputs could
  reach the database.
  Fix: Add Zod validation inside `authorize` matching the register schema,
  or create a shared validation schema.

### 🔵 Minor — low risk, worth addressing

- **CSRF** — NextAuth.js includes built-in CSRF protection for its own
  endpoints. The custom `/api/auth/register` POST endpoint relies on
  SameSite cookie defaults and origin checking by the browser. Acceptable
  for this app's risk profile.

- **Session handling** — JWT maxAge is 30 days which is generous. Consider
  reducing to 7 days for a dashboard app where users can sign in again
  easily.

---

## What's secure

- Password hashing uses bcrypt with cost factor 12 — strong
- Prisma parameterised queries prevent SQL injection
- Registration uses Zod schema validation with regex-based password strength
- NextAuth JWT strategy avoids server-side session storage attacks
- Middleware correctly protects `/dashboard` and `/api/workflows` routes
- User password is never returned in API responses (explicit `select` in register)
- Next.js escapes all JSX by default — no XSS vectors in auth forms

---

## Recommended next steps

1. Add a startup assertion that `NEXTAUTH_SECRET !== "dev-secret-change-in-production"`
2. Change register duplicate email response from 409 to generic 400
3. Add Zod validation to the `authorize` callback
4. Consider reducing JWT maxAge from 30 days to 7 days
