# RFIS Master Specification v1.0

## 1. Purpose

RFIS—Robert's Food Intelligence System—is the internal data and rules architecture that powers Robert's Recipe Box. It connects recipes, Complete Dinners, pairings, collections, freezer guidance, recommendations, planning, and future inventory features while remaining compatible with a static Vite/React website deployed on GitHub Pages.

Public-facing terminology remains **Complete Dinners**. The term **combo meal** may remain in legacy code or migration fields only.

## 2. Core Principles

1. **One Source Rule**  
   Each fact has one authoritative owner and is referenced elsewhere by ID.

2. **Data Before UI**  
   Data structures and validation are completed before user-interface integration.

3. **Reference Data vs. User Data**  
   Reference data ships with the website. User data stays in browser storage and is protected during site updates.

4. **GitHub Pages First**  
   RFIS must remain client-side, static-deployable, and performant without a required server database.

5. **Incremental Releases**  
   Routine work uses small changed-files-only update packages. Full website ZIP files are milestone releases only.

## 3. Core Objects

### 3.1 Recipe
Authoritative owner of:
- Recipe code
- Recipe name
- Category
- Ingredients
- Directions
- Cooking time
- Nutrition
- Recipe hero
- Recipe-specific freezer and reheating notes

### 3.2 Recipe Intelligence
Owns:
- Cuisine
- Protein
- Meal role
- Cooking method
- Freezer rating
- Reheat method
- MealBalance classification
- Occasion tags
- Pairing families
- Collection memberships
- Recommendation metadata

### 3.3 Complete Dinner
References recipe IDs and owns:
- Stable Complete Dinner ID
- Legacy meal ID
- Display name
- Entrée reference
- One or two freezer-compatible side references
- Fresh companion
- Optional bread
- Garnish
- Cuisine
- Collection
- Hero metadata
- Packaging notes
- Reheating strategy
- Chef's notes
- Leftover ideas
- Publish state

### 3.4 Side Intelligence
Owns:
- Side family
- Freezer behavior
- Reheating behavior
- Compatible cuisines
- Compatible proteins
- Fresh-companion status
- Usage frequency
- Pairing recommendations

### 3.5 Collection
Represents reusable editorial or logical groupings such as:
- American & Comfort
- Italian
- Mexican & Southwest
- Asian
- Seafood
- BBQ
- Light & Healthy
- Sunday Dinner
- Company Worthy
- Freezer Champions
- Seasonal and holiday collections

### 3.6 Occasion
Represents serving context such as:
- Weeknight
- Sunday Dinner
- Holiday
- Game Day
- Summer Cookout
- Company Dinner
- Potluck
- Date Night

### 3.7 Equipment
Represents equipment relevant to cooking or reheating:
- Microwave
- Air fryer
- Oven
- Stovetop
- Grill
- Smoker
- Slow cooker

### 3.8 User Data
Stored separately from RFIS reference data:
- Favorites
- Notes
- Planner entries
- Shopping lists
- Pantry inventory
- Freezer inventory
- Last made
- Personal ratings
- Backup metadata

## 4. Relationship Model

- One recipe may belong to many Complete Dinners.
- One Complete Dinner must reference one entrée and one or two freezer sides.
- One side may pair with many entrées.
- One Complete Dinner may belong to many collections.
- One recipe may have many occasion tags.
- One recipe may have many leftover ideas.
- One Complete Dinner may have multiple fresh companions, breads, and garnishes.
- Nutrition is never duplicated inside a Complete Dinner record; it is calculated from referenced recipe records.

## 5. Complete Dinner Rules

### 5.1 Composition
A Complete Dinner contains:
- One featured entrée
- One or two freezer-compatible sides
- Optional fresh companion
- Optional bread
- Optional garnish

### 5.2 Pairing Philosophy
- Approximately 70% traditional family-table pairings
- Approximately 30% restaurant-inspired pairings
- Cuisine consistency is required.
- Pairings must pass culinary, nutritional, visual, freezer, and reheating checks.

