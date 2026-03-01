/**
 * Format a Time (bigint nanoseconds) or regular timestamp to a human-readable date string.
 */
export function formatDate(time: bigint | number | string): string {
  try {
    let ms: number;
    if (typeof time === "bigint") {
      // ICP Time is in nanoseconds
      ms = Number(time / BigInt(1_000_000));
    } else {
      ms = Number(time);
    }
    const date = new Date(ms);
    if (Number.isNaN(date.getTime())) return "Unknown date";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Unknown date";
  }
}

export function formatDateTime(time: bigint | number | string): string {
  try {
    let ms: number;
    if (typeof time === "bigint") {
      ms = Number(time / BigInt(1_000_000));
    } else {
      ms = Number(time);
    }
    const date = new Date(ms);
    if (Number.isNaN(date.getTime())) return "Unknown date";
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Unknown date";
  }
}
