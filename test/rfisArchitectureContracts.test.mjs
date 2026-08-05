import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(testDir, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

const requiredServices = [
  "src/services/RecipeService.js",
  "src/services/CompleteDinnerService.js",
  "src/services/RecommendationService.js",
  "src/services/SearchService.js",
  "src/services/CollectionService.js",
  "src/services/HeroService.js",
  "src/services/ValidationService.js",
  "src/services/createRfisPlatform.js",
];

for (const servicePath of requiredServices) {
  assert.equal(
    exists(servicePath),
    true,
    `Missing RFIS service: ${servicePath}`
  );
}

const app = read("src/App.jsx");
const unifiedSearch = read("src/components/RfisUnifiedSearch.jsx");
const dinnerBuilder = read("src/components/RfisDinnerBuilder.jsx");
const recipeIntelligence = read(
  "src/components/RecipeIntelligencePanel.jsx"
);
const dashboard = read("src/components/RfisProjectDashboard.jsx");

assert.match(
  app,
  /createRfisPlatform/,
  "App.jsx must create the shared RFIS platform"
);
assert.match(
  app,
  /rfisPlatform/,
  "App.jsx must consume the shared RFIS platform"
);

const strictComponents = {
  "RfisUnifiedSearch.jsx": unifiedSearch,
  "RfisDinnerBuilder.jsx": dinnerBuilder,
  "RecipeIntelligencePanel.jsx": recipeIntelligence,
};

for (const [name, source] of Object.entries(strictComponents)) {
  assert.doesNotMatch(
    source,
    /from\s+["'][^"']*\/data\/(?:completeDinners|completeDinnerCollections|recipes)\.js["']/,
    `${name} must not import core RFIS data directly`
  );
  assert.doesNotMatch(
    source,
    /completeDinnerEngine/,
    `${name} must not depend on the compatibility engine`
  );
}

/*
 * Dashboard exception:
 * It may import COMPLETE_DINNER_META for catalog version display and
 * RFIS_PROJECT_STATUS for production workflow state. It may not import
 * recipes or collection records directly.
 */
assert.doesNotMatch(
  dashboard,
  /from\s+["'][^"']*\/data\/(?:recipes|completeDinnerCollections)\.js["']/,
  "Dashboard must not import recipe or collection records directly"
);
assert.match(
  dashboard,
  /import\s+\{\s*COMPLETE_DINNER_META\s*\}\s+from\s+["'][^"']*\/data\/completeDinners\.js["']/,
  "Dashboard's completeDinners import must be metadata-only"
);
assert.doesNotMatch(
  dashboard,
  /completeDinnerEngine/,
  "Dashboard must not depend on the compatibility engine"
);

assert.match(
  unifiedSearch,
  /platform\.search\.search/,
  "Unified Search must consume SearchService"
);
assert.doesNotMatch(
  unifiedSearch,
  /platform\.(?:recipes|completeDinners|recommendations|collections)\./,
  "Unified Search must render SearchService responses without querying other services"
);

assert.match(
  dinnerBuilder,
  /rfisPlatform\.recommendations\./,
  "Dinner Builder must consume RecommendationService"
);
assert.match(
  dinnerBuilder,
  /rfisPlatform\.completeDinners\.present/,
  "Dinner Builder must consume CompleteDinnerService presentation models"
);

assert.match(
  recipeIntelligence,
  /rfisPlatform\?\.recipes\?\.profile/,
  "Recipe Intelligence must consume RecipeService profiles"
);
assert.match(
  recipeIntelligence,
  /rfisPlatform\?\.recommendations\?\.recipeRoleSummary/,
  "Recipe Intelligence must consume RecommendationService role summaries"
);

assert.match(
  dashboard,
  /rfisPlatform\.validation\.summary/,
  "Dashboard must consume ValidationService"
);
assert.match(
  dashboard,
  /rfisPlatform\.completeDinners\.summary/,
  "Dashboard must consume CompleteDinnerService summaries"
);
assert.match(
  dashboard,
  /rfisPlatform\.recipes\.nutritionSummary/,
  "Dashboard must consume RecipeService nutrition summaries"
);
assert.match(
  dashboard,
  /rfisPlatform\.collections\s*\.\s*summaries/,
  "Dashboard must consume CollectionService summaries"
);

assert.equal(
  /import\s+.*completeDinnerEngine/.test(app),
  false,
  "App.jsx must not import the legacy completeDinnerEngine facade"
);

console.log("RFIS Architecture compliance contracts passed");
