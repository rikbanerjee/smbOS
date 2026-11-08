// Small fallbacks so the prototype runs on older phones (iOS Safari before 15.4) and on pages
// served over plain http (for example a phone opening http://192.168.x.x on home Wi-Fi), where
// crypto.randomUUID and navigator.clipboard are not available.

// Deep copy. Every value copied here is plain JSON data that is also saved to localStorage.
export const clone = value => typeof structuredClone === 'function'
  ? structuredClone(value)
  : value === undefined ? undefined : JSON.parse(JSON.stringify(value));

function randomBytes(count) {
  const bytes = new Uint8Array(count);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
  else for (let i = 0; i < count; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  return bytes;
}
export const randomHex = chars => Array.from(randomBytes(Math.ceil(chars / 2)), b => b.toString(16).padStart(2, '0')).join('').slice(0, chars);

// RFC 4122-shaped id; only the first few characters are used for demo ids.
export const uuid = () => typeof globalThis.crypto?.randomUUID === 'function'
  ? globalThis.crypto.randomUUID()
  : `${randomHex(8)}-${randomHex(4)}-4${randomHex(3)}-${(8 + Math.floor(Math.random() * 4)).toString(16)}${randomHex(3)}-${randomHex(12)}`;

export const last = list => list[list.length - 1];

// Copy text to the clipboard. Returns true when copied; on false the caller asks the person to copy by hand.
export async function copyText(text) {
  try {
    if (globalThis.isSecureContext && navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; }
  } catch { /* fall through to the older method */ }
  try {
    const area = document.createElement('textarea');
    area.value = text; area.setAttribute('readonly', ''); area.style.position = 'fixed'; area.style.opacity = '0'; area.style.top = '0';
    document.body.appendChild(area); area.select(); area.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy'); area.remove(); return ok;
  } catch { return false; }
}
