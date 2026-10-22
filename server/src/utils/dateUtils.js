export function calculateBusinessDays(startDate, endDate, holidayDates = []) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // If start is after end, return 0
  if (start > end) return 0;

  // Calculate inclusive difference in days
  const msInDay = 24 * 60 * 60 * 1000;
  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / msInDay) + 1; // include both start and end

  return diffDays;
}
