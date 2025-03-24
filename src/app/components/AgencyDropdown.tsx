"use client";

import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";
import type { Agency } from "../types/agency";

interface Props {
  agencies: Agency[];
}

export function AgencyDropdown({ agencies }: Props) {
  return (
    <DropDownListComponent
      dataSource={agencies as unknown as { [key: string]: object }[]}
      fields={{ text: "name", value: "slug" }}
      placeholder="Select an agency"
      filterBarPlaceholder="Search agencies"
      allowFiltering={true}
      popupHeight="400px"
      filterType="Contains"
    />
  );
}
