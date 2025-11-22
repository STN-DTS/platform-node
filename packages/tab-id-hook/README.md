# @stn-dts/tab-id-hook

A React hook for managing unique, persistent tab identifiers to enable browser
tab isolation.

## The Problem

In complex web applications, users often open multiple tabs. If your application
relies on shared storage mechanisms like `localStorage` or server-side sessions
without distinguishing between tabs, data from one tab can overwrite data in
another. This "data clobbering" leads to corrupted state and a frustrating user
experience.

## The Solution

`@stn-dts/tab-id-hook` provides a `useTabId()` hook that generates a unique
identifier for each browser tab.

- **Persistence:** The ID is stored in `sessionStorage`, so it survives page
  reloads within the same tab.
- **Isolation:** Since `sessionStorage` is scoped to a single tab, each tab gets
  its own unique ID.
- **URL synchronization:** Optionally syncs the tab ID with a URL query
  parameter to support deep linking and server-side rendering scenarios.

For a deeper dive into the motivation and mechanics, check out the blog post: [A
practical guide to browser tab isolation in React Router
v7](https://stn-dts.github.io/2025/09/05/browser-tab-isolation.html).

## Installation

```bash
pnpm add @stn-dts/tab-id-hook
# or
npm install @stn-dts/tab-id-hook
# or
yarn add @stn-dts/tab-id-hook
```

## Usage

```tsx
import { useTabId } from '@stn-dts/tab-id-hook';

function MyComponent() {
  // Get the unique ID for this tab
  const tabId = useTabId();

  // Use the tabId to scope your data or API requests
  const sessionDataKey = `my-app-data-${tabId}`;

  return (
    <div>
      <p>Current Tab ID: {tabId}</p>
    </div>
  );
}
```

## Server-Side Usage

You can use the `getTabId()` helper to retrieve the tab ID from the request URL
in your server-side loaders or actions.

Here is a contrived but typical example:

```tsx
import { getTabId } from '@stn-dts/tab-id-hook';
import { getSession } from './session'; // Your session management logic

export async function loader({ request }) {
  const tabId = getTabId(request);

  //
  // Important: you must handle cases where the tab ID is missing (e.g., first page load)
  // This typically involves detecting the absence of data in your component and rendering
  // a suspense or spinner component while waiting for the hook to generate a new tab id.
  //

  if (!tabId) { return { /* 🤷 */ }; }

  //
  // Use the tab ID to retrieve isolated data from the session
  //

  const session = await getSession(request);
  const data = session.get(`my-data-${tabId}`);

  return { data };
}
```

## API

### `useTabId(options?)`

Returns the unique tab ID string.

#### Options

| Option              | Type      | Default    | Description                                                                   |
|---------------------|-----------|------------|-------------------------------------------------------------------------------|
| `idSearchParamKey`  | `string`  | `'tid'`    | The query parameter key used for storing the tab id in the URL.               |
| `navigate`          | `boolean` | `true`     | Whether to automatically update the URL with the tab id as a query parameter. |
| `reloadDocument`    | `boolean` | `false`    | Whether to reload the document after navigating (updating the URL).           |
| `sessionStorageKey` | `string`  | `'tab-id'` | The session storage key used for persisting the tab id.                       |

### `getTabId(request, options?)`

Extracts the tab ID from the request URL.

#### Parameters

- `request`: The standard `Request` object.
- `options`:
  - `paramKey`: The query parameter key to check (default: `'tid'`).

### `generateId()`

Helper function that generates a random tab identifier in the format `xx-0000`.

## License

MIT
