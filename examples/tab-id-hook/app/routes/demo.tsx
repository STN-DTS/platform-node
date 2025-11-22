import { Form, Link, useLoaderData } from "react-router";
import { useTabId } from "../../../../packages/tab-id-hook/src/client/use-tab-id";
import { getTabId } from "../../../../packages/tab-id-hook/src/server/get-tab-id";
import { getSession, hasSession, updateSession } from "../session.server";
import type { Route } from "./+types/demo";

export async function loader({ request }: Route.LoaderArgs) {
  const tabId = getTabId(request);

  if (!tabId) {
    return { session: null, tabId: null };
  }

  // Artificial delay to demonstrate the "no tab id" state
  // Only apply this delay if we're creating a new session

  if (!hasSession(tabId)) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  const session = await getSession(tabId);
  return { session, tabId };
}

export async function action({ request }: Route.ActionArgs) {
  const tabId = getTabId(request);

  if (!tabId) {
    throw new Response("Tab ID missing", { status: 400 });
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "increment") {
    const session = await getSession(tabId);
    await updateSession(tabId, { count: session.count + 1 });
  }

  return null;
}

export default function Demo() {
  const { session, tabId: serverTabId } = useLoaderData<typeof loader>();

  // Initialize the hook to sync the tab ID with the URL
  const tabId = useTabId();

  return (
    <div className="p-4 font-sans">
      <h1 className="text-2xl font-bold mb-4">Tab ID Session Demo</h1>

      <div className="mb-6 text-sm text-gray-500">
        <Link
          to="/demo"
          target="_blank"
          className="text-blue-600 hover:underline"
        >
          Open this page in a new tab to see a different session.
        </Link>
      </div>

      <div className="mb-6 p-4 border rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
        <h2 className="font-semibold mb-2">Client Side</h2>
        <p>
          Current Tab ID:{" "}
          <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
            {tabId}
          </code>
        </p>
      </div>

      <div className="mb-6 p-4 border rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
        <h2 className="font-semibold mb-2">Server Side</h2>
        <p>
          Received Tab ID:{" "}
          <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
            {serverTabId ?? "None"}
          </code>
        </p>

        {session ? (
          <div className="mt-4">
            <p>Session Data:</p>
            <pre className="bg-gray-800 text-white p-2 rounded mt-2 text-sm">
              {JSON.stringify(session, null, 2)}
            </pre>

            <Form method="post" className="mt-4">
              <button
                type="submit"
                name="intent"
                value="increment"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Increment Count
              </button>
            </Form>
          </div>
        ) : (
          <div className="mt-2">
            <p className="text-yellow-600">
              No session loaded yet. The URL needs to be updated with the tab
              ID. The useTabId hook should handle this automatically.
            </p>
            <p className="text-gray-500 text-sm mt-2 italic">
              (An artificial delay of 5s is added when creating a new session so
              you can observe this state)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
