# Implementation Plan — Auth Module (JWT + Roles)

## Findings from codebase exploration

### 1. Role field in User model
**Already present.** `prisma/schema.prisma` defines:
```prisma
enum Role {
  ADMIN
  DEVOPS
  VIEWER
}
model User {
  ...
  role Role @default(VIEWER)
  ...
}
```
No schema migration needed.

### 2. Auth-related packages in package.json
**Missing.** The following are **not** in `dependencies`:
- `@nestjs/passport` — absent
- `@nestjs/jwt` — absent
- `passport` — absent
- `passport-jwt` — absent

`bcrypt` **is** present (`"bcrypt": "^6.0.0"`), and `@types/bcrypt` is in devDependencies.  
`@nestjs/config` **is** present (`"@nestjs/config": "^4.0.4"`).

Install needed: `@nestjs/passport`, `@nestjs/jwt`, `passport`, `passport-jwt`, `@types/passport-jwt` (dev).

### 3. UsersService existing methods
`findAll()` and `findOne(id)` exist. **Neither `findByEmail` nor `findById` exists.** Both must be added:
- `findByEmail(email: string)` — must return the password hash (no `omit`), used by AuthService for credential validation.
- `findById(id: number)` — same as `findOne` but named consistently for the JWT strategy payload lookup.

### 4. ConfigModule / @nestjs/config
**Already configured globally.** `app.module.ts` imports `ConfigModule.forRoot({ isGlobal: true })`. `ConfigService` is injectable everywhere without extra imports.

### 5. Existing controller pattern
Controllers use `@Controller('resource')` class decorator, inject a single service, and call service methods directly. No guards are applied anywhere yet — no `UseGuards`, no `@Roles()`. Route prefix is `api` (set globally in `main.ts`).

### 6. Risks and notes
- **UsersModule exports UsersService** — confirmed in `users.module.ts` (`exports: [UsersService]`). AuthModule can safely import UsersModule.
- **PrismaModule is `@Global()`** — PrismaService is available everywhere; UsersService already uses it correctly.
- **`findByEmail` must include the password field** — the existing `findAll`/`findOne` use `omit: { password: true }`. The new `findByEmail` must not omit it, because AuthService needs the hash to run bcrypt.compare.
- **JWT secret** must come from `ConfigService` (env var `JWT_SECRET`). Never hard-coded.
- **Route protection strategy**: apply `JwtAuthGuard` at controller class level on routes that need authentication, and `RolesGuard` + `@Roles()` on individual methods (or class) where role restriction is required. The existing controllers have no guards — they will all be left unguarded until each module's maintainer adds them. The plan below only protects the `UsersController` as a demonstration; the pattern can be applied elsewhere identically.

---

## Implementation Plan

- [ ] 1. Install missing npm packages.  
      Run `npm install @nestjs/passport @nestjs/jwt passport passport-jwt` and `npm install -D @types/passport-jwt` inside `backend/`.  
      Files: `package.json`, `package-lock.json` (auto-updated).  
      Verify: `npm run build` completes without "Cannot find module" errors for those packages.

- [ ] 2. Add `findByEmail` and `findById` to UsersService.  
      `findByEmail(email: string)` calls `prisma.user.findUnique({ where: { email } })` — **no** `omit`, so the password hash is returned.  
      `findById(id: number)` calls `prisma.user.findUnique({ where: { id }, omit: { password: true } })`.  
      Files: `src/users/users.service.ts`  
      Verify: `npm run build` — TypeScript compiles cleanly.

- [ ] 3. Create the `RegisterDto` and `LoginDto` data-transfer objects.  
      `RegisterDto`: `email: string`, `password: string`, `firstName: string`, `lastName: string`, optional `role: Role`.  
      `LoginDto`: `email: string`, `password: string`.  
      Files: `src/auth/dto/register.dto.ts`, `src/auth/dto/login.dto.ts`  
      Verify: `npm run build` — no TypeScript errors.

- [ ] 4. Create `JwtPayload` interface and `AuthenticatedUser` type.  
      `JwtPayload`: `{ sub: number; email: string; role: Role }` — this is what gets signed into the JWT and what the strategy decodes.  
      `AuthenticatedUser`: same shape, represents `req.user` after guard runs.  
      Files: `src/auth/interfaces/jwt-payload.interface.ts`  
      Verify: `npm run build` — no TypeScript errors.

- [ ] 5. Create the `JwtStrategy` (Passport strategy).  
      Extends `PassportStrategy(Strategy)` from `passport-jwt`.  
      Constructor injects `ConfigService` and sets `jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()`, `ignoreExpiration: false`, `secretOrKey: configService.get<string>('JWT_SECRET')`.  
      `validate(payload: JwtPayload)` returns `{ id: payload.sub, email: payload.email, role: payload.role }`.  
      Files: `src/auth/strategies/jwt.strategy.ts`  
      Verify: `npm run build` — no TypeScript errors.

