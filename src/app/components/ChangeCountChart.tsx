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
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { useRef, useState } from "react";
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

  const fetchCtrl = useRef<AbortController | null>(null);
  const selectedAgency = useRef<Agency | null>(null);
  const dateRange = useRef<Date[]>([
    new Date(new Date().setDate(new Date().getDate() - 30)),
    new Date(),
  ]);

  async function fetchDailyCounts(
    agency: Agency,
    startDate: Date,
    endDate: Date
  ) {
    setIsLoading(true);
    setError(null);
    if (fetchCtrl.current) {
      fetchCtrl.current.abort();
    }
    try {
      fetchCtrl.current = new AbortController();
      const formattedStartDate = startDate.toISOString().split("T")[0];
      const formattedEndDate = endDate.toISOString().split("T")[0];
      const response = await fetch(
        `/api/ecfr/daily-counts?agency_slugs[]=${agency.slug}&last_modified_on_or_after=${formattedStartDate}&last_modified_on_or_before=${formattedEndDate}`,
        { signal: fetchCtrl.current.signal }
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
    selectedAgency.current = agency;
    if (agency && dateRange.current) {
      fetchDailyCounts(agency, dateRange.current[0], dateRange.current[1]);
    }
  }

  function handleDateRangeChange(args: ChangedEventArgs) {
    if (args.value && Array.isArray(args.value) && args.value.length === 2) {
      dateRange.current = [args.value[0], args.value[1]];
      if (selectedAgency.current) {
        fetchDailyCounts(selectedAgency.current, args.value[0], args.value[1]);
      }
    }
  }

  return (
    <div>
      <div className="mb-4">
        <label
          htmlFor="agency-dropdown"
          className="flex text-sm font-medium mb-2"
        >
          Agency
          <TooltipComponent content="Required field" target="#agency-required">
            <span
              id="agency-required"
              className="text-red-500"
              role="img"
              aria-label="Required field"
            >
              *
            </span>
          </TooltipComponent>
        </label>
        <AgencyDropdown agencies={agencies} onSelect={handleAgencySelect} />
      </div>

      <div className="mb-4">
        <label htmlFor="daterange" className="flex text-sm font-medium mb-2">
          Date Range (3-365 days)
          <TooltipComponent
            content="Required field"
            target="#daterange-required"
          >
            <span
              id="daterange-required"
              className="text-red-500"
              role="img"
              aria-label="Required field"
            >
              *
            </span>
          </TooltipComponent>
        </label>
        <DateRangePickerComponent
          id="daterange"
          value={dateRange.current}
          max={new Date()}
          min={new Date(process.env.NEXT_PUBLIC_MIN_DATE ?? "2017-01-01")}
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
            title="Regulation Changes"
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
                name={selectedAgency.current?.short_name || "Changes"}
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
            {selectedAgency.current && dateRange.current
              ? "No changes found for this agency and date range."
              : "Select an agency and date range to see the change history."}
          </p>
        )}
      </div>
    </div>
  );
}
