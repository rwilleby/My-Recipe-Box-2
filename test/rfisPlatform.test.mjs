import assert from "node:assert/strict";
import { createRecipeService } from "../src/services/RecipeService.js";
import { createCompleteDinnerService } from "../src/services/CompleteDinnerService.js";
import { createCollectionService } from "../src/services/CollectionService.js";
import { createRecommendationService } from "../src/services/RecommendationService.js";
import { createSearchService } from "../src/services/SearchService.js";
import { createHeroService } from "../src/services/HeroService.js";
import { createValidationService } from "../src/services/ValidationService.js";

const recipes = [
  { id: "AM-001", title: "Salisbury Steak", category: "AM" },
  { id: "SD-003", title: "Mashed Potatoes", category: "SD" },
  { id: "SD-004", title: "Green Beans", category: "SD" },
  { id: "AM-007", title: "Meatloaf", category: "AM" },
];
const dinners = [
  { id: "CD-0001", legacyId: "meal-001", number: 1, title: "Salisbury Steak Complete Dinner", entreeRecipeId: "AM-001", sideRecipeIds: ["SD-003", "SD-004"], cuisine: "American", collections: ["Comfort"], status: "approved", hero: { status: "not-started", large: "MEAL-001.webp" } },
  { id: "CD-0002", legacyId: "meal-002", number: 2, title: "Meatloaf Complete Dinner", entreeRecipeId: "AM-007", sideRecipeIds: ["SD-003", "SD-004"], cuisine: "American", collections: ["Comfort"], status: "approved", hero: { status: "approved", large: "MEAL-002.webp", thumbnail: "MEAL-002-thumb.webp" } },
];
const collections = { Comfort: ["CD-0001", "CD-0002"] };

const recipeService = createRecipeService({
  recipes,
  hasNutritionRecord: (recipeId) => recipeId !== "SD-004",
});
const completeDinnerService = createCompleteDinnerService({ dinners, recipeService });
const collectionService = createCollectionService({ collections, completeDinnerService, recipeService });
const recommendationService = createRecommendationService({ completeDinnerService, recipeService });
const searchService = createSearchService({
  recipeService,
  completeDinnerService,
  collectionService,
  recommendationService,
});
const heroService = createHeroService({ placeholder: "placeholder.webp" });
const validationService = createValidationService({ recipeService, completeDinnerService, collectionService, heroService });

assert.equal(recipeService.get("AM-001").title, "Salisbury Steak");
assert.equal(recipeService.search("mashed")[0].id, "SD-003");
assert.equal(completeDinnerService.get("MEAL-001").id, "CD-0001");
assert.equal(completeDinnerService.resolve("CD-0001").referencesValid, true);
assert.equal(completeDinnerService.byRecipe("SD-003", { role: "side" }).length, 2);
assert.equal(collectionService.get("comfort").dinners.length, 2);
assert.equal(searchService.dinners("salisbury")[0].id, "CD-0001");
assert.equal(recommendationService.relatedDinners("CD-0001")[0].dinner.id, "CD-0002");
assert.equal(heroService.large(dinners[0]), "placeholder.webp");
assert.equal(heroService.large(dinners[1]), "images/dinner-combinations/MEAL-002.webp");
assert.equal(validationService.references().ok, true);
assert.equal(validationService.sideCounts().ok, true);
assert.equal(validationService.collections().ok, true);
assert.equal(validationService.duplicateCompositions().ok, true);
assert.equal(completeDinnerService.listEntrees().length, 2);
assert.equal(completeDinnerService.sideRecommendations("AM-001").length, 2);

console.log("RFIS Platform v1.0 service tests passed");

const canonicalDinner = {
  id: "CD-0003",
  legacyId: "meal-003",
  number: 3,
  hero: {
    status: "approved",
    image: "images/dinner-combinations/meal-003.webp",
    thumbnail: "images/dinner-combinations/meal-003-thumb.webp",
  },
};
const legacyApprovedMeal = {
  id: "meal-004",
  number: 4,
  heroStatus: "approved",
  image: "images/dinner-combinations/meal-004.webp",
  thumbnail: "images/dinner-combinations/meal-004-thumb.webp",
};
const legacyPendingMeal = {
  id: "meal-005",
  number: 5,
  heroStatus: "not-started",
  image: "images/dinner-combinations/meal-005.webp",
};

