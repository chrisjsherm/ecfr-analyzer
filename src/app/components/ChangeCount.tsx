"use client";

import {
  CalendarComponent,
  ChangedEventArgs,
} from "@syncfusion/ej2-react-calendars";
import { useState } from "react";
import { Agency } from "../types/agency";
import { AgencyDropdown } from "./AgencyDropdown";

export default function ChangeCount({ agencies }: { agencies: Agency[] }) {
  const [changeCount, setChangeCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);

  const maxChangeCount = 10000;

  async function fetchChangeCount(agency: Agency, date: Date) {
    setIsLoading(true);
    setError(null);
    try {
      const formattedDate = date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
      const response = await fetch(
        `/api/ecfr/count?agency_slugs[]=${agency.slug}&last_modified_on_or_after=${formattedDate}`
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

  function handleAgencySelect(agency: Agency) {
    setSelectedAgency(agency);
    if (agency && selectedDate) {
      fetchChangeCount(agency, selectedDate);
    }
  }

  function handleDateChange(args: ChangedEventArgs) {
    const newDate = args.value ?? new Date();
    setSelectedDate(newDate);
    if (selectedAgency) {
      fetchChangeCount(selectedAgency, newDate);
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
        <label htmlFor="calendar" className="block text-sm font-medium mb-2">
          Changes From Date
        </label>
        <CalendarComponent
          id="calendar"
          value={selectedDate}
          max={new Date()}
          onChange={handleDateChange}
        />
      </div>
      <div className="mt-4">
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : changeCount !== null ? (
          <p className="text-lg">
            Since {selectedDate?.toLocaleDateString()}, there{" "}
            {changeCount === 1 ? "has" : "have"} been{" "}
            <span className="font-bold">
              {changeCount?.toLocaleString()}
              {changeCount === maxChangeCount && "+"}
            </span>
            {changeCount === 1 ? " change" : " changes"} by the{" "}
            {selectedAgency?.short_name}.
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
