export function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** "Founder" for the first in the line, otherwise "3rd Baba Aladura". */
export function successionLabel(order: number) {
  return order === 1 ? "Founder" : `${ordinal(order - 1)} Baba Aladura`;
}
