/**
 * ErrorBoundary — catches unhandled render errors and shows a recovery screen.
 *
 * Two modes driven by process.env.NODE_ENV:
 *
 *   DEV   — full stack trace + React component stack in a scrollable code block,
 *            copy-to-clipboard, and a "reload" escape hatch.
 *            Includes a "Preview customer view" toggle so devs can see exactly
 *            what a customer would see without switching to prod.
 *
 *   PROD  — customer-facing help page: friendly guidance, actionable steps,
 *            and a support contact. No internal details exposed.
 *
 * Usage — wrap the entire app in main.tsx:
 *   <ErrorBoundary>
 *     <RouterProvider router={router} />
 *   </ErrorBoundary>
 */

import { mergeClasses } from "@griffel/react";
import { Component, type ErrorInfo, type FC, type ReactNode, useState } from "react";

import { IconBug, IconChat, IconClose, IconRefresh, LogoShield } from "~/lib/icons.js";

import { useErrorBoundaryStyles } from "./ErrorBoundary.styles.js";

// ── DevErrorScreen ────────────────────────────────────────────────────────────

const DevErrorScreen: FC<{
  error: Error;
  errorInfo: ErrorInfo;
  onReset: () => void;
}> = ({ error, errorInfo, onReset }) => {
  const [copied, setCopied] = useState(false);
  const [previewProd, setPreviewProd] = useState(false);
  const styles = useErrorBoundaryStyles();

  const fullText = [
    `${error.name}: ${error.message}`,
    "",
    "── JavaScript stack ─────────────────────────",
    error.stack ?? "(no stack)",
    "",
    "── React component stack ────────────────────",
    errorInfo.componentStack?.trim() ?? "(no component stack)",
  ].join("\n");

  const handleCopy = (): void => {
    void navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (previewProd) {
    return (
      <div style={{ position: "relative" }}>
        <div className={styles.previewBanner}>
          <span className={styles.previewLabel}>DEV PREVIEW</span>
          <span className={styles.previewSub}>Customer view — no stack traces are shown below</span>
          <button
            className={mergeClasses(styles.actionBtn, styles.previewBack)}
            onClick={() => setPreviewProd(false)}
          >
            ← Back to dev view
          </button>
        </div>
        <ProdErrorScreen onReset={onReset} />
      </div>
    );
  }

  return (
    <div className={mergeClasses(styles.root, styles.devRoot)}>
      <div className={styles.grain} />

      <div className={styles.panel}>
        <div className={styles.head}>
          <div className={styles.headLeft}>
            <span className={styles.iconWrap}>
              <IconBug size={16} />
            </span>
            <div>
              <div className={styles.label}>Unhandled render error</div>
              <div className={styles.errorName}>{error.name}</div>
            </div>
          </div>
          <div className={styles.headActions}>
            <button
              className={mergeClasses(styles.actionBtn, styles.actionPreview)}
              onClick={() => setPreviewProd(true)}
              title="See what a customer would see"
            >
              Preview customer view
            </button>
            <button
              className={styles.actionBtn}
              onClick={handleCopy}
              title="Copy error to clipboard"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              className={mergeClasses(styles.actionBtn, styles.actionPrimary)}
              onClick={onReset}
            >
              <IconRefresh size={12} />
              Try again
            </button>
            <button
              className={styles.actionBtn}
              onClick={() => window.location.reload()}
              title="Hard reload"
            >
              Reload page
            </button>
          </div>
        </div>

        <div className={styles.message}>{error.message}</div>

        <div className={styles.sectionLabel}>JavaScript stack</div>
        <pre className={styles.code}>{error.stack}</pre>

        {errorInfo.componentStack && (
          <>
            <div className={styles.sectionLabel}>React component stack</div>
            <pre className={mergeClasses(styles.code, styles.componentStack)}>
              {errorInfo.componentStack.trim()}
            </pre>
          </>
        )}
      </div>
    </div>
  );
};

// ── ProdErrorScreen ───────────────────────────────────────────────────────────

const ProdErrorScreen: FC<{ onReset: () => void }> = ({ onReset }) => {
  const styles = useErrorBoundaryStyles();
  return (
    <div className={mergeClasses(styles.root, styles.prodRoot)}>
      <div className={styles.grain} />
      <div className={styles.prodBody}>
        <LogoShield />
        <div className={styles.prodTitle}>Something went wrong</div>
        <div className={styles.prodSub}>
          Moran ran into an unexpected problem. Your library and watchlist are safe — this is a
          display issue only.
        </div>

        <div className={styles.prodSteps}>
          <div className={styles.prodStepLabel}>Things to try</div>
          <div className={styles.prodStep}>
            <span className={styles.prodStepNum}>1</span>
            <div className={styles.prodStepBody}>
              <span className={styles.prodStepEmphasis}>Retry</span> — tap the button below to
              reload just this screen without a full page refresh.
            </div>
          </div>
          <div className={styles.prodStep}>
            <span className={styles.prodStepNum}>2</span>
            <div className={styles.prodStepBody}>
              <span className={styles.prodStepEmphasis}>Reload the page</span> — a full browser
              reload clears any stale state.
            </div>
          </div>
          <div className={styles.prodStep}>
            <span className={styles.prodStepNum}>3</span>
            <div className={styles.prodStepBody}>
              <span className={styles.prodStepEmphasis}>Clear your cache</span> — open your
              browser&apos;s history settings, clear cached files, then reload.
            </div>
          </div>
        </div>

        <div className={styles.prodActions}>
          <button className={styles.btnPrimary} onClick={onReset}>
            <IconRefresh size={14} />
            Try again
          </button>
          <button className={styles.btnGhost} onClick={() => window.location.reload()}>
            <IconClose size={14} />
            Reload page
          </button>
        </div>

        <div className={styles.prodContact}>
          <IconChat size={13} />
          <span>Still having trouble? Contact your system administrator.</span>
        </div>
      </div>
    </div>
  );
};

// ── ErrorBoundary (class) ─────────────────────────────────────────────────────

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface Props {
  children: ReactNode;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  handleReset = (): void => {
    (window as unknown as { __devToolsReset?: () => void }).__devToolsReset?.();
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;

    if (!hasError || !error) return this.props.children;

    if (process.env.NODE_ENV !== "production") {
      return (
        <DevErrorScreen
          error={error}
          errorInfo={errorInfo ?? { componentStack: null }}
          onReset={this.handleReset}
        />
      );
    }

    return <ProdErrorScreen onReset={this.handleReset} />;
  }
}
