import { beforeAll } from "vitest";
import { setProjectAnnotations } from "@storybook/react-vite";

import * as previewAnnotations from "./preview.js";

const annotations = setProjectAnnotations([previewAnnotations]);

beforeAll(annotations.beforeAll);
