import { SEARCH_PARAM_KEY } from "../defaults";

export type GetTabIdOptions = {
  /**
   * The query param to check.
   * @default 'tid'
   */
  paramKey?: string;
};

/**
 * Extracts the tab ID from the request URL.
 *
 * @param request The request object to inspect.
 * @param options Configuration options.
 * @returns The tab ID if found, otherwise `undefined`.
 */
export function getTabId(request: Request, options?: GetTabIdOptions): string | undefined {
  const { paramKey = SEARCH_PARAM_KEY } = options ?? {};
  return new URL(request.url).searchParams.get(paramKey) ?? undefined;
}
