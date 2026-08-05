# RFIS Architecture Decision Log

| ID | Decision | Status | Rationale |
|---|---|---|---|
| ADL-001 | Use **Complete Dinners** as the public-facing name. | Locked | Clearly communicates the user benefit. |
| ADL-002 | Use **RFIS — Robert's Food Intelligence System** as the internal architecture name. | Locked | Separates public branding from technical structure. |
| ADL-003 | Keep one authoritative owner for each fact. | Locked | Prevents duplicated and conflicting data. |
| ADL-004 | Reference recipes by code instead of copying recipe content into Complete Dinner records. | Locked | Preserves consistency and reduces maintenance. |
| ADL-005 | Complete Dinners contain one entrée and one or two freezer-compatible sides. | Locked | Supports practical freezer packaging. |
| ADL-006 | Fresh salads, slaws, fruit, pico, guacamole, and similar foods are prepared at serving time. | Locked | Protects freezer quality and texture. |
| ADL-007 | Complete Dinner heroes show only freezer components. | Locked | Keeps imagery honest and consistent. |
| ADL-008 | One-side heroes use approximately a 2/3 entrée and 1/3 side composition. | Locked | Preserves the approved visual standard. |
| ADL-009 | Two-side heroes use the locked approved container composition. | Locked | Maintains consistency across the library. |
| ADL-010 | Visual portioning does not alter nutrition servings. | Locked | Prevents inaccurate nutrition calculations. |
| ADL-011 | Use approximately 70% family-favorite pairings and 30% restaurant-inspired pairings. | Locked | Balances familiarity and variety. |
| ADL-012 | GitHub Pages remains the primary deployment platform. | Locked | Matches the existing Vite/React architecture. |
| ADL-013 | RFIS must run client-side without a required backend. | Locked | Preserves static deployment simplicity. |
| ADL-014 | Keep reference data separate from user data. | Locked | Protects favorites, notes, planners, and inventory during updates. |
| ADL-015 | Use small changed-files-only update packages for routine work. | Locked | Reduces transfer size and overwrite risk. |
| ADL-016 | Produce full website ZIP files only for milestone releases or explicit requests. | Locked | Keeps routine development manageable. |
| ADL-017 | Do not include checksum files in routine update packages. | Locked | Adds little value for the current single-owner workflow. |
| ADL-018 | Use WebP as the standard production format for food heroes. | Locked | Balances quality, compatibility, and file size. |
| ADL-019 | Use 960 × 720 WebP for production recipe and Complete Dinner heroes. | Locked | Supports desktop clarity with manageable storage. |
| ADL-020 | Use 480 × 360 WebP for thumbnails. | Locked | Improves browse and planner performance. |
| ADL-021 | Preserve 1448 × 1086 master files outside the deployed site when practical. | Locked | Supports future reprocessing without bloating GitHub Pages. |
| ADL-022 | Do not publish a Complete Dinner until all referenced codes validate. | Locked | Prevents broken recipe relationships. |
| ADL-023 | Duplicate Complete Dinner compositions are not allowed. | Locked | Preserves catalog variety. |
| ADL-024 | RFIS data is integrated before replacing the legacy live page. | Locked | Prevents incomplete nutrition and UI behavior during migration. |
| ADL-025 | The database is the source of truth; UI and heroes are downstream outputs. | Locked | Keeps all features synchronized. |
