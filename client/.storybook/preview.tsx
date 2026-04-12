import type { Preview } from "storybook-react-rsbuild";
import React, { Suspense } from "react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import { withRelay } from "../src/storybook/withRelay.js";

const preview: Preview = {
  decorators: [
    withRelay,
    (Story, context) => {
      const initialEntries: string[] = context.parameters.router?.initialEntries ?? ["/"];
      // createMemoryRouter (data router) is required so that hooks like
      // useNavigation() and useLocation() work inside stories. Plain
      // MemoryRouter does not create a data-router context.
      const router = createMemoryRouter(
        [{ path: "*", element: <Suspense fallback={<div style={{ padding: 16, color: "#aaa" }}>Loading…</div>}><Story /></Suspense> }],
        { initialEntries }
      );
      return <RouterProvider router={router} />;
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#1a1a1a" },
        { name: "light", value: "#ffffff" },
      ],
    },
  },
};

export default preview;
