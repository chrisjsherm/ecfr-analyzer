import { isValidDateFormat } from "./date.utils";

describe("isValidDateFormat", () => {
  it("should return true for valid date format", () => {
    expect(isValidDateFormat("2024-01-01")).toBe(true);
  });

  it("should return false for invalid date format", () => {
    expect(isValidDateFormat("2024-01-01T00:00:00Z")).toBe(false);
  });
});
