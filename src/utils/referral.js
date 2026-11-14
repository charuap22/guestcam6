const REF_CODE_KEY = "guestpov_ref";
const REF_CODE_AT_KEY = "guestpov_ref_at";
const REF_TTL_DAYS = 30;

export function captureReferral() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");

  if (ref) {
    localStorage.setItem(REF_CODE_KEY, ref.toUpperCase());
    localStorage.setItem(REF_CODE_AT_KEY, Date.now().toString());
  }
}

export function setReferralCode(code) {
  if (!code) return;

  localStorage.setItem(REF_CODE_KEY, code.toUpperCase());
  localStorage.setItem(REF_CODE_AT_KEY, Date.now().toString());
}

export function getReferralCode() {
  const code = localStorage.getItem(REF_CODE_KEY);
  const at = Number(localStorage.getItem(REF_CODE_AT_KEY) || 0);

  if (!code || !at) return null;

  const ageDays = (Date.now() - at) / (1000 * 60 * 60 * 24);

  if (ageDays > REF_TTL_DAYS) {
    localStorage.removeItem(REF_CODE_KEY);
    localStorage.removeItem(REF_CODE_AT_KEY);
    return null;
  }

  return code;
}
