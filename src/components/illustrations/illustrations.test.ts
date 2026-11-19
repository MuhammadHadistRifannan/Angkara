// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { Mascot } from "./Mascot";
import { StepSearch } from "./scenes/StepSearch";
import { StepWeather } from "./scenes/StepWeather";
import { StepBooking } from "./scenes/StepBooking";
import { StepDepart } from "./scenes/StepDepart";

describe("Ilustrasi dan Maskot Si Suar", () => {
  it("merender maskot Si Suar dalam semua mood tanpa error", () => {
    const moods = ["happy", "wave", "thinking", "worried", "celebrate"] as const;
    moods.forEach((mood) => {
      const { container } = render(React.createElement(Mascot, { mood, size: 80 }));
      expect(container.querySelector("svg")).toBeDefined();
    });
  });

  it("merender maskot dengan aksesori jaket pelampung", () => {
    const { container } = render(React.createElement(Mascot, { accessory: "lifejacket" }));
    expect(container.querySelector("#accessory-lifejacket")).toBeDefined();
  });

  it("merender adegan StepSearch (Cari & Filter)", () => {
    const { container } = render(React.createElement(StepSearch));
    expect(container.querySelector("#wooden-pier")).toBeDefined();
  });

  it("merender adegan StepWeather (Cuaca & BMKG)", () => {
    const { container } = render(React.createElement(StepWeather, { status: "aman" }));
    expect(container.textContent).toContain("Aman Berlayar");
  });

  it("merender adegan StepWeather pada status tunda", () => {
    const { container } = render(React.createElement(StepWeather, { status: "tunda" }));
    expect(container.textContent).toContain("Tunda Trip");
  });

  it("merender adegan StepBooking (Escrow & DP 30%)", () => {
    const { container } = render(React.createElement(StepBooking));
    expect(container.textContent).toContain("DP 30%");
  });

  it("merender adegan StepDepart (Boarding & E-Tiket)", () => {
    const { container } = render(React.createElement(StepDepart));
    expect(container.querySelector("#boat-hull")).toBeDefined();
  });
});
