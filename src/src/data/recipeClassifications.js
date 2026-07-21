// src/data/recipeClassifications.js
// Robert's Recipe Box — recipe classification system
//
// This file supplies the permanent classification vocabulary, default recipe
// classifications, and safe helpers. Existing recipes continue to work even
// before classifications are assigned.

export const RECIPE_COLLECTIONS = [
  "Slow Cooker Favorites",
  "Summer Cookouts",
  "Healthy Dinners",
  "Comfort Foods",
  "Casseroles",
  "Salad Jars",
  "Easy 30-Minute Meals",
  "Sunday Meals",
  "Complete Dinners",
  "Freezer-Friendly Meals",
  "Meals for Two",
  "Make-Ahead Meals",
];

export const RECIPE_ATTRIBUTES = [
  "Beef",
  "Chicken",
  "Pork",
  "Seafood",
  "Turkey",
  "Vegetarian",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Side Dish",
  "Dessert",
  "Lower Carb",
  "Lower Calorie",
  "Higher Protein",
  "Family Favorite",
  "Kid Friendly",
  "Freezer Friendly",
  "Make Ahead",
  "Serves Two",
];

export const COOKING_METHODS = [
  "Air Fryer",
  "Slow Cooker",
  "Oven",
  "Microwave",
  "Gas Grill",
  "Pellet Smoker",
  "Stovetop",
  "No Cook",
  "Bread Machine",
  "Pressure Cooker",
];

export const CLASSIFICATION_STORAGE_KEY = "rrb_admin_recipe_classifications";

export const DEFAULT_RECIPE_CLASSIFICATIONS = {
  "AS-001": {
    "primaryCategory": "Asian Cuisine",
    "collections": [],
    "attributes": [
      "Beef"
    ],
    "cookingMethods": [
      "Stovetop",
      "Microwave"
    ]
  },
  "AS-002": {
    "primaryCategory": "Asian Cuisine",
    "collections": [],
    "attributes": [
      "Beef"
    ],
    "cookingMethods": [
      "Microwave",
      "Stovetop"
    ]
  }
};

export function emptyRecipeClassification(recipe) {
  return {
    primaryCategory: recipe?.category || "",
    collections: [],
    attributes: [],
    cookingMethods: [],
  };
}

export function normalizeRecipeClassification(recipe, saved = {}) {
  return {
    primaryCategory:
      saved.primaryCategory ||
      recipe.primaryCategory ||
      recipe.category ||
      "",
    collections: uniqueStrings(saved.collections ?? recipe.collections),
    attributes: uniqueStrings(saved.attributes ?? recipe.attributes),
    cookingMethods: uniqueStrings(
      saved.cookingMethods ?? recipe.cookingMethods
    ),
  };
}

export function mergeRecipeClassifications(recipes, classifications = {}) {
  const mergedClassifications = {
    ...DEFAULT_RECIPE_CLASSIFICATIONS,
    ...classifications,
  };

  return recipes.map((recipe) => ({
    ...recipe,
    ...normalizeRecipeClassification(recipe, mergedClassifications[recipe.id]),
  }));
}

export function loadRecipeClassifications() {
  try {
    const saved = window.localStorage.getItem(CLASSIFICATION_STORAGE_KEY);
    const savedClassifications = saved ? JSON.parse(saved) : {};

    return {
      ...DEFAULT_RECIPE_CLASSIFICATIONS,
      ...savedClassifications,
    };
  } catch {
    return { ...DEFAULT_RECIPE_CLASSIFICATIONS };
  }
}

export function saveRecipeClassifications(classifications) {
  window.localStorage.setItem(
    CLASSIFICATION_STORAGE_KEY,
    JSON.stringify(classifications)
  );
}

export function recipeMatchesCollection(recipe, collectionName) {
  return Array.isArray(recipe.collections) &&
    recipe.collections.includes(collectionName);
}

export function recipeMatchesAttribute(recipe, attributeName) {
  return Array.isArray(recipe.attributes) &&
    recipe.attributes.includes(attributeName);
}

export function recipeMatchesCookingMethod(recipe, methodName) {
  return Array.isArray(recipe.cookingMethods) &&
    recipe.cookingMethods.includes(methodName);
}

export function filterRecipesByClassification(
  recipes,
  { collection = "", attribute = "", cookingMethod = "" } = {}
) {
  return recipes.filter((recipe) => {
    const matchesCollection =
      !collection || recipeMatchesCollection(recipe, collection);
    const matchesAttribute =
      !attribute || recipeMatchesAttribute(recipe, attribute);
    const matchesMethod =
      !cookingMethod || recipeMatchesCookingMethod(recipe, cookingMethod);

    return matchesCollection && matchesAttribute && matchesMethod;
  });
}

function uniqueStrings(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item) => typeof item === "string" && item))];
}
