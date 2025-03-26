import { Agency } from "./agency.type";

export interface HeatmapData {
  agency: Agency;
  counts: Array<{
    date: string;
    count: number;
  }>;
}
