import { defineConfig } from "vitest/config";

/**
 * see: https://vitest.dev/guide/workspace
 */
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "jsdom",
          environment: "jsdom",
          include: ["**/client/**/*.test.(ts|tsx)"],
        },
      },
      {
        test: {
          name: "node",
          environment: "node",
          include: ["**/server/**/*.test.(ts|tsx)"],
        },
      },
    ],
  },
});
