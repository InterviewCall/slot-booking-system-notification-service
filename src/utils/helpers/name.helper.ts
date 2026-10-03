/** "  aRIJIT ganguly" -> "Arijit" (used for the {{firstName}} in nurture messages) */
export function getFirstName(fullName: string): string {
    const first = fullName.trim().split(/\s+/)[0] ?? '';
    return first ? first.charAt(0).toUpperCase() + first.slice(1).toLowerCase() : '';
}
