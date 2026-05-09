/**
 * Utility formatters for EduSign
 */

/**
 * Truncate a string with ellipsis
 */
export function truncate(str, maxLen = 40) {
  if (!str) return "";
  return str.length > maxLen ? str.substring(0, maxLen) + "..." : str;
}

/**
 * Format a hex hash into groups of 8 characters
 */
export function formatHash(hash) {
  if (!hash) return "";
  return hash.match(/.{1,8}/g)?.join(" ") || hash;
}

/**
 * Format a PEM key for display (mask middle portion)
 */
export function maskKey(pem) {
  if (!pem) return "";
  const lines = pem.trim().split("\n");
  if (lines.length <= 3) return pem;
  return [
    lines[0],
    lines[1].substring(0, 20) + "...",
    "  [MASKED FOR SECURITY]  ",
    "..." + lines[lines.length - 2].substring(lines[lines.length - 2].length - 20),
    lines[lines.length - 1],
  ].join("\n");
}

/**
 * Format a Base64 signature for display
 */
export function formatSignature(sig) {
  if (!sig) return "";
  if (sig.length > 60) {
    return sig.substring(0, 30) + "..." + sig.substring(sig.length - 30);
  }
  return sig;
}

/**
 * Format a date string
 */
export function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Get status badge color classes
 */
export function getStatusColor(status) {
  switch (status) {
    case "verified":
      return "bg-success-50 text-success";
    case "tampered":
      return "bg-error-50 text-error";
    case "signed":
      return "bg-primary-50 text-primary";
    case "sent":
      return "bg-warning-50 text-warning";
    case "pending":
    default:
      return "bg-surface-alt text-text-muted";
  }
}
