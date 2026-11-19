// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import React from "react";
import { WaveDivider } from "./WaveDivider";

describe("WaveDivider component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("merender 3 lapisan gelombang SVG dan perahu maskot bonus", () => {
    const { container } = render(
      React.createElement(WaveDivider, {
        fill: "#F8FAFC",
        tone: "#0D9488",
        showBoat: true,
      })
    );

    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThanOrEqual(3);
    expect(container.querySelector('[aria-hidden="true"]')).toBeDefined();
  });

  it("menerima prop fill dan menyertakannya di lapisan depan", () => {
    const { container } = render(
      React.createElement(WaveDivider, {
        fill: "#123456",
        tone: "#0D9488",
      })
    );

    const paths = container.querySelectorAll("path");
    const frontPath = Array.from(paths).find((p) => p.getAttribute("fill") === "#123456");
    expect(frontPath).toBeDefined();
  });

  it("menerima prop from dan to dengan format CSS variable", () => {
    const { container } = render(
      React.createElement(WaveDivider, {
        from: "--section-features-bg",
        to: "--section-why-bg",
      })
    );

    const paths = container.querySelectorAll("path");
    const frontPath = Array.from(paths).find(
      (p) => p.getAttribute("fill") === "var(--section-why-bg)"
    );
    expect(frontPath).toBeDefined();
  });
});
