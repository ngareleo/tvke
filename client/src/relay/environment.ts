import { context } from "@opentelemetry/api";
import { createClient } from "graphql-ws";
import type { FetchFunction, SubscribeFunction } from "relay-runtime";
import { Environment, Network, Observable, RecordSource, Store } from "relay-runtime";

import { graphqlHttpUrl, graphqlWsUrl, isRustBackendEnabled } from "~/config/rustOrigin.js";
import { getSessionContext } from "~/services/playbackSession.js";

const SERVER_URL = graphqlHttpUrl();
const WS_URL = graphqlWsUrl();

if (isRustBackendEnabled()) {
  // One-line breadcrumb so it's obvious in the dev console which backend
  // is active. Surfacing this here (rather than waiting for a Settings
  // render) means a quick refresh confirms the flag took effect.
  // eslint-disable-next-line no-console
  console.warn(`[useRustBackend] Routing GraphQL + /stream to ${SERVER_URL}`);
}

const wsClient = createClient({ url: WS_URL });

const fetchFn: FetchFunction = async (operation, variables) => {
  // Wrap fetch in the active session context so FetchInstrumentation injects
  // the correct traceparent, linking GraphQL mutations to the playback trace.
  const response = await context.with(getSessionContext(), () =>
    fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: operation.text, variables }),
    })
  );
  return response.json();
};

const subscribeFn: SubscribeFunction = (operation, variables) => {
  return Observable.create((sink) => {
    const unsubscribe = wsClient.subscribe(
      { query: operation.text ?? "", variables },
      {
        next: (data) => sink.next(data as Parameters<typeof sink.next>[0]),
        error: sink.error.bind(sink),
        complete: sink.complete.bind(sink),
      }
    );
    return () => unsubscribe();
  });
};

export const environment = new Environment({
  network: Network.create(fetchFn, subscribeFn),
  store: new Store(new RecordSource()),
});
