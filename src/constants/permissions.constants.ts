export const PERMISSIONS = {
  // User permissions
  USER_CREATE: "user:create",
  USER_READ: "user:read",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",

  // Role permissions
  ROLE_CREATE: "role:create",
  ROLE_READ: "role:read",
  ROLE_UPDATE: "role:update",
  ROLE_DELETE: "role:delete",

  // Medical Center permissions
  CENTER_CREATE: "center:create",
  CENTER_READ: "center:read",
  CENTER_UPDATE: "center:update",
  CENTER_DELETE: "center:delete",

  PATIENT_MANAGEMENT: "patient:management",
  SESSION_MANAGEMENT: "session:management",
  GENERICNAME_MANAGEMENT: "generic:management",
  // Appointment permissions
  APPOINTMENT_MANAGEMENT: "appointment:management",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const DEFAULT_ROLES = [
  {
    roleName: "SystemAdmin",
    permissions: Object.values(PERMISSIONS),
  },
];

export default PERMISSIONS;
