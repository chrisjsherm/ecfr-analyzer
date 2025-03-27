import { Agency } from "./agency.type";

export interface AgencyChangeCounts {
  agency: Agency;
  counts: Array<{
    date: string;
    count: number;
  }>;
  totalCount: number;
}
