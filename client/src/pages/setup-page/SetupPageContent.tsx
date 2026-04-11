import React, { type FC, Suspense } from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";

import type { SetupPageContentQuery } from "~/relay/__generated__/SetupPageContentQuery.graphql.js";
import type { SetupPageContentScanMutation } from "~/relay/__generated__/SetupPageContentScanMutation.graphql.js";

const SETUP_QUERY = graphql`
  query SetupPageContentQuery {
    libraries {
      id
      name
      path
      mediaType
      videos(first: 1) {
        totalCount
      }
    }
  }
`;

const SCAN_MUTATION = graphql`
  mutation SetupPageContentScanMutation {
    scanLibraries {
      id
      name
    }
  }
`;

const SetupPageInner: FC = () => {
  const data = useLazyLoadQuery<SetupPageContentQuery>(SETUP_QUERY, {});
  const [scan, isScanning] = useMutation<SetupPageContentScanMutation>(SCAN_MUTATION);

  const handleScan = (): void => {
    scan({ variables: {} });
  };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Left sidebar */}
      <div
        style={{
          width: 260,
          background: "#0F0F0F",
          borderRight: "1px solid #222",
          padding: 16,
          overflowY: "auto",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#444",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            marginBottom: 16,
            padding: "0 8px",
          }}
        >
          Profiles
        </div>
        {data.libraries.map((lib) => (
          <div
            key={lib.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: 12,
              background: "#1C1C1C",
              border: "1px solid #222",
              borderRadius: 10,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                background: "#CE1126",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: 16,
              }}
            >
              {lib.mediaType === "MOVIES" ? "🎬" : "📺"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                  color: "#fff",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {lib.name}
              </div>
              <div style={{ fontSize: 11, color: "#666" }}>{lib.videos.totalCount} items</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: 48, overflowY: "auto" }}>
        <div style={{ maxWidth: 600 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
            Welcome to Moran
          </h1>
          <p style={{ fontSize: 13, color: "#666", marginBottom: 40, lineHeight: 1.6 }}>
            Profiles are configured in{" "}
            <code style={{ color: "#CE1126", fontSize: 11 }}>mediaFiles.json</code> at the project
            root. Each entry becomes a streaming profile for your library.
          </p>

          <div style={{ marginBottom: 32 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>Your Profiles</span>
                <span
                  style={{
                    background: "#CE1126",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "1px 8px",
                    borderRadius: 100,
                  }}
                >
                  {data.libraries.length}
                </span>
              </div>
              <button
                onClick={handleScan}
                disabled={isScanning}
                style={{
                  padding: "7px 16px",
                  background: "#1C1C1C",
                  border: "1px solid #222",
                  borderRadius: 6,
                  color: isScanning ? "#555" : "#ccc",
                  fontSize: 12,
                  cursor: isScanning ? "not-allowed" : "pointer",
                }}
              >
                {isScanning ? "Scanning…" : "↻ Rescan Libraries"}
              </button>
            </div>

            {data.libraries.length === 0 ? (
              <div
                style={{
                  padding: 32,
                  background: "#0F0F0F",
                  border: "1px dashed #222",
                  borderRadius: 10,
                  textAlign: "center",
                  color: "#555",
                  fontSize: 13,
                }}
              >
                No profiles found. Check your{" "}
                <code style={{ color: "#CE1126", fontSize: 11 }}>mediaFiles.json</code>{" "}
                configuration.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {data.libraries.map((lib) => (
                  <div
                    key={lib.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: 16,
                      background: "#0F0F0F",
                      border: "1px solid #222",
                      borderRadius: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        background: "#CE1126",
                        borderRadius: 6,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontSize: 16,
                      }}
                    >
                      {lib.mediaType === "MOVIES" ? "🎬" : "📺"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{ fontWeight: 600, fontSize: 13, color: "#fff", marginBottom: 2 }}
                      >
                        {lib.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#555",
                          fontFamily: "monospace",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {lib.path}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: "#444" }}>
                      {lib.videos.totalCount} items
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SetupPageContent: FC = () => {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            color: "#666",
          }}
        >
          Loading…
        </div>
      }
    >
      <SetupPageInner />
    </Suspense>
  );
};
