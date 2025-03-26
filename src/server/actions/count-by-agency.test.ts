/**
 * @jest-environment node
 */

import { Agency } from "../../types/agency.type";
import { getChangeCountByAgency } from "./count-by-agency";

// Mock next/cache
jest.mock("next/cache", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  unstable_cache: (fn: any) => fn,
}));

// Mock the fetch function
global.fetch = jest.fn();

// Mock environment variables
process.env.ECFR_API_URL = "https://test-api.example.com";
process.env.NEXT_PUBLIC_ECFR_API_MAX_REQUESTS_PER_SECOND = "10";
process.env.ECFR_API_TIMEZONE = "America/New_York";

describe("getChangeCountByAgency", () => {
  const mockAgencies: Agency[] = [
    { slug: "agency-1", name: "Agency 1", short_name: "Agency 1" },
    { slug: "agency-2", name: "Agency 2", short_name: "Agency 2" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch and format data correctly for multiple agencies", async () => {
    const mockResponse = {
      dates: {
        "2024-01-01": 5,
        "2024-01-02": 3,
        "2024-01-03": 0,
      },
    };

    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    );

    const result = await getChangeCountByAgency(
      mockAgencies,
      "2024-01-01",
      "2024-01-03"
    );

    expect(result).toHaveLength(2);
    expect(result[0].agency).toEqual(mockAgencies[0]);
    expect(result[0].counts).toHaveLength(3);
    expect(result[0].counts[0]).toEqual({ date: "2024-01-01", count: 5 });
    expect(result[0].counts[1]).toEqual({ date: "2024-01-02", count: 3 });
    expect(result[0].counts[2]).toEqual({ date: "2024-01-03", count: 0 });

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("agency_slugs[]=agency-1"),
      expect.any(Object)
    );
  });

  it("should throw error when too many agencies are requested", async () => {
    const tooManyAgencies = Array(11)
      .fill(null)
      .map((_, i) => ({ slug: `agency-${i}`, name: `Agency ${i}` }));

    await expect(
      getChangeCountByAgency(
        tooManyAgencies as Agency[],
        "2024-01-01",
        "2024-01-03"
      )
    ).rejects.toThrow("Too many agencies");
  });

  it("should throw error for invalid date format", async () => {
    await expect(
      getChangeCountByAgency(mockAgencies, "invalid-date", "2024-01-03")
    ).rejects.toThrow("Invalid date format");
  });

  it("should handle API errors gracefully", async () => {
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: false,
        statusText: "Internal Server Error",
      })
    );

    await expect(
      getChangeCountByAgency(mockAgencies, "2024-01-01", "2024-01-03")
    ).rejects.toThrow("Failed to fetch from eCFR");
  });

  it("should handle missing date counts as zero", async () => {
    const mockResponse = {
      dates: {
        "2024-01-01": 5,
        // 2024-01-02 is missing
        "2024-01-03": 3,
      },
    };

    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    );

    const result = await getChangeCountByAgency(
      [mockAgencies[0]],
      "2024-01-01",
      "2024-01-03"
    );

    expect(result[0].counts).toHaveLength(3);
    expect(result[0].counts[1]).toEqual({ date: "2024-01-02", count: 0 });
  });
});
