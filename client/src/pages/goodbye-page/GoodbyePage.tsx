/**
 * GoodbyePage — shown after the user confirms sign-out.
 *
 * Full-screen atmospheric treatment (grain + radial glow). Auto-redirects to
 * "/" after 4 seconds; the user can also navigate back immediately.
 * Outside AppShell — no sidebar or header.
 */

import React, { type FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { LogoShield } from "~/lib/icons.js";

import { useGoodbyeStyles } from "./GoodbyePage.styles.js";

const REDIRECT_DELAY = 4;

const GoodbyePage: FC = () => {
  const navigate = useNavigate();
  const styles = useGoodbyeStyles();
  const [countdown, setCountdown] = useState(REDIRECT_DELAY);

  useEffect(() => {
    if (countdown <= 0) {
      void navigate("/", { replace: true });
      return;
    }
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown, navigate]);

  return (
    <div className={styles.root}>
      <div className={styles.grain} />
      <div className={styles.glow} />
      <div className={styles.ghost} aria-hidden="true">
        GOODBYE
      </div>

      <div className={styles.body}>
        <LogoShield />
        <div className={styles.title}>See you next time.</div>
        <div className={styles.sub}>Your library will be right here when you get back.</div>

        <div className={styles.actions}>
          <button
            className={styles.btnRed}
            onClick={() => void navigate("/", { replace: true })}
            type="button"
          >
            Back to home
          </button>
          <span className={styles.countdown}>Redirecting in {countdown}s…</span>
        </div>
      </div>
    </div>
  );
};

export default GoodbyePage;
