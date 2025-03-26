"use client";

import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import {
  ChangedEventArgs,
  DateRangePickerComponent,
} from "@syncfusion/ej2-react-calendars";
import { TextBoxComponent } from "@syncfusion/ej2-react-inputs";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { useRef, useState } from "react";
import { Agency } from "../../types/agency.type";
import { AgencyDropdown } from "./AgencyDropdown";

const MAX_AGENCIES = parseInt(
  process.env.NEXT_PUBLIC_ECFR_API_MAX_REQUESTS_PER_SECOND || "10"
);

export default function ParameterSelection({
  agencies,
}: {
  agencies: Agency[];
}) {
  const selectedAgencies = useRef<Agency[]>([]);
  const dateRange = useRef<[Date | undefined, Date | undefined]>([
    undefined,
    undefined,
  ]);
  const searchTerm = useRef<string>("");
  const [errors, setErrors] = useState<{
    agencies?: string;
    dateRange?: string;
  }>({});

  function handleAgencySelect(agencies: Agency[]) {
    selectedAgencies.current = agencies;
    validateAgencies(agencies);
  }

  function validateAgencies(agencies: Agency[]) {
    if (agencies.length === 0) {
      setErrors((prev) => ({
        ...prev,
        agencies: "Please select at least one agency",
      }));
      return false;
    }
    if (agencies.length > MAX_AGENCIES) {
      setErrors((prev) => ({
        ...prev,
        agencies: `Please select no more than ${MAX_AGENCIES} agencies`,
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, agencies: undefined }));
    return true;
  }

  function handleDateRangeChange(args: ChangedEventArgs) {
    if (args.value && Array.isArray(args.value) && args.value.length === 2) {
      dateRange.current = [args.value[0], args.value[1]];
      validateDateRange(args.value as unknown as [Date, Date]);
    }
  }

  function handleDateRangeClear() {
    dateRange.current = [undefined, undefined];
    validateDateRange(dateRange.current);
  }

  function validateDateRange(range: [Date | undefined, Date | undefined]) {
    if (!range[0] || !range[1]) {
      setErrors((prev) => ({
        ...prev,
        dateRange: "Please select both start and end dates",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, dateRange: undefined }));
    return true;
  }

  function handleSearchTermChange(args: { value: string }) {
    searchTerm.current = args.value;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const isAgenciesValid = validateAgencies(selectedAgencies.current);
    const isDateRangeValid = validateDateRange(dateRange.current);

    if (!isAgenciesValid || !isDateRangeValid) {
      return;
    }

    console.log(
      selectedAgencies.current,
      dateRange.current,
      searchTerm.current
    );
  }

  return (
    <form onSubmit={handleSubmit}>
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
        {errors.agencies && (
          <div className="text-red-500 text-sm mt-1">{errors.agencies}</div>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="dateRange" className="flex text-sm font-medium mb-2">
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
        <div className="max-w-md">
          <DateRangePickerComponent
            id="dateRange"
            max={new Date()}
            min={new Date(process.env.NEXT_PUBLIC_MIN_DATE ?? "2017-01-01")}
            strictMode={true}
            change={handleDateRangeChange}
            cleared={handleDateRangeClear}
            format="MM/dd/yyyy"
            placeholder="Select date range"
            openOnFocus={true}
            cssClass="e-custom-datepicker w-full"
          />
        </div>
        {errors.dateRange && (
          <div className="text-red-500 text-sm mt-1">{errors.dateRange}</div>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="searchTerm" className="flex text-sm font-medium mb-2">
          Change Includes
        </label>
        <div className="max-w-md">
          <TextBoxComponent
            id="searchTerm"
            name="searchTerm"
            placeholder="Search term (optional)"
            change={handleSearchTermChange}
            cssClass="w-full"
          />
        </div>
      </div>

      <div className="mt-6">
        <ButtonComponent cssClass="e-primary" type="submit">
          Submit
        </ButtonComponent>
      </div>
    </form>
  );
}
