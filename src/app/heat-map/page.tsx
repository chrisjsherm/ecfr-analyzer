import { getAgencies } from "../../server/actions/agencies";
import { getChangeCountByAgency } from "../../server/actions/count-by-agency";
import { AgencyChangeCounts } from "../../types/agency-change-counts.type";
import ChangeCountHeatMap from "../_components/ChangeCountHeatMap";

export default async function HeatMap() {
  const { agencies } = await getAgencies();

  // Calculate date range for last 30 days inclusive
  const endDate = new Date().toISOString().split("T")[0];
  const startDate = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  // Get agency slugs and fetch heatmap data
  let heatmapData: AgencyChangeCounts[] = [];
  let heatmapError = null;

  try {
    heatmapData = await getChangeCountByAgency(
      agencies.slice(0, 10),
      startDate,
      endDate
    );
  } catch (error) {
    console.error("Error fetching heatmap data:", error);
    heatmapError = "Unable to load heatmap data. Please try again later.";
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 w-full max-w-4xl">
        {heatmapError ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{heatmapError}</p>
          </div>
        ) : heatmapData.length > 0 ? (
          <ChangeCountHeatMap data={heatmapData} />
        ) : (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-gray-700">No heatmap data available.</p>
          </div>
        )}
      </main>
    </div>
  );
}
