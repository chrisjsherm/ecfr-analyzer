"use client";

import { registerLicense } from "@syncfusion/ej2-base";
import { useState } from "react";
import { AgencyChangeCounts } from "../../types/agency-change-counts.type";
import { Agency } from "../../types/agency.type";
import ChangeCountGrid from "./ChangeCountGrid";
import ChangeCountHeatMap from "./ChangeCountHeatMap";
import ChangeCountTimeline from "./ChangeCountTimeline";
import ParameterSelection from "./ParameterSelection";

registerLicense(process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE ?? "");
type DashboardState = {
  isLoading: boolean;
  error: string | null;
  data: AgencyChangeCounts[] | null;
};

export default function Dashboard({ agencies }: { agencies: Agency[] }) {
  const [state, setState] = useState<DashboardState>({
    isLoading: false,
    error: null,
    data: null,
  });
  const [isParametersCollapsed, setIsParametersCollapsed] = useState(false);
  let abortController = new AbortController();

  function toggleParametersCollapse() {
    setIsParametersCollapsed((prev) => !prev);
  }

  function handleParameterSubmit(
    selectedAgencies: Agency[],
    dateRange: [Date | undefined, Date | undefined],
    searchTerm: string
  ) {
    const agencySlugs = selectedAgencies.map((agency) => agency.slug);
    const searchByTerm = searchTerm;

    if (!agencySlugs.length || !dateRange[0] || !dateRange[1]) {
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    if (abortController) {
      abortController.abort("New submission, aborting previous request");
    }
    abortController = new AbortController();

    fetch("/api/ecfr/daily-counts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agencySlugs,
        startDate: dateRange[0].toISOString().split("T")[0],
        endDate: dateRange[1].toISOString().split("T")[0],
        query: searchByTerm,
      }),
      signal: abortController.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch data");
        }
        return response.json();
      })
      .then((data) => {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: null,
          data,
        }));
      })
      .catch((error) => {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error.message,
          data: null,
        }));
      });
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="flex gap-6">
        {/* Sidebar for Parameter Selection */}
        <aside
          className={`transition-all duration-300 bg-white p-4 rounded-md shadow-md ${
            isParametersCollapsed ? "w-15" : "w-1/4"
          }`}
        >
          <div className="flex items-center gap-2 mb-5">
            <div>
              <span className="e-icons e-filter"></span>
            </div>

            {!isParametersCollapsed && (
              <h2 className="text-lg font-semibold grow-1">Parameters</h2>
            )}

            <button
              onClick={toggleParametersCollapse}
              className="text-sm  cursor-pointer"
              aria-label="Toggle Parameters Section"
            >
              {isParametersCollapsed ? (
                <span className="e-icons e-chevron-right-fill"></span>
              ) : (
                <span className="e-icons e-chevron-left-fill"></span>
              )}
            </button>
          </div>

          {!isParametersCollapsed && (
            <>
              <ParameterSelection
                agencies={agencies}
                onSubmit={handleParameterSubmit}
              />

              {/* Loading State */}
              {state.isLoading && (
                <div className="mt-4 p-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading data...</p>
                </div>
              )}

              {/* Error State */}
              {state.error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600">Error: {state.error}</p>
                </div>
              )}
            </>
          )}
        </aside>

        {/* Main Content */}
        <main
          className={`transition-all duration-300 flex-1 ${
            isParametersCollapsed ? "w-full" : "w-3/4"
          }`}
        >
          {/* Grid */}
          <section className="bg-white p-4 rounded-md shadow-md mb-6">
            <h2 className="text-lg font-semibold mb-4">Changes By Agency</h2>
            <ChangeCountGrid changeCounts={state.data} />
          </section>

          {/* Heatmap */}
          <section className="bg-white p-4 rounded-md shadow-md mb-6">
            <h2 className="text-lg font-semibold mb-4">Change Heatmap</h2>
            <ChangeCountHeatMap data={state.data} />
          </section>

          {/* Chart */}
          <section className="bg-white p-4 rounded-md shadow-md">
            <h2 className="text-lg font-semibold mb-4">Change Timeline</h2>
            <ChangeCountTimeline data={state.data} />
          </section>
        </main>
      </div>
    </div>
  );
}
