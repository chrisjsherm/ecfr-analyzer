import { unstable_cache } from "next/cache";
import { fetchChangeCountByAgency } from "../../utils/ecfr-api.utils";

/**
 * Cached wrapper for getting change counts by day for one or more agencies
 */
export const getChangeCountByAgency = unstable_cache(
  fetchChangeCountByAgency,
  ["change-counts-by-agencies"],
  {
    revalidate: 43200, // 12 hours in seconds
  }
);