assert.equal(heroService.approved(canonicalDinner), true);
assert.deepEqual(
  heroService.candidates(canonicalDinner),
  ["images/dinner-combinations/meal-003.webp"]
);
assert.deepEqual(
  heroService.candidates(canonicalDinner, { variant: "thumbnail" }),
  [
    "images/dinner-combinations/meal-003-thumb.webp",
    "images/dinner-combinations/meal-003.webp",
  ]
);
assert.equal(heroService.large(legacyApprovedMeal), "images/dinner-combinations/meal-004.webp");
assert.deepEqual(
  heroService.candidates(legacyPendingMeal),
  [],
  "Pending heroes must never expose legacy image candidates"
);
assert.equal(heroService.fallback(legacyPendingMeal).label, "Meal #5");
assert.equal(heroService.view(legacyPendingMeal).approved, false);

console.log("Hero Service consolidation contracts passed");

const validationSummary = validationService.summary();
assert.equal(validationSummary.dinnerCount, 2);
assert.equal(validationSummary.recipeCount, 4);
assert.equal(validationSummary.results.references.ok, true);
assert.equal(validationSummary.results.duplicateIds.ok, true);
assert.equal(validationSummary.results.sideCounts.ok, true);
assert.equal(validationSummary.results.collections.ok, true);
assert.equal(validationSummary.results.heroes.approved, 1);
assert.equal(validationSummary.results.heroes.pending, 1);
assert.equal(validationSummary.results.heroes.missingCanonicalPath.length, 0);

const invalidDinners = [
  {
    id: "CD-0001",
    legacyId: "meal-001",
    number: 1,
    entreeRecipeId: "AM-001",
    sideRecipeIds: [],
    hero: { status: "approved", layout: "Entrée + two sides" },
  },
  {
    id: "CD-0001",
    legacyId: "meal-001",
    number: 1,
    entreeRecipeId: "MISSING",
    sideRecipeIds: ["SD-003"],
    hero: { status: "approved", layout: "Entrée + two sides" },
  },
];
const invalidDinnerService = createCompleteDinnerService({
  dinners: invalidDinners,
  recipeService,
});
const invalidCollectionService = createCollectionService({
  collections: { Broken: ["CD-0001", "CD-9999"] },
  completeDinnerService: invalidDinnerService,
  recipeService,
});
const invalidValidation = createValidationService({
  recipeService,
  completeDinnerService: invalidDinnerService,
  collectionService: invalidCollectionService,
  heroService,
});
const invalidSummary = invalidValidation.summary();
assert.equal(invalidSummary.ok, false);
assert.ok(invalidSummary.issueCount > 0);
assert.equal(invalidSummary.results.duplicateIds.ok, false);
assert.equal(invalidSummary.results.sideCounts.ok, false);
assert.equal(invalidSummary.results.references.ok, false);

console.log("Validation Service consolidation contracts passed");

const relatedCards = recommendationService.relatedDinnerCards("CD-0001", {
  limit: 4,
});
assert.equal(relatedCards.length, 1);
assert.equal(relatedCards[0].id, "CD-0002");
assert.ok(
  relatedCards[0].reasons.some((reason) => reason.includes("Mashed Potatoes"))
);

const mashedSummary = recommendationService.recipeRoleSummary("SD-003");
assert.equal(mashedSummary.dinnerCount, 2);
assert.equal(mashedSummary.entreeCount, 0);
assert.equal(mashedSummary.sideCount, 2);

const entreeOptions = recommendationService.entreeOptions();
assert.equal(entreeOptions.length, 2);
assert.ok(entreeOptions.every((item) => item.dinnerCount > 0));

const salisburySides = recommendationService.sidesForEntree("AM-001");
assert.equal(salisburySides.length, 2);
assert.ok(salisburySides.some((item) => item.recipeId === "SD-003"));

const filteredApproved = recommendationService.approvedDinnersForEntree(
  "AM-001",
  { sideRecipeId: "SD-004" }
);
assert.equal(filteredApproved.length, 1);
assert.equal(filteredApproved[0].id, "CD-0001");

console.log("Recommendation Service consolidation contracts passed");

const collectionSummaries = collectionService.summaries({ sampleLimit: 1 });
assert.equal(collectionSummaries.length, 1);
assert.ok(collectionSummaries.every((item) => item.sampleDinners.length <= 1));

