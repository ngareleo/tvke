# Migrations

Time-bounded migration projects that span multiple existing domains. Each subfolder is one migration effort; its README summarises scope, status, and links to the layer-by-layer docs inside.

Migrations are bounded by definition — once an effort lands, its docs either retire (replaced by the new normal in the architecture/ + client/ + server/ tree) or are kept as a historical reference. They are NOT a permanent home for any concept; cross-cutting concepts that survive a migration belong in `architecture/`. Cross-cutting policy that future ports inherit (e.g. the "tests travel with the port" rule) lives in [`docs/code-style/`](../code-style/README.md).

## Active migrations

None currently. The Prerelease (Moran) → Release (Xstream) client redesign completed M0–M10 and is ready to retire post-merge; see the archive note below.

## Retired migrations (archive)

| Folder | Hook |
|---|---|
| [`release-design/`](release-design/README.md) | Prerelease (Moran) → Release (Xstream) client redesign. **Complete as of 2026-05-03 (M10).** Per-component spec + porting checklist shipped in M0–M9; catalog finalised in M10 with 122 client tests + 282 server tests. Folder will retire post-merge. Visuals live in `design/Release/`; this folder is the portable spec for the now-complete port to `client/src/`. Porting-Guide and Schema-Changes docs may migrate to `docs/code-style/` as reference material if future client rewrites need them. |
