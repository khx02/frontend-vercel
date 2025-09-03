// Utility functions for consistent date formatting across the application

// Create formatters
export const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

// Helper function to safely convert unknown values to Date objects
export const getDate = (d: unknown): Date | null => {
  if (typeof d === "string" || typeof d === "number") return new Date(d);
  if (d instanceof Date) return d;
  return null;
};

// Main utility function to format date ranges consistently
export const formatDateRange = (
  startAt: unknown,
  endAt: unknown,
  options?: {
    fallback?: string;
    shortFormat?: boolean;
  }
): string => {
  const { fallback = "—", shortFormat = false } = options || {};

  try {
    const startDate = getDate(startAt);
    const endDate = getDate(endAt);

    if (!startDate || !endDate) {
      return fallback;
    }

    if (shortFormat) {
      // Use short format for both dates
      return `${shortDateFormatter.format(
        startDate
      )} - ${shortDateFormatter.format(endDate)}`;
    } else {
      // Use mixed format: short for start, full for end
      return `${shortDateFormatter.format(startDate)} - ${dateFormatter.format(
        endDate
      )}`;
    }
  } catch (error) {
    return fallback;
  }
};

// Alternative function that returns formatted parts separately
export const formatDateParts = (
  startAt: unknown,
  endAt: unknown
): {
  startDate: string | null;
  endDate: string | null;
  isValid: boolean;
} => {
  try {
    const startDate = getDate(startAt);
    const endDate = getDate(endAt);

    if (!startDate || !endDate) {
      return {
        startDate: null,
        endDate: null,
        isValid: false,
      };
    }

    return {
      startDate: shortDateFormatter.format(startDate),
      endDate: dateFormatter.format(endDate),
      isValid: true,
    };
  } catch (error) {
    return {
      startDate: null,
      endDate: null,
      isValid: false,
    };
  }
};
