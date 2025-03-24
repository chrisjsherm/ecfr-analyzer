import { unstable_cache } from "next/cache";

export const getAgencies = unstable_cache(
  async () => {
    return getAgenciesData();
  },
  ["agencies"],
  {
    revalidate: 43200, // 12 hours in seconds
  }
);

const getAgenciesData = async () => {
  const response = await fetch("https://ecfr.gov/api/admin/v1/agencies.json");

  if (!response.ok) {
    throw new Error(`Failed to fetch agencies: ${response.statusText}`);
  }

  return response.json();
};
