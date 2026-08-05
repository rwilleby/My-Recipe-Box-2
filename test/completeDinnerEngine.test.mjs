import assert from "node:assert/strict";
import { createCompleteDinnerEngine } from "../src/services/completeDinnerEngine.js";

const dinners = [
  {
    id: "CD-0001", legacyId: "meal-001", number: 1, title: "Test Chicken Complete Dinner",
    status: "approved", entreeRecipeId: "AM-001", sideRecipeIds: ["SD-001", "SD-002"],
    cuisine: "American", collections: ["Test Collection"], hero: { status: "approved", layout: "two-side" },
  },
  {
    id: "CD-0002", legacyId: "meal-002", number: 2, title: "Second Dinner",
    status: "approved", entreeRecipeId: "AM-002", sideRecipeIds: ["SD-001"],
    cuisine: "American", collections: ["Test Collection"], hero: { status: "not-started", layout: "one-side" },
  },
];
const recipes = [
  { id: "AM-001", title: "Test Chicken" },
  { id: "AM-002", title: "Test Beef" },
  { id: "SD-001", title: "Green Beans" },
  { id: "SD-002", title: "Mashed Potatoes" },
];
const collections = { "Test Collection": ["CD-0001", "CD-0002"] };
const engine = createCompleteDinnerEngine({ dinners, recipes, collections });

assert.equal(engine.count, 2);
assert.equal(engine.getDinner("MEAL-001")?.id, "CD-0001");
assert.equal(engine.getDinner("cd-2")?.legacyId, "meal-002");
assert.equal(engine.resolveDinner(1)?.referencesValid, true);
assert.equal(engine.resolveDinner(1)?.heroReady, true);
assert.equal(engine.getDinnersByRecipe("SD-001").length, 2);
assert.equal(engine.getDinnersByRecipe("SD-001", { role: "side" }).length, 2);
assert.equal(engine.getCollection("test collection")?.dinners.length, 2);
assert.equal(engine.filterDinners({ oneSide: true }).length, 1);
assert.equal(engine.search("chicken green beans").length, 1);
assert.equal(engine.getRelated("meal-001")[0]?.dinner.id, "CD-0002");
assert.equal(engine.validateReferences().ok, true);
console.log("Complete Dinner Engine tests passed.");

const entreeList = engine.listEntrees();
assert.ok(entreeList.length > 0, "listEntrees should return verified entrée references");
assert.ok(entreeList.every((item) => item.recipeId && item.dinnerCount > 0));

const firstEntree = entreeList[0];
const sideRecommendations = engine.getSideRecommendations(firstEntree.recipeId);
assert.ok(Array.isArray(sideRecommendations));
assert.ok(sideRecommendations.every((item) => item.recipeId && item.count > 0));

console.log("Dinner Builder engine methods passed");
