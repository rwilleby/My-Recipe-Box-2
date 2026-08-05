# RFIS Development Standards v1.0

## 1. New Recipe Workflow

1. Create and approve the recipe.
2. Assign a permanent recipe code.
3. Add the recipe to the authoritative recipe file.
4. Create the recipe hero.
5. Classify cuisine, protein, role, cooking method, freezer behavior, and reheat method.
6. Assign pairing families and collection tags.
7. Evaluate the recipe for new Complete Dinners.
8. Validate all new references.
9. Package changed files in a small RFIS update.
10. Include the recipe in the next milestone release.

## 2. New Complete Dinner Workflow

1. Select a verified entrée code.
2. Select one or two verified freezer-side codes.
3. Confirm cuisine consistency.
4. Confirm the meal contains reasonable starch and vegetable balance.
5. Define fresh companions.
6. Define optional bread and garnish.
7. Assign collection and occasion tags.
8. Assign stable `CD-####` ID.
9. Assign legacy `MEAL-###` ID where required.
10. Validate against duplicate compositions.
11. Assign hero layout.
12. Add to the hero-production queue.
13. Produce and approve the hero.
14. Calculate nutrition from referenced recipe records.
15. Publish only after QA passes.

## 3. Hero Production Workflow

1. Confirm Complete Dinner status is Approved and Code Validation is PASS.
2. Confirm hero layout.
3. Use the locked container master.
4. Show only freezer components.
5. Preserve exact container size, shape, crop, placement, rim, and background.
6. Produce the 1448 × 1086 creative master.
7. Export 960 × 720 WebP.
8. Export 480 × 360 WebP thumbnail.
9. Record hero version and status.
10. Publish only the optimized web assets.

## 4. Update Package Standard

Each routine ZIP must contain:

```text
Changed project files
INSTALL.txt
CHANGELOG.md
```

`INSTALL.txt` must state:
- Required project baseline
- Exact destination paths
- Whether to replace or add each file
- Testing instructions
- Rollback instructions

`CHANGELOG.md` must state:
- Package name
- Version
- Date
- Files changed
- User-facing changes
- Data changes
- Known limitations

## 5. Naming Standards

### Complete Dinners
- Internal stable ID: `CD-####`
- Legacy ID: `MEAL-###`
- Large hero: `MEAL-###.webp`
- Thumbnail: `MEAL-###-thumb.webp`

### RFIS Packages
Use descriptive names:

```text
RFIS-Foundation-Update-v1.zip
RFIS-Complete-Dinner-UI-v1.zip
RFIS-Pairing-Engine-v1.zip
```

Avoid meaningless sequence-only names.

## 6. Validation Standard

Every RFIS update must verify:
- JavaScript syntax
- Duplicate IDs
- Missing references
- Invalid side counts
- Hero-layout mismatches
- Duplicate compositions
- Broken imports
- Build compatibility when dependencies are available

## 7. Publishing Gate

A feature is not complete until:
- Data is verified
- UI is connected
- Images are optimized
- Existing user data is preserved
- Backup/restore remains functional
- Performance is acceptable
- Rollback instructions exist

## 8. Versioning

Track separately:
- Website version
- RFIS data version
- Image library version
- Recommendation-engine version

A routine data update does not automatically require a full website-version increase.

## 9. Rollback

Routine rollback:
1. Restore the changed files from the prior Git commit or backup.
2. Do not remove user local-storage data.
3. Confirm the legacy page still loads.
4. Re-run validation.

## 10. Acceptance Criteria

A Complete Dinner is accepted only when:
- Recipe codes pass
- Side codes pass
- Pairing is appropriate
- Freezer strategy is defined
- Fresh companion handling is correct
- Hero layout is correct
- No duplicate composition exists
- Nutrition references resolve
- Hero is approved
- Page renders correctly
