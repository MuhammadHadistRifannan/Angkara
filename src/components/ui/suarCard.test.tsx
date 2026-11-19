// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SuarCard } from "./SuarCard";
import { getContrastThemeForColor } from "./suarCardTheme";
import { calculateCoverflowState } from "./suarCarouselLogic";

describe("SuarCard Component", () => {
  it("renders title, blurb, chips and footer with center alignment", () => {
    render(
      <SuarCard
        color="teal"
        title="Pantai Permisan"
        blurb="Pantai pasir putih, selat tenang."
        chips={["15 mnt - 2,5 km", "Pelampung gratis"]}
        footer={<button>Lihat Rute</button>}
      />
    );

    expect(screen.getByText("Pantai Permisan")).toBeDefined();
    expect(screen.getByText("Pantai pasir putih, selat tenang.")).toBeDefined();
    expect(screen.getByText("15 mnt - 2,5 km")).toBeDefined();
    expect(screen.getByText("Pelampung gratis")).toBeDefined();
    expect(screen.getByText("Lihat Rute")).toBeDefined();
  });

  it("limits chips to maximum 2 chips", () => {
    render(
      <SuarCard
        color="coral"
        title="Test Card"
        blurb="Blurb description"
        chips={["Chip 1", "Chip 2", "Chip 3"]}
      />
    );

    expect(screen.getByText("Chip 1")).toBeDefined();
    expect(screen.getByText("Chip 2")).toBeDefined();
    expect(screen.queryByText("Chip 3")).toBeNull();
  });

  it("applies correct contrast theme: white text on dark cards, dark ink on light cards", () => {
    const darkTeal = getContrastThemeForColor("teal");
    expect(darkTeal.textColor).toBe("text-white");

    const darkCoral = getContrastThemeForColor("coral");
    expect(darkCoral.textColor).toBe("text-white");

    const darkNavy = getContrastThemeForColor("navy");
    expect(darkNavy.textColor).toBe("text-white");

    const lightSeafoam = getContrastThemeForColor("seafoam");
    expect(lightSeafoam.textColor).toBe("text-slate-900");

    const lightSun = getContrastThemeForColor("sun");
    expect(lightSun.textColor).toBe("text-slate-900");

    const lightSand = getContrastThemeForColor("sand");
    expect(lightSand.textColor).toBe("text-slate-900");
  });

  it("handles pointer down to activate pop and pointer up to release", () => {
    const { container } = render(
      <SuarCard
        color="teal"
        title="Interactive Card"
        blurb="Testing pop interaction"
      />
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toBeDefined();

    // Initial state: not popped
    expect(card.getAttribute("data-popped")).toBe("false");

    // Pointer down activates pop
    fireEvent.pointerDown(card, { clientX: 100, clientY: 100 });
    expect(card.getAttribute("data-popped")).toBe("true");

    // Pointer up releases pop
    fireEvent.pointerUp(card, { clientX: 100, clientY: 100 });
    expect(card.getAttribute("data-popped")).toBe("false");
  });

  it("cancels pop interaction if pointer moves more than 8px (drag gesture)", () => {
    const { container } = render(
      <SuarCard
        color="seafoam"
        title="Drag Card"
        blurb="Testing drag threshold"
      />
    );

    const card = container.firstChild as HTMLElement;

    fireEvent.pointerDown(card, { clientX: 100, clientY: 100 });
    expect(card.getAttribute("data-popped")).toBe("true");

    // Move 15px (exceeding 8px threshold)
    fireEvent.pointerMove(card, { clientX: 115, clientY: 100 });
    expect(card.getAttribute("data-popped")).toBe("false");
  });

  it("supports keyboard Enter and Space for popping", () => {
    const { container } = render(
      <SuarCard
        color="sun"
        title="Keyboard Card"
        blurb="Testing keyboard access"
      />
    );

    const card = container.firstChild as HTMLElement;

    fireEvent.keyDown(card, { key: "Enter" });
    expect(card.getAttribute("data-popped")).toBe("true");

    fireEvent.keyUp(card, { key: "Enter" });
    expect(card.getAttribute("data-popped")).toBe("false");

    fireEvent.keyDown(card, { key: " " });
    expect(card.getAttribute("data-popped")).toBe("true");

    fireEvent.keyUp(card, { key: " " });
    expect(card.getAttribute("data-popped")).toBe("false");
  });
});

describe("SuarCarousel Coverflow Logic", () => {
  it("centers card without fanning/tilt if item count <= 2", () => {
    const state0 = calculateCoverflowState(0, 0, 2);
    expect(state0.position).toBe("center");
    expect(state0.tilt).toBe(0);
    expect(state0.scale).toBe(1);

    const state1 = calculateCoverflowState(1, 0, 2);
    expect(state1.position).toBe("center");
    expect(state1.tilt).toBe(0);
  });

  it("applies fanning angles and scales when item count > 2", () => {
    // Active index is 2 (center)
    const activeIndex = 2;
    const total = 5;

    const center = calculateCoverflowState(2, activeIndex, total);
    expect(center.position).toBe("center");
    expect(center.scale).toBe(1);
    expect(center.tilt).toBe(0);
    expect(center.zIndex).toBe(3);
    expect(center.opacity).toBe(1);

    const left = calculateCoverflowState(1, activeIndex, total);
    expect(left.position).toBe("left");
    expect(left.scale).toBe(0.92);
    expect(left.tilt).toBe(-6);
    expect(left.zIndex).toBe(2);
    expect(left.opacity).toBe(0.85);

    const right = calculateCoverflowState(3, activeIndex, total);
    expect(right.position).toBe("right");
    expect(right.scale).toBe(0.92);
    expect(right.tilt).toBe(6);
    expect(right.zIndex).toBe(2);
    expect(right.opacity).toBe(0.85);

    const farLeft = calculateCoverflowState(0, activeIndex, total);
    expect(farLeft.position).toBe("far-left");
    expect(farLeft.scale).toBe(0.85);
    expect(farLeft.tilt).toBe(-10);
    expect(farLeft.zIndex).toBe(1);
    expect(farLeft.opacity).toBe(0.7);

    const farRight = calculateCoverflowState(4, activeIndex, total);
    expect(farRight.position).toBe("far-right");
    expect(farRight.scale).toBe(0.85);
    expect(farRight.tilt).toBe(10);
    expect(farRight.zIndex).toBe(1);
    expect(farRight.opacity).toBe(0.7);
  });
});
