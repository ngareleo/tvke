import { mergeClasses } from "@griffel/react";
import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  IconAdjustments,
  IconBookmark,
  IconChat,
  IconChevronLeft,
  IconChevronRight,
  IconFilm,
  IconHome,
  IconSignOut,
  IconSquares,
  IconUser,
  IconWarning,
} from "~/lib/icons.js";

import { useSidebarStyles } from "./Sidebar.styles.js";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

// ─── ProfileMenu ──────────────────────────────────────────────────────────────

interface ProfileMenuProps {
  collapsed: boolean;
  onClose: () => void;
  onSignOut: () => void;
}

const ProfileMenu: FC<ProfileMenuProps> = ({ collapsed, onClose, onSignOut }) => {
  const navigate = useNavigate();
  const styles = useSidebarStyles();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    // Defer so the same click that opened the menu doesn't immediately close it
    const id = setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener("mousedown", handler);
    };
  }, [onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const go = useCallback(
    (path: string): void => {
      navigate(path);
      onClose();
    },
    [navigate, onClose]
  );

  return (
    <div
      ref={ref}
      className={mergeClasses(styles.profileMenu, collapsed && styles.profileMenuCollapsed)}
    >
      {/* User info */}
      <div className={styles.pmUserHead}>
        <div className={styles.pmAvatar}>D</div>
        <div className={styles.pmUserInfo}>
          <div className={styles.pmUserName}>User</div>
          <div className={styles.pmUserEmail}>user@moran.local</div>
        </div>
      </div>

      <div className={styles.pmSectionLabel}>Profiles</div>
      <button className={styles.pmItem} onClick={() => go("/")} type="button">
        <div className={styles.pmItemDot} />
        <span className={styles.pmItemName}>All Libraries</span>
      </button>

      <div className={styles.pmDivider} />

      <button className={styles.pmItem} onClick={() => go("/")} type="button">
        <IconHome size={13} />
        <span className={styles.pmItemName}>Home</span>
      </button>

      <button className={styles.pmItem} onClick={() => go("/settings")} type="button">
        <IconUser size={13} />
        <span className={styles.pmItemName}>Account settings</span>
      </button>

      <div className={styles.pmDivider} />

      <button
        className={mergeClasses(styles.pmItem, styles.pmItemDanger)}
        onClick={() => {
          onClose();
          onSignOut();
        }}
        type="button"
      >
        <IconSignOut size={13} />
        <span className={styles.pmItemName}>Sign out</span>
      </button>
    </div>
  );
};

// ─── SignOutDialog ────────────────────────────────────────────────────────────

interface SignOutDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
}

