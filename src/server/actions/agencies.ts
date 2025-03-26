import { unstable_cache } from "next/cache";

/**
 * Memoized list of agencies from the eCFR API
 * @returns The list of agencies
 */
export const getAgencies = unstable_cache(
  async () => {
    return getAgenciesData();
  },
  ["agencies"],
  {
    revalidate: 43200, // 12 hours in seconds
  }
);

/**
 * Get the list of agencies from the eCFR API
 * @returns The list of agencies
 */
const getAgenciesData = async () => {
  const response = await fetch("https://ecfr.gov/api/admin/v1/agencies.json");

  if (!response.ok) {
    throw new Error(`Failed to fetch agencies: ${response.statusText}`);
  }

  return response.json();
};
