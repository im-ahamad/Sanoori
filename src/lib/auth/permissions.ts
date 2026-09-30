export const Permissions = {
  dashboard: {
    read: "dashboard:read",
  },
  products: {
    read: "products:read",
    write: "products:write",
    delete: "products:delete",
    images: "products:images",
  },
  orders: {
    read: "orders:read",
    write: "orders:write",
    delete: "orders:delete",
    status: "orders:status",
  },
  categories: {
    read: "categories:read",
    write: "categories:write",
    delete: "categories:delete",
  },
  subcategories: {
    read: "subcategories:read",
    write: "subcategories:write",
    delete: "subcategories:delete",
  },
  customers: {
    read: "customers:read",
  },
  settings: {
    read: "settings:read",
    write: "settings:write",
  },
  adminUsers: {
    read: "admin-users:read",
    write: "admin-users:write",
    delete: "admin-users:delete",
    manageRoles: "admin-users:manage-roles",
  },
} as const;

export type Permission =
  | "dashboard:read"
  | "products:read"
  | "products:write"
  | "products:delete"
  | "products:images"
  | "orders:read"
  | "orders:write"
  | "orders:delete"
  | "orders:status"
  | "categories:read"
  | "categories:write"
  | "categories:delete"
  | "subcategories:read"
  | "subcategories:write"
  | "subcategories:delete"
  | "customers:read"
  | "settings:read"
  | "settings:write"
  | "admin-users:read"
  | "admin-users:write"
  | "admin-users:delete"
  | "admin-users:manage-roles";

export const ALL_PERMISSIONS = [
  "dashboard:read",
  "products:read",
  "products:write",
  "products:delete",
  "products:images",
  "orders:read",
  "orders:write",
  "orders:delete",
  "orders:status",
  "categories:read",
  "categories:write",
  "categories:delete",
  "subcategories:read",
  "subcategories:write",
  "subcategories:delete",
  "customers:read",
  "settings:read",
  "settings:write",
  "admin-users:read",
  "admin-users:write",
  "admin-users:delete",
  "admin-users:manage-roles",
] as const satisfies readonly Permission[];

export const PermissionGroups = [
  {
    key: "dashboard",
    labelKey: "permissionDashboard",
    permissions: [
      { key: "read", permission: "dashboard:read", labelKey: "permissionDashboardRead" },
    ],
  },
  {
    key: "products",
    labelKey: "permissionProducts",
    permissions: [
      { key: "read", permission: "products:read", labelKey: "permissionProductsRead" },
      { key: "write", permission: "products:write", labelKey: "permissionProductsWrite" },
      { key: "delete", permission: "products:delete", labelKey: "permissionProductsDelete" },
      { key: "images", permission: "products:images", labelKey: "permissionProductsImages" },
    ],
  },
  {
    key: "orders",
    labelKey: "permissionOrders",
    permissions: [
      { key: "read", permission: "orders:read", labelKey: "permissionOrdersRead" },
      { key: "write", permission: "orders:write", labelKey: "permissionOrdersWrite" },
      { key: "delete", permission: "orders:delete", labelKey: "permissionOrdersDelete" },
      { key: "status", permission: "orders:status", labelKey: "permissionOrdersStatus" },
    ],
  },
  {
    key: "categories",
    labelKey: "permissionCategories",
    permissions: [
      { key: "read", permission: "categories:read", labelKey: "permissionCategoriesRead" },
      { key: "write", permission: "categories:write", labelKey: "permissionCategoriesWrite" },
      { key: "delete", permission: "categories:delete", labelKey: "permissionCategoriesDelete" },
    ],
  },
  {
    key: "subcategories",
    labelKey: "permissionSubcategories",
    permissions: [
      { key: "read", permission: "subcategories:read", labelKey: "permissionSubcategoriesRead" },
      { key: "write", permission: "subcategories:write", labelKey: "permissionSubcategoriesWrite" },
      { key: "delete", permission: "subcategories:delete", labelKey: "permissionSubcategoriesDelete" },
    ],
  },
  {
    key: "customers",
    labelKey: "permissionCustomers",
    permissions: [
      { key: "read", permission: "customers:read", labelKey: "permissionCustomersRead" },
    ],
  },
  {
    key: "settings",
    labelKey: "permissionSettings",
    permissions: [
      { key: "read", permission: "settings:read", labelKey: "permissionSettingsRead" },
      { key: "write", permission: "settings:write", labelKey: "permissionSettingsWrite" },
    ],
  },
  {
    key: "adminUsers",
    labelKey: "permissionAdminUsers",
    permissions: [
      { key: "read", permission: "admin-users:read", labelKey: "permissionAdminUsersRead" },
      { key: "write", permission: "admin-users:write", labelKey: "permissionAdminUsersWrite" },
      { key: "delete", permission: "admin-users:delete", labelKey: "permissionAdminUsersDelete" },
      { key: "manageRoles", permission: "admin-users:manage-roles", labelKey: "permissionAdminUsersManageRoles" },
    ],
  },
] as const;

