"use client";

import { ChangeEventArgs } from "@syncfusion/ej2-react-calendars";
import {
  DropDownListComponent,
  MultiSelectChangeEventArgs,
  MultiSelectComponent,
} from "@syncfusion/ej2-react-dropdowns";
import type { Agency } from "../../types/agency.type";

interface Props {
  agencies: Agency[];
  onSelect: (agencySlugs: Agency[]) => void;
  selectMultiple?: boolean;
}

const MAX_AGENCIES = parseInt(
  process.env.NEXT_PUBLIC_ECFR_API_MAX_REQUESTS_PER_SECOND || "10"
);

/**
 * AgencyDropdown component
 * @param agencies - The list of agencies to display in the dropdown
 * @param onSelect - The function to call when an agency is selected
 * @param selectMultiple - Whether to allow multiple agency selections
 */
export function AgencyDropdown({
  agencies,
  onSelect,
  selectMultiple = false,
}: Props) {
  function handleMultipleAgenciesSelection(event: MultiSelectChangeEventArgs) {
    onSelect(event.value as Agency[]);
  }

  function handleSingleAgencySelection(event: ChangeEventArgs) {
    onSelect([event.value as unknown as Agency]);
  }

  if (selectMultiple) {
    return (
      <MultiSelectComponent
        dataSource={agencies as unknown as { [key: string]: object }[]}
        fields={{ text: "name" }}
        allowObjectBinding={true}
        placeholder={`Select up to ${MAX_AGENCIES} agencies`}
        filterBarPlaceholder="Search agencies"
        allowFiltering={true}
        filterType="Contains"
        change={handleMultipleAgenciesSelection}
        maximumSelectionLength={MAX_AGENCIES}
        addTagOnBlur={true}
        changeOnBlur={false}
        closePopupOnSelect={false}
        isDeviceFullScreen={false}
        popupWidth="95%"
      />
    );
  }

  return (
    <DropDownListComponent
      dataSource={agencies as unknown as { [key: string]: object }[]}
      fields={{ text: "name" }}
      allowObjectBinding={true}
      placeholder="Select an agency"
      filterBarPlaceholder="Search agencies"
      allowFiltering={true}
      filterType="Contains"
      change={handleSingleAgencySelection}
    />
  );
}
