import { DateTime } from "luxon";
import { getAgencies } from "../server/actions/agencies";
import { AgencyChangeCounts } from "../types/agency-change-counts.type";
import { Agency } from "../types/agency.type";
import { getDatesInRange, isValidDateFormat } from "./date.utils";

/**
 * Core function to fetch change counts by day for one or more agencies
 */
export async function fetchChangeCountByAgency(
  agencySlugs: string[],
  startDate: string,
  endDate: string,
  query?: string
): Promise<AgencyChangeCounts[]> {
  if (
    agencySlugs.length >
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
    const agencies = await getAgencies();
    if (!agencies) {
      throw new Error("Failed to fetch agencies");
    }
    const filteredAgencies: Agency[] = agencies.filter((agency: Agency) =>
      agencySlugs.includes(agency.slug)
    );
    if (filteredAgencies.length === 0) {
      throw new Error("No agencies found");
    }

    const promises = filteredAgencies.map(async (agency) => {
      const queryParams = [
        `agency_slugs[]=${encodeURIComponent(agency.slug)}`,
        startDate && `last_modified_on_or_after=${startDate}`,
        endDate && `last_modified_on_or_before=${endDate}`,
        query ? `query=${encodeURIComponent(query)}` : undefined,
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

      let totalCount = 0;
      const counts = dates.map((date) => {
        const count = data.dates[date] || 0;
        totalCount += count;
        return {
          date,
          count,
        };
      });

      return {
        agency,
        counts,
        totalCount,
      };
    });

    return Promise.all(promises);
  } catch (error) {
    console.error("Error fetching from eCFR:", error);
    throw new Error("Failed to fetch from eCFR");
  }
}
