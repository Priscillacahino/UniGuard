export const ALLOWED_PROFILE_ROLES = Object.freeze([
  'estudante',
  'docente',
  'tecnico',
  'terceirizado',
  'visitante',
]);

const allowedProfileRoles = new Set(ALLOWED_PROFILE_ROLES);

export function normalizeProfileRole(value) {
  if (value == null || value === '') return 'estudante';
  if (typeof value !== 'string') return null;

  const normalized = value.trim().slice(0, 60);
  if (!normalized) return 'estudante';
  return allowedProfileRoles.has(normalized) ? normalized : null;
}
