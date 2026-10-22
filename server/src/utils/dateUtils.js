export function calculateBusinessDays(startDate, endDate, holidayDates = []) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) return 0;

  const holidaySet = new Set(
    holidayDates.map(d => {
      const dateObj = new Date(d);
      return dateObj.toISOString().slice(0, 10);
    })
  );

  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    const dateStr = current.toISOString().slice(0, 10);

    // Skip Saturday (6) and Sunday (0)
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = holidaySet.has(dateStr);

    if (!isWeekend && !isHoliday) {
      count++;
    }

    current.setDate(current.getDate() + 1);
  }

  // If entire range was weekend/holiday or same day edge case, default to minimum 1 if same day or count
  return Math.max(count, count === 0 && start.getTime() === end.getTime() ? 1 : count);
}
