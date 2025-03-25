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
import { TextBoxComponent } from "@syncfusion/ej2-react-inputs";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { useRef, useState } from "react";
import { debounce } from "../../utils/debounce.utils";
import { Agency } from "../types/agency";
import { AgencyDropdown } from "./AgencyDropdown";

interface DailyCount {
  date: string;
  count: number;
}

interface AgencyCounts {
  agency: string;
  counts: DailyCount[];
}

/**
 * Display a chart of the number of changes for one or more agencies over a date range
 * @param agencies - The list of agencies to display in the dropdown
 */
export default function ChangeCountChart({ agencies }: { agencies: Agency[] }) {
  const [seriesData, setSeriesData] = useState<AgencyCounts[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCtrl = useRef<AbortController | null>(null);
  const selectedAgencies = useRef<Agency[]>([]);
  const dateRange = useRef<Date[]>([
    new Date(new Date().setDate(new Date().getDate() - 30)),
    new Date(),
  ]);
  const searchTerm = useRef<string>("");

  async function fetchDailyCounts(
    agencies: Agency[],
    startDate: Date,
    endDate: Date,
    query?: string
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
        `/api/ecfr/daily-counts?${agencies
          .map((agency) => `agency_slugs[]=${agency.slug}`)
          .join(
            "&"
          )}&last_modified_on_or_after=${formattedStartDate}&last_modified_on_or_before=${formattedEndDate}${
          query ? `&query=${query}` : ""
        }`,
        { signal: fetchCtrl.current.signal }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch daily counts");
      }
      const json = await response.json();
      setSeriesData(json.series);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSeriesData([]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleAgencySelect(agencies: Agency[]) {
    selectedAgencies.current = agencies;
    if (selectedAgencies.current.length > 0 && dateRange.current) {
      fetchDailyCounts(
        selectedAgencies.current,
        dateRange.current[0],
        dateRange.current[1],
        searchTerm.current
      );
    }
  }

  function handleDateRangeChange(args: ChangedEventArgs) {
    if (args.value && Array.isArray(args.value) && args.value.length === 2) {
      dateRange.current = [args.value[0], args.value[1]];
      if (selectedAgencies.current.length > 0) {
        fetchDailyCounts(
          selectedAgencies.current,
          args.value[0],
          args.value[1],
          searchTerm.current
        );
      }
    }
  }

  function handleSearchChange(args: { value: string }) {
    searchTerm.current = args.value;
    if (selectedAgencies.current.length > 0 && dateRange.current) {
      fetchDailyCounts(
        selectedAgencies.current,
        dateRange.current[0],
        dateRange.current[1],
        searchTerm.current
      );
    }
  }

  return (
    <div>
      <div className="mb-4">
        <label
          htmlFor="agency-dropdown"
          className="flex text-sm font-medium mb-2"
        >
          Agencies
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
        <AgencyDropdown
          agencies={agencies}
          onSelect={handleAgencySelect}
          selectMultiple={true}
        />
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
          strictMode={true}
          onChange={handleDateRangeChange}
          format="MM/dd/yyyy"
          placeholder="Select date range"
          cssClass="e-custom-datepicker"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="searchTerm" className="flex text-sm font-medium mb-2">
          Search Term
        </label>
        <TextBoxComponent
          id="searchTerm"
          name="searchTerm"
          placeholder="Search term (optional)"
          onChange={debounce(handleSearchChange, 500)}
        />
      </div>

      <div className="mt-4">
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : seriesData.length > 0 ? (
          <ChartComponent
            id="charts"
            title="Regulation Changes"
            primaryXAxis={{
              valueType: "DateTime",
              labelFormat: "M/d/yyyy",
              title: "Date",
            }}
            primaryYAxis={{
              title: "Change Count",
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
              {seriesData.map((series) => (
                <SeriesDirective
                  key={series.agency}
                  dataSource={series.counts}
                  xName="date"
                  yName="count"
                  name={
                    agencies.find((a) => a.slug === series.agency)
                      ?.short_name || series.agency
                  }
                  type="Line"
                  marker={{
                    visible: true,
                    dataLabel: {
                      visible: false,
                    },
                  }}
                />
              ))}
            </SeriesCollectionDirective>
          </ChartComponent>
        ) : (
          <p className="text-gray-500">
            {selectedAgencies.current.length > 0 && dateRange.current
              ? "No changes found for this date range."
              : "Select an agency and date range to see the change history."}
          </p>
        )}
      </div>
    </div>
  );
}
