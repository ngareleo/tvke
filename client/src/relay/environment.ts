import { Environment, Network, RecordSource, Store, Observable } from "relay-runtime";
import type { FetchFunction, SubscribeFunction } from "relay-runtime";
import { createClient } from "graphql-ws";

const SERVER_URL = "/graphql";

const wsClient = createClient({
  url: `ws://${window.location.host}/graphql`,
});

const fetchFn: FetchFunction = async (operation, variables) => {
  const response = await fetch(SERVER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: operation.text, variables }),
  });
  return response.json();
};

const subscribeFn: SubscribeFunction = (operation, variables) => {
  return Observable.create((sink) => {
    const unsubscribe = wsClient.subscribe(
      { query: operation.text!, variables },
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
