/**
 * NotFound — 404 page
 *
 * Rendered by the catch-all route inside AppShell. Shows a styled 404 with
 * navigation back into the app. The atmospheric treatment (grain + radial
 * gradient) matches the Player's idle overlay so the error state feels like
 * part of the same design language rather than a default browser screen.
 */

import { type FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppHeader } from "../../components/AppHeader/AppHeader.js";
import { IconArrowLeft, IconSearch } from "../../lib/icons.js";
import "./NotFound.css";

export const NotFound: FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <AppHeader collapsed={false} />

      <div className="main">
        <div className="nf-root">
          {/* Atmospheric background */}
          <div className="nf-bg" />
          <div className="nf-grain" />

          <div className="nf-body">
            <div className="nf-code">404</div>
            <div className="nf-title">Page not found</div>
            <div className="nf-sub">
              The page you're looking for doesn't exist or has been moved.
            </div>

            <div className="nf-actions">
              <button className="btn btn-ghost btn-md" onClick={() => navigate(-1)}>
                <IconArrowLeft size={14} />
                Go back
              </button>
              <Link to="/" className="btn btn-red btn-md">
                <IconSearch size={14} />
                Browse library
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
