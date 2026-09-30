"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Loader2, ArrowRight, Eye, EyeOff, Check, ChevronDown, ChevronUp } from "lucide-react";
import type { AdminUserActionState } from "@/lib/actions/admin-users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminTranslations } from "@/lib/i18n/use-admin-translations";
import {
  PermissionGroups,
  type Permission,
  type PermissionGroupKey,
  getDefaultPermissionsForRole,
  type UserRole,
  type PermissionGroup,
} from "@/lib/auth/permissions";

const initialState: AdminUserActionState = undefined;

const CREATE_ROLE_OPTIONS = [
  { value: "ADMIN", label: "admin" },
  { value: "JUNIOR_ADMIN", label: "juniorAdmin" },
  { value: "STAFF", label: "staff" },
] as const;

const EDIT_ROLE_OPTIONS = [
  { value: "ADMIN", label: "admin" },
  { value: "JUNIOR_ADMIN", label: "juniorAdmin" },
  { value: "STAFF", label: "staff" },
] as const;

const MAIN_ADMIN_EMAIL = "sanoori.trading@gmail.com";

interface AdminUserFormInitialValues {
  id: string;
  name: string | null;
  email: string;
  isActive: boolean;
  role?: string;
  permissions?: Permission[];
}

interface AdminUserFormProps {
  mode: "create" | "edit";
  action: (
    prevState: AdminUserActionState,
    formData: FormData
  ) => Promise<AdminUserActionState>;
  initial?: AdminUserFormInitialValues | null;
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors || errors.length === 0) return null;
  return (
    <p role="alert" className="text-xs font-medium text-destructive">
      {errors[0]}
    </p>
  );
}