export type PermissionGroupKey = (typeof PermissionGroups)[number]["key"];

export type GroupPermission = {
  key: string;
  permission: Permission;
  labelKey: string;
};

export type PermissionGroup = {
  key: PermissionGroupKey;
  labelKey: string;
  permissions: readonly GroupPermission[];
};

export function getDefaultPermissionsForRole(role: UserRole): readonly Permission[] {
  const perms = defaultRolePermissions[role];
  if (perms === WILDCARD_PERMISSION) {
    return ALL_PERMISSIONS;
  }
  return perms;
}

export const WILDCARD_PERMISSION = "*" as const;

export const defaultRolePermissions: Record<UserRole, readonly Permission[] | typeof WILDCARD_PERMISSION> = {
  SUPER_ADMIN: WILDCARD_PERMISSION,
  ADMIN: [
    Permissions.dashboard.read,
    Permissions.products.read,
    Permissions.products.write,
    Permissions.products.delete,
    Permissions.products.images,
    Permissions.orders.read,
    Permissions.orders.write,
    Permissions.orders.delete,
    Permissions.orders.status,
    Permissions.categories.read,
    Permissions.categories.write,
    Permissions.categories.delete,
    Permissions.subcategories.read,
    Permissions.subcategories.write,
    Permissions.subcategories.delete,
    Permissions.customers.read,
    Permissions.settings.read,
    Permissions.settings.write,
    Permissions.adminUsers.read,
    Permissions.adminUsers.write,
    Permissions.adminUsers.delete,
  ] as const,
  JUNIOR_ADMIN: [
    Permissions.dashboard.read,
    Permissions.products.read,
    Permissions.products.write,
    Permissions.orders.read,
    Permissions.orders.write,
    Permissions.orders.status,
    Permissions.categories.read,
    Permissions.categories.write,
    Permissions.customers.read,
  ] as const,
  STAFF: [
    Permissions.dashboard.read,
    Permissions.orders.read,
    Permissions.orders.status,
    Permissions.customers.read,
  ] as const,
};

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "JUNIOR_ADMIN" | "STAFF";

function getRolePermissions(role: UserRole): readonly Permission[] {
  const perms = defaultRolePermissions[role];
  if (perms === WILDCARD_PERMISSION) {
    return ALL_PERMISSIONS;
  }
  return perms;
}

function getUserExplicitPermissions(permissions: unknown): (Permission | typeof WILDCARD_PERMISSION)[] {
  if (!permissions || !Array.isArray(permissions)) {
    return [];
  }
  return permissions.filter((p): p is Permission | typeof WILDCARD_PERMISSION =>
    typeof p === "string" && (ALL_PERMISSIONS.includes(p as Permission) || p === WILDCARD_PERMISSION)
  );
}

export function hasPermission(
  userRole: UserRole,
  userPermissions: unknown,
  requiredPermission: Permission
): boolean {
  if (userRole === "SUPER_ADMIN") {
    return true;
  }

  const explicitPermissions = getUserExplicitPermissions(userPermissions);
  if (explicitPermissions.includes(WILDCARD_PERMISSION)) {
    return true;
  }

  if (explicitPermissions.includes(requiredPermission)) {
    return true;
  }

  const rolePermissions = getRolePermissions(userRole);
  return rolePermissions.includes(requiredPermission);
}

export function hasAnyPermission(
  userRole: UserRole,
  userPermissions: unknown,
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.some((p) => hasPermission(userRole, userPermissions, p));
}

export function hasAllPermissions(
  userRole: UserRole,
  userPermissions: unknown,
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.every((p) => hasPermission(userRole, userPermissions, p));
}