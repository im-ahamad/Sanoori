# Sanoori Trading — Admin Guide

This document is a personal reference for managing the Sanoori Trading admin account. It reflects the **current implementation** as of the time of writing.

---

## 1. ADMIN LOGIN

### Exact Admin Login URL
```
/secure-admin
```

### Where the Login Page Is Located
- Page: `src/app/secure-admin/page.tsx`
- Component: `src/components/admin/login-form.tsx`

### Credentials
- **Email**: Must be the email of an existing admin account in the database.
- The placeholder `admin@sanoori.test` shown in the form is **only a placeholder** — it is NOT a default credential.
- **There are no default credentials stored in the codebase.**

### How to List Existing Admin Accounts
```bash
npm run db:create-admin -- --list
```

### How Admin Accounts Are Created/Managed
Admin accounts are created and managed exclusively through the CLI script:
```
npm run db:create-admin
```
(See `prisma/scripts/create-admin.ts` for the implementation.)

### Successful Login Redirect
After successful authentication, you are redirected to:
```
/admin
```
This is configured in `src/lib/actions/auth.ts` (line 25): `redirectTo: "/admin"`

### Session & Authentication
- Authentication uses **JWT-based sessions** (configured in `src/lib/auth.config.ts`).
- The session includes the admin role.
- Possible roles:
  - `SUPER_ADMIN`
  - `ADMIN`
  - `JUNIOR_ADMIN`
  - `STAFF`

### Relevant Implementation Files
- `src/lib/actions/auth.ts` — server action backing the login form
- `src/lib/auth.config.ts` — Auth.js configuration (sign-in page, JWT strategy, callbacks)
- `src/lib/auth.ts` — Credentials provider with bcrypt verification

---

## 2. ADMIN PASSWORD CHANGE (WEB UI)

### Current Web Workflow
1. Login at `/secure-admin`
2. Go to **Settings**
3. Open the **Admin Profile** tab (third tab)
4. Find the **Change Password** card at the bottom

### Required Fields
- **Current password** — required
- **New password** — minimum 8 characters
- **Confirm new password** — must match

### Permission Required
Changing the password through the web UI requires:
- An authenticated session
- The `settings:write` permission (checked in `src/lib/actions/settings.ts`)

### Implementation Reference
- UI: `src/app/admin/(admin)/settings/content.tsx` (lines 375–438)
- Server action: `src/lib/actions/settings.ts` (`updatePasswordAction`)

---

## 3. FORGOTTEN PASSWORD / PASSWORD RESET

### Critical: No Web-Based Recovery
- There is **NO "Forgot Password" mechanism** in the web UI.
- There is **NO email-based password recovery**.
- The **only supported recovery method** is the CLI script.

### Supported Recovery Method
```bash
npm run db:create-admin
```
Reference: `prisma/scripts/create-admin.ts`

The CLI script can:
- Create a new admin account
- Reset the password of an existing admin account
- Activate the admin account where applicable (using `--activate`)

---

### Method 1: Recommended Secure Method (Environment Variable)
Use the environment variable so the password does **not** appear directly in the shell command/history:

```bash
SANOORI_ADMIN_PASSWORD='your-new-password' npm run db:create-admin -- --email admin@yourdomain.com --activate
```

### Method 2: Direct Flag Method
Also supported, but **warns that the password can be exposed in shell history**:

```bash
npm run db:create-admin -- --email admin@yourdomain.com --password 'your-new-password' --activate
```

> **⚠️ Warning:** The direct `--password` flag writes the password to your shell history. Prefer the environment-variable method for production use.

---

## 4. CREATE NEW ADMIN

To create a new admin account, use the same CLI script:

```bash
SANOORI_ADMIN_PASSWORD='your-secure-password' npm run db:create-admin -- --email admin@yourdomain.com --name "Admin Name"
```

**The CLI script (`prisma/scripts/create-admin.ts`) is the single source of truth for admin account management.**

---

## 5. LIST ADMIN ACCOUNTS

To check which admin accounts currently exist:

```bash
npm run db:create-admin -- --list
```

---

## 6. IMPORTANT LIMITATIONS

| Limitation                       | Impact                                          | Workaround                                |
| -------------------------------- | ----------------------------------------------- | ----------------------------------------- |
| No "Forgot Password" UI          | Cannot reset through web UI if password is lost | Use CLI `db:create-admin`                 |
| No email-based recovery          | No reset link is sent by email                  | CLI script only                           |
| Email cannot be changed in UI    | Email field is disabled in Settings             | Use supported CLI/admin-management method |
| Password minimum is 8 characters | Short passwords are rejected                    | Use at least 8 characters                 |

---

## 7. QUICK REFERENCE

### Login
```
/secure-admin
```

### List Admins
```bash
npm run db:create-admin -- --list
```

### Reset Existing Admin Password — Recommended (Secure)
```bash
SANOORI_ADMIN_PASSWORD='new-password' npm run db:create-admin -- --email admin@domain.com --activate
```

### Create New Admin
```bash
SANOORI_ADMIN_PASSWORD='new-password' npm run db:create-admin -- --email admin@domain.com --name "Admin Name"
```

### Web Password Change
```
/secure-admin → Settings → Admin Profile → Change Password
```

---

## Security Note
This documentation uses **placeholders only** (e.g., `your-new-password`, `admin@yourdomain.com`, `your-secure-password`). **No real passwords, API keys, secrets, database credentials, or JWT secrets are stored in this file.**