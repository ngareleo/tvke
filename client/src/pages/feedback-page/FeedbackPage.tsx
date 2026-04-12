import React, { type FC, useState } from "react";

import { useFeedbackStyles } from "./FeedbackPage.styles.js";

type Category = "bug" | "feature" | "other";

export const FeedbackPage: FC = () => {
  const styles = useFeedbackStyles();
  const [category, setCategory] = useState<Category>("bug");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (): void => {
    if (!message.trim()) return;
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
