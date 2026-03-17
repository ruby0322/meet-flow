import { describe, expect, it } from "vitest";
import { getTimeZoneOffsetMinutes } from "./timezone";

describe("timezone conversion offsets (incl. DST)", () => {
  it("New York: offset changes between winter (EST) and summer (EDT)", () => {
    const winter = new Date(Date.UTC(2026, 0, 15, 12, 0, 0)); // Jan 15 12:00Z
    const summer = new Date(Date.UTC(2026, 6, 15, 12, 0, 0)); // Jul 15 12:00Z

    expect(getTimeZoneOffsetMinutes("America/New_York", winter)).toBe(-300);
    expect(getTimeZoneOffsetMinutes("America/New_York", summer)).toBe(-240);
  });

  it("London: offset changes between winter (GMT) and summer (BST)", () => {
    const winter = new Date(Date.UTC(2026, 0, 15, 12, 0, 0)); // Jan
    const summer = new Date(Date.UTC(2026, 6, 15, 12, 0, 0)); // Jul

    expect(getTimeZoneOffsetMinutes("Europe/London", winter)).toBe(0);
    expect(getTimeZoneOffsetMinutes("Europe/London", summer)).toBe(60);
  });

  it("Mumbai: offset stays constant (no DST)", () => {
    const jan = new Date(Date.UTC(2026, 0, 15, 0, 0, 0));
    const jul = new Date(Date.UTC(2026, 6, 15, 0, 0, 0));

    expect(getTimeZoneOffsetMinutes("Asia/Kolkata", jan)).toBe(330);
    expect(getTimeZoneOffsetMinutes("Asia/Kolkata", jul)).toBe(330);
  });

  it("Tokyo: offset stays constant (no DST)", () => {
    const jan = new Date(Date.UTC(2026, 0, 15, 0, 0, 0));
    const jul = new Date(Date.UTC(2026, 6, 15, 0, 0, 0));

    expect(getTimeZoneOffsetMinutes("Asia/Tokyo", jan)).toBe(540);
    expect(getTimeZoneOffsetMinutes("Asia/Tokyo", jul)).toBe(540);
  });

  it("Sydney: offset changes between summer (AEDT) and winter (AEST)", () => {
    // Australia/Sydney observes DST in southern hemisphere:
    // - Jan is typically DST (UTC+11)
    // - Jul is standard time (UTC+10)
    const summer = new Date(Date.UTC(2026, 0, 15, 12, 0, 0)); // Jan
    const winter = new Date(Date.UTC(2026, 6, 15, 12, 0, 0)); // Jul

    expect(getTimeZoneOffsetMinutes("Australia/Sydney", summer)).toBe(660);
    expect(getTimeZoneOffsetMinutes("Australia/Sydney", winter)).toBe(600);
  });
});

