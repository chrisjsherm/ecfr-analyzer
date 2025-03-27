"use client";

import {
  HeatMapComponent,
  Inject,
  Legend,
  Tooltip,
} from "@syncfusion/ej2-react-heatmap";
import { AgencyChangeCounts } from "../../types/agency-change-counts.type";
import { groupCountsByMonth } from "../../utils/group-by-month";
import NoDataAvailable from "./NoDataAvailable";

interface HeatMapProps {
  data: AgencyChangeCounts[] | null;
}

export default function ChangeCountHeatMap({ data }: HeatMapProps) {
  if (!data || data.length === 0) {
    return <NoDataAvailable />;
  }

  data = groupCountsByMonth(data);

  const heatmapData = data.map((agencyChangeCounts) =>
    agencyChangeCounts.counts.map((dayEntry) => dayEntry.count)
  );

  return (
    <HeatMapComponent
      dataSource={heatmapData}
      yAxis={{
        labels: data[0].counts.map((count) => count.date),
      }}
      xAxis={{
        labels: data.map((item) => item.agency.short_name),
      }}
      renderingMode={"SVG"}
    >
      <Inject services={[Legend, Tooltip]} />
    </HeatMapComponent>
  );
}
