"use client";

import { registerLicense } from "@syncfusion/ej2-base";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AgencyChangeCounts } from "../../types/agency-change-counts.type";
import { Agency } from "../../types/agency.type";
import ChangeCountChart from "./ChangeCountChart";
import ChangeCountGrid from "./ChangeCountGrid";
import ChangeCountHeatMap from "./ChangeCountHeatMap";
import ParameterSelection from "./ParameterSelection";

registerLicense(process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE ?? "");
type DashboardState = {
  isLoading: boolean;
  error: string | null;
  data: AgencyChangeCounts[] | null;
};

export default function Dashboard({ agencies }: { agencies: Agency[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<DashboardState>({
    isLoading: false,
    error: null,
    data: null,
  });

  useEffect(() => {
    const agencySlugs = searchParams.getAll("agencySlugs[]");
    const dateStart = searchParams.get("dateStart");
    const dateEnd = searchParams.get("dateEnd");
    const searchByTerm = searchParams.get("searchByTerm") || "";

    // Validate required parameters
    if (!agencySlugs.length || !dateStart || !dateEnd) {
      return;
    }

    // Set loading state
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    fetch("/api/ecfr/daily-counts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agencySlugs,
        startDate: dateStart,
        endDate: dateEnd,
        query: searchByTerm,
      }),
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
  }, [searchParams]);

  const handleParameterSubmit = (
    selectedAgencies: Agency[],
    dateRange: [Date | undefined, Date | undefined],
    searchTerm: string
  ) => {
    const params = new URLSearchParams();

    // Add agency slugs
    selectedAgencies.forEach((agency) => {
      params.append("agencySlugs[]", agency.slug);
    });

    // Add dates if they exist
    if (dateRange[0]) {
      params.set("dateStart", dateRange[0].toISOString().split("T")[0]);
    }
    if (dateRange[1]) {
      params.set("dateEnd", dateRange[1].toISOString().split("T")[0]);
    }

    // Add search term if it exists
    if (searchTerm) {
      params.set("searchByTerm", searchTerm);
    }

    // Update the URL with the new parameters
    router.push(`/?${params.toString()}`);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-10">
        <section>
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
        </section>

        <section>
          <ChangeCountGrid changeCounts={state.data} />
        </section>
      </div>
      <ChangeCountHeatMap data={state.data} />
      <ChangeCountChart data={state.data} />
    </>
  );
}
