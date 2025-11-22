import { describe, expect, it } from "vitest";
import { SEARCH_PARAM_KEY } from "../defaults";
import { getTabId } from "./get-tab-id";

describe("getTabId()", () => {
  it("should return undefined if the tab ID is not present in the URL", () => {
    const request = new Request("http://localhost:3000/");
    expect(getTabId(request)).toBeUndefined();
  });

  it("should return the tab ID from the default query parameter", () => {
    const request = new Request(`http://localhost:3000/?${SEARCH_PARAM_KEY}=12345`);
    expect(getTabId(request)).toBe("12345");
  });

  it("should return the tab ID from a custom query parameter", () => {
    const request = new Request(`http://localhost:3000/?custom-tid=67890`);
    expect(getTabId(request, { paramKey: "custom-tid" })).toBe("67890");
  });

  it("should return undefined if the custom query parameter is missing", () => {
    const request = new Request(`http://localhost:3000/?${SEARCH_PARAM_KEY}=12345`);
    expect(getTabId(request, { paramKey: "custom-tid" })).toBeUndefined();
  });

  it("should handle URLs with multiple query parameters", () => {
    const request = new Request(`http://localhost:3000/?foo=bar&${SEARCH_PARAM_KEY}=abcde&baz=qux`);
    expect(getTabId(request)).toBe("abcde");
  });

  it("should return the first value if multiple parameters with the same key exist", () => {
    const request = new Request(`http://localhost:3000/?${SEARCH_PARAM_KEY}=first&${SEARCH_PARAM_KEY}=second`);
    expect(getTabId(request)).toBe("first");
  });
});
