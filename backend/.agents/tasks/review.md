# Auth module with JWT and RBAC for CloudOps backend

This change adds the full authentication layer the project was missing: a self-registration and login flow backed by bcrypt, a Passport JWT strategy, and two guards (`JwtAuthGuard`, `RolesGuard`) that enforce role-based access on all existing controllers. The Role enum (`ADMIN`, `DEVOPS`, `VIEWER`) and the `role` field on `User` were already in the Prisma schema, so no migration was required beyond what already exists. The implementation follows standard NestJS patterns, `tsc --noEmit` reports zero errors, and a previous review pass already caught and fixed six issues. One behavioral gap remains worth calling out before shipping.

**Watch for:** `RolesGuard` is fail-open — any route handler that lacks a `@Roles()` annotation passes silently after JWT validation (**confirmed**). All current GET handlers carry explicit `@Roles()`, but every future write route will be unguarded by default until the developer remembers to annotate it. The comment added to `RolesGuard` documents the convention but does not enforce it. Additionally, `firstName` and `lastName` have no `@IsString()` guard against an empty-string default being persisted (**likely**), and the `RegisterDto` accepts `undefined` for both fields while `AuthService` silently falls back to `''`.

**Verdict**: APPROVED

---

## High-level view

`AuthModule` wires `PassportModule`, an async `JwtModule` (secret read from `ConfigService.getOrThrow` so the app refuses to start without `JWT_SECRET`), `AuthService`, and `JwtStrategy` into one cohesive unit exported to the rest of the app. `AppModule` imports it after `ConfigModule`.

The JWT strategy extracts the Bearer token, decodes it using the same env-sourced secret, and attaches `{ id, email, role }` to `req.user`. Returning `id` from `payload.sub` fixes a prior bug where downstream code using `req.user.id` would have gotten `undefined`.

`RolesGuard` reads the `roles` metadata key set by the `@Roles()` decorator and compares against `req.user.role`. The fail-open behavior — returning `true` when no `@Roles()` annotation is present — is safe today because every existing handler has an explicit annotation. It is a latent risk for all future write handlers that will be added when the other modules mature.

Self-registration is locked to `Role.VIEWER` at the service level; there is no admin-escalation endpoint yet, which is intentional per the implementation comments.

---

<details>
<summary>Issues (3)</summary>

1. **RolesGuard fail-open on unannotated handlers** — Any handler added without `@Roles()` will be accessible to any authenticated user, regardless of role. Add a lint rule or nest-access-control policy to make missing annotations fail at startup rather than fail at runtime. As a minimum, the `RolesGuard` comment should be expanded into a team-visible ADR.

2. **`firstName`/`lastName` default to empty string on register** — `RegisterDto` marks both fields optional with no `@IsOptional()` decorator, so class-validator may reject them unexpectedly depending on version. `AuthService` fills missing values with `''`, which the schema persists. Decide whether these fields should be required, optional-with-null, or optional-with-empty-string, and make the DTO and schema consistent.

3. **No duplicate-email guard in `register`** — Prisma's `@unique` on `User.email` will throw a `PrismaClientKnownRequestError` (code `P2002`) when registering a duplicate email. `AuthService.register` has no `try/catch` for this, so the unhandled exception propagates as a 500 instead of a 409 Conflict. Add a catch for `P2002` and throw `ConflictException`.

</details>

---

<details>
<summary>Details</summary>

## RolesGuard fail-open behavior

```ts
if (!requiredRoles || requiredRoles.length === 0) {
  return true;   // any authenticated user passes
}
```

Every existing controller handler carries `@Roles(Role.ADMIN, Role.DEVOPS, Role.VIEWER)`, so today no handler is reachable via this path. The gap is in the future: POST, PATCH, and DELETE handlers for the seven non-auth modules have not been written yet. When a developer adds `@Post()` and forgets `@Roles()`, the route will be open to any authenticated user including VIEWERs. The comment in the guard documents the convention but won't stop the mistake. A guard that defaults to `false` and requires an explicit `@Public()` opt-out would be safer, though it's a larger change.

## `firstName`/`lastName` handling

`RegisterDto` declares both as `@IsString() firstName?: string`. Because neither carries `@IsOptional()`, class-validator will not necessarily skip them when absent — behavior depends on whether `skipMissingProperties` is set, which the global `ValidationPipe({ whitelist: true })` does not set. `AuthService` compensates with `dto.firstName ?? ''`, but the schema has `firstName String` (non-nullable), so the empty string is persisted. Whether that is acceptable depends on whether the UI enforces these fields; it is not enforced at the API boundary.

## Duplicate email on registration

`AuthService.register` calls `prisma.user.create` with no error handling. When the email already exists, Prisma throws `PrismaClientKnownRequestError` with code `P2002`. NestJS's default exception filter catches unknown errors and returns a 500. The fix is a targeted catch:

```ts
import { ConflictException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

} catch (e) {
  if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
    throw new ConflictException('Email already registered');
  }
  throw e;
}
```

## Test coverage

No unit or integration tests exist for the auth module. This is noted for the record — the assignment context (school project, rapid feature delivery) makes the absence unsurprising, but the following paths are untested: duplicate email on register, wrong password on login, expired or malformed JWT token, and RolesGuard with a user whose role is not in the required set.

</details>

---

<details>
<summary>File map</summary>

| File | Change |
|------|--------|
| `src/auth/dto/register.dto.ts` | New DTO: email, password, optional firstName/lastName |
| `src/auth/dto/login.dto.ts` | New DTO: email, password |
| `src/auth/strategies/jwt.strategy.ts` | Passport JWT strategy; extracts Bearer token, returns `{ id, email, role }` |
| `src/auth/auth.service.ts` | register (bcrypt + create) and login (bcrypt compare + JWT sign) |
| `src/auth/auth.controller.ts` | `POST /auth/register` and `POST /auth/login`; no guards |
| `src/auth/auth.module.ts` | Module wiring: PassportModule, JwtModule (async), AuthService, JwtStrategy |
| `src/common/guards/jwt-auth.guard.ts` | `JwtAuthGuard extends AuthGuard('jwt')` |
| `src/common/guards/roles.guard.ts` | Checks `@Roles()` metadata against `req.user.role`; fail-open when no annotation |
| `src/common/decorators/roles.decorator.ts` | `@Roles(...Role[])` using `SetMetadata('roles', roles)` |
| `src/app.module.ts` | `AuthModule` imported |
| `src/main.ts` | `ValidationPipe({ whitelist: true })` added as global pipe |
| All 8 feature controllers | `@UseGuards(JwtAuthGuard, RolesGuard)` at class level; `@Roles(ADMIN, DEVOPS, VIEWER)` on each GET handler |
| `prisma/schema.prisma` | `Role` enum and `role` field pre-existing; no changes required |
| `.env.example` | `JWT_SECRET` placeholder documented |

Full diff: `git diff main -- backend/src/auth backend/src/common backend/src/app.module.ts backend/src/main.ts`

</details>
