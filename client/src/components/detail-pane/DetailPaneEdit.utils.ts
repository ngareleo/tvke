import type { DetailPaneEditSearchQuery$data } from "~/relay/__generated__/DetailPaneEditSearchQuery.graphql.js";

export type SearchResult = DetailPaneEditSearchQuery$data["searchOmdb"][number];

export const SEARCH_DEBOUNCE_MS = 300;