### 5.3 Fresh Companions
These are prepared at serving time and are not frozen in the meal container:
- Salads
- Fresh slaws
- Fresh fruit
- Pico de gallo
- Guacamole
- Fresh cucumber dishes
- Pickled garnishes
- Fresh lettuce and tomato
- Similar high-moisture or texture-sensitive items

### 5.4 Bread and Garnishes
Bread and garnishes are optional and stored or prepared separately. They do not appear in the Complete Dinner hero.

## 6. Hero Image Standards

### 6.1 Locked Appearance
Every Complete Dinner hero uses:
- One undivided white rounded rectangular meal-prep container
- Thick raised rim
- Straight-down overhead view
- Approved container size, proportions, crop, and placement
- Pale cream marble background
- Soft natural lighting
- Realistic food photography
- No text, utensils, napkins, props, or decorative items

### 6.2 Hero Contents
Only the entrée and freezer-compatible side or sides appear in the hero.

### 6.3 Layout
- Two freezer sides: entrée plus two side regions in the approved master composition
- One freezer side: entrée occupies approximately two-thirds; side occupies approximately one-third
- Visual portioning never changes actual nutrition serving amounts

### 6.4 Production Sizes
- Creative master: 1448 × 1086 px
- Website hero: 960 × 720 px WebP
- Thumbnail: 480 × 360 px WebP
- Target quality: visually sharp with optimized file size

### 6.5 Filenames
- Large hero: `MEAL-###.webp`
- Thumbnail: `MEAL-###-thumb.webp`
- Stable internal ID remains `CD-####`

## 7. Wide Page Hero Standards

- Creative master: 2929 × 537 px
- Website production: 1920 × 352 px WebP
- Small-screen variant: approximately 1280 × 235 px WebP
- Preserve right-weighted composition and open text space

## 8. Data Files

Recommended RFIS files:

```text
src/data/completeDinners.js
src/data/completeDinnerCollections.js
src/data/recipeIntelligence.js
src/data/sideIntelligence.js
src/data/pairingRules.js
src/data/occasions.js
src/data/leftoverIdeas.js
src/utils/completeDinnerValidation.js
```

Existing recipe ownership remains in the authoritative recipe data file until a formal migration is approved.

## 9. Validation Requirements

A Complete Dinner cannot be published until:

- Stable ID is unique
- Legacy meal ID is unique
- Entrée code exists
- Side code or codes exist
- Side count equals one or two
- Hero layout matches side count
- Fresh companions are not assigned to the freezer tray
- No exact duplicate composition exists
- Cuisine pairing is appropriate
- Hero filename is present
- Approval status is set
- Nutrition references resolve
- Website display fields are complete

## 10. Status Workflow

Recommended status flow:

```text
Draft
Curated
Code Verified
Approved
Hero Ready
Hero Complete
Published
Featured
Archived
```

## 11. Release Workflow

### Routine Update
Contains:
- Changed file or files
- `INSTALL.txt`
- `CHANGELOG.md`

### Milestone Release
Contains:
- Complete website ZIP
- Version notes
- Migration notes
- Backup instructions
- Rollback instructions

## 12. Performance Standards

- Use WebP for food photography.
- Use thumbnails in browse grids and planner views.
- Lazy-load below-the-fold images.
- Provide explicit image dimensions.
- Load larger assets only for detail views.
- Do not deploy unused source PNG or JPEG files.
- Keep RFIS data modular rather than one oversized bundle.
- Preserve browser responsiveness as the catalog grows.

## 13. GitHub Pages Compatibility

RFIS must:
- Run entirely in the browser
- Avoid server-required features
- Use static JavaScript/JSON assets
- Preserve local-storage user workflows
- Support JSON backup and restore
- Remain deployable through Vite and GitHub Actions

## 14. Future Expansion

RFIS may later support:
- Dinner Builder
- Smart meal planning
- Pantry and freezer inventory
- UPC-assisted inventory
- Shopping optimization
- Seasonal planning
- Holiday planning
- Nutrition-based filtering
- AI-assisted meal recommendations

Future features must reuse RFIS objects and relationships rather than creating duplicate data.
