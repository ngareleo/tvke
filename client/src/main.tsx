import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { mapEventMetadata, NovaEventingProvider } from "@nova/react";
import type { EventWrapper } from "@nova/types";
import React, { type FC, type ReactNode, useMemo } from "react";
import ReactDOM from "react-dom/client";
import { RelayEnvironmentProvider } from "react-relay";
import { RouterProvider } from "react-router-dom";

import { environment } from "./relay/environment.js";
import { router } from "./router.js";

/**
 * Root eventing handler. Lives inside RelayEnvironmentProvider + ChakraProvider
 * so that the bubble handler has access to Relay and Chakra contexts when needed
 * (e.g. to dispatch Relay mutations or show Chakra toasts in response to events).
 *
 * Components handle their own events via NovaEventingInterceptor closer to the
 * source; this provider is the terminal handler for any event not consumed there.
 */
const AppEventing: FC<{ children: ReactNode }> = ({ children }) => {
  const eventing = useMemo(
    () => ({
      bubble: (_event: EventWrapper): Promise<void> => Promise.resolve(),
    }),
    []
  );

  return (
    <NovaEventingProvider eventing={eventing} reactEventMapper={mapEventMetadata}>
      {children}
    </NovaEventingProvider>
  );
};

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found");

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <RelayEnvironmentProvider environment={environment}>
      <ChakraProvider value={defaultSystem}>
        <AppEventing>
          <RouterProvider router={router} />
        </AppEventing>
      </ChakraProvider>
    </RelayEnvironmentProvider>
  </React.StrictMode>
);
