"use client";

import {
  HeatMapComponent,
  Inject,
  Legend,
  Tooltip,
} from "@syncfusion/ej2-react-heatmap";
import { AgencyChangeCounts } from "../../types/agency-change-counts.type";
import { groupCountsByMonth } from "../../utils/group-by-month";

interface HeatMapProps {
  data: AgencyChangeCounts[] | null;
}

export default function ChangeCountHeatMap({ data }: HeatMapProps) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  data = groupCountsByMonth(data);

  const heatmapData = data.map((agencyChangeCounts) =>
    agencyChangeCounts.counts.map((dayEntry) => dayEntry.count)
  );

  return (
    <HeatMapComponent
      dataSource={heatmapData}
      titleSettings={{
        text: "Heat Map",
        textStyle: {
          size: "16px",
          fontWeight: "bold",
        },
      }}
      yAxis={{
        labels: data[0].counts.map((count) => count.date),
        title: { text: "Date" },
      }}
      xAxis={{
        labels: data.map((item) => item.agency.short_name),
        title: { text: "Agency" },
      }}
      renderingMode={"SVG"}
    >
      <Inject services={[Legend, Tooltip]} />
    </HeatMapComponent>
  );
}
