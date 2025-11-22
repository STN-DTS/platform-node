import { act, renderHook, waitFor } from "@testing-library/react";
import React, { type ReactNode, useSyncExternalStore } from "react";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateId, useTabId } from "./use-tab-id";

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  const useSyncExternalStoreSpy = vi.fn(actual.useSyncExternalStore);
  return { ...actual, useSyncExternalStore: useSyncExternalStoreSpy };
});

describe("use-tab-id()", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => <MemoryRouter>{children}</MemoryRouter>;

  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("generateId()", () => {
    it("should generate an ID in the correct format (xx-0000)", () => {
      expect(generateId()).toMatch(/^[a-z]{2}-\d{4}$/);
    });

    it("should generate unique IDs", () => {
      expect(generateId()).not.toBe(generateId());
    });
  });

  describe("useTabId()", () => {
    it("should generate and return a new ID if session storage is empty", () => {
      const render = () => ({ location: useLocation(), tabId: useTabId() });
      const { result } = renderHook(render, { wrapper });
      const { tabId } = result.current;

      expect(tabId).toBeDefined();
      expect(tabId).toMatch(/^[a-z]{2}-\d{4}$/);
      expect(window.sessionStorage.getItem("tab-id")).toBe(tabId);
    });

    it("should return existing ID from session storage", () => {
      window.sessionStorage.setItem("tab-id", "ab-1234");

      const render = () => ({ location: useLocation(), tabId: useTabId() });
      const { result } = renderHook(render, { wrapper });
      const { tabId } = result.current;

      expect(tabId).toBe("ab-1234");
    });

    it("should use custom session storage key", () => {
      const render = () => ({ location: useLocation(), tabId: useTabId({ sessionStorageKey: "custom-key" }) });
      const { result } = renderHook(render, { wrapper });
      const { tabId } = result.current;

      expect(window.sessionStorage.getItem("custom-key")).toBe(tabId);
      expect(window.sessionStorage.getItem("tab-id")).toBeNull();
    });

    it("should update URL with ID when navigate is true (default)", async () => {
      const render = () => ({ location: useLocation(), tabId: useTabId() });
      const { result } = renderHook(render, { wrapper });
      const { tabId } = result.current;

      await waitFor(() => expect(result.current.location.search).toContain(`tid=${tabId}`));
    });

    it("should not update URL when navigate is false", () => {
      const render = () => ({ location: useLocation(), tabId: useTabId({ navigate: false }) });
      const { result } = renderHook(render, { wrapper });
      const { location } = result.current;

      expect(location.search).not.toContain("tid=");
    });

    it("should use custom search param key", async () => {
      const render = () => ({ location: useLocation(), tabId: useTabId({ idSearchParamKey: "customId" }) });
      const { result } = renderHook(render, { wrapper });
      const { location } = result.current;

      await waitFor(() => expect(location.search).toContain(`customId=${result.current.tabId}`));
    });

    it("should not navigate if URL already contains the correct ID", () => {
      window.sessionStorage.setItem("tab-id", "xy-9999");

      const wrapperWithInitialUrl = ({ children }: { children: ReactNode }) => (
        <MemoryRouter initialEntries={[`/?tid=xy-9999`]}>{children}</MemoryRouter>
      );

      const render = () => ({ location: useLocation(), tabId: useTabId() });
      const { result } = renderHook(render, { wrapper: wrapperWithInitialUrl });
      const { location, tabId } = result.current;

      expect(tabId).toBe("xy-9999");
      expect(location.search).toBe(`?tid=xy-9999`);
    });

    it("should reload document if reloadDocument is true", async () => {
      const reloadMock = vi.fn();

      Object.defineProperty(window, "location", {
        value: { reload: reloadMock },
        writable: true,
      });

      const render = () => useTabId({ reloadDocument: true });
      renderHook(render, { wrapper });

      await waitFor(() => expect(reloadMock).toHaveBeenCalled());
    });

    it("should return ID from URL query param during server-side rendering simulation", async () => {
      const wrapperWithInitialUrl = ({ children }: { children: ReactNode }) => (
        <MemoryRouter initialEntries={[`/?tid=ss-5555`]}>{children}</MemoryRouter>
      );

      const render = () => ({ location: useLocation(), tabId: useTabId() });
      const { result } = renderHook(render, { wrapper: wrapperWithInitialUrl });
      const { location, tabId } = result.current;

      expect(tabId).toBeDefined();
      expect(tabId).not.toBe("ss-5555");

      await waitFor(() => {
        expect(location.search).toContain(`tid=${tabId}`);
        expect(location.search).not.toContain("ss-5555");
      });
    });

    it("should update ID when storage event is fired from another tab", () => {
      const render = () => useTabId();
      const { result } = renderHook(render, { wrapper });

      // store the initial ID for later comparison
      const initialId = result.current;

      // simulate change via another component
      window.sessionStorage.setItem("tab-id", "xx-9999");

      act(() => {
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "tab-id",
            newValue: "xx-9999",
            storageArea: window.sessionStorage,
          }),
        );
      });

      expect(result.current).toBe("xx-9999");
      expect(result.current).not.toBe(initialId);
    });

    it("should handle server-side snapshot correctly", () => {
      const useSyncExternalStoreSpy = useSyncExternalStore as ReturnType<typeof vi.fn>;

      //
      // case 1: no id in initial url
      //

      renderHook(useTabId, {
        wrapper: ({ children }: { children: ReactNode }) => {
          useSyncExternalStoreSpy.mockClear();
          return <MemoryRouter initialEntries={["/"]}>{children}</MemoryRouter>;
        },
      });

      // useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
      //
      // We want to inspect the `getServerSnapshot` function passed to `useSyncExternalStore`.
      // It is the 3rd argument (index 2).
      //
      // We look at the first call (`calls[0]`) because subsequent re-renders (triggered by useEffect)
      // might pass different arguments or happen after the URL has been updated.

      const args = useSyncExternalStoreSpy.mock.calls[0];
      const getTabIdFromServerFn = args?.[2];

      expect(getTabIdFromServerFn).toBeDefined();
      expect(getTabIdFromServerFn?.()).toBeUndefined();

      //
      // case 2: id in initial url
      //

      renderHook(useTabId, {
        wrapper: ({ children }: { children: ReactNode }) => {
          useSyncExternalStoreSpy.mockClear();
          return <MemoryRouter initialEntries={["/?tid=ss-7777"]}>{children}</MemoryRouter>;
        },
      });

      const argsWithUrl = useSyncExternalStoreSpy.mock.calls[0];
      const getTabIdFromServerWithUrlFn = argsWithUrl?.[2];

      expect(getTabIdFromServerWithUrlFn).toBeDefined();
      expect(getTabIdFromServerWithUrlFn?.()).toBe("ss-7777");
    });
  });
});
