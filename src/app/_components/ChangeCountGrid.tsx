"use client";

import {
  ColumnDirective,
  ColumnsDirective,
  GridComponent,
} from "@syncfusion/ej2-react-grids";
import { AgencyChangeCounts } from "../../types/agency-change-counts.type";
import NoDataAvailable from "./NoDataAvailable";

const maxChangeCount = 10000;

/**
 * Display the number of changes for a given agency and date
 * @param agencies - The list of agencies to display in the dropdown
 */
export default function ChangeCountGrid({
  changeCounts,
}: {
  changeCounts: AgencyChangeCounts[] | null;
}) {
  if (!changeCounts || changeCounts.length === 0) {
    return <NoDataAvailable />;
  }

  const data = changeCounts.map((agencyChangeCounts) => ({
    name: `${agencyChangeCounts.agency.name} (${agencyChangeCounts.agency.short_name})`,
    count:
      agencyChangeCounts.totalCount === maxChangeCount
        ? `${maxChangeCount.toLocaleString()}+`
        : agencyChangeCounts.totalCount.toLocaleString(),
  }));

  return (
    <GridComponent dataSource={data} allowSelection={false} autoFit={true}>
      <ColumnsDirective>
        <ColumnDirective field="name" headerText="Agency" />
        <ColumnDirective field="count" headerText="Changes" />
      </ColumnsDirective>
    </GridComponent>
  );
}
