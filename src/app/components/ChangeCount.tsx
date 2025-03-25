"use client";

import {
  CalendarComponent,
  ChangedEventArgs,
} from "@syncfusion/ej2-react-calendars";
import { TextBoxComponent } from "@syncfusion/ej2-react-inputs";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { useRef, useState } from "react";
import { debounce } from "../../utils/debounce.utils";
import { Agency } from "../types/agency";
import { AgencyDropdown } from "./AgencyDropdown";

const maxChangeCount = 10000;

/**
 * Display the number of changes for a given agency and date
 * @param agencies - The list of agencies to display in the dropdown
 */
export default function ChangeCount({ agencies }: { agencies: Agency[] }) {
  const [changeCount, setChangeCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCtrl = useRef<AbortController | null>(null);
  const selectedDate = useRef<Date>(new Date());
  const selectedAgency = useRef<Agency | null>(null);
  const searchTerm = useRef<string>("");

  async function fetchChangeCount(agency: Agency, date: Date, query?: string) {
    setIsLoading(true);
    setError(null);
    if (fetchCtrl.current) {
      fetchCtrl.current.abort();
    }
    try {
      const formattedDate = date.toISOString().split("T")[0];
      fetchCtrl.current = new AbortController();
      const response = await fetch(
        `/api/ecfr/count?agency_slugs[]=${
          agency.slug
        }&last_modified_on_or_after=${formattedDate}${
          query ? `&query=${query}` : ""
        }`,
        { signal: fetchCtrl.current.signal }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch change count");
      }
      const json = await response.json();
      setChangeCount(json.meta.total_count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setChangeCount(null);
    } finally {
      setIsLoading(false);
    }
  }

  function handleAgencySelect(agencies: Agency[]) {
    selectedAgency.current = agencies[0];
    if (selectedAgency.current && selectedDate.current) {
      fetchChangeCount(
        selectedAgency.current,
        selectedDate.current,
        searchTerm.current
      );
    }
  }

  function handleDateChange(args: ChangedEventArgs) {
    const updatedDate = args.value ?? new Date();
    selectedDate.current = updatedDate;
    if (selectedAgency.current) {
      fetchChangeCount(selectedAgency.current, updatedDate, searchTerm.current);
    }
  }

  function handleSearchChange(args: { value: string }) {
    searchTerm.current = args.value;
    if (selectedAgency.current && selectedDate.current) {
      fetchChangeCount(
        selectedAgency.current,
        selectedDate.current,
        searchTerm.current
      );
    }
  }

  return (
    <div>
      <div className="mb-4">
        <label
          htmlFor="agency-dropdown"
          className="text-sm font-medium mb-2 flex"
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
        <label htmlFor="calendar" className="flex text-sm font-medium mb-2">
          Changes From Date
          <TooltipComponent content="Required field" target="#date-required">
            <span
              id="date-required"
              className="text-red-500"
              role="img"
              aria-label="Required field"
            >
              *
            </span>
          </TooltipComponent>
        </label>
        <CalendarComponent
          id="calendar"
          value={selectedDate.current}
          max={new Date()}
          min={new Date(process.env.NEXT_PUBLIC_MIN_DATE ?? "2017-01-01")}
          onChange={handleDateChange}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="searchTerm" className="flex text-sm font-medium mb-2">
          Search term
          <TooltipComponent
            content="Searches both headings and full text"
            target="#search-info"
          >
            <span
              id="search-info"
              className="e-icons e-circle-info"
              role="img"
              aria-label="Search information"
            ></span>
          </TooltipComponent>
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
        ) : changeCount !== null ? (
          <p className="text-lg">
            Since {selectedDate.current?.toLocaleDateString()}, there{" "}
            {changeCount === 1 ? "has" : "have"} been{" "}
            <span className="font-bold">
              {changeCount?.toLocaleString()}
              {changeCount === maxChangeCount && "+"}
            </span>
            {changeCount === 1 ? " change" : " changes"} by the{" "}
            {selectedAgency.current?.short_name}
            {searchTerm.current ? (
              <>
                {" "}
                matching <span className="font-bold">{searchTerm.current}</span>
              </>
            ) : (
              ""
            )}
            .
          </p>
        ) : (
          <p className="text-gray-500">
            Select an agency and date to see the number of changes.
          </p>
        )}
      </div>
    </div>
  );
}
