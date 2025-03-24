"use client";

import {
  ChangedEventArgs,
  DateRangePickerComponent,
} from "@syncfusion/ej2-react-calendars";
import {
  ChartComponent,
  DataLabel,
  DateTime,
  Inject,
  Legend,
  LineSeries,
  SeriesCollectionDirective,
  SeriesDirective,
  Tooltip,
} from "@syncfusion/ej2-react-charts";
import { useState } from "react";
import { Agency } from "../types/agency";
import { AgencyDropdown } from "./AgencyDropdown";

interface DailyCount {
  date: string;
  count: number;
}

export default function ChangeCountChart({ agencies }: { agencies: Agency[] }) {
  const [dailyCounts, setDailyCounts] = useState<DailyCount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    new Date(new Date().setMonth(new Date().getMonth() - 1)), // Default to last month
    new Date(),
  ]);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);

  async function fetchDailyCounts(
    agency: Agency,
    startDate: Date,
    endDate: Date
  ) {
    setIsLoading(true);
    setError(null);
    try {
      const formattedStartDate = startDate.toISOString().split("T")[0];
      const formattedEndDate = endDate.toISOString().split("T")[0];
      const response = await fetch(
        `/api/ecfr/daily-counts?agency_slugs[]=${agency.slug}&last_modified_on_or_after=${formattedStartDate}&last_modified_on_or_before=${formattedEndDate}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch daily counts");
      }
      const json = await response.json();
      setDailyCounts(json.counts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setDailyCounts([]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleAgencySelect(agency: Agency) {
    setSelectedAgency(agency);
    if (agency && dateRange) {
      fetchDailyCounts(agency, dateRange[0], dateRange[1]);
    }
  }

  function handleDateRangeChange(args: ChangedEventArgs) {
    if (args.value && Array.isArray(args.value) && args.value.length === 2) {
      setDateRange([args.value[0], args.value[1]]);
      if (selectedAgency) {
        fetchDailyCounts(selectedAgency, args.value[0], args.value[1]);
      }
    }
  }

  return (
    <div>
      <div className="mb-4">
        <label
          htmlFor="agency-dropdown"
          className="block text-sm font-medium mb-2"
        >
          Agency
        </label>
        <AgencyDropdown agencies={agencies} onSelect={handleAgencySelect} />
      </div>

      <div className="mb-4">
        <label htmlFor="daterange" className="block text-sm font-medium mb-2">
          Date Range (3-365 days)
        </label>
        <DateRangePickerComponent
          id="daterange"
          value={dateRange}
          max={new Date()}
          minDays={3}
          maxDays={365}
          strictMode={true}
          onChange={handleDateRangeChange}
          format="MM/dd/yyyy"
          placeholder="Select date range"
          cssClass="e-custom-datepicker"
        />
      </div>

      <div className="mt-4">
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : dailyCounts.length > 0 ? (
          <ChartComponent
            id="charts"
            primaryXAxis={{
              valueType: "DateTime",
              labelFormat: "M/d/yyyy",
              title: "Date",
            }}
            primaryYAxis={{
              title: "Number of Changes",
              labelFormat: "{value}",
            }}
            tooltip={{
              enable: true,
              format: "${point.x}: ${point.y}",
            }}
            legendSettings={{ visible: true }}
          >
            <Inject
              services={[LineSeries, DateTime, Legend, Tooltip, DataLabel]}
            />
            <SeriesCollectionDirective>
              <SeriesDirective
                dataSource={dailyCounts}
                xName="date"
                yName="count"
                name={selectedAgency?.short_name || "Changes"}
                type="Line"
                marker={{
                  visible: true,
                  dataLabel: {
                    visible: false,
                  },
                }}
              />
            </SeriesCollectionDirective>
          </ChartComponent>
        ) : (
          <p className="text-gray-500">
            {selectedAgency && dateRange
              ? "No changes found for this agency and date range."
              : "Select an agency and date range to see the change history."}
          </p>
        )}
      </div>
    </div>
  );
}
