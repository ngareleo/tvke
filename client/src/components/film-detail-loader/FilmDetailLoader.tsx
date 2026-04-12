import { useNovaEventing } from "@nova/react";
import { type FC, useEffect } from "react";
import { graphql, type PreloadedQuery, usePreloadedQuery } from "react-relay";

import { FilmDetailPaneAsync } from "~/components/film-detail-pane/FilmDetailPaneAsync.js";
import type { FilmDetailLoaderQuery } from "~/relay/__generated__/FilmDetailLoaderQuery.graphql.js";

import { createLibraryIdResolvedEvent } from "./FilmDetailLoader.events.js";

// Shared preloaded-query bridge used by any page that opens a film detail pane.
// The caller issues loadQuery(FILM_DETAIL_QUERY, { videoId }) on card-click so
// the network request fires before this component mounts in the Suspense boundary.

export const FILM_DETAIL_QUERY = graphql`
  query FilmDetailLoaderQuery($videoId: ID!) {
    video(id: $videoId) {
      library {
        id
      }
      ...FilmDetailPane_video
    }
  }
`;

interface Props {
  queryRef: PreloadedQuery<FilmDetailLoaderQuery>;
  linking?: boolean;
}

export const FilmDetailLoader: FC<Props> = ({ queryRef, linking = false }) => {
  const data = usePreloadedQuery<FilmDetailLoaderQuery>(FILM_DETAIL_QUERY, queryRef);
  const { bubble } = useNovaEventing();

  const libraryId = data.video?.library?.id;
  useEffect(() => {
    if (libraryId) {
      // Use a synthetic event since this is a data event, not a user interaction.
      // NovaEventing requires a reactEvent; we pass a minimal synthetic object.
      const syntheticEvent = new MouseEvent("load") as unknown as React.MouseEvent;
      void bubble({ reactEvent: syntheticEvent, event: createLibraryIdResolvedEvent(libraryId) });
    }
    // Intentionally only run when libraryId first resolves
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [libraryId]);

  if (!data.video) return null;
  return <FilmDetailPaneAsync video={data.video} linking={linking} />;
};
