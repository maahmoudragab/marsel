export function isEgyptianMobile(value: string): boolean {
  return /^01[0125]\d{8}$/.test(value.trim());
}
