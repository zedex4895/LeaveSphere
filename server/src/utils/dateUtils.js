export function calculateBusinessDays(startDate, endDate, holidayDates = []) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // If start is after end, return 0
  if (start > end) return 0;

  // Normalize holiday dates to timestamps for quick lookup
  const holidaySet = new Set(holidayDates.map(d => new Date(d).setHours(0,0,0,0)));

  let businessDays = 0;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay(); // 0 = Sunday, 6 = Saturday
    const time = d.setHours(0,0,0,0);
    if (day !== 0 && day !== 6 && !holidaySet.has(time)) {
      businessDays++;
    }
  }
  return businessDays;
}
