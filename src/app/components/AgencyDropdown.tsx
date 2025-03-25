"use client";

import { ChangeEventArgs } from "@syncfusion/ej2-react-calendars";
import {
  DropDownListComponent,
  MultiSelectChangeEventArgs,
  MultiSelectComponent,
} from "@syncfusion/ej2-react-dropdowns";
import type { Agency } from "../types/agency";

interface Props {
  agencies: Agency[];
  onSelect: (agencySlugs: Agency[]) => void;
  selectMultiple?: boolean;
}

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
        placeholder="Select an agency"
        filterBarPlaceholder="Search agencies"
        allowFiltering={true}
        filterType="Contains"
        change={handleMultipleAgenciesSelection}
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