const comfortCollection = collectionService.get("comfort", { sampleLimit: 2 });
assert.equal(comfortCollection.name, "Comfort");
assert.equal(comfortCollection.count, 2);
assert.equal(comfortCollection.sampleDinners.length, 2);
assert.ok(comfortCollection.recipes.some((recipe) => recipe.id === "AM-001"));
assert.ok(comfortCollection.recipes.some((recipe) => recipe.id === "SD-003"));

assert.deepEqual(collectionService.namesForDinner("CD-0001"), ["Comfort"]);
assert.equal(collectionService.has("COMFORT"), true);
assert.equal(collectionService.has("Missing"), false);

const collectionSearch = collectionService.search("comfort");
assert.equal(collectionSearch[0].name, "Comfort");
assert.ok(collectionSearch[0].score > 0);

console.log("Collection Service consolidation contracts passed");

const salisburyProfile = recipeService.profile("AM-001");
assert.equal(salisburyProfile.name, "Salisbury Steak");
assert.equal(salisburyProfile.category, "AM");
assert.equal(salisburyProfile.hasNutritionRecord, true);

const greenBeansProfile = recipeService.profile("SD-004");
assert.equal(greenBeansProfile.hasNutritionRecord, false);

const recipePresentation = recipeService.present("AM-001");
assert.equal(recipePresentation.id, "AM-001");
assert.equal(recipePresentation.name, "Salisbury Steak");

const nutritionSummary = recipeService.nutritionSummary();
assert.equal(nutritionSummary.total, 4);
assert.equal(nutritionSummary.available, 3);
assert.equal(nutritionSummary.missing, 1);
assert.equal(nutritionSummary.complete, false);

assert.ok(recipeService.categories().some((item) => item.name === "AM"));
assert.equal(recipeService.classificationSummary().total, 4);

console.log("Recipe Service consolidation contracts passed");

const dinnerPresentation = completeDinnerService.present("meal-001");
assert.equal(dinnerPresentation.id, "CD-0001");
assert.equal(dinnerPresentation.entreeName, "Salisbury Steak");
assert.deepEqual(
  dinnerPresentation.sideNames,
  ["Mashed Potatoes", "Green Beans"]
);
assert.equal(dinnerPresentation.sideCount, 2);
assert.equal(dinnerPresentation.referencesValid, true);

const dinnerSummary = completeDinnerService.summary();
assert.equal(dinnerSummary.total, 2);
assert.equal(dinnerSummary.oneSide, 0);
assert.equal(dinnerSummary.twoSide, 2);
assert.equal(dinnerSummary.validReferences, 2);
assert.equal(dinnerSummary.uniqueEntrees, 2);
assert.equal(dinnerSummary.uniqueSides, 2);

const cuisineSummary = completeDinnerService.cuisines();
assert.ok(cuisineSummary.some((item) => item.name === "American"));

console.log("Complete Dinner Service consolidation contracts passed");

const unifiedSearchResult = searchService.search("Mashed Potatoes");
assert.equal(unifiedSearchResult.query, "Mashed Potatoes");
assert.equal(
  unifiedSearchResult.total,
  unifiedSearchResult.counts.recipes +
    unifiedSearchResult.counts.dinners +
    unifiedSearchResult.counts.collections
);
assert.ok(
  unifiedSearchResult.recipes.some(
    (item) => item.id === "SD-003"
  )
);
assert.ok(
  unifiedSearchResult.dinners.some(
    (item) => item.id === "CD-0001"
  )
);
assert.ok(
  unifiedSearchResult.tabs.some(
    (tab) =>
      tab.key === "dinners" &&
      tab.count ===
        unifiedSearchResult.counts.dinners
  )
);
assert.equal(
  unifiedSearchResult.dinners[0].entreeName.length > 0,
  true
);
assert.ok(
  Array.isArray(unifiedSearchResult.dinners[0].sideNames)
);

const emptySearch = searchService.search("");
assert.equal(emptySearch.total, 0);
assert.equal(emptySearch.tabs.length, 4);

const searchSuggestions = searchService.suggestions();
assert.ok(searchSuggestions.includes("MEAL-049"));

console.log("Search Service consolidation contracts passed");
