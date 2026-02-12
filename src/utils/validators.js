export function isGoogleDriveUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes('google.com') || parsed.hostname.includes('googleusercontent.com');
  } catch {
    return false;
  }
}

export function required(value) {
  return value != null && String(value).trim().length > 0;
}

export function getSpreadsheetId(url) {
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/\/spreadsheets\/d\/([\w-]+)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}
