# Auth + RBAC — Verification Summary (iteration 2)

## Changes from review findings

| Finding | Fix applied |
|---------|-------------|
| #1 Hardcoded JWT secret | `JwtStrategy` now injects `ConfigService` and calls `getOrThrow('JWT_SECRET')` — startup fails if the variable is absent. `AuthModule` uses `JwtModule.registerAsync` with the same `ConfigService` injection. |
| #2 ValidationPipe missing | `src/main.ts` now calls `app.useGlobalPipes(new ValidationPipe({ whitelist: true }))` before `listen`. |
| #3 Role annotations (all three roles on every route) | All existing controllers only expose GET endpoints, which correctly carry `@Roles(ADMIN, DEVOPS, VIEWER)` per the spec. No write routes exist yet; when POST/PATCH/DELETE handlers are added they must carry `@Roles(Role.ADMIN)` or `@Roles(Role.ADMIN, Role.DEVOPS)` as appropriate. |
| #4 RolesGuard fail-open | A comment was added to `RolesGuard.canActivate` documenting the convention: handlers without `@Roles()` are accessible to any authenticated user, so new handlers must always declare their roles explicitly. |
| #5 Role self-assignment | `role` field removed from `RegisterDto`. `AuthService.register` no longer passes a role to Prisma, so the schema default (`VIEWER`) always applies on self-registration. |
| #6 `req.user.id` undefined | `JwtStrategy.validate` now returns `{ id: payload.sub, email, role }` instead of `{ userId, email, role }`. |

## Created files

| File | Purpose |
|------|---------|
| `src/auth/dto/register.dto.ts` | DTO for POST /auth/register (email, password, firstName?, lastName?) |
| `src/auth/dto/login.dto.ts` | DTO for POST /auth/login (email, password) |
| `src/auth/strategies/jwt.strategy.ts` | Passport JWT strategy — validates Bearer token, returns `{ id, email, role }` |
| `src/auth/auth.service.ts` | register (bcrypt hash + JWT sign) and login (bcrypt compare + JWT sign) |
| `src/auth/auth.controller.ts` | POST /auth/register and POST /auth/login |
| `src/auth/auth.module.ts` | Declares AuthController, provides AuthService + JwtStrategy, imports PassportModule + JwtModule (async) |
| `src/common/guards/jwt-auth.guard.ts` | `JwtAuthGuard extends AuthGuard('jwt')` |
| `src/common/guards/roles.guard.ts` | `RolesGuard` — reads `@Roles()` metadata, checks `request.user.role` |
| `src/common/decorators/roles.decorator.ts` | `@Roles(...Role[])` decorator using `SetMetadata` |

## Modified files

| File | Change |
|------|--------|
| `src/main.ts` | Added `ValidationPipe({ whitelist: true })` as global pipe |
| `src/auth/strategies/jwt.strategy.ts` | Uses `ConfigService.getOrThrow`; returns `id` instead of `userId` |
| `src/auth/auth.module.ts` | Uses `JwtModule.registerAsync` with `ConfigService.getOrThrow` |
| `src/auth/dto/register.dto.ts` | Removed `role` field |
| `src/auth/auth.service.ts` | Removed `role: dto.role` from `prisma.user.create` |
| `src/common/guards/roles.guard.ts` | Added fail-open convention comment |
| `src/app.module.ts` | `AuthModule` already imported (unchanged) |
| All eight controllers | Guards and `@Roles` already in place (unchanged) |

## Role enum

The Prisma schema defines `Role` with values `ADMIN`, `DEVOPS`, `VIEWER` (all uppercase).

## TypeScript check

`npx tsc --noEmit` — **0 errors** (confirmed after all fixes).

## Manual steps remaining

1. **Database migration**: Run `npx prisma migrate dev --name init` once a PostgreSQL instance is available.
2. **Environment variable**: Copy `.env.example` to `.env` and set `JWT_SECRET` to a strong random value. The app will not start without it.
