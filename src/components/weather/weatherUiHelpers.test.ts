// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import {
  getMascotMoodForStatus,
  formatWaveSummarySentence,
  calculateBoatLevel,
  getWaveCategory,
} from "./weatherUiHelpers";

describe("weatherUiHelpers", () => {
  describe("getMascotMoodForStatus", () => {
    it("memetakan status 'aman' ke ekspresi 'happy'", () => {
      expect(getMascotMoodForStatus("aman")).toBe("happy");
    });

    it("memetakan status 'waspada' ke ekspresi 'thinking'", () => {
      expect(getMascotMoodForStatus("waspada")).toBe("thinking");
    });

    it("memetakan status 'tunda' ke ekspresi 'worried'", () => {
      expect(getMascotMoodForStatus("tunda")).toBe("worried");
    });
  });

  describe("formatWaveSummarySentence", () => {
    it("menghasilkan kalimat ramah saat data gelombang null", () => {
      expect(formatWaveSummarySentence(null, "waspada")).toContain(
        "Data cuaca tidak tersedia saat ini"
      );
    });

    it("menghasilkan kalimat 'Aman untuk berlayar' saat aman", () => {
      const sentence = formatWaveSummarySentence(0.8, "aman");
      expect(sentence).toContain("0,80 m");
      expect(sentence).toContain("Aman untuk berlayar");
    });

    it("menghasilkan kalimat 'Waspada saat berlayar' saat waspada", () => {
      const sentence = formatWaveSummarySentence(1.4, "waspada");
      expect(sentence).toContain("1,40 m");
      expect(sentence).toContain("Waspada saat berlayar");
    });

    it("menghasilkan kalimat 'Disarankan tunda pelayaran' saat tunda", () => {
      const sentence = formatWaveSummarySentence(2.5, "tunda");
      expect(sentence).toContain("2,50 m");
      expect(sentence).toContain("Disarankan tunda pelayaran");
    });
  });

  describe("calculateBoatLevel", () => {
    it("data null selalu waspada", () => {
      expect(calculateBoatLevel(null, true)).toBe("waspada");
      expect(calculateBoatLevel(null, false)).toBe("waspada");
    });

    it("menghitung status untuk kapal kayu", () => {
      expect(calculateBoatLevel(0.9, true)).toBe("aman");
      expect(calculateBoatLevel(1.3, true)).toBe("waspada");
      expect(calculateBoatLevel(1.8, true)).toBe("tunda");
    });

    it("menghitung status untuk speedboat", () => {
      expect(calculateBoatLevel(1.2, false)).toBe("aman");
      expect(calculateBoatLevel(1.8, false)).toBe("waspada");
      expect(calculateBoatLevel(2.4, false)).toBe("tunda");
    });
  });

  describe("getWaveCategory", () => {
    it("mengembalikan kategori sesuai ambang BMKG", () => {
      expect(getWaveCategory(null)).toBe("TIDAK DIKETAHUI");
      expect(getWaveCategory(0.4)).toBe("TENANG");
      expect(getWaveCategory(0.9)).toBe("SEDANG");
      expect(getWaveCategory(1.7)).toBe("TINGGI");
      expect(getWaveCategory(2.8)).toBe("SANGAT TINGGI");
    });
  });
});