const SignOutDialog: FC<SignOutDialogProps> = ({ onCancel, onConfirm }) => {
  const styles = useSidebarStyles();
  return (
    <div className={styles.dialogOverlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.dialogIcon}>
          <IconWarning size={20} />
        </div>
        <div className={styles.dialogTitle}>Sign out of Moran?</div>
        <div className={styles.dialogBody}>
          You&apos;ll need to sign back in to access your library. Any active streams will stop.
        </div>
        <div className={styles.dialogActions}>
          <button className={styles.btnGhost} onClick={onCancel} type="button">
            Cancel
          </button>
          <button className={styles.btnDanger} onClick={onConfirm} type="button">
            <IconSignOut size={12} />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export const Sidebar: FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const styles = useSidebarStyles();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  const navClass = ({ isActive }: { isActive: boolean }): string =>
    mergeClasses(
      styles.navItem,
      collapsed && styles.navItemCollapsed,
      isActive && (collapsed ? styles.navItemCollapsedActive : styles.navItemActive)
    );

  const handleSignOut = (): void => {
    setConfirmSignOut(false);
    navigate("/goodbye");
  };

  return (
    <>
      <nav className={mergeClasses(styles.root, collapsed && styles.rootCollapsed)}>
        <NavLink to="/" className={navClass} end>
          <IconSquares
            size={40}
            className={mergeClasses(styles.navCardIcon, collapsed && styles.navCardIconCollapsed)}
          />
          <span className={mergeClasses(styles.navLabel, collapsed && styles.navLabelHidden)}>
            Profiles
          </span>
          {collapsed && (
            <span className={styles.navSideTip} aria-hidden="true">
              Profiles
            </span>
          )}
        </NavLink>

        <NavLink to="/library" className={navClass}>
          <IconFilm
            size={40}
            className={mergeClasses(styles.navCardIcon, collapsed && styles.navCardIconCollapsed)}
          />
          <span className={mergeClasses(styles.navLabel, collapsed && styles.navLabelHidden)}>
            Library
          </span>
          {collapsed && (
            <span className={styles.navSideTip} aria-hidden="true">
              Library
            </span>
          )}
        </NavLink>

        <NavLink to="/watchlist" className={navClass}>
          <IconBookmark
            size={40}
            className={mergeClasses(styles.navCardIcon, collapsed && styles.navCardIconCollapsed)}
          />
          <span className={mergeClasses(styles.navLabel, collapsed && styles.navLabelHidden)}>
            Watchlist
          </span>
          {collapsed && (
            <span className={styles.navSideTip} aria-hidden="true">
              Watchlist
            </span>
          )}
        </NavLink>

        <NavLink to="/settings" className={navClass}>
          <IconAdjustments
            size={40}
            className={mergeClasses(styles.navCardIcon, collapsed && styles.navCardIconCollapsed)}
          />
          <span className={mergeClasses(styles.navLabel, collapsed && styles.navLabelHidden)}>
            Settings
          </span>
          {collapsed && (
            <span className={styles.navSideTip} aria-hidden="true">
              Settings
            </span>
          )}
        </NavLink>

        <NavLink to="/feedback" className={navClass}>
          <IconChat
            size={40}
            className={mergeClasses(styles.navCardIcon, collapsed && styles.navCardIconCollapsed)}
          />
          <span className={mergeClasses(styles.navLabel, collapsed && styles.navLabelHidden)}>
            Feedback
          </span>
          {collapsed && (
            <span className={styles.navSideTip} aria-hidden="true">
              Feedback
            </span>
          )}
        </NavLink>

        <div className={styles.navSpacer} />

        <button
          className={mergeClasses(styles.collapseBtn, collapsed && styles.collapseBtnCollapsed)}
          onClick={onToggle}
          aria-label="Toggle navigation"
          type="button"
        >
          <IconChevronLeft
            size={15}
            className={mergeClasses(
              styles.collapseBtnIcon,
              collapsed && styles.collapseBtnIconRotated
            )}
          />
          {!collapsed && <span className={styles.navLabel}>Collapse</span>}
        </button>

        {/* Profile button */}
        <div className={styles.userWrap}>
          {menuOpen && (
            <ProfileMenu
              collapsed={collapsed}
              onClose={() => setMenuOpen(false)}
              onSignOut={() => setConfirmSignOut(true)}
            />
          )}
          <button
            className={mergeClasses(
              styles.userBtn,
              menuOpen && styles.userBtnMenuOpen,
              collapsed && styles.userBtnCollapsed
            )}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Open profile menu"
            aria-expanded={menuOpen}
            type="button"
          >
            <div className={styles.avatar}>D</div>
            {!collapsed && (
              <>
                <div className={styles.userText}>
                  <div className={styles.userName}>User</div>
                  <div className={styles.userSub}>0 profiles · 0 files</div>
                </div>
                <IconChevronRight
                  size={12}
                  className={mergeClasses(styles.userChevron, menuOpen && styles.userChevronOpen)}
                />
              </>
            )}
          </button>
        </div>
      </nav>

      {confirmSignOut && (
        <SignOutDialog onCancel={() => setConfirmSignOut(false)} onConfirm={handleSignOut} />
      )}
    </>
  );
};
