/**
 * The MSW request interceptor used by the Vitest suite (see
 * `vitest.setup.ts`, which starts it with `onUnhandledRequest: "error"` so
 * any request the handlers don't cover fails the test loudly instead of
 * silently reaching the real network).
 */
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
