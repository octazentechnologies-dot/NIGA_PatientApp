/**
 * Title Case for short English UI labels (titles, menus, options, buttons).
 * Leaves Devanagari / non-Latin scripts unchanged.
 * Preserves ALL-CAPS acronyms (OTP, SMS, QR, COD, API, ID, …).
 */
export function toUiLabel(label: string): string {
  if (!label || /[\u0900-\u097F]/.test(label)) {
    return label;
  }

  return label.replace(/\S+/g, (word) => {
    if (word.length === 0) {
      return word;
    }
    // Preserve pure acronyms / short ALL CAPS tokens
    if (/^[A-Z0-9]{2,}$/.test(word)) {
      return word;
    }
    // Preserve tokens that are already Title Case with internal caps (e.g. HelloHomeo)
    if (/^[A-Z][a-z]+(?:[A-Z][a-z]+)+$/.test(word)) {
      return word;
    }
    // Hyphenated labels: Low-Data, Follow-Up
    if (word.includes('-')) {
      return word
        .split('-')
        .map((part) => {
          if (!part) return part;
          if (/^[A-Z0-9]{2,}$/.test(part)) return part;
          return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        })
        .join('-');
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

/** @deprecated Use `toUiLabel`. */
export const toTitleCaseLabel = toUiLabel;
