export function isPrimitive(val) {
  return val == null || /^[sbn]/.test(typeof val);
}
