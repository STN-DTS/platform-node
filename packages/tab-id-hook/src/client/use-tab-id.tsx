import { useEffect, useSyncExternalStore } from "react";

import { useLocation, useNavigate } from "react-router";
import { SEARCH_PARAM_KEY, SESSION_STORAGE_KEY } from "../defaults";

/**
 * Configuration options for the `useTabId` hook.
 */
export type UseTabIdOptions = {
  /**
   * The query parameter key used for storing the tab id in the URL.
   * @default 'tid'
   */
  idSearchParamKey?: string;
  /**
   * Whether to automatically update the URL with the tab id as a query parameter.
   * @default true
   */
  navigate?: boolean;
  /**
   * Whether to reload the document after navigating.
   * @default false
   */
  reloadDocument?: boolean;
  /**
   * The session storage key used for persisting the tab id.
   * @default 'tab-id'
   */
  sessionStorageKey?: string;
};

/**
 * React hook that provides a unique, persistent identifier for the current browser tab.
 *
 * - The id persists across page reloads but resets when the tab is closed.
 * - If `navigate` is enabled (default: `true`), the hook ensures the id is present in the URL.
 * - The id is stored in `sessionStorage`, ensuring it remains unique per tab.
 * - Uses `useSyncExternalStore` to listen for changes in session storage and re-render accordingly.
 *
 * @param options Configuration options for customizing behavior.
 * @returns The unique tab id for the current browser tab. It may be `undefined` during server-side rendering if the ID is not present in the URL.
 */
export function useTabId(options?: UseTabIdOptions): string | undefined {
  const {
    idSearchParamKey = SEARCH_PARAM_KEY,
    navigate = true,
    reloadDocument = false,
    sessionStorageKey = SESSION_STORAGE_KEY,
  } = options ?? {};

  const { search } = useLocation();
  const navigateFn = useNavigate();

  const idSearchParam = new URLSearchParams(search).get(idSearchParamKey);

  //
  // Use useSyncExternalStore() to subscribe to session storage changes.
  //
  // This ensures that if the tab ID is modified externally
  // (or by another component), this hook will trigger a re-render with the new value.
  //

  const id = useSyncExternalStore(
    (callback) => subscribe(sessionStorageKey, callback),
    () => getSnapshot(sessionStorageKey), // client-side snapshot: read from session storage (or generate new)
    () => idSearchParam ?? undefined, // server-side snapshot: read from URL query param
  );

  //
  // Sync the URL with the session storage ID
  //

  useEffect(() => {
    if (navigate) {
      // if we have a valid ID and it doesn't match the current URL param, update the URL
      if (id !== undefined && id !== idSearchParam) {
        const urlSearchParams = new URLSearchParams(search);
        urlSearchParams.set(idSearchParamKey, id);

        // update the URL using { replace: true } to avoid polluting the history stack
        //
        // we wrap in Promise.resolve() to handle potential async nature of
        // navigation or to ensure the reload happens in the next tick
        void Promise.resolve(navigateFn({ search: urlSearchParams.toString() }, { replace: true })).then(() => {
          if (reloadDocument) {
            window.location.reload();
          }
        });
      }
    }
  }, [id, navigate, navigateFn, search, idSearchParamKey, reloadDocument]);

  return id;
}

/**
 * Generates a random tab identifier in the format `xx-0000`.
 * This ID is designed to be short yet sufficiently unique for identifying tabs within a single browser session.
 *
 * @returns A string in the format `[a-z]{2}-[0-9]{4}`.
 */
export function generateId(): string {
  const prefix = randomString(2, "abcdefghijklmnopqrstuvwxyz");
  const suffix = randomString(4, "0123456789");
  return `${prefix}-${suffix}`;
}

/**
 * Generates a random string of a specified length using a given set of allowed characters.
 *
 * @param len The length of the string to generate.
 * @param allowedChars A string containing all characters allowed in the result. Defaults to alphanumeric (lowercase).
 * @returns The generated random string.
 */
function randomString(len: number, allowedChars = "0123456789abcdefghijklmnopqrstuvwxyz") {
  const toRandomChar = () => allowedChars[Math.floor(Math.random() * allowedChars.length)];
  return Array(len).fill(undefined).map(toRandomChar).join("");
}

/**
 * Retrieves the current tab ID from session storage.
 * If no ID exists, a new one is generated and stored.
 *
 * This function serves as the `getSnapshot()` callback for `useSyncExternalStore`.
 *
 * @param sessionStorageKey The key used to access session storage.
 * @returns The persistent tab ID.
 */
function getSnapshot(sessionStorageKey: string): string {
  const id = window.sessionStorage.getItem(sessionStorageKey) ?? generateId();
  window.sessionStorage.setItem(sessionStorageKey, id); // store the id to persist it across reloads
  return id;
}

/**
 * Subscribes to the global `storage` event to detect changes to the tab ID.
 *
 * This function serves as the `subscribe` callback for `useSyncExternalStore()`.
 * Note: The `storage` event typically only fires when storage is modified in *another* document (tab/window),
 * but `useSyncExternalStore()` handles the current tab's updates via the snapshot comparison.
 *
 * @param sessionStorageKey The key to listen for changes on.
 * @param callback The function to call when the storage key changes.
 * @returns A cleanup function to remove the event listener.
 */
function subscribe(sessionStorageKey: string, callback: () => void): () => void {
  const handler = ({ key }: StorageEvent): void => {
    if (key === sessionStorageKey) {
      callback(); // trigger a state update only if the session storage key changes
    }
  };

  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
