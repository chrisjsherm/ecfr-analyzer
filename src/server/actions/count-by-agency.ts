import { DateTime } from "luxon";
import { unstable_cache } from "next/cache";
import { Agency } from "../../types/agency.type";
import { HeatmapData } from "../../types/heat-map-data.type";
import { getDatesInRange, isValidDateFormat } from "../../utils/date.utils";

/**
 * Get the change counts by day for one or more agencies, cached for 12 hours
 * @param agencySlugs - Array of agency slugs to fetch data for
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns The daily counts for the given agencies and date range
 */
export const getChangeCountByAgency = unstable_cache(
  async (
    agencies: Agency[],
    startDate: string,
    endDate: string
  ): Promise<HeatmapData[]> => {
    if (
      agencies.length >
      parseInt(process.env.NEXT_PUBLIC_ECFR_API_MAX_REQUESTS_PER_SECOND || "10")
    ) {
      throw new Error(
        `Too many agencies. The max number of agencies is ${process.env.NEXT_PUBLIC_ECFR_API_MAX_REQUESTS_PER_SECOND}.`
      );
    }

    if (!isValidDateFormat(startDate) || !isValidDateFormat(endDate)) {
      throw new Error("Invalid date format. Please use YYYY-MM-DD");
    }

    const timeZone = process.env.ECFR_API_TIMEZONE || "America/New_York";
    const currentDate = DateTime.fromISO(startDate, { zone: timeZone });
    const endDateObj = DateTime.fromISO(endDate, { zone: timeZone });
    const dates = getDatesInRange(currentDate, endDateObj, "yyyy-MM-dd");

    try {
      const promises = agencies.map(async (agency) => {
        const queryParams = [
          `agency_slugs[]=${encodeURIComponent(agency.slug)}`,
          startDate && `last_modified_on_or_after=${startDate}`,
          endDate && `last_modified_on_or_before=${endDate}`,
        ]
          .filter(Boolean)
          .join("&");

        const ecfrUrl = `${process.env.ECFR_API_URL}/counts/daily?${queryParams}`;
        const response = await fetch(ecfrUrl, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch from eCFR: ${response.statusText}`);
        }

        const data: {
          dates: Record<string, number>;
        } = await response.json();

        const counts = dates.map((date) => ({
          date,
          count: data.dates[date] || 0,
        }));

        return {
          agency,
          counts,
        };
      });

      return Promise.all(promises);
    } catch (error) {
      console.error("Error fetching from eCFR:", error);
      throw new Error("Failed to fetch from eCFR");
    }
  },
  ["change-counts-by-agencies"],
  {
    revalidate: 43200, // 12 hours in seconds
  }
);
