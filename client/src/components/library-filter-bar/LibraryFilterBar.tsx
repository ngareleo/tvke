import { mergeClasses } from "@griffel/react";
import { useNovaEventing } from "@nova/react";
import { type FC } from "react";

import { IconBars, IconSquares } from "~/lib/icons.js";

import {
  createSearchChangedEvent,
  createTypeFilterChangedEvent,
  createViewChangedEvent,
  type TypeFilter,
} from "./LibraryFilterBar.events.js";
import { strings } from "./LibraryFilterBar.strings.js";
import { useLibraryFilterBarStyles } from "./LibraryFilterBar.styles.js";

export type { TypeFilter };

interface Props {
  search: string;
  typeFilter: TypeFilter;
  isGrid: boolean;
  count: number;
}

export const LibraryFilterBar: FC<Props> = ({ search, typeFilter, isGrid, count }) => {
  const styles = useLibraryFilterBarStyles();
  const { bubble } = useNovaEventing();

  return (
    <div className={styles.filterBar}>
      <input
        className={styles.searchInput}
        placeholder={strings.searchPlaceholder}
        value={search}
        onChange={(e) => {
          void bubble({
            reactEvent: e as unknown as React.MouseEvent,
            event: createSearchChangedEvent(e.target.value),
          });
        }}
      />
      <div className={styles.filterSep} />
      <select
        className={styles.filterSelect}
        value={typeFilter}
        onChange={(e) => {
          void bubble({
            reactEvent: e as unknown as React.MouseEvent,
            event: createTypeFilterChangedEvent(e.target.value as TypeFilter),
          });
        }}
      >
        <option value="all">{strings.filterAll}</option>
        <option value="MOVIES">{strings.filterMovies}</option>
        <option value="TV_SHOWS">{strings.filterTvShows}</option>
      </select>
      <div className={styles.filterSep} />
      <button
        className={mergeClasses(styles.toggleBtn, isGrid && styles.toggleBtnActive)}
        onClick={(e) => {
          void bubble({ reactEvent: e, event: createViewChangedEvent(true) });
        }}
        title={strings.gridViewTitle}
        type="button"
      >
        <IconSquares size={13} />
      </button>
      <button
        className={mergeClasses(styles.toggleBtn, !isGrid && styles.toggleBtnActive)}
        onClick={(e) => {
          void bubble({ reactEvent: e, event: createViewChangedEvent(false) });
        }}
        title={strings.listViewTitle}
        type="button"
      >
        <IconBars size={13} />
      </button>
      <span className={styles.filterCount}>
        {count} {count !== 1 ? strings.titlePlural : strings.titleSingular}
      </span>
    </div>
  );
};