- [ ] 6. Create the `JwtAuthGuard`.  
      Extends `AuthGuard('jwt')` from `@nestjs/passport`. No extra logic needed; the default behavior rejects unauthenticated requests with 401.  
      Files: `src/auth/guards/jwt-auth.guard.ts`  
      Verify: `npm run build` — no TypeScript errors.

- [ ] 7. Create the `@Roles()` decorator and `RolesGuard`.  
      `@Roles(...roles: Role[])` uses `SetMetadata('roles', roles)`.  
      `RolesGuard` implements `CanActivate`, injects `Reflector`, reads the `roles` metadata key, and compares against `request.user.role`. Returns `true` if no roles metadata is set (open to any authenticated user) or if the user's role is in the required list.  
      Files: `src/auth/decorators/roles.decorator.ts`, `src/auth/guards/roles.guard.ts`  
      Verify: `npm run build` — no TypeScript errors.

- [ ] 8. Create `AuthService`.  
      `register(dto: RegisterDto)`: hashes the password with `bcrypt.hash(dto.password, 10)`, calls `prisma.user.create(...)`, returns the created user without the password.  
      `login(dto: LoginDto)`: calls `usersService.findByEmail(dto.email)`, throws `UnauthorizedException` if not found or if `bcrypt.compare` fails, then calls `jwtService.sign({ sub: user.id, email: user.email, role: user.role })` and returns `{ access_token: token }`.  
      Inject: `UsersService`, `JwtService`, `PrismaService` (for the create in register).  
      Files: `src/auth/auth.service.ts`  
      Verify: `npm run build` — no TypeScript errors.

- [ ] 9. Create `AuthController`.  
      `POST /auth/register` → calls `authService.register(dto)`, returns the new user (201).  
      `POST /auth/login` → calls `authService.login(dto)`, returns `{ access_token }` (200).  
      No guards on these two endpoints — they are the public entry points.  
      Files: `src/auth/auth.controller.ts`  
      Verify: `npm run build` — no TypeScript errors.

- [ ] 10. Create `AuthModule` and register everything.  
      Imports: `UsersModule` (for UsersService), `PassportModule`, `JwtModule.registerAsync` using `ConfigService` to read `JWT_SECRET` and set `expiresIn: '24h'`.  
      Providers: `AuthService`, `JwtStrategy`.  
      Controllers: `AuthController`.  
      Exports: `JwtStrategy`, `JwtAuthGuard` (so other modules can use them without re-importing).  
      Files: `src/auth/auth.module.ts`  
      Verify: `npm run build` — no TypeScript errors.

- [ ] 11. Register `AuthModule` in `AppModule`.  
      Add `import { AuthModule } from './auth/auth.module'` and include `AuthModule` in the `imports` array of `AppModule`. Order: after `ConfigModule`, before feature modules.  
      Files: `src/app.module.ts`  
      Verify: `npm run build` — full project compiles cleanly.

- [ ] 12. Protect `UsersController` routes with `JwtAuthGuard` and `RolesGuard` as the reference pattern.  
      Add `@UseGuards(JwtAuthGuard, RolesGuard)` at class level (requires a valid JWT for every route).  
      `GET /users` (findAll) — add `@Roles(Role.ADMIN, Role.DEVOPS)`: only Admin and DevOps can list all users.  
      `GET /users/:id` (findOne) — no `@Roles()` annotation: any authenticated user can fetch a single user.  
      Import `JwtAuthGuard`, `RolesGuard`, `Roles`, `Role` at the top of the controller.  
      Files: `src/users/users.controller.ts`  
      Verify: `npm run build` — project compiles. Manual smoke-test: `POST /api/auth/register` creates a user; `POST /api/auth/login` returns a token; `GET /api/users` with no token returns 401; with a VIEWER token returns 403; with an ADMIN token returns 200.

- [ ] 13. Add `JWT_SECRET` to the environment file.  
      Create `.env` at `backend/.env` (if it does not already exist) and add `JWT_SECRET=change_me_in_production`.  
      Files: `backend/.env`  
      Verify: application starts with `npm run start:dev` without "JWT_SECRET is undefined" errors.

---

## File manifest (all files created or modified, in dependency order)

| # | Action | Path |
|---|--------|------|
| 1 | modified | `package.json` |
| 2 | modified | `src/users/users.service.ts` |
| 3 | created | `src/auth/dto/register.dto.ts` |
| 4 | created | `src/auth/dto/login.dto.ts` |
| 5 | created | `src/auth/interfaces/jwt-payload.interface.ts` |
| 6 | created | `src/auth/strategies/jwt.strategy.ts` |
| 7 | created | `src/auth/guards/jwt-auth.guard.ts` |
| 8 | created | `src/auth/decorators/roles.decorator.ts` |
| 9 | created | `src/auth/guards/roles.guard.ts` |
| 10 | created | `src/auth/auth.service.ts` |
| 11 | created | `src/auth/auth.controller.ts` |
| 12 | created | `src/auth/auth.module.ts` |
| 13 | modified | `src/app.module.ts` |
| 14 | modified | `src/users/users.controller.ts` |
| 15 | created | `.env` |
