export function cleanRequirementText(str: string): string {
  if (!str) return '';
  const nl = String.fromCharCode(10);
  const cr = String.fromCharCode(13);
  return str.split(nl).join('').split(cr).join('').replace(/\s+/g, ' ').trim();
}
