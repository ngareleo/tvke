/**
 * ErrorBoundary — catches unhandled render errors and shows a recovery screen.
 *
 * Two modes driven by import.meta.env.DEV:
 *
 *   DEV   — full stack trace + React component stack in a scrollable code block,
 *            copy-to-clipboard, and a "reload" escape hatch.
 *
 *   PROD  — friendly "something went wrong" screen with just a Retry button and
 *            no internal details exposed to the user.
 *
 * Usage — wrap the entire app in main.tsx:
 *   <ErrorBoundary>
 *     <BrowserRouter>
 *       <App />
 *     </BrowserRouter>
 *   </ErrorBoundary>
 *
 * The boundary resets when the user clicks "Try again", which re-mounts the
 * subtree. For navigation-triggered resets (e.g. clicking a sidebar link after
 * an error) wire resetKeys to the current pathname.
 */

import { Component, type ErrorInfo, type FC, type ReactNode, useState } from "react";
import { IconBug, IconRefresh, IconClose, LogoShield } from "../../lib/icons.js";
import "./ErrorBoundary.css";

// ── DevErrorScreen ────────────────────────────────────────────────────────────
// Shows in development mode: full error message, JS stack, React component stack.

const DevErrorScreen: FC<{
  error: Error;
  errorInfo: ErrorInfo;
  onReset: () => void;
}> = ({ error, errorInfo, onReset }) => {
  const [copied, setCopied] = useState(false);

  const fullText = [
    `${error.name}: ${error.message}`,
    "",
    "── JavaScript stack ─────────────────────────",
    error.stack ?? "(no stack)",
    "",
    "── React component stack ────────────────────",
    errorInfo.componentStack?.trim() ?? "(no component stack)",
  ].join("\n");

  const handleCopy = () => {
    void navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="eb-root eb-dev">
      <div className="eb-grain" />

      <div className="eb-panel">
        {/* Header */}
        <div className="eb-head">
          <div className="eb-head-left">
            <span className="eb-icon-wrap">
              <IconBug size={16} />
            </span>
            <div>
              <div className="eb-label">Unhandled render error</div>
              <div className="eb-error-name">{error.name}</div>
            </div>
          </div>
          <div className="eb-head-actions">
            <button className="eb-action-btn" onClick={handleCopy} title="Copy error to clipboard">
              {copied ? "Copied!" : "Copy"}
            </button>
            <button className="eb-action-btn eb-action-primary" onClick={onReset}>
              <IconRefresh size={12} />
              Try again
            </button>
            <button className="eb-action-btn" onClick={() => window.location.reload()} title="Hard reload">
              Reload page
            </button>
          </div>
        </div>

        {/* Error message */}
        <div className="eb-message">{error.message}</div>

        {/* JS stack */}
        <div className="eb-section-label">JavaScript stack</div>
        <pre className="eb-code">{error.stack}</pre>

        {/* React component stack */}
        {errorInfo.componentStack && (
          <>
            <div className="eb-section-label">React component stack</div>
            <pre className="eb-code eb-component-stack">
              {errorInfo.componentStack.trim()}
            </pre>
          </>
        )}
      </div>
    </div>
  );
};

// ── ProdErrorScreen ───────────────────────────────────────────────────────────
// Shows in production mode: minimal, friendly, no internal detail.

const ProdErrorScreen: FC<{ onReset: () => void }> = ({ onReset }) => (
  <div className="eb-root eb-prod">
    <div className="eb-grain" />
    <div className="eb-prod-body">
      <LogoShield />
      <div className="eb-prod-title">Something went wrong</div>
      <div className="eb-prod-sub">
        Moran ran into an unexpected problem. Your library and playback data
        are safe — this is a display issue only.
      </div>
      <div className="eb-prod-actions">
        <button className="btn btn-red btn-md" onClick={onReset}>
          <IconRefresh size={14} />
          Try again
        </button>
        <button
          className="btn btn-ghost btn-md"
          onClick={() => window.location.reload()}
        >
          <IconClose size={14} />
          Reload page
        </button>
      </div>
    </div>
  </div>
);

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
    // In production you'd log to Sentry / DataDog here:
    // logErrorToService(error, errorInfo);
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;

    if (!hasError || !error) return this.props.children;

    if (import.meta.env.DEV) {
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
