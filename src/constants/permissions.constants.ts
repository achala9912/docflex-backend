// export const PERMISSIONS = {
//   // User permissions
//   USER_CREATE: "user:create",
//   USER_READ: "user:read",
//   USER_UPDATE: "user:update",
//   USER_DELETE: "user:delete",

//   // Role permissions
//   ROLE_CREATE: "role:create",
//   ROLE_READ: "role:read",
//   ROLE_UPDATE: "role:update",
//   ROLE_DELETE: "role:delete",

//   // Patient permissions
//   PATIENT_CREATE: "patient:create",
//   PATIENT_READ: "patient:read",
//   PATIENT_UPDATE: "patient:update",
//   PATIENT_DELETE: "patient:delete",

//   // Appointment permissions
//   APPOINTMENT_CREATE: "appointment:create",
//   APPOINTMENT_READ: "appointment:read",
//   APPOINTMENT_UPDATE: "appointment:update",
//   APPOINTMENT_DELETE: "appointment:delete",
// } as const;

// export const DEFAULT_ROLES = [
//   {
//     roleName: "Admin",
//     permissions: Object.values(PERMISSIONS),
//   },
//   {
//     roleName: "Doctor",
//     permissions: [
//       PERMISSIONS.PATIENT_READ,
//       PERMISSIONS.PATIENT_CREATE,
//       PERMISSIONS.PATIENT_UPDATE,
//       PERMISSIONS.APPOINTMENT_CREATE,
//       PERMISSIONS.APPOINTMENT_READ,
//       PERMISSIONS.APPOINTMENT_UPDATE,
//     ],
//   },
//   {
//     roleName: "Nurse",
//     permissions: [
//       PERMISSIONS.PATIENT_READ,
//       PERMISSIONS.APPOINTMENT_READ,
//       PERMISSIONS.APPOINTMENT_CREATE,
//     ],
//   },
//   {
//     roleName: "Assistant",
//     permissions: [PERMISSIONS.PATIENT_READ, PERMISSIONS.APPOINTMENT_READ],
//   },
// ];

// export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// export default PERMISSIONS;

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

  // Patient permissions
  PATIENT_CREATE: "patient:create",
  PATIENT_READ: "patient:read",
  PATIENT_UPDATE: "patient:update",
  PATIENT_DELETE: "patient:delete",

  // Appointment permissions
  APPOINTMENT_CREATE: "appointment:create",
  APPOINTMENT_READ: "appointment:read",
  APPOINTMENT_UPDATE: "appointment:update",
  APPOINTMENT_DELETE: "appointment:delete",

  // Medical Center permissions
  CENTER_CREATE: "center:create",
  CENTER_READ: "center:read",
  CENTER_UPDATE: "center:update",
  CENTER_DELETE: "center:delete",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const DEFAULT_ROLES = [
  {
    roleName: "SystemAdmin",
    permissions: Object.values(PERMISSIONS),
  },
];

export default PERMISSIONS;
