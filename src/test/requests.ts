import { afterEach, beforeEach } from "vitest";

import { server } from "@mocks/server";

export const trackRequests = (): { urls: () => readonly string[] } => {
  const urls: string[] = [];

  const record = ({ request }: { request: Request }) => {
    urls.push(request.url);
  };

  beforeEach(() => {
    urls.length = 0;
    server.events.on("request:start", record);
  });

  afterEach(() => {
    server.events.removeListener("request:start", record);
  });

  return { urls: () => [...urls] };
};
