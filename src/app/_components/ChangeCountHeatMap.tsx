"use client";

import {
  HeatMapComponent,
  Inject,
  Legend,
  Tooltip,
} from "@syncfusion/ej2-react-heatmap";
import { HeatmapData } from "../../types/heat-map-data.type";

interface HeatMapProps {
  data: HeatmapData[];
}

export default function ChangeCountHeatMap({ data }: HeatMapProps) {
  const heatmapData = data.map((item) =>
    item.counts.map((count) => count.count)
  );

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <HeatMapComponent
      dataSource={heatmapData}
      titleSettings={{
        text: "Change Count by Day",
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
      cellSettings={{
        tileType: "Bubble",
        bubbleType: "Size",
      }}
    >
      <Inject services={[Legend, Tooltip]} />
    </HeatMapComponent>
  );
}
