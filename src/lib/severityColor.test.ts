import { describe, it, expect } from "vitest";
import { severityToColor, levelToColor, roundCoord } from "./severityColor";

describe("severityColor", () => {
  it("roundCoord membulatkan koordinat ke 0,1 derajat", () => {
    expect(roundCoord(7.7312)).toBe(7.7);
    expect(roundCoord(109.0551)).toBe(109.1);
    expect(roundCoord(-7.7399)).toBe(-7.7);
    expect(roundCoord(108.9063)).toBe(108.9);
  });

  it("severityToColor: pita warna hijau (0-33), kuning (34-66), merah (67-100)", () => {
    const col0 = severityToColor(0);
    const col33 = severityToColor(33);
    const col34 = severityToColor(34);
    const col66 = severityToColor(66);
    const col67 = severityToColor(67);
    const col100 = severityToColor(100);

    // 0 adalah hijau murni
    expect(col0.toLowerCase()).toBe("#10b981");

    // 33 (hijau) dan 34 (kuning) berada di pita yang berbeda
    expect(col33).not.toBe(col34);

    // 66 (kuning) dan 67 (merah) berada di pita yang berbeda
    expect(col66).not.toBe(col67);

    // 100 adalah merah murni
    expect(col100.toLowerCase()).toBe("#ef4444");
  });

  it("levelToColor konsisten dengan pita warna severity", () => {
    const colorAman = levelToColor("aman");
    const colorWaspada = levelToColor("waspada");
    const colorTunda = levelToColor("tunda");

    expect(colorAman).toBe(severityToColor(0));
    expect(colorWaspada).toBe(severityToColor(50));
    expect(colorTunda).toBe(severityToColor(100));
  });
});
