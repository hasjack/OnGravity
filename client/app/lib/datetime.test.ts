import { describe, expect, it } from "vitest";

import { formatDateTime } from "./datetime";

describe("formatDateTime", () => {
  it("formats with en-US locale using medium date and time style", () => {
    const date = new Date("2024-03-15T14:30:00Z");

    const result = formatDateTime(date, "en-US");

    // Medium date style in en-US: "Mar 15, 2024"
    // Medium time style varies by timezone but structure is consistent
    expect(result).toMatch(/^Mar 15, 2024/);
  });

  it("formats with de-DE locale using German conventions", () => {
    const date = new Date("2024-03-15T14:30:00Z");

    const result = formatDateTime(date, "de-DE");

    // Medium date style in de-DE: "15.03.2024"
    // Uses period separators and day-month-year order
    expect(result).toMatch(/^15\.03\.2024/);
  });
});