function Checkbox({
  checked,
  onChange,
  disabled,
  className,
  id: _id,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 border-input bg-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground ${className ?? ""}`}
      data-state={checked ? "checked" : "unchecked"}
    >
      {checked && <Check className="size-3" aria-hidden="true" />}
    </button>
  );
}

export function AdminUserForm({
  mode,
  action,
  initial,
}: AdminUserFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const t = useAdminTranslations();

  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [role, setRole] = useState<UserRole>(initial?.role as UserRole ?? "ADMIN");
  const [expandedGroups, setExpandedGroups] = useState<Record<PermissionGroupKey, boolean>>({
    dashboard: true,
    products: true,
    orders: true,
    categories: true,
    subcategories: true,
    customers: true,
    settings: true,
    adminUsers: true,
  });

  const stateErrors = state?.status === "error" ? state.fieldErrors : undefined;
  const formError = state?.status === "error" ? state.message : undefined;

  const handleNameChange = (value: string) => setName(value);
  const handleEmailChange = (value: string) => setEmail(value);
  const handlePasswordChange = (value: string) => setPassword(value);
  const handleConfirmPasswordChange = (value: string) => setConfirmPassword(value);
  const handleRoleChange = (value: string | null) => {
    if (value !== null) {
      setRole(value as UserRole);
    }
  };

  const isCreateMode = mode === "create";
  const isMainAdmin = initial?.email === MAIN_ADMIN_EMAIL;
  const isSuperAdmin = role === "SUPER_ADMIN";
  const roleOptions = isCreateMode ? CREATE_ROLE_OPTIONS : EDIT_ROLE_OPTIONS;
  const isRoleDisabled = pending || isMainAdmin;

  const getInitialPermissions = (): Permission[] => {
    if (!isCreateMode && initial?.permissions) {
      return [...initial.permissions];
    }
    if (isCreateMode && initial?.role) {
      const role = initial.role as UserRole;
      if (role === "SUPER_ADMIN") return [];
      return [...getDefaultPermissionsForRole(role)];
    }
    if (isCreateMode) {
      return [...getDefaultPermissionsForRole("ADMIN")];
    }
    return [];
  };

  const [permissions, setPermissions] = useState<Permission[]>(() => getInitialPermissions());
  const isInitializedRef = useRef(false);

  const toggleGroup = (groupKey: PermissionGroupKey) => {
    setExpandedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const toggleGroupAll = (group: PermissionGroup, checked: boolean) => {
    const groupPermissions = group.permissions.map((p) => p.permission);
    setPermissions((prev) =>
      checked
        ? [...new Set([...prev, ...groupPermissions])]
        : prev.filter((p) => !groupPermissions.includes(p))
    );
  };

  const isGroupAllChecked = (group: PermissionGroup) => {
    return group.permissions.every((p) => permissions.includes(p.permission));
  };

  const applyRoleDefaults = (selectedRole: UserRole) => {
    if (selectedRole === "SUPER_ADMIN") return;
    const defaults = getDefaultPermissionsForRole(selectedRole);
    setPermissions([...defaults]);
  };

  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      return;
    }
    if (!isMainAdmin && !isCreateMode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      applyRoleDefaults(role);
    }
  }, [role, isMainAdmin, isCreateMode]);

  const handlePermissionChange = (permission: Permission, checked: boolean) => {
    if (checked) {
      setPermissions((prev) => [...prev, permission]);
    } else {
      setPermissions((prev) => prev.filter((p) => p !== permission));
    }
  };

  const getPermissionKeys = () => permissions.join(",");

  return (
    <form action={formAction} noValidate aria-busy={pending}>
      {mode === "edit" ? (
        <>
          <input type="hidden" name="adminId" value={initial?.id ?? ""} />
          <input type="hidden" name="role" value={role} />
          <input type="hidden" name="permissions" value={getPermissionKeys()} />
        </>
      ) : (
        <>
          <input type="hidden" name="role" value={role} />
          <input type="hidden" name="permissions" value={getPermissionKeys()} />
        </>
      )}

      <div className="space-y-8">
        {formError ? (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {formError}
          </div>
        ) : null}

        {/* ===== Basic information ===== */}
        <section aria-labelledby="section-basic" className="space-y-4">
          <div>
            <h2
              id="section-basic"
              className="font-heading text-base font-bold tracking-tight text-foreground"
            >
              {isCreateMode ? t.common.createAdmin : t.common.editAdmin}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isCreateMode
                ? "Create a new administrator account for the admin panel."
                : "Update the administrator account details."}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">{t.common.adminName}</Label>
            <Input
              id="name"
              name="name"
              value={name}
              onChange={(event) => handleNameChange(event.target.value)}
              placeholder={isCreateMode ? "e.g. John Doe" : undefined}
              maxLength={200}
              required={isCreateMode}
              disabled={pending}
              aria-invalid={Boolean(stateErrors?.name)}
              autoFocus={isCreateMode}
            />
            <FieldError errors={stateErrors?.name} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t.common.adminEmail}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => handleEmailChange(event.target.value)}
              placeholder={isCreateMode ? "admin@example.com" : undefined}
              maxLength={200}
              required={isCreateMode}
              disabled={pending || mode === "edit"}
              aria-invalid={Boolean(stateErrors?.email)}
              className={mode === "edit" ? "bg-muted/50" : ""}
            />
            {mode === "edit" && (
              <p className="text-xs text-muted-foreground">
                {t.common.emailCannotChange}
              </p>
            )}
            <FieldError errors={stateErrors?.email} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">{t.common.adminRole}</Label>
            <Select value={role} onValueChange={handleRoleChange} disabled={isRoleDisabled}>
              <SelectTrigger>
                <SelectValue placeholder={t.common.selectAdminRole} />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t.common[option.label as keyof typeof t.common]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isMainAdmin && (
              <p className="text-xs text-muted-foreground">
                {t.common.cannotChangeMainAdminRole}
              </p>
            )}
            <FieldError errors={stateErrors?.role} />
          </div>

          {isCreateMode && (
            <>
              <div className="space-y-2">
                <Label htmlFor="password">{t.common.adminPassword}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => handlePasswordChange(event.target.value)}
                    placeholder="••••••••"
                    maxLength={200}
                    required
                    disabled={pending}
                    autoComplete="new-password"
                    aria-invalid={Boolean(stateErrors?.password)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={pending}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t.common.passwordMinLength}
                </p>
                <FieldError errors={stateErrors?.password} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t.common.confirmPassword}</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => handleConfirmPasswordChange(event.target.value)}
                  placeholder="••••••••"
                  maxLength={200}
                  required
                  disabled={pending}
                  autoComplete="new-password"
                  aria-invalid={Boolean(stateErrors?.confirmPassword)}
                />
                <FieldError errors={stateErrors?.confirmPassword} />
              </div>
            </>
          )}

          <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium text-foreground">
                {t.common.adminStatus}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {isCreateMode
                  ? "Inactive admins cannot sign in to the admin panel."
                  : "Inactive admins cannot sign in to the admin panel."}
              </p>
              <FieldError errors={stateErrors?.isActive} />
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={pending}
            />
          </div>
        </section>

        {/* ===== Permissions ===== */}
        <section aria-labelledby="section-permissions" className="space-y-4">
          <div>
            <h2
              id="section-permissions"
              className="font-heading text-base font-bold tracking-tight text-foreground"
            >
              {t.common.adminPermission}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t.common.adminPermissionDesc}
            </p>
          </div>

          {isSuperAdmin ? (
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Check className="size-4 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {t.common.superAdmin} — {t.common.adminPermission}: {"Full Access"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Super Administrators have unrestricted access to all permissions.
                    Individual permissions cannot be modified for this role.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const defaults = getDefaultPermissionsForRole(role);
                      setPermissions([...defaults]);
                    }}
                    disabled={pending}
                  >
                    {t.common.useRoleDefaults}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPermissions([])}
                    disabled={pending}
                  >
                    {t.common.deselectAll}
                  </Button>
                </div>
              </div>

              <div className="space-y-2 rounded-lg border border-border bg-background p-4">
                {PermissionGroups.map((group: PermissionGroup) => {
                  const isExpanded = expandedGroups[group.key];
                  const allChecked = isGroupAllChecked(group);

                  return (
                    <div key={group.key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => toggleGroup(group.key)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {isExpanded ? (
                              <ChevronUp className="size-4" aria-hidden="true" />
                            ) : (
                              <ChevronDown className="size-4" aria-hidden="true" />
                            )}
                          </Button>
                          <Label className="font-medium text-foreground cursor-pointer select-none">
                            {t.common[group.labelKey as keyof typeof t.common]}
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`group-${group.key}`}
                            checked={allChecked}
                            onChange={(checked) => toggleGroupAll(group, checked)}
                            disabled={pending}
                            aria-label={allChecked
                              ? `Deselect all ${t.common[group.labelKey as keyof typeof t.common]}`
                              : `Select all ${t.common[group.labelKey as keyof typeof t.common]}`}
                          />
                          <span className="text-xs text-muted-foreground hidden sm:inline">
                            {allChecked ? t.common.deselectAll : t.common.selectAll}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`transition-all duration-200 ease-in-out overflow-hidden ${
                          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                        }`}
                        style={{ overflow: "hidden" }}
                      >
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {group.permissions.map((perm) => (
                            <label
                              key={perm.permission}
                              className="flex items-center gap-2 rounded-md border border-transparent bg-muted/50 px-3 py-2 text-sm transition-colors hover:border-border hover:bg-background cursor-pointer"
                            >
                              <Checkbox
                                id={`perm-${perm.permission}`}
                                checked={permissions.includes(perm.permission)}
                                onChange={(checked) => handlePermissionChange(perm.permission, checked)}
                                disabled={pending}
                              />
                              <span className="truncate">{t.common[perm.labelKey as keyof typeof t.common]}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium text-foreground">
                {t.common.adminStatus}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {isCreateMode
                  ? "Inactive admins cannot sign in to the admin panel."
                  : "Inactive admins cannot sign in to the admin panel."}
              </p>
              <FieldError errors={stateErrors?.isActive} />
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={pending}
            />
          </div>
        </section>

        {/* ===== Actions ===== */}
        <div className="flex flex-col-reverse gap-2 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            size="lg"
            disabled={pending}
            render={<Link href="/admin/admin-users" />}
          >
            {t.common.cancel}
          </Button>
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                {isCreateMode ? t.common.creatingProduct : t.common.savingChanges}
              </>
            ) : isCreateMode ? (
              <>
                {t.common.createAdmin}
                <ArrowRight className="size-4" aria-hidden="true" />
              </>
            ) : (
              t.common.saveChanges
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}