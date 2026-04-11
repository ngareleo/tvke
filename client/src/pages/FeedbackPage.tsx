import { makeStyles } from "@griffel/react";
import React, { type FC, useState } from "react";

import { tokens } from "~/styles/tokens.js";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 24px",
    overflow: "auto",
  },
  card: {
    width: "100%",
    maxWidth: "480px",
    backgroundColor: tokens.colorSurface,
    border: `1px solid ${tokens.colorBorder}`,
    borderRadius: tokens.radiusLg,
    padding: "28px",
  },
  heading: {
    fontFamily: tokens.fontHead,
    fontSize: "26px",
    letterSpacing: "0.06em",
    color: tokens.colorWhite,
    marginBottom: "4px",
  },
  sub: {
    fontSize: "12px",
    color: tokens.colorMuted,
    marginBottom: "24px",
    lineHeight: "1.6",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "16px",
  },
  label: {
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: tokens.colorMuted2,
  },
  select: {
    width: "100%",
    padding: "9px 12px",
    backgroundColor: tokens.colorSurface2,
    border: `1px solid ${tokens.colorBorder}`,
    borderRadius: tokens.radiusSm,
    color: tokens.colorWhite,
    fontSize: "12px",
    fontFamily: tokens.fontBody,
    outlineStyle: "none",
    cursor: "pointer",
    appearance: "none",
    boxSizing: "border-box",
    ":focus": {
      border: `1px solid ${tokens.colorRed}`,
    },
  },
  textarea: {
    width: "100%",
    padding: "9px 12px",
    backgroundColor: tokens.colorSurface2,
    border: `1px solid ${tokens.colorBorder}`,
    borderRadius: tokens.radiusSm,
    color: tokens.colorWhite,
    fontSize: "12px",
    fontFamily: tokens.fontBody,
    outlineStyle: "none",
    resize: "vertical",
    minHeight: "120px",
    lineHeight: "1.6",
    boxSizing: "border-box",
    ":focus": {
      border: `1px solid ${tokens.colorRed}`,
    },
    "::placeholder": {
      color: tokens.colorMuted2,
    },
  },
  submitBtn: {
    width: "100%",
    padding: "10px 0",
    backgroundColor: tokens.colorRed,
    border: `1px solid ${tokens.colorRed}`,
    borderRadius: tokens.radiusSm,
    color: tokens.colorWhite,
    fontSize: "13px",
    fontWeight: "700",
    letterSpacing: "0.04em",
    cursor: "pointer",
    transitionProperty: "background",
    transitionDuration: tokens.transition,
    ":hover": {
      backgroundColor: tokens.colorRedDark,
    },
    ":disabled": {
      opacity: "0.5",
      cursor: "default",
    },
  },
  successMsg: {
    fontSize: "12px",
    color: tokens.colorGreen,
    marginTop: "12px",
    textAlign: "center",
  },
  hidden: {
    display: "none",
  },
});

type Category = "bug" | "feature" | "other";

export const FeedbackPage: FC = () => {
  const styles = useStyles();
  const [category, setCategory] = useState<Category>("bug");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (): void => {
    if (!message.trim()) return;
    window.alert("Thanks for your feedback!");
    setMessage("");
    setCategory("bug");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.heading}>Feedback</div>
        <div className={styles.sub}>
          Found a bug or have an idea? Let us know. We read everything.
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="category">
            Category
          </label>
          <select
            id="category"
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            <option value="bug">Bug Report</option>
            <option value="feature">Feature Request</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            className={styles.textarea}
            placeholder="Describe the issue or idea…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={!message.trim()}
          type="button"
        >
          Submit Feedback
        </button>

        {submitted && <div className={styles.successMsg}>Thanks — your feedback was received!</div>}
      </div>
    </div>
  );
};
