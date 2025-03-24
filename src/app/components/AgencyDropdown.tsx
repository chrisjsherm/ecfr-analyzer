"use client";

import {
  DropDownListComponent,
  SelectEventArgs,
} from "@syncfusion/ej2-react-dropdowns";
import type { Agency } from "../types/agency";

interface Props {
  agencies: Agency[];
  onSelect: (agency: Agency) => void;
}

export function AgencyDropdown({ agencies, onSelect }: Props) {
  function handleAgencySelect(event: SelectEventArgs) {
    onSelect(event.itemData as Agency);
  }

  return (
    <DropDownListComponent
      dataSource={agencies as unknown as { [key: string]: object }[]}
      fields={{ text: "name", value: "slug" }}
      placeholder="Select an agency"
      filterBarPlaceholder="Search agencies"
      allowFiltering={true}
      filterType="Contains"
      select={handleAgencySelect}
    />
  );
}
