import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { mapEventMetadata, NovaEventingProvider } from "@nova/react";
import type { EventWrapper } from "@nova/types";
import React from "react";
import ReactDOM from "react-dom/client";
import { RelayEnvironmentProvider } from "react-relay";
import { RouterProvider } from "react-router-dom";

import { environment } from "./relay/environment.js";
import { router } from "./router.js";

// Root eventing handler. Components handle their own events via NovaEventingInterceptor;
// this provider is the terminal handler for any events that are not consumed by an interceptor.
const rootEventing = {
  bubble: (_event: EventWrapper): Promise<void> => Promise.resolve(),
};

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found");

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <NovaEventingProvider eventing={rootEventing} reactEventMapper={mapEventMetadata}>
      <RelayEnvironmentProvider environment={environment}>
        <ChakraProvider value={defaultSystem}>
          <RouterProvider router={router} />
        </ChakraProvider>
      </RelayEnvironmentProvider>
    </NovaEventingProvider>
  </React.StrictMode>
);
