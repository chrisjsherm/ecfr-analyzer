import { AgencyChangeCounts } from "../types/agency-change-counts.type";

export function groupCountsByMonth(
  dataArray: AgencyChangeCounts[]
): AgencyChangeCounts[] {
  return dataArray.map((data) => {
    if (data.counts.length <= 30) {
      return data; // No grouping needed
    }

    const groupedCounts: { [month: string]: number } = {};

    data.counts.forEach(({ date, count }) => {
      const month = date.slice(0, 7); // Extract YYYY-MM from the date
      groupedCounts[month] = (groupedCounts[month] || 0) + count;
    });

    const groupedCountsArray = Object.entries(groupedCounts).map(
      ([month, count]) => ({
        date: month,
        count,
      })
    );

    return {
      ...data,
      counts: groupedCountsArray,
    };
  });
}
