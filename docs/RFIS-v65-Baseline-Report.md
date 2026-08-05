# RFIS v65 Baseline Reconciliation Report

## Baseline

Authoritative project reviewed: `My-Recipe-Box-v65.zip` uploaded August 5, 2026.

## Installed and confirmed

- RFIS recipe, Complete Dinner, search, collection, recommendation, hero, and validation services
- Unified Search
- Dinner Builder
- Recipe Intelligence Panel
- Related Complete Dinners
- RFIS Project Dashboard
- RFIS specifications and decision log
- Complete Dinner and RFIS platform tests

## Test correction

The UI service-contract fixture marked a Complete Dinner hero as approved without an image path and omitted required hero-layout fields. The production Validation Service correctly rejected that fixture. The fixture has been corrected; validation rules were not weakened.

## Commands

- `npm run test:rfis` runs all RFIS and Complete Dinner service tests.
- `npm run check` runs the RFIS tests and then the Vite production build.

## Packaging safeguards

The included `.gitignore` excludes generated dependencies, build output, logs, and macOS metadata. The scripts remove `.DS_Store`, AppleDouble `._*` files, and `__MACOSX` folders and create a clean milestone ZIP without `node_modules`, `dist`, or Git history.

## Current limitation

A full Vite build must be run on Robert's Mac because the audit environment cannot retrieve `@vitejs/plugin-react` from its internal npm registry. This does not indicate a source-code defect.
