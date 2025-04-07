// dateUtils.js - Utility function for date formatting
export function formatDate(dateString) {
  return new Date(dateString)
    .toLocaleString("en-US", {
      timeZone: "Asia/Manila",
      year: "2-digit",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hourCycle: "h12",
    })
    .replace("AM", "am")
    .replace("PM", "pm");
}
