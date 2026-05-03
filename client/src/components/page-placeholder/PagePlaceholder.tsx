import { type FC } from "react";

import { usePagePlaceholderStyles } from "./PagePlaceholder.styles.js";

interface PagePlaceholderProps {
  name: string;
  milestone: string;
}

export const PagePlaceholder: FC<PagePlaceholderProps> = ({ name, milestone }) => {
  const styles = usePagePlaceholderStyles();
  return (
    <div className={styles.root}>
      <div className={styles.eyebrow}>release-design migration</div>
      <div className={styles.title}>{name}</div>
      <div className={styles.body}>coming in {milestone}</div>
    </div>
  );
};
