import { describe, expect, it } from "vitest";

import { assetPath } from "./assetPath";

describe("assetPath", () => {
  it("leaves a public path alone when the app is served from the domain root", () => {
    expect(assetPath("/icons/figma/logo.svg")).toBe("/icons/figma/logo.svg");
  });

  it("keeps the leading slash, so the path stays absolute rather than page-relative", () => {
    expect(assetPath("/icons/figma/logo.svg").startsWith("/")).toBe(true);
  });
});
