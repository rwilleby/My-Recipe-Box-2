export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function emptyPlan() {
  const plan = {};
  ["week1", "week2"].forEach((week) => {
    DAYS.forEach((day) => {
      plan[`${week}-${day}`] = [];
    });
  });
  return plan;
}

function getPlannedRecipeIds(plan) {
  if (!plan || typeof plan !== "object") return [];
  return Object.values(plan).flatMap((items) => (Array.isArray(items) ? items : []));
}

export function scaleCost(recipe, servings = 4) {
  if (!recipe) return 0;

  if (recipe.cost && typeof recipe.cost === "object") {
    if (recipe.cost[servings] !== undefined) return Number(recipe.cost[servings]) || 0;
    if (recipe.cost[String(servings)] !== undefined) return Number(recipe.cost[String(servings)]) || 0;

    const baseServings = Number(recipe.servings) || 4;
    const baseCost = Number(recipe.cost[baseServings] ?? recipe.cost[String(baseServings)] ?? recipe.cost[4] ?? recipe.cost["4"] ?? 0);
    return baseCost ? baseCost * (servings / baseServings) : 0;
  }

  return Number(recipe.cost) || 0;
}

export function planCost(plan, recipes, servings = 4) {
  const recipeIds = getPlannedRecipeIds(plan);
  return recipeIds.reduce((total, recipeId) => {
    const recipe = recipes.find((item) => item.id === recipeId);
    return total + scaleCost(recipe, servings);
  }, 0);
}

export function buildShoppingList(plan, recipes, servings = 4) {
  const recipeIds = getPlannedRecipeIds(plan);
  const grouped = new Map();

  recipeIds.forEach((recipeId) => {
    const recipe = recipes.find((item) => item.id === recipeId);
    if (!recipe || !Array.isArray(recipe.ingredients)) return;

    const recipeServings = Number(recipe.servings) || 4;
    const multiplier = servings / recipeServings;

    recipe.ingredients.forEach((ingredient) => {
      const aisle = ingredient.aisle || "Other";
      const unit = ingredient.unit || "";
      const key = `${ingredient.name}|${unit}|${aisle}`;
      const current = grouped.get(key) || {
        name: ingredient.name,
        qty: 0,
        unit,
        aisle,
        cost: 0,
      };

      current.qty += (Number(ingredient.qty) || 0) * multiplier;
      current.cost += (Number(ingredient.cost) || 0) * multiplier;
      grouped.set(key, current);
    });
  });

  return Array.from(grouped.values()).sort((a, b) => {
    const aisleSort = a.aisle.localeCompare(b.aisle);
    return aisleSort || a.name.localeCompare(b.name);
  });
}

export function formatQty(value) {
  const number = Number(value) || 0;
  if (Number.isInteger(number)) return String(number);
  return number.toFixed(2).replace(/\.00$/, "").replace(/0$/, "");
}
