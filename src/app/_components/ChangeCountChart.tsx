"use client";

import {
  ChartComponent,
  DataLabel,
  DateTime,
  Inject,
  Legend,
  LineSeries,
  SeriesCollectionDirective,
  SeriesDirective,
  Tooltip,
} from "@syncfusion/ej2-react-charts";
import { AgencyChangeCounts } from "../../types/agency-change-counts.type";

/**
 * Display a chart of the number of changes for one or more agencies over a date range
 * @param agencies - The list of agencies to display in the dropdown
 */
export default function ChangeCountChart({
  data,
}: {
  data: AgencyChangeCounts[] | null;
}) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <ChartComponent
      title="Timeline"
      primaryXAxis={{
        valueType: "DateTime",
        labelFormat: "M/d/yyyy",
        title: "Date",
      }}
      primaryYAxis={{
        title: "Change Count",
        labelFormat: "{value}",
      }}
      tooltip={{
        enable: true,
        format: "${point.x}: ${point.y}",
      }}
      legendSettings={{ visible: true }}
    >
      <Inject services={[LineSeries, DateTime, Legend, Tooltip, DataLabel]} />
      <SeriesCollectionDirective>
        {data.map((series) => (
          <SeriesDirective
            key={series.agency.slug}
            dataSource={series.counts}
            xName="date"
            yName="count"
            name={series.agency.short_name}
            type="Line"
            marker={{
              visible: true,
              dataLabel: {
                visible: false,
              },
            }}
          />
        ))}
      </SeriesCollectionDirective>
    </ChartComponent>
  );
}
