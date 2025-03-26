import { DateTime } from "luxon";
import { getDatesInRange, isValidDateFormat } from "./date.utils";

describe("isValidDateFormat", () => {
  it("should return true for valid date format", () => {
    expect(isValidDateFormat("2024-01-01")).toBe(true);
  });

  it("should return false for invalid date format", () => {
    expect(isValidDateFormat("2024-01-01T00:00:00Z")).toBe(false);
  });
});

describe("getDatesInRange", () => {
  it("should return an array of dates", () => {
    const start = DateTime.fromISO("2024-01-01");
    const end = DateTime.fromISO("2024-01-05");
    const format = "yyyy-MM-dd";
    const dates = getDatesInRange(start, end, format);
    expect(dates).toEqual([
      "2024-01-01",
      "2024-01-02",
      "2024-01-03",
      "2024-01-04",
      "2024-01-05",
    ]);
  });
});
