import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { categories, recipes } from "./data/recipes";
import AdminRecipeClassifier from "./components/AdminRecipeClassifier";
import {
  loadRecipeClassifications,
  mergeRecipeClassifications,
  recipeMatchesCollection,
  saveRecipeClassifications,
  RECIPE_COLLECTIONS,
} from "./data/recipeClassifications";
import {
  DINNER_PROTEIN_FILTERS,
  DINNER_SIDE_FILTERS,
  dinnerCombinations,
  getDinnerCombinationSearchText,
} from "./data/dinnerCombinations.js";
import { getRecipeCostEstimate, RECIPE_COST_NOTE, RECIPE_COST_TAGLINE } from "./data/recipeCosts";
import {
  REFRIGERATOR_CATEGORIES,
  REFRIGERATOR_FILTERS,
  REFRIGERATOR_STATUS_OPTIONS,
  getDefaultRefrigeratorItems,
  slugifyRefrigeratorItem,
} from "./data/refrigeratorInventory";
import {
  DEFAULT_FREEZER_LOCATIONS,
  FREEZER_CATEGORIES,
  FREEZER_FILTERS,
  FREEZER_STATUS_OPTIONS,
  getDefaultFreezerItems,
  slugifyFreezerItem,
} from "./data/freezerInventory";
import { loadJSON, saveJSON } from "./utils/storage";
import {
  buildShoppingList,
  formatQty,
} from "./utils/planning";
import "./App.css";

const STORAGE_KEYS = {
  favorites: "rrb_favorites",
  plan: "rrb_weeklyPlan",
  servings: "rrb_servingSize",
  checked: "rrb_checkedShoppingItems",
  pantry: "rrb_pantryStaples",
  refrigerator: "rrb_refrigeratorInventory",
  freezer: "rrb_freezerInventory",
};

const CATEGORY_ICON_IMAGES = {
  AM: "images/categories/AM.png",
  AS: "images/categories/AS.png",
  CC: "images/categories/CC.png",
  CO: "images/categories/CO.png",
  CR: "images/categories/CR.png",
  DN: "images/categories/DN.png",
  DS: "images/categories/DS.png",
  HB: "images/categories/HB.png",
  IT: "images/categories/IT.png",
  JJ: "images/categories/JJ.png",
  KR: "images/categories/KR.png",
  LF: "images/categories/LF.png",
  MX: "images/categories/MX.png",
  PM: "images/categories/PM.png",
  QP: "images/categories/QP.png",
  CS: "images/categories/CS.png",
  SB: "images/categories/SB.png",
  SD: "images/categories/SD.png",
  SF: "images/categories/SF.png",
  SG: "images/categories/SG.png",
  SW: "images/categories/SW.png",
};

const HOME_CATEGORY_CODES = [
  "AM",
  "AS",
  "IT",
  "MX",
  "SF",
  "QP",
  "CS",
  "SB",
  "SG",
  "SD",
  "HB",
  "SW",
  "LF",
  "PM",
  "KR",
  "CC",
  "CO",
  "CR",
  "DN",
  "JJ",
];

const HOME_CATEGORY_LABELS = {
  AM: "American",
  AS: "Asian",
  CC: "Cheesecakes",
  CO: "Cobblers",
  CR: "Cinnamon Rolls",
  DN: "Donuts",
  DS: "Desserts",
  HB: "Hamburgers",
  IT: "Italian",
  JJ: "Jams & Jellies",
  KR: "Kolaches",
  LF: "Loafs & Rolls",
  MX: "Mexican",
  PM: "Protein Muffins",
  QP: "Quiche & Pies",
  CS: "Casseroles",
  SB: "Salads & Bowls",
  SD: "Side Dishes",
  SF: "Seafood",
  SG: "Smoked/Grilled",
  SW: "Sandwiches",
};

const HOME_CATEGORY_FALLBACKS = {
  AM: { id: "AM", name: "American Cuisine", count: 0, icon: "plate" },
  AS: { id: "AS", name: "Asian Cuisine", count: 0, icon: "🍜" },
  CC: { id: "CC", name: "Cheesecakes", count: 0, icon: "🍰" },
  CO: { id: "CO", name: "Cobblers", count: 0, icon: "🥧" },
  CR: { id: "CR", name: "Cinnamon Rolls", count: 0, icon: "🌀" },
  DN: { id: "DN", name: "Donuts", count: 0, icon: "🍩" },
  DS: { id: "DS", name: "Desserts", count: 0, icon: "🍰" },
  HB: { id: "HB", name: "Hamburgers", count: 0, icon: "🍔" },
  IT: { id: "IT", name: "Italian Cuisine", count: 0, icon: "🍝" },
  JJ: { id: "JJ", name: "Jams & Jellies", count: 0, icon: "🍓" },
  KR: { id: "KR", name: "Kolaches", count: 0, icon: "🥐" },
  LF: { id: "LF", name: "Loafs & Rolls", count: 0, icon: "🍞" },
  MX: { id: "MX", name: "Mexican Cuisine", count: 0, icon: "🌮" },
  PM: { id: "PM", name: "Protein Muffins", count: 0, icon: "🧁" },
  QP: { id: "QP", name: "Quiche & Pies", count: 0, icon: "🥧" },
  CS: { id: "CS", name: "Casseroles", count: 0, icon: "pan" },
  SB: { id: "SB", name: "Salads & Bowls", count: 0, icon: "🥗" },
  SD: { id: "SD", name: "Side Dishes", count: 0, icon: "pot" },
  SF: { id: "SF", name: "Seafood Dishes", count: 0, icon: "🐟" },
  SG: { id: "SG", name: "Smoked & Grilled Meats", count: 0, icon: "🔥" },
  SW: { id: "SW", name: "Sandwiches", count: 0, icon: "🥪" },
};

const PANTRY_LEVELS = [
  {
    id: 1,
    label: "Minimum Pantry",
    shortLabel: "Minimum",
    description: "Core shelf-stable basics for simple meals and shopping-list matching.",
  },
  {
    id: 2,
    label: "Medium Pantry",
    shortLabel: "Medium",
    description: "Adds more sauces, grains, canned goods, and baking basics for flexible weekly cooking.",
  },
  {
    id: 3,
    label: "Fully Stocked Pantry",
    shortLabel: "Fully Stocked",
    description: "A deeper shelf-stable pantry for meal prep, freezer meals, baking, and lower-carb swaps.",
  },
];

const PANTRY_STAPLES = [
  {
    group: "Spices & Seasonings",
    items: [
      { name: "Salt", level: 1 },
      { name: "Black pepper", level: 1 },
      { name: "Garlic powder", level: 1 },
      { name: "Onion powder", level: 1 },
      { name: "Paprika", level: 1 },
      { name: "Chili powder", level: 1 },
      { name: "Italian seasoning", level: 1 },
      { name: "Dried oregano", level: 2 },
      { name: "Ground cumin", level: 2 },
      { name: "Cinnamon", level: 2 },
      { name: "Taco seasoning", level: 2 },
      { name: "Cajun seasoning", level: 3 },
      { name: "Lemon pepper", level: 3 },
      { name: "Smoked paprika", level: 3 },
      { name: "Red pepper flakes", level: 3 },
    ],
  },
  {
    group: "Oils, Vinegars & Cooking Basics",
    items: [
      { name: "Olive oil", level: 1 },
      { name: "Vegetable oil", level: 1 },
      { name: "Cooking spray", level: 1 },
      { name: "White vinegar", level: 1 },
      { name: "Flour", level: 1 },
      { name: "Sugar", level: 1 },
      { name: "Cornstarch", level: 2 },
      { name: "Brown sugar", level: 2 },
      { name: "Apple cider vinegar", level: 2 },
      { name: "Baking powder", level: 2 },
      { name: "Baking soda", level: 2 },
      { name: "Powdered milk", level: 3 },
      { name: "Shelf-stable milk", level: 3 },
      { name: "Powdered buttermilk", level: 3 },
      { name: "Shelf-stable ghee", level: 3 },
    ],
  },
  {
    group: "Sauces & Condiments",
    items: [
      { name: "Soy sauce", level: 1 },
      { name: "Ketchup", level: 1 },
      { name: "Mustard", level: 1 },
      { name: "BBQ sauce", level: 1 },
      { name: "Salsa", level: 1 },
      { name: "Hot sauce", level: 2 },
      { name: "Worcestershire sauce", level: 2 },
      { name: "Honey", level: 2 },
      { name: "Maple syrup", level: 2 },
      { name: "No-sugar-added BBQ sauce", level: 3 },
      { name: "No-sugar-added ketchup", level: 3 },
      { name: "Lower-sodium soy sauce", level: 3 },
      { name: "Teriyaki sauce", level: 3 },
      { name: "Buffalo sauce", level: 3 },
    ],
  },
  {
    group: "Rice, Pasta & Grains",
    items: [
      { name: "White rice", level: 1 },
      { name: "Pasta", level: 1 },
      { name: "Egg noodles", level: 1 },
      { name: "Breadcrumbs", level: 1 },
      { name: "Rolled oats", level: 2 },
      { name: "Brown rice", level: 2 },
      { name: "Jasmine rice", level: 2 },
      { name: "Tortillas", level: 2 },
      { name: "Crackers", level: 2 },
      { name: "Microwave rice cups", level: 3 },
      { name: "Higher-protein pasta", level: 3 },
      { name: "Low-carb tortillas", level: 3 },
      { name: "Shelf-stable cauliflower rice", level: 3 },
    ],
  },
  {
    group: "Canned & Jarred Goods",
    items: [
      { name: "Chicken broth", level: 1 },
      { name: "Beef broth", level: 1 },
      { name: "Cream of chicken soup", level: 1 },
      { name: "Cream of mushroom soup", level: 1 },
      { name: "Diced tomatoes", level: 1 },
      { name: "Tomato sauce", level: 1 },
      { name: "Tomato paste", level: 2 },
      { name: "Black beans", level: 2 },
      { name: "Pinto beans", level: 2 },
      { name: "Corn", level: 2 },
      { name: "Green beans", level: 2 },
      { name: "Tuna packets or cans", level: 3 },
      { name: "Chicken packets or cans", level: 3 },
      { name: "No-sugar-added marinara", level: 3 },
      { name: "Enchilada sauce", level: 3 },
      { name: "Diced green chiles", level: 3 },
    ],
  },
  {
    group: "Shelf-Stable Baking & Breakfast",
    items: [
      { name: "Pancake mix", level: 2 },
      { name: "Muffin mix", level: 2 },
      { name: "Cake mix", level: 2 },
      { name: "Vanilla extract", level: 2 },
      { name: "Protein powder", level: 3 },
      { name: "Almond flour", level: 3 },
      { name: "Sugar-free pudding mix", level: 3 },
      { name: "No-sugar-added pie filling", level: 3 },
      { name: "Shelf-stable applesauce cups", level: 3 },
    ],
  },
  {
    group: "Freezer Meal & Storage Supplies",
    items: [
      { name: "Quart freezer bags", level: 1 },
      { name: "Gallon freezer bags", level: 1 },
      { name: "Permanent marker", level: 1 },
      { name: "Painter's tape", level: 2 },
      { name: "Foil pans", level: 2 },
      { name: "Heavy-duty foil", level: 2 },
      { name: "Parchment paper", level: 2 },
      { name: "Vacuum sealer bags", level: 3 },
      { name: "Freezer labels", level: 3 },
      { name: "Disposable soup containers", level: 3 },
      { name: "Meal-prep containers", level: 3 },
    ],
  },
];

const PANTRY_MATCHERS = [
  { pantry: "Salt", terms: ["salt"] },
  { pantry: "Black pepper", terms: ["pepper", "black pepper"] },
  { pantry: "Garlic powder", terms: ["garlic powder"] },
  { pantry: "Onion powder", terms: ["onion powder"] },
  { pantry: "Paprika", terms: ["paprika"] },
  { pantry: "Chili powder", terms: ["chili powder"] },
  { pantry: "Italian seasoning", terms: ["italian seasoning"] },
  { pantry: "Dried oregano", terms: ["oregano"] },
  { pantry: "Ground cumin", terms: ["cumin"] },
  { pantry: "Cinnamon", terms: ["cinnamon"] },
  { pantry: "Taco seasoning", terms: ["taco seasoning"] },
  { pantry: "Cajun seasoning", terms: ["cajun seasoning"] },
  { pantry: "Lemon pepper", terms: ["lemon pepper"] },
  { pantry: "Smoked paprika", terms: ["smoked paprika"] },
  { pantry: "Red pepper flakes", terms: ["red pepper flakes"] },
  { pantry: "Olive oil", terms: ["olive oil"] },
  { pantry: "Vegetable oil", terms: ["vegetable oil", "oil"] },
  { pantry: "Cooking spray", terms: ["cooking spray"] },
  { pantry: "White vinegar", terms: ["white vinegar", "vinegar"] },
  { pantry: "Apple cider vinegar", terms: ["apple cider vinegar"] },
  { pantry: "Flour", terms: ["flour"] },
  { pantry: "Cornstarch", terms: ["cornstarch"] },
  { pantry: "Sugar", terms: ["sugar"] },
  { pantry: "Brown sugar", terms: ["brown sugar"] },
  { pantry: "Baking powder", terms: ["baking powder"] },
  { pantry: "Baking soda", terms: ["baking soda"] },
  { pantry: "Powdered milk", terms: ["powdered milk"] },
  { pantry: "Shelf-stable milk", terms: ["shelf stable milk", "shelf-stable milk"] },
  { pantry: "Powdered buttermilk", terms: ["powdered buttermilk"] },
  { pantry: "Shelf-stable ghee", terms: ["ghee", "shelf-stable ghee"] },
  { pantry: "Soy sauce", terms: ["soy sauce"] },
  { pantry: "Lower-sodium soy sauce", terms: ["lower-sodium soy sauce", "lower sodium soy sauce"] },
  { pantry: "Worcestershire sauce", terms: ["worcestershire"] },
  { pantry: "Ketchup", terms: ["ketchup"] },
  { pantry: "No-sugar-added ketchup", terms: ["no-sugar-added ketchup", "no sugar added ketchup"] },
  { pantry: "Mustard", terms: ["mustard"] },
  { pantry: "BBQ sauce", terms: ["bbq sauce", "barbecue sauce"] },
  { pantry: "No-sugar-added BBQ sauce", terms: ["no-sugar-added bbq sauce", "no sugar added bbq sauce", "lower-sugar bbq sauce", "lower sugar bbq sauce"] },
  { pantry: "Hot sauce", terms: ["hot sauce"] },
  { pantry: "Salsa", terms: ["salsa"] },
  { pantry: "Teriyaki sauce", terms: ["teriyaki sauce"] },
  { pantry: "Buffalo sauce", terms: ["buffalo sauce"] },
  { pantry: "Honey", terms: ["honey"] },
  { pantry: "Maple syrup", terms: ["maple syrup"] },
  { pantry: "White rice", terms: ["white rice", "rice"] },
  { pantry: "Brown rice", terms: ["brown rice"] },
  { pantry: "Jasmine rice", terms: ["jasmine rice"] },
  { pantry: "Microwave rice cups", terms: ["microwave rice cups", "rice cups", "ready rice"] },
  { pantry: "Pasta", terms: ["pasta", "spaghetti", "penne", "fettuccine"] },
  { pantry: "Higher-protein pasta", terms: ["higher-protein pasta", "high protein pasta", "protein pasta"] },
  { pantry: "Egg noodles", terms: ["egg noodles"] },
  { pantry: "Breadcrumbs", terms: ["breadcrumbs", "bread crumbs"] },
  { pantry: "Rolled oats", terms: ["oats", "rolled oats"] },
  { pantry: "Tortillas", terms: ["tortilla", "tortillas"] },
  { pantry: "Low-carb tortillas", terms: ["low-carb tortilla", "low carb tortilla", "low-carb flour tortillas"] },
  { pantry: "Crackers", terms: ["crackers"] },
  { pantry: "Chicken broth", terms: ["chicken broth"] },
  { pantry: "Beef broth", terms: ["beef broth"] },
  { pantry: "Cream of chicken soup", terms: ["cream of chicken"] },
  { pantry: "Cream of mushroom soup", terms: ["cream of mushroom"] },
  { pantry: "Diced tomatoes", terms: ["diced tomatoes"] },
  { pantry: "Tomato sauce", terms: ["tomato sauce"] },
  { pantry: "Tomato paste", terms: ["tomato paste"] },
  { pantry: "Black beans", terms: ["black beans"] },
  { pantry: "Pinto beans", terms: ["pinto beans"] },
  { pantry: "Corn", terms: ["corn"] },
  { pantry: "Green beans", terms: ["green beans"] },
  { pantry: "Tuna packets or cans", terms: ["tuna", "tuna packets", "tuna cans"] },
  { pantry: "Chicken packets or cans", terms: ["canned chicken", "chicken packets"] },
  { pantry: "No-sugar-added marinara", terms: ["no-sugar-added marinara", "no sugar added marinara", "marinara"] },
  { pantry: "Enchilada sauce", terms: ["enchilada sauce"] },
  { pantry: "Diced green chiles", terms: ["diced green chiles", "green chiles"] },
  { pantry: "Protein powder", terms: ["protein powder"] },
  { pantry: "Almond flour", terms: ["almond flour"] },
  { pantry: "Quart freezer bags", terms: ["quart freezer bags", "freezer bags"] },
  { pantry: "Gallon freezer bags", terms: ["gallon freezer bags"] },
  { pantry: "Vacuum sealer bags", terms: ["vacuum sealer bags", "vacuum seal bags"] },
  { pantry: "Freezer labels", terms: ["freezer labels", "labels"] },
  { pantry: "Painter's tape", terms: ["painter's tape", "painters tape"] },
  { pantry: "Meal-prep containers", terms: ["meal prep containers", "storage containers"] },
];


const GROCERY_REFERENCE_GROUPS = [
  {
    group: "Tortillas & Wraps",
    intro: "Useful for tacos, quesadillas, wraps, enchiladas, and freezer-friendly burrito bowls.",
    items: [
      {
        name: "Low-carb flour tortillas",
        useFor: "Tacos, quesadillas, enchiladas, wraps",
        examples: [
          "Mission Carb Balance",
          "La Banderita Carb Counter",
          "H-E-B Carb Sense",
          "Ole Xtreme Wellness"
        ],
        note: "Look for soft taco size, high-fiber options, and a size that fits your portions.",
        terms: ["tortilla", "tortillas", "wrap", "wraps", "low-carb flour tortillas", "flour tortillas"],
      },
      {
        name: "Lower-carb tortilla chips",
        useFor: "Queso, dips, taco bowls",
        examples: [
          "Quest tortilla-style chips",
          "H-E-B Quest-style protein chips",
          "Baked tortilla chips"
        ],
        note: "Use as an occasional swap; portion into small bags for easier control.",
        terms: ["tortilla chips", "chips"],
      },
    ],
  },
  {
    group: "Proteins",
    intro: "More specific protein choices make the shopping list easier to use and freezer prep easier to plan.",
    items: [
      {
        name: "Boneless skinless chicken breasts",
        useFor: "Chicken casseroles, salads, bowls, fajitas, grilled chicken",
        examples: ["Fresh family pack", "Individually frozen breasts", "Thin-sliced chicken breasts"],
        note: "Good for batch cooking, shredding, grilling, and freezing in two-serving portions.",
        terms: ["chicken breast", "chicken breasts", "boneless skinless chicken breasts"],
      },
      {
        name: "Chicken tenders",
        useFor: "Quick skillet meals, stir-fry, fajitas, nuggets",
        examples: ["Fresh chicken tenderloins", "Frozen chicken tenders"],
        note: "Faster to cook and easy to portion for two-person meals.",
        terms: ["chicken tenders", "chicken tenderloins", "tenders"],
      },
      {
        name: "Boneless skinless chicken thighs",
        useFor: "Slow cooker meals, casseroles, grilled chicken, freezer meals",
        examples: ["Fresh boneless thighs", "Frozen boneless thighs"],
        note: "More forgiving for reheating and freezer meals.",
        terms: ["chicken thighs", "boneless skinless chicken thighs"],
      },
      {
        name: "Lean ground beef",
        useFor: "Tacos, burgers, casseroles, meatballs, pasta sauce",
        examples: ["90/10 ground beef", "93/7 ground beef", "Lean ground sirloin"],
        note: "Brown in bulk, drain well, and freeze flat in meal-sized bags.",
        terms: ["ground beef", "lean ground beef", "hamburger meat"],
      },
      {
        name: "Seafood fillets",
        useFor: "Tilapia, cod, salmon, seafood dinners",
        examples: ["Tilapia fillets", "Cod fillets", "Salmon portions"],
        note: "Individually frozen portions are easy for small households.",
        terms: ["tilapia", "cod", "salmon", "fish fillets", "seafood", "seafood fillets"],
      },
    ],
  },
  {
    group: "Rice, Pasta & Bowl Bases",
    intro: "Use these swaps when you want a lighter or lower-carb base without changing the whole recipe.",
    items: [
      {
        name: "Cauliflower rice",
        useFor: "Rice bowls, Mexican bowls, stir-fry, casseroles",
        examples: ["Frozen cauliflower rice", "Riced cauliflower steam bags"],
        note: "Good lower-carb option; mix half cauliflower rice and half white rice if you want a softer transition.",
        terms: ["cauliflower rice", "riced cauliflower"],
      },
      {
        name: "Higher-protein or lower-carb pasta",
        useFor: "Italian pasta dishes, pasta salads, casseroles",
        examples: ["Barilla Protein+ pasta", "Banza chickpea pasta", "Fiber Gourmet pasta"],
        note: "Start with half regular pasta and half swap pasta if texture is a concern.",
        terms: ["pasta", "spaghetti", "penne", "fettuccine", "macaroni", "noodles"],
      },
      {
        name: "Microwave rice cups or pouches",
        useFor: "Fast two-serving sides and bowls",
        examples: ["Brown rice cups", "Jasmine rice cups", "Ready rice pouches"],
        note: "Helpful for seniors or couples who do not want to cook a full pot of rice.",
        terms: ["rice", "white rice", "brown rice", "jasmine rice", "ready rice"],
      },
    ],
  },
  {
    group: "Breads, Buns & Rolls",
    intro: "Helpful swaps for burgers, sandwiches, freezer sandwiches, and small-household meals.",
    items: [
      {
        name: "Lower-calorie burger buns",
        useFor: "Burgers, pulled pork, sandwiches",
        examples: ["Homemade buns or rolls", "647 sandwich rolls", "Thin sandwich buns", "Whole wheat sandwich thins"],
        note: "Homemade is a good option because you control ingredients; some thin buns work better toasted.",
        terms: ["burger buns", "buns", "sandwich buns", "rolls"],
      },
      {
        name: "Lower-carb sandwich bread",
        useFor: "Sandwiches, toast, freezer breakfast sandwiches",
        examples: ["Homemade sandwich bread", "Nature's Own Keto", "Sola bread", "647 bread"],
        note: "Homemade is a good option because you control ingredients; freeze extra slices to avoid waste.",
        terms: ["bread", "sandwich bread", "toast"],
      },
    ],
  },
  {
    group: "Cheese, Dairy & Creamy Ingredients",
    intro: "These choices help keep casseroles, salads, and bowls familiar while giving lighter options to review.",
    items: [
      {
        name: "Reduced-fat shredded cheese",
        useFor: "Mexican bakes, casseroles, eggs, salads",
        examples: ["Reduced-fat Mexican blend", "Reduced-fat cheddar", "Part-skim mozzarella"],
        note: "For better melt, mix reduced-fat cheese with a smaller amount of regular cheese.",
        terms: ["shredded cheese", "cheese", "cheddar", "mozzarella", "mexican cheese"],
      },
      {
        name: "Plain Greek yogurt",
        useFor: "Sauces, dressings, chicken salad, dips",
        examples: ["Nonfat plain Greek yogurt", "2% plain Greek yogurt"],
        note: "Useful swap for some sour cream or mayo-based recipes.",
        terms: ["greek yogurt", "plain greek yogurt", "yogurt"],
      },
      {
        name: "Light sour cream",
        useFor: "Tacos, bowls, dips, casseroles",
        examples: ["Light sour cream", "Reduced-fat sour cream"],
        note: "Good for toppings; Greek yogurt can work in many cold uses.",
        terms: ["sour cream", "light sour cream"],
      },
    ],
  },
  {
    group: "Sauces, Dressings & Condiments",
    intro: "Sauces can change calories quickly, so this list gives the user products to review before buying.",
    items: [
      {
        name: "Lower-sugar BBQ sauce",
        useFor: "Smoked meats, grilled chicken, pulled pork",
        examples: ["G Hughes sugar free BBQ sauce", "Stubb's lower sugar options"],
        note: "Taste varies a lot; keep one favorite regular sauce and one lower-sugar sauce if needed.",
        terms: ["bbq sauce", "barbecue sauce"],
      },
      {
        name: "Light salad dressings",
        useFor: "Salads, bowls, marinades",
        examples: ["Bolthouse Farms yogurt dressings", "Lite vinaigrettes", "Skinnygirl dressings"],
        note: "For meal prep, keep dressing separate until serving.",
        terms: ["dressing", "salad dressing", "vinaigrette"],
      },
      {
        name: "Salsa and taco sauces",
        useFor: "Tacos, bowls, casseroles, eggs",
        examples: ["Fresh salsa", "Restaurant-style salsa", "Green salsa verde"],
        note: "Often adds flavor without needing much extra fat.",
        terms: ["salsa", "taco sauce", "salsa verde", "enchilada sauce"],
      },
    ],
  },
  {
    group: "Freezer & Meal-Prep Supplies",
    intro: "These support the cook-once, eat-once, freeze-once method used throughout the recipe box.",
    items: [
      {
        name: "Freezer bags",
        useFor: "Flat-freezing cooked proteins, sauces, soups, and meal portions",
        examples: ["Quart freezer bags", "Gallon freezer bags", "Vacuum sealer bags"],
        note: "Freeze flat first, then stand bags upright like files.",
        terms: ["freezer bag", "freezer bags", "vacuum seal bags", "vacuum sealer bags"],
      },
      {
        name: "Two-serving freezer containers",
        useFor: "Prepared meals, casseroles, soups, leftovers",
        examples: ["2-cup containers", "3-cup containers", "Freezer-safe meal prep containers"],
        note: "Choose stackable containers with lids that seal tightly.",
        terms: ["freezer containers", "meal prep containers", "storage containers"],
      },
      {
        name: "Freezer labels",
        useFor: "Recipe name, date, servings, reheating notes",
        examples: ["Freezer labels", "Painter's tape and marker", "Dissolvable food labels"],
        note: "Label before freezing so meals are easy to rotate.",
        terms: ["freezer labels", "labels", "painter's tape", "painters tape"],
      },
    ],
  },
];

const GROCERY_REFERENCE_ITEMS = GROCERY_REFERENCE_GROUPS.flatMap((group) =>
  group.items.map((item) => ({ ...item, group: group.group }))
);

function findGroceryReference(itemName = "") {
  const normalizedItem = normalizePantryText(itemName);

  return GROCERY_REFERENCE_ITEMS.find((item) =>
    item.terms.some((term) => {
      const normalizedTerm = normalizePantryText(term);
      return normalizedItem === normalizedTerm || normalizedItem.includes(normalizedTerm);
    })
  );
}


function normalizePantryText(value = "") {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function findPantryMatch(itemName = "") {
  const normalizedItem = normalizePantryText(itemName);

  return PANTRY_MATCHERS.find((matcher) =>
    matcher.terms.some((term) => {
      const normalizedTerm = normalizePantryText(term);
      return normalizedItem === normalizedTerm || normalizedItem.includes(normalizedTerm);
    })
  );
}

function splitShoppingListByPantry(list, pantry) {
  return list.reduce(
    (groups, item) => {
      const match = findPantryMatch(item.name);
      const inPantry = match && pantry[match.pantry];

      if (inPantry) {
        groups.pantry.push({
          ...item,
          pantryName: match.pantry,
        });
      } else {
        groups.needed.push(item);
      }

      return groups;
    },
    { needed: [], pantry: [] }
  );
}

const SUPPORTING_PAGE_HERO_IMAGES = [
  "images/heroes/hero-mission.png",
  "images/heroes/hero-page-free-to-use.jpg",
  "images/heroes/hero-page-complete-dinners.jpg",
  "images/heroes/hero-page-reference-guides.jpg",
  "images/heroes/hero-page-disclaimers.jpg",
  "images/heroes/hero-page-construction.jpg",
  "images/heroes/hero-page-browse-recipes.jpg",
  "images/heroes/hero-weekly-plan.png",
  "images/heroes/hero-page-salad-jars.jpg",
  "images/heroes/hero-page-slow-cooker.jpg",
  "images/heroes/hero-page-summer-cookouts.jpg",
  "images/heroes/hero-page-healthy-dinners.jpg",
  "images/heroes/hero-page-comfort-food.jpg",
  "images/heroes/hero-page-30-minute-meals.jpg",
  "images/heroes/hero-weekly-dinner-planner.png",
  "images/heroes/hero-page-grocery-list.jpg",
  "images/heroes/hero-page-your-pantry.jpg",
  "images/heroes/hero-page-favorite-recipes.jpg",
  "images/heroes/hero-storage.png",
  "images/heroes/hero-page-cooking-tools.jpg",
  "images/heroes/hero-page-healthy-substitutions.jpg",
  "images/heroes/hero-page-about-us.jpg",
  "images/heroes/hero-air-fryer.png",
  "images/heroes/hero-recipes.png",
  "images/heroes/hero-submit-recipe.jpg",
  "images/heroes/hero-oven.png",
  "images/heroes/hero-page-ai-generated.jpg",
  "images/heroes/hero-smoker.jpg",
  "images/heroes/hero-page-affiliate.jpg",
  "images/heroes/hero-page-crockpot.jpg",
  "images/heroes/hero-grill.png",
  "images/heroes/hero-page-air-fryer.jpg",
  "images/heroes/hero-page-oven.jpg",
  "images/heroes/hero-page-microwaves.jpg",
  "images/heroes/hero-page-gas-grills.jpg",
  "images/heroes/hero-page-pellet-smoker.jpg",
  "images/heroes/hero-page-storage.jpg",
  "images/heroes/hero-page-family.png",
  "images/heroes/hero-page-freezer-inv.png",
  "images/heroes/hero-page-freezer-meals.png",
  "images/heroes/hero-page-refrigerator-inv.png",
  "images/heroes/hero-page-freeze-reheat.png",
  "images/heroes/hero-page-food-safety.png",
  "images/heroes/hero-page-breadmaking.png",
  "images/heroes/hero-page-connect.png",
];

const preloadedHeroImageUrls = new Set();

function assetUrl(path) {
  if (!path) return "";
  return `${import.meta.env.BASE_URL}${path}`;
}

function preloadHeroImage(path, priority = "low") {
  if (!path || typeof window === "undefined") return;
  const url = assetUrl(path);
  if (preloadedHeroImageUrls.has(url)) return;
  preloadedHeroImageUrls.add(url);

  const image = new Image();
  image.decoding = "async";
  image.fetchPriority = priority;
  image.src = url;
}

const AUTO_IMAGE_PREFIXES = new Set([
  "AM", "AS", "CC", "CO", "CR", "DN", "DS", "HB", "HBP", "IT", "JJ", "KR", "LF",
  "MR", "MX", "PM", "QP", "CS", "RS", "SB", "SD", "SF", "SG", "SW"
]);

const HERO_IMAGES = [
  "images/thumbs/heroes/hero-grill-wide.jpg",
  "images/thumbs/heroes/hero-pasta-wide.jpg",
  "images/thumbs/heroes/hero-salad-wide.jpg",
  "images/thumbs/heroes/hero-brisket-wide.jpg",
  "images/thumbs/heroes/hero-cake-wide.jpg",
  "images/thumbs/heroes/hero-shrimp-wide.jpg",
];

const HERO_INFO_BUTTONS = [
  {
    title: "Why Robert’s Recipe Box Is Free",
    line1: "ALWAYS FREE",
    line2: "TO USE",
    textParts: [
      "Robert’s Recipe Box is designed to be a helpful, easy-to-use cooking resource without a required subscription. You can browse recipes, save favorites, plan meals, and build shopping lists at no charge.",
      "My goal is to make meal planning simpler for seniors, couples, empty nesters, and smaller households.",
      "Some pages may include optional product recommendations or affiliate links. Those links may help support the cost of maintaining and improving the website. However, you are NEVER required to make a purchase to use Robert’s Recipe Box.",
    ],
  },
  {
    title: "Browse Our Recipe Library",
    line1: "BROWSE OUR",
    line2: "RECIPES",
    textParts: [
      "Explore our recipe cards organized into easy-to-browse food categories.",
      "You can search for a specific recipe, meal idea, ingredient, or type of cuisine. Open any recipe card to review the ingredients, directions, servings, and nutrition information.",
      "Use the recipe viewer to move forward or backward through a collection. You can also print or download recipe cards for use in your kitchen.",
      "New recipes and categories will continue to be added as the website grows.",
    ],
  },
  {
    title: "Save Your Favorite Recipes",
    line1: "SELECT YOUR",
    line2: "FAVORITES",
    textParts: [
      "Tap the heart on any recipe to add it to your personal Favorites collection. Saving favorites makes recipes you enjoy easier to find the next time you visit.",
      "Your favorites are stored in the browser on the device you are currently using. No account, password, or paid membership is required. Favorites saved on one device may not automatically appear on another device.",
      "You can add or remove recipes from your Favorites list at any time.",
    ],
  },
  {
    title: "Plan Your Weekly Meals",
    line1: "PLAN YOUR",
    line2: "WEEKLY MEALS",
    textParts: [
      "Use the meal planner to organize dinners for one or two weeks at a time. Choose recipes from the library and place them on the days that work best for you. Add main and side dishes for each day.",
      "Plan fresh meals, planned leftovers, simple meals, and freezer meals together.",
      "Recipes can be arranged around your schedule, household size, and cooking routine. A thoughtful plan can reduce repeat shopping, unused ingredients, and last-minute meal decisions.",
      "When your plan is ready, use it to create one combined grocery list.",
    ],
  },
  {
    title: "Create Your Grocery List",
    line1: "MAKE YOUR",
    line2: "GROCERY LIST",
    textParts: [
      "Your selected meal-plan recipes can be combined into one organized grocery list. Repeated ingredients are grouped together to make shopping easier.",
      "Review your pantry staples before buying items you may already have at home. The list can help separate needed groceries from ingredients already in your pantry. And, you can check off items while shopping or print a condensed list before leaving home.",
      "Actual quantities may need minor adjustments based on brands, package sizes, and substitutions.",
    ],
  },
  {
    title: "Practical Tips & Suggestions",
    line1: "TIPS &",
    line2: "SUGGESTIONS",
    textParts: [
      "Find practical ideas for cooking, meal planning, food storage, and freezer preparation.",
      "Review optional lower-calorie, lower-carb, lower-sodium, and higher-protein suggestions.",
      "Learn ways to divide recipes into useful portions for one- or two-person households.",
      "Explore tips for planned leftovers, reheating meals, and freezing extra servings safely.",
      "You may also find helpful grocery substitutions, kitchen-product ideas, and organization tips.",
      "Use the suggestions that fit your tastes, budget, equipment, and personal needs.",
    ],
  },
];




const HOME_KITCHEN_TOOL_SLIDES = [
  { title: "32-Ounce Deli Containers", image: "images/products/hero-amazon-32oz-deli-a.png" },
  { title: "Baguette Bread Pan", image: "images/products/hero-amazon-baguette-a.png" },
  { title: "Cupcake & Muffin Pans", image: "images/products/hero-amazon-cupcakes-a.png" },
  { title: "Mini Canning Jars", image: "images/products/hero-amazon-mini-jars-a.png" },
  { title: "Mini Meal Pans", image: "images/products/hero-amazon-mini-meals-a.png" },
  { title: "Pullman Bread Pan", image: "images/products/hero-amazon-pullman-a.png" },
  { title: "Silicone Freezer Trays", image: "images/products/hero-amazon-silicone-a.png" },
];

const PRODUCTS_I_USE = [
  {
    title: "Aluminum Mini Bread Pans",
    image: "images/products/hero-amazon-mini-meals.png",
    note: "Small disposable pans for mini loaves, freezer portions, gift breads, and make-ahead meals.",
    affiliateUrl: "https://www.amazon.com/dp/B0DQ4VVWSB?ref_=ppx_hzsearch_conn_dt_b_fed_asin_title_4&th=1",
  },
  {
    title: "Aluminum 4-Inch Pie Pans",
    image: "images/products/aluminum-4in-pie-pans.jpg",
    note: "Small disposable pie pans for personal pies, quiche portions, desserts, and freezer-friendly servings.",
    affiliateUrl: "https://www.amazon.com/dp/B083962QCL?ref_=ppx_hzsearch_conn_dt_b_fed_asin_title_2&th=1",
  },
  {
    title: "Aluminum Cupcake Pans",
    image: "images/products/hero-amazon-cupcakes.png",
    note: "Disposable cupcake or muffin pans for small-batch baking, easy cleanup, and portioned treats.",
    affiliateUrl: "https://www.amazon.com/dp/B06XTYFZH6?ref_=ppx_hzsearch_conn_dt_b_fed_asin_title_24&th=1",
  },
  {
    title: "Aluminum Mini Cake Pans",
    image: "images/products/hero-amazon-mini-cakes.png",
    note: "Small disposable cake pans for desserts, small loaves, gifting, and freezer-friendly portions.",
    affiliateUrl: "https://www.amazon.com/dp/B0DQ4WFXBT?ref_=ppx_hzsearch_conn_dt_b_fed_asin_title_1&th=1",
  },
  {
    title: "Ball 2-Ounce Jars",
    image: "images/products/ball-2oz-jars.jpg",
    note: "Small jars for sauces, dressings, jams, seasoning mixes, toppings, and portioned condiments.",
  },
  {
    title: "Ball 4-Ounce Jars",
    image: "images/products/hero-amazon-pickles.png",
    note: "Useful jars for small desserts, sauces, overnight oats, fruit portions, and pantry organization.",
  },
  {
    title: "Ball 8-Ounce Jars",
    image: "images/products/hero-amazon-mini-jars.png",
    note: "Everyday jars for leftovers, soups, salads, snacks, sauces, and small make-ahead portions.",
  },
  {
    title: "Baguette Bread Pan",
    image: "images/products/hero-amazon-baguette.png",
    note: "A perforated bread pan for baking baguettes, sub rolls, and crustier homemade breads.",
    affiliateUrl: "https://www.amazon.com/dp/B0912CCQSN?ref_=ppx_hzsearch_conn_dt_b_fed_asin_title_7&th=1",
  },
  {
    title: "Bread Machine",
    image: "images/products/hero-amazon-bread-machine.png",
    note: "A countertop bread machine for simple homemade bread, dough cycles, and small-batch baking.",
  },
  {
    title: "Pullman Bread Pan",
    image: "images/products/hero-amazon-pullman.png",
    note: "A lidded loaf pan for sandwich bread, square loaves, and consistent homemade slices.",
    affiliateUrl: "https://www.amazon.com/dp/B0D7D53QDG?ref_=ppx_hzsearch_conn_dt_b_fed_asin_title_7",
  },
  {
    title: "8-Ounce Deli Containers",
    image: "images/products/hero-amazon-8oz-deli.png",
    note: "Small plastic containers for sauces, fruit, snacks, toppings, and small leftovers.",
    affiliateUrl: "https://www.amazon.com/dp/B0DX8LVYXV?ref_=ppx_hzsearch_conn_dt_b_fed_asin_title_3&th=1",
  },
  {
    title: "16-Ounce Deli Containers",
    image: "images/products/hero-amazon-16oz-deli.png",
    note: "Mid-size containers for leftovers, soups, chopped ingredients, and freezer portions.",
    affiliateUrl: "https://www.amazon.com/dp/B0DX7M3Y66?ref_=ppx_hzsearch_conn_dt_b_fed_asin_title_5&th=1",
  },
  {
    title: "32-Ounce Deli Containers",
    image: "images/products/hero-amazon-32oz-deli.png",
    note: "Larger containers for soups, sauces, meal-prep portions, and freezer storage.",
    affiliateUrl: "https://www.amazon.com/dp/B0DX7L9RSN?ref_=ppx_hzsearch_conn_dt_b_fed_asin_title_5&th=1",
  },
  {
    title: "Silicone Freezer Trays",
    image: "images/products/hero-amazon-silicone.png",
    note: "Portion trays for freezing soups, sauces, broth, cooked meats, and individual meal components.",
  },
  {
    title: "Vacuum Sealer Jar Attachment",
    image: "images/products/vacuum-sealer-jar.jpg",
    note: "A jar-sealing tool for helping store dry goods, sauces, and pantry items in mason jars.",
  },
];


const ABOUT_STORY_PHOTOS = [
  {
    src: "images/about/robert-pete-puppy2.jpg",
    alt: "Robert holding Pete as a small puppy",
  },
  {
    src: "images/about/welcome-family-framed-photo.jpg",
    alt: "Robert in the pool with Pete",
  },
  {
    src: "images/about/welcome-pete-framed-photo.jpg",
    alt: "Robert resting with Pete as a puppy",
  },
];

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const PLANNER_WEEKS = [
  { id: "week1", title: "Week 1", subtitle: "First 7 dinners" },
  { id: "week2", title: "Week 2", subtitle: "Second 7 dinners" },
];

const PLANNER_SLOTS = PLANNER_WEEKS.flatMap((week) =>
  WEEK_DAYS.map((day) => ({ key: `${week.id}-${day}`, weekId: week.id, day }))
);

function emptyTwoWeekPlan() {
  return PLANNER_SLOTS.reduce((plan, slot) => {
    plan[slot.key] = [];
    return plan;
  }, {});
}

function normalizeTwoWeekPlan(savedPlan) {
  const normalized = emptyTwoWeekPlan();

  if (!savedPlan || typeof savedPlan !== "object") {
    return normalized;
  }

  PLANNER_SLOTS.forEach((slot) => {
    if (Array.isArray(savedPlan[slot.key])) {
      normalized[slot.key] = savedPlan[slot.key];
    }
  });

  // Preserve older one-week saved plans by moving Mon-Sun into Week 1.
  WEEK_DAYS.forEach((day) => {
    const legacyItems = savedPlan[day];
    if (Array.isArray(legacyItems) && legacyItems.length) {
      normalized[`week1-${day}`] = legacyItems;
    }
  });

  return normalized;
}

function plannerSlotLabel(slotKey = "") {
  const [weekId, day] = slotKey.split("-");
  const week = PLANNER_WEEKS.find((item) => item.id === weekId);
  return week && day ? `${week.title} ${day}` : slotKey;
}

function plannedMealCount(plan) {
  return Object.values(plan || {}).reduce(
    (total, dayRecipes) => total + (Array.isArray(dayRecipes) ? dayRecipes.length : 0),
    0
  );
}


function recipeCodePrefix(recipeId = "") {
  const match = recipeId.match(/^[A-Z]+/);
  return match ? match[0] : "";
}

function recipeImageCandidates(recipe) {
  const candidates = [];
  const prefix = recipeCodePrefix(recipe.id);

  if (recipe.id && AUTO_IMAGE_PREFIXES.has(prefix)) {
    candidates.push(`images/thumbs/recipes/${recipe.id}.jpg`);
    candidates.push(`images/thumbs/recipes/${recipe.id} .jpg`);
    candidates.push(`images/heroes/${recipe.id}.jpg`);
    candidates.push(`images/heroes/${recipe.id} .jpg`);
  }

  if (recipe.heroImage) candidates.push(recipe.heroImage);
  if (recipe.image) candidates.push(recipe.image);

  if (recipe.id && AUTO_IMAGE_PREFIXES.has(prefix)) {
    candidates.push(`images/heroes/${recipe.id}.png`);
    candidates.push(`images/heroes/${recipe.id} .png`);
    candidates.push(`images/recipes/${recipe.id}.jpg`);
    candidates.push(`images/recipes/${recipe.id}.JPG`);
    candidates.push(`images/recipes/${recipe.id}.png`);
    candidates.push(`images/recipes/${recipe.id} .jpg`);
    candidates.push(`images/recipes/${recipe.id} .JPG`);
    candidates.push(`images/recipes/${recipe.id} .png`);
  }

  return [...new Set(candidates)];
}

function previewCardImageCandidates(recipe) {
  const candidates = [];
  const prefix = recipeCodePrefix(recipe.id);

  if (recipe.id && AUTO_IMAGE_PREFIXES.has(prefix)) {
    candidates.push(`images/thumbs/recipes/${recipe.id}.jpg`);
    candidates.push(`images/thumbs/recipes/${recipe.id} .jpg`);
  }

  if (recipe.cardImage) candidates.push(recipe.cardImage);
  if (recipe.image) candidates.push(recipe.image);

  if (recipe.id && AUTO_IMAGE_PREFIXES.has(prefix)) {
    candidates.push(`images/recipes/${recipe.id}.jpg`);
    candidates.push(`images/recipes/${recipe.id}.JPG`);
    candidates.push(`images/recipes/${recipe.id}.png`);
    candidates.push(`images/recipes/${recipe.id} .jpg`);
    candidates.push(`images/recipes/${recipe.id} .JPG`);
    candidates.push(`images/recipes/${recipe.id} .png`);
  }

  if (recipe.heroImage) candidates.push(recipe.heroImage);

  if (recipe.id && AUTO_IMAGE_PREFIXES.has(prefix)) {
    candidates.push(`images/heroes/${recipe.id}.png`);
    candidates.push(`images/heroes/${recipe.id} .png`);
  }

  return [...new Set(candidates)];
}

function fullCardImageCandidates(recipe) {
  const candidates = [];
  const prefix = recipeCodePrefix(recipe.id);

  if (recipe.cardImage) candidates.push(recipe.cardImage);
  if (recipe.image) candidates.push(recipe.image);

  if (recipe.id && AUTO_IMAGE_PREFIXES.has(prefix)) {
    candidates.push(`images/recipes/${recipe.id}.png`);
    candidates.push(`images/recipes/${recipe.id}.jpg`);
    candidates.push(`images/recipes/${recipe.id}.JPG`);
    candidates.push(`images/recipes/${recipe.id} .png`);
    candidates.push(`images/recipes/${recipe.id} .jpg`);
    candidates.push(`images/recipes/${recipe.id} .JPG`);
  }

  if (recipe.id && AUTO_IMAGE_PREFIXES.has(prefix)) {
    candidates.push(`images/thumbs/recipes/${recipe.id}.jpg`);
    candidates.push(`images/thumbs/recipes/${recipe.id} .jpg`);
  }

  if (recipe.heroImage) candidates.push(recipe.heroImage);

  if (recipe.id && AUTO_IMAGE_PREFIXES.has(prefix)) {
    candidates.push(`images/heroes/${recipe.id}.png`);
    candidates.push(`images/heroes/${recipe.id} .png`);
  }

  return [...new Set(candidates)];
}

let popupPageModeUsers = 0;

function usePopupPageMode(isOpen) {
  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return undefined;

    popupPageModeUsers += 1;
    document.body.classList.add("rrbPopupOpen");

    return () => {
      popupPageModeUsers = Math.max(0, popupPageModeUsers - 1);
      if (popupPageModeUsers === 0) {
        document.body.classList.remove("rrbPopupOpen");
      }
    };
  }, [isOpen]);
}

function isSaladJarRecipe(recipe) {
  if (!recipe?.id) return false;
  const match = String(recipe.id).match(/^SB-(\d{3})$/i);
  if (!match) return false;
  const number = Number(match[1]);
  return number >= 1 && number <= 19;
}

function constructionCalloutImageCandidates(recipe) {
  if (!isSaladJarRecipe(recipe)) return [];

  const calloutId = `${recipe.id}c`;
  return [
    `images/recipes/${calloutId}.jpg`,
    `images/recipes/${calloutId}.JPG`,
    `images/recipes/${calloutId} .jpg`,
    `images/recipes/${calloutId} .JPG`,
    `images/callouts/${calloutId}.jpg`,
    `images/callouts/${calloutId}.JPG`,
  ];
}


const MEAL_BALANCE_VERSION = "MB-1.0";

const MEAL_BALANCE_RANGES = [
  { min: 1, max: 2, label: "Very Light" },
  { min: 3, max: 4, label: "Balanced" },
  { min: 5, max: 6, label: "Moderate" },
  { min: 7, max: 8, label: "Rich" },
  { min: 9, max: 10, label: "Indulgent" },
];

function getMealBalanceScore(item) {
  const rawScore = item?.mealBalance?.score;
  const score = typeof rawScore === "number" ? rawScore : Number(rawScore);
  return Number.isInteger(score) && score >= 1 && score <= 10 ? score : null;
}

function getMealBalanceLabel(item) {
  const score = getMealBalanceScore(item);
  if (score === null) return "Not Yet Rated";

  const suppliedLabel = String(item?.mealBalance?.label || "").trim();
  if (suppliedLabel && suppliedLabel.toLowerCase() !== "not yet rated") {
    return suppliedLabel;
  }

  return MEAL_BALANCE_RANGES.find((range) => score >= range.min && score <= range.max)?.label || "Not Yet Rated";
}

function isMealBalanceRated(item) {
  return getMealBalanceScore(item) !== null && item?.mealBalance?.status !== "unrated";
}

function mealBalanceMatchesFilter(item, filterValue) {
  if (!filterValue || filterValue === "all") return true;

  const score = getMealBalanceScore(item);
  if (filterValue === "unrated") return score === null || !isMealBalanceRated(item);
  if (score === null || !isMealBalanceRated(item)) return false;

  const [minimum, maximum] = filterValue.split("-").map(Number);
  return score >= minimum && score <= maximum;
}

function MealBalanceBadge({ item, showUnrated = false, className = "" }) {
  const score = getMealBalanceScore(item);
  const rated = isMealBalanceRated(item);

  if (!rated && !showUnrated) return null;

  const text = rated ? `MB ${score}` : "Not Yet Rated";
  const classes = ["mealBalanceBadge", rated ? "rated" : "unrated", className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} title={rated ? `MealBalance ${score} — ${getMealBalanceLabel(item)}` : "MealBalance: Not Yet Rated"}>
      {text}
    </span>
  );
}

function MealBalanceDetails({ item, prefix = "MealBalance", className = "" }) {
  const score = getMealBalanceScore(item);
  const rated = isMealBalanceRated(item);

  return (
    <div className={["mealBalanceDetails", className].filter(Boolean).join(" ")}>
      <strong>{prefix}:</strong>{" "}
      {rated ? `MB ${score} — ${getMealBalanceLabel(item)}` : "Not Yet Rated"}
    </div>
  );
}

function MealBalanceInfo({ compact = false }) {
  const [open, setOpen] = useState(false);

  return (
    <span className={compact ? "mealBalanceInfo compact" : "mealBalanceInfo"}>
      <button
        type="button"
        className="mealBalanceInfoButton"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label="About MealBalance"
      >
        MB info
      </button>
      {open && (
        <span className="mealBalanceInfoBubble" role="tooltip">
          <button type="button" onClick={() => setOpen(false)} aria-label="Close MealBalance information">×</button>
          MealBalance is Robert’s Recipe Box’s independent nutritional comparison system. Ratings are estimates based on nutrition information per serving. MealBalance is not affiliated with or based on any commercial diet program and is provided for general informational purposes only.
        </span>
      )}
    </span>
  );
}

const NAV_GROUPS = [
  {
    label: "ABOUT",
    items: [
      { label: "WELCOME TO OUR SITE", page: "About" },
      { label: "ABOUT OUR RECIPES", page: "About Recipes" },
      { label: "AFFILIATE MARKETING", page: "Affiliate Marketing" },
      { label: "SUBMIT YOUR FAMILY RECIPES", page: "Submit Recipes" },
      { label: "CONTACT ME", page: "Contact Me" },
      { label: "DISCLAIMERS", page: "Disclaimers" },
    ],
  },
  {
    label: "OUR RECIPES",
    items: [
      { label: "BROWSE OUR RECIPE LIBRARY", page: "Recipes" },
      { label: "DINNER COMBINATIONS", page: "Dinner Combinations" },
      { label: "QUICK & EASY FREEZER MEALS", page: "Freezer-Friendly Meals" },
    ],
  },
  {
    label: "COLLECTIONS",
    items: [
      { label: "BROWSE ALL COLLECTIONS", page: "Collections" },
      { label: "SLOW COOKER MEALS", page: "Slow Cooker Favorites" },
      { label: "SUMMER COOKOUTS", page: "Summer Cookouts" },
      { label: "HEALTHY DINNERS", page: "Healthy Dinners" },
      { label: "COMFORT FOODS", page: "Comfort Foods" },
      { label: "EASY 30-MINUTE MEALS", page: "Easy 30-Minute Meals" },
      { label: "SALAD JAR LUNCHES", page: "Salad Jars" },
    ],
  },
  {
    label: "YOUR KITCHEN",
    items: [
      { label: "YOUR WEEKLY MEAL PLANNER", page: "Meal Planner" },
      { label: "YOUR FAVORITE RECIPES", page: "Favorites" },
      { label: "REFRIGERATOR INVENTORY", page: "Kitchen Refrigerator" },
      { label: "FREEZER INVENTORY", page: "Kitchen Freezer" },
      { label: "PANTRY INVENTORY", page: "Pantry Staples" },
    ],
  },
  {
    label: "SHOPPING",
    items: [
      { label: "YOUR GROCERY LIST", page: "Shopping Lists" },
      { label: "COOKING TOOLS & PRODUCTS", page: "Products I Use" },
      { label: "STORAGE & ORGANIZATION", page: "Storage Organization" },
    ],
  },
  {
    label: "TIPS & GUIDES",
    items: [
      { label: "TIPS: AIR FRYERS", page: "Air Fryer Recipes" },
      { label: "TIPS: MICROWAVE OVENS", page: "Microwave Recipes" },
      { label: "TIPS: GAS GRILLS", page: "Gas Grill Recipes" },
      { label: "TIPS: PELLET SMOKERS", page: "Smoker Recipes" },
      { label: "TIPS: OVENS", page: "Oven Recipes" },
      { label: "TIPS: BREAD MAKING", page: "Bread Tips" },
      { label: "HEALTHY SUBSTITUTIONS", page: "Grocery Picks" },
      { label: "FOOD SAFETY", page: "Safe Cooking Rules" },
      { label: "REFERENCE GUIDES", page: "Reference Guides" },
      { label: "FREEZING AND REHEATING", page: "Freezer Tips" },
    ],
  },
];

const PAGE_NAVIGATION_ORDER = NAV_GROUPS.flatMap((group) =>
  group.items.filter((item) => item.page).map((item) => item.page)
);

const PageNavigationContext = createContext({
  activePage: "Home",
  setActivePage: () => {},
});

function Header({ activePage, setActivePage }) {
  const navGroups = NAV_GROUPS;
  function openPage(page) {
    if (!page) return;
    setActivePage(page);
  }

  function firstNavigablePage(group) {
    return group.items.find((item) => item.page)?.page || "Home";
  }

  function groupIsActive(group) {
    return group.items.some((item) => item.page && activePage === item.page);
  }

  return (
    <header className="topbar">
      <button
        className="brand brandLogoButton"
        onClick={() => setActivePage("Home")}
        aria-label="Go home"
      >
        <img
          className="brandLogoImage"
          src={`${import.meta.env.BASE_URL}images/ui/rrb-logo-wide.png`}
          alt="Robert's Recipe Box"
        />
      </button>

      <nav className="navLinks dropdownNav" aria-label="Main navigation">
        {navGroups.map((group) => (
          <div
            className={groupIsActive(group) ? "navDropdown active" : "navDropdown"}
            key={group.label}
          >
            <button
              className="navDropdownButton"
              type="button"
              onClick={() => openPage(firstNavigablePage(group))}
              aria-haspopup="true"
            >
              {group.label}
              <span aria-hidden="true">⌄</span>
            </button>

            <div className="navDropdownMenu">
              {group.items.map((item, index) => {
                const itemClasses = [
                  "navDropdownItem",
                  item.level ? `navDropdownLevel${item.level}` : "navDropdownLevel0",
                  activePage === item.page ? "active" : "",
                  item.labelOnly ? "navDropdownLabel" : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                if (item.labelOnly) {
                  return (
                    <div
                      key={`${group.label}-${item.label}-${index}`}
                      className={itemClasses}
                    >
                      {item.label}
                    </div>
                  );
                }

                return (
                  <button
                    key={`${group.label}-${item.label}-${index}`}
                    className={itemClasses}
                    type="button"
                    onClick={() => openPage(item.page)}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

    </header>
  );
}



function getHeroInfoTargetPage(title) {
  switch (title) {
    case "Plan Your Weekly Meals":
      return "Meal Planner";
    case "Create Your Grocery List":
      return "Shopping Lists";
    default:
      return "Under Construction";
  }
}

function getHeroInfoMoreInfoLabel(title) {
  switch (title) {
    case "Plan Your Weekly Meals":
      return "Plan Your Meals";
    case "Create Your Grocery List":
      return "Go To Your Shopping List";
    default:
      return "Read More";
  }
}


function HeroInfoButtons({ setActivePage }) {
  const [openInfo, setOpenInfo] = useState(null);

  return (
    <div className="heroInfoButtons" aria-label="Homepage quick information">
      {HERO_INFO_BUTTONS.map((item, index) => (
        <div className="heroInfoButtonWrap" key={item.title}>
          <button
            type="button"
            className="heroInfoButton"
            onClick={() =>
              setOpenInfo((current) => (current === item.title ? null : item.title))
            }
            aria-expanded={openInfo === item.title}
          >
            <span className="heroInfoStepNumber" aria-hidden="true">{index + 1}</span>
            <span>{item.line1}</span>
            <span>{item.line2}</span>
          </button>

          {openInfo === item.title && (
            <div className="heroInfoPopup">
              <div className="heroInfoPopupHeader">
                <strong>{item.title}</strong>
                <button
                  type="button"
                  onClick={() => setOpenInfo(null)}
                  aria-label={`Close ${item.title} information`}
                >
                  ×
                </button>
              </div>
              <ul className="heroInfoBulletList">
                {item.textParts.map((sentence, index) => (
                  <li key={`${item.title}-sentence-${index}`}>
                    <span className="heroInfoBulletHeart" aria-hidden="true">♥</span>
                    <span>{sentence}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className="heroInfoMoreButton"
                onClick={() => {
                  setOpenInfo(null);
                  setActivePage(getHeroInfoTargetPage(item.title));
                }}
              >
                {getHeroInfoMoreInfoLabel(item.title)}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Hero({ setActivePage }) {
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % HERO_IMAGES.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="hero">
      <div className="heroRotator" aria-hidden="true">
        {HERO_IMAGES.map((imagePath, index) => (
          <img
            key={imagePath}
            className={index === heroIndex ? "heroRotatorImage active" : "heroRotatorImage"}
            src={`${import.meta.env.BASE_URL}${imagePath}`}
            alt=""
            decoding="async"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ))}
      </div>

      <div className="heroOverlay" aria-hidden="true" />

      <div className="heroCopy">
        <div className="aiBadge">✧ AI-POWERED RECIPE PLANNING ✧</div>

        <h1>Plan. Cook. Eat. Freeze. Save.</h1>

        <p>Welcome to my free recipe-card and meal-planning site. I use it every week for my own meal planning, and I designed it especially for seniors, couples, empty nesters, and smaller households who want practical meals, useful leftovers, freezer-friendly ideas, and organized grocery lists. <strong>Shop smarter. Save more.</strong></p>

        <div className="heroButtons">
          <button className="primary" onClick={() => setActivePage("Recipes")}>
            ▣ Browse Our Recipe Library
          </button>
          <button
            className="secondary"
            onClick={() => setActivePage("Meal Planner")}
          >
            ▣ Start Meal Planning
          </button>
          <button
            className="secondary freezerHeroButton"
            onClick={() => setActivePage("Freezer Tips")}
          >
            ▣ Freezer Tips
          </button>
        </div>
      </div>
      <HeroInfoButtons setActivePage={setActivePage} />

    </section>
  );
}

function TransparencyLine({ setActivePage }) {
  return (
    <div className="transparencyLine">
      Honesty: I use AI assistance to generate recipes. I’m not a chef. I do not
      copy recipes from others; I simply tell AI what I want and let it generate
      the recipes for me.{" "}
      <button
        type="button"
        className="transparencyLink"
        onClick={() => setActivePage("Disclaimers")}
      >
        Read my disclaimers.
      </button>
    </div>
  );
}

function CategoryGrid({ setFilter, setActivePage }) {
  const categoryLookup = new Map(categories.map((category) => [category.id, category]));
  const homeCategories = HOME_CATEGORY_CODES.map((code) => {
    const fallback = HOME_CATEGORY_FALLBACKS[code];
    const existing = categoryLookup.get(code);

    return {
      ...fallback,
      ...(existing || {}),
      displayName: HOME_CATEGORY_LABELS[code],
      iconImage: CATEGORY_ICON_IMAGES[code],
    };
  });

  function openCategory(category) {
    const matchingCategory = categories.find((item) => item.id === category.id);
    setFilter(matchingCategory?.name || category.name);
    setActivePage("Recipes");
  }

  return (
    <section className="section homeCategorySection">
      <div className="sectionTitle homeCategoryTitle">
        <h2>Browse by Category</h2>
        <button onClick={() => setActivePage("Recipes")}>View all categories ›</button>
      </div>

      <div className="categoryGrid homeCategoryGrid">
        {homeCategories.map((cat) => (
          <button
            key={cat.id}
            className={HOME_CATEGORY_CODES.indexOf(cat.id) >= 10 ? "categoryTile homeCategoryTile secondRowCategoryTile" : "categoryTile homeCategoryTile"}
            onClick={() => openCategory(cat)}
            aria-label={`View ${cat.displayName} recipes`}
          >
            <img
              className="categoryIconImage"
              src={`${import.meta.env.BASE_URL}${cat.iconImage}`}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              onError={(event) => {
                event.currentTarget.style.display = "none";
                const fallback = event.currentTarget.nextElementSibling;
                if (fallback) fallback.style.display = "grid";
              }}
            />
            <span className="categoryIcon categoryIconFallback" aria-hidden="true">
              {cat.icon}
            </span>
            <strong>{cat.displayName}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}

function RecipeImage({ recipe }) {
  const candidates = recipeImageCandidates(recipe);
  const [imageIndex, setImageIndex] = useState(0);
  const imagePath = candidates[imageIndex];

  useEffect(() => {
    setImageIndex(0);
  }, [recipe.id]);

  if (imagePath) {
    return (
      <div className="recipeImage recipePhoto">
        <img
          src={`${import.meta.env.BASE_URL}${imagePath}`}
          alt={recipe.title}
          loading="lazy"
          decoding="async"
          onError={() => setImageIndex((current) => current + 1)}
        />
      </div>
    );
  }

  return (
    <div className="recipeImage" style={{ background: recipe.imageStyle }}>
      <span>{recipe.emoji}</span>
    </div>
  );
}

function FullRecipeCardPreview({ recipe, onOpen }) {
  const candidates = previewCardImageCandidates(recipe);
  const [imageIndex, setImageIndex] = useState(0);
  const imagePath = candidates[imageIndex];

  useEffect(() => {
    setImageIndex(0);
  }, [recipe.id]);

  if (imagePath) {
    return (
      <button
        className="recipeImage recipeFullCardImage recipeFullCardImageButton"
        onClick={onOpen}
        aria-label={`Open ${recipe.title} recipe card`}
      >
        <img
          src={`${import.meta.env.BASE_URL}${imagePath}`}
          alt={`${recipe.id} ${recipe.title} recipe card`}
          loading="lazy"
          decoding="async"
          onError={() => setImageIndex((current) => current + 1)}
        />
      </button>
    );
  }

  return <RecipeImage recipe={recipe} />;
}

function getRecipeBrowseTags(recipe) {
  const title = recipe.title.toLowerCase();
  const tags = [];

  function addTag(tag) {
    if (tag && !tags.includes(tag)) tags.push(tag);
  }

  if (recipe.category === 'Side Dishes') addTag('Side Dish');
  else if (recipe.category === 'Salads & Bowls') addTag('Salad');
  else addTag(recipe.category);

  if (title.includes('casserole') || title.includes('bake') || title.includes('lasagna') || title.includes('pot pie')) {
    addTag('Casserole');
  }

  if (title.includes('pasta') || title.includes('alfredo') || title.includes('spaghetti') || title.includes('ziti') || title.includes('mac')) {
    addTag('Pasta');
  }

  if (Number(recipe.time) <= 30) {
    addTag('Quick & Easy');
  }

  if (Number(recipe.servings) >= 6 || title.includes('casserole') || title.includes('bake')) {
    addTag('Family Favorite');
  }

  if (title.includes('taco') || title.includes('mac') || title.includes('pizza') || title.includes('cheese')) {
    addTag('Kid Friendly');
  }

  return tags.slice(0, 3);
}


function titleIncludes(recipe, terms) {
  const text = `${recipe.id || ""} ${recipe.title || ""} ${recipe.category || ""}`.toLowerCase();
  return terms.some((term) => text.includes(term));
}

function getRecipeSmartTips(recipe) {
  const category = recipe.categoryCode || "";
  const isDessert = ["CC", "CO", "CR", "DN", "DS", "JJ", "PM"].includes(category);
  const isBread = ["LF", "KR"].includes(category);
  const isSeafood = category === "SF";
  const isMexican = category === "MX";
  const isItalian = category === "IT";
  const isBurger = category === "HB" || category === "HBP";
  const isSalad = category === "SB";
  const isSide = category === "SD";
  const isSmoked = category === "SG";

  const tips = {
    calories: "Use smaller portions, measure sauces and cheese, and add vegetables or salad on the side.",
    carbs: "Reduce bread, pasta, rice, crust, or sugar where possible; use lower-carb swaps when the texture still works.",
    sodium: "Choose reduced-sodium sauces, broths, canned goods, and seasoning blends; taste before adding extra salt.",
    protein: "Add lean protein or use a higher-protein version of the main ingredient when possible.",
  };

  if (isMexican) {
    tips.calories = "Use lean chicken or lean ground beef, go lighter on cheese and sour cream, and bulk up with lettuce, peppers, onions, or salsa.";
    tips.carbs = "Use low-carb tortillas, make it a bowl over cauliflower rice, or serve beans/rice in smaller portions.";
    tips.sodium = "Choose reduced-sodium taco seasoning, salsa, beans, broth, and enchilada sauce.";
    tips.protein = "Add extra grilled chicken, lean taco meat, shrimp, or Greek-yogurt topping instead of extra cheese.";
  }

  if (isItalian) {
    tips.calories = "Use part-skim mozzarella, lighter cream sauces, and add vegetables to stretch the meal without adding much fat.";
    tips.carbs = "Use protein pasta, smaller pasta portions, zucchini noodles, spaghetti squash, or a half pasta / half vegetable base.";
    tips.sodium = "Pick no-salt-added tomatoes, lower-sodium marinara, and go lighter on parmesan and cured meats.";
    tips.protein = "Add grilled chicken, turkey meatballs, shrimp, lean beef, or cottage-cheese/Greek-yogurt blended sauces.";
  }

  if (isBurger) {
    tips.calories = "Use a leaner patty, smaller bun, lighter cheese, and load up with lettuce, tomato, onions, and pickles.";
    tips.carbs = "Use a lettuce wrap, low-carb bun, half bun, or burger bowl instead of a full bun.";
    tips.sodium = "Use lower-sodium seasoning and sauces; go easy on pickles, bacon, processed cheese, and bottled condiments.";
    tips.protein = "Use lean ground beef, turkey, chicken, or a slightly larger patty with fewer high-calorie toppings.";
  }

  if (isSeafood) {
    tips.calories = "Bake, grill, or air fry instead of deep frying; use lemon, herbs, and light butter or olive oil.";
    tips.carbs = "Skip heavy breading or use a light almond-flour/panko mix; serve with vegetables or cauliflower rice.";
    tips.sodium = "Use salt-free seafood seasoning or reduced-sodium Old Bay-style seasoning; avoid heavy bottled sauces.";
    tips.protein = "Increase the seafood portion slightly or pair with Greek-yogurt slaw, cottage cheese, or a high-protein side.";
  }

  if (isSalad) {
    tips.calories = "Keep dressing on the side, measure nuts/cheese/croutons, and use Greek-yogurt-based dressings.";
    tips.carbs = "Limit croutons, tortilla strips, pasta, dried fruit, and sweet dressings.";
    tips.sodium = "Go lighter on deli meats, bacon, cheese, pickles, olives, and bottled dressings.";
    tips.protein = "Add grilled chicken, tuna, salmon, shrimp, eggs, cottage cheese, beans, or Greek-yogurt dressing.";
  }

  if (isSide) {
    tips.calories = "Use light butter, broth, herbs, or Greek yogurt instead of heavy cream or extra cheese.";
    tips.carbs = "Use cauliflower rice, roasted vegetables, smaller potato portions, or half-and-half starch/vegetable blends.";
    tips.sodium = "Use reduced-sodium broth, rinse canned vegetables/beans, and season with herbs before adding salt.";
    tips.protein = "Pair with lean protein, add beans where appropriate, or use Greek yogurt/cottage cheese in creamy sides.";
  }

  if (isSmoked) {
    tips.calories = "Choose leaner cuts when possible, trim visible fat, and measure BBQ sauce.";
    tips.carbs = "Use no-sugar-added BBQ sauce and serve with lower-carb sides like slaw, salad, or green vegetables.";
    tips.sodium = "Use a lower-sodium rub and avoid over-seasoning before smoking or grilling.";
    tips.protein = "Portion meat into two-serving freezer packs so protein is ready for future meals.";
  }

  if (isBread) {
    tips.calories = "Make smaller portions or rolls, freeze extras immediately, and use measured butter or spreads.";
    tips.carbs = "Homemade is a good option because you control ingredients; try smaller slices or partial whole-wheat blends.";
    tips.sodium = "Reduce added salt slightly in homemade dough and avoid salty processed fillings when possible.";
    tips.protein = "Use higher-protein flour blends, add Greek yogurt where appropriate, or pair bread with eggs, lean meats, or cottage cheese.";
  }

  if (isDessert) {
    tips.calories = "Make smaller portions, use mini servings, reduce frosting/toppings, or freeze individual portions.";
    tips.carbs = "Use lower-sugar fruit, sugar substitutes where they work, almond flour blends, or smaller crust portions.";
    tips.sodium = "Use unsalted butter and watch boxed mixes, canned fillings, and salty toppings.";
    tips.protein = "Add Greek yogurt, cottage cheese, protein powder, or serve with a higher-protein meal rather than eating alone.";
  }

  if (titleIncludes(recipe, ["fried", "fries", "fritter", "donut", "hush puppies", "egg rolls", "spring rolls"])) {
    tips.calories = "Air fry or bake instead of deep frying when possible; use a light oil spray and smaller portions.";
    tips.carbs = "Use lighter breading, smaller portions, or pair with a low-carb main dish.";
  }

  if (titleIncludes(recipe, ["rice bowl", "fried rice", "rice", "burrito bowl"])) {
    tips.carbs = "Use cauliflower rice, half cauliflower rice / half regular rice, or a smaller rice base with extra vegetables.";
    tips.protein = "Add extra chicken, shrimp, lean beef, eggs, or beans to make the bowl more filling.";
  }

  if (titleIncludes(recipe, ["pasta", "spaghetti", "ziti", "alfredo", "mac", "noodles", "lo mein", "chow mein"])) {
    tips.carbs = "Use protein pasta, zucchini noodles, hearts-of-palm pasta, spaghetti squash, or half pasta / half vegetables.";
    tips.protein = "Add grilled chicken, shrimp, lean beef, turkey meatballs, or cottage cheese blended into sauce.";
  }

  if (titleIncludes(recipe, ["casserole", "bake", "lasagna", "pot pie"])) {
    tips.calories = "Use lean protein, lighter cheese or sauce, and add vegetables to stretch the casserole.";
    tips.carbs = "Use a thinner crust, smaller pasta/rice layer, cauliflower rice, or extra vegetables.";
    tips.sodium = "Use reduced-sodium soups, broths, sauces, and canned vegetables.";
  }

  return tips;
}


function getRecipeCookingOptions(recipe) {
  const title = `${recipe.title || ""}`.toLowerCase();
  const category = recipe.categoryCode || "";

  const options = [];

  if (category === "SG" || title.includes("smoked") || title.includes("brisket") || title.includes("ribs")) {
    options.push({
      label: "Smoker / Pellet Grill",
      text: "Best for low-and-slow flavor. Cook to temperature, rest the meat when needed, and portion leftovers for sandwiches, bowls, tacos, or freezer meals.",
    });
  }

  if (title.includes("grilled") || title.includes("burger") || title.includes("hot dog") || title.includes("fajita")) {
    options.push({
      label: "Gas Grill",
      text: "Good for quick outdoor cooking. Watch hot spots, use a thermometer for meat, and keep cooked portions covered while resting.",
    });
  }

  if (
    title.includes("baked") ||
    title.includes("casserole") ||
    title.includes("pie") ||
    title.includes("quiche") ||
    title.includes("muffin") ||
    title.includes("bread") ||
    title.includes("roll") ||
    category === "QP" ||
    category === "PM" ||
    category === "LF"
  ) {
    options.push({
      label: "Oven",
      text: "Use the recipe-card temperature as a guide. Ovens vary, so begin checking near the early end of the cooking time.",
    });
  }

  if (
    title.includes("fried") ||
    title.includes("fries") ||
    title.includes("shrimp") ||
    title.includes("nugget") ||
    title.includes("egg roll")
  ) {
    options.push({
      label: "Air Fryer",
      text: "Useful for crisping smaller portions. Cook in a single layer, shake or turn halfway through, and reduce time if portions are small.",
    });
  }

  if (title.includes("soup") || title.includes("rice") || title.includes("reheat") || category === "SD") {
    options.push({
      label: "Microwave",
      text: "Helpful for reheating leftovers or simple sides. Cover loosely, stir when practical, and make sure reheated foods are hot throughout.",
    });
  }

  if (
    title.includes("skillet") ||
    title.includes("stir") ||
    title.includes("alfredo") ||
    title.includes("queso") ||
    title.includes("pasta") ||
    category === "AS" ||
    category === "MX" ||
    category === "IT"
  ) {
    options.push({
      label: "Stovetop",
      text: "Good for sauces, skillets, pasta dishes, and quick reheating. Use medium heat when reheating creamy sauces so they do not separate.",
    });
  }

  if (options.length === 0) {
    options.push({
      label: "Best Method",
      text: "Follow the method shown on the recipe card first. Adjust time, temperature, and equipment based on your kitchen and portion size.",
    });
  }

  return options.slice(0, 4);
}


function SmartTipsButton({ recipe, position = "inline" }) {
  const [open, setOpen] = useState(false);
  const tips = getRecipeSmartTips(recipe);
  usePopupPageMode(open);

  const wrapperClass =
    position === "viewerTop"
      ? "smartTipsWrap smartTipsViewerTopWrap"
      : "smartTipsWrap";

  return (
    <div className={wrapperClass}>
      <button
        type="button"
        className="smartTipsButton"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        Smart Tips
      </button>

      {open && (
        <div className="smartTipsBubble">
          <div className="smartTipsBubbleHeader">
            <strong>{recipe.title}</strong>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close smart tips">
              ×
            </button>
          </div>

          <ul>
            <li>
              <strong>Lower calorie:</strong> {tips.calories}
            </li>
            <li>
              <strong>Lower carb:</strong> {tips.carbs}
            </li>
            <li>
              <strong>Lower sodium:</strong> {tips.sodium}
            </li>
            <li>
              <strong>Higher protein:</strong> {tips.protein}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}



function getRecipePersonalNote(recipe) {
  if (recipe.personalNote?.text) {
    return {
      title: recipe.personalNote.title || "My Notes",
      text: recipe.personalNote.text,
    };
  }

  const category = recipe.categoryCode || "";
  const title = `${recipe.title || ""}`.toLowerCase();

  let text =
    "This is a practical recipe to keep in the rotation. I would think about how it fits a two-person meal plan, what can be saved for later, and whether the extra portion is better refrigerated or frozen.";

  if (category === "MX") {
    text = "For Mexican-style meals, I like making the filling first and then deciding how to serve it. Use tortillas for one meal, then make a bowl or salad with the leftovers. Low-carb tortillas, salsa, and a little less cheese can help keep it lighter.";
  } else if (category === "IT") {
    text = "Italian meals are often good planned-leftover meals. I would keep pasta portions reasonable, add extra protein or vegetables where possible, and freeze extra sauce or baked portions for another week.";
  } else if (category === "SB") {
    text = "For salads and bowls, I would keep the dressing separate until serving. These can be great for lunch the next day, especially when the protein is already cooked and portioned.";
  } else if (category === "SD") {
    text = "Side dishes are a good place to stretch a meal without making dinner complicated. I would make enough for today, then save a small portion to pair with another protein later in the week.";
  } else if (category === "SF") {
    text = "Seafood is usually best fresh, but simple cooked portions can still work for another meal if handled carefully. I would keep sauces light, add lemon or herbs, and avoid overcooking when reheating.";
  } else if (category === "SG") {
    text = "Smoked and grilled meats are perfect for cook-once, eat-twice planning. I would portion the extra meat into two-serving freezer packs so it is ready for sandwiches, bowls, salads, or quick dinners later.";
  } else if (category === "HB" || category === "HBP") {
    text = "Burgers and patties are easy to adapt. I would freeze extra patties between parchment, use a lighter bun or burger bowl when needed, and keep toppings simple so the meal stays practical.";
  } else if (category === "QP") {
    text = "Quiche and pies can work well for planned leftovers. I would cool slices completely, wrap them well, and reheat gently. A salad or vegetable side helps turn one slice into a full meal.";
  } else if (category === "PM") {
    text = "Protein muffins are useful for quick breakfasts or snacks. I would freeze extras individually so they are easy to pull out one at a time instead of leaving a whole batch on the counter.";
  } else if (["CC", "CO", "CR", "DN", "JJ"].includes(category)) {
    text = "For sweets, smaller portions are usually the best plan. I would freeze individual servings when possible so dessert is available without keeping the whole batch out at once.";
  } else if (["LF", "KR"].includes(category)) {
    text = "Homemade bread-style recipes let you control the ingredients. I would freeze extras early, label them clearly, and pull out only what is needed for a meal or two.";
  }

  if (title.includes("queso")) {
    text = "This is best served warm and is more of a treat or sharing recipe. For a lighter version, use a little less processed cheese, add tomatoes or peppers, and serve with baked chips, low-carb tortillas, or fresh vegetables. I would refrigerate leftovers and reheat gently instead of freezing.";
  } else if (title.includes("casserole") || title.includes("bake") || title.includes("lasagna")) {
    text = "This is the kind of recipe that fits the cook-once, eat-once, freeze-once idea. I would portion the extra servings into a two-person freezer container, label it with the date, and save it for a night when cooking from scratch feels like too much.";
  } else if (title.includes("soup") || title.includes("gumbo") || title.includes("bisque")) {
    text = "Soups are great freezer meals. I would cool the extra portion completely, freeze it flat in bags or in two-serving containers, and add fresh toppings only after reheating.";
  } else if (title.includes("fried") || title.includes("fries") || title.includes("fritter")) {
    text = "Fried-style foods are usually best fresh. If I wanted a lighter version, I would try the air fryer or oven, use a light oil spray, and make only the amount needed for the meal.";
  }

  return { title: "My Notes", text };
}

function MyRecipeNotesButton({ recipe, position = "inline" }) {
  const [open, setOpen] = useState(false);
  const note = getRecipePersonalNote(recipe);
  usePopupPageMode(open);

  const wrapperClass =
    position === "viewerTop"
      ? "recipeNotesWrap recipeNotesViewerTopWrap"
      : "recipeNotesWrap";

  return (
    <div className={wrapperClass}>
      <button
        type="button"
        className="recipeNotesButton"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        My Notes
      </button>

      {open && (
        <div className="recipeNotesBubble">
          <div className="recipeNotesPaper">
            <div className="recipeNotesHeader">
              <strong>{note.title}</strong>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close recipe notes">
                ×
              </button>
            </div>
            <p>{note.text}</p>
          </div>
        </div>
      )}
    </div>
  );
}


function ConstructionCalloutButton({ recipe }) {
  const [open, setOpen] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  usePopupPageMode(open);
  const [imageFailed, setImageFailed] = useState(false);
  const candidates = constructionCalloutImageCandidates(recipe);
  const imagePath = imageFailed ? "" : candidates[imageIndex];

  useEffect(() => {
    setImageIndex(0);
    setImageFailed(false);
  }, [recipe?.id]);

  function closePopup() {
    setOpen(false);
  }

  return (
    <div className="constructionCalloutWrap">
      <button
        type="button"
        className="constructionCalloutButton"
        onClick={() => setOpen(true)}
      >
        Build Your Salad
      </button>

      {open && (
        <div className="constructionCalloutOverlay" onClick={closePopup}>
          <div
            className="constructionCalloutModal"
            role="dialog"
            aria-modal="true"
            aria-label={`${recipe.id} build your salad guide`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="constructionCalloutHeader">
              <div>
                <small>{recipe.id}c</small>
                <strong>Build Your Salad</strong>
              </div>
              <button type="button" onClick={closePopup} aria-label="Close build your salad image">×</button>
            </div>

            <div className="constructionCalloutStage">
              {imagePath ? (
                <img
                  src={`${import.meta.env.BASE_URL}${imagePath}`}
                  alt={`${recipe.id} build your salad guide`}
                  decoding="async"
                  onError={() => {
                    setImageIndex((current) => {
                      const next = current + 1;
                      if (next < candidates.length) return next;
                      setImageFailed(true);
                      return current;
                    });
                  }}
                />
              ) : (
                <div className="constructionCalloutMissing">
                  <strong>Build Your Salad image not found.</strong>
                  <span>Upload public/images/recipes/{recipe.id}c.jpg</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RecipeCard({
  recipe,
  favorites,
  toggleFavorite,
  addToPlan,
  openRecipeCard,
  cardList = recipes,
  showPlannerButton = true,
  viewButtonText = "View Recipe",
  displayMode = "hero",
  viewerContext = "",
}) {
  const isBrowseCard = displayMode === "card";
  const browseTags = isBrowseCard ? getRecipeBrowseTags(recipe) : [];
  const isFavorite = Array.isArray(favorites) && favorites.includes(recipe.id);

  return (
    <article className={isBrowseCard ? "recipeCard recipeCardFullImage" : "recipeCard"}>
      {isBrowseCard ? (
        <FullRecipeCardPreview
          recipe={recipe}
          onOpen={() => openRecipeCard(recipe.id, cardList, viewerContext)}
        />
      ) : (
        <RecipeImage recipe={recipe} />
      )}

      {!isBrowseCard && (
        <button
          className={`heart ${isFavorite ? "saved" : ""}`}
          onClick={() => toggleFavorite(recipe.id)}
          aria-label="Save favorite"
        >
          ♡
        </button>
      )}

      <div className="recipeBody">
        <span className={`tag tag-${recipe.categoryCode}`}>
          {recipe.category}
        </span>

        <h3>{recipe.title}</h3>
        <MealBalanceBadge item={recipe} className="recipeMealBalanceBadge" />

        {isBrowseCard ? (
          <>
            <div className="recipeActions browseRecipeActions">
              <button
                className="viewCard"
                onClick={() => openRecipeCard(recipe.id, cardList, viewerContext)}
              >
                {viewButtonText}
              </button>
              {showPlannerButton && (
                <button className="addPlan" onClick={() => addToPlan(recipe.id)}>
                  Add to Planner
                </button>
              )}
              <SmartTipsButton recipe={recipe} />
              <MyRecipeNotesButton recipe={recipe} />
              {isSaladJarRecipe(recipe) && (
                <ConstructionCalloutButton recipe={recipe} />
              )}
            </div>

            <div className="browseRecipeMetaFooter">
              <div className="meta">
                <span>◷ {recipe.time} min</span>
                <span>♙ {recipe.servings} servings</span>
                <span>{recipe.price}</span>
              </div>

              <button
                className={`heart browseCardHeart ${isFavorite ? "saved" : ""}`}
                onClick={() => toggleFavorite(recipe.id)}
                aria-label="Save favorite"
              >
                ♡
              </button>
            </div>

            <div className="browseRecipeTags">
              {browseTags.map((tag) => (
                <span
                  key={`${recipe.id}-${tag}`}
                  className={`browseRecipeTag browseRecipeTag-${recipe.categoryCode}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="meta">
              <span>◷ {recipe.time} min</span>
              <span>♙ {recipe.servings}</span>
              <span>{recipe.price}</span>
            </div>

            <div className="recipeActions">
              <button
                className="viewCard"
                onClick={() => openRecipeCard(recipe.id, cardList)}
              >
                {viewButtonText}
              </button>
              {showPlannerButton && (
                <button className="addPlan" onClick={() => addToPlan(recipe.id)}>
                  Add to planner
                </button>
              )}
              <SmartTipsButton recipe={recipe} />
              {isSaladJarRecipe(recipe) && (
                <ConstructionCalloutButton recipe={recipe} />
              )}
            </div>
          </>
        )}
      </div>
    </article>
  );
}

function mediaIcon(type = "") {
  const normalizedType = type.toLowerCase();

  if (normalizedType.includes("youtube") || normalizedType.includes("video")) return "▶";
  if (normalizedType.includes("instagram")) return "◎";
  if (normalizedType.includes("facebook")) return "f";
  if (normalizedType.includes("tiktok")) return "♪";
  if (normalizedType.includes("product")) return "▣";
  if (normalizedType.includes("freezer")) return "❄";
  if (normalizedType.includes("storage")) return "□";

  return "↗";
}


function getRecipeEstimatedCost(recipe) {
  return getRecipeCostEstimate(recipe);
}

function RecipeCardViewer({ viewer, onClose, setViewer, favorites, toggleFavorite }) {
  const [imageIndex, setImageIndex] = useState(0);
  const [constructionImageIndex, setConstructionImageIndex] = useState(0);
  const [constructionImageFailed, setConstructionImageFailed] = useState(false);
  const [openPanel, setOpenPanel] = useState(null);
  usePopupPageMode(Boolean(viewer));

  const viewerIds = viewer?.recipeIds?.length
    ? viewer.recipeIds
    : recipes.map((recipe) => recipe.id);
  const currentIndex = viewer
    ? Math.max(0, viewerIds.indexOf(viewer.recipeId))
    : 0;
  const currentRecipeId = viewerIds[currentIndex] || viewer?.recipeId;
  const recipe = viewer
    ? recipes.find((item) => item.id === currentRecipeId) ||
      recipes.find((item) => item.id === viewer.recipeId)
    : null;

  useEffect(() => {
    setImageIndex(0);
    setConstructionImageIndex(0);
    setConstructionImageFailed(false);
    setOpenPanel(null);
  }, [recipe?.id]);

  if (!viewer || !recipe) return null;

  const isFavorite = Array.isArray(favorites) && favorites.includes(recipe.id);
  const imageCandidates = fullCardImageCandidates(recipe);
  const imagePath = imageCandidates[imageIndex];
  const hasMultiple = viewerIds.length > 1;
  const tips = getRecipeSmartTips(recipe);
  const note = getRecipePersonalNote(recipe);
  const cookingOptions = getRecipeCookingOptions(recipe);
  const estimatedCost = getRecipeEstimatedCost(recipe);
  const showConstruction = isSaladJarRecipe(recipe);
  const constructionImageCandidates = constructionCalloutImageCandidates(recipe);
  const constructionImagePath = constructionImageFailed
    ? ""
    : constructionImageCandidates[constructionImageIndex];

  function goToOffset(offset) {
    if (!hasMultiple) return;

    const nextIndex =
      (currentIndex + offset + viewerIds.length) % viewerIds.length;

    setViewer({
      recipeId: viewerIds[nextIndex],
      recipeIds: viewerIds,
    });
  }

  function togglePanel(panelName) {
    setOpenPanel((current) => (current === panelName ? null : panelName));
  }

  function printCurrentCard() {
    if (!imagePath) return;

    const imageUrl = `${window.location.origin}${import.meta.env.BASE_URL}${imagePath}`;
    const printWindow = window.open("", "_blank", "width=1000,height=750");

    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${recipe.id} ${recipe.title}</title>
          <style>
            @page {
              size: landscape;
              margin: 0.25in;
            }

            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              min-height: 100vh;
              display: grid;
              place-items: center;
              background: #ffffff;
              font-family: Arial, sans-serif;
            }

            img {
              width: 100%;
              max-width: 10.5in;
              max-height: 7.5in;
              object-fit: contain;
              display: block;
            }
          </style>
        </head>
        <body>
          <img src="${imageUrl}" alt="${recipe.id} ${recipe.title} recipe card" />
          <script>
            const image = document.querySelector("img");
            image.onload = () => {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  }

  async function downloadCurrentCard() {
    if (!imagePath) return;

    const imageUrl = `${import.meta.env.BASE_URL}${imagePath}`;
    const fileName = `${recipe.id}-${recipe.title}`
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/(^-|-$)/g, "")
      .toLowerCase() + ".png";

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = fileName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  }

  return (
    <div className="cardViewerOverlay" onClick={onClose}>
      <div className="cardViewer cardViewerBottomActions" onClick={(event) => event.stopPropagation()}>
        <div className="cardViewerHeader">
          <div>
            <span className="cardViewerCode">{recipe.id}</span>
            <h2>{recipe.title}</h2>
            <div className="cardViewerMealBalanceRow">
              <MealBalanceDetails item={recipe} />
              <MealBalanceInfo compact />
            </div>
          </div>

          <div className="cardViewerHeaderActions compact">
            <button className="cardViewerClose" onClick={onClose} aria-label="Close recipe viewer">
              ×
            </button>
          </div>
        </div>

        <div className="cardViewerStage">
          <button
            className="cardViewerNav"
            onClick={() => goToOffset(-1)}
            disabled={!hasMultiple}
            aria-label="Previous recipe card"
          >
            ‹
          </button>

          <div className="cardViewerImageWrap">
            {imagePath ? (
              <img
                src={`${import.meta.env.BASE_URL}${imagePath}`}
                alt={`${recipe.id} ${recipe.title} recipe card`}
                decoding="async"
                onError={() => setImageIndex((current) => current + 1)}
              />
            ) : (
              <div className="cardViewerMissing">
                <strong>Recipe card image not found.</strong>
                <span>
                  Expected: images/recipes/{recipe.id}.png
                </span>
              </div>
            )}
          </div>

          <button
            className="cardViewerNav"
            onClick={() => goToOffset(1)}
            disabled={!hasMultiple}
            aria-label="Next recipe card"
          >
            ›
          </button>
        </div>

        {recipe.mediaLinks?.length > 0 && (
          <div className="cardViewerHelpfulLinks">
            <strong>Helpful links</strong>
            <div>
              {recipe.mediaLinks.map((link, index) => (
                <a
                  key={`${recipe.id}-media-${index}`}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>{mediaIcon(link.type || link.label)}</span>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {openPanel && (
          <div className="viewerBottomSheet" role="dialog" aria-label={`${openPanel} information`}>
            <div className="viewerBottomSheetHandle" />
            <div className="viewerBottomSheetHeader">
              <strong>
                {openPanel === "cooking" && "Cooking Options"}
                {openPanel === "tips" && "Smart Tips"}
                {openPanel === "notes" && "My Notes"}
                {openPanel === "construction" && "Build Your Salad"}
                {openPanel === "cost" && "Estimated Cost"}
              </strong>
              <button type="button" onClick={() => setOpenPanel(null)} aria-label="Close popup">
                ×
              </button>
            </div>

            {openPanel === "cooking" && (
              <div className="viewerBottomSheetContent">
                <p className="viewerSheetIntro">
                  Practical ways to think about cooking or reheating this recipe.
                </p>
                <div className="viewerCookingOptionList">
                  {cookingOptions.map((option) => (
                    <article key={`${recipe.id}-${option.label}`} className="viewerCookingOption">
                      <h3>{option.label}</h3>
                      <p>{option.text}</p>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {openPanel === "tips" && (
              <div className="viewerBottomSheetContent">
                <ul className="viewerSmartTipsList">
                  <li>
                    <strong>Lower calorie:</strong> {tips.calories}
                  </li>
                  <li>
                    <strong>Lower carb:</strong> {tips.carbs}
                  </li>
                  <li>
                    <strong>Lower sodium:</strong> {tips.sodium}
                  </li>
                  <li>
                    <strong>Higher protein:</strong> {tips.protein}
                  </li>
                </ul>
              </div>
            )}


            {openPanel === "construction" && showConstruction && (
              <div className="viewerBottomSheetContent viewerConstructionSheet">
                {constructionImagePath ? (
                  <img
                    src={`${import.meta.env.BASE_URL}${constructionImagePath}`}
                    alt={`${recipe.id} build your salad guide`}
                    decoding="async"
                    onError={() => {
                      setConstructionImageIndex((current) => {
                        const next = current + 1;
                        if (next < constructionImageCandidates.length) return next;
                        setConstructionImageFailed(true);
                        return current;
                      });
                    }}
                  />
                ) : (
                  <div className="viewerConstructionMissing">
                    <strong>Build Your Salad image not found.</strong>
                    <span>Expected a sister file such as images/recipes/{recipe.id}c.jpg</span>
                  </div>
                )}
              </div>
            )}


            {openPanel === "cost" && (
              <div className="viewerBottomSheetContent viewerCostSheet">
                {estimatedCost.displayCost ? (
                  <>
                    <div className="viewerCostSummary">
                      <span className="viewerCostConfidence">{estimatedCost.confidenceLabel}</span>
                      <strong>{estimatedCost.roundedCostPerServing}</strong>
                      <em>{estimatedCost.costCategory}</em>
                    </div>

                    <div className="viewerCostGrid viewerCostGridPlanning">
                      <article className="viewerCostBox">
                        <span>Estimated total recipe cost</span>
                        <strong>{estimatedCost.roundedRecipeCost}</strong>
                        <small>Ingredient-use cost for this recipe card</small>
                      </article>

                      <article className="viewerCostBox">
                        <span>Servings used</span>
                        <strong>{estimatedCost.servings}</strong>
                        <small>{estimatedCost.servingBasis}</small>
                      </article>

                      <article className="viewerCostBox viewerCoverageBox">
                        <span>Ingredient-cost coverage</span>
                        <strong>{estimatedCost.coveragePercent}%</strong>
                        <small>{estimatedCost.costedLines} of {estimatedCost.ingredientLines} ingredient lines costed</small>
                      </article>

                      <article className="viewerCostBox">
                        <span>Cost category</span>
                        <strong>{estimatedCost.costCategory}</strong>
                        <small>Rounded planning estimate</small>
                      </article>
                    </div>

                    <p className="viewerCostCutline">
                      Estimated cost uses ingredient-use pricing for this recipe
                      card, not the full checkout cost of buying every package
                      new. Servings used shows the number of portions used to
                      calculate the per-serving estimate. Ingredient-cost
                      coverage shows how much of the ingredient list has usable
                      pricing in the cost database. Some items may already be in
                      your pantry, refrigerator, or freezer. {RECIPE_COST_NOTE}
                      <strong>{RECIPE_COST_TAGLINE}</strong>
                    </p>
                  </>
                ) : (
                  <div className="viewerCostUnderReview">
                    <strong>Cost estimate under review</strong>
                    <p>
                      This recipe is missing a major ingredient cost, serving
                      quantity, or usable ingredient-use total.
                    </p>
                    <small>
                      A public planning estimate will display after the missing
                      cost or serving information is added.
                    </small>
                    <p className="viewerCostNote">
                      {RECIPE_COST_NOTE}
                    </p>
                    <p className="viewerCostPantryNote">
                      Some items in the ingredient list may already be in your
                      pantry, refrigerator, or freezer.
                    </p>
                    <p className="viewerCostTagline">
                      {RECIPE_COST_TAGLINE}
                    </p>
                  </div>
                )}
              </div>
            )}

            {openPanel === "notes" && (
              <div className="viewerBottomSheetContent viewerNotesSheet">
                <div className="viewerNotesPaper">
                  <h3>{note.title}</h3>
                  <p>{note.text}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="cardViewerFooter cardViewerUnifiedFooter">
          <span className="cardViewerCount">
            {currentIndex + 1} of {viewerIds.length}
          </span>

          <div className="cardViewerFooterActions viewerUnifiedActions">
            <button
              className={openPanel === "cooking" ? "viewerActionButton active" : "viewerActionButton"}
              type="button"
              onClick={() => togglePanel("cooking")}
            >
              Cooking Options
            </button>

            <button
              className={openPanel === "tips" ? "viewerActionButton active" : "viewerActionButton"}
              type="button"
              onClick={() => togglePanel("tips")}
            >
              Smart Tips
            </button>

            <button
              className={openPanel === "notes" ? "viewerActionButton viewerActionNotes active" : "viewerActionButton viewerActionNotes"}
              type="button"
              onClick={() => togglePanel("notes")}
            >
              My Notes
            </button>

            {showConstruction && (
              <button
                className={openPanel === "construction" ? "viewerActionButton viewerActionConstruction active" : "viewerActionButton viewerActionConstruction"}
                type="button"
                onClick={() => togglePanel("construction")}
              >
                Build Your Salad
              </button>
            )}


            <button
              className={openPanel === "cost" ? "viewerActionButton viewerActionCost active" : "viewerActionButton viewerActionCost"}
              type="button"
              onClick={() => togglePanel("cost")}
            >
              Estimated Cost
            </button>

            <button
              className={isFavorite ? "viewerActionHeart saved" : "viewerActionHeart"}
              type="button"
              onClick={() => toggleFavorite(recipe.id)}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              ♥
            </button>

            <button
              className="viewerActionButton viewerActionPrint"
              onClick={printCurrentCard}
              disabled={!imagePath}
            >
              Print
            </button>

            <button
              className="viewerActionButton viewerActionDownload"
              onClick={downloadCurrentCard}
              disabled={!imagePath}
            >
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


function CollectionStrip({ setActivePage }) {
  const [openCollection, setOpenCollection] = useState(null);

  const collectionCards = [
    {
      title: "Slow Cooker Favorites",
      text: "Set-it-and-forget-it meals for easy crock-pot cooking.",
      page: "Slow Cooker Favorites",
      image: "images/collections/crockpot.jpg",
      imageAlt: "Slow cooker meal in a crockpot",
    },
    {
      title: "Summer Cookouts",
      text: "Grill-friendly meals and warm-weather favorites.",
      page: "Summer Cookouts",
      image: "images/collections/cookout.jpg",
      imageAlt: "Backyard cookout with grilled foods",
    },
    {
      title: "Healthy Dinners",
      text: "Balanced meals for lighter weeknight cooking.",
      page: "Healthy Dinners",
      image: "images/collections/healthy.jpg",
      imageAlt: "Healthy dinner plate with chicken, vegetables, and quinoa",
    },
    {
      title: "Comfort Foods",
      text: "Popular classics for familiar family-style meals.",
      page: "Comfort Foods",
      image: "images/collections/comfort.jpg",
      imageAlt: "Comfort foods including pot pie, roast, mashed potatoes, and macaroni",
    },
    {
      title: "Easy 30-Minute Meals",
      text: "Fast 30-minute dinners for those busy nights.",
      page: "Easy 30-Minute Meals",
      image: "images/collections/30-minute.jpg",
      imageAlt: "Quick skillet pasta meal",
    },
  ];

  return (
    <section className="section collectionSection homeCollectionButtonSection">
      <div className="collectionGrid homeCollectionButtonGrid">
        {collectionCards.map((collection) => (
          <div className="homeCollectionPopupWrap" key={collection.title}>
            <button
              type="button"
              className="homeCollectionFlowButton"
              onClick={() =>
                setOpenCollection((current) =>
                  current === collection.title ? null : collection.title
                )
              }
              aria-expanded={openCollection === collection.title}
            >
              {collection.title}
            </button>

            {openCollection === collection.title && (
              <div className="homeCollectionPopup">
                <div className="homeCollectionPopupHeader">
                  <strong>{collection.title}</strong>
                  <button
                    type="button"
                    onClick={() => setOpenCollection(null)}
                    aria-label={`Close ${collection.title}`}
                  >
                    ×
                  </button>
                </div>

                <div className="homeCollectionPopupImage">
                  <img
                    src={`${import.meta.env.BASE_URL}${collection.image}`}
                    alt={collection.imageAlt}
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <p>{collection.text}</p>
                <button
                  type="button"
                  className="homeCollectionReadMore"
                  onClick={() => {
                    setOpenCollection(null);
                    setActivePage(collection.page);
                  }}
                >
                  Read More
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}



function heroFoodImageCandidates(recipe) {
  const candidates = [];
  const prefix = recipeCodePrefix(recipe.id);

  if (recipe.heroImage) candidates.push(recipe.heroImage);

  if (recipe.id && AUTO_IMAGE_PREFIXES.has(prefix)) {
    candidates.push(`images/heroes/${recipe.id}.jpg`);
    candidates.push(`images/heroes/${recipe.id} .jpg`);
    candidates.push(`images/heroes/${recipe.id}.png`);
    candidates.push(`images/heroes/${recipe.id} .png`);
    candidates.push(`images/thumbs/recipes/${recipe.id}.jpg`);
    candidates.push(`images/thumbs/recipes/${recipe.id} .jpg`);
  }

  if (recipe.image) candidates.push(recipe.image);
  if (recipe.cardImage) candidates.push(recipe.cardImage);

  if (recipe.id && AUTO_IMAGE_PREFIXES.has(prefix)) {
    candidates.push(`images/recipes/${recipe.id}.png`);
    candidates.push(`images/recipes/${recipe.id} .png`);
  }

  return [...new Set(candidates)];
}

function getRandomRecipes(list = [], count = 12) {
  const safeList = Array.isArray(list) ? list.filter(Boolean) : [];

  if (safeList.length <= count) {
    return safeList;
  }

  const copy = [...safeList];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy.slice(0, count);
}

function FeaturedSelectionPanel({ setActivePage }) {
  const featuredMeals = useMemo(() => getRandomRecipes(dinnerCombinations, 4), []);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeMeal = featuredMeals[activeIndex] || featuredMeals[0];

  useEffect(() => {
    if (featuredMeals.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % featuredMeals.length);
    }, 9000);

    return () => window.clearInterval(timer);
  }, [featuredMeals.length]);

  if (!activeMeal) return null;

  return (
    <section className="homeFeatureCard featuredSelectionCard dinnerCombinationsFeatureCard">
      <div className="homeMiniSectionHeader">
        <h2>Combo-Meals</h2>
      </div>

      <button
        type="button"
        className="featuredSelectionButton dinnerCombinationsFeatureButton"
        onClick={() => setActivePage("Dinner Combinations")}
        aria-label="Open Dinner Combinations"
      >
        <div className="featuredSelectionImage dinnerCombinationsFeatureImage">
          <div className="featuredDinnerImageStack" aria-hidden="true">
            {featuredMeals.map((meal, index) => (
              <DinnerCombinationImage
                key={meal.id}
                meal={meal}
                className={`featuredDinnerImage${index === activeIndex ? " active" : ""}`}
                loading="eager"
                fetchPriority="high"
              />
            ))}
          </div>
        </div>
        <strong>
          Meal #{String(activeMeal.number).padStart(3, "0")} — {activeMeal.title}
        </strong>
      </button>
    </section>
  );
}

function ProductsIUseCarousel({ setActivePage }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeProduct = HOME_KITCHEN_TOOL_SLIDES[activeIndex % HOME_KITCHEN_TOOL_SLIDES.length];

  useEffect(() => {
    if (HOME_KITCHEN_TOOL_SLIDES.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % HOME_KITCHEN_TOOL_SLIDES.length);
    }, 9000);

    return () => window.clearInterval(timer);
  }, []);

  if (!activeProduct) return null;

  return (
    <section className="homeFeatureCard productsIUseCard kitchenToolsFeatureCard">
      <div className="homeMiniSectionHeader">
        <h2>Kitchen Tools</h2>
      </div>

      <button
        type="button"
        className="featuredSelectionButton kitchenToolsFeatureButton"
        onClick={() => setActivePage("Products I Use")}
        aria-label={`View kitchen tool details for ${activeProduct.title}`}
      >
        <div className="featuredSelectionImage kitchenToolsFeatureImage">
          <div className="featuredKitchenToolImageStack" aria-hidden="true">
            {HOME_KITCHEN_TOOL_SLIDES.map((product, index) => (
              <img
                key={`${product.title}-${index}`}
                className={`featuredKitchenToolImage${index === activeIndex ? " active" : ""}`}
                src={`${import.meta.env.BASE_URL}${product.image}`}
                alt=""
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>
        </div>
        <strong>{activeProduct.title}</strong>
      </button>
    </section>
  );
}


const ROLODEX_COMPOSITE_SLIDES = [
  {
    id: "ROLO-AS-002",
    title: "Asian Cuisine: Beijing Beef",
    image: "images/rolodex/ROLO-AS-002.jpg",
    categoryFilter: "Asian Cuisine",
  },
  {
    id: "ROLO-AS-011",
    title: "Asian Cuisine: Kung Pao Chicken",
    image: "images/rolodex/ROLO-AS-011.jpg",
    categoryFilter: "Asian Cuisine",
  },
  {
    id: "ROLO-AS-022",
    title: "Asian Cuisine: Chicken Egg Rolls",
    image: "images/rolodex/ROLO-AS-022.jpg",
    categoryFilter: "Asian Cuisine",
  },
  {
    id: "ROLO-HB-001",
    title: "Hamburgers: Big Mac Style Burger",
    image: "images/rolodex/ROLO-HB-001.jpg",
    categoryFilter: "Hamburgers",
  },
  {
    id: "ROLO-HB-007",
    title: "Hamburgers: Steakhouse Burger",
    image: "images/rolodex/ROLO-HB-007.jpg",
    categoryFilter: "Hamburgers",
  },
  {
    id: "ROLO-HB-031",
    title: "Hamburgers: Lipsey Burger",
    image: "images/rolodex/ROLO-HB-031.jpg",
    categoryFilter: "Hamburgers",
  },
  {
    id: "ROLO-IT-001",
    title: "Italian Cuisine: Chicken Alfredo",
    image: "images/rolodex/ROLO-IT-001.jpg",
    categoryFilter: "Italian Cuisine",
  },
  {
    id: "ROLO-IT-011",
    title: "Italian Cuisine: Spaghetti & Meatballs",
    image: "images/rolodex/ROLO-IT-011.jpg",
    categoryFilter: "Italian Cuisine",
  },
  {
    id: "ROLO-IT-031",
    title: "Italian Cuisine: Shrimp Scampi",
    image: "images/rolodex/ROLO-IT-031.jpg",
    categoryFilter: "Italian Cuisine",
  },
  {
    id: "ROLO-MX-003",
    title: "Mexican Cuisine: Taco Meat & Cheese",
    image: "images/rolodex/ROLO-MX-003.jpg",
    categoryFilter: "Mexican Cuisine",
  },
  {
    id: "ROLO-MX-012",
    title: "Mexican Cuisine: Tamale Pie",
    image: "images/rolodex/ROLO-MX-012.jpg",
    categoryFilter: "Mexican Cuisine",
  },
  {
    id: "ROLO-MX-025",
    title: "Mexican Cuisine: Beef Fajita Rice Bowls",
    image: "images/rolodex/ROLO-MX-025.jpg",
    categoryFilter: "Mexican Cuisine",
  },
  {
    id: "ROLO-SB-001",
    title: "Salads & Bowls: Asian Chicken Crunch",
    image: "images/rolodex/ROLO-SB-001.jpg",
    categoryFilter: "Salads & Bowls",
  },
  {
    id: "ROLO-SB-008",
    title: "Salads & Bowls: Hi-Protein Chicken Salad",
    image: "images/rolodex/ROLO-SB-008.jpg",
    categoryFilter: "Salads & Bowls",
  },
  {
    id: "ROLO-SD-007",
    title: "Side Dishes: Macaroni & Cheese",
    image: "images/rolodex/ROLO-SD-007.jpg",
    categoryFilter: "Side Dishes",
  },
  {
    id: "ROLO-SD-022",
    title: "Side Dishes: Coleslaw",
    image: "images/rolodex/ROLO-SD-022.jpg",
    categoryFilter: "Side Dishes",
  },
  {
    id: "ROLO-SF-001",
    title: "Seafood Dishes: Baked Coconut Shrimp",
    image: "images/rolodex/ROLO-SF-001.jpg",
    categoryFilter: "Seafood Dishes",
  },
  {
    id: "ROLO-SF-008",
    title: "Seafood Dishes: Teriyaki Salmon",
    image: "images/rolodex/ROLO-SF-008.jpg",
    categoryFilter: "Seafood Dishes",
  },
  {
    id: "ROLO-SF-016",
    title: "Seafood Dishes: Seafood Gumbo",
    image: "images/rolodex/ROLO-SF-016.jpg",
    categoryFilter: "Seafood Dishes",
  },
  {
    id: "ROLO-SG-009",
    title: "Smoked & Grilled Meats: Sliced Pork Butt",
    image: "images/rolodex/ROLO-SG-009.jpg",
    categoryFilter: "Smoked & Grilled Meats",
  },
];

function RecipeRolodex({ setActivePage, setFilter }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImageIds, setFailedImageIds] = useState({});
  const rolodexSlides = ROLODEX_COMPOSITE_SLIDES;
  const activeSlide = rolodexSlides[activeIndex] || rolodexSlides[0];
  const activeSlideImagePath = activeSlide?.image?.replace(/^\/+/, "") || "";
  const activeSlideImageUrl = activeSlideImagePath
    ? `${import.meta.env.BASE_URL}${activeSlideImagePath}`
    : "";
  const activeImageFailed = activeSlide ? failedImageIds[activeSlide.id] : false;

  useEffect(() => {
    if (!rolodexSlides.length) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % rolodexSlides.length);
    }, 7000);

    return () => window.clearInterval(timer);
  }, [rolodexSlides.length]);

  function goToOffset(offset) {
    if (!rolodexSlides.length) return;

    setActiveIndex((current) =>
      (current + offset + rolodexSlides.length) % rolodexSlides.length
    );
  }

  function viewActiveRecipes() {
    if (!activeSlide) return;

    const matchingCategory = categories.find(
      (category) =>
        category.id === activeSlide.id ||
        category.name === activeSlide.categoryFilter ||
        category.name === activeSlide.title
    );

    setFilter(matchingCategory?.name || activeSlide.categoryFilter || "All");
    setActivePage("Recipes");
  }

  if (!activeSlide) {
    return (
      <aside className="homeRolodex homeRolodexComposite" aria-label="Recipe card rolodex">
        <div className="homeRolodexHeader">
          <div>
            <span>Robert's Rolodex Files</span>
            <strong>No Rolodex images found</strong>
          </div>
        </div>

        <div className="homeRolodexMissing">
          <strong>No composite Rolodex images are currently listed.</strong>
          <span>Edit ROLODEX_COMPOSITE_SLIDES in App.jsx to add images.</span>
        </div>
      </aside>
    );
  }

  return (
    <aside className="homeRolodex homeRolodexComposite" aria-label="Recipe card rolodex">
      <div className="homeRolodexHeader homeRolodexHeaderCentered">
        <strong className="homeRolodexSectionTitle">Robert's Rolodex Files</strong>
      </div>

      <div className="homeRolodexStage homeRolodexCompositeStage homeRolodexAutoStage">
        <button
          type="button"
          className="homeRolodexNav homeRolodexNavLeft"
          onClick={() => goToOffset(-1)}
          aria-label="Show previous Rolodex card collection"
        >
          ‹
        </button>

        <button
          type="button"
          className="homeRolodexCompositeImageButton homeRolodexCompositeImageButtonLarge"
          onClick={viewActiveRecipes}
          aria-label={`View ${activeSlide.title} recipes`}
        >
          {activeSlideImageUrl && !activeImageFailed ? (
            <img
              key={activeSlide.id}
              className="homeRolodexCompositeImage homeRolodexCompositeImageLarge"
              src={activeSlideImageUrl}
              alt={`${activeSlide.title} Rolodex recipe card collection`}
              loading="lazy"
              decoding="async"
              onLoad={() =>
                setFailedImageIds((current) => ({
                  ...current,
                  [activeSlide.id]: false,
                }))
              }
              onError={() =>
                setFailedImageIds((current) => ({
                  ...current,
                  [activeSlide.id]: true,
                }))
              }
            />
          ) : (
            <div className="homeRolodexCompositeFallback">
              <strong>{activeSlide.title}</strong>
              <span>Composite image not found.</span>
              <code>{activeSlideImagePath}</code>
            </div>
          )}
        </button>

        <button
          type="button"
          className="homeRolodexNav homeRolodexNavRight"
          onClick={() => goToOffset(1)}
          aria-label="Show next Rolodex card collection"
        >
          ›
        </button>
      </div>
    </aside>
  );
}


function uniqueRecordsByPermanentId(records = []) {
  const uniqueRecords = new Map();

  records.forEach((record) => {
    const permanentId = String(record?.id || record?.code || "").trim();
    if (permanentId && !uniqueRecords.has(permanentId)) {
      uniqueRecords.set(permanentId, record);
    }
  });

  return [...uniqueRecords.values()];
}

function HomeRecipeCounters({ classifiedRecipes = [] }) {
  // Counter totals deliberately use the complete, unfiltered source datasets.
  // They are independent of search, category filters, pagination, routes, and visible cards.
  const allUniqueRecipes = uniqueRecordsByPermanentId(recipes);
  const allUniqueCompleteMeals = uniqueRecordsByPermanentId(dinnerCombinations);
  const classifiedRecipeLookup = new Map(
    uniqueRecordsByPermanentId(classifiedRecipes).map((recipe) => [
      String(recipe.id || recipe.code).trim(),
      recipe,
    ])
  );

  const freezerFriendlyNames = new Set([
    "freezer-friendly",
    "freezer friendly",
    "freezer-friendly meals",
    "quick & easy freezer meals",
  ]);

  const freezerFriendlyCount = allUniqueRecipes.filter((recipe) => {
    const classifiedRecipe = classifiedRecipeLookup.get(
      String(recipe.id || recipe.code).trim()
    ) || recipe;
    const collections = Array.isArray(classifiedRecipe.collections)
      ? classifiedRecipe.collections
      : [];
    const attributes = Array.isArray(classifiedRecipe.attributes)
      ? classifiedRecipe.attributes
      : [];

    return (
      classifiedRecipe.freezerFriendly === true ||
      classifiedRecipe.freezable === true ||
      [...collections, ...attributes].some((name) =>
        freezerFriendlyNames.has(String(name).trim().toLowerCase())
      )
    );
  }).length;

  const recipeCount = allUniqueRecipes.length;
  const completeMealCount = allUniqueCompleteMeals.length;
  const collectionCount = new Set(
    RECIPE_COLLECTIONS.map((name) => String(name).trim().toLowerCase()).filter(Boolean)
  ).size;

  const counters = [
    { label: "Recipes", value: recipeCount, className: "recipes" },
    { label: "Complete Meals", value: completeMealCount, className: "complete" },
    { label: "Freezer-Friendly", value: freezerFriendlyCount, className: "freezer" },
    { label: "Collections", value: collectionCount, className: "collections" },
  ];

  return (
    <section className="homeCounterSection" aria-label="Recipe library totals">
      <div className="homeCounterRow">
        {counters.map((counter) => (
          <div className={`homeCounterItem ${counter.className}`} key={counter.label}>
            <span className="homeCounterBadge" aria-hidden="true">
              <span className="homeCounterIcon" />
              <strong>{counter.value}</strong>
              <small>{counter.label}</small>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Home({
  favorites,
  toggleFavorite,
  addToPlan,
  openRecipeCard,
  setActivePage,
  setFilter,
  classifiedRecipes,
}) {
  return (
    <>
      <Hero setActivePage={setActivePage} />
      <TransparencyLine setActivePage={setActivePage} />
      <CategoryGrid setFilter={setFilter} setActivePage={setActivePage} />

      <section className="section homeRolodexShowcaseSection">
        <div className="homeRolodexShowcaseLayout homeThreeColumnShowcase">
          <div className="homeDinnerRecommendationsColumn">
            <FeaturedSelectionPanel setActivePage={setActivePage} />
          </div>

          <div className="homeShowcaseRolodexColumn">
            <RecipeRolodex setActivePage={setActivePage} setFilter={setFilter} />
          </div>

          <div className="homeProductsColumn">
            <ProductsIUseCarousel setActivePage={setActivePage} />
          </div>
        </div>
      </section>

      <HomeRecipeCounters classifiedRecipes={classifiedRecipes} />

      <div className="homeAdminAccessWrap" aria-label="Administrative tools">
        <button
          className="adminAccessButton homeAdminAccessButton"
          type="button"
          onClick={() => setActivePage("Admin Recipes")}
        >
          Admin
        </button>
      </div>
    </>
  );
}

function RecipesPage({
  favorites,
  toggleFavorite,
  addToPlan,
  openRecipeCard,
  filter,
  setFilter,
}) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(filter || "");
  const [selectedCookingMethod, setSelectedCookingMethod] = useState("");
  const [selectedMealType, setSelectedMealType] = useState("");
  const [selectedDietaryNeed, setSelectedDietaryNeed] = useState("");
  const [selectedMealBalance, setSelectedMealBalance] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setSelectedCategory(filter || "");
  }, [filter]);

  const filteredRecipes = useMemo(() => {
    let list = recipes.filter((recipe) => {
      const matchesQuery = `${recipe.id} ${recipe.title} ${recipe.category}`
        .toLowerCase()
        .includes(query.toLowerCase());

      const selectedCategoryObject = categories.find(
        (category) => category.name === selectedCategory || category.id === selectedCategory
      );
      const matchesCategory =
        !selectedCategory ||
        recipe.category === selectedCategory ||
        recipe.categoryCode === selectedCategoryObject?.id ||
        recipe.id?.startsWith(`${selectedCategoryObject?.id}-`);

      const matchesMealBalance = mealBalanceMatchesFilter(recipe, selectedMealBalance);

      return matchesQuery && matchesCategory && matchesMealBalance;
    });

    const sorted = [...list];
    switch (sortBy) {
      case 'az':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'time-low':
        sorted.sort((a, b) => Number(a.time || 0) - Number(b.time || 0));
        break;
      case 'time-high':
        sorted.sort((a, b) => Number(b.time || 0) - Number(a.time || 0));
        break;
      case 'servings-high':
        sorted.sort((a, b) => Number(b.servings || 0) - Number(a.servings || 0));
        break;
      case 'servings-low':
        sorted.sort((a, b) => Number(a.servings || 0) - Number(b.servings || 0));
        break;
      default:
        break;
    }

    return sorted;
  }, [query, selectedCategory, selectedCookingMethod, selectedMealType, selectedDietaryNeed, selectedMealBalance, sortBy]);

  useEffect(() => {
    setPage(1);
  }, [query, selectedCategory, selectedCookingMethod, selectedMealType, selectedDietaryNeed, selectedMealBalance, sortBy]);

  const perPage = 12;
  const totalPages = Math.max(1, Math.ceil(filteredRecipes.length / perPage));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * perPage;
  const visibleRecipes = filteredRecipes.slice(pageStart, pageStart + perPage);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function renderPageButtons() {
    if (totalPages <= 1) return null;

    const buttons = [];
    const visible = new Set([1, 2, 3, totalPages, safePage - 1, safePage, safePage + 1]);
    const pages = [...visible]
      .filter((n) => n >= 1 && n <= totalPages)
      .sort((a, b) => a - b);

    let prev = null;
    for (const p of pages) {
      if (prev && p - prev > 1) {
        buttons.push(
          <span key={`ellipsis-${prev}-${p}`} className="browsePaginationEllipsis">
            …
          </span>
        );
      }
      buttons.push(
        <button
          key={p}
          className={p === safePage ? 'active' : ''}
          onClick={() => setPage(p)}
          aria-label={`Page ${p}`}
        >
          {p}
        </button>
      );
      prev = p;
    }

    return buttons;
  }

  return (
    <main className="pageShell browseRecipesPage">
      <div className="browseControlsRow browseControlsSingleLine">
        <div className="browseSortWrap">
          <label htmlFor="browse-sort">SORT BY</label>
          <select id="browse-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="az">A–Z</option>
            <option value="time-low">Time: Low to High</option>
            <option value="time-high">Time: High to Low</option>
            <option value="servings-low">Servings: Low to High</option>
            <option value="servings-high">Servings: High to Low</option>
          </select>
        </div>

        <div className="browseFilters">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setFilter(e.target.value);
            }}
            aria-label="All Categories"
          >
            <option value="">ALL CATEGORIES</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={selectedCookingMethod}
            onChange={(e) => setSelectedCookingMethod(e.target.value)}
            aria-label="All Cooking Methods"
          >
            <option value="">ALL COOKING METHODS</option>
            <option value="quick">Quick & Easy</option>
            <option value="baked">Baked</option>
            <option value="skillet">Skillet</option>
            <option value="slowcooker">Slow Cooker</option>
          </select>

          <select
            value={selectedDietaryNeed}
            onChange={(e) => setSelectedDietaryNeed(e.target.value)}
            aria-label="All Dietary Needs"
          >
            <option value="">ALL DIETARY NEEDS</option>
            <option value="glutenfree">Gluten Free</option>
            <option value="lowcarb">Low Carb</option>
            <option value="lighter">Lighter Options</option>
          </select>

          <div className="mealBalanceFilterWrap">
            <select
              value={selectedMealBalance}
              onChange={(event) => setSelectedMealBalance(event.target.value)}
              aria-label="MealBalance rating"
            >
              <option value="all">All MealBalance Ratings</option>
              <option value="1-2">MB 1–2 · Very Light</option>
              <option value="3-4">MB 3–4 · Balanced</option>
              <option value="5-6">MB 5–6 · Moderate</option>
              <option value="7-8">MB 7–8 · Rich</option>
              <option value="9-10">MB 9–10 · Indulgent</option>
              <option value="unrated">Not Yet Rated</option>
            </select>
            <MealBalanceInfo compact />
          </div>
        </div>

        <div className="browseSearchWrap">
          <span className="browseSearchIcon">⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search recipes..."
            aria-label="Search recipes"
          />
        </div>
      </div>

      <div className="browseResultsRow">
        <strong>{filteredRecipes.length} recipes found</strong>
        {totalPages > 1 && (
          <div className="browsePagination">
            <button
              className="browsePaginationArrow"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={safePage === 1}
              aria-label="Previous page"
            >
              ‹
            </button>
            {renderPageButtons()}
            <button
              className="browsePaginationArrow"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={safePage === totalPages}
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        )}
      </div>

      <div className="recipeGrid browseRecipeGrid">
        {visibleRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            addToPlan={addToPlan}
            openRecipeCard={openRecipeCard}
            cardList={filteredRecipes}
            displayMode="card"
          />
        ))}
      </div>
    </main>
  );
}


function dinnerMealImageCandidates(meal) {
  if (!meal) return [];
  const paddedMealNumber = String(meal.number || "").padStart(3, "0");
  const candidates = [
    paddedMealNumber ? `images/dinner-combinations/meal-${paddedMealNumber}.JPG` : "",
    paddedMealNumber ? `images/dinner-combinations/meal-${paddedMealNumber}.jpg` : "",
    paddedMealNumber ? `images/dinner-combinations/MEAL-${paddedMealNumber}.JPG` : "",
    paddedMealNumber ? `images/dinner-combinations/MEAL-${paddedMealNumber}.jpg` : "",
    paddedMealNumber ? `images/dinner-combinations/meal-${paddedMealNumber}.jpeg` : "",
    paddedMealNumber ? `images/dinner-combinations/MEAL-${paddedMealNumber}.JPEG` : "",
    paddedMealNumber ? `images/dinner-combinations/meal-${paddedMealNumber}.png` : "",
    paddedMealNumber ? `images/dinner-combinations/MEAL-${paddedMealNumber}.png` : "",
    meal.image,
  ].filter(Boolean);

  return [...new Set(candidates)];
}

function DinnerCombinationImage({ meal, className = "", loading = "lazy", fetchPriority = "auto" }) {
  const [imageIndex, setImageIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const candidates = dinnerMealImageCandidates(meal);
  const imagePath = imageFailed ? "" : candidates[imageIndex];

  useEffect(() => {
    setImageIndex(0);
    setImageFailed(false);
  }, [meal?.id]);

  function handleError() {
    setImageIndex((current) => {
      const next = current + 1;
      if (next < candidates.length) return next;
      setImageFailed(true);
      return current;
    });
  }

  if (!imagePath) {
    return (
      <div className={`dinnerCombinationImageFallback ${className}`.trim()}>
        <span>Meal #{meal?.number || ""}</span>
      </div>
    );
  }

  return (
    <img
      className={className}
      src={`${import.meta.env.BASE_URL}${imagePath}`}
      alt={`${meal?.title || "Dinner combination"} meal photo`}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      onError={handleError}
    />
  );
}

function EmptyState({ title, text, children }) {
  return (
    <section className="emptyState">
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      {children}
    </section>
  );
}

function PlannerPage({ plan, setPlan, servings, setServings, favorites, toggleFavorite, openRecipeCard, setActivePage }) {
  const normalizedPlan = useMemo(() => normalizeTwoWeekPlan(plan), [plan]);
  const [selectedSlot, setSelectedSlot] = useState("week1-Mon");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [plannerDinnerViewer, setPlannerDinnerViewer] = useState(null);

  function resolvePlannerRecipe(recipeId) {
    return recipes.find((item) => item.id === recipeId) || null;
  }

  function resolvePlannerDinnerMeal(recipeId) {
    return dinnerCombinations.find((item) => item.id === recipeId) || null;
  }

  const filteredPlannerRecipes = useMemo(() => {
    if (selectedCategory === "All") return recipes;

    const selectedCategoryObject = categories.find(
      (category) => category.name === selectedCategory || category.id === selectedCategory
    );

    return recipes.filter((recipe) => {
      return (
        recipe.category === selectedCategory ||
        recipe.categoryCode === selectedCategoryObject?.id ||
        recipe.id?.startsWith(`${selectedCategoryObject?.id}-`)
      );
    });
  }, [selectedCategory]);

  function addRecipe(recipeId, slotKey = selectedSlot) {
    if (!recipeId || !slotKey) return;

    setPlan((current) => {
      const next = normalizeTwoWeekPlan(current);
      next[slotKey] = [...(next[slotKey] || []), recipeId];
      return next;
    });
  }

  function removeRecipe(slotKey, index) {
    setPlan((current) => {
      const next = normalizeTwoWeekPlan(current);
      next[slotKey] = (next[slotKey] || []).filter((_, i) => i !== index);
      return next;
    });
  }

  function clearPlan() {
    setPlan(emptyTwoWeekPlan());
  }

  function clearWeek(weekId) {
    setPlan((current) => {
      const next = normalizeTwoWeekPlan(current);
      WEEK_DAYS.forEach((day) => {
        next[`${weekId}-${day}`] = [];
      });
      return next;
    });
  }

  function copyWeekOneToWeekTwo() {
    setPlan((current) => {
      const next = normalizeTwoWeekPlan(current);
      WEEK_DAYS.forEach((day) => {
        next[`week2-${day}`] = [...(next[`week1-${day}`] || [])];
      });
      return next;
    });
  }

  function firstEmptySlotForWeek(weekId) {
    return (
      WEEK_DAYS.map((day) => `${weekId}-${day}`).find(
        (slotKey) => (normalizedPlan[slotKey] || []).length === 0
      ) || `${weekId}-Mon`
    );
  }

  function plannerEstimatedCostText(recipe) {
    const estimatedCost = getRecipeEstimatedCost(recipe);

    if (!estimatedCost?.displayCost) {
      return "Cost estimate under review";
    }

    return `${estimatedCost.roundedCostPerServing} per serving · ${estimatedCost.roundedRecipeCost} total · ${estimatedCost.costCategory}`;
  }

  function plannerDinnerRecipeButtons(meal) {
    if (!meal) return [];

    return [
      { label: meal.mainDish, type: "Main Dish", recipeId: meal.mainRecipeId },
      ...(meal.sides || []).map((side) => ({
        label: side.name,
        type: "Side Dish",
        recipeId: side.recipeId,
      })),
    ];
  }

  function openDinnerRecipeCard(recipeId) {
    const recipe = resolvePlannerRecipe(recipeId);
    if (!recipe) return;

    setPlannerDinnerViewer(null);
    openRecipeCard(recipe.id, recipes);
  }

  return (
    <main className="pageShell plannerDashboard weeklyDinnerPlannerPage">
      <div className="plannerQuickActionsBar">
        <div className="plannerQuickActionsButtons" aria-label="Quick actions">
          <button className="secondary" onClick={copyWeekOneToWeekTwo}>Copy Week 1 to Week 2</button>
          <button className="secondary" onClick={() => clearWeek("week1")}>Clear Week 1</button>
          <button className="secondary" onClick={() => clearWeek("week2")}>Clear Week 2</button>
          <button className="secondary" onClick={clearPlan}>Clear Planner</button>
        </div>
        <ServingSelector servings={servings} setServings={setServings} />
      </div>

      <div className="plannerAddPanel plannerFullWidthControls">
        <select
          value={selectedSlot}
          onChange={(event) => setSelectedSlot(event.target.value)}
          aria-label="Choose planner day"
        >
          {PLANNER_WEEKS.map((week) => (
            <optgroup key={week.id} label={week.title}>
              {WEEK_DAYS.map((day) => (
                <option key={`${week.id}-${day}`} value={`${week.id}-${day}`}>
                  {week.title} — {day}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
          aria-label="Filter recipes by category"
        >
          <option value="All">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>

        <select onChange={(event) => addRecipe(event.target.value)} value="">
          <option value="">
            Add {selectedCategory === "All" ? "recipe" : selectedCategory} to {plannerSlotLabel(selectedSlot)}
          </option>
          {filteredPlannerRecipes.map((recipe) => (
            <option key={recipe.id} value={recipe.id}>
              {recipe.id} — {recipe.title}{isMealBalanceRated(recipe) ? ` · MB ${getMealBalanceScore(recipe)}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="plannerCompactTables plannerCompactTablesFullWidth">
        {PLANNER_WEEKS.map((week) => {
          return (
            <section className="plannerCompactWeek" key={week.id}>
              <div className="plannerWeekHeader plannerCompactWeekHeader simplifiedPlannerWeekHeader">
                <h2>{week.title}</h2>
                <button
                  className="weekAddButton"
                  onClick={() => setSelectedSlot(firstEmptySlotForWeek(week.id))}
                >
                  + Add Recipe
                </button>
              </div>

              <div className="plannerTableHeader" aria-hidden="true">
                <span>Day</span>
                <span>Dinner Plan</span>
                <span>Estimated Cost</span>
                <span>Actions</span>
              </div>

              <div className="plannerCompactTableRows">
                {WEEK_DAYS.map((day) => {
                  const slotKey = `${week.id}-${day}`;
                  const mealIds = normalizedPlan[slotKey] || [];

                  return (
                    <section className="plannerTableRow" key={slotKey}>
                      <div className="plannerTableDay">
                        <strong>{day}</strong>
                      </div>

                      <div className="plannerTableMeals plannerTableMealsWide">
                        {mealIds.length === 0 ? (
                          <button
                            className="plannerEmptyMeal plannerTableEmpty"
                            onClick={() => setSelectedSlot(slotKey)}
                          >
                            + Add dinner
                          </button>
                        ) : (
                          mealIds.map((recipeId, index) => {
                            const recipe = resolvePlannerRecipe(recipeId);
                            const dinnerMeal = resolvePlannerDinnerMeal(recipeId);
                            const plannerItem = recipe || dinnerMeal;
                            if (!plannerItem) return null;

                            return (
                              <div className="plannerTableMealTitle" key={`${slotKey}-${recipeId}-${index}`}>
                                <div className="plannerMealTitleWithBalance">
                                  <strong>{plannerItem.title}</strong>
                                  <MealBalanceBadge item={plannerItem} className="plannerMealBalanceBadge" />
                                </div>
                                {recipe ? (
                                  <small>{recipe.id} · {recipe.category} · {recipe.time} min · serves {servings}</small>
                                ) : (
                                  <div className="plannerDinnerComboReference plannerDinnerComboReferenceWithImage">
                                    <div className="plannerDinnerComboThumbWrap">
                                      <DinnerCombinationImage
                                        meal={plannerItem}
                                        className="plannerDinnerComboThumb"
                                        loading="lazy"
                                        fetchPriority="low"
                                      />
                                    </div>
                                    <div className="plannerDinnerComboText">
                                      <small>{plannerItem.id.toUpperCase()} · Dinner Combination · {plannerItem.calories || "—"} calories</small>
                                      <span><strong>Main:</strong> {plannerItem.mainDish} — {plannerItem.mainServing}</span>
                                      {(plannerItem.sides || []).map((side) => (
                                        <span key={`${recipeId}-${side.name}`}><strong>Side:</strong> {side.name} — {side.serving}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>

                      <div className="plannerTableEstimatedCost">
                        {mealIds.length === 0 ? (
                          <span className="plannerTableMuted">Estimated cost appears after you add a dinner.</span>
                        ) : (
                          mealIds.map((recipeId, index) => {
                            const recipe = resolvePlannerRecipe(recipeId);
                            const dinnerMeal = resolvePlannerDinnerMeal(recipeId);
                            if (!recipe && !dinnerMeal) return null;

                            return (
                              <span key={`${slotKey}-${recipeId}-${index}-nutrition`}>
                                {recipe ? plannerEstimatedCostText(recipe) : "Dinner combination cost estimate not available"}
                              </span>
                            );
                          })
                        )}
                      </div>

                      <div className="plannerTableActions">
                        {mealIds.length === 0 ? (
                          <button
                            className="plannerMiniButton"
                            onClick={() => setSelectedSlot(slotKey)}
                          >
                            Add
                          </button>
                        ) : (
                          mealIds.map((recipeId, index) => {
                            const recipe = resolvePlannerRecipe(recipeId);
                            const dinnerMeal = resolvePlannerDinnerMeal(recipeId);
                            if (!recipe && !dinnerMeal) return null;
                            const isSaved = recipe ? Array.isArray(favorites) && favorites.includes(recipe.id) : false;

                            return (
                              <div className="plannerTableActionSet" key={`${slotKey}-${recipeId}-${index}-actions`}>
                                {recipe && (
                                  <button
                                    className={isSaved ? "plannerHeart saved" : "plannerHeart"}
                                    onClick={() => toggleFavorite(recipe.id)}
                                    aria-label={isSaved ? "Remove from favorites" : "Add to favorites"}
                                  >
                                    ♥
                                  </button>
                                )}
                                <button
                                  className="plannerMiniButton"
                                  onClick={() => recipe ? openRecipeCard(recipe.id, recipes) : setPlannerDinnerViewer(dinnerMeal)}
                                >
                                  View
                                </button>
                                <button
                                  className="plannerRemoveButton"
                                  onClick={() => removeRecipe(slotKey, index)}
                                  aria-label="Remove recipe"
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {plannerDinnerViewer && (
        <div className="plannerDinnerModalOverlay" role="dialog" aria-modal="true" aria-label={`${plannerDinnerViewer.title} dinner combination`}>
          <article className="plannerDinnerModal">
            <header className="plannerDinnerModalHeader">
              <div className="plannerDinnerModalTitleBlock">
                <span className="dinnerCombinationMealBadge">Meal #{plannerDinnerViewer.number}</span>
                <h2>{plannerDinnerViewer.title}</h2>
                <p className="dinnerCombinationSubtitle">{plannerDinnerViewer.subtitle}</p>
                <MealBalanceDetails item={plannerDinnerViewer} prefix="Combo Meal Balance" className="comboMealBalanceDetails" />
              </div>
              <button
                type="button"
                className="plannerDinnerModalClose"
                onClick={() => setPlannerDinnerViewer(null)}
                aria-label="Close dinner combination"
              >
                ×
              </button>
            </header>

            <section className="plannerDinnerModalSummaryGrid">
              <DinnerCombinationImage
                meal={plannerDinnerViewer}
                className="plannerDinnerModalImage plannerDinnerModalImageCompact"
                loading="eager"
                fetchPriority="high"
              />

              <section className="plannerDinnerModalDetails plannerDinnerModalMenuText">
                <h3>Main Dish:</h3>
                <p><strong>{plannerDinnerViewer.mainDish}</strong> — {plannerDinnerViewer.mainServing}</p>

                <h3>Sides:</h3>
                <ul>
                  {(plannerDinnerViewer.sides || []).map((side) => (
                    <li key={`${plannerDinnerViewer.id}-${side.name}`}><strong>{side.name}</strong> — {side.serving}</li>
                  ))}
                </ul>
              </section>
            </section>

            <section className="plannerDinnerModalNutrition">
              <h3>Estimated nutrition for the whole meal:</h3>
              <p>
                {plannerDinnerViewer.calories || "—"} calories | {plannerDinnerViewer.protein || "—"}g protein | {plannerDinnerViewer.carbs || "—"}g carbs | {plannerDinnerViewer.fat || "—"}g fat | {plannerDinnerViewer.fiber || "—"}g fiber
              </p>
            </section>

            <section className="plannerDinnerModalRecipeButtons" aria-label={`Recipe cards for ${plannerDinnerViewer.title}`}>
              <h3>Recipe Cards</h3>
              <div className="plannerDinnerModalRecipeButtonGrid">
                {plannerDinnerRecipeButtons(plannerDinnerViewer).map((button) => {
                  const linkedRecipe = resolvePlannerRecipe(button.recipeId);

                  return (
                    <button
                      type="button"
                      key={`${plannerDinnerViewer.id}-${button.type}-${button.label}`}
                      className={linkedRecipe ? "plannerDinnerRecipeButton hasRecipeMatch" : "plannerDinnerRecipeButton missingRecipeMatch"}
                      onClick={() => linkedRecipe && openDinnerRecipeCard(linkedRecipe.id)}
                      disabled={!linkedRecipe}
                      title={linkedRecipe ? `Open ${linkedRecipe.title}` : "Recipe card not linked yet"}
                    >
                      <span>{button.type}</span>
                      <strong>{linkedRecipe ? `${linkedRecipe.id} · ${linkedRecipe.title}` : button.label}</strong>
                      {!linkedRecipe && <small>Card not linked yet</small>}
                    </button>
                  );
                })}
              </div>
            </section>

            <details className="dinnerCombinationHeating" open>
              <summary>Heating & freezer notes</summary>
              <div>
                <p><strong>Freezer life:</strong> {plannerDinnerViewer.freezerLife}</p>
                <p><strong>Oven:</strong> {plannerDinnerViewer.ovenInstructions}</p>
                <p><strong>Microwave:</strong> {plannerDinnerViewer.microwaveInstructions}</p>
              </div>
            </details>
          </article>
        </div>
      )}
    </main>
  );
}

function ServingSelector({ servings, setServings }) {
  return (
    <div className="servingSelector">
      <span>Servings:</span>
      {[2, 4, 6].map((n) => (
        <button
          key={n}
          className={servings === n ? "selected" : ""}
          onClick={() => setServings(n)}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function PantryStaplesPage({ pantry, setPantry }) {
  const [selectedPantryLevel, setSelectedPantryLevel] = useState(1);
  const selectedLevelInfo =
    PANTRY_LEVELS.find((level) => level.id === selectedPantryLevel) ||
    PANTRY_LEVELS[0];

  const visiblePantryGroups = PANTRY_STAPLES.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.level <= selectedPantryLevel),
  })).filter((group) => group.items.length > 0);

  const totalStaples = visiblePantryGroups.reduce(
    (sum, group) => sum + group.items.length,
    0
  );

  const checkedCount = visiblePantryGroups.reduce(
    (sum, group) =>
      sum + group.items.filter((item) => pantry[item.name]).length,
    0
  );

  function togglePantryItem(item) {
    setPantry((current) => ({
      ...current,
      [item.name]: !current[item.name],
    }));
  }

  function clearPantry() {
    setPantry({});
  }

  function checkLevelStaples(level = selectedPantryLevel) {
    const levelItems = PANTRY_STAPLES.flatMap((group) =>
      group.items.filter((item) => item.level <= level).map((item) => item.name)
    );

    setPantry((current) => {
      const next = { ...current };
      levelItems.forEach((item) => {
        next[item] = true;
      });
      return next;
    });
  }

  return (
    <main className="pageShell pantryPage">
      <div className="pageHeader">
        <div>
          <div className="aiBadge">SHELF-STABLE PANTRY SETUP</div>
          <h1>PANTRY STAPLES</h1>
          <p>
            Choose a pantry level and check off shelf-stable products you already
            keep on hand. Each level builds on the one before it.
          </p>
        </div>

        <div className="totalBox">
          <small>{selectedLevelInfo.shortLabel} Stocked</small>
          <strong>
            {checkedCount}/{totalStaples}
          </strong>
        </div>
      </div>

      <div className="pantryLevelTabs" role="tablist" aria-label="Pantry staple level">
        {PANTRY_LEVELS.map((level) => (
          <button
            key={level.id}
            type="button"
            className={selectedPantryLevel === level.id ? "active" : ""}
            onClick={() => setSelectedPantryLevel(level.id)}
          >
            <span>Level {level.id}</span>
            <strong>{level.shortLabel}</strong>
          </button>
        ))}
      </div>

      <div className="pantryLevelSummary">
        <div>
          <h2>{selectedLevelInfo.label}</h2>
          <p>{selectedLevelInfo.description}</p>
        </div>
        <span>All items shown are shelf-stable.</span>
      </div>

      <div className="pantryActions">
        <button className="primary" onClick={() => checkLevelStaples(selectedPantryLevel)}>
          Check Level {selectedPantryLevel}
        </button>
        <button className="secondary" onClick={() => checkLevelStaples(1)}>
          Check Minimum
        </button>
        <button className="secondary" onClick={clearPantry}>
          Clear pantry checks
        </button>
      </div>

      <div className="pantryGrid">
        {visiblePantryGroups.map((group) => (
          <section className="pantryGroup" key={group.group}>
            <h2>{group.group}</h2>

            {group.items.map((item) => (
              <label
                key={item.name}
                className={pantry[item.name] ? "pantryItem checked" : "pantryItem"}
              >
                <input
                  type="checkbox"
                  checked={!!pantry[item.name]}
                  onChange={() => togglePantryItem(item)}
                />
                <span>{item.name}</span>
                <em>Level {item.level}</em>
              </label>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}



function normalizeRefrigeratorState(value) {
  if (!value || typeof value !== "object") {
    return { items: {}, customItems: [] };
  }

  return {
    items: value.items && typeof value.items === "object" ? value.items : {},
    customItems: Array.isArray(value.customItems) ? value.customItems : [],
  };
}

function getUseByDaysRemaining(useByDate) {
  if (!useByDate) return null;

  const target = new Date(`${useByDate}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

function refrigeratorItemShouldUseSoon(entry) {
  if (!entry) return false;
  if (entry.status === "Use Soon") return true;

  const daysRemaining = getUseByDaysRemaining(entry.useByDate);
  return entry.inFridge && daysRemaining !== null && daysRemaining <= 3;
}

function buildRefrigeratorGroceryItems(refrigerator) {
  const safe = normalizeRefrigeratorState(refrigerator);
  const defaultItems = getDefaultRefrigeratorItems();
  const customItems = safe.customItems.map((item) => ({
    ...item,
    categoryTitle:
      REFRIGERATOR_CATEGORIES.find((category) => category.id === item.categoryId)?.title ||
      "Refrigerator Inventory",
    custom: true,
  }));

  return [...defaultItems, ...customItems]
    .map((item) => ({ ...item, ...(safe.items[item.id] || {}) }))
    .filter((item) => item.grocery || item.status === "Running Low" || item.status === "Out")
    .map((item) => ({
      name: item.name,
      qty: Number.parseFloat(item.quantity) || 1,
      unit: item.unit || "item",
      aisle: "Refrigerator Inventory",
    }));
}

function mergeShoppingListEntries(items) {
  const merged = new Map();

  items.forEach((item) => {
    if (!item?.name) return;
    const unit = item.unit || "item";
    const aisle = item.aisle || "Grocery List";
    const key = `${String(item.name).trim().toLowerCase()}|${String(unit).trim().toLowerCase()}`;
    const existing = merged.get(key);

    if (!existing) {
      merged.set(key, { ...item, unit, aisle });
      return;
    }

    const currentQty = Number.parseFloat(existing.qty);
    const nextQty = Number.parseFloat(item.qty);
    merged.set(key, {
      ...existing,
      qty: Number.isFinite(currentQty) && Number.isFinite(nextQty)
        ? currentQty + nextQty
        : existing.qty || item.qty || 1,
      aisle: existing.aisle === aisle ? aisle : `${existing.aisle} / ${aisle}`,
    });
  });

  return [...merged.values()];
}

function RefrigeratorInventoryPage({ refrigerator, setRefrigerator, setActivePage }) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    REFRIGERATOR_CATEGORIES[0]?.id || "fresh-produce"
  );
  const [filterMode, setFilterMode] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [customFormOpen, setCustomFormOpen] = useState(false);
  const [customForm, setCustomForm] = useState({
    name: "",
    quantity: "",
    unit: "",
    openedDate: "",
    useByDate: "",
    status: "Available",
    notes: "",
  });

  const safeInventory = normalizeRefrigeratorState(refrigerator);
  const selectedCategory =
    REFRIGERATOR_CATEGORIES.find((category) => category.id === selectedCategoryId) ||
    REFRIGERATOR_CATEGORIES[0];
  const defaultItems = useMemo(() => getDefaultRefrigeratorItems(), []);
  const customItems = safeInventory.customItems.map((item) => ({
    ...item,
    categoryTitle:
      REFRIGERATOR_CATEGORIES.find((category) => category.id === item.categoryId)?.title ||
      "Custom Items",
    group: "Custom Items",
    custom: true,
  }));
  const allItems = [...defaultItems, ...customItems];
  const enrichedItems = allItems.map((item) => ({
    ...item,
    ...(safeInventory.items[item.id] || {}),
    status: safeInventory.items[item.id]?.status || "Available",
  }));

  const groceryItems = buildRefrigeratorGroceryItems(safeInventory);
  const useSoonItems = enrichedItems
    .filter(refrigeratorItemShouldUseSoon)
    .sort((a, b) => {
      const daysA = getUseByDaysRemaining(a.useByDate);
      const daysB = getUseByDaysRemaining(b.useByDate);
      if (daysA === null && daysB === null) return a.name.localeCompare(b.name);
      if (daysA === null) return 1;
      if (daysB === null) return -1;
      return daysA - daysB;
    });

  const summary = {
    inFridge: enrichedItems.filter((item) => item.inFridge).length,
    runningLow: enrichedItems.filter((item) => item.status === "Running Low").length,
    useSoon: useSoonItems.length,
    grocery: groceryItems.length,
  };

  const visibleItems = enrichedItems.filter((item) => {
    const matchesSearch = searchTerm.trim()
      ? item.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
      : item.categoryId === selectedCategory?.id;

    if (!matchesSearch) return false;

    if (filterMode === "in") return !!item.inFridge;
    if (filterMode === "low") return item.status === "Running Low";
    if (filterMode === "soon") return refrigeratorItemShouldUseSoon(item);
    if (filterMode === "out") return item.status === "Out";
    if (filterMode === "grocery") return !!item.grocery || item.status === "Running Low" || item.status === "Out";
    return true;
  });

  const visibleGroups = visibleItems.reduce((acc, item) => {
    const key = searchTerm.trim() ? item.categoryTitle : item.group || "Items";
    return {
      ...acc,
      [key]: [...(acc[key] || []), item],
    };
  }, {});

  function updateItem(itemId, updates) {
    setRefrigerator((current) => {
      const safe = normalizeRefrigeratorState(current);
      return {
        ...safe,
        items: {
          ...safe.items,
          [itemId]: {
            ...(safe.items[itemId] || {}),
            ...updates,
          },
        },
      };
    });
  }

  function addCustomItem() {
    const name = customForm.name.trim();
    if (!name) return;

    const category = selectedCategory || REFRIGERATOR_CATEGORIES[0];
    const id = `custom-${category.id}-${slugifyRefrigeratorItem(name)}-${Date.now()}`;

    setRefrigerator((current) => {
      const safe = normalizeRefrigeratorState(current);
      return {
        ...safe,
        customItems: [
          ...safe.customItems,
          {
            id,
            name,
            categoryId: category.id,
            group: "Custom Items",
            custom: true,
          },
        ],
        items: {
          ...safe.items,
          [id]: {
            inFridge: true,
            quantity: customForm.quantity,
            unit: customForm.unit,
            openedDate: customForm.openedDate,
            useByDate: customForm.useByDate,
            status: customForm.status || "Available",
            notes: customForm.notes,
          },
        },
      };
    });

    setCustomForm({
      name: "",
      quantity: "",
      unit: "",
      openedDate: "",
      useByDate: "",
      status: "Available",
      notes: "",
    });
    setCustomFormOpen(false);
  }

  function removeCustomItem(itemId) {
    setRefrigerator((current) => {
      const safe = normalizeRefrigeratorState(current);
      const nextItems = { ...safe.items };
      delete nextItems[itemId];

      return {
        ...safe,
        items: nextItems,
        customItems: safe.customItems.filter((item) => item.id !== itemId),
      };
    });
  }

  function renderItemRow(item) {
    const daysRemaining = getUseByDaysRemaining(item.useByDate);
    const useSoon = refrigeratorItemShouldUseSoon(item);

    return (
      <div className={useSoon ? "fridgeItemRow useSoon" : "fridgeItemRow"} key={item.id}>
        <label className="fridgeCheckCell">
          <input
            type="checkbox"
            checked={!!item.inFridge}
            onChange={(event) => updateItem(item.id, { inFridge: event.target.checked })}
          />
          <span>In Refrigerator</span>
        </label>

        <div className="fridgeNameCell">
          <strong>{item.name}</strong>
          {item.custom && <small>Custom item</small>}
          {useSoon && <em>Use soon reminder{daysRemaining !== null ? ` · ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}` : ""}</em>}
        </div>

        <input
          className="fridgeQtyInput"
          type="text"
          inputMode="decimal"
          value={item.quantity || ""}
          onChange={(event) => updateItem(item.id, { quantity: event.target.value })}
          placeholder="Qty"
          aria-label={`${item.name} quantity`}
        />

        <input
          className="fridgeUnitInput"
          type="text"
          value={item.unit || ""}
          onChange={(event) => updateItem(item.id, { unit: event.target.value })}
          placeholder="Unit"
          aria-label={`${item.name} unit`}
        />

        <label className="fridgeDateField">
          <span>Opened</span>
          <input
            type="date"
            value={item.openedDate || ""}
            onChange={(event) => updateItem(item.id, { openedDate: event.target.value })}
          />
        </label>

        <label className="fridgeDateField">
          <span>Use by</span>
          <input
            type="date"
            value={item.useByDate || ""}
            onChange={(event) => updateItem(item.id, { useByDate: event.target.value })}
          />
        </label>

        <select
          className="fridgeStatusSelect"
          value={item.status || "Available"}
          onChange={(event) => updateItem(item.id, { status: event.target.value })}
          aria-label={`${item.name} status`}
        >
          {REFRIGERATOR_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        <button
          type="button"
          className={item.grocery || item.status === "Running Low" || item.status === "Out" ? "fridgeGroceryButton active" : "fridgeGroceryButton"}
          onClick={() => updateItem(item.id, { grocery: !item.grocery })}
        >
          {item.grocery ? "On List" : "Add"}
        </button>

        {item.custom && (
          <button
            type="button"
            className="fridgeRemoveButton"
            onClick={() => removeCustomItem(item.id)}
            aria-label={`Remove ${item.name}`}
          >
            ×
          </button>
        )}
      </div>
    );
  }

  return (
    <main className="pageShell refrigeratorInventoryPage">
      <div className="pageHeader refrigeratorHeader">
        <div>
          <h1>REFRIGERATOR INVENTORY</h1>
          <p>
            Track refrigerated foods, leftovers, quantities, opened dates, and use-by reminders.
            Mark what you already have, flag items that should be used soon, and send low-stock
            items to your grocery list before they are forgotten.
          </p>
        </div>
      </div>

      <section className="fridgeSummaryGrid" aria-label="Refrigerator inventory summary">
        <div className="fridgeSummaryBox"><small>Items in Refrigerator</small><strong>{summary.inFridge}</strong></div>
        <div className="fridgeSummaryBox"><small>Running Low</small><strong>{summary.runningLow}</strong></div>
        <div className="fridgeSummaryBox"><small>Use Soon</small><strong>{summary.useSoon}</strong></div>
        <div className="fridgeSummaryBox"><small>Added to Grocery List</small><strong>{summary.grocery}</strong></div>
      </section>

      <section className="fridgeUseSoonPanel">
        <div className="fridgeUseSoonHeader">
          <div>
            <h2>USE SOON</h2>
            <p>Organizational reminders only. Always use your own judgment about food safety.</p>
          </div>
          <strong>{useSoonItems.length} items</strong>
        </div>

        {useSoonItems.length === 0 ? (
          <p className="fridgeUseSoonEmpty">No refrigerator items are currently marked use soon.</p>
        ) : (
          <div className="fridgeUseSoonList">
            {useSoonItems.slice(0, 12).map((item) => (
              <div className="fridgeUseSoonItem" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <small>{item.quantity || "—"} {item.unit || ""} · {item.categoryTitle}</small>
                  <em>{item.useByDate ? `Use by ${item.useByDate}` : "Marked Use Soon"}</em>
                </div>
                <div className="fridgeUseSoonActions">
                  <button type="button" onClick={() => updateItem(item.id, { inFridge: false, status: "Available" })}>Mark Used</button>
                  <button type="button" onClick={() => updateItem(item.id, { grocery: true })}>Add to List</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="fridgeFiltersBar">
        <label>
          <span>Search</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search refrigerator items..."
          />
        </label>
        <label>
          <span>Filter</span>
          <select value={filterMode} onChange={(event) => setFilterMode(event.target.value)}>
            {REFRIGERATOR_FILTERS.map((filter) => (
              <option key={filter.id} value={filter.id}>{filter.label}</option>
            ))}
          </select>
        </label>
        <button type="button" className="secondary" onClick={() => setActivePage("Shopping Lists")}>View Grocery List</button>
      </section>

      <div className="fridgeInventoryLayout">
        <aside className="fridgeCategoryNav" aria-label="Refrigerator categories">
          {REFRIGERATOR_CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              className={selectedCategoryId === category.id ? "active" : ""}
              onClick={() => setSelectedCategoryId(category.id)}
            >
              {category.title}
            </button>
          ))}
        </aside>

        <section className="fridgeItemsPanel">
          <div className="fridgeItemsHeader">
            <div>
              <h2>{searchTerm.trim() ? "Search Results" : selectedCategory?.title}</h2>
              <p>{visibleItems.length} items shown</p>
            </div>
            <button type="button" className="primary" onClick={() => setCustomFormOpen((open) => !open)}>
              ADD CUSTOM ITEM
            </button>
          </div>

          {customFormOpen && (
            <div className="fridgeCustomForm">
              <input type="text" value={customForm.name} onChange={(event) => setCustomForm((current) => ({ ...current, name: event.target.value }))} placeholder="Item name" />
              <select value={selectedCategoryId} onChange={(event) => setSelectedCategoryId(event.target.value)}>
                {REFRIGERATOR_CATEGORIES.map((category) => <option key={category.id} value={category.id}>{category.title}</option>)}
              </select>
              <input type="text" value={customForm.quantity} onChange={(event) => setCustomForm((current) => ({ ...current, quantity: event.target.value }))} placeholder="Qty" />
              <input type="text" value={customForm.unit} onChange={(event) => setCustomForm((current) => ({ ...current, unit: event.target.value }))} placeholder="Unit" />
              <label><span>Opened</span><input type="date" value={customForm.openedDate} onChange={(event) => setCustomForm((current) => ({ ...current, openedDate: event.target.value }))} /></label>
              <label><span>Use by</span><input type="date" value={customForm.useByDate} onChange={(event) => setCustomForm((current) => ({ ...current, useByDate: event.target.value }))} /></label>
              <select value={customForm.status} onChange={(event) => setCustomForm((current) => ({ ...current, status: event.target.value }))}>
                {REFRIGERATOR_STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
              <textarea value={customForm.notes} onChange={(event) => setCustomForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Optional notes" />
              <button type="button" className="primary" onClick={addCustomItem}>Save Custom Item</button>
            </div>
          )}

          <div className="fridgeItemTableHeader" aria-hidden="true">
            <span>Have</span><span>Item</span><span>Qty</span><span>Unit</span><span>Opened</span><span>Use By</span><span>Status</span><span>List</span>
          </div>

          {Object.entries(visibleGroups).length === 0 ? (
            <EmptyState title="No refrigerator items found" text="Try another category, filter, or search term." />
          ) : (
            Object.entries(visibleGroups).map(([groupName, items]) => (
              <section className="fridgeItemGroup" key={groupName}>
                <h3>{groupName}</h3>
                {items.map(renderItemRow)}
              </section>
            ))
          )}
        </section>
      </div>
    </main>
  );
}


function normalizeFreezerState(value) {
  return {
    items: value && typeof value.items === "object" && !Array.isArray(value.items) ? value.items : {},
    customItems: Array.isArray(value?.customItems) ? value.customItems : [],
    customLocations: Array.isArray(value?.customLocations) ? value.customLocations : [],
  };
}

function getFreezerUseByDaysRemaining(dateValue) {
  if (!dateValue) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

function freezerItemShouldUseSoon(entry) {
  if (!entry?.onHand) return false;
  const daysRemaining = getFreezerUseByDaysRemaining(entry.useByDate);
  return daysRemaining !== null && daysRemaining <= 14;
}

function buildFreezerGroceryItems(freezer) {
  const safe = normalizeFreezerState(freezer);
  const defaultItems = getDefaultFreezerItems();
  const customItems = safe.customItems.map((item) => ({
    ...item,
    categoryTitle:
      FREEZER_CATEGORIES.find((category) => category.id === item.categoryId)?.title ||
      "Freezer Inventory",
    custom: true,
  }));

  return [...defaultItems, ...customItems]
    .map((item) => ({ ...item, ...(safe.items[item.id] || {}) }))
    .filter((item) =>
      item.grocery ||
      item.status === "Running low" ||
      item.status === "One remaining" ||
      freezerItemShouldUseSoon(item)
    )
    .map((item) => ({
      name: item.name,
      qty: Number.parseFloat(item.quantity) || 1,
      unit: item.packageSize || item.unit || "item",
      aisle: "Freezer Inventory",
    }));
}

const FREEZER_PACKAGE_OPTIONS = [
  "",
  "Individual portion",
  "1 cup",
  "2 cups",
  "4 cups",
  "8 oz",
  "12 oz",
  "16 oz",
  "24 oz",
  "32 oz",
  "1 lb",
  "2 lb",
  "3 lb",
  "5 lb",
  "Quart freezer bag",
  "Gallon freezer bag",
  "Vacuum-sealed bag",
  "Foil pan",
  "Deli container",
  "Original package",
];

function freezerPackageOptions(currentValue = "") {
  return currentValue && !FREEZER_PACKAGE_OPTIONS.includes(currentValue)
    ? [currentValue, ...FREEZER_PACKAGE_OPTIONS]
    : FREEZER_PACKAGE_OPTIONS;
}

function FreezerInventoryPage({ freezer, setFreezer, setActivePage }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [expandedCategories, setExpandedCategories] = useState(() => new Set([FREEZER_CATEGORIES[0]?.id || "meat-poultry"]));
  const [customFormCategory, setCustomFormCategory] = useState(null);
  const [customLocationName, setCustomLocationName] = useState("");
  const [customForm, setCustomForm] = useState({
    name: "",
    quantity: "",
    unit: "",
    packageSize: "",
    dateFrozen: "",
    useByDate: "",
    location: "Kitchen freezer",
    status: "Plenty on hand",
    notes: "",
  });

  const importInputId = "freezer-inventory-import-file";
  const safeFreezer = normalizeFreezerState(freezer);
  const defaultItems = useMemo(() => getDefaultFreezerItems(), []);
  const locations = [...new Set([...DEFAULT_FREEZER_LOCATIONS, ...safeFreezer.customLocations])];
  const customItems = safeFreezer.customItems.map((item) => ({
    ...item,
    categoryTitle:
      FREEZER_CATEGORIES.find((category) => category.id === item.categoryId)?.title ||
      "Custom Items",
    custom: true,
  }));
  const allItems = [...defaultItems, ...customItems].map((item) => ({
    ...item,
    ...(safeFreezer.items[item.id] || {}),
    status: safeFreezer.items[item.id]?.status || "Plenty on hand",
    location: safeFreezer.items[item.id]?.location || item.location || "Kitchen freezer",
  }));

  const summary = {
    onHand: allItems.filter((item) => item.onHand).length,
    useSoon: allItems.filter(freezerItemShouldUseSoon).length,
    low: allItems.filter((item) => item.status === "Running low" || item.status === "One remaining").length,
    grocery: buildFreezerGroceryItems(safeFreezer).length,
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const visibleItems = allItems.filter((item) => {
    const matchesSearch = normalizedSearch ? item.name.toLowerCase().includes(normalizedSearch) : true;
    if (!matchesSearch) return false;
    if (locationFilter !== "all" && (item.location || "Kitchen freezer") !== locationFilter) return false;
    if (filterMode === "checked") return !!item.onHand;
    if (filterMode === "soon") return freezerItemShouldUseSoon(item);
    if (filterMode === "low") return item.status === "Running low" || item.status === "One remaining";
    if (filterMode === "grocery") return !!item.grocery || item.status === "Running low" || item.status === "One remaining";
    return true;
  });

  const visibleByCategory = FREEZER_CATEGORIES.map((category) => ({
    ...category,
    items: visibleItems.filter((item) => item.categoryId === category.id),
    checkedCount: allItems.filter((item) => item.categoryId === category.id && item.onHand).length,
  }));

  function updateItem(itemId, patch) {
    setFreezer((current) => {
      const safe = normalizeFreezerState(current);
      return {
        ...safe,
        items: {
          ...safe.items,
          [itemId]: {
            ...(safe.items[itemId] || {}),
            ...patch,
          },
        },
      };
    });
  }

  function toggleCategory(categoryId) {
    setExpandedCategories((current) => {
      const next = new Set(current);
      next.has(categoryId) ? next.delete(categoryId) : next.add(categoryId);
      return next;
    });
  }

  function expandAllCategories() {
    setExpandedCategories(new Set(FREEZER_CATEGORIES.map((category) => category.id)));
  }

  function collapseAllCategories() {
    setExpandedCategories(new Set());
  }

  function addCustomLocation() {
    const trimmed = customLocationName.trim();
    if (!trimmed) return;
    setFreezer((current) => {
      const safe = normalizeFreezerState(current);
      return {
        ...safe,
        customLocations: [...new Set([...safe.customLocations, trimmed])],
      };
    });
    setCustomLocationName("");
  }

  function addCustomItem(categoryId) {
    const name = customForm.name.trim();
    if (!name) return;
    const id = `custom-freezer-${Date.now()}-${slugifyFreezerItem(name)}`;
    const category = FREEZER_CATEGORIES.find((item) => item.id === categoryId) || FREEZER_CATEGORIES[0];
    setFreezer((current) => {
      const safe = normalizeFreezerState(current);
      return {
        ...safe,
        customItems: [
          ...safe.customItems,
          { id, name, categoryId: category.id, categoryTitle: category.title, custom: true },
        ],
        items: {
          ...safe.items,
          [id]: {
            onHand: true,
            quantity: customForm.quantity,
            unit: customForm.unit,
            packageSize: customForm.packageSize,
            dateFrozen: customForm.dateFrozen,
            useByDate: customForm.useByDate,
            location: customForm.location,
            status: customForm.status,
            notes: customForm.notes,
          },
        },
      };
    });
    setCustomForm({
      name: "",
      quantity: "",
      unit: "",
      packageSize: "",
      dateFrozen: "",
      useByDate: "",
      location: "Kitchen freezer",
      status: "Plenty on hand",
      notes: "",
    });
    setCustomFormCategory(null);
  }

  function editCustomItem(item) {
    const nextName = window.prompt("Edit custom freezer item name", item.name);
    if (!nextName || !nextName.trim()) return;
    setFreezer((current) => {
      const safe = normalizeFreezerState(current);
      return {
        ...safe,
        customItems: safe.customItems.map((customItem) =>
          customItem.id === item.id ? { ...customItem, name: nextName.trim() } : customItem
        ),
      };
    });
  }

  function removeCustomItem(itemId) {
    if (!window.confirm("Remove this custom freezer item?")) return;
    setFreezer((current) => {
      const safe = normalizeFreezerState(current);
      const nextItems = { ...safe.items };
      delete nextItems[itemId];
      return {
        ...safe,
        customItems: safe.customItems.filter((item) => item.id !== itemId),
        items: nextItems,
      };
    });
  }

  function printInventory() {
    window.print();
  }

  function exportInventory() {
    const blob = new Blob([JSON.stringify(safeFreezer, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `roberts-recipe-box-freezer-inventory-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function importInventory(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || "{}"));
        setFreezer(normalizeFreezerState(parsed));
      } catch (error) {
        window.alert("That freezer inventory file could not be imported.");
      }
      event.target.value = "";
    };
    reader.readAsText(file);
  }

  function clearInventory() {
    if (!window.confirm("Clear the entire freezer inventory? This removes checked items, custom items, locations, and saved freezer notes from this browser.")) return;
    setFreezer({ items: {}, customItems: [], customLocations: [] });
  }

  function renderFreezerItem(item) {
    const useSoon = freezerItemShouldUseSoon(item);
    const shouldBuy =
      item.grocery ||
      item.status === "Running low" ||
      item.status === "One remaining" ||
      useSoon;

    return (
      <div className={useSoon ? "freezerItemRow useSoon" : "freezerItemRow"} key={item.id}>
        <label className="freezerCheckCell" aria-label={`${item.name} on hand`}>
          <input
            type="checkbox"
            checked={!!item.onHand}
            onChange={(event) => updateItem(item.id, { onHand: event.target.checked })}
          />
        </label>

        <div className="freezerNameCell">
          <strong>{item.name}</strong>
          <small>{item.categoryTitle}</small>
          {useSoon && <em>Use By Soon</em>}
        </div>

        <input
          className="freezerQtyInput"
          type="text"
          inputMode="decimal"
          value={item.quantity || ""}
          onChange={(event) => updateItem(item.id, { quantity: event.target.value })}
          placeholder="Qty"
          aria-label={`${item.name} quantity`}
        />

        <select
          className="freezerPackageSelect"
          value={item.packageSize || ""}
          onChange={(event) => updateItem(item.id, { packageSize: event.target.value })}
          aria-label={`${item.name} package size`}
        >
          {freezerPackageOptions(item.packageSize).map((option) => (
            <option key={option || "blank"} value={option}>
              {option || "Select package"}
            </option>
          ))}
        </select>

        <div className="freezerStackedCell freezerDatesCell">
          <label className="freezerDateField">
            <span>Frozen</span>
            <input
              type="date"
              value={item.dateFrozen || ""}
              onChange={(event) => updateItem(item.id, { dateFrozen: event.target.value })}
            />
          </label>
          <label className="freezerDateField">
            <span>Use by</span>
            <input
              type="date"
              value={item.useByDate || ""}
              onChange={(event) => updateItem(item.id, { useByDate: event.target.value })}
            />
          </label>
        </div>

        <div className="freezerStackedCell freezerLocationStatusCell">
          <select
            value={item.location || "Kitchen freezer"}
            onChange={(event) => updateItem(item.id, { location: event.target.value })}
            aria-label={`${item.name} freezer location`}
          >
            {locations.map((location) => <option key={location} value={location}>{location}</option>)}
          </select>

          <select
            value={item.status || "Plenty on hand"}
            onChange={(event) => updateItem(item.id, { status: event.target.value })}
            aria-label={`${item.name} status`}
          >
            {FREEZER_STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>

        <button
          type="button"
          className={item.grocery ? "freezerGroceryButton active" : shouldBuy ? "freezerGroceryButton suggested" : "freezerGroceryButton"}
          onClick={() => updateItem(item.id, { grocery: !item.grocery })}
          title={useSoon && !item.grocery ? "Use-by date suggests replacing this item soon" : undefined}
        >
          {item.grocery ? "Added" : "Add"}
        </button>

        {item.custom && (
          <div className="freezerCustomActions">
            <button type="button" onClick={() => editCustomItem(item)}>Edit</button>
            <button type="button" onClick={() => removeCustomItem(item.id)}>Remove</button>
          </div>
        )}
      </div>
    );
  }

  const printDate = new Date().toLocaleDateString();
  const printItemsByCategory = FREEZER_CATEGORIES.map((category) => ({
    ...category,
    items: allItems.filter((item) => item.categoryId === category.id && item.onHand),
  })).filter((category) => category.items.length);

  return (
    <main className="pageShell freezerInventoryPage">
      <section className="freezerSummaryGrid" aria-label="Freezer inventory summary">
        <div className="freezerSummaryBox"><small>Total Items on Hand</small><strong>{summary.onHand}</strong></div>
        <div className="freezerSummaryBox"><small>Use Soon</small><strong>{summary.useSoon}</strong></div>
        <div className="freezerSummaryBox"><small>Running Low</small><strong>{summary.low}</strong></div>
        <div className="freezerSummaryBox"><small>Added to Grocery List</small><strong>{summary.grocery}</strong></div>
      </section>

      <section className="freezerToolbar freezerNoPrint">
        <label>
          <span>Search Inventory</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search freezer items..."
          />
        </label>
        <label>
          <span>Filter</span>
          <select value={filterMode} onChange={(event) => setFilterMode(event.target.value)}>
            {FREEZER_FILTERS.map((filter) => <option key={filter.id} value={filter.id}>{filter.label}</option>)}
          </select>
        </label>
        <label>
          <span>Location</span>
          <select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>
            <option value="all">All freezer locations</option>
            {locations.map((location) => <option key={location} value={location}>{location}</option>)}
          </select>
        </label>
        <button type="button" className="secondary" onClick={expandAllCategories}>Expand All</button>
        <button type="button" className="secondary" onClick={collapseAllCategories}>Collapse All</button>
      </section>

      <section className="freezerActions freezerNoPrint">
        <button type="button" className="primary" onClick={printInventory}>Print Inventory</button>
        <button type="button" className="secondary" onClick={exportInventory}>Export Inventory</button>
        <label className="freezerImportButton">
          <input id={importInputId} type="file" accept="application/json,.json" onChange={importInventory} />
          Import Inventory
        </label>
        <button type="button" className="secondary" onClick={() => setActivePage("Shopping Lists")}>View Grocery List</button>
        <button type="button" className="dangerButton" onClick={clearInventory}>Clear Inventory</button>
        <div className="freezerInlineLocationTool">
          <input
            type="text"
            value={customLocationName}
            onChange={(event) => setCustomLocationName(event.target.value)}
            placeholder="Add custom freezer location"
            aria-label="Add custom freezer location"
          />
          <button type="button" className="secondary" onClick={addCustomLocation}>Save Location</button>
        </div>
      </section>

      <section className="freezerPrintHeader">
        <h1>FREEZER INVENTORY</h1>
        <p>Printed {printDate}</p>
      </section>

      <div className="freezerAccordionList">
        {visibleByCategory.map((category) => {
          const isExpanded = expandedCategories.has(category.id);
          return (
            <section className="freezerAccordionSection" key={category.id}>
              <button
                type="button"
                className="freezerAccordionButton"
                onClick={() => toggleCategory(category.id)}
                aria-expanded={isExpanded}
              >
                <span>{isExpanded ? "▾" : "▸"}</span>
                <strong>{category.title}</strong>
                <em>{category.checkedCount} checked</em>
              </button>

              {isExpanded && (
                <div className="freezerAccordionBody">
                  <div className="freezerTableHeader freezerNoPrint" aria-hidden="true">
                    <span>On Hand</span><span>Item</span><span>Qty</span><span>Package</span><span>Frozen / Use By</span><span>Location / Status</span><span>Buy</span>
                  </div>

                  {category.items.length ? (
                    category.items.map(renderFreezerItem)
                  ) : (
                    <p className="freezerEmptyCategory">No items match the current filters.</p>
                  )}

                  <div className="freezerCustomPanel freezerNoPrint">
                    {customFormCategory === category.id ? (
                      <div className="freezerCustomForm">
                        <input type="text" value={customForm.name} onChange={(event) => setCustomForm((current) => ({ ...current, name: event.target.value }))} placeholder="Custom item name" aria-label="Custom freezer item name" />
                        <input type="text" value={customForm.quantity} onChange={(event) => setCustomForm((current) => ({ ...current, quantity: event.target.value }))} placeholder="Qty" aria-label="Custom freezer item quantity" />
                        <select value={customForm.packageSize} onChange={(event) => setCustomForm((current) => ({ ...current, packageSize: event.target.value }))} aria-label="Custom freezer item package size">
                          {FREEZER_PACKAGE_OPTIONS.map((option) => <option key={option || "blank"} value={option}>{option || "Select package"}</option>)}
                        </select>
                        <label><span>Frozen</span><input type="date" value={customForm.dateFrozen} onChange={(event) => setCustomForm((current) => ({ ...current, dateFrozen: event.target.value }))} /></label>
                        <label><span>Use by</span><input type="date" value={customForm.useByDate} onChange={(event) => setCustomForm((current) => ({ ...current, useByDate: event.target.value }))} /></label>
                        <select value={customForm.location} onChange={(event) => setCustomForm((current) => ({ ...current, location: event.target.value }))} aria-label="Custom freezer item location">
                          {locations.map((location) => <option key={location} value={location}>{location}</option>)}
                        </select>
                        <select value={customForm.status} onChange={(event) => setCustomForm((current) => ({ ...current, status: event.target.value }))} aria-label="Custom freezer item status">
                          {FREEZER_STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                        <textarea value={customForm.notes} onChange={(event) => setCustomForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Optional notes" />
                        <button type="button" className="primary" onClick={() => addCustomItem(category.id)}>Save Custom Item</button>
                        <button type="button" className="secondary" onClick={() => setCustomFormCategory(null)}>Cancel</button>
                      </div>
                    ) : (
                      <button type="button" className="secondary" onClick={() => setCustomFormCategory(category.id)}>Add Custom Item</button>
                    )}
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <section className="freezerPrintOnly freezerPrintList">
        {printItemsByCategory.length ? printItemsByCategory.map((category) => (
          <section key={category.id}>
            <h2>{category.title}</h2>
            <table>
              <thead><tr><th>Item</th><th>Qty</th><th>Package</th><th>Date Frozen</th><th>Use By</th><th>Location</th><th>Status</th></tr></thead>
              <tbody>
                {category.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.quantity || ""}</td>
                    <td>{item.packageSize || item.unit || ""}</td>
                    <td>{item.dateFrozen || ""}</td>
                    <td>{item.useByDate || ""}</td>
                    <td>{item.location || ""}</td>
                    <td>{item.status || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )) : <p>No freezer items are currently marked on hand.</p>}
      </section>
    </main>
  );
}

function ShoppingListPage({ plan, checked, setChecked, servings, pantry, refrigerator, freezer, setActivePage }) {
  const recipeIdSet = useMemo(() => new Set(recipes.map((recipe) => recipe.id)), []);
  const dinnerCombinationById = useMemo(
    () => Object.fromEntries(dinnerCombinations.map((meal) => [meal.id, meal])),
    []
  );

  const recipeOnlyPlan = useMemo(() => {
    const normalized = normalizeTwoWeekPlan(plan);
    const next = emptyTwoWeekPlan();

    PLANNER_SLOTS.forEach((slot) => {
      next[slot.key] = (normalized[slot.key] || []).filter((itemId) => recipeIdSet.has(itemId));
    });

    return next;
  }, [plan, recipeIdSet]);

  const dinnerCombinationShoppingReferences = useMemo(() => {
    const normalized = normalizeTwoWeekPlan(plan);
    const references = [];

    PLANNER_SLOTS.forEach((slot) => {
      (normalized[slot.key] || []).forEach((itemId) => {
        const meal = dinnerCombinationById[itemId];
        if (!meal) return;

        references.push({
          name: `Meal #${meal.number}: ${meal.title}`,
          qty: 1,
          unit: "meal",
          aisle: "Dinner Combinations",
        });
        references.push({
          name: `Main: ${meal.mainDish}`,
          qty: 1,
          unit: meal.mainServing || "serving",
          aisle: "Dinner Combinations",
        });
        (meal.sides || []).forEach((side) => {
          references.push({
            name: `Side: ${side.name}`,
            qty: 1,
            unit: side.serving || "serving",
            aisle: "Dinner Combinations",
          });
        });
      });
    });

    return references;
  }, [plan, dinnerCombinationById]);

  const refrigeratorShoppingItems = useMemo(
    () => buildRefrigeratorGroceryItems(refrigerator),
    [refrigerator]
  );
  const freezerShoppingItems = useMemo(
    () => buildFreezerGroceryItems(freezer),
    [freezer]
  );

  const list = useMemo(
    () => mergeShoppingListEntries([
      ...buildShoppingList(recipeOnlyPlan, recipes, servings),
      ...dinnerCombinationShoppingReferences,
      ...refrigeratorShoppingItems,
      ...freezerShoppingItems,
    ]),
    [recipeOnlyPlan, servings, dinnerCombinationShoppingReferences, refrigeratorShoppingItems, freezerShoppingItems]
  );

  const { needed, pantry: pantryItems } = useMemo(
    () => splitShoppingListByPantry(list, pantry),
    [list, pantry]
  );

  const groupedNeeded = needed.reduce((acc, item) => {
    return {
      ...acc,
      [item.aisle]: [...(acc[item.aisle] || []), item],
    };
  }, {});

  const groupedPantry = pantryItems.reduce((acc, item) => {
    return {
      ...acc,
      [item.aisle]: [...(acc[item.aisle] || []), item],
    };
  }, {});

  function toggleItem(key) {
    setChecked((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  function printShoppingList() {
    const printWindow = window.open("", "_blank", "width=900,height=700");

    const neededGroups = Object.entries(groupedNeeded);
    const pantryGroups = Object.entries(groupedPantry);

    const neededHtml = neededGroups.length
      ? neededGroups.map(([aisle, items]) => `
          <section>
            <h2>${aisle}</h2>
            ${items.map((item) => `
              <div class="item">
                <span class="box"></span>
                <strong>${item.name}</strong>
                <em>${formatQty(item.qty)} ${item.unit}</em>
              </div>
            `).join("")}
          </section>
        `).join("")
      : `<p>No needed items.</p>`;

    const pantryHtml = pantryGroups.length
      ? pantryGroups.map(([aisle, items]) => `
          <section>
            <h2>${aisle}</h2>
            ${items.map((item) => `
              <div class="item pantry">
                <span class="box filled"></span>
                <strong>${item.name}</strong>
                <em>${formatQty(item.qty)} ${item.unit}</em>
              </div>
            `).join("")}
          </section>
        `).join("")
      : "";

    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Shopping List</title>
          <style>
            @page { size: portrait; margin: 0.35in; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              color: #111;
              font-family: Arial, Helvetica, sans-serif;
              font-size: 10px;
              line-height: 1.15;
            }
            header {
              display: flex;
              justify-content: space-between;
              align-items: end;
              border-bottom: 2px solid #111;
              padding-bottom: 6px;
              margin-bottom: 8px;
            }
            h1 {
              margin: 0;
              font-size: 18px;
              letter-spacing: .04em;
              text-transform: uppercase;
            }
            .date { font-size: 10px; color: #333; }
            .grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              column-gap: 18px;
              row-gap: 8px;
              align-items: start;
            }
            section {
              break-inside: avoid;
              page-break-inside: avoid;
              border: 1px solid #999;
              border-radius: 6px;
              overflow: hidden;
            }
            h2 {
              margin: 0;
              padding: 4px 6px;
              background: #f0f0f0;
              border-bottom: 1px solid #999;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: .04em;
            }
            .item {
              display: grid;
              grid-template-columns: 14px minmax(0, 1fr) auto;
              gap: 5px;
              align-items: center;
              min-height: 20px;
              padding: 3px 6px;
              border-bottom: 1px solid #ddd;
            }
            .item:last-child { border-bottom: 0; }
            .box {
              width: 10px;
              height: 10px;
              border: 1px solid #111;
              display: inline-block;
            }
            .filled { background: #111; }
            strong {
              font-weight: 600;
              min-width: 0;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            em {
              font-style: normal;
              color: #333;
              white-space: nowrap;
            }
            .pantryTitle {
              font-size: 13px;
              margin: 12px 0 6px;
              padding-top: 6px;
              border-top: 1px solid #111;
            }
          </style>
        </head>
        <body>
          <header>
            <h1>Shopping List</h1>
            <div class="date">${new Date().toLocaleDateString()}</div>
          </header>

          <div class="grid">
            ${neededHtml}
          </div>

          ${pantryHtml ? `<h1 class="pantryTitle">Already in Pantry</h1><div class="grid">${pantryHtml}</div>` : ""}

          <script>
            window.onload = () => {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  }

  function renderGroceryReference(item) {
    const reference = findGroceryReference(item.name);
    if (!reference) return null;

    return (
      <div className="shoppingSuggestionNote">
        <strong>Suggested picks: {reference.name}</strong>
        <small>{reference.examples.slice(0, 3).join(" · ")}</small>
        <button type="button" onClick={() => setActivePage("Grocery Picks")}>
          Review
        </button>
      </div>
    );
  }

  function renderNeededItem(item) {
    const key = `${item.name}-${item.unit}-${item.aisle}`;

    return (
      <div key={key} className="shoppingItemWrap">
        <label
          className={checked[key] ? "checked shoppingItem" : "shoppingItem"}
        >
          <input
            type="checkbox"
            checked={!!checked[key]}
            onChange={() => toggleItem(key)}
          />

          <span>{item.name}</span>
          <small>
            {formatQty(item.qty)} {item.unit}
          </small>
        </label>

        {renderGroceryReference(item)}
      </div>
    );
  }

  function renderPantryItem(item) {
    const key = `${item.name}-${item.unit}-${item.aisle}-pantry`;

    return (
      <div key={key} className="shoppingItemWrap">
        <div className="shoppingItem pantryShoppingItem">
          <span className="pantryFilledBox" aria-hidden="true" />
          <span>{item.name}</span>
          <small>
            {formatQty(item.qty)} {item.unit}
          </small>
        </div>

        {renderGroceryReference(item)}
      </div>
    );
  }

  return (
    <main className="pageShell">
      <div className="pageHeader">
        <div>
          <div className="aiBadge">SMART SHOPPING LIST</div>
          <h1>Shopping list</h1>
          <p>
            Needed items stay open for shopping. Pantry staples you already have
            are shown separately.
          </p>
        </div>

        <div className="pageHeaderActions">
          <button className="primary" onClick={printShoppingList}>
            Print List
          </button>
          <button
            className="secondary"
            onClick={() => setActivePage("Grocery Picks")}
          >
            Grocery Picks
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState
          title="Your shopping list is empty"
          text="Add recipes to your weekly planner to generate a grocery list."
        />
      ) : (
        <div className="shoppingListSections">
          <section className="shoppingListSection">
            <div className="shoppingListSectionHeader">
              <div>
                <h2>NEEDED ITEMS</h2>
                <p>Open boxes are items to buy.</p>
              </div>
              <strong>{needed.length} items</strong>
            </div>

            {needed.length === 0 ? (
              <div className="emptyState compactEmpty">
                <h2>No needed items</h2>
                <p>Everything on this list is currently marked as in your pantry.</p>
              </div>
            ) : (
              <div className="shoppingGrid">
                {Object.entries(groupedNeeded).map(([aisle, items]) => (
                  <section className="shoppingGroup" key={aisle}>
                    <h2>{aisle}</h2>
                    {items.map(renderNeededItem)}
                  </section>
                ))}
              </div>
            )}
          </section>

          <section className="shoppingListSection pantryListSection">
            <div className="shoppingListSectionHeader">
              <div>
                <h2>ALREADY IN PANTRY</h2>
                <p>Filled black boxes are already in your pantry.</p>
              </div>
              <div className="pantryHeaderActions">
                <strong>{pantryItems.length} items</strong>
                <button className="secondary smallSecondary" onClick={() => setActivePage("Pantry Staples")}>
                  Edit Pantry Staples
                </button>
                <button className="secondary smallSecondary" onClick={() => setActivePage("Kitchen Refrigerator")}>
                  Edit Refrigerator
                </button>
              </div>
            </div>

            {pantryItems.length === 0 ? (
              <div className="emptyState compactEmpty">
                <h2>No pantry matches yet</h2>
                <p>
                  Check items on the Pantry Staples page to move matching shopping
                  list items here.
                </p>
              </div>
            ) : (
              <div className="shoppingGrid">
                {Object.entries(groupedPantry).map(([aisle, items]) => (
                  <section className="shoppingGroup" key={aisle}>
                    <h2>{aisle}</h2>
                    {items.map(renderPantryItem)}
                  </section>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

function FavoritesPage({
  favorites,
  toggleFavorite,
  addToPlan,
  openRecipeCard,
}) {
  const safeFavorites = Array.isArray(favorites) ? favorites : [];
  const saved = recipes.filter((r) => safeFavorites.includes(r.id));

  return (
    <main className="pageShell">
      <div className="pageHeader">
        <div>
          <div className="aiBadge">SAVED IN THIS BROWSER</div>
          <h1>Favorites</h1>
          <p>Recipes you saved on this device. No login or sync required.</p>
        </div>
      </div>

      {saved.length === 0 ? (
        <EmptyState
          title="No favorites yet"
          text="Tap the heart on any recipe card to save it here."
        />
      ) : (
        <div className="recipeGrid">
          {saved.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              addToPlan={addToPlan}
              openRecipeCard={openRecipeCard}
              cardList={saved}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function CollectionsPage({ setActivePage }) {
  return (
    <>
      <PageHeroImage
        src="images/heroes/hero-page-collections.png"
        alt="Curated recipe collections with recipe cards, meal ideas, and planning notes"
        eyebrow="COLLECTIONS"
        title="Collections"
        text="Browse curated groups of recipes organized around cooking methods, seasons, meal styles, and practical needs. Choose a collection when you want inspiration without searching the entire recipe library."
        className="pageHeroDepth464"
      />
      <main className="pageShell">
      <div className="pageHeader">
        <div>
          <div className="aiBadge">CURATED BY AI</div>
          <h1>Collections</h1>
          <p>
            AI-generated collections designed for real-life planning, shopping,
            and cost estimating.
          </p>
        </div>
      </div>

      <CollectionStrip setActivePage={setActivePage} />
      <FeatureStrip />
    </main>
    </>
  );
}



function getProductAffiliateUrl(product) {
  return product.affiliateUrl || "https://www.amazon.com/";
}

function ProductsIUsePage({ setActivePage }) {
  return (
    <main className="pageShell productsIUsePage">
      <section className="aboutRecipesHero productsIUseHero">
        <div>
          <div className="aiBadge">TOOLS & PRODUCTS</div>
          <h1>Products I Recommend</h1>
          <p>
            A simple reference page for the containers, pans, jars, storage
            tools, and kitchen products I like to keep in mind for recipe cards,
            planned leftovers, freezer meals, and small-household cooking.
          </p>
        </div>
      </section>

      <div className="productsIUsePageGrid">
        {PRODUCTS_I_USE.map((product) => (
          <article className="productsIUsePageCard" key={product.title}>
            <a
              className="productsIUseAmazonCorner"
              href={getProductAffiliateUrl(product)}
              target="_blank"
              rel="noopener noreferrer"
              
              aria-label={`View ${product.title} on Amazon`}
              title="View on Amazon"
            >
              <img
                className="productsIUseAmazonIcon"
                src={`${import.meta.env.BASE_URL}images/ui/amazon-smile.png`}
                alt=""
                loading="lazy"
                decoding="async"
              />
            </a>
            <div className="productsIUsePageImage">
              <img
                src={`${import.meta.env.BASE_URL}${product.image}`}
                alt={product.title}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="productsIUsePageContent">
              <h2>{product.title}</h2>
              <p>{product.note}</p>
              <p className="productsIUseProductInfo">Product information and Amazon listing are available through the link in the upper-right corner.</p>
            </div>
          </article>
        ))}
      </div>

      <div className="aboutRecipesActions productsIUseActions">
        <button className="primary" onClick={() => setActivePage("Home")}>
          Return Home
        </button>
        <button className="secondary" onClick={() => setActivePage("Recipes")}>
          Browse Our Recipe Library
        </button>
        <button className="secondary" onClick={() => setActivePage("Recommendations")}>
          Recommendations
        </button>
      </div>
    </main>
  );
}

function RecommendationsPage({ setActivePage }) {
  const recommendationCards = [
    {
      title: "Products I Recommend",
      text: "Helpful kitchen gadgets, small appliances, and practical tools for easier everyday cooking.",
      icon: "▣",
      note: "Future home for affiliate-friendly product recommendations.",
    },
    {
      title: "Helpful Videos & Channels",
      text: "Cooking, freezer meal, meal-prep, and kitchen how-to videos worth saving.",
      icon: "▶",
      note: "Great for visual learners and step-by-step cooking help.",
    },
    {
      title: "Storage & Organization",
      text: "Food storage, pantry setup, freezer containers, labels, and kitchen organizers.",
      icon: "□",
      note: "Supports leftovers, freezer meals, and small-household planning.",
    },
    {
      title: "Freezer Meals & Storage",
      text: "Tips, supplies, labels, and containers for saving a second prepared meal for later.",
      icon: "❄",
      note: "Cook once, eat once, freeze once.",
      page: "Freezer Tips",
    },
    {
      title: "Social Pages I Follow",
      text: "YouTube, Instagram, Facebook, and TikTok pages that share helpful food and kitchen ideas.",
      icon: "◎",
      note: "A curated place for outside resources and inspiration.",
    },
  ];

  return (
    <main className="pageShell recommendationsPage">
      <div className="pageHeader">
        <div>
          <div className="aiBadge">HELPFUL RESOURCES</div>
          <h1>Recommendations</h1>
          <p>
            A curated resource hub for kitchen tools, storage ideas, helpful
            videos, and social pages that support simple cooking for seniors,
            couples, and small households.
          </p>
        </div>
      </div>

      <div className="recommendationsGrid">
        {recommendationCards.map((card) => (
          <article className="recommendationTile" key={card.title}>
            <div className="recommendationIcon">{card.icon}</div>
            <h2>{card.title}</h2>
            <p>{card.text}</p>
            <small>{card.note}</small>
            <button type="button" onClick={() => card.page ? setActivePage(card.page) : undefined}>{card.page ? "Review tips" : "Coming soon"}</button>
          </article>
        ))}
      </div>

    </main>
  );
}



function GroceryPicksPage({ setActivePage }) {
  return (
    <main className="pageShell groceryPicksPage">
      <div className="pageHeader">
        <div>
          <div className="aiBadge">SMART GROCERY REFERENCE</div>
          <h1>Smart Grocery Picks</h1>
          <p>
            A reference list for lighter, lower-carb, freezer-friendly, and
            small-household grocery choices. Use it before shopping, or when a
            shopping-list item shows a suggested swap.
          </p>
        </div>

        <div className="pageHeaderActions">
          <button className="secondary" onClick={() => setActivePage("Shopping Lists")}>
            Back to Shopping List
          </button>
        </div>
      </div>

      <section className="groceryPicksIntro">
        <h2>How to use this list</h2>
        <p>
          These are not price estimates. They are product types and examples to
          review so the user can choose items that better fit a lower-calorie,
          lower-carb, or easier meal-prep lifestyle.
        </p>
      </section>

      <div className="groceryReferenceGrid">
        {GROCERY_REFERENCE_GROUPS.map((group) => (
          <section className="groceryReferenceGroup" key={group.group}>
            <div className="groceryReferenceGroupHeader">
              <h2>{group.group}</h2>
              <p>{group.intro}</p>
            </div>

            <div className="groceryReferenceItems">
              {group.items.map((item) => (
                <article className="groceryReferenceItem" key={item.name}>
                  <h3>{item.name}</h3>
                  <span>{item.useFor}</span>
                  <p>{item.note}</p>
                  <div>
                    {item.examples.map((example) => (
                      <small key={example}>{example}</small>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}


function FreezerTipsPage({ setActivePage }) {
  const tipCards = [
    {
      title: "Cool before freezing",
      text: "Let hot foods cool before sealing. This helps prevent steam, ice crystals, and soggy reheats.",
    },
    {
      title: "Portion for two",
      text: "Pack the extra meal as a two-serving portion so it is ready for another weeknight dinner.",
    },
    {
      title: "Freeze flat when possible",
      text: "Soups, sauces, shredded meats, and rice bowls stack better when frozen flat in freezer bags.",
    },
    {
      title: "Label every package",
      text: "Write the recipe name, date, serving count, and simple reheating note before freezing.",
    },
  ];

  const supplyCards = [
    "Freezer bags",
    "Vacuum seal bags",
    "Meal-prep containers",
    "Foil pans with lids",
    "Freezer-safe labels",
    "Painter’s tape & marker",
    "Silicone trays for sauces",
    "Freezer bins for rotation",
  ];

  return (
    <main className="pageShell freezerPage">
      <div className="pageHeader freezerHeader">
        <div>
          <div className="aiBadge">COOK ONCE · EAT ONCE · FREEZE ONCE</div>
          <h1>Freezer Meals & Storage</h1>
          <p>
            Many Robert’s Recipe Box meals are intentionally planned for small
            households with enough food for dinner now and a second prepared
            meal to freeze for later.
          </p>
        </div>

        <div className="freezerHeaderActions">
          <button className="primary" onClick={() => setActivePage("Meal Planner")}>
            Start Meal Planning
          </button>
          <button className="secondary" onClick={() => setActivePage("Shopping Lists")}>
            View Shopping List
          </button>
        </div>
      </div>

      <section className="freezerIntroCard">
        <h2>The freezer-meal method</h2>
        <ol>
          <li>Cook the recipe and enjoy tonight’s meal.</li>
          <li>Cool the extra portion safely.</li>
          <li>Pack it as a two-serving freezer meal.</li>
          <li>Label it with name, date, and reheating notes.</li>
          <li>Add it to a future meal plan when you need an easy dinner.</li>
        </ol>
      </section>

      <section className="freezerSectionGrid">
        <div className="freezerPanel">
          <h2>Freezing Tips & Tricks</h2>
          <div className="freezerTipGrid">
            {tipCards.map((tip) => (
              <article className="freezerTipCard" key={tip.title}>
                <h3>{tip.title}</h3>
                <p>{tip.text}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="freezerPanel">
          <h2>Best Foods to Freeze</h2>
          <ul className="freezerList">
            <li>Casseroles and bakes</li>
            <li>Soups, chili, and stews</li>
            <li>Meatballs and cooked shredded meats</li>
            <li>Pasta sauces and Italian meals</li>
            <li>Rice bowls without fresh toppings</li>
            <li>Cooked breads, rolls, and kolaches</li>
          </ul>
        </div>

        <div className="freezerPanel cautionPanel">
          <h2>Foods to Freeze Carefully</h2>
          <ul className="freezerList">
            <li>Lettuce salads and fresh toppings</li>
            <li>Mayonnaise-based salads</li>
            <li>Fried foods that may soften</li>
            <li>Cream sauces that need gentle reheating</li>
            <li>Raw tomatoes or watery vegetables</li>
          </ul>
        </div>
      </section>

      <section className="freezerSuppliesPanel">
        <div className="sectionTitle freezerSuppliesTitle">
          <h2>Freezer Supplies to Review</h2>
          <button onClick={() => setActivePage("Recommendations")}>Back to Recommendations ›</button>
        </div>
        <div className="freezerSupplyGrid">
          {supplyCards.map((supply) => (
            <div className="freezerSupplyCard" key={supply}>{supply}</div>
          ))}
        </div>
      </section>
    </main>
  );
}


function HowToUsePage({ setActivePage }) {
  return (
    <main className="pageShell aboutRecipesPage howToUsePage">
      <section className="aboutRecipesHero">
        <div>
          <div className="aiBadge">HOW TO USE THE SITE</div>
          <h1>How to Use Robert’s Recipe Box</h1>
          <p>
            Robert’s Recipe Box is a free recipe-planning website created for
            seniors, couples, empty nesters, and smaller households who want
            practical meals without expensive meal-delivery subscriptions,
            oversized recipes, or hours of daily cooking.
          </p>
        </div>
      </section>

      <div className="aboutRecipesGrid howToUseGrid">
        <article className="aboutRecipesCard aboutRecipesWideCard">
          <h2>What the site helps you do</h2>
          <p>The site is designed to help you:</p>
          <ul className="aboutCardList">
            <li>Find recipes that fit your tastes and schedule</li>
            <li>Prepare reasonable portions for one or two people</li>
            <li>Plan for useful leftovers</li>
            <li>Freeze extra servings for another day</li>
            <li>Build weekly meal plans</li>
            <li>Create organized grocery lists</li>
            <li>Estimate grocery costs</li>
            <li>Find practical ingredient substitutions</li>
            <li>Make recipes lower in calories, lower in carbohydrates, more budget-friendly, or easier to freeze</li>
          </ul>
          <p>
            The original recipe is always available. Optional suggestions allow
            you to adjust it to better fit your household, dietary goals, budget,
            or cooking routine.
          </p>
        </article>

        <article className="aboutRecipesCard">
          <h2>1. Browse by category</h2>
          <p>
            Start by selecting a recipe category from the home page. Categories
            include American, Asian, Casseroles, Cheesecakes, Cinnamon Rolls,
            Cobblers, Desserts, Donuts, Hamburgers, Italian, Jams & Jellies,
            Kolaches, Loafs & Rolls, Mexican, Protein Muffins, Quiche & Pies,
            Salads & Bowls, Sandwiches, Seafood, Side Dishes, and Smoked or
            Grilled Foods.
          </p>
          <p>
            Selecting a category opens the recipes available in that collection.
          </p>
        </article>

        <article className="aboutRecipesCard">
          <h2>2. Flip through recipe cards</h2>
          <p>
            Use the recipe-card viewer to move forward or backward through the
            collection. Each recipe card is designed to provide the most
            important information in one easy-to-read place.
          </p>
          <ul className="aboutCardList">
            <li>Recipe name</li>
            <li>Ingredients</li>
            <li>Directions</li>
            <li>Number of servings</li>
            <li>Estimated nutrition information</li>
            <li>Helpful preparation or serving notes</li>
          </ul>
        </article>

        <article className="aboutRecipesCard">
          <h2>3. Open the full recipe</h2>
          <p>
            Select a recipe card to view the full recipe page. The full page may
            include detailed preparation instructions, substitutions,
            lower-calorie options, lower-carbohydrate options, budget-friendly
            alternatives, side-dish suggestions, freezer guidance, and product
            recommendations.
          </p>
        </article>

        <article className="aboutRecipesCard">
          <h2>4. Adjust for your household</h2>
          <p>
            Many recipes can be prepared as written, divided into smaller
            portions, or doubled for planned leftovers. For a two-person
            household, a four-serving recipe can often provide dinner for two
            tonight and a second meal for later in the week.
          </p>
          <p>
            You may also freeze the extra two servings for a future meal.
          </p>
        </article>

        <article className="aboutRecipesCard">
          <h2>5. Use optional recipe picks</h2>
          <p>Throughout the site, you may see helpful recommendations such as:</p>
          <ul className="aboutCardList">
            <li><strong>Robert’s Lower-Carb Pick:</strong> a practical ingredient replacement that reduces carbohydrates.</li>
            <li><strong>Robert’s Lower-Calorie Pick:</strong> a lighter ingredient or preparation method.</li>
            <li><strong>Best for Two-Person Meals:</strong> a recipe or product that divides easily into smaller portions.</li>
            <li><strong>Best Freezer-Friendly Product:</strong> an ingredient or storage option for meals prepared in advance.</li>
            <li><strong>Best Budget Substitution:</strong> a lower-cost alternative.</li>
            <li><strong>Use Half-and-Half Swap:</strong> half original ingredient and half lighter alternative.</li>
          </ul>
          <p>These are optional suggestions. Choose the version that works best for you.</p>
        </article>

        <article className="aboutRecipesCard">
          <h2>6. Build a weekly meal plan</h2>
          <p>A practical weekly plan might include:</p>
          <ul className="aboutCardList">
            <li>Two freshly prepared meals</li>
            <li>Two planned-leftover meals</li>
            <li>One freezer meal</li>
            <li>One simple sandwich, salad, or soup night</li>
            <li>One flexible night for dining out or using remaining ingredients</li>
          </ul>
          <p>
            Planning meals before shopping can help reduce duplicate purchases
            and unused food.
          </p>
        </article>

        <article className="aboutRecipesCard">
          <h2>7. Create a grocery list</h2>
          <p>
            After selecting your meals, combine the required ingredients into one
            shopping list. Before shopping, check what you already have, remove
            duplicate items, combine repeated ingredients, note quantities, and
            separate the list by grocery-store section.
          </p>
          <p>
            Common sections include produce, meat and seafood, dairy, frozen
            foods, canned goods, pantry items, bakery, and household supplies.
          </p>
        </article>

        <article className="aboutRecipesCard">
          <h2>8. Compare costs and substitute</h2>
          <p>
            Use estimated prices as a planning guide, but compare them with your
            local grocery store. You can often reduce the weekly grocery bill by
            buying store brands, choosing frozen vegetables, dividing family-size
            meat packages, using planned leftovers, substituting pantry items,
            choosing recipes with shared ingredients, and freezing food before it
            spoils.
          </p>
        </article>

        <article className="aboutRecipesCard">
          <h2>9. Save or print recipes</h2>
          <p>
            Recipes may be saved, printed, or added to your personal recipe
            collection depending on available site features. Printed cards are
            useful for cooking without keeping a phone or tablet near the stove.
          </p>
          <p>
            When printing, review the printer preview and select the recommended
            card size or page layout.
          </p>
        </article>

        <article className="aboutRecipesCard">
          <h2>10. Use freezer and storage instructions</h2>
          <p>
            Allow cooked food to cool before placing it in the refrigerator or
            freezer. Label stored meals with the recipe name, date prepared,
            number of servings, and reheating instructions.
          </p>
          <p>
            Freeze individual or two-person portions whenever possible. Smaller
            packages thaw faster and reduce waste.
          </p>
        </article>

        <article className="aboutRecipesCard">
          <h2>A simple way to get started</h2>
          <ol className="aboutNumberedList">
            <li>Choose three main dishes.</li>
            <li>Select two or three side dishes.</li>
            <li>Plan which meals will provide leftovers.</li>
            <li>Choose one meal to freeze.</li>
            <li>Create one combined shopping list.</li>
            <li>Check your pantry before shopping.</li>
            <li>Prepare ingredients in advance when practical.</li>
          </ol>
          <p>
            Begin with a few recipes and add meal planning, grocery lists,
            substitutions, and freezer meals as you become familiar with the site.
          </p>
        </article>

        <article className="aboutRecipesCard">
          <h2>Important information</h2>
          <p>
            Nutrition values, grocery prices, serving sizes, and cooking times
            are estimates and may vary depending on ingredients, brands,
            equipment, and portion sizes.
          </p>
          <p>
            Recipe suggestions are provided for general informational purposes.
            Anyone with food allergies, dietary restrictions, swallowing
            concerns, kidney disease, diabetes, heart conditions, or other
            medical needs should follow the guidance of their physician or
            registered dietitian.
          </p>
          <p>
            Always verify that meat, poultry, seafood, eggs, and reheated foods
            reach a safe internal temperature.
          </p>
        </article>

        <article className="aboutRecipesCard aboutQuoteCard">
          <h2>Our goal</h2>
          <p>
            <strong>
              The goal of Robert’s Recipe Box is not to make cooking complicated.
              It is to help you prepare enjoyable meals, shop more efficiently,
              reduce waste, save money, spend less time in the kitchen, and keep
              a few good meals ready for the days when you do not feel like
              cooking.
            </strong>
          </p>
        </article>
      </div>

      <div className="aboutRecipesActions">
        <button className="primary" onClick={() => setActivePage("Recipes")}>
          Browse Our Recipe Library
        </button>
        <button className="secondary" onClick={() => setActivePage("Meal Planner")}>
          Start Meal Planning
        </button>
        <button className="secondary" onClick={() => setActivePage("Shopping Lists")}>
          View Grocery List
        </button>
      </div>
    </main>
  );
}


function AboutRecipesPage({ setActivePage }) {
  return (
    <main className="pageShell aboutRecipesPage">
      <section className="aboutRecipesHero">
        <div>
          <div className="aiBadge">ABOUT OUR RECIPES</div>
          <h1>About Our Recipes</h1>
          <p>
            Robert’s Recipe Box is built around practical meals, familiar foods,
            AI-assisted recipe development under my direction, recipe-card
            simplicity, and planned leftovers for smaller households.
          </p>
        </div>
      </section>

      <div className="aboutRecipesGrid">
        <article className="aboutRecipesCard">
          <h2>AI-assisted, directed by me</h2>
          <p>
            The recipes are generated with the assistance of artificial
            intelligence, but they are guided by my choices for the meal idea,
            flavors, servings, cooking method, practical goals, and recipe-card
            format.
          </p>
        </article>

        <article className="aboutRecipesCard">
          <h2>Practical recipe cards</h2>
          <p>
            The recipes are designed to be easy to browse, easy to organize, and
            easy to reference while cooking. The goal is not to scroll through a
            long article just to find the ingredients or directions.
          </p>
        </article>

        <article className="aboutRecipesCard">
          <h2>Built for smaller households</h2>
          <p>
            Many recipes are planned around four servings. For a two-person
            household, that can mean dinner today and another prepared meal for
            lunch, another dinner, or the freezer.
          </p>
        </article>

        <article className="aboutRecipesCard">
          <h2>Copycat and familiar meals</h2>
          <p>
            Some recipes are inspired by restaurant-style, fast-food, family-style,
            or grocery-store favorites. They are homemade interpretations, not
            official restaurant formulas or copied company recipes.
          </p>
        </article>

        <article className="aboutRecipesCard">
          <h2>Adjustable choices</h2>
          <p>
            Recipes may include lower-calorie, lower-carb, lower-sodium,
            higher-protein, freezer-friendly, or budget-friendly ideas. The
            original recipe remains available, while the suggestions help users
            adapt meals to their own needs.
          </p>
        </article>

        <article className="aboutRecipesCard">
          <h2>Freezer-friendly planning</h2>
          <p>
            The site encourages a cook-once, eat-once, freeze-once approach when
            practical. Extra portions can become prepared meals for days when
            cooking from scratch is not realistic.
          </p>
        </article>

        <article className="aboutRecipesCard">
          <h2>Shopping and pantry support</h2>
          <p>
            Meal planning, pantry staples, grocery-list ideas, and smart grocery
            picks are included to make the recipes more useful beyond the recipe
            card itself.
          </p>
        </article>

        <article className="aboutRecipesCard">
          <h2>Review before cooking</h2>
          <p>
            Artificial intelligence is useful, but it can make mistakes. Read the
            complete recipe before beginning, use reasonable cooking judgment,
            check temperatures when needed, and adjust seasonings, timing, and
            ingredients for your kitchen.
          </p>
        </article>

        <article className="aboutRecipesCard aboutQuoteCard">
          <h2>Make it your own</h2>
          <p>
            <strong>
              The best version of any recipe is the one that works for your
              tastes, your budget, your equipment, and the people at your table.
            </strong>
          </p>
        </article>
      </div>

      <div className="aboutRecipesActions">
        <button className="primary" onClick={() => setActivePage("Recipes")}>
          Browse Our Recipe Library
        </button>
        <button className="secondary" onClick={() => setActivePage("Meal Planner")}>
          Start Meal Planning
        </button>
        <button className="secondary" onClick={() => setActivePage("How To Use")}>
          How to Use This Site
        </button>
      </div>
    </main>
  );
}



function AboutPage({ setActivePage }) {
  return (
    <main className="pageShell aboutLetterPage aboutUnifiedPage">
      <article className="aboutLetterArticle">
        <section className="aboutLetterIntro aboutLetterIntroNoHeadline">
          <p>
            Welcome to my free recipe-card and meal-planning site. I use it every
            week for my own meal planning, and I designed it especially for
            seniors, couples, empty nesters, and smaller households who want
            practical meals, useful leftovers, freezer-friendly ideas, and
            organized grocery lists.
          </p>
        </section>

        <section className="aboutLetterSection">
          <h2>Why I started this site</h2>
          <p>
            Robert’s Recipe Box started after my wife and I tried a few
            subscription meal plans. I liked the basic idea: choose a meal,
            receive the ingredients, and follow clear instructions. The problem
            was that we did not always like the meals being offered.
          </p>
          <p>
            I found myself wishing I could use that same organized approach while
            cooking the foods we actually enjoy. At the same time, the cost of
            eating out kept rising. Even fast food, which once felt inexpensive
            and convenient, was becoming surprisingly expensive.
          </p>
        </section>

        <blockquote className="aboutLetterQuoteBreak">
          Built around real home cooking, practical planning, and everyday meals.
        </blockquote>

        <section className="aboutLetterSection">
          <h2>What I wanted to build</h2>
          <p>
            I wanted a place where recipes could be organized like useful recipe
            cards, not buried inside long articles. I wanted meals that could be
            planned ahead, printed, saved, adjusted, and reused in a practical
            way.
          </p>
          <p>
            The goal is simple: help people plan what to cook, keep track of what
            they like, make better grocery lists, use leftovers wisely, and freeze
            extra portions for another day. For a smaller household, one recipe
            can often become dinner today and another prepared meal for later.
          </p>
        </section>

        <section className="aboutLetterSection">
          <h2>Who this site is for</h2>
          <p>
            This site is especially useful for seniors, older couples, empty
            nesters, and smaller households. Many traditional recipes make more
            food than two people need, while cooking a completely different meal
            every night can take too much planning, shopping, preparation, and
            cleanup.
          </p>
          <p>
            Robert’s Recipe Box is meant to offer another option. It is designed
            for practical home cooking: familiar meals, realistic portions,
            organized grocery lists, useful leftovers, freezer-friendly thinking,
            and simple ways to save money where possible.
          </p>
        </section>

        <blockquote className="aboutLetterQuoteBreak aboutLetterQuoteBreakRight">
          A personal project, built one practical idea at a time.
        </blockquote>

        <section className="aboutLetterSection">
          <h2>How the recipes are created</h2>
          <p>
            I use AI assistance to generate recipe ideas and recipe-card content,
            but the direction comes from me. I choose the meal idea, cooking
            method, serving goal, flavor direction, practical needs, and how I
            want the recipe to fit into the site.
          </p>
          <p>
            The recipes are not copied from other websites, restaurants, brands,
            or cookbooks. They are created as practical, AI-assisted recipe-card
            ideas under my direction. Some may be inspired by familiar foods,
            restaurant-style meals, or common home-cooking favorites, but the goal
            is always to make something useful for this site.
          </p>
        </section>

        <section className="aboutLetterSection">
          <h2>What I hope this becomes</h2>
          <p>
            My hope is that Robert’s Recipe Box becomes a simple, useful place to
            plan meals, browse ideas, save favorites, print recipe cards, build
            grocery lists, and think ahead about leftovers and freezer meals.
          </p>
          <p>
            It is not meant to be fancy. It is meant to be practical. If it helps
            someone cook at home more often, waste less food, save a little money,
            or feel more organized in the kitchen, then it is doing what I hoped
            it would do.
          </p>
        </section>

        <section className="aboutLetterClosing">
          <p>
            Thank you for visiting Robert’s Recipe Box. I hope you find something
            here that makes planning, cooking, shopping, and saving meals a little
            easier.
          </p>
          <p className="aboutLetterSignature">
            Robert
          </p>
        </section>
      </article>
    </main>
  );
}


function AboutSmokingPage({ setActivePage }) {
  return (
    <main className="pageShell aboutRecipesPage aboutSmokingUnifiedPage">
      <section className="aboutRecipesHero">
        <div>
          <div className="aiBadge">TIPS & TECHNIQUES</div>
          <h1>Smoking Your Own Meats</h1>
          <p>
            I got started smoking meat after buying a Pit Boss pellet grill and
            learning how practical smoked and grilled foods can be for cook-once,
            eat-twice meals.
          </p>
        </div>
      </section>

      <div className="aboutRecipesGrid">
        <article className="aboutRecipesCard">
          <h2>How I got started</h2>
          <p>
            I am not a professional pitmaster. I started with the basics,
            followed proven methods, paid attention to temperatures, and learned
            from each cook.
          </p>
        </article>

        <article className="aboutRecipesCard">
          <h2>Why it works</h2>
          <p>
            Smoked meats can be portioned, refrigerated, frozen, and reused later
            for sandwiches, bowls, tacos, salads, baked potatoes, or quick
            weeknight dinners.
          </p>
        </article>

        <article className="aboutRecipesCard">
          <h2>Still learning</h2>
          <p>
            The goal is not competition barbecue. The goal is practical,
            flavorful food that home cooks can learn and use.
          </p>
        </article>
      </div>

      <div className="aboutRecipesActions">
        <button className="primary" onClick={() => setActivePage("Recipes")}>
          Browse Our Recipe Library
        </button>
        <button className="secondary" onClick={() => setActivePage("About")}>
          Our Mission
        </button>
      </div>
    </main>
  );
}


function UnderConstructionPage({ setActivePage }) {
  return (
    <main className="pageShell underConstructionPage">
      <section className="aboutRecipesHero underConstructionHero">
        <div>
          <div className="aiBadge">PAGE IN DEVELOPMENT</div>
          <h1>Under Construction</h1>
          <p>
            This section of Robert’s Recipe Box is still being prepared. Please
            check back soon as new information and features are added.
          </p>
        </div>
      </section>

      <div className="aboutRecipesActions underConstructionActions">
        <button className="primary" onClick={() => setActivePage("Home")}>
          Return Home
        </button>
        <button className="secondary" onClick={() => setActivePage("Recipes")}>
          Browse Our Recipe Library
        </button>
      </div>
    </main>
  );
}

function PlaceholderInfoPage({ eyebrow, title, text, setActivePage }) {
  return (
    <main className="pageShell aboutRecipesPage placeholderInfoPage">
      <section className="aboutRecipesHero">
        <div>
          <div className="aiBadge">{eyebrow}</div>
          <h1>{title}</h1>
          <p>{text}</p>
        </div>
      </section>

      <div className="aboutRecipesActions">
        <button className="primary" onClick={() => setActivePage("Recipes")}>
          Browse Our Recipe Library
        </button>
        <button className="secondary" onClick={() => setActivePage("How To Use")}>
          How to Use This Site
        </button>
      </div>
    </main>
  );
}



function getPageHelpSteps(pageTitle = "", pageEyebrow = "") {
  const normalizedTitle = String(pageTitle).trim();
  const normalizedEyebrow = String(pageEyebrow).trim();

  const suppliedPageNotes = {
    "Welcome to Our Site": [
      "Read the welcome message to learn why Robert’s Recipe Box was created and who it is designed to help.",
      "Review the story behind the site and its focus on practical meals, smaller households, useful leftovers, and freezer planning.",
      "Use the page links and main menu to continue to recipes, planning tools, cooking tips, or other helpful sections.",
      "Return here whenever you want a reminder of the purpose and approach behind Robert’s Recipe Box.",
    ],
    "About Our Recipes": [
      "Read this page to understand how the recipes are created, organized, reviewed, and presented.",
      "Learn how AI assistance is used under Robert’s direction to develop practical recipe ideas and recipe cards.",
      "Review the information about serving sizes, planned leftovers, freezer meals, substitutions, and smaller-household cooking.",
      "Always read a complete recipe before cooking and adjust ingredients, timing, and temperatures using reasonable cooking judgment.",
    ],
    "Affiliate Marketing": [
      "Read this page to understand how affiliate links may help support Robert’s Recipe Box.",
      "Product recommendations are optional and are not required to use the recipes, planning tools, or other website features.",
      "Select a product link to review its current price, size, features, availability, seller, and return information.",
      "Compare products carefully before purchasing because listings, prices, and product details may change.",
    ],
    "Submit Your Family Recipes": [
      "Use this page to suggest a family recipe, favorite meal, cooking idea, or practical kitchen tip for consideration.",
      "Include the recipe name, ingredients, directions, serving size, and any helpful family history or preparation notes.",
      "Review your information before submitting it so measurements, temperatures, and cooking steps are as clear as possible.",
      "Submitted recipes may be edited, reorganized, tested, or adapted to fit the website’s recipe-card format.",
    ],
    "Contact Me": [
      "Use this page to send recipe questions, corrections, website feedback, or general comments.",
      "Include the recipe name, card number, page title, or menu section whenever possible.",
      "Describe the question or problem clearly and include only the information needed for a response.",
      "Do not submit passwords, financial details, medical records, or other sensitive personal information.",
    ],
    "Disclaimers": [
      "Select the policy or disclaimer topic that relates to the information you need.",
      "Read the plain-language explanation first, then review the complete details when necessary.",
      "Pay particular attention to notices about AI-generated recipes, nutrition estimates, food safety, affiliate links, privacy, and copyright.",
      "Revisit this page periodically because website features, policies, and outside services may change.",
    ],
    "Browse Our Recipe Library": [
      "Use the search box to look for a recipe name, ingredient, cuisine, cooking method, or meal idea.",
      "Use the category, cooking-method, dietary, and sorting controls to narrow the recipe list.",
      "Select a recipe card to open the complete card, review additional options, print it, or download it.",
      "Save recipes with the heart button or add them to your meal planner for future use.",
    ],
    "Dinner Combinations": [
      "Browse complete meal ideas that combine a main dish with recommended side dishes.",
      "Use the search and filter controls to narrow the list by main dish, protein, side, or meal style.",
      "Select the linked recipe buttons to open the recipe cards used in each dinner combination.",
      "Use these meals as flexible starting points and substitute dishes based on your tastes, ingredients, and schedule.",
    ],
    "Quick & Easy Freezer Meals": [
      "Browse recipes that are especially useful for preparing now and serving later.",
      "Check whether each meal should be frozen before cooking, after cooking, or as separate meal components.",
      "Package meals in practical portions and label them with the recipe name, date, servings, and finishing instructions.",
      "Follow safe cooling, freezing, thawing, cooking, and reheating practices for every meal.",
    ],
    "Collections": [
      "Use this page to see all featured recipe collections in one convenient location.",
      "Select the collection that best matches your schedule, cooking method, meal style, or current needs.",
      "Open a collection to view its recommended recipes and meal ideas.",
      "Return here whenever you want inspiration without searching the entire recipe library.",
    ],
    "Slow Cooker Favorites": [
      "Browse meals designed for slow, mostly hands-off cooking in a Crockpot or slow cooker.",
      "Read the complete recipe before beginning and confirm the required cooker size, setting, and cooking time.",
      "Avoid lifting the lid unnecessarily because heat loss can increase the cooking time.",
      "Check meat and poultry for safe doneness rather than relying only on the estimated cooking time.",
    ],
    "Summer Cookouts": [
      "Browse meal ideas suited to grilling, smoking, picnics, and outdoor gatherings.",
      "Review the suggested entrées, sides, salads, breads, and desserts when planning a complete cookout menu.",
      "Plan ahead for preparation time, cooking space, refrigeration, serving temperature, and cleanup.",
      "Keep cold foods cold, hot foods hot, and follow safe outdoor food-handling practices.",
    ],
    "Healthy Dinners": [
      "Browse meals featuring balanced ingredients, vegetables, leaner proteins, or lighter cooking methods.",
      "Review the ingredients, serving size, nutrition estimate, and suggested substitutions before choosing a meal.",
      "Combine entrées with suitable vegetables, salads, grains, or other sides to create a complete dinner.",
      "Adjust recipes according to your personal dietary needs and any professional medical or nutrition guidance.",
    ],
    "Comfort Foods": [
      "Browse familiar casseroles, baked meals, soups, hearty entrées, breads, and traditional favorites.",
      "Check the serving size because many comfort-food recipes are well suited to leftovers or freezer portions.",
      "Pair richer dishes with vegetables, salads, or lighter sides when building a complete meal.",
      "Review each recipe’s storage and reheating notes before saving extra portions.",
    ],
    "Easy 30-Minute Meals": [
      "Browse recipes that can generally be prepared and cooked in about 30 minutes.",
      "Read the complete recipe and gather the ingredients and equipment before starting.",
      "Use thawed, pre-cut, or previously prepared ingredients when recommended to save time.",
      "Allow additional time when changing serving sizes, making substitutions, or trying an unfamiliar technique.",
    ],
    "Salad Jars": [
      "Browse layered salad ideas designed for convenient make-ahead lunches.",
      "Place dressing and heavier wet ingredients near the bottom and delicate greens toward the top.",
      "Leave enough room to shake the jar or transfer the salad into a bowl before eating.",
      "Keep the jars refrigerated and follow the shortest safe storage time for the ingredients included.",
    ],
    "Your Weekly Meal Planner": [
      "Choose a week and day, then add individual recipes or complete dinner combinations to the planner.",
      "Use the category controls to narrow the recipe choices before adding meals.",
      "Review the planned meals, estimated costs, serving information, and recipe links for each day.",
      "Update or clear the planner as your schedule changes, then use the finished plan to create your grocery list.",
    ],
    "Favorites": [
      "Use this page to quickly find recipes you previously saved with the heart button.",
      "Select a favorite to open its recipe card, review its details, or add it to your meal planner.",
      "Select the heart again when you want to remove a recipe from your favorites.",
      "Favorites are stored in the current browser and may not automatically appear on another device.",
    ],
    "Refrigerator Inventory": [
      "Mark the foods currently in your refrigerator and enter quantities, opened dates, use-by dates, and status notes.",
      "Use the category, search, and filter controls to find items that are running low, out, or should be used soon.",
      "Add low-stock items directly to your grocery list before they are forgotten.",
      "Update the inventory regularly and use your own judgment when deciding whether refrigerated food remains safe.",
    ],
    "Freezer Inventory": [
      "Record the foods currently stored in each freezer, including quantities, package sizes, dates, and locations.",
      "Use the search, filter, location, and category controls to find particular items or foods that should be used soon.",
      "Add custom foods and freezer locations when the prepared lists do not match your storage setup.",
      "Print, export, or update the inventory regularly so older foods can be used before newer additions.",
    ],
    "Pantry Inventory": [
      "Choose the minimum, medium, or fully stocked pantry level that best matches your cooking routine.",
      "Check the shelf-stable ingredients and storage supplies you currently keep on hand.",
      "Use the category groups to review spices, sauces, grains, canned goods, baking supplies, and freezer supplies.",
      "Keep the list current so pantry ingredients can be separated from items you still need to purchase.",
    ],
    "Your Grocery List": [
      "Add recipes to the meal planner to automatically build a combined grocery list.",
      "Review the needed items and the ingredients already marked as available in your pantry.",
      "Check off items while shopping and review any suggested grocery alternatives when available.",
      "Print the list before shopping or return to your inventories to correct items that you already have.",
    ],
    "Tips: Air Fryers": [
      "Review the setup, preheating, basket-loading, timing, cleaning, and maintenance guidance before using your air fryer.",
      "Follow the appliance manufacturer’s instructions and leave room for hot air to circulate around the food.",
      "Turn, shake, or rotate food when needed and begin checking near the early end of the cooking range.",
      "Verify safe doneness with a reliable thermometer when cooking meat, poultry, seafood, or reheated foods.",
    ],
    "Tips: Microwave Ovens": [
      "Review the cookware, covering, stirring, standing-time, reheating, cleaning, and safety guidance before using your microwave.",
      "Use microwave-safe containers and avoid metal, foil, and sealed containers unless specifically permitted.",
      "Stir, rotate, and check food in several places because microwaves can create uneven hot and cold spots.",
      "Follow package directions and verify that reheated leftovers reach a safe temperature throughout.",
    ],
    "Gas Grill Recipes": [
      "Review the preparation, preheating, heat-zone, cooking, cleaning, and maintenance guidance before using your grill.",
      "Follow the grill manufacturer’s instructions for fuel connections, startup, shutdown, and safe placement.",
      "Use direct or indirect heat according to the food being cooked and watch carefully for flare-ups.",
      "Check meat and poultry with a reliable thermometer rather than relying only on time or appearance.",
    ],
    "Pellet Smoker Recipes": [
      "Review the startup, cooking, shutdown, cleaning, and pellet-storage guidance before using your smoker.",
      "Use clean, dry, food-grade pellets and follow the smoker manufacturer’s operating instructions.",
      "Allow for changes in cooking time caused by weather, meat size, temperature settings, and smoker performance.",
      "Cook according to safe internal temperature and allow meat to rest when the recipe recommends it.",
    ],
    "Oven Recipes": [
      "Review the oven-care, rack-position, preheating, cookware, and cooking guidance before beginning.",
      "Position the racks before the oven becomes hot and use the temperature recommended by the recipe.",
      "Begin checking food near the early end of the cooking range because ovens and baking dishes vary.",
      "Keep the oven clean, avoid blocking vents, and verify safe doneness with a thermometer when needed.",
    ],
    "Tips: Breadmaking": [
      "Review the guidance for measuring, mixing, kneading, proofing, shaping, baking, cooling, and storing bread.",
      "Confirm whether the recipe is intended for hand mixing, a stand mixer, a bread machine, or a particular pan.",
      "Judge the dough by its appearance and texture because flour, humidity, temperature, and equipment can affect it.",
      "Read the complete recipe before beginning so all resting, rising, baking, and cooling periods fit your schedule.",
    ],
    "Healthy Substitutions": [
      "Browse ingredient and product alternatives that may reduce calories, carbohydrates, sodium, or preparation time.",
      "Review how each substitution may affect flavor, texture, cooking time, and portion size.",
      "Use the suggested brands as examples to compare rather than as required purchases.",
      "Choose substitutions that fit your tastes, budget, dietary needs, and professional medical guidance.",
    ],
    "Food Safety": [
      "Review the guidance for handling, preparing, cooking, cooling, storing, freezing, thawing, and reheating food.",
      "Wash hands and work surfaces and keep raw foods separated from foods that are ready to eat.",
      "Use reliable thermometers and refrigerate perishable food promptly after cooking or serving.",
      "When the safety of food is uncertain, discard it rather than tasting it to decide whether it is safe.",
    ],
    "Reference Guides": [
      "Select a guide from the topic list to open the reference information you need.",
      "Use the internal tabs when available to switch between measurements, temperatures, storage information, substitutions, or other categories.",
      "Scan the tables for quick answers and review the notes below them for additional explanation.",
      "Print useful guides when you want a paper reference that can remain in the kitchen.",
    ],
    "Freezing and Reheating": [
      "Review which foods freeze well, which require special handling, and which are generally better served fresh.",
      "Cool prepared food safely before packaging it in freezer-safe bags, containers, pans, jars, or portion trays.",
      "Label each package with its contents, freezing date, serving quantity, and reheating directions.",
      "Thaw and reheat food safely and confirm that it is hot throughout before serving.",
    ],
    "Products I Recommend": [
      "Browse the pans, containers, jars, appliances, and storage products recommended for recipes and meal preparation.",
      "Select the product link or Amazon symbol to review the current product listing.",
      "Confirm the size, capacity, materials, compatibility, price, seller, and return policy before purchasing.",
      "Product links may be affiliate links, but purchases are never required to use Robert’s Recipe Box.",
    ],
    "Storage and Organization": [
      "Browse practical ideas for organizing pantry items, refrigerated foods, freezer meals, leftovers, containers, and kitchen supplies.",
      "Choose storage methods based on the food, available space, expected storage time, and how the item will be used later.",
      "Label containers clearly and organize older foods where they will be noticed and used first.",
      "Use the recommended products and systems as flexible ideas rather than requirements for using the website.",
    ],
  };

  const suppliedAliases = {
    "About the Recipes": "About Our Recipes",
    "Policies, Disclaimers & Legal Information": "Disclaimers",
    "Boring Disclaimer Stuff": "Disclaimers",
    "Quick & Easy Freezer-Friendly Meals": "Quick & Easy Freezer Meals",
    "Browse All Collections": "Collections",
    "Salad Jar Lunches": "Salad Jars",
    "Meal Planner": "Your Weekly Meal Planner",
    "Favorite Recipes": "Favorites",
    "Kitchen Refrigerator": "Refrigerator Inventory",
    "Kitchen Freezer": "Freezer Inventory",
    "Pantry Staples": "Pantry Inventory",
    "Shopping Lists": "Your Grocery List",
    "Air Fryer Recipes": "Tips: Air Fryers",
    "Microwave Recipes": "Tips: Microwave Ovens",
    "Smoker Recipes": "Pellet Smoker Recipes",
    "Bread Tips": "Tips: Breadmaking",
    "Grocery Picks": "Healthy Substitutions",
    "Safe Cooking Rules": "Food Safety",
    "Freezer Tips": "Freezing and Reheating",
    "Products I Use": "Products I Recommend",
    "Storage Organization": "Storage and Organization",
  };

  const suppliedKey = suppliedAliases[normalizedTitle] || normalizedTitle;
  if (suppliedPageNotes[suppliedKey]) {
    return suppliedPageNotes[suppliedKey].map((text, index) => ({
      label: `Tip ${index + 1}`,
      text,
    }));
  }

  const specificSteps = {
    "Dinner Combinations": [
      {
        label: "Search Meals",
        text: "Use the search box to find a dinner by meal title, main dish, side dish, or ingredient idea.",
      },
      {
        label: "Use Filters",
        text: "Filter the list by protein type, side type, lower-calorie meals, or higher-protein meals to narrow the choices.",
      },
      {
        label: "View Recipes",
        text: "Use the recipe buttons on each card to jump to matching recipe cards for the main dish or sides.",
      },
      {
        label: "Check Nutrition",
        text: "Review the estimated nutrition row to compare calories, protein, carbs, fat, and fiber before planning.",
      },
      {
        label: "Plan Ahead",
        text: "Use the meal combinations as dinner ideas, freezer-meal inspiration, or starting points for your weekly meal plan.",
      },
    ],
    "Reference Guides": [
      {
        label: "Pick a Guide",
        text: "Choose a topic from the guide list to open the matching reference information on the right.",
      },
      {
        label: "Use Tabs",
        text: "Some guides include internal tabs so you can switch between categories such as volume, weight, metric, or butter.",
      },
      {
        label: "Read Tables",
        text: "The main tables are shown first and use the full panel width so measurements and details are easier to scan.",
      },
      {
        label: "Check Notes",
        text: "Tips and notes appear below the main tables so extra guidance is available without crowding the core information.",
      },
      {
        label: "Print Later",
        text: "Use the print option when you want a paper copy for the kitchen. Download and full-page options can be added later.",
      },
    ],
    "Boring Disclaimer Stuff": [
      {
        label: "Open Topics",
        text: "Select any numbered policy topic to expand that section and read the related details.",
      },
      {
        label: "Scan Headings",
        text: "Each topic is organized into numbered sub-sections so you can quickly find the policy area you need.",
      },
      {
        label: "Read Summary",
        text: "The first paragraph gives the practical explanation in plain language before the more formal policy text.",
      },
      {
        label: "Review Details",
        text: "Formal policy language follows each summary when you need the complete explanation.",
      },
      {
        label: "Check Updates",
        text: "Review the effective date and revisit the page when policies, features, affiliate links, or privacy practices change.",
      },
    ],
    "Policies, Disclaimers & Legal Information": [
      {
        label: "Open Topics",
        text: "Select any numbered policy topic to expand that section and read the related details.",
      },
      {
        label: "Scan Headings",
        text: "Each topic is organized into numbered sub-sections so you can quickly find the policy area you need.",
      },
      {
        label: "Read Summary",
        text: "The first paragraph gives the practical explanation in plain language before the more formal policy text.",
      },
      {
        label: "Review Details",
        text: "Formal policy language follows each summary when you need the complete explanation.",
      },
      {
        label: "Check Updates",
        text: "Review the effective date and revisit the page when policies, features, affiliate links, or privacy practices change.",
      },
    ],
    "Browse Our Recipe Library": [
      {
        label: "Search",
        text: "Use search to look for recipe names, ingredients, cooking methods, or meal ideas.",
      },
      {
        label: "Filter",
        text: "Use category and page controls to narrow the recipe library to the kind of food you want.",
      },
      {
        label: "Open Cards",
        text: "Select a recipe card to view the full card, print it, download it, or review the details.",
      },
      {
        label: "Save Favorites",
        text: "Save recipes you like so they are easier to find later in your Favorites page.",
      },
      {
        label: "Plan Meals",
        text: "Use recipes from the library as building blocks for your weekly meal plan and grocery list.",
      },
    ],
  };

  if (specificSteps[normalizedTitle]) return specificSteps[normalizedTitle];

  if (normalizedEyebrow === "COOKING METHODS") {
    return [
      {
        label: "Start Here",
        text: `Use this page to find ideas built around ${normalizedTitle.toLowerCase()} and the equipment you already use.`,
      },
      {
        label: "Review Tips",
        text: "Watch for cooking notes about timing, temperature, setup, cleanup, and practical adjustments.",
      },
      {
        label: "Pick Recipes",
        text: "Choose meals that match your available time, ingredients, portion needs, and comfort level.",
      },
      {
        label: "Adjust Safely",
        text: "Appliances vary, so check doneness, use safe temperatures, and follow the manufacturer’s instructions.",
      },
      {
        label: "Save Ideas",
        text: "Save useful recipes or tips so you can return to them when planning future meals.",
      },
    ];
  }

  if (normalizedEyebrow === "COLLECTIONS") {
    return [
      {
        label: "Browse Ideas",
        text: `Use this collection to quickly find ${normalizedTitle.toLowerCase()} ideas without searching the entire recipe library.`,
      },
      {
        label: "Compare Meals",
        text: "Review the meal style, sides, portions, and practical notes to decide what fits your household.",
      },
      {
        label: "Open Recipes",
        text: "Use recipe links or buttons to view the matching recipe cards when they are available.",
      },
      {
        label: "Plan Ahead",
        text: "Add promising meals to your planning routine, freezer-prep list, or upcoming grocery trip.",
      },
      {
        label: "Customize",
        text: "Treat each collection as a starting point and adjust ingredients, sides, or portions to fit your needs.",
      },
    ];
  }

  if (normalizedEyebrow === "PLANNING") {
    return [
      {
        label: "Review",
        text: "Start by reviewing the items, recipes, meals, or lists already shown on this page.",
      },
      {
        label: "Organize",
        text: "Use the page tools to keep your pantry, favorites, meal plans, or grocery list easier to manage.",
      },
      {
        label: "Update",
        text: "Add, remove, check off, or adjust items as your cooking plans change.",
      },
      {
        label: "Plan Meals",
        text: "Use the saved information to reduce last-minute decisions and make shopping easier.",
      },
      {
        label: "Browser Only",
        text: "Saved planning information is stored in this browser only and is not automatically shared between devices.",
      },
    ];
  }

  if (normalizedEyebrow === "TIPS & ORGANIZATION") {
    return [
      {
        label: "Choose Topic",
        text: "Use this page to focus on one helpful cooking, reference, product, or organization topic.",
      },
      {
        label: "Read First",
        text: "Start with the page introduction so you know what kind of help the page is designed to provide.",
      },
      {
        label: "Apply Tips",
        text: "Use the practical tips as guidance and adjust them to your kitchen, equipment, and cooking routine.",
      },
      {
        label: "Save Time",
        text: "Look for ideas that simplify prep, storage, cleanup, shopping, or repeated cooking tasks.",
      },
      {
        label: "Check Details",
        text: "Review safety, product, and policy notes when the page includes recommendations or outside links.",
      },
    ];
  }

  return [
    {
      label: "Read Intro",
      text: "Start with the page headline and short introduction to understand what this page is designed to help you do.",
    },
    {
      label: "Explore",
      text: "Review the cards, lists, links, tools, or sections on the page and choose the option that fits your need.",
    },
    {
      label: "Use Buttons",
      text: "When buttons or controls are available, use them to open recipes, filter results, print, download, or move to the next step.",
    },
    {
      label: "Save Time",
      text: "Use the page as a practical shortcut for planning meals, organizing recipes, or finding helpful kitchen information.",
    },
    {
      label: "Check Notes",
      text: "Review any notes, estimates, disclaimers, or safety reminders before relying on the information.",
    },
  ];
}

function PageHelpButtonStrip({ pageTitle, pageEyebrow }) {
  const [isOpen, setIsOpen] = useState(false);
  const { activePage, setActivePage } = useContext(PageNavigationContext);
  const steps = getPageHelpSteps(pageTitle, pageEyebrow).slice(0, 4);
  const currentIndex = PAGE_NAVIGATION_ORDER.indexOf(activePage);
  const previousPage = currentIndex > 0 ? PAGE_NAVIGATION_ORDER[currentIndex - 1] : null;
  const nextPage =
    currentIndex >= 0 && currentIndex < PAGE_NAVIGATION_ORDER.length - 1
      ? PAGE_NAVIGATION_ORDER[currentIndex + 1]
      : null;

  if (!pageTitle || !steps?.length) return null;

  function navigateTo(page) {
    if (!page) return;
    setIsOpen(false);
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <section className="pageHelpStrip pageNotesStrip" aria-label={`Page navigation and Cliff Notes for ${pageTitle}`}>
      <button
        type="button"
        className="pageSequenceButton pageSequencePrev"
        onClick={() => navigateTo(previousPage)}
        disabled={!previousPage}
        aria-label="Go to previous menu page"
      >
        Prev
      </button>

      <div className="pageHelpItem pageNotesItem">
        <button
          type="button"
          className={`pageHelpButton pageNotesButton${isOpen ? " active" : ""}`}
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
        >
          <span className="pageHelpNumber pageNotesQuestion">?</span>
          <span>Cliff Notes</span>
        </button>

        {isOpen && (
          <div className="pageHelpPopup pageNotesPopup" role="dialog" aria-label="Cliff notes: how to best use this page">
            <button
              type="button"
              className="pageHelpClose"
              onClick={() => setIsOpen(false)}
              aria-label="Close page notes"
            >
              ×
            </button>
            <h3>How to best use this page</h3>
            <ul>
              {steps.map((step) => (
                <li key={`${pageTitle}-${step.label}`}>{step.text}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button
        type="button"
        className="pageSequenceButton pageSequenceNext"
        onClick={() => navigateTo(nextPage)}
        disabled={!nextPage}
        aria-label="Go to next menu page"
      >
        Next
      </button>
    </section>
  );
}


function PageHeroImage({ src, alt = "", title = "", eyebrow = "", text = "", icon = "", className = "" }) {
  if (!src) return null;

  return (
    <>
      <section className={`pageTopHeroImage${title ? " hasHeroText" : ""}${className ? ` ${className}` : ""}`}>
      <img
        key={src}
        src={assetUrl(src)}
        alt={alt}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        data-page-hero-image="true"
      />
      {title && (
        <div className="pageHeroTextOverlay">
          {eyebrow && <div className="pageHeroEyebrow">{eyebrow}</div>}
          <h1>
            {icon && <span className="pageHeroIcon" aria-hidden="true">{icon}</span>}
            {title}
          </h1>
          {text && (
            <div className="pageHeroIntroText">
              {String(text)
                .replace(/\\\\n/g, "\\n")
                .replace(/\\n/g, "\n")
                .split(/\n\s*\n/)
                .filter((paragraph) => paragraph.trim().length > 0)
                .map((paragraph, index) => (
                  <p key={index}>{paragraph.trim()}</p>
                ))}
            </div>
          )}
        </div>
      )}
        {title && <PageHelpButtonStrip pageTitle={title} pageEyebrow={eyebrow} />}
      </section>
    </>
  );
}

function HeroTopicPage({
  eyebrow,
  title,
  text,
  heroImage,
  heroAlt,
  setActivePage,
  primaryPage = "Recipes",
  primaryLabel = "Browse Our Recipe Library",
  secondaryPage = "How To Use",
  secondaryLabel = "How to Use This Site",
  heroClassName = "pageHeroDepth464",
  children = null,
}) {
  return (
    <>
      <PageHeroImage
        src={heroImage}
        alt={heroAlt}
        eyebrow={eyebrow}
        title={title}
        text={text}
        className={heroClassName}
      />

      <main className="pageShell aboutRecipesPage heroTopicPage">
        <section className="aboutRecipesHero heroTopicIntro">
          <div>
            <div className="aiBadge">{eyebrow}</div>
            <h1>{title}</h1>
            <p>{text}</p>
          </div>
        </section>

        {children || (
          <div className="aboutRecipesGrid heroTopicPracticalGrid">
            <article className="aboutRecipesCard">
              <h2>Start With the Basics</h2>
              <p>Read the page introduction and review the equipment, ingredients, setup, and timing before you begin.</p>
            </article>
            <article className="aboutRecipesCard">
              <h2>Use Practical Judgment</h2>
              <p>Appliances and kitchens vary. Begin checking early, make small adjustments, and use a thermometer whenever safe doneness matters.</p>
            </article>
            <article className="aboutRecipesCard">
              <h2>Keep It Useful</h2>
              <p>Use the ideas on this page as flexible guidance for smaller portions, planned leftovers, easier cleanup, and meals that fit your routine.</p>
            </article>
          </div>
        )}

        <div className="aboutRecipesActions">
          <button className="primary" onClick={() => setActivePage(primaryPage)}>
            {primaryLabel}
          </button>
          <button className="secondary" onClick={() => setActivePage(secondaryPage)}>
            {secondaryLabel}
          </button>
        </div>
      </main>
    </>
  );
}




function DinnerCombinationCard({ meal, onAddMealToPlan, openRecipeCard }) {
  const [activeRecipePopup, setActiveRecipePopup] = useState(null);
  const [selectedPlannerDay, setSelectedPlannerDay] = useState("week1-Mon");
  const [addedMessage, setAddedMessage] = useState("");
  const [mealImageIndex, setMealImageIndex] = useState(0);
  const [mealImageFailed, setMealImageFailed] = useState(false);

  const paddedMealNumber = String(meal.number).padStart(3, "0");
  const mealImageCandidates = dinnerMealImageCandidates(meal);

  const activeMealImage = mealImageFailed ? "" : (mealImageCandidates[mealImageIndex] || mealImageCandidates[0]);

  const recipeButtons = [
    { label: meal.mainDish, type: "Main Dish", recipeId: meal.mainRecipeId },
    ...(meal.sides || []).map((side) => ({
      label: side.name,
      type: "Side Dish",
      recipeId: side.recipeId,
    })),
  ];

  function nutritionValue(value, suffix = "") {
    if (value === null || value === undefined || value === "") return "—";
    return `${value}${suffix}`;
  }

  function addThisMealToPlan() {
    onAddMealToPlan(meal.id, selectedPlannerDay);
    setAddedMessage(`Added to ${plannerSlotLabel(selectedPlannerDay)}.`);
    window.setTimeout(() => setAddedMessage(""), 2600);
  }

  function findLinkedRecipe(recipeId) {
    if (!recipeId) return null;
    return recipes.find((recipe) => recipe.id === recipeId) || null;
  }

  function handleRecipeButton(button) {
    setActiveRecipePopup((current) => (current === button.label ? null : button.label));
  }

  function handleMealImageError() {
    setMealImageIndex((current) => {
      const next = current + 1;
      if (next < mealImageCandidates.length) return next;
      setMealImageFailed(true);
      return current;
    });
  }

  return (
    <article className={`dinnerCombinationCard${activeMealImage ? " hasMealImage" : ""}`}>
      <div className="dinnerCombinationMealBadge">Meal #{meal.number}</div>

      <div className="dinnerCombinationHeader">
        <div className="dinnerCombinationMedia">
          {activeMealImage ? (
            <img
              src={`${import.meta.env.BASE_URL}${activeMealImage}`}
              alt={`${meal.title} dinner combination with ${meal.subtitle.replace(/^With\s+/i, "")}`}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              onError={handleMealImageError}
            />
          ) : (
            <div className="dinnerCombinationImagePlaceholder">
              <span>Meal #{meal.number}</span>
              <small>Image file not found</small>
            </div>
          )}
        </div>

        <div className="dinnerCombinationTitleBlock">
          <h3>{meal.title}</h3>
          <p className="dinnerCombinationSubtitle">{meal.subtitle}</p>
          <MealBalanceDetails item={meal} prefix="Combo Meal Balance" className="comboMealBalanceDetails" />
        </div>
      </div>

      <div className="dinnerCombinationDetails">
        <section>
          <h4>Main Dish:</h4>
          <p>
            <strong>{meal.mainDish}</strong>
            <span> — {meal.mainServing}</span>
          </p>
        </section>

        <section>
          <h4>Sides:</h4>
          <ul>
            {(meal.sides || []).map((side) => (
              <li key={`${meal.id}-${side.name}`}>
                <strong>{side.name}</strong>
                <span> — {side.serving}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="dinnerCombinationNutritionLabel">Estimated nutrition for the whole meal</div>
      <div className="dinnerCombinationNutrition" aria-label={`Estimated whole meal nutrition for ${meal.title}`}>
        <span><strong>{nutritionValue(meal.calories)}</strong><small>calories</small></span>
        <span><strong>{nutritionValue(meal.protein, "g")}</strong><small>protein</small></span>
        <span><strong>{nutritionValue(meal.carbs, "g")}</strong><small>carbs</small></span>
        <span><strong>{nutritionValue(meal.fat, "g")}</strong><small>fat</small></span>
        <span><strong>{nutritionValue(meal.fiber, "g")}</strong><small>fiber</small></span>
      </div>

      <section className="dinnerCombinationRecipeButtons" aria-label={`Recipe card buttons for ${meal.title}`}>
        <h4>Recipe Cards</h4>
        <div className="dinnerCombinationRecipeButtonGrid">
          {recipeButtons.map((button) => {
            const linkedRecipe = findLinkedRecipe(button.recipeId);
            const hasRecipeMatch = Boolean(linkedRecipe);
            const isOpen = activeRecipePopup === button.label;

            return (
              <div className="dinnerRecipePopupItem" key={`${meal.id}-${button.type}-${button.label}`}>
                <button
                  type="button"
                  className={hasRecipeMatch ? "hasRecipeMatch" : "missingRecipeMatch"}
                  onClick={() => handleRecipeButton(button)}
                  title={hasRecipeMatch ? `Preview ${linkedRecipe.title}` : "Recipe card not linked yet"}
                >
                  <span>{button.type}</span>
                  {button.label}
                </button>

                {isOpen && (
                  <div className="dinnerRecipeMiniPopup" role="dialog" aria-label={`${button.label} recipe card preview`}>
                    <button
                      type="button"
                      className="dinnerRecipeMiniClose"
                      onClick={() => setActiveRecipePopup(null)}
                      aria-label="Close recipe card preview"
                    >
                      ×
                    </button>

                    {hasRecipeMatch ? (
                      <>
                        <h5>{linkedRecipe.title}</h5>
                        <MealBalanceBadge item={linkedRecipe} className="dinnerRecipeMealBalanceBadge" />
                        <p>
                          <strong>{linkedRecipe.id}</strong>
                          {linkedRecipe.category ? ` · ${linkedRecipe.category}` : ""}
                          {linkedRecipe.time ? ` · ${linkedRecipe.time} minutes` : ""}
                        </p>
                        <p>
                          This item is linked to an existing recipe card in the library.
                        </p>
                        <button
                          type="button"
                          className="dinnerRecipeOpenFullButton"
                          onClick={() => {
                            setActiveRecipePopup(null);
                            openRecipeCard(linkedRecipe.id, recipes);
                          }}
                        >
                          Open Full Recipe Card
                        </button>
                      </>
                    ) : (
                      <>
                        <h5>{button.label}</h5>
                        <p>
                          A matching recipe card is not linked yet. Add a valid recipeId for this item in dinnerCombinations.js when the card is available.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="dinnerCombinationPlannerAdd" aria-label={`Add ${meal.title} to meal plan`}>
        <label>
          <span>Add meal to plan day</span>
          <select value={selectedPlannerDay} onChange={(event) => setSelectedPlannerDay(event.target.value)}>
            {PLANNER_WEEKS.map((week) => (
              <optgroup key={week.id} label={week.title}>
                {WEEK_DAYS.map((day) => (
                  <option key={`${week.id}-${day}`} value={`${week.id}-${day}`}>
                    {week.title} — {day}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <button type="button" onClick={addThisMealToPlan}>Add Meal</button>
        {addedMessage && <p className="dinnerCombinationAddedMessage">{addedMessage}</p>}
      </section>

      <details className="dinnerCombinationHeating">
        <summary>Heating & freezer notes</summary>
        <div>
          <p><strong>Freezer life:</strong> {meal.freezerLife}</p>
          <p><strong>Oven:</strong> {meal.ovenInstructions}</p>
          <p><strong>Microwave:</strong> {meal.microwaveInstructions}</p>
        </div>
      </details>
    </article>
  );
}

function DinnerCombinationsPage({ setActivePage, setFilter, setPlan, openRecipeCard }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [proteinFilter, setProteinFilter] = useState("all");
  const [sideFilter, setSideFilter] = useState("all");
  const [lowerCalorieOnly, setLowerCalorieOnly] = useState(false);
  const [higherProteinOnly, setHigherProteinOnly] = useState(false);
  const [sortMode, setSortMode] = useState("meal-number");

  const filteredMeals = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return dinnerCombinations
      .filter((meal) => !normalizedSearch || getDinnerCombinationSearchText(meal).includes(normalizedSearch))
      .filter((meal) => proteinFilter === "all" || (meal.tags || []).includes(proteinFilter))
      .filter((meal) => sideFilter === "all" || (meal.tags || []).includes(sideFilter))
      .filter((meal) => !lowerCalorieOnly || Number(meal.calories) < 600)
      .filter((meal) => !higherProteinOnly || Number(meal.protein) >= 30)
      .sort((a, b) => {
        if (sortMode === "calories-low") return Number(a.calories) - Number(b.calories);
        if (sortMode === "protein-high") return Number(b.protein) - Number(a.protein);
        if (sortMode === "title") return a.title.localeCompare(b.title);
        return Number(a.number) - Number(b.number);
      });
  }, [higherProteinOnly, lowerCalorieOnly, proteinFilter, searchTerm, sideFilter, sortMode]);

  function clearDinnerCombinationFilters() {
    setSearchTerm("");
    setProteinFilter("all");
    setSideFilter("all");
    setLowerCalorieOnly(false);
    setHigherProteinOnly(false);
    setSortMode("meal-number");
  }

  function openRecipeSearch(recipeName) {
    setFilter(recipeName);
    setActivePage("Recipes");
  }

  function addDinnerMealToPlan(mealId, slotKey) {
    if (!mealId || !slotKey) return;

    setPlan((current) => {
      const next = normalizeTwoWeekPlan(current);
      next[slotKey] = [...(next[slotKey] || []), mealId];
      return next;
    });
  }

  return (
    <main className="pageShell dinnerCombinationsPage">
<section className="dinnerCombinationControls" aria-label="Dinner combination filters">
        <label className="dinnerCombinationSearch">
          <span>Search meals</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search meals, main dishes, or sides…"
          />
        </label>

        <label>
          <span>Protein</span>
          <select value={proteinFilter} onChange={(event) => setProteinFilter(event.target.value)}>
            <option value="all">All Proteins</option>
            {DINNER_PROTEIN_FILTERS.map((filter) => (
              <option key={filter} value={filter}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Side Type</span>
          <select value={sideFilter} onChange={(event) => setSideFilter(event.target.value)}>
            <option value="all">All Side Types</option>
            {DINNER_SIDE_FILTERS.map((filter) => (
              <option key={filter} value={filter}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <div className="dinnerCombinationChecks">
          <label>
            <input
              type="checkbox"
              checked={lowerCalorieOnly}
              onChange={(event) => setLowerCalorieOnly(event.target.checked)}
            />
            Under 600 Calories
          </label>
          <label>
            <input
              type="checkbox"
              checked={higherProteinOnly}
              onChange={(event) => setHigherProteinOnly(event.target.checked)}
            />
            30g+ Protein
          </label>
        </div>

        <label>
          <span>Sort</span>
          <select value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
            <option value="meal-number">Meal Number</option>
            <option value="title">Title</option>
            <option value="calories-low">Lowest Calories</option>
            <option value="protein-high">Highest Protein</option>
          </select>
        </label>

        <button type="button" onClick={clearDinnerCombinationFilters}>Clear</button>
      </section>

      <div className="dinnerCombinationResultsBar">
        <strong>{filteredMeals.length}</strong>
        <span>{filteredMeals.length === 1 ? "meal combination" : "meal combinations"} shown</span>
      </div>

      {filteredMeals.length > 0 ? (
        <section className="dinnerCombinationGrid" aria-label="Dinner combination results">
          {filteredMeals.map((meal) => (
            <DinnerCombinationCard key={meal.id} meal={meal} onAddMealToPlan={addDinnerMealToPlan} openRecipeCard={openRecipeCard} />
          ))}
        </section>
      ) : (
        <section className="dinnerCombinationEmpty">
          <h2>No dinner combinations found</h2>
          <p>Try clearing a filter or searching for a different main dish or side dish.</p>
        </section>
      )}
    </main>
  );
}



const REFERENCE_GUIDES = [
  {
    id: "weights-measures",
    title: "Weights & Measures",
    icon: "scale",
    description:
      "Quick reference for common kitchen measurements, conversions, and equivalents.",
    lastUpdated: "July 17, 2026",
    tabs: [
      {
        id: "volume",
        label: "Volume",
        sections: [
          {
            type: "table",
            title: "Volume Equivalents",
            columns: ["Measurement", "Equivalent", "Metric"],
            rows: [
              ["1 tablespoon", "3 teaspoons", "15 ml"],
              ["1/8 cup", "2 tablespoons", "30 ml"],
              ["1/4 cup", "4 tablespoons", "60 ml"],
              ["1/3 cup", "5 tablespoons + 1 teaspoon", "80 ml"],
              ["1/2 cup", "8 tablespoons", "120 ml"],
              ["2/3 cup", "10 tablespoons + 2 teaspoons", "160 ml"],
              ["3/4 cup", "12 tablespoons", "180 ml"],
              ["1 cup", "16 tablespoons", "240 ml"],
            ],
          },
          {
            type: "table",
            title: "Liquid Equivalents",
            columns: ["Measurement", "Fluid Ounces", "Metric"],
            rows: [
              ["1 cup", "8 fl oz", "240 ml"],
              ["1 pint", "16 fl oz", "480 ml"],
              ["1 quart", "32 fl oz", "960 ml"],
              ["1/2 gallon", "64 fl oz", "1.9 L"],
              ["1 gallon", "128 fl oz", "3.8 L"],
            ],
          },
          {
            type: "tips",
            title: "Quick Kitchen Equivalents",
            items: [
              "1 pinch is a small amount held between thumb and forefinger.",
              "1 dash is generally about 1/8 teaspoon.",
              "1 stick of butter equals 1/2 cup or 8 tablespoons.",
              "1 cup of shredded cheese is about 4 ounces.",
              "1 cup of all-purpose flour is about 120 grams when spooned and leveled.",
            ],
          },
        ],
      },
      {
        id: "weight",
        label: "Weight",
        sections: [
          {
            type: "table",
            title: "Common U.S. Weights",
            columns: ["Weight", "Ounces", "Grams"],
            rows: [
              ["1/4 pound", "4 oz", "113 g"],
              ["1/2 pound", "8 oz", "227 g"],
              ["3/4 pound", "12 oz", "340 g"],
              ["1 pound", "16 oz", "454 g"],
              ["1 1/2 pounds", "24 oz", "680 g"],
              ["2 pounds", "32 oz", "907 g"],
            ],
          },
          {
            type: "info",
            title: "Measuring Dry Ingredients",
            text:
              "For flour and similar dry ingredients, spoon the ingredient into the measuring cup and level it with a straight edge. Scooping directly from the bag can pack the ingredient and increase the amount.",
          },
        ],
      },
      {
        id: "metric",
        label: "Metric",
        sections: [
          {
            type: "table",
            title: "Common Metric Conversions",
            columns: ["U.S. Measure", "Metric Approximation", "Notes"],
            rows: [
              ["1 teaspoon", "5 ml", "Liquid volume"],
              ["1 tablespoon", "15 ml", "Liquid volume"],
              ["1 cup", "240 ml", "Liquid volume"],
              ["1 ounce", "28 g", "Weight"],
              ["1 pound", "454 g", "Weight"],
              ["350°F", "177°C", "Often rounded to 175°C"],
            ],
          },
        ],
      },
      {
        id: "butter",
        label: "Butter",
        sections: [
          {
            type: "table",
            title: "Butter Equivalents",
            columns: ["Butter", "Tablespoons", "Cups"],
            rows: [
              ["1/2 stick", "4 tablespoons", "1/4 cup"],
              ["1 stick", "8 tablespoons", "1/2 cup"],
              ["2 sticks", "16 tablespoons", "1 cup"],
              ["4 sticks", "32 tablespoons", "2 cups"],
            ],
          },
        ],
      },
      {
        id: "liquid",
        label: "Liquid Measurements",
        sections: [
          {
            type: "table",
            title: "Cup, Pint, Quart & Gallon",
            columns: ["Measurement", "Equivalent", "Metric Approximation"],
            rows: [
              ["2 cups", "1 pint", "480 ml"],
              ["4 cups", "1 quart", "960 ml"],
              ["2 quarts", "1/2 gallon", "1.9 L"],
              ["4 quarts", "1 gallon", "3.8 L"],
            ],
          },
        ],
      },
    ],
  },
  {
    id: "cooking-temperatures",
    title: "Cooking Temperatures",
    icon: "thermometer",
    description:
      "Safe minimum internal temperatures and common doneness reminders for everyday cooking.",
    lastUpdated: "July 17, 2026",
    sections: [
      {
        type: "table",
        title: "Safe Minimum Internal Temperatures",
        columns: ["Food", "Temperature", "Notes"],
        rows: [
          ["Poultry", "165°F", "Chicken, turkey, casseroles with poultry"],
          ["Ground meats", "160°F", "Beef, pork, veal, lamb"],
          ["Seafood", "145°F", "Fish should be opaque and flake easily"],
          ["Whole cuts of beef, pork, veal, lamb", "145°F + rest", "Rest at least 3 minutes"],
          ["Egg dishes", "160°F", "Includes casseroles and custards"],
          ["Leftovers", "165°F", "Reheat thoroughly"],
        ],
      },
      {
        type: "tips",
        title: "Temperature Tips",
        items: [
          "Use an instant-read thermometer for the most reliable results.",
          "Check the thickest part of the food and avoid touching bone or the pan.",
          "Carryover cooking can raise the temperature slightly after food is removed from heat.",
        ],
      },
    ],
  },
  {
    id: "oven-conversions",
    title: "Oven Conversions",
    icon: "oven",
    description:
      "Common oven temperature conversions and practical notes for baking and roasting.",
    lastUpdated: "July 17, 2026",
    sections: [
      {
        type: "table",
        title: "Fahrenheit to Celsius",
        columns: ["Fahrenheit", "Celsius", "Common Use"],
        rows: [
          ["250°F", "120°C", "Low and slow"],
          ["300°F", "150°C", "Gentle baking"],
          ["325°F", "165°C", "Casseroles, cakes"],
          ["350°F", "175°C", "General baking"],
          ["375°F", "190°C", "Roasting, cookies"],
          ["400°F", "205°C", "Roasting vegetables"],
          ["425°F", "220°C", "High roasting"],
          ["450°F", "230°C", "Pizza, quick browning"],
        ],
      },
      {
        type: "info",
        title: "Convection Note",
        text:
          "For convection baking, many recipes work best when the temperature is reduced by about 25°F, but always follow your oven manual and watch food closely the first time.",
      },
    ],
  },
  {
    id: "pan-sizes",
    title: "Pan & Baking Dish Sizes",
    icon: "pan",
    description:
      "Common pan sizes, approximate capacity, and practical substitution reminders.",
    lastUpdated: "July 17, 2026",
    sections: [
      {
        type: "table",
        title: "Common Baking Dish Sizes",
        columns: ["Pan or Dish", "Approx. Capacity", "Common Uses"],
        rows: [
          ["8 × 8 inch square", "2 quarts", "Brownies, small casseroles"],
          ["9 × 9 inch square", "2.5 quarts", "Bars, small bakes"],
          ["9 × 13 inch baking dish", "3 quarts", "Casseroles, sheet cakes"],
          ["9 inch pie plate", "4 cups", "Pies, quiche"],
          ["Loaf pan", "6 to 8 cups", "Quick breads, meatloaf"],
          ["12-cup muffin pan", "Standard", "Muffins, cupcakes"],
        ],
      },
      {
        type: "tips",
        title: "Pan Substitution Tips",
        items: [
          "Changing pan size can change baking time and thickness.",
          "A shallower pan usually bakes faster; a deeper pan may need more time.",
          "Avoid filling pans more than about two-thirds full unless the recipe says otherwise.",
        ],
      },
    ],
  },
  {
    id: "ingredient-weights",
    title: "Ingredient Weights",
    icon: "weight",
    description:
      "Approximate weights for common ingredients used in everyday home cooking.",
    lastUpdated: "July 17, 2026",
    sections: [
      {
        type: "table",
        title: "Approximate Ingredient Weights",
        columns: ["Ingredient", "Common Measure", "Approx. Weight"],
        rows: [
          ["All-purpose flour", "1 cup", "120 g"],
          ["Granulated sugar", "1 cup", "200 g"],
          ["Brown sugar, packed", "1 cup", "213 g"],
          ["Powdered sugar", "1 cup", "120 g"],
          ["Butter", "1 tablespoon", "14 g"],
          ["Shredded cheddar", "1 cup", "113 g"],
          ["Rice, uncooked", "1 cup", "185 g"],
          ["Rolled oats", "1 cup", "90 g"],
        ],
      },
      {
        type: "info",
        title: "Accuracy Note",
        text:
          "Ingredient weights can vary by brand, humidity, grind, and how the ingredient is measured. A kitchen scale gives the most consistent results.",
      },
    ],
  },
  {
    id: "refrigerator-freezer",
    title: "Refrigerator & Freezer Guide",
    icon: "snowflake",
    description:
      "Practical storage-time reminders for refrigerated and frozen foods.",
    lastUpdated: "July 17, 2026",
    sections: [
      {
        type: "table",
        title: "Refrigerator Storage",
        columns: ["Food", "Typical Storage Time", "Notes"],
        rows: [
          ["Cooked leftovers", "3 to 4 days", "Store promptly in shallow containers"],
          ["Cooked poultry", "3 to 4 days", "Keep covered and chilled"],
          ["Raw ground meat", "1 to 2 days", "Cook or freeze soon"],
          ["Raw poultry", "1 to 2 days", "Keep sealed on a lower shelf"],
          ["Soups and stews", "3 to 4 days", "Cool quickly before storing"],
        ],
      },
      {
        type: "table",
        title: "Freezer Storage",
        columns: ["Food", "Best Quality Time", "Notes"],
        rows: [
          ["Cooked meals", "2 to 3 months", "Wrap well and label"],
          ["Raw ground meat", "3 to 4 months", "Freeze flat when possible"],
          ["Raw poultry pieces", "9 months", "Use freezer-safe packaging"],
          ["Soups and stews", "2 to 3 months", "Leave headspace for expansion"],
          ["Breads and rolls", "2 to 3 months", "Wrap tightly"],
        ],
      },
    ],
  },
  {
    id: "serving-portions",
    title: "Serving & Portion Guide",
    icon: "plate",
    description:
      "Simple portion estimates for planning meals, leftovers, and grocery quantities.",
    lastUpdated: "July 17, 2026",
    sections: [
      {
        type: "table",
        title: "General Serving Estimates",
        columns: ["Food", "Typical Serving", "Planning Note"],
        rows: [
          ["Boneless meat or poultry", "4 to 6 oz cooked", "Allow more for hearty appetites"],
          ["Fish fillet", "4 to 6 oz", "Depends on side dishes"],
          ["Pasta, dry", "2 oz", "About 1 cup cooked"],
          ["Rice, dry", "1/4 cup", "About 3/4 cup cooked"],
          ["Vegetables", "1/2 to 1 cup", "Varies by meal"],
          ["Soup", "1 to 1 1/2 cups", "More for main dish soup"],
        ],
      },
      {
        type: "tips",
        title: "Planning Tips",
        items: [
          "Plan larger servings when leftovers are part of the goal.",
          "For mixed dishes, portion size depends on richness and side dishes.",
          "Smaller households can cook full recipes and freeze extra portions for later.",
        ],
      },
    ],
  },
  {
    id: "substitutions",
    title: "Common Substitutions",
    icon: "swap",
    description:
      "Useful substitutions for common ingredients when you are missing an item or adjusting a recipe.",
    lastUpdated: "July 17, 2026",
    sections: [
      {
        type: "table",
        title: "Everyday Substitutions",
        columns: ["Ingredient Needed", "Possible Substitute", "Notes"],
        rows: [
          ["1 cup buttermilk", "1 cup milk + 1 Tbsp lemon juice or vinegar", "Let stand 5 minutes"],
          ["1 tablespoon cornstarch", "2 tablespoons all-purpose flour", "Best for sauces"],
          ["1 cup sour cream", "1 cup plain Greek yogurt", "Works in many dips and toppings"],
          ["1 cup brown sugar", "1 cup white sugar + 1 Tbsp molasses", "Mix well"],
          ["1 teaspoon baking powder", "1/4 tsp baking soda + 1/2 tsp cream of tartar", "Use promptly"],
        ],
      },
      {
        type: "info",
        title: "Substitution Reminder",
        text:
          "Substitutions can change flavor, texture, browning, or moisture. Use them as practical options, not always as exact replacements.",
      },
    ],
  },
  {
    id: "small-appliances",
    title: "Air Fryer, Slow Cooker & Pressure Cooker",
    icon: "pot",
    description:
      "Quick appliance reminders for timing, safety, and best results.",
    lastUpdated: "July 17, 2026",
    sections: [
      {
        type: "tips",
        title: "Air Fryer Tips",
        items: [
          "Avoid overcrowding the basket so hot air can circulate.",
          "Shake or turn food for more even browning.",
          "Start checking early because models vary.",
        ],
      },
      {
        type: "tips",
        title: "Slow Cooker Tips",
        items: [
          "Keep the lid closed as much as possible.",
          "Cut dense vegetables evenly so they cook at the same pace.",
          "Use enough liquid for the recipe, but remember slow cookers trap moisture.",
        ],
      },
      {
        type: "tips",
        title: "Pressure Cooker Tips",
        items: [
          "Do not overfill the cooker.",
          "Allow time for pressure build-up and release when planning the meal.",
          "Use the release method recommended in the recipe.",
        ],
      },
    ],
  },
  {
    id: "smoking-grilling",
    title: "Smoking & Grilling Guide",
    icon: "grill",
    description:
      "Practical reminders for outdoor cooking, temperature control, resting, and safe doneness.",
    lastUpdated: "July 17, 2026",
    sections: [
      {
        type: "table",
        title: "Outdoor Cooking Reminders",
        columns: ["Topic", "Guidance", "Why It Matters"],
        rows: [
          ["Preheating", "Preheat grills and smokers before cooking", "Improves timing and searing"],
          ["Thermometer", "Use internal temperature, not just time", "Improves safety and consistency"],
          ["Resting", "Rest larger meats before slicing", "Helps juices redistribute"],
          ["Smoke", "Use clean, steady smoke", "Avoids harsh flavors"],
          ["Zones", "Use direct and indirect heat when grilling", "Helps prevent burning"],
        ],
      },
      {
        type: "tips",
        title: "Quick Tips",
        items: [
          "Keep the lid closed when smoking to maintain temperature.",
          "Trim excess fat but leave enough for moisture and flavor.",
          "Slice brisket and similar meats against the grain.",
        ],
      },
    ],
  },
];


function ReferenceGuideIcon({ type, size = "normal" }) {
  const commonProps = {
    className: `referenceGuideSvgIcon ${size === "large" ? "large" : ""}`,
    viewBox: "0 0 48 48",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": "true",
    focusable: "false",
  };

  switch (type) {
    case "scale":
      return (
        <svg {...commonProps}>
          <path d="M24 7v34" />
          <path d="M14 13h20" />
          <path d="M24 10l-12 8" />
          <path d="M24 10l12 8" />
          <path d="M10 20l-5 11h10l-5-11z" />
          <path d="M38 20l-5 11h10l-5-11z" />
          <path d="M16 41h16" />
        </svg>
      );
    case "thermometer":
      return (
        <svg {...commonProps}>
          <path d="M25 7a5 5 0 0 0-10 0v22a10 10 0 1 0 10 0V7z" />
          <path d="M20 31V14" />
          <path d="M20 38a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
          <path d="M30 12h8" />
          <path d="M30 20h6" />
        </svg>
      );
    case "oven":
      return (
        <svg {...commonProps}>
          <rect x="8" y="9" width="32" height="30" rx="3" />
          <path d="M8 17h32" />
          <path d="M15 13h.2" />
          <path d="M22 13h.2" />
          <path d="M29 13h.2" />
          <path d="M14 24h20v10H14z" />
          <path d="M17 27h14" />
        </svg>
      );
    case "pan":
      return (
        <svg {...commonProps}>
          <path d="M9 24h24a9 9 0 0 1-9 9h-6a9 9 0 0 1-9-9z" />
          <path d="M33 24h9" />
          <path d="M13 20c2-3 6-5 11-5s9 2 11 5" />
          <path d="M17 13c0-2 2-4 4-4h6c2 0 4 2 4 4" />
        </svg>
      );
    case "weight":
      return (
        <svg {...commonProps}>
          <path d="M17 17h14l4 23H13l4-23z" />
          <path d="M18 17a6 6 0 0 1 12 0" />
          <path d="M24 25v9" />
          <path d="M20 29h8" />
        </svg>
      );
    case "snowflake":
      return (
        <svg {...commonProps}>
          <path d="M24 7v34" />
          <path d="M10 15l28 18" />
          <path d="M38 15L10 33" />
          <path d="M18 10l6 6 6-6" />
          <path d="M18 38l6-6 6 6" />
          <path d="M9 23l8-2-2-8" />
          <path d="M39 25l-8 2 2 8" />
        </svg>
      );
    case "plate":
      return (
        <svg {...commonProps}>
          <circle cx="24" cy="24" r="13" />
          <circle cx="24" cy="24" r="7" />
          <path d="M8 10v28" />
          <path d="M5 10v10" />
          <path d="M11 10v10" />
          <path d="M40 10v28" />
          <path d="M36 10c0 8 4 10 4 10" />
        </svg>
      );
    case "swap":
      return (
        <svg {...commonProps}>
          <path d="M10 17h23" />
          <path d="M28 11l6 6-6 6" />
          <path d="M38 31H15" />
          <path d="M20 25l-6 6 6 6" />
        </svg>
      );
    case "pot":
      return (
        <svg {...commonProps}>
          <path d="M12 20h24v17H12V20z" />
          <path d="M10 20h28" />
          <path d="M16 20c0-5 4-9 8-9s8 4 8 9" />
          <path d="M8 25h4" />
          <path d="M36 25h4" />
          <path d="M19 28h10" />
        </svg>
      );
    case "grill":
      return (
        <svg {...commonProps}>
          <path d="M12 19h24a12 12 0 0 1-24 0z" />
          <path d="M16 19v-4" />
          <path d="M24 19v-5" />
          <path d="M32 19v-4" />
          <path d="M18 31l-5 9" />
          <path d="M30 31l5 9" />
          <path d="M18 40h12" />
          <path d="M36 19h6" />
        </svg>
      );
    default:
      return (
        <svg {...commonProps}>
          <circle cx="24" cy="24" r="14" />
          <path d="M18 24h12" />
          <path d="M24 18v12" />
        </svg>
      );
  }
}


function ReferenceGuideSection({ section }) {
  if (section.type === "table") {
    return (
      <section className="referenceGuideCard">
        <h3>{section.title}</h3>
        <div className="referenceGuideTableWrap">
          <table>
            <thead>
              <tr>
                {section.columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  if (section.type === "tips") {
    return (
      <section className="referenceGuideCard">
        <h3>{section.title}</h3>
        <ul className="referenceGuideTipsList">
          {section.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className="referenceGuideInfoBox">
      <div className="referenceGuideInfoIcon" aria-hidden="true">💡</div>
      <div>
        <h3>{section.title}</h3>
        <p>{section.text}</p>
      </div>
    </section>
  );
}

function ReferenceGuidesPage() {
  const [selectedGuideId, setSelectedGuideId] = useState("weights-measures");
  const selectedGuide =
    REFERENCE_GUIDES.find((guide) => guide.id === selectedGuideId) || REFERENCE_GUIDES[0];
  const [selectedTabId, setSelectedTabId] = useState(selectedGuide.tabs?.[0]?.id || "overview");

  useEffect(() => {
    setSelectedTabId(selectedGuide.tabs?.[0]?.id || "overview");
  }, [selectedGuideId, selectedGuide.tabs]);

  const activeTab = selectedGuide.tabs?.find((tab) => tab.id === selectedTabId);
  const sections = activeTab?.sections || selectedGuide.sections || [];
  const primarySections = sections.filter((section) => section.type === "table");
  const noteSections = sections.filter((section) => section.type !== "table");

  return (
    <main className="pageShell referenceGuidesFeaturePage">
      <section className="referenceGuidesLayout" aria-label="Reference guides">
        <aside className="referenceGuidesNav" aria-label="Reference guide list">
          <div className="referenceGuidesBrandBlock">
            <div className="referenceGuidesBrandTitle">Robert’s Recipe Box</div>
            <div className="referenceGuidesBrandSubtitle">Reference Guides</div>
          </div>

          <div className="referenceGuideButtonList" role="tablist" aria-label="Choose a reference guide">
            {REFERENCE_GUIDES.map((guide) => (
              <button
                key={guide.id}
                type="button"
                className={`referenceGuideNavButton${guide.id === selectedGuide.id ? " active" : ""}`}
                onClick={() => setSelectedGuideId(guide.id)}
                role="tab"
                aria-selected={guide.id === selectedGuide.id}
              >
                <ReferenceGuideIcon type={guide.icon} />
                <span>{guide.title}</span>
              </button>
            ))}
          </div>

          <div className="referenceGuideNavNote">
            <span aria-hidden="true">★</span>
            <p>Click any guide to view details. Print or download options appear below the guide.</p>
          </div>
        </aside>

        <section className="referenceGuidePanel" aria-live="polite">
          <div className="referenceGuidePanelHeader">
            <div>
              <h2>
                <ReferenceGuideIcon type={selectedGuide.icon} size="large" />
                {selectedGuide.title}
              </h2>
              <p>{selectedGuide.description}</p>
            </div>
          </div>

          {selectedGuide.tabs && (
            <div className="referenceGuideTabs" role="tablist" aria-label={`${selectedGuide.title} categories`}>
              {selectedGuide.tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={tab.id === selectedTabId ? "active" : ""}
                  onClick={() => setSelectedTabId(tab.id)}
                  role="tab"
                  aria-selected={tab.id === selectedTabId}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          <div className="referenceGuidePanelBody">
            <div className="referenceGuideSections referenceGuidePrimarySections">
              {primarySections.map((section, index) => (
                <ReferenceGuideSection key={`${selectedGuide.id}-${selectedTabId}-primary-${index}`} section={section} />
              ))}
            </div>

            {noteSections.length > 0 && (
              <div className="referenceGuideBottomNotes" aria-label={`${selectedGuide.title} tips and notes`}>
                {noteSections.map((section, index) => (
                  <ReferenceGuideSection key={`${selectedGuide.id}-${selectedTabId}-note-${index}`} section={section} />
                ))}
              </div>
            )}
          </div>

          <footer className="referenceGuideFooter">
            <div className="referenceGuideActions">
              <button type="button" onClick={() => window.print()}>
                <span aria-hidden="true">🖨️</span>
                Print This Guide
              </button>
              <button type="button" className="referenceGuidePlaceholderButton" disabled title="PDF download files will be added later.">
                <span aria-hidden="true">⬇️</span>
                Download PDF Coming Soon
              </button>
              <button type="button" className="referenceGuidePlaceholderButton" disabled title="Full-page views will be added later.">
                <span aria-hidden="true">↗</span>
                Open as Full Page Coming Soon
              </button>
            </div>
            <p>Robert’s Recipe Box Reference Guides • Last updated: {selectedGuide.lastUpdated}</p>
          </footer>
        </section>
      </section>
    </main>
  );
}



const DISCLAIMER_ACCORDION_SECTIONS = [
  {
    title: "1. Recipes and Website Content",
    items: [
      {
        title: "1.1 AI-Generated Recipes",
        simple: ["The recipes on Robert’s Recipe Box are created with the help of artificial intelligence, but they are guided by Robert’s ideas and decisions. Robert selects the type of meal, ingredients, flavors, number of servings, cooking method, and practical goals for each recipe."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Recipes and related content published on Robert’s Recipe Box may be generated, developed, organized, revised, illustrated, or formatted with the assistance of artificial intelligence. Artificial intelligence may occasionally produce inaccurate, incomplete, inconsistent, or impractical information. Although reasonable efforts may be made to review and improve content before publication, no representation or warranty is made that every recipe or instruction is completely accurate, error-free, tested, or suitable for every user."],
      },
      {
        title: "1.2 Original Recipe Development",
        simple: ["The recipes are developed specifically for Robert’s Recipe Box and are not intentionally copied from another website, cookbook, restaurant, or food company. Similarities may occur because many recipes use familiar ingredients and traditional cooking methods."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Recipes published on Robert’s Recipe Box are independently generated or developed and are not intentionally reproduced from copyrighted recipes, publications, websites, or proprietary commercial formulas. Similarities in ingredients, measurements, cooking techniques, recipe names, or commonly used directions may occur because many dishes are based on traditional, widely known, functional, or commonly practiced culinary methods."],
      },
      {
        title: "1.3 Recipe Testing",
        simple: ["Not every recipe may have been personally cooked and tested before it appears on the website. Visitors should review the ingredients and directions carefully and use reasonable judgment before preparing a recipe."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Unless specifically stated otherwise, users should not assume that every recipe has been independently prepared, tested, verified, or evaluated under controlled conditions. Users are responsible for reviewing all ingredients, quantities, preparation steps, temperatures, cooking times, storage instructions, and equipment requirements before beginning a recipe. Robert’s Recipe Box does not guarantee that a recipe will perform as described under every set of conditions."],
      },
      {
        title: "1.4 Cooking Results May Vary",
        simple: ["Two people can follow the same recipe and still get different results. Appliances, cookware, ingredient brands, weather, experience, and personal preferences can all affect the finished dish."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Cooking results may vary because of differences in ingredient brands, ingredient freshness, substitutions, appliances, cookware, oven calibration, elevation, humidity, portion size, preparation methods, and individual cooking experience. Descriptions, photographs, serving suggestions, and expected results are provided for general reference and do not guarantee appearance, flavor, texture, quality, or performance."],
      },
      {
        title: "1.5 Ingredient Substitutions",
        simple: ["Substitutions can be useful, but changing an ingredient may also change the flavor, texture, nutrition, cooking time, allergen content, or safety of the recipe."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Suggested substitutions are provided as general guidance only. Robert’s Recipe Box does not guarantee that a substituted ingredient will produce the same flavor, texture, appearance, cooking behavior, nutritional content, allergen status, or food-safety outcome as the original ingredient. Users accept responsibility for evaluating and using all substitutions."],
      },
      {
        title: "1.6 Measurements and Conversions",
        simple: ["Measurements, weights, temperatures, and conversions are intended to be practical kitchen references. Small differences may occur because ingredients, measuring tools, and conversion methods are not always identical."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Measurements, weights, temperatures, yields, and unit conversions are estimates unless expressly identified as exact. Variations may occur because of rounding, ingredient density, measuring technique, equipment accuracy, and differences between customary and metric systems. Users should independently verify measurements whenever precision is important."],
      },
      {
        title: "1.7 Serving Sizes and Yields",
        simple: ["Serving sizes are estimates. The actual number of servings will depend on appetite, portion size, side dishes, and how the food is divided."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["All stated yields, portions, and serving sizes are estimates and may not reflect the amount consumed or required by a particular person or household. Robert’s Recipe Box does not guarantee that a recipe will produce a specific number, weight, or volume of servings."],
      },
    ],
  },
  {
    title: "2. Cooking and Food Safety",
    items: [
      {
        title: "2.1 General Food-Safety Responsibility",
        simple: ["Safe cooking begins with the person preparing the food. Wash your hands, keep surfaces clean, separate raw foods from ready-to-eat foods, and use good judgment throughout the cooking process."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Users are solely responsible for following appropriate food-handling, sanitation, preparation, storage, cooking, and serving practices. Robert’s Recipe Box is not responsible for foodborne illness, contamination, spoilage, injury, or loss resulting from improper handling, preparation, storage, serving, or consumption of food."],
      },
      {
        title: "2.2 Safe Internal Temperatures",
        simple: ["Cooking times are only a guide. Use a reliable food thermometer to make sure meat, poultry, seafood, eggs, casseroles, leftovers, and reheated foods reach an appropriate internal temperature."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Cooking times and temperatures appearing in recipes are provided as general guidance. Users must independently confirm that foods have reached an internal temperature appropriate for safe consumption. Appearance, color, texture, or stated cooking time should not be relied upon as the sole indication of doneness or safety."],
      },
      {
        title: "2.3 Cross-Contamination",
        simple: ["Raw meat, poultry, seafood, and eggs can spread bacteria to hands, utensils, cutting boards, countertops, and other foods. Keep raw and cooked foods separated and clean everything thoroughly."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Users are responsible for preventing cross-contamination by separating raw and ready-to-eat foods and by cleaning and sanitizing hands, surfaces, utensils, cutting boards, appliances, and storage containers. Robert’s Recipe Box assumes no responsibility for contamination resulting from a user’s handling practices or kitchen environment."],
      },
      {
        title: "2.4 Refrigeration and Food Storage",
        simple: ["Storage times are general guidelines, not guarantees. Refrigerate food promptly and discard anything that looks, smells, or otherwise appears questionable."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Refrigeration and storage recommendations are estimates and may vary depending on ingredient condition, preparation method, storage temperature, packaging, handling, and appliance performance. Users are responsible for determining whether food remains safe to consume. Food should be discarded whenever spoilage, contamination, temperature abuse, or improper storage is suspected."],
      },
      {
        title: "2.5 Freezing and Thawing",
        simple: ["Freezing can make meal preparation easier, but foods must be packaged, frozen, thawed, and reheated correctly. Some foods may also change texture or appearance after freezing."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Freezing, freezer-storage, thawing, and make-ahead instructions are provided as general guidance. Robert’s Recipe Box does not guarantee the safety, quality, texture, appearance, or storage life of frozen food. Users are responsible for using food-safe packaging, maintaining appropriate freezer temperatures, thawing food safely, and evaluating its condition before consumption."],
      },
      {
        title: "2.6 Reheating Leftovers and Prepared Meals",
        simple: ["Leftovers and prepared meals should be reheated thoroughly and evenly. Stir or rotate foods when needed and check the temperature in more than one location."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Reheating instructions are estimates and may vary by appliance, portion size, container, food density, and starting temperature. Users are responsible for ensuring that reheated food reaches an appropriate internal temperature and is heated evenly before consumption."],
      },
      {
        title: "2.7 Appliance and Equipment Safety",
        simple: ["Always follow the instructions that came with your oven, air fryer, microwave, slow cooker, grill, smoker, pressure cooker, vacuum sealer, or other kitchen equipment."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Appliance settings, cooking methods, and equipment recommendations appearing on Robert’s Recipe Box are general suggestions only. Users must follow all manufacturer instructions, warnings, operating limits, maintenance requirements, and safety procedures. Robert’s Recipe Box is not responsible for personal injury, fire, burns, equipment failure, property damage, or other losses resulting from the use or misuse of an appliance, utensil, container, or kitchen product."],
      },
      {
        title: "2.8 Product Recalls and Safety Notices",
        simple: ["Product information on the website may become outdated. Visitors should check with manufacturers, retailers, and appropriate government recall services for current safety information."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Robert’s Recipe Box is not a real-time product-recall or safety-notification service. Users are responsible for checking current manufacturer notices, government recall databases, product warnings, operating instructions, and safety information before using an ingredient, appliance, container, utensil, or other product."],
      },
    ],
  },
  {
    title: "3. Allergies, Nutrition and Special Diets",
    items: [
      {
        title: "3.1 Food Allergies",
        simple: ["Always read every product label yourself. Ingredients and manufacturing practices can change, even when you have purchased the same product before."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Robert’s Recipe Box cannot guarantee that any recipe, ingredient, product, preparation area, or cooking method is free from allergens. Users are responsible for reviewing ingredient labels, allergen statements, cross-contact warnings, manufacturing information, and preparation conditions before preparing or consuming food."],
      },
      {
        title: "3.2 Food Sensitivities and Intolerances",
        simple: ["An ingredient that is safe for one person may cause discomfort or a reaction in another. Recipes should be adjusted only after considering individual dietary needs and tolerances."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Information concerning food sensitivities, intolerances, and ingredient alternatives is provided for general informational purposes only. It is not a substitute for individualized medical or dietary advice. Users should consult a qualified healthcare professional regarding personal dietary restrictions or reactions."],
      },
      {
        title: "3.3 Nutrition Information",
        simple: ["Calories, carbohydrates, protein, fat, sodium, and other nutrition numbers are estimates. Actual values depend on the exact ingredients, brands, portions, and preparation methods used."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Nutritional information may be calculated or estimated from available ingredient data and may not be independently verified. Actual nutritional values may vary because of product brands, substitutions, portion sizes, preparation methods, cooking losses, database differences, and manufacturer changes. No guarantee is made regarding the accuracy or completeness of nutritional information."],
      },
      {
        title: "3.4 Medical and Dietary Advice",
        simple: ["Robert’s Recipe Box provides cooking information, not medical care. A recipe should not replace advice from a doctor, registered dietitian, or other qualified professional."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Nothing on Robert’s Recipe Box is intended to diagnose, treat, cure, or prevent a disease or medical condition. Website content does not constitute medical, nutritional, therapeutic, or professional dietary advice. Users should consult an appropriately qualified healthcare provider before making decisions involving medical conditions, medications, allergies, weight management, or specialized diets."],
      },
      {
        title: "3.5 Special-Diet Descriptions",
        simple: ["Terms such as low-carb, high-protein, lower-sodium, diabetic-friendly, heart-healthy, gluten-free, or lighter may help describe a recipe, but they are not medical guarantees."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Dietary descriptions and category labels are general informational classifications and may not satisfy every medical, nutritional, religious, ethical, or personal dietary standard. Users are responsible for independently determining whether a recipe and its ingredients are appropriate for their requirements."],
      },
      {
        title: "3.6 Manufacturer Ingredient Changes",
        simple: ["Food companies sometimes change their recipes, packaging, serving sizes, nutrition facts, and allergen warnings without notice. Always check the current package."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Manufacturers and retailers may revise product formulations, packaging, nutrition information, serving sizes, allergen disclosures, warnings, and manufacturing processes at any time. Robert’s Recipe Box is not responsible for changes made by third parties or for product information that becomes outdated."],
      },
    ],
  },
  {
    title: "4. Costs, Products, Affiliates and Advertising",
    items: [
      {
        title: "4.1 Recipe Cost Estimates",
        simple: ["Recipe costs are intended to help visitors compare meals and make informed choices. They are estimates, not promises of what ingredients will cost at a particular store."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Ingredient costs, recipe totals, and per-serving calculations are estimates based on selected pricing assumptions. Actual costs may vary by location, retailer, brand, package size, season, availability, inflation, taxes, promotions, coupons, loyalty programs, and shopping practices. Robert’s Recipe Box does not guarantee that a recipe can be prepared for the stated amount."],
      },
      {
        title: "4.2 Product Recommendations",
        simple: ["Robert’s Recipe Box may suggest cookware, appliances, containers, ingredients, or tools that appear useful for a particular task. A recommendation does not guarantee that a product will be right for every user."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Product recommendations may reflect personal experience, research, publicly available information, manufacturer specifications, or practical observations available at the time of publication. A recommendation does not constitute a warranty or guarantee of quality, safety, performance, durability, suitability, or value. Users are responsible for evaluating products before purchasing or using them."],
      },
      {
        title: "4.3 Affiliate Links",
        simple: ["Some product links may earn Robert’s Recipe Box a commission when a purchase is made. This generally does not add a separate charge to the customer’s purchase."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Robert’s Recipe Box may participate in affiliate marketing programs and receive compensation from qualifying purchases made through designated links. Affiliate relationships will be disclosed as required. Visitors remain responsible for evaluating the product, seller, price, warranty, return policy, and suitability before purchasing.", "A short disclosure should also appear close to affiliate links or recommendations, such as:", "“I may earn a commission from purchases made through this link.”"],
      },
      {
        title: "4.4 Amazon Associates Disclosure",
        simple: ["Amazon product links may be used to help visitors locate recommended ingredients, cookware, storage products, appliances, and other kitchen items."],
        formalLabel: "Required Amazon disclosure:",
        formal: ["As an Amazon Associate I earn from qualifying purchases.", "This statement should be displayed clearly on the website whenever Robert’s Recipe Box actively participates in the Amazon Associates Program."],
      },
      {
        title: "4.5 Sponsored Content",
        simple: ["A manufacturer, retailer, advertiser, or other organization may occasionally pay for or support certain content."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Sponsored or paid content will be identified using reasonably clear language such as “Sponsored,” “Advertisement,” or “Paid Partnership.” Compensation does not guarantee a favorable opinion, review, rating, or recommendation."],
      },
      {
        title: "4.6 Free, Loaned or Discounted Products",
        simple: ["A product may occasionally be provided free, loaned, or sold at a discount for evaluation. That relationship will be disclosed when it could affect how a visitor considers the recommendation."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Receipt of a free, loaned, or discounted product does not guarantee publication or positive coverage. Robert’s Recipe Box will make reasonable efforts to disclose material relationships associated with product reviews or recommendations."],
      },
      {
        title: "4.7 Reviews, Testimonials and Individual Results",
        simple: ["A favorable review or testimonial reflects an individual experience. Another person may receive different performance, value, durability, or results."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Reviews, ratings, testimonials, and personal experiences do not guarantee that every user will receive the same or similar results. Robert’s Recipe Box does not guarantee that a testimonial is representative of the experience generally expected by all users."],
      },
      {
        title: "4.8 Prices and Availability",
        simple: ["Online prices, sales, shipping charges, and product availability can change quickly. A product may be unavailable or priced differently when its link is opened."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Prices, discounts, availability, delivery estimates, and promotions are controlled by third-party retailers and may change without notice. The retailer’s product page and checkout process control the final price, availability, taxes, delivery costs, and transaction details."],
      },
      {
        title: "4.9 Third-Party Retailers",
        simple: ["When a visitor leaves Robert’s Recipe Box and shops on another website, that company is responsible for the order, payment, shipping, return, warranty, and customer service."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Purchases made through third-party retailers are transactions between the purchaser and the retailer. Robert’s Recipe Box is not responsible for payment processing, order fulfillment, product condition, shipping, delivery, warranties, returns, refunds, privacy practices, customer service, or disputes involving third-party sellers."],
      },
      {
        title: "4.10 Editorial Independence",
        simple: ["Advertising and affiliate income may help support the website, but compensation does not automatically determine which products are recommended."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Robert’s Recipe Box aims to distinguish personal opinions from factual product information and to disclose material commercial relationships. Compensation does not create a guarantee of favorable editorial treatment."],
      },
    ],
  },
  {
    title: "5. Privacy, Cookies and Communications",
    items: [
      {
        title: "5.1 Information Visitors Provide",
        simple: ["Visitors may voluntarily provide information when sending a message, subscribing to updates, submitting a recipe or photograph, reporting a problem, requesting permission, or using another interactive feature."],
        formalLabel: "Formal privacy policy:",
        formal: ["Information voluntarily provided may include a name, email address, message, recipe, photograph, preferences, and any other information the visitor chooses to submit. Visitors should not send passwords, payment-card information, medical records, government identification numbers, or other highly sensitive information through a general website form or ordinary email."],
      },
      {
        title: "5.2 Information Collected Automatically",
        simple: ["Some technical information may be collected automatically when someone visits the website."],
        formalLabel: "Formal privacy policy:",
        formal: ["The website host, analytics providers, affiliate programs, advertising services, or other service providers may collect information such as an Internet Protocol address, browser type, device type, operating system, approximate location, referring page, pages viewed, links selected, access times, and general diagnostic information."],
      },
      {
        title: "5.3 Favorites, Meal Plans and Grocery Lists",
        simple: ["Favorites, pantry selections, meal plans, and grocery lists may be saved in the visitor’s browser or on the visitor’s device."],
        formalLabel: "Formal privacy policy:",
        formal: ["Locally stored information may not be transmitted to Robert’s Recipe Box. Clearing browser data, changing devices, reinstalling software, removing website permissions, or using private-browsing settings may delete saved information. Robert’s Recipe Box does not guarantee permanent storage or recovery of locally saved information."],
      },
      {
        title: "5.4 Cookies and Similar Technologies",
        simple: ["Cookies and browser storage can help the website remember preferences, operate features, understand general usage, and support affiliate links."],
        formalLabel: "Formal privacy policy:",
        formal: ["Robert’s Recipe Box and its service providers may use cookies, browser storage, pixels, tags, or similar technologies for website operation, preference storage, analytics, security, advertising, and affiliate tracking. Visitors may be able to block or delete these technologies through browser settings, but doing so may prevent some features from functioning properly.", "Where legally required, additional cookie choices or consent controls may be provided."],
      },
      {
        title: "5.5 How Information May Be Used",
        simple: ["Information may be used to answer questions, operate the website, provide requested communications, improve features, review submissions, and protect the website."],
        formalLabel: "Formal privacy policy:",
        formal: ["Information may be processed to respond to requests, maintain website functionality, provide requested emails, improve recipes and navigation, evaluate traffic, identify errors, prevent fraud or abuse, comply with legal obligations, and protect the rights, property, and safety of Robert’s Recipe Box and its visitors."],
      },
      {
        title: "5.6 Service Providers and Information Sharing",
        simple: ["Outside providers may help operate website hosting, analytics, email, security, forms, affiliate links, calendars, and other features."],
        formalLabel: "Formal privacy policy:",
        formal: ["Information may be disclosed to service providers when reasonably necessary to perform services for Robert’s Recipe Box. Information may also be disclosed with the visitor’s consent, in response to valid legal process, to investigate fraud or security concerns, to protect legal rights or safety, or in connection with a transfer or reorganization of the website.", "Robert’s Recipe Box does not sell personal information for money.", "If the website later begins an activity legally defined as selling or sharing personal data, the Privacy Policy and available choices will be updated as required."],
      },
      {
        title: "5.7 Email Communications",
        simple: ["Visitors who voluntarily subscribe may receive recipe updates, announcements, website news, or occasional promotional messages."],
        formalLabel: "Formal privacy policy:",
        formal: ["Marketing emails will provide a method for unsubscribing. Administrative responses may still be sent when necessary to answer a request or administer a feature. Robert’s Recipe Box will not request passwords, banking information, or complete payment-card details through ordinary email."],
      },
      {
        title: "5.8 Information Retention and Security",
        simple: ["Personal information will generally be kept only as long as reasonably necessary for the purpose for which it was collected."],
        formalLabel: "Formal privacy policy:",
        formal: ["Reasonable administrative, technical, and organizational precautions may be used to protect personal information. No website, email transmission, storage system, or internet connection can be guaranteed completely secure. Information may be retained as necessary to respond to requests, maintain appropriate records, resolve disputes, enforce policies, protect the website, or satisfy legal obligations."],
      },
      {
        title: "5.9 Privacy Rights and Requests",
        simple: ["Depending on where a visitor lives and which laws apply, the visitor may have rights concerning access, correction, deletion, portability, and certain uses of personal information."],
        formalLabel: "Formal privacy policy:",
        formal: ["Applicable privacy rights may include the right to confirm processing, request access, correct inaccuracies, request deletion, obtain certain information in a portable format, withdraw consent, opt out of certain activities, and appeal certain privacy-request decisions.", "Requests should be sent online to:", "recipes@handsontech.cc", "Robert’s Recipe Box may request reasonable information to verify the identity and authority of the person submitting the request. Information collected for verification will be used for that purpose."],
      },
      {
        title: "5.10 Texas Privacy Rights",
        simple: ["Texas residents may have rights under the Texas Data Privacy and Security Act when that law applies to the website and the information being processed."],
        formalLabel: "Formal privacy policy:",
        formal: ["Robert’s Recipe Box will respond to applicable Texas privacy requests in accordance with legal requirements. A Texas resident may submit a request or appeal a privacy decision by emailing recipes@handsontech.cc. Robert’s Recipe Box will not unlawfully discriminate against a visitor for exercising an applicable privacy right."],
      },
      {
        title: "5.11 Children’s Privacy",
        simple: ["Robert’s Recipe Box is intended for a general audience and is not directed to children under 13."],
        formalLabel: "Formal privacy policy:",
        formal: ["Robert’s Recipe Box does not knowingly request or collect personal information from children under 13. A parent or legal guardian who believes that a child has submitted personal information should contact recipes@handsontech.cc to request review and removal.", "Visitors under 13 should not submit forms, photographs, recipes, comments, account information, or other personal information. Teenagers should obtain permission from a parent or guardian before submitting content."],
      },
      {
        title: "5.12 Third-Party Websites and International Visitors",
        simple: ["Outside websites have their own privacy practices, and information submitted from outside the United States may be processed in the United States."],
        formalLabel: "Formal privacy policy:",
        formal: ["This Privacy Policy does not control the practices of retailers, manufacturers, social networks, analytics providers, embedded services, or other third parties. Visitors should review third-party privacy policies before providing information or completing a transaction.", "Robert’s Recipe Box is operated from Texas, United States. International visitors are responsible for determining whether use of the website is appropriate under the laws applicable to them."],
      },
    ],
  },
  {
    title: "6. Website Accuracy, Availability and External Information",
    items: [
      {
        title: "6.1 Informational Use",
        simple: ["The website is designed for general home-cooking, meal-planning, and educational use. It should be treated as a helpful resource rather than a professional service."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Content provided by Robert’s Recipe Box is for general informational and educational purposes only. The website does not provide professional culinary, medical, nutritional, legal, financial, engineering, repair, or safety services."],
      },
      {
        title: "6.2 Accuracy and Errors",
        simple: ["Reasonable care may be taken when preparing the website, but mistakes can happen. A recipe may contain a typo, missing step, incorrect number, or outdated detail."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Robert’s Recipe Box does not warrant that website content is complete, accurate, current, reliable, or free from errors or omissions. The website owner reserves the right to correct, revise, remove, or update content at any time without prior notice."],
      },
      {
        title: "6.3 No Guaranteed Results",
        simple: ["A recipe, meal plan, kitchen tool, or shopping suggestion may work well for one household and not for another."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Robert’s Recipe Box makes no express or implied guarantee regarding cooking results, financial savings, health outcomes, meal-planning success, product performance, user satisfaction, or any other result arising from use of or reliance on website content."],
      },
      {
        title: "6.4 External Links",
        simple: ["Some pages may link to outside websites for products, information, videos, or additional resources. Robert’s Recipe Box does not control those websites."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["External links are provided for convenience and informational purposes. Robert’s Recipe Box does not control, monitor, endorse, or accept responsibility for third-party content, security, availability, advertising, privacy practices, terms, products, or business operations."],
      },
      {
        title: "6.5 Website Availability",
        simple: ["The website may occasionally be updated, interrupted, changed, or unavailable. Certain recipes, downloads, or features may also be removed or replaced."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Robert’s Recipe Box does not guarantee continuous, uninterrupted, secure, or error-free access. Content, pages, downloads, services, and features may be modified, suspended, restricted, or discontinued at any time."],
      },
      {
        title: "6.6 Under-Construction Features",
        simple: ["Some pages and tools may still be under development and may contain temporary information or incomplete features."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Content identified as under construction, experimental, preliminary, in development, or coming soon may be incomplete, unavailable, inaccurate, or subject to substantial revision. Visitors should not rely on such content as final or fully functional."],
      },
      {
        title: "6.7 Changes to Website Content and Policies",
        simple: ["Recipes, policies, costs, nutrition estimates, recommendations, and website features may be revised as the site grows and changes."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Robert’s Recipe Box reserves the right to modify website content and policies at any time. Revised policies will be posted with an updated effective date when appropriate. Continued use after an update constitutes acceptance of the revised policies to the extent permitted by law."],
      },
      {
        title: "6.8 Geographic Limitations",
        simple: ["Product availability, measurements, terminology, ingredients, food-safety recommendations, and laws may differ outside the United States."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Website content is generally prepared from a United States perspective. Robert’s Recipe Box does not guarantee that its information, products, measurements, or recommendations are appropriate or legally available in every location."],
      },
    ],
  },
  {
    title: "7. Technology, Downloads and Automated Features",
    items: [
      {
        title: "7.1 Browser and Device Compatibility",
        simple: ["The website may display or operate differently depending on the browser, device, screen size, operating system, extensions, or software version."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Robert’s Recipe Box does not guarantee compatibility with every browser, device, operating system, accessibility setting, extension, or software configuration. Users are responsible for maintaining suitable devices, software, internet access, and security protections."],
      },
      {
        title: "7.2 Saved Information and Data Loss",
        simple: ["Favorites, meal plans, pantry selections, grocery lists, and other saved information may be lost because of browser settings, device changes, or technical problems."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Robert’s Recipe Box does not guarantee the availability, permanence, accuracy, recovery, or backup of user-created or locally stored information. Users should maintain separate copies of any information that is important to them."],
      },
      {
        title: "7.3 Automated Tools and Calculations",
        simple: ["Serving adjustments, grocery quantities, nutrition figures, costs, substitutions, and conversions are intended to save time, but automated results can contain errors."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Automated calculations and generated outputs may be incomplete, duplicated, outdated, rounded, or incorrect. Users must review results before shopping, cooking, changing a diet, purchasing a product, or otherwise relying upon them."],
      },
      {
        title: "7.4 Calendars and Reminders",
        simple: ["Calendar events, reminders, and meal-plan exports are provided for convenience. Visitors should confirm that the correct date, time, recipe, and reminder were saved."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Robert’s Recipe Box does not guarantee that calendar information will import, display, synchronize, or trigger correctly. The user is responsible for confirming dates, times, time zones, recurrence settings, reminders, and calendar synchronization."],
      },
      {
        title: "7.5 Printing and Formatting",
        simple: ["Printed recipe cards and guides may look different depending on the printer, paper, margins, scaling, ink, browser, and software settings."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Robert’s Recipe Box does not guarantee exact sizing, color reproduction, placement, compatibility, or print quality. Users should review print-preview settings before printing and are responsible for paper, ink, equipment, and printing costs."],
      },
      {
        title: "7.6 Downloaded Files and Harmful Code",
        simple: ["Downloads are provided for convenience and should be opened only on devices with appropriate security protections."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Although reasonable precautions may be taken, Robert’s Recipe Box does not guarantee that every page, file, link, download, or third-party service will always be free from defects, interruption, viruses, malware, or other harmful code. Users assume responsibility for device security and file compatibility."],
      },
      {
        title: "7.7 Third-Party Technology",
        simple: ["The website may rely on hosting providers, analytics services, calendars, email tools, retailers, embedded media, and other outside technology."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["The performance, availability, security, and continued operation of third-party technology are controlled by the relevant provider. Robert’s Recipe Box is not responsible for interruptions, changes, errors, or losses caused by a third-party service."],
      },
    ],
  },
  {
    title: "8. Ownership and Permitted Use",
    items: [
      {
        title: "8.1 Free Personal Use",
        simple: ["Visitors may view, print, and download designated Robert’s Recipe Box recipes for their own household and personal cooking needs."],
        formalLabel: "Formal policy:",
        formal: ["Visitors receive a limited, nonexclusive, revocable right to view, print, and download designated materials for lawful personal and noncommercial use. This permission does not transfer ownership or grant commercial-use rights."],
      },
      {
        title: "8.2 Commercial Use and Redistribution",
        simple: ["Free personal use does not mean that recipe cards, photographs, website designs, or downloads can be sold, repackaged, or posted elsewhere as someone else’s work."],
        formalLabel: "Formal policy:",
        formal: ["Without prior written permission, website content may not be sold, licensed, reproduced in bulk, republished, redistributed, altered for resale, incorporated into commercial products, or used to create a competing recipe collection."],
      },
      {
        title: "8.3 Copyright and Website Content",
        simple: ["Individual ingredients and familiar cooking methods may be widely used, but the website’s original wording, organization, photographs, graphics, and recipe-card designs belong to Robert’s Recipe Box to the extent protected by law."],
        formalLabel: "Formal policy:",
        formal: ["Original text, photographs, illustrations, graphics, page layouts, recipe-card designs, compilations, downloads, and branding published on Robert’s Recipe Box are protected by applicable intellectual-property laws to the extent those laws apply. No rights are granted except those expressly stated in these policies."],
      },
      {
        title: "8.4 Trademarks and Brand Names",
        simple: ["Product, restaurant, and company names may be mentioned to identify a flavor, ingredient, product, or style. Those names belong to their respective owners."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Third-party trademarks, service marks, product names, restaurant names, logos, and brand references remain the property of their respective owners. Their appearance on Robert’s Recipe Box is for identification or descriptive purposes and does not imply sponsorship, affiliation, authorization, or endorsement."],
      },
      {
        title: "8.5 Copycat-Style Recipes",
        simple: ["A copycat-style recipe is an independent attempt to create a similar flavor or experience. It is not the restaurant’s or manufacturer’s official recipe."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Copycat-style, inspired-by, or restaurant-style recipes are independent interpretations and are not represented as official, authentic, proprietary, or authorized recipes of a restaurant, manufacturer, chef, or trademark owner."],
      },
      {
        title: "8.6 Printing and Downloads",
        simple: ["Downloads may be used for personal cooking, planning, and household reference, but the files may not be resold or redistributed as a separate collection."],
        formalLabel: "Formal policy:",
        formal: ["Users may retain reasonable personal copies of designated downloads. Branding and ownership notices may not be removed for redistribution, and files may not be uploaded to another public recipe library or commercial platform without written permission."],
      },
      {
        title: "8.7 Permission Requests",
        simple: ["Schools, nonprofit groups, senior organizations, cooking clubs, and community programs may request permission for uses beyond ordinary personal use."],
        formalLabel: "Formal policy:",
        formal: ["Permission requests should identify the requested material, proposed use, number of copies, organization, distribution method, and whether a fee will be charged. Requests should be sent to recipes@handsontech.cc. Permission is not granted unless provided in writing."],
      },
    ],
  },
  {
    title: "9. User Submissions and Community Features",
    items: [
      {
        title: "9.1 Ownership and Permission",
        simple: ["Visitors should submit only recipes, photographs, comments, and other material they created or have permission to share."],
        formalLabel: "Formal policy:",
        formal: ["By submitting material, the submitter represents that the material does not violate copyright, trademark, privacy, publicity, contractual, or other rights and that the submitter has authority to grant the permissions described in this policy."],
      },
      {
        title: "9.2 Submitted Recipes",
        simple: ["A submitted recipe should contain enough accurate information to allow it to be reviewed and should identify important allergens, equipment, safety concerns, and whether the recipe has been tested."],
        formalLabel: "Formal policy:",
        formal: ["Robert’s Recipe Box may review, rewrite, reorganize, shorten, expand, test, illustrate, photograph, publish, decline, or remove a submitted recipe. Submission does not guarantee publication, compensation, attribution in a particular format, or continued availability."],
      },
      {
        title: "9.3 Submitted Photographs",
        simple: ["The submitter must have the right to use each submitted photograph and permission from identifiable people appearing in it."],
        formalLabel: "Formal policy:",
        formal: ["The submitter is responsible for obtaining appropriate permission from identifiable individuals or, when applicable, the parent or guardian of a minor. Photographs should not display unnecessary addresses, documents, account information, license plates, or other private details."],
      },
      {
        title: "9.4 License to Use Submissions",
        simple: ["Submitters retain whatever ownership rights they legally hold, but Robert’s Recipe Box needs permission to review, edit, display, and promote material submitted for publication."],
        formalLabel: "Formal policy:",
        formal: ["By submitting material for possible publication, the submitter grants Robert’s Recipe Box a nonexclusive, worldwide, royalty-free license to review, reproduce, edit, format, adapt, display, publish, distribute, archive, and promote the material in connection with the website and related communications."],
      },
      {
        title: "9.5 Community Conduct",
        simple: ["Comments and community features should remain helpful, respectful, lawful, and relevant to cooking and the website."],
        formalLabel: "Formal policy:",
        formal: ["Users may not submit harassment, threats, hate speech, discrimination, defamation, obscene material, dangerous instructions, deliberately deceptive claims, spam, malware, undisclosed advertising, private personal information, or infringing content."],
      },
      {
        title: "9.6 Moderation and Removal",
        simple: ["Robert’s Recipe Box may edit, decline, hide, or remove user-submitted material when necessary to maintain the website."],
        formalLabel: "Formal policy:",
        formal: ["Robert’s Recipe Box reserves the right, but does not assume an obligation, to review, moderate, reject, edit, restrict, or remove submissions at any time. Publication does not guarantee a submission’s accuracy, originality, safety, or suitability."],
      },
      {
        title: "9.7 Accuracy of User Contributions",
        simple: ["A recipe or suggestion submitted by another visitor may not have been independently tested or verified."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Robert’s Recipe Box does not guarantee the accuracy, originality, completeness, safety, or reliability of user-submitted content. Visitors who choose to use a submission do so at their own discretion and remain responsible for evaluating it."],
      },
      {
        title: "9.8 Privacy of Submissions",
        simple: ["Information intended for publication may become publicly visible. Do not submit anything that should remain confidential."],
        formalLabel: "Formal policy:",
        formal: ["Contact information supplied privately for administrative purposes will be handled under the Privacy Policy. Names, biographies, recipes, photographs, comments, and other information intended for publication may become publicly accessible."],
      },
      {
        title: "9.9 Copyright Concerns",
        simple: ["A person who believes that material on Robert’s Recipe Box infringes a copyright may report it for review."],
        formalLabel: "Formal policy:",
        formal: ["A copyright complaint should identify the copyrighted work, identify the material in question, provide the complaining party’s contact information, explain the basis of the complaint, confirm that the supplied information is accurate, and include a physical or electronic signature.", "Copyright concerns should be sent to:", "recipes@handsontech.cc", "Credible complaints may result in temporary or permanent removal while the matter is reviewed."],
      },
    ],
  },
  {
    title: "10. Accessibility",
    items: [
      {
        title: "10.1 Accessibility Commitment",
        simple: ["Robert’s Recipe Box wants its recipes, planning tools, downloads, and supporting information to be usable by as many people as reasonably possible."],
        formalLabel: "Formal accessibility policy:",
        formal: ["The website will make reasonable ongoing efforts to improve accessibility and usability for people using different devices, input methods, display settings, and assistive technologies."],
      },
      {
        title: "10.2 Accessibility Practices",
        simple: ["The website aims to use clear headings, readable type, keyboard-accessible controls, useful image descriptions, visible focus indicators, and understandable links and buttons."],
        formalLabel: "Formal accessibility policy:",
        formal: ["Robert’s Recipe Box will work toward practices consistent with WCAG 2.2 Level AA where reasonably applicable, including text alternatives, keyboard access, sufficient contrast, responsive layouts, understandable controls, form labels, accessible accordions, and reduced reliance on color alone."],
      },
      {
        title: "10.3 Accessibility Limitations",
        simple: ["Some older recipe-card images, downloads, third-party pages, embedded content, archived materials, and experimental features may not yet be fully accessible."],
        formalLabel: "Formal accessibility policy:",
        formal: ["This statement describes an ongoing goal and does not guarantee that every page, image, download, document, or third-party feature will satisfy every accessibility guideline at all times. Robert’s Recipe Box does not control the accessibility of outside websites."],
      },
      {
        title: "10.4 Accessibility Assistance",
        simple: ["Visitors who have difficulty accessing a recipe, download, form, or feature may request assistance or an alternative format."],
        formalLabel: "Formal accessibility policy:",
        formal: ["Accessibility concerns should identify the relevant page or recipe, describe the problem, identify the browser or device when known, and explain the requested assistance.", "Requests should be sent to:", "recipes@handsontech.cc", "Reasonable efforts will be made to understand and address reported barriers."],
      },
    ],
  },
  {
    title: "11. Responsibility and Limitation of Liability",
    items: [
      {
        title: "11.1 User Responsibility",
        simple: ["Every kitchen, household, diet, and situation is different. Users must decide whether a recipe, ingredient, product, or cooking method is appropriate for them."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Use of Robert’s Recipe Box is voluntary and at the user’s discretion and risk. Users are responsible for evaluating all recipes, ingredients, instructions, appliances, products, downloads, and recommendations in light of their abilities, dietary requirements, health conditions, household circumstances, and equipment."],
      },
      {
        title: "11.2 Assumption of Risk",
        simple: ["Cooking naturally involves heat, sharp objects, electricity, raw ingredients, heavy cookware, outdoor equipment, and other hazards."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["By using website content, users acknowledge and accept the ordinary and foreseeable risks associated with cooking, food preparation, appliances, knives, heat sources, grills, smokers, electrical equipment, food storage, and food consumption."],
      },
      {
        title: "11.3 No Professional Relationship",
        simple: ["Visiting the website, sending a message, or using a recipe does not create a professional or advisory relationship."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["No physician-patient, dietitian-client, attorney-client, consultant-client, fiduciary, contractual, or other professional relationship is created solely by accessing the website, submitting a question, or using website content."],
      },
      {
        title: "11.4 Limitation of Liability",
        simple: ["Robert’s Recipe Box provides information and suggestions but cannot be responsible for every decision, action, or result that occurs after someone uses the website."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["To the fullest extent permitted by applicable law, Robert’s Recipe Box and its owner shall not be liable for direct, indirect, incidental, consequential, special, exemplary, punitive, or other damages arising from use of, inability to use, or reliance upon website content.", "This limitation includes, without limitation, personal injury, allergic reaction, illness, foodborne illness, property damage, equipment damage, financial loss, data loss, missed reminders, product problems, or unsatisfactory cooking results.", "Where a limitation is not legally permitted, liability will be limited only to the extent allowed by applicable law."],
      },
      {
        title: "11.5 Children in the Kitchen",
        simple: ["Children should receive appropriate adult supervision when cooking, especially around knives, hot surfaces, appliances, grills, and raw ingredients."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Recipes and website content do not replace responsible adult supervision. Parents, guardians, and supervising adults are solely responsible for determining which activities are appropriate for a child and for providing supervision, instruction, and safety precautions."],
      },
      {
        title: "11.6 Emergency and Professional Assistance",
        simple: ["The website should never be used during an emergency instead of contacting the appropriate professional or emergency service."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Robert’s Recipe Box is not an emergency, medical, poison-control, fire-safety, appliance-repair, or professional advisory service. In the event of suspected poisoning, allergic reaction, fire, gas leak, electrical problem, serious injury, foodborne illness, or other emergency, users should contact the appropriate emergency service or qualified professional immediately."],
      },
      {
        title: "11.7 Indemnification",
        simple: ["Visitors are expected to use the website responsibly and legally. A person who misuses the website should not transfer the consequences of that misuse to Robert’s Recipe Box."],
        formalLabel: "Formal policy:",
        formal: ["To the extent permitted by applicable law, users agree to indemnify and hold harmless Robert’s Recipe Box and its owner from claims, liabilities, damages, losses, costs, or expenses arising from misuse of the website, violation of these policies, infringement of another party’s rights, a user submission, or unlawful use or redistribution of website content."],
      },
    ],
  },
  {
    title: "12. Website Administration and Communications",
    items: [
      {
        title: "12.1 Contact-Form and Email Responses",
        simple: ["Visitors are welcome to submit questions, corrections, and suggestions, but a response cannot be guaranteed."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Submitting a message does not guarantee a response, a particular response time, publication, individualized advice, or acceptance of a request. Messages may be prioritized, archived, or declined at the website owner’s discretion."],
      },
      {
        title: "12.2 Unsolicited Ideas and Proposals",
        simple: ["Visitors should not submit confidential business ideas, proprietary product concepts, or other information they expect to remain confidential."],
        formalLabel: "Formal policy:",
        formal: ["Unless a separate written confidentiality agreement exists, unsolicited ideas, suggestions, recipes, product concepts, and business proposals will not be treated as confidential or proprietary. Submission does not create an obligation to compensate, develop, publish, or use the idea."],
      },
      {
        title: "12.3 Website Ownership Changes",
        simple: ["The website or its related operations may eventually be transferred, reorganized, sold, or discontinued."],
        formalLabel: "Formal policy:",
        formal: ["Website content, agreements, information, and operational responsibilities may be transferred as part of a sale, succession, merger, reorganization, or other transfer, subject to applicable legal requirements."],
      },
      {
        title: "12.4 Suspension or Termination of Access",
        simple: ["Access may be restricted when someone misuses the website or threatens its security, operation, or users."],
        formalLabel: "Formal policy:",
        formal: ["Robert’s Recipe Box may restrict or terminate access to the website or a particular feature when reasonably necessary to prevent fraud, abuse, unlawful conduct, intellectual-property violations, security threats, or violations of these policies."],
      },
      {
        title: "12.5 Events Outside Reasonable Control",
        simple: ["Website operation may be affected by storms, utility failures, service-provider outages, equipment failures, government actions, security events, or other circumstances outside reasonable control."],
        formalLabel: "Formal policy and disclaimer:",
        formal: ["Robert’s Recipe Box is not responsible for delay, interruption, loss, or failure caused by events beyond its reasonable control, including natural disasters, utility failures, labor disputes, internet outages, third-party service failures, cyberattacks, government actions, or equipment failures."],
      },
    ],
  },
  {
    title: "13. General Legal Terms",
    items: [
      {
        title: "13.1 Governing Law",
        simple: ["Robert’s Recipe Box is operated from Texas."],
        formalLabel: "Formal policy:",
        formal: ["These policies and use of the website are intended to be governed by the laws of the State of Texas, without regard to conflict-of-law principles, except where another law is required to apply."],
      },
      {
        title: "13.2 Legal Venue",
        simple: ["Most concerns should first be submitted directly to Robert’s Recipe Box so there is an opportunity to review and address them."],
        formalLabel: "Formal policy:",
        formal: ["Unless applicable law requires otherwise, legal proceedings concerning the website shall be brought in a court of competent jurisdiction located in Texas.", "These policies do not require private arbitration and do not contain a class-action waiver."],
      },
      {
        title: "13.3 Severability",
        simple: ["If one part of these policies cannot legally be enforced, the remaining sections should continue to apply."],
        formalLabel: "Formal policy:",
        formal: ["If any provision is held invalid, unlawful, or unenforceable, that provision will be limited or removed to the minimum extent necessary, and the remaining provisions will remain in effect."],
      },
      {
        title: "13.4 No Waiver",
        simple: ["A decision not to enforce a rule on one occasion does not permanently remove the right to enforce it later."],
        formalLabel: "Formal policy:",
        formal: ["Failure to enforce a provision does not constitute a waiver of that provision or any other right."],
      },
      {
        title: "13.5 Assignment",
        simple: ["Visitors may not transfer their rights under these policies to another party without permission."],
        formalLabel: "Formal policy:",
        formal: ["Robert’s Recipe Box may assign or transfer its rights and responsibilities in connection with a transfer, succession, reorganization, or sale of the website or related operations."],
      },
      {
        title: "13.6 Entire Agreement",
        simple: ["The policies published on the website work together and form the general rules governing use of Robert’s Recipe Box."],
        formalLabel: "Formal policy:",
        formal: ["This page, together with any feature-specific notices or agreements, constitutes the general agreement concerning website use and supersedes prior general statements covering the same subject."],
      },
      {
        title: "13.7 Changes to These Policies",
        simple: ["These policies may need to change as the website adds features, affiliate programs, community tools, or outside services."],
        formalLabel: "Formal policy:",
        formal: ["Revised policies may be published at any time with an updated effective date. Material changes may also be highlighted when appropriate. Continued use of the website after an update constitutes acceptance of the revised policies to the extent permitted by law."],
      },
      {
        title: "13.8 Acceptance of Policies",
        simple: ["By continuing to use Robert’s Recipe Box, visitors acknowledge that they have had an opportunity to read these policies."],
        formalLabel: "Formal policy:",
        formal: ["Access to or use of Robert’s Recipe Box constitutes acknowledgment and acceptance of these policies to the extent permitted by applicable law. Visitors who do not agree should discontinue use of the website."],
      },
    ],
  },
  {
    title: "14. Contact Information",
    items: [
      {
        title: "14.1 Website Contact",
        simple: ["Robert’s Recipe Box operates online. Questions, corrections, permission requests, privacy requests, accessibility concerns, copyright notices, and other website communications should be submitted by email.", "Robert’s Recipe Box", "Email: recipes@handsontech.cc", "Mailing address: 2310 Trotter Drive, Katy, Texas 77493", "Operations: Online only"],
        formalLabel: "Formal contact policy:",
        formal: ["Electronic requests and inquiries should be submitted to recipes@handsontech.cc. Providing a mailing address does not establish a public office, retail location, customer-service counter, or location open to visitors."],
      },
      {
        title: "14.2 Policy Effective Date",
        simple: ["These policies are effective beginning July 1, 2026."],
        formalLabel: "Formal policy:",
        formal: ["The effective date shown at the top of this page identifies the current published version. Visitors should review the page periodically for updates."],
      },
    ],
  },
];

const DISCLAIMER_PAGE_INTRO = ["Robert’s Recipe Box is intended to make cooking, meal planning, and finding useful kitchen information easier and more enjoyable. This page explains the policies, responsibilities, limitations, privacy practices, and permitted uses associated with the website.", "Each numbered topic may be displayed as an expandable section. Select any topic to read its complete explanation.", "Use of Robert’s Recipe Box constitutes acknowledgment of these policies to the extent permitted by applicable law. Visitors who do not agree with these policies should discontinue use of the website."];

function DisclaimersPage({ setActivePage }) {
  const [openDisclaimerSections, setOpenDisclaimerSections] = useState(() => new Set(["1. Recipes and Website Content"]));

  function toggleDisclaimerSection(sectionTitle) {
    setOpenDisclaimerSections((current) => {
      const next = new Set(current);
      if (next.has(sectionTitle)) {
        next.delete(sectionTitle);
      } else {
        next.add(sectionTitle);
      }
      return next;
    });
  }

  return (
    <main className="pageShell disclaimersAccordionPage">
      <section className="disclaimersIntroCard">
        <div className="aiBadge">POLICIES, DISCLAIMERS & LEGAL INFORMATION</div>
        <h1>Disclaimers</h1>
        <p className="disclaimerEffectiveDate">Effective date: July 1, 2026</p>
        {DISCLAIMER_PAGE_INTRO.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </section>

      <section className="disclaimerAccordionList" aria-label="Policy and disclaimer topics">
        {DISCLAIMER_ACCORDION_SECTIONS.map((section) => {
          const isOpen = openDisclaimerSections.has(section.title);

          return (
            <article className="disclaimerAccordionSection" key={section.title}>
              <button
                type="button"
                className="disclaimerAccordionTrigger"
                onClick={() => toggleDisclaimerSection(section.title)}
                aria-expanded={isOpen}
              >
                <span>{section.title}</span>
                <span className="disclaimerAccordionArrow" aria-hidden="true">
                  {isOpen ? "▾" : "▸"}
                </span>
              </button>

              {isOpen && (
                <div className="disclaimerAccordionPanel">
                  {section.items.map((item) => (
                    <section className="disclaimerSubsection" key={item.title}>
                      <h2>{item.title}</h2>

                      <div className="disclaimerExplanationBlock simple">
                        {item.simple.map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))}
                      </div>

                      <div className="disclaimerExplanationBlock formal">
                        <h3>{item.formalLabel}</h3>
                        {item.formal.map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}





function CollectionDetailPage({
  title,
  text,
  setActivePage,
  recipes: classifiedRecipes = [],
  favorites = [],
  toggleFavorite = () => {},
  addToPlan = () => {},
  openRecipeCard = () => {},
}) {
  const collectionRecipes = classifiedRecipes.filter((recipe) =>
    recipeMatchesCollection(recipe, title)
  );

  return (
    <main className="pageShell aboutRecipesPage collectionDetailPage">
      <section className="aboutRecipesHero">
        <div>
          <div className="aiBadge">RECIPE COLLECTION</div>
          <h1>{title}</h1>
          <p>{text}</p>
        </div>
      </section>

      {collectionRecipes.length ? (
        <div className="recipeGrid browseRecipeGrid collectionRecipeGrid">
          {collectionRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              addToPlan={addToPlan}
              openRecipeCard={openRecipeCard}
              cardList={collectionRecipes}
              viewerContext={title}
              displayMode="card"
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={`No recipes assigned to ${title} yet`}
          text="Open the Admin Recipe Classification page and check this collection for the recipes you want displayed here."
        />
      )}

      <div className="aboutRecipesActions">
        <button className="primary" onClick={() => setActivePage("Recipes")}>
          Browse Our Recipe Library
        </button>
        <button className="secondary" onClick={() => setActivePage("Admin Recipes")}>
          Open Admin Classifier
        </button>
        <button className="secondary" onClick={() => setActivePage("Meal Planner")}>
          Plan Your Meals
        </button>
        <button className="secondary" onClick={() => setActivePage("Home")}>
          Return Home
        </button>
      </div>
    </main>
  );
}

function FeatureStrip() {
  const features = [
    {
      title: "AI-Powered Recipes",
      text: "AI recipe ideas inspired by popular internet cuisines.",
    },
    {
      title: "Easy Meal Planning",
      text: "Build your own personal weekly meal plans for 2–6.",
    },
    {
      title: "Smart Shopping List",
      text: "Create custom shopping lists from your private meal plan.",
    },
    {
      title: "Smart Grocery Picks",
      text: "Review lighter, lower-carb grocery swaps before shopping.",
    },
    {
      title: "Recommendations",
      text: "Fun & handy kitchen products to help keep you organized.",
    },
  ];

  return (
    <section className="featureStrip">
      {features.map((feature) => (
        <div className="featureCard" key={feature.title}>
          <div className="featureCardHeader">
            <strong>{feature.title}</strong>
          </div>
          <small>{feature.text}</small>
        </div>
      ))}
    </section>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState("Home");
  const [favorites, setFavorites] = useState(() => {
    const storedFavorites = loadJSON(STORAGE_KEYS.favorites, []);
    return Array.isArray(storedFavorites) ? storedFavorites : [];
  });
  const [plan, setPlan] = useState(() =>
    normalizeTwoWeekPlan(loadJSON(STORAGE_KEYS.plan, emptyTwoWeekPlan()))
  );
  const [servings, setServings] = useState(() =>
    loadJSON(STORAGE_KEYS.servings, 4)
  );
  const [checked, setChecked] = useState(() =>
    loadJSON(STORAGE_KEYS.checked, {})
  );
  const [pantry, setPantry] = useState(() =>
    loadJSON(STORAGE_KEYS.pantry, {})
  );
  const [refrigerator, setRefrigerator] = useState(() =>
    normalizeRefrigeratorState(loadJSON(STORAGE_KEYS.refrigerator, { items: {}, customItems: [] }))
  );
  const [freezer, setFreezer] = useState(() =>
    normalizeFreezerState(loadJSON(STORAGE_KEYS.freezer, { items: {}, customItems: [], customLocations: [] }))
  );
  const [filter, setFilter] = useState("");
  const [cardViewer, setCardViewer] = useState(null);
  const [recipeClassifications, setRecipeClassifications] = useState(() =>
    loadRecipeClassifications()
  );

  const classifiedRecipes = useMemo(
    () => mergeRecipeClassifications(recipes, recipeClassifications),
    [recipeClassifications]
  );

  useEffect(() => saveJSON(STORAGE_KEYS.favorites, favorites), [favorites]);
  useEffect(() => saveJSON(STORAGE_KEYS.plan, plan), [plan]);
  useEffect(() => saveJSON(STORAGE_KEYS.servings, servings), [servings]);
  useEffect(() => saveJSON(STORAGE_KEYS.checked, checked), [checked]);
  useEffect(() => saveJSON(STORAGE_KEYS.pantry, pantry), [pantry]);
  useEffect(() => saveJSON(STORAGE_KEYS.refrigerator, refrigerator), [refrigerator]);
  useEffect(() => saveJSON(STORAGE_KEYS.freezer, freezer), [freezer]);
  useEffect(
    () => saveRecipeClassifications(recipeClassifications),
    [recipeClassifications]
  );

  useEffect(() => {
    const preloadAllSupportingHeroes = () => {
      SUPPORTING_PAGE_HERO_IMAGES.forEach((imagePath, index) => {
        window.setTimeout(() => preloadHeroImage(imagePath, "low"), index * 45);
      });
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(preloadAllSupportingHeroes, {
        timeout: 1600,
      });
      return () => window.cancelIdleCallback?.(idleId);
    }

    const timer = window.setTimeout(preloadAllSupportingHeroes, 800);
    return () => window.clearTimeout(timer);
  }, []);

  function toggleFavorite(id) {
    if (!id) return;
    setFavorites((current) => {
      const safeCurrent = Array.isArray(current) ? current : [];
      return safeCurrent.includes(id)
        ? safeCurrent.filter((item) => item !== id)
        : [...safeCurrent, id];
    });
  }

  function addToPlan(recipeId) {
    setPlan((current) => {
      const next = normalizeTwoWeekPlan(current);
      const firstOpenSlot =
        PLANNER_SLOTS.find((slot) => (next[slot.key] || []).length === 0)?.key ||
        "week1-Mon";

      next[firstOpenSlot] = [...(next[firstOpenSlot] || []), recipeId];
      return next;
    });

    setActivePage("Meal Planner");
  }

  function openRecipeCard(recipeId, sourceRecipes = recipes, context = "") {
    setCardViewer({
      recipeId,
      recipeIds: sourceRecipes.map((recipe) => recipe.id),
      context,
    });
  }

  const pageProps = {
    favorites,
    toggleFavorite,
    addToPlan,
    openRecipeCard,
    setActivePage,
    setFilter,
    filter,
    plan,
    setPlan,
    servings,
    setServings,
    checked,
    setChecked,
    pantry,
    setPantry,
    refrigerator,
    setRefrigerator,
    freezer,
    setFreezer,
    classifiedRecipes,
  };

  return (
    <PageNavigationContext.Provider value={{ activePage, setActivePage }}>
      <div className="app">
        <Header activePage={activePage} setActivePage={setActivePage} />

      {activePage === "Admin Recipes" && (
        <AdminRecipeClassifier
          recipes={recipes}
          categories={categories}
          classifications={recipeClassifications}
          setClassifications={setRecipeClassifications}
          onClose={() => setActivePage("Home")}
        />
      )}

      {activePage === "Home" && <Home {...pageProps} />}
      {activePage === "Contact Me" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-page-connect.png"
            alt="Contact cards, notebook, recipe box, plant, measuring spoons, and coffee on a pale kitchen surface"
            eyebrow="ABOUT US"
            title="Contact Me"
            text="Have a question about the website, a suggestion for a new feature, or an idea for a recipe you would like to see? You are always welcome to send me a message. Feedback from visitors helps me understand what is useful and what could be improved.\n\nYou may also contact me about corrections, technical problems, family-recipe submissions, or general questions about Robert’s Recipe Box. I may not have every answer, but I will do my best to respond and help."
          />
          <PlaceholderInfoPage
            eyebrow="ABOUT US"
            title="Contact Me"
            text="This page will include a simple way to contact Robert about recipe ideas, corrections, suggestions, or questions about Robert’s Recipe Box."
            setActivePage={setActivePage}
            recipes={classifiedRecipes}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            addToPlan={addToPlan}
            openRecipeCard={openRecipeCard}
          />
        </>
      )}
      {activePage === "Free To Use" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-page-free-to-use.jpg"
            alt="Free to use recipe planning setup with chicken dinner, recipe box, recipe plan clipboard, and notebook"
            eyebrow="OUR RECIPES"
            title="Free To Use, Print or Download"
            text="The recipes on this website are provided for personal use at no charge. You may read them online, print copies for your kitchen, download recipe cards, or save your favorites so they are easier to find the next time you need them.\n\nThe purpose of the site is to make practical cooking information accessible and convenient. Use the recipes in the way that best fits your household, and feel free to make reasonable adjustments for taste, portion size, equipment, or available ingredients."
            className="pageHeroDepth464"
/>
          <PlaceholderInfoPage
            eyebrow="OUR RECIPES"
            title="Free To Use, Print or Download"
            text="Robert’s Recipe Box is free to use. Recipes, cards, meal-planning ideas, shopping-list tools, and practical information are intended to remain available without a subscription."
            setActivePage={setActivePage}
            recipes={classifiedRecipes}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            addToPlan={addToPlan}
            openRecipeCard={openRecipeCard}
          />
        </>
      )}
      {activePage === "Dinner Combinations" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-page-complete-dinners.jpg"
            alt="Complete dinner setup with steak, sides, recipe box, clipboard, and iced tea"
            eyebrow="COLLECTIONS"
            title="Dinner Combinations"
            text="These dinner combinations are designed to help you quickly choose practical meals with a main dish, sides, portion guidance, and estimated nutrition. They can be used for weekly planning, freezer meal prep, or simple dinner ideas for smaller households.\n\nNutrition values are estimates and may vary based on brands, portions, and preparation methods."
            className="pageHeroDepth464"
          />
          <DinnerCombinationsPage setActivePage={setActivePage} setFilter={setFilter} setPlan={setPlan} openRecipeCard={openRecipeCard} />
        </>
      )}
      {activePage === "Crockpot Recipes" && (
        <HeroTopicPage
          eyebrow="COOKING METHODS"
          title="Crockpot Recipes"
          heroImage="images/heroes/hero-page-crockpot.jpg"
          heroAlt="Crockpot with slow-cooked meal, checklist, notebook, coffee, and potted plant"
          text="The Crockpot is one of the easiest ways to prepare a comforting meal with limited last-minute work. Ingredients can often be assembled earlier in the day, leaving the slow cooker to gently cook meats, vegetables, sauces, soups, or stews.\n\nThese recipes are designed for convenience, tenderness, and dependable flavor. They are useful for busy weekdays, make-ahead meals, larger portions, and dishes that improve as the ingredients slowly cook together."
          setActivePage={setActivePage}
        />
      )}
      {activePage === "Grilling Tips" && (
        <HeroTopicPage
          eyebrow="TIPS & ORGANIZATION"
          title="Tips: Grilling"
          heroImage="images/heroes/hero-grill.png"
          heroAlt="Gas grill with grilled meats and vegetables"
          text="Successful grilling begins before the food reaches the cooking grate. Preparation, preheating, clean grates, correct heat zones, and a basic understanding of timing can make a noticeable difference in the finished meal.\n\nThese tips cover direct and indirect cooking, flare-ups, turning, marinades, safe internal temperatures, resting, and other common questions. The goal is to help you grill more confidently and produce consistent results."
          setActivePage={setActivePage}
        />
      )}
      {activePage === "Reference Guides" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-page-reference-guides.jpg"
            alt="Kitchen reference guides setup with measuring cups, conversion chart, cookbooks, and utensils"
            eyebrow="TIPS & ORGANIZATION"
            title="Reference Guides"
            text="Cooking often involves small questions that are difficult to remember in the middle of preparing a meal. Reference guides provide quick answers for measurements, temperatures, storage times, substitutions, portions, equipment, and common cooking terms.

These pages are designed to be easy to scan, print, or revisit when needed. They can serve as a practical kitchen reference without requiring you to search through a long article for one simple answer."
            className="pageHeroDepth464"
          />
          <ReferenceGuidesPage />
        </>
      )}

      {activePage === "Disclaimers" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-page-disclaimers.jpg"
            alt="Disclaimer page setup with disclaimer notebook, glasses, scales, recipe box, and clipboard"
            eyebrow="ABOUT US"
            title="Disclaimers"
            text="Every website needs a little fine print, even one devoted to recipes and home cooking. This section explains the general terms, privacy information, nutritional limitations, affiliate disclosures, copyright details, and other policies connected with using Robert’s Recipe Box.\n\nThe goal is not to make the site feel complicated. These notices simply explain what visitors should know, how certain information is handled, and where personal judgment or professional advice may still be needed."
            className="pageHeroDepth464"
/>
          <DisclaimersPage setActivePage={setActivePage} />
        </>
      )}
      {activePage === "Under Construction" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-page-construction.jpg"
            alt="Under construction page setup with hard hat, construction sign, recipe box, and notebook"
            eyebrow="ABOUT US"
            title="Under Construction"
            text="This section of Robert’s Recipe Box is still being planned, written, tested, or assembled. Some pages may be incomplete while new recipes, tools, images, and features are being added to the website.\n\nPlease check back again as the site continues to grow. The goal is to build each section carefully rather than rush unfinished material online, so some areas may take a little longer to complete."
            className="pageHeroDepth464"
/>
          <UnderConstructionPage setActivePage={setActivePage} />
        </>
      )}
      {activePage === "Recipes" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-page-browse-recipes.jpg"
            alt="Browse recipes setup with recipe box, pasta dish, salad, notebook, and recipe category clipboard"
            eyebrow="OUR RECIPES"
            title="Browse Our Recipe Library"
            text="Explore the Robert’s Recipe Box library and find something that sounds good for your next meal. Recipes can be discovered through categories, collections, cooking methods, meal types, seasonal ideas, and other helpful groupings.\n\nWhether you already know exactly what you want or are simply browsing for inspiration, the library is designed to make it easier to compare choices. New recipes and collections will continue to be added as the website grows."
            className="pageHeroDepth464"
/>
          <RecipesPage {...pageProps} />
        </>
      )}
      {activePage === "Collections" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-page-collections.png"
            alt="Recipe collections setup with a recipe box, plated dinner, salad, rolls, coffee, and notebook"
            eyebrow="COLLECTIONS"
            title="Collections"
            text="Recipe collections bring related meals and cooking ideas together in one convenient place. Instead of searching through the entire library, you can choose a collection that matches your schedule, the season, your preferred appliance, or the kind of food you feel like eating.\n\nSome collections focus on speed and convenience, while others are built around comfort, nutrition, outdoor cooking, or complete meal combinations. Each one offers a practical starting point when you need inspiration."
          />
          <CollectionsPage setActivePage={setActivePage} />
        </>
      )}
      {activePage === "Salad Jars" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-page-salad-jars.jpg"
            alt="Salad jars meal planning setup with mason jar salads, recipe box, notebook, and clipboard"
            eyebrow="COLLECTIONS"
            title="Salad Jars"
            text="Salad jars make it easier to prepare fresh meals in advance without ending up with a soggy salad. By layering dressing, sturdy vegetables, proteins, grains, and delicate greens in the correct order, the ingredients remain separated until serving.\n\nThis collection includes practical combinations for lunches, light dinners, meal preparation, and grab-and-go meals. Shake the jar or pour everything into a bowl when you are ready to eat."
            className="pageHeroDepth464"
          />
          <CollectionDetailPage
            title="Salad Jars"
            text="A collection page for make-ahead salad jars, fresh lunches, and easy grab-and-go meal prep ideas. More recipes and filters will be added here."
            setActivePage={setActivePage}
            recipes={classifiedRecipes}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            addToPlan={addToPlan}
            openRecipeCard={openRecipeCard}
          />
        </>
      )}
      {activePage === "Slow Cooker Favorites" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-page-slow-cooker.jpg"
            alt="Slow cooker meal setup with crockpot, sides, rolls, recipe box, and slow cooker meal plan clipboard"
            eyebrow="COLLECTIONS"
            title="Slow Cooker Favorites"
            text="Slow cooker meals are ideal for days when you want dinner cooking while you handle everything else. Many recipes require only a little preparation before the Crockpot takes over and slowly develops the flavor.\n\nThis collection includes comforting meats, soups, stews, casseroles, and other dependable meals. They are especially useful for busy weekdays, relaxed weekends, meal preparation, and dishes that benefit from long, gentle cooking."
            className="pageHeroDepth464"
/>
          <CollectionDetailPage
            title="Slow Cooker Favorites"
            text="A collection page for easy slow-cooker meals and set-it-and-forget-it dinner ideas. More recipes and filters will be added here."
            setActivePage={setActivePage}
            recipes={classifiedRecipes}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            addToPlan={addToPlan}
            openRecipeCard={openRecipeCard}
          />
        </>
      )}
      {activePage === "Summer Cookouts" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-page-summer-cookouts.jpg"
            alt="Summer cookout setup with burger, hot dog, corn, baked beans, coleslaw, and recipe box"
            eyebrow="COLLECTIONS"
            title="Summer Cookouts"
            text="Summer cookouts are about good food, fresh air, and spending time with family and friends. This collection brings together grilled meats, easy side dishes, cool salads, drinks, desserts, and other recipes that work well for outdoor meals.\n\nUse these ideas for backyard dinners, holiday weekends, poolside gatherings, neighborhood get-togethers, or a quiet evening on the patio. Many of the recipes can be prepared ahead so you spend less time in the kitchen."
                      className="pageHeroDepth464"
/>
          <CollectionDetailPage
            title="Summer Cookouts"
            text="A collection page for grill-friendly meals, warm-weather favorites, cookouts, and simple outdoor dinners. More recipes and filters will be added here."
            setActivePage={setActivePage}
            recipes={classifiedRecipes}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            addToPlan={addToPlan}
            openRecipeCard={openRecipeCard}
          />
        </>
      )}
      {activePage === "Healthy Dinners" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-page-healthy-dinners.jpg"
            alt="Healthy dinner setup with grilled chicken, salad, grains, recipe box, and meal plan clipboard"
            eyebrow="COLLECTIONS"
            title="Healthy Dinners"
            text="Healthy dinners should still be filling, flavorful, and enjoyable to eat. This collection focuses on practical meals made with balanced ingredients, sensible portions, leaner proteins, vegetables, whole grains, or lighter preparation methods.\n\nThe goal is not to remove every comfort or follow a single strict diet. These recipes simply provide better-balanced options that can fit more easily into an everyday eating plan without making dinner feel like a punishment."
            className="pageHeroDepth464"
/>
          <CollectionDetailPage
            title="Healthy Dinners"
            text="A collection page for lighter, practical dinner ideas with flexible options for lower-calorie, lower-carb, and higher-protein meals. More recipes and filters will be added here."
            setActivePage={setActivePage}
            recipes={classifiedRecipes}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            addToPlan={addToPlan}
            openRecipeCard={openRecipeCard}
          />
        </>
      )}
      {activePage === "Comfort Foods" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-page-comfort-food.jpg"
            alt="Comfort food meal setup with meatloaf, mashed potatoes, green beans, rolls, macaroni, and recipe box"
            eyebrow="COLLECTIONS"
            title="Comfort Foods"
            text="Comfort food means something a little different to everyone, but it usually begins with familiar flavors and a satisfying meal. This collection includes hearty casseroles, creamy dishes, slow-cooked favorites, homestyle dinners, and other recipes that feel dependable.\n\nThese meals are especially welcome on cooler evenings, quiet weekends, difficult days, or any time you want something warm and familiar. Some are traditional favorites, while others offer a new version of a well-loved dish."
            className="pageHeroDepth464"
/>
          <CollectionDetailPage
            title="Comfort Foods"
            text="A collection page for familiar classics, cozy family-style meals, and practical comfort-food recipes. More recipes and filters will be added here."
            setActivePage={setActivePage}
            recipes={classifiedRecipes}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            addToPlan={addToPlan}
            openRecipeCard={openRecipeCard}
          />
        </>
      )}
      {activePage === "Easy 30-Minute Meals" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-page-30-minute-meals.jpg"
            alt="Easy 30-minute meal planning setup with chicken, salad, recipe cards, and a meal plan clipboard"
            eyebrow="COLLECTIONS"
            title="Easy 30-Minute Meals"
            text="Busy evenings do not always leave time for complicated preparation or long cooking times. These recipes are designed to help you place a satisfying meal on the table in about 30 minutes, using straightforward ingredients and efficient methods.\n\nThe collection includes skillet meals, quick pastas, air-fryer recipes, simple grilled dishes, fast casseroles, and other practical options. Actual times may vary, but every recipe is selected with convenience in mind."
            className="pageHeroDepth464"
/>
          <CollectionDetailPage
            title="Easy 30-Minute Meals"
            text="A collection page for fast weeknight meals and simple dinners that come together quickly. More recipes and filters will be added here."
            setActivePage={setActivePage}
            recipes={classifiedRecipes}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            addToPlan={addToPlan}
            openRecipeCard={openRecipeCard}
          />
        </>
      )}
      {activePage === "Sunday Meals" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-weekly-plan.png"
            alt="Sunday meal planning setup with recipes, dinner, and family-style sides"
            eyebrow="COLLECTIONS"
            title="Sunday Meals"
            text="Sunday meals are the recipes that feel a little more settled, familiar, and worth gathering around. This collection can include homestyle dinners, make-ahead mains, slow-cooked meals, casseroles, and dependable family favorites.

Use this page to group the recipes you want for relaxed weekends, family visits, holiday-style dinners, or meals that leave useful leftovers for the week ahead."
            className="pageHeroDepth464"
          />
          <CollectionDetailPage
            title="Sunday Meals"
            text="A collection page for relaxed weekend dinners, family-style meals, and dependable Sunday favorites."
            setActivePage={setActivePage}
            recipes={classifiedRecipes}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            addToPlan={addToPlan}
            openRecipeCard={openRecipeCard}
          />
        </>
      )}
      {activePage === "Complete Dinners" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-page-complete-dinners.jpg"
            alt="Complete dinner setup with main dish, sides, recipe box, and meal-planning clipboard"
            eyebrow="COLLECTIONS"
            title="Complete Dinners"
            text="Complete dinners bring together recipes that work well as a full meal idea. These may include hearty mains, practical sides, freezer-friendly options, or meals that are especially easy to plan for two to six servings.

Use this collection to assign individual recipe cards that belong in a complete-dinner planning group without duplicating recipes or changing their official category codes."
            className="pageHeroDepth464"
          />
          <CollectionDetailPage
            title="Complete Dinners"
            text="A collection page for recipes that work especially well as part of a complete dinner plan."
            setActivePage={setActivePage}
            recipes={classifiedRecipes}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            addToPlan={addToPlan}
            openRecipeCard={openRecipeCard}
          />
        </>
      )}
      {activePage === "Freezer-Friendly Meals" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-page-freezer-meals.png"
            alt="Freezer meals and make-ahead dinner containers with labels, recipe cards, and reheating notes"
            eyebrow="COLLECTIONS"
            title="Quick & Easy Freezer Meals"
            text="Freezer-friendly meals are helpful when you want to cook once and make future dinners easier. This collection can include recipes that freeze well as full meals, meal components, sauces, proteins, casseroles, soups, or prepared portions.

Use this page to group recipes that can be made ahead, labeled, frozen, thawed safely, and finished later with dependable results."
            className="pageHeroDepth464"
          />
          <CollectionDetailPage
            title="Quick & Easy Freezer Meals"
            text="A collection page for recipes that are useful for freezer prep, batch cooking, and future meals."
            setActivePage={setActivePage}
            recipes={classifiedRecipes}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            addToPlan={addToPlan}
            openRecipeCard={openRecipeCard}
          />
        </>
      )}
      {activePage === "Meals for Two" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-page-meal-plans.jpg"
            alt="Meal planning for two setup with recipe cards, dinner plates, and grocery notes"
            eyebrow="COLLECTIONS"
            title="Meals for Two"
            text="Meals for two are especially useful for smaller households, empty nesters, and anyone who wants practical portions without excessive leftovers. Some recipes may already fit two servings, while others may be easy to divide, freeze, or repurpose.

Use this collection to organize recipes that work well for two-person dinners, planned leftovers, or smaller batch cooking."
            className="pageHeroDepth464"
          />
          <CollectionDetailPage
            title="Meals for Two"
            text="A collection page for practical smaller-household recipes and two-person dinner planning."
            setActivePage={setActivePage}
            recipes={classifiedRecipes}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            addToPlan={addToPlan}
            openRecipeCard={openRecipeCard}
          />
        </>
      )}
      {activePage === "Make-Ahead Meals" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-page-make-ahead-meals.jpg"
            alt="Make-ahead meal setup with prepared food, storage containers, labels, and recipe notes"
            eyebrow="COLLECTIONS"
            title="Make-Ahead Meals"
            text="Make-ahead meals help reduce last-minute cooking pressure by moving part of the work earlier. These recipes may be assembled ahead, partly cooked, portioned, chilled, frozen, or prepared as components for faster dinners later.

Use this collection to organize recipes that fit prep-ahead cooking, planned leftovers, freezer portions, or simple weeknight finishing."
            className="pageHeroDepth464"
          />
          <CollectionDetailPage
            title="Make-Ahead Meals"
            text="A collection page for recipes that can be prepared ahead, assembled early, or finished quickly later."
            setActivePage={setActivePage}
            recipes={classifiedRecipes}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            addToPlan={addToPlan}
            openRecipeCard={openRecipeCard}
          />
        </>
      )}
      {activePage === "Meal Planner" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-weekly-dinner-planner.png"
            alt="Weekly dinner planner hero with meal-planning notebook, checklist clipboard, coffee, and a potted plant on a light marble counter"
            eyebrow="TWO-WEEK DINNER PLANNER"
            title="Your Weekly Dinner Planner"
            text="Meal planning can make the week feel more organized without removing flexibility. Select meals for specific days, account for leftovers, plan around appointments, and decide which foods need to be thawed or prepared in advance.\n\nYour plan can be as detailed or as simple as you prefer. Even choosing four or five dinners before grocery shopping can reduce stress, limit impulse purchases, and make it easier to use the food already in your home."
          />
          <PlannerPage {...pageProps} />
        </>
      )}
      {activePage === "Shopping Lists" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-page-grocery-list.jpg"
            alt="Grocery list setup with clipboard, shopping bag, notebook, coffee, and fresh groceries"
            eyebrow="PLANNING"
            title="Your Grocery List"
            text="A clear grocery list helps turn a meal plan into an organized shopping trip. Add the ingredients needed for upcoming recipes, review the items already in your pantry, and avoid purchasing products you do not actually need.\n\nGrouping similar items together can make shopping faster and reduce forgotten ingredients. Your list can also help control impulse purchases, compare costs, and keep household staples from running out unexpectedly."
            className="pageHeroDepth464"
/>
          <ShoppingListPage {...pageProps} />
        </>
      )}
      {activePage === "Pantry Staples" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-page-your-pantry.jpg"
            alt="Pantry planning setup with labeled pantry containers, canned goods, checklist, and notebook"
            eyebrow="PLANNING"
            title="Your Pantry"
            text="A well-organized pantry makes it easier to see what you already own and what needs to be replaced. Keeping track of canned goods, dry ingredients, spices, baking supplies, sauces, and staples can prevent duplicate purchases and forgotten food.\n\nUse this section as a practical inventory and planning tool. When you know what is available, it becomes easier to choose recipes, use ingredients before they expire, and prepare meals without another trip to the store."
            className="pageHeroDepth464"
/>
          <PantryStaplesPage {...pageProps} />
        </>
      )}
      {activePage === "Pantry Organization" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-page-your-pantry.jpg"
            alt="Pantry planning setup with labeled containers, canned goods, checklist, and notebook"
            eyebrow="PLANNING"
            title="Organizing Your Pantry"
            text="A neat pantry makes it easier to plan meals, shop from what you already have, and avoid buying duplicates. Grouping foods by type, labeling containers, and checking older items first can make everyday cooking feel less scattered.\n\nThis page is a practical holding place for pantry organization notes, storage ideas, shelf-stable categories, and simple habits that help keep Robert’s Recipe Box useful in a real kitchen."
            className="pageHeroDepth464"
/>
          <PlaceholderInfoPage
            eyebrow="PLANNING"
            title="Organizing Your Pantry"
            text="Use this area for pantry organization ideas, shelf-stable storage notes, container recommendations, and ways to make meal planning easier from the ingredients already on hand."
            setActivePage={setActivePage}
          />
        </>
      )}
      {activePage === "Kitchen Refrigerator" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-page-refrigerator-inv.png"
            alt="Refrigerator inventory setup with fresh foods, notebook, produce, dairy, eggs, and meal-prep containers"
            eyebrow="YOUR KITCHEN"
            title="Refrigerator Inventory"
            text="Your refrigerator inventory can help you track fresh ingredients, leftovers, sauces, dairy, produce, and ready-to-use meal components before they are forgotten. A quick refrigerator check can make weekly meal planning and grocery shopping easier.

Use this section to mark what is already in the refrigerator, record quantities and use-by dates, and send low-stock items to your grocery list."
            className="pageHeroDepth464"
/>
          <RefrigeratorInventoryPage {...pageProps} />
        </>
      )}
      {activePage === "Kitchen Freezer" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-page-freezer-inv.png"
            alt="Freezer inventory setup with labeled frozen meals, freezer bags, clipboard, and food storage notes"
            eyebrow="YOUR KITCHEN"
            title="Freezer Inventory"
            text="Your freezer inventory can help you keep track of frozen dinners, meats, vegetables, sauces, breads, meal-prep blocks, and leftovers. Knowing what is already frozen makes it easier to plan meals without buying duplicates.

Use this section to check what is on hand, record dates, mark foods that should be used soon, and send low-stock items to your grocery list."
            className="pageHeroDepth464"
/>
          <FreezerInventoryPage {...pageProps} />
        </>
      )}
      {activePage === "Packaging Options" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-storage.png"
            alt="Meal storage containers, labels, bags, jars, and freezer organization supplies"
            eyebrow="TIPS & ORGANIZATION"
            title="Packaging Options"
            text="Good meal packaging makes freezer meals, leftovers, pantry staples, and make-ahead dinners easier to use later. The right container, bag, jar, or vacuum-sealed pouch can help protect food quality, control portions, and keep instructions easy to follow.\n\nThis page is a practical holding place for containers, freezer blocks, jars, labels, vacuum-sealing ideas, and other packaging choices that support Robert’s Recipe Box meal planning."
            className="pageHeroDepth464"
/>
          <PlaceholderInfoPage
            eyebrow="TIPS & ORGANIZATION"
            title="Packaging Options"
            text="Use this area for freezer containers, silicone trays, jars, vacuum-seal bags, labeling methods, portion sizes, and storage notes for make-ahead meals."
            setActivePage={setActivePage}
          />
        </>
      )}
      {activePage === "Favorites" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-page-favorite-recipes.jpg"
            alt="Favorite recipe setup with recipe box, favorite recipe card, notebook, and kitchen decor"
            eyebrow="PLANNING"
            title="Your Favorites"
            icon="♥"
            text="Your Favorites provides one convenient place to save the recipes you enjoy most or want to prepare again. Instead of searching through the full library every time, you can return directly to meals that already caught your attention.\n\nOver time, this section can become your own personalized recipe collection. Save dependable family meals, special-occasion favorites, recipes you want to try, and dishes that work especially well with your schedule or equipment."
            className="pageHeroDepth464"
/>
          <FavoritesPage {...pageProps} />
        </>
      )}
      {activePage === "Recommendations" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-storage.png"
            alt="Pantry storage containers, spices, and kitchen organization setup"
            eyebrow="TIPS & ORGANIZATION"
            title="Recommendations"
            text="Helpful kitchen products, practical tools, and useful items that support cooking and organization."
          />
          <RecommendationsPage {...pageProps} />
        </>
      )}
      {activePage === "Products I Use" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-page-cooking-tools.jpg"
            alt="Cooking tools and products setup with utensils, measuring cups, grater, mixing bowl, and skillet"
            eyebrow="TIPS & ORGANIZATION"
            title="Products I Recommend"
            text="The right kitchen tool can save time, improve consistency, or make an unpleasant task easier. The wrong tool may take up space without providing enough benefit to justify its cost.\n\nThis section highlights products that may be genuinely useful for preparation, cooking, storage, serving, and cleanup. Recommendations are based on practical function and suitability for an everyday home kitchen rather than collecting unnecessary gadgets."
            className="pageHeroDepth464"
/>
          <ProductsIUsePage setActivePage={setActivePage} />
        </>
      )}
      {activePage === "Grocery Picks" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-page-healthy-substitutions.jpg"
            alt="Healthy substitutions setup with cauliflower, tofu, zucchini noodles, beans, grains, yogurt, and greens"
            eyebrow="TIPS & ORGANIZATION"
            title="Healthy Substitutions"
            text="Healthier cooking does not always require replacing the entire recipe. Small adjustments to ingredients, portions, cooking methods, or side dishes can make a familiar meal better suited to your goals.\n\nThis section includes practical substitutions for fats, sugar, sodium, refined carbohydrates, and higher-calorie ingredients. Not every replacement works in every recipe, so the suggestions also consider flavor, texture, and cooking performance."
            className="pageHeroDepth464"
/>
          <GroceryPicksPage {...pageProps} />
        </>
      )}
      {activePage === "Smart Grocery Picks" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-page-healthy-substitutions.jpg"
            alt="Healthy substitutions setup with cauliflower, tofu, zucchini noodles, beans, grains, yogurt, and greens"
            eyebrow="TIPS & ORGANIZATION"
            title="Healthy Substitutions"
            text="Healthier cooking does not always require replacing the entire recipe. Small adjustments to ingredients, portions, cooking methods, or side dishes can make a familiar meal better suited to your goals.\n\nThis section includes practical substitutions for fats, sugar, sodium, refined carbohydrates, and higher-calorie ingredients. Not every replacement works in every recipe, so the suggestions also consider flavor, texture, and cooking performance."
            className="pageHeroDepth464"
/>
          <GroceryPicksPage {...pageProps} />
        </>
      )}
      {activePage === "Freezer Tips" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-page-freeze-reheat.png"
            alt="Freeze and reheat setup with labeled frozen meals, plated lasagna, clipboard instructions, coffee, and meal storage"
            eyebrow="TIPS & ORGANIZATION"
            title="Freezing & Reheating Meals"
            className="pageHeroDepth464"
            text="Freezing meals can save time, reduce waste, and make busy days easier, but good results depend on proper preparation and packaging. Some foods freeze beautifully, while others require small changes to preserve their texture and flavor.\n\nThis section covers containers, freezer bags, vacuum sealing, portioning, cooling, labeling, storage times, safe thawing, reheating, and final preparation. Clear instructions can help make frozen meals feel more like freshly prepared food."
          />
          <FreezerTipsPage {...pageProps} />
        </>
      )}
      {activePage === "About" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-page-about-us.jpg"
            alt="Framed family photos, coffee cup, and small plant on a light kitchen counter"
            eyebrow="ABOUT US"
            title="Welcome to Our Site"
            text="Come on in and take a look around Robert’s Recipe Box. Whether you are searching for tonight’s dinner, planning meals for the week, trying a new cooking method, or simply looking for a little inspiration, we hope you find something useful.\n\nThe site is designed to be comfortable and easy to explore. Browse the recipes, save your favorites, review the cooking tips, or use the planning tools to create a routine that works better for your household."
            className="pageHeroDepth464"
/>
          <AboutPage setActivePage={setActivePage} initialSection="main" />
        </>
      )}
      {activePage === "Who Is Robert" && (
        <HeroTopicPage
          eyebrow="OUR MISSION"
          title="Who Is Robert"
          heroImage="images/heroes/hero-mission.png"
          heroAlt="Recipe box, binder, and kitchen organization setup"
          text="This page will introduce Robert, the person behind Robert’s Recipe Box, and explain the practical cooking experience behind the site."
          setActivePage={setActivePage}
        />
      )}
      {activePage === "My Goals" && (
        <HeroTopicPage
          eyebrow="OUR MISSION"
          title="What Are My Goals"
          heroImage="images/heroes/hero-mission.png"
          heroAlt="Recipe box, binder, and kitchen organization setup"
          text="This page will explain the goals of Robert’s Recipe Box: practical meals, smart planning, useful leftovers, freezer meals, and saving money where possible."
          setActivePage={setActivePage}
        />
      )}
      
      {activePage === "Air Fryer Recipes" && (
        <HeroTopicPage
          eyebrow="COOKING METHODS"
          title="Tips: Air Fryers"
          heroImage="images/heroes/hero-page-air-fryer.jpg"
          heroAlt="Air fryer with fries, cooked bites, towel, and potted herb"
          text="Air fryers can create crisp, flavorful food with less oil and often less cleanup than traditional frying. They are especially useful for smaller portions, quick meals, reheating certain leftovers, and preparing foods without heating a full-size oven.\n\nThis collection includes meats, vegetables, side dishes, snacks, and other recipes suited to circulating hot air. Because air fryers vary, cooking times may need small adjustments based on the model and basket size."
          setActivePage={setActivePage}
        >
          <article className="gasGrillGuide airFryerGuide" aria-labelledby="air-fryer-guide-title">
            <header className="gasGrillGuideHeader">
              <span className="gasGrillGuideKicker">Air Fryer Care & Cooking Guide</span>
              <h2 id="air-fryer-guide-title">Taking Care of and Cooking With Your Air Fryer</h2>
              <p>An air fryer can make meals faster, crispier, and easier to clean up—especially when it is used and maintained properly. These practical tips will help you get better cooking results while keeping your air fryer clean, safe, and working efficiently.</p>
            </header>

            <div className="gasGrillGuideGrid">
              <section><h3>Before You Start</h3><ul className="greenHeartList"><li>Place the air fryer on a flat, heat-resistant surface with plenty of open space around the air vents.</li><li>Check that the basket, tray, and removable inserts are clean and completely dry.</li><li>Preheat when the recipe recommends it; a short preheat often improves browning and crispness.</li><li>Avoid placing the appliance directly beneath low cabinets because hot air and steam escape from the top or back.</li></ul></section>
              <section><h3>Do Not Overcrowd the Basket</h3><p>Food cooks best when hot air can circulate around it. Arrange food in a single, loose layer whenever possible. Slight overlap may be fine for thin foods, but tightly packed ingredients can steam instead of crisp.</p><p>For larger batches, cook in two or more rounds. Earlier batches can usually be returned to the basket for one or two minutes before serving.</p></section>
              <section><h3>Shake, Turn, or Rotate Food</h3><p>Shake the basket or turn food halfway through cooking to promote even browning.</p><p>Use silicone-tipped tongs or another nonmetal utensil to protect the nonstick coating. Larger foods such as chicken pieces, burgers, chops, and fish fillets should usually be flipped rather than shaken.</p></section>
              <section><h3>Use Oil Sparingly</h3><p>Air fryers need much less oil than traditional frying. Lightly coat food with oil using a brush, mister, or a small amount tossed directly with the ingredients.</p><p>Too much oil can collect beneath the basket, create smoke, or make food greasy. Avoid aerosol cooking spray on nonstick surfaces unless the manufacturer says it is safe.</p></section>
              <section><h3>Choose the Right Liner</h3><p>Perforated parchment liners can reduce sticking while allowing air to circulate. Never place a loose liner in the basket during preheating; without food to hold it down, it may lift into the heating element and burn.</p><p>Solid foil or parchment can restrict airflow. Use only enough to sit beneath the food and never cover vents or heating components.</p></section>
              <section><h3>Adjust Oven Recipes</h3><p>When adapting a conventional oven recipe, begin by lowering the temperature by about 25°F and checking the food earlier than the original recipe suggests.</p><p>Air fryers vary considerably, so record the time and temperature that work best for your model.</p></section>
              <section><h3>Check Food Early</h3><p>Air fryers cook quickly, particularly during the final few minutes. Begin checking before the suggested time ends.</p><p>Small items, baked goods, reheated foods, and anything containing sugar can brown very quickly. Use a food thermometer for meat, poultry, fish, casseroles, and reheated leftovers.</p></section>
              <section><h3>Prevent Smoke</h3><ul className="greenHeartList"><li>Clean grease from the basket and lower cooking chamber after each use.</li><li>Trim excessive fat from meats when practical.</li><li>Avoid using more oil than necessary.</li><li>Remove loose crumbs, breading, or cheese that may fall near the heating element.</li></ul><p>If the air fryer smokes heavily, turn it off, unplug it, and allow it to cool before cleaning.</p></section>
              <section><h3>Clean After Every Use</h3><p>Allow the appliance to cool completely. Remove the basket, tray, and washable parts, then clean them with warm water, mild dish soap, and a soft sponge unless dishwasher cleaning is approved.</p><p>Wipe the cooking chamber with a damp cloth. Never immerse the main appliance, cord, or plug in water.</p></section>
              <section><h3>Clean the Heating Element</h3><p>After the air fryer is unplugged and fully cool, carefully wipe accessible areas near the heating element with a soft damp cloth or nonabrasive brush, following the manufacturer’s directions.</p><p>Never scrape the heating element with metal tools or saturate the interior with water.</p></section>
              <section><h3>Protect the Nonstick Finish</h3><p>Avoid steel wool, abrasive cleaners, metal utensils, and harsh scrubbing pads. Soak stuck-on food in warm soapy water before gently cleaning it.</p><p>Replace badly scratched, peeling, or damaged nonstick parts.</p></section>
              <section><h3>Remove Lingering Odors</h3><p>Wash all removable parts thoroughly and wipe the cooled interior. A baking-soda-and-water paste may be used on removable parts when permitted by the manufacturer.</p><p>Rinse and dry everything completely before reassembling.</p></section>
              <section><h3>Store It Properly</h3><p>Make sure every part is clean and dry. Store the air fryer with the basket loosely inserted so air can circulate.</p><p>Avoid tightly wrapping the power cord around the appliance, and do not place heavy objects on top.</p></section>
              <section><h3>Best Foods for Air Frying</h3><ul className="greenHeartList"><li>Frozen appetizers and snacks</li><li>Potatoes and vegetables</li><li>Breaded chicken, fish, or pork</li><li>Meatballs, burgers, and sausages</li><li>Reheated pizza, fries, and roasted foods</li><li>Small-batch baked goods</li></ul><p>Very wet batter, excessive liquid, or lightweight toppings may require special preparation.</p></section>
              <section><h3>Final Reminder</h3><p>Every air fryer cooks a little differently. Use recipe temperatures and times as starting points, then adjust for your appliance, food quantity, and preferred browning.</p><p>A clean basket, open airflow, moderate oil, and frequent checking are the keys to crisp and dependable results.</p></section>
            </div>
          </article>
        </HeroTopicPage>
      )}
      {activePage === "Oven Recipes" && (
        <HeroTopicPage
          eyebrow="COOKING METHODS"
          title="Tips: Gas & Electric Ovens"
          heroImage="images/heroes/hero-page-oven.jpg"
          heroAlt="Oven cooking setup with casserole, oven tips clipboard, utensils, coffee, and notebook"
          text="The oven remains one of the most versatile tools in the kitchen. It can bake, roast, broil, brown, warm, and finish everything from casseroles and meats to vegetables, breads, and desserts.\n\nThis section includes recipes for everyday dinners as well as special occasions. Clear temperatures and timing guidance will help you plan the meal, although ovens can vary and food should always be checked for doneness."
          setActivePage={setActivePage}
        >
          <article className="gasGrillGuide" aria-labelledby="oven-guide-title">
            <header className="gasGrillGuideHeader">
              <span className="gasGrillGuideKicker">Oven Care & Cooking Guide</span>
              <h2 id="oven-guide-title">Taking Care of and Cooking in a Gas or Electric Oven</h2>
              <p>A well-maintained oven heats more evenly, cooks food more reliably, and lasts longer. Gas and electric ovens operate differently, but both benefit from regular cleaning, careful use, and a few basic cooking habits.</p>
            </header>

            <div className="gasGrillGuideGrid">
              <section><h3>Before Each Use</h3><p>Check that the oven is empty before preheating and remove stored pans, baking sheets, thermometers, or other unneeded items.</p><p>Position the racks before the oven becomes hot. Inspect the interior for grease, spills, or loose foil. Preheat fully unless the recipe says otherwise; most ovens need about 10 to 20 minutes.</p><p>Use an oven thermometer occasionally to confirm that the actual temperature matches the control setting.</p></section>
              <section><h3>Gas Ovens</h3><p>Gas ovens use a flame-powered burner, usually beneath the oven floor. They often heat quickly and may produce slightly more moisture than electric ovens.</p><p>A normal flame is generally steady and mostly blue. A persistent yellow or uneven flame may require cleaning or professional service. Never manually light a modern gas oven unless the manufacturer specifically instructs you to do so.</p><p>If you smell gas, turn off the oven, avoid switches and open flames, leave the area, and contact the gas provider or a qualified technician.</p><p>Rotate pans when needed because gas ovens may have hotter areas near the bottom or sides. Do not cover the oven floor with foil.</p></section>
              <section><h3>Electric Ovens</h3><p>Electric ovens use heating elements at the bottom, top, or rear and generally provide steady, dry heat suited to baking and roasting.</p><p>Do not place foil or pans directly on the bottom element or oven floor unless the manufacturer allows it. Stop using the oven and arrange service if an exposed element is cracked, blistered, or damaged.</p><p>Normal cycling may continue producing heat after an element switches off. When broiling, use the recommended rack position and watch food closely.</p></section>
              <section><h3>Rack Placement</h3><ul><li>Use the center rack for most casseroles, cakes, cookies, and general baking.</li><li>Use a lower rack for pies, pizzas, breads, and stronger bottom browning.</li><li>Use an upper rack for broiling, gratins, and additional top browning.</li><li>When using multiple racks, leave space between pans and stagger them for airflow.</li><li>Do not overcrowd the oven.</li></ul></section>
              <section><h3>Choosing the Right Bakeware</h3><p>Light-colored metal pans provide even browning for general baking. Dark metal absorbs more heat and may brown food faster, so a slightly lower temperature may be needed.</p><p>Glass and ceramic retain heat longer and work well for casseroles, baked pasta, and cobblers, but may require more time.</p><p>Use cookware rated for the selected temperature. Avoid ordinary glass, plastic, or non-oven-safe dishes. Sudden temperature changes can crack cold glass or ceramic cookware.</p></section>
              <section><h3>Convection Cooking</h3><p>Convection ovens circulate hot air for faster cooking, more even browning, and crispier surfaces.</p><p>When adapting a conventional recipe, reduce the temperature by about 25°F or begin checking earlier. Use low-sided pans and avoid overcrowding so air can circulate.</p><p>Convection is especially useful for roasted vegetables, meats, cookies, pastries, and multiple-rack cooking.</p></section>
              <section><h3>Baking and Roasting Tips</h3><p>Avoid unnecessary door opening because each opening releases heat and increases cooking time. Use the oven light and window whenever possible.</p><p>Rotate pans if the oven has hot spots, but wait until delicate cakes and breads have set. Leave space around pans for circulation.</p><p>Use a thermometer for meat, poultry, casseroles, and reheated foods. Let roasted meats rest before slicing.</p></section>
              <section><h3>Broiling</h3><p>Broiling uses intense top heat and cooks quickly. Preheat when recommended and use a broiler-safe pan that drains grease away from food.</p><p>Trim excess fat to reduce smoke and flare-ups. Keep the oven door in the position recommended by the manufacturer, and never leave broiling food unattended.</p></section>
              <section><h3>Preventing Smoke and Odors</h3><p>Wipe up spills after the oven cools. Grease, cheese, sugar, and drippings can smoke during the next use.</p><p>Place a baking sheet on the rack below foods that may bubble over rather than on the oven floor unless permitted. Keep the oven floor, racks, broiler pan, and door free of grease buildup.</p><p>Use the exhaust fan when roasting fatty foods, broiling, or cooking at high temperatures. Never use the oven to heat the home.</p></section>
              <section><h3>Cleaning the Oven</h3><p>Allow the oven to cool completely. Remove crumbs and loose debris with a damp cloth or soft brush.</p><p>Clean racks according to the manufacturer’s directions. Use a nonabrasive cleaner approved for the interior, and avoid spraying heating elements, gas burners, igniters, fans, sensors, or door seals.</p><p>Clean door glass with a nonabrasive product and soft cloth. Wipe the gasket gently without removing, soaking, or aggressively scrubbing it.</p></section>
              <section><h3>Using the Self-Cleaning Cycle</h3><p>Remove cookware, foil, loose food, and racks that are not approved for self-cleaning. Wipe up heavy grease and large spills first.</p><p>Ventilate the kitchen, keep children and pets away, and never force the locked door open. After the oven cools, wipe away ash with a damp cloth.</p><p>Use self-cleaning only as often as necessary because the extreme heat places additional stress on components.</p></section>
              <section><h3>Routine Maintenance</h3><p>Check the door gasket for tears, loose areas, or hardening. Keep oven vents clear and clean controls with a lightly dampened cloth.</p><p>Replace the oven light only when the oven is cool and power is disconnected. Have burner, igniter, element, wiring, and temperature problems repaired by a qualified technician.</p><p>Do not repair gas lines, electrical connections, control boards, or sealed components yourself.</p></section>
              <section><h3>Cooking During a Power Outage</h3><p>Do not use an electric oven during an outage. Many modern gas ovens also require electricity for ignition and controls.</p><p>Do not bypass safety systems or manually light a burner unless the manufacturer specifically permits it. Keep the door closed to retain heat temporarily.</p><p>Discard perishable food that has remained at an unsafe temperature for an extended period.</p></section>
              <section><h3>When to Stop Using the Oven</h3><ul><li>Persistent gas odor</li><li>Sparks, smoke, or burning electrical smells</li><li>Damaged heating element</li><li>Burner that will not ignite properly</li><li>Large temperature fluctuations</li><li>Door that will not close securely</li><li>Cracked door glass</li><li>Repeated error codes</li><li>Breaker that repeatedly trips</li><li>Unusual popping, buzzing, or grinding sounds</li></ul></section>
              <section><h3>Basic Oven Safety</h3><p>Use dry oven mitts; damp towels and mitts can cause steam burns. Turn pan handles inward and stand to the side when opening the door to avoid hot air and steam.</p><p>Keep paper, plastic, towels, packaging, and other flammables away from hot surfaces. Never leave children unattended near an operating oven.</p><p>Keep a suitable kitchen fire extinguisher nearby. For an oven fire, turn off the heat and keep the door closed. Never pour water on a grease fire. Call emergency services if the fire does not go out immediately or begins spreading.</p></section>
            </div>

            <p className="gasGrillGuideClosing">Regular cleaning, correct rack placement, careful temperature control, and attention to warning signs will help a gas or electric oven cook more reliably and remain safer to use.</p>
          </article>
        </HeroTopicPage>
      )}
      {activePage === "Microwave Recipes" && (
        <HeroTopicPage
          eyebrow="COOKING METHODS"
          title="Tips: Microwave Ovens"
          heroImage="images/heroes/hero-page-microwaves.jpg"
          heroAlt="Microwave cooking setup with bowl of food, towel, and potted plant"
          text="Microwaves are usually associated with reheating leftovers, but they can also prepare simple meals, side dishes, sauces, vegetables, snacks, and individual portions. Used properly, they can save time and reduce the number of pans that need washing.\n\nThis section focuses on practical microwave uses rather than pretending it replaces every other appliance. Power levels and cooking times may vary, so recipes may require adjustment for your specific microwave."
          setActivePage={setActivePage}
        >
          <article className="gasGrillGuide microwaveGuide" aria-labelledby="microwave-guide-title">
            <header className="gasGrillGuideHeader">
              <span className="gasGrillGuideKicker">Microwave Care & Cooking Guide</span>
              <h2 id="microwave-guide-title">Taking Care of and Cooking in Your Microwave Oven</h2>
              <p>A microwave oven is useful for much more than reheating coffee or warming leftovers. When used correctly, it can quickly steam vegetables, thaw frozen foods, soften ingredients and prepare complete meals. Keeping the oven clean and using the proper containers will also help it operate safely and efficiently.</p>
            </header>

            <div className="gasGrillGuideGrid microwaveGuideGrid">
              <section>
                <h3>Before You Start</h3>
                <p>Read the owner’s manual for your specific microwave. Wattage, power levels, preset programs and recommended cooking times can vary considerably between models.</p>
                <p>Use cookware clearly marked <strong>microwave-safe</strong>. Glass, ceramic, paper and approved plastic containers are commonly used, but not every container made from these materials is suitable for microwave cooking.</p>
                <p>Avoid using:</p>
                <ul>
                  <li>Metal pans or utensils</li>
                  <li>Aluminum foil unless specifically permitted</li>
                  <li>Dishes with metallic paint or trim</li>
                  <li>Foam containers</li>
                  <li>Takeout containers not marked microwave-safe</li>
                  <li>Cracked, chipped or damaged cookware</li>
                  <li>Plastic storage containers not designed for heating</li>
                </ul>
                <p>Never operate an empty microwave. With no food or liquid to absorb the microwave energy, the appliance may be damaged.</p>
              </section>

              <section>
                <h3>Cover Food While Cooking</h3>
                <p>Loosely cover food with a microwave-safe lid, plate, paper towel or vented cover. Covering food helps retain moisture, reduces splattering and encourages more even heating.</p>
                <p>Do not completely seal the container. Steam must have a place to escape.</p>
                <p>When removing a cover, lift the edge farthest away from you first so hot steam is directed away from your face and hands.</p>
              </section>

              <section>
                <h3>Cook Food Evenly</h3>
                <p>Microwaves can create hot and cold spots. For more even results:</p>
                <ul>
                  <li>Arrange food in a ring around the outside of the dish.</li>
                  <li>Place thicker portions toward the outer edge.</li>
                  <li>Cut foods into similar-sized pieces.</li>
                  <li>Stir, rotate or turn food during cooking.</li>
                  <li>Rearrange individual portions halfway through cooking.</li>
                  <li>Allow food to stand after the microwave stops.</li>
                </ul>
                <p>Standing time is part of the cooking process. Heat continues to move through the food after it is removed from the microwave.</p>
              </section>

              <section>
                <h3>Learn to Use the Power Levels</h3>
                <p>Full power is useful for boiling water, heating beverages, cooking vegetables and reheating many foods. Lower power settings provide gentler, more even heating.</p>
                <p>Try reduced power for:</p>
                <ul>
                  <li>Defrosting meat</li>
                  <li>Melting butter or chocolate</li>
                  <li>Heating dairy-based sauces</li>
                  <li>Cooking eggs</li>
                  <li>Warming bread</li>
                  <li>Reheating dense casseroles</li>
                  <li>Softening cream cheese or ice cream</li>
                </ul>
                <p>Using a lower power level for a longer time often produces better results than repeatedly heating food at full power.</p>
              </section>

              <section>
                <h3>Reheating Leftovers</h3>
                <p>Transfer leftovers to a microwave-safe dish and spread the food into an even layer. Break apart large portions whenever possible.</p>
                <p>Add a small amount of water, broth or sauce to foods that may dry out. Cover the dish, leaving a small vent for steam.</p>
                <p>Heat in short intervals, stirring or rotating between each interval. Check several places in the food because the center may still be cool even when the edges are hot.</p>
                <p>Leftovers should be reheated until they reach <strong>165°F</strong> throughout. Allow the food to stand briefly before checking the temperature with a food thermometer.</p>
              </section>

              <section>
                <h3>Defrosting Food</h3>
                <p>Remove store packaging, foam trays, twist ties and absorbent pads before defrosting food.</p>
                <p>Use the microwave’s defrost setting or approximately 20% to 30% power. Turn, rotate or separate the food as it begins to thaw.</p>
                <p>Small or thin areas may start cooking before thicker sections are completely thawed. Shielding a small area with a limited amount of foil may be permitted by some manufacturers, but follow your microwave’s instructions carefully.</p>
                <p>Cook meat, poultry, seafood and other perishable foods immediately after microwave thawing. Some areas may have become warm enough for bacteria to multiply.</p>
              </section>

              <section>
                <h3>Cooking Vegetables</h3>
                <p>Microwaves are especially useful for steaming fresh or frozen vegetables.</p>
                <p>Place vegetables in a microwave-safe dish with a small amount of water. Cover and cook until tender, stirring or rearranging as needed.</p>
                <p>Use only enough water to create steam. Vegetables already containing plenty of moisture may require little or no additional water.</p>
                <p>Let the vegetables stand briefly before uncovering. Season after cooking unless the recipe directs otherwise.</p>
              </section>

              <section>
                <h3>Cooking Eggs Safely</h3>
                <p>Never microwave an egg in its shell. Pressure can build inside and cause it to explode.</p>
                <p>Pierce egg yolks and membranes before cooking eggs out of the shell. Use reduced power and short cooking intervals because eggs continue to firm during standing time.</p>
                <p>Scrambled eggs should be stirred during cooking. Remove them while they still look slightly moist, then allow the remaining heat to finish cooking them.</p>
                <p>Egg dishes and casseroles containing eggs should reach <strong>160°F</strong>.</p>
              </section>

              <section>
                <h3>Heating Liquids</h3>
                <p>Liquids heated in a microwave can become extremely hot without appearing to boil. They may suddenly erupt when moved, stirred or combined with another ingredient.</p>
                <p>To reduce the risk:</p>
                <ul>
                  <li>Avoid overheating liquids.</li>
                  <li>Do not fill the container to the top.</li>
                  <li>Stir before and partway through heating.</li>
                  <li>Let the container stand briefly before moving it.</li>
                  <li>Handle the container carefully.</li>
                  <li>Keep your face and hands away from the opening.</li>
                </ul>
                <p>Always stir and test the temperature of soups, sauces, beverages and baby foods before serving.</p>
              </section>

              <section>
                <h3>Foods That Need Special Care</h3>
                <p>Pierce foods with skins or membranes before cooking so steam can escape. Examples include:</p>
                <ul>
                  <li>Potatoes</li>
                  <li>Sweet potatoes</li>
                  <li>Sausages</li>
                  <li>Hot dogs</li>
                  <li>Whole squash</li>
                  <li>Egg yolks</li>
                </ul>
                <p>Do not heat completely sealed jars, bottles or containers.</p>
                <p>Whole grapes, hot peppers and certain other foods can react unpredictably in a microwave. Follow a tested microwave recipe rather than experimenting with unfamiliar foods.</p>
              </section>

              <section>
                <h3>Preventing Splatters and Odors</h3>
                <p>Covering food is the easiest way to prevent baked-on splatters.</p>
                <p>Wipe up spills soon after they occur. Allowing grease and food residue to build up can create odors, smoke and uneven heating.</p>
                <p>For lingering odors, place a microwave-safe bowl containing water and lemon slices inside the oven. Heat until the water produces steam, let it stand with the door closed for several minutes and then wipe the interior.</p>
                <p>Do not allow the bowl to boil dry.</p>
              </section>

              <section>
                <h3>Cleaning the Interior</h3>
                <p>Unplug a countertop microwave before cleaning when practical. Follow the owner’s manual for built-in and over-the-range models.</p>
                <p>Clean the interior with:</p>
                <ul>
                  <li>Warm water and mild dish soap</li>
                  <li>A soft cloth or nonabrasive sponge</li>
                  <li>A baking-soda-and-water solution for stubborn odors or residue</li>
                </ul>
                <p>Avoid abrasive pads, harsh cleaners and excessive water around vents or electrical components.</p>
                <p>Remove the turntable and support ring and wash them according to the manufacturer’s instructions. Make sure they are dry and properly seated before using the oven again.</p>
                <p>Keep the door, door seal and surrounding frame clean. Food buildup in these areas may prevent the door from closing correctly.</p>
              </section>

              <section>
                <h3>Cleaning the Exterior</h3>
                <p>Wipe control panels with a lightly dampened cloth and dry them promptly. Do not spray cleaner directly onto electronic controls.</p>
                <p>Use a cleaner recommended for the appliance’s exterior finish. Stainless-steel surfaces should be wiped in the direction of the grain.</p>
                <p>Keep air vents free of grease, dust and stored objects.</p>
              </section>

              <section>
                <h3>Caring for an Over-the-Range Microwave</h3>
                <p>Over-the-range microwaves often serve as ventilation hoods as well as cooking appliances.</p>
                <p>Clean or replace the grease filters according to the owner’s manual. A grease-covered filter reduces airflow and may create odors.</p>
                <p>Models that recirculate air back into the kitchen may also contain a charcoal filter. These filters usually must be replaced rather than washed.</p>
                <p>Do not cook on the range without the microwave’s grease filters properly installed.</p>
              </section>

              <section>
                <h3>When to Stop Using the Microwave</h3>
                <p>Stop using the microwave and have it inspected when:</p>
                <ul>
                  <li>The door does not close securely.</li>
                  <li>The door, hinges, latch or seal is damaged.</li>
                  <li>The appliance sparks when no metal is present.</li>
                  <li>It makes unusual electrical noises.</li>
                  <li>Smoke or a burning odor continues after cleaning.</li>
                  <li>The interior coating is badly damaged.</li>
                  <li>The turntable no longer rotates properly.</li>
                  <li>The appliance repeatedly trips a breaker.</li>
                </ul>
                <p>Do not attempt to remove the outer cabinet or repair internal microwave components yourself. High-voltage parts can remain dangerous even after the appliance has been unplugged.</p>
              </section>

              <section>
                <h3>Everyday Microwave Habits</h3>
                <p>For better results and a longer appliance life:</p>
                <ul>
                  <li>Use microwave-safe cookware.</li>
                  <li>Cover food loosely.</li>
                  <li>Stir and rotate food during cooking.</li>
                  <li>Use lower power for delicate or dense foods.</li>
                  <li>Allow proper standing time.</li>
                  <li>Check food with a thermometer when safety matters.</li>
                  <li>Clean spills before they harden.</li>
                  <li>Keep the door seal and vents clean.</li>
                  <li>Maintain over-the-range filters.</li>
                  <li>Follow the instructions for your specific model.</li>
                </ul>
                <p>Used thoughtfully, a microwave oven can be one of the quickest, cleanest and most convenient cooking tools in the kitchen.</p>
              </section>
            </div>
          </article>
        </HeroTopicPage>
      )}
      {activePage === "Gas Grill Recipes" && (
        <HeroTopicPage
          eyebrow="COOKING METHODS"
          title="Tips: Gas Grills"
          heroImage="images/heroes/hero-page-gas-grills.jpg"
          heroAlt="Gas grill with grilled burgers and vegetables on a light kitchen counter"
          text="Gas grills provide fast heat, convenient temperature control, and the familiar flavor of outdoor cooking. They work well for meats, vegetables, sandwiches, flatbreads, side dishes, and complete meals prepared away from the indoor kitchen.\n\nThese recipes and tips will help with preheating, direct and indirect heat, flare-ups, turning, timing, and safe doneness. With a little practice, a gas grill can become one of the most dependable cooking tools you own."
          setActivePage={setActivePage}
        >
          <article className="gasGrillGuide" aria-labelledby="gas-grill-guide-title">
            <header className="gasGrillGuideHeader">
              <span className="gasGrillGuideKicker">Gas Grill Care & Cooking Guide</span>
              <h2 id="gas-grill-guide-title">Taking Care of and Cooking on a Gas Grill</h2>
              <p>A gas grill is convenient, easy to control, and perfect for everything from quick weeknight dinners to summer cookouts. Regular cleaning, proper maintenance, and a few basic cooking techniques will help your grill perform better, last longer, and produce more flavorful food.</p>
            </header>

            <div className="gasGrillGuideGrid">
              <section><h3>Before Each Use</h3><p>Open the grill lid before turning on the gas. Check the propane tank, hose, regulator, and connections for visible damage. Confirm that the grease tray and drip pan are in place and not overflowing.</p><p>Preheat with the lid closed for 10 to 15 minutes. Once hot, clean the grates with a grill-safe scraper or brush. Lightly oil the food rather than pouring oil directly onto the grates.</p></section>
              <section><h3>Lighting the Grill Safely</h3><p>Always open the lid before lighting. Turn on the gas supply slowly, ignite the first burner according to the manufacturer’s instructions, then light the remaining burners.</p><p>If the grill does not ignite promptly, turn off the burners and gas supply. Leave the lid open and wait several minutes before trying again. Never lean directly over the grill while lighting it.</p></section>
              <section><h3>Direct Heat</h3><p>Place food directly over lit burners for quick-cooking foods such as hamburgers, hot dogs, steaks, chops, boneless chicken, shrimp, and vegetables. Direct heat produces strong browning and grill marks.</p></section>
              <section><h3>Indirect Heat</h3><p>Place food away from lit burners for whole chickens, bone-in chicken, ribs, roasts, meatloaf, and large cuts of pork or beef. Keep the lid closed so the grill works more like an outdoor oven.</p></section>
              <section><h3>Create Multiple Heat Zones</h3><p>Keep one area hotter for searing and another cooler for finishing. Move food to the cooler side when it begins cooking too quickly or starts to flare. This is especially helpful for chicken, thick steaks, sausages, and foods with sugary sauces.</p></section>
              <section><h3>Keep the Lid Closed</h3><p>Frequently opening the lid releases heat and increases cooking time. Keep it closed whenever possible, especially for thick cuts, bone-in meats, and indirect cooking. Open only to turn, move, sauce, or check the food.</p></section>
              <section><h3>Prevent Food from Sticking</h3><p>Start with clean, fully preheated grates. Pat food dry, lightly coat it with oil, and let it cook undisturbed until it releases naturally. Avoid repeatedly flipping or moving food.</p></section>
              <section><h3>Managing Flare-Ups</h3><ol><li>Move food to a cooler part of the grill.</li><li>Close the lid briefly.</li><li>Reduce the burner setting if needed.</li><li>Remove excess grease after the grill cools.</li></ol><p>Do not spray water onto a gas grill; it can spread grease, damage hot parts, and create steam burns.</p></section>
              <section><h3>Sauces and Marinades</h3><p>Discard marinade that touched raw meat unless it is boiled thoroughly before reuse. Brush sweet barbecue sauces on during the final few minutes because sugar burns quickly.</p></section>
              <section><h3>Check Doneness</h3><p>Use an instant-read thermometer in the thickest part, avoiding bone. Cook poultry to at least 165°F and cook ground meats thoroughly. Clean the probe after checking raw or partially cooked food.</p></section>
              <section><h3>Let Meat Rest</h3><p>Allow meat to rest before slicing so juices redistribute. Small cuts may need only a few minutes; larger steaks, roasts, and whole chickens benefit from a longer rest.</p></section>
              <section><h3>Cleaning After Cooking</h3><p>Run the grill on high for several minutes with the lid closed, then turn off the burners and gas. Clean warm grates carefully. Once cool, empty the drip pan, remove grease buildup, wipe exterior surfaces, and check burner openings.</p></section>
              <section><h3>Deep Cleaning</h3><p>Several times each season, disconnect the propane tank and clean the grates, heat shields, burner covers, and grease tray according to the manufacturer’s instructions. Clear clogged burner ports without enlarging them and inspect burners for rust, cracks, or uneven flames.</p></section>
              <section><h3>Checking for Gas Leaks</h3><p>With burners off, apply dish soap and water to the tank-regulator connection and slowly open the tank valve. Growing bubbles may indicate a leak. Close the gas immediately and do not light the grill until corrected. Never use a flame to test for leaks.</p></section>
              <section><h3>Propane Tank Care</h3><p>Store tanks outdoors and upright, away from heat, sparks, flames, and enclosed living spaces. Close the valve after every use. Transport tanks upright and secured, and never leave one inside a hot vehicle.</p></section>
              <section><h3>Protecting the Grill</h3><p>Use a fitted cover only after the grill is fully cool. Place the grill on a stable, level, nonflammable surface away from siding, railings, branches, roof overhangs, and combustible materials. Never operate it indoors, in a garage, or in a poorly ventilated area.</p></section>
              <section><h3>Helpful Grilling Habits</h3><ul><li>Use separate plates and utensils for raw and cooked food.</li><li>Prepare ingredients and tools before lighting.</li><li>Use long-handled grilling tools.</li><li>Clean grease buildup regularly.</li><li>Keep children and pets away.</li><li>Never leave a lit grill unattended.</li></ul></section>
            </div>

            <section className="gasGrillChecklist">
              <div><h3>Before Cooking</h3><ul><li>Open the lid.</li><li>Check the tank, hose, and connections.</li><li>Confirm the grease tray is clean.</li><li>Preheat the grill.</li><li>Clean the grates.</li><li>Create hot and cool zones.</li></ul></div>
              <div><h3>After Cooking</h3><ul><li>Burn off loose residue.</li><li>Clean the warm grates.</li><li>Turn off the burners.</li><li>Close the propane-tank valve.</li><li>Empty the grease tray when cool.</li><li>Cover only after fully cooled.</li></ul></div>
            </section>

            <p className="gasGrillGuideClosing">With consistent cleaning and careful heat control, a gas grill can provide years of reliable service and make outdoor cooking easier, safer, and more enjoyable.</p>
          </article>
        </HeroTopicPage>
      )}
      {activePage === "Smoker Recipes" && (
        <HeroTopicPage
          eyebrow="COOKING METHODS"
          title="Tips: Smoker & Pellet Grills"
          heroImage="images/heroes/hero-page-pellet-smoker.jpg"
          heroAlt="Pellet smoker with brisket, sliced smoked meat, pellets, towel, and potted plant"
          text="Pellet smokers make it possible to cook meats and other foods with steady heat and wood-smoke flavor. They are especially well suited to low-and-slow cooking, but many models can also roast, bake, grill, and finish foods at higher temperatures.\n\nThis section includes recipes and guidance for seasoning, pellet selection, cooking temperatures, wrapping, moisture, resting, and serving. The emphasis is on practical home cooking rather than professional barbecue competition techniques."
          setActivePage={setActivePage}
          primaryPage="About Smoking"
          primaryLabel="About Smoking & Grilling"
        >
          <article className="gasGrillGuide pelletSmokerGuide" aria-labelledby="pellet-smoker-guide-title">
            <header className="gasGrillGuideHeader">
              <span className="gasGrillGuideKicker">Pellet Smoker Care & Cooking Guide</span>
              <h2 id="pellet-smoker-guide-title">Taking Care of and Cooking on a Pellet Smoker</h2>
              <p>A pellet smoker combines the convenience of digital temperature control with the flavor of wood-fired cooking. Proper cleaning, dry pellet storage, and a few basic cooking techniques will help your smoker operate reliably, produce steady heat, and give food a clean, balanced smoke flavor.</p>
            </header>

            <div className="gasGrillGuideGrid pelletSmokerGuideGrid">
              <section><h3>Before Each Use</h3><p>Check the hopper and make sure the wood pellets are dry, firm, and free of moisture. Damp pellets can swell, crumble, jam the auger, and prevent the smoker from maintaining temperature.</p><p>Inspect the fire pot for excessive ash. A thin layer is normal, but accumulated ash can interfere with ignition and airflow.</p><p>Confirm that the grease tray, heat diffuser, and drip bucket are correctly installed.</p><p>Check the grease drain channel and make sure it is not blocked.</p><p>Look inside the cooking chamber for grease buildup, loose food particles, or anything that could restrict airflow.</p><p>Make sure the smoker is positioned outdoors on a stable, level, noncombustible surface with adequate clearance from walls, railings, overhangs, and combustible materials.</p></section>
              <section><h3>Starting the Pellet Smoker</h3><p>Follow the manufacturer’s recommended startup procedure for your model.</p><p>Many pellet smokers should be started with the lid open until the pellets ignite and a steady flame is established. Other models are designed to begin their startup cycle with the lid closed.</p><p>Make sure pellets are feeding into the fire pot and that the igniter has successfully started the fire.</p><p>Allow the smoker to complete its startup cycle before selecting the final cooking temperature.</p><p>Preheat the smoker for approximately 10 to 20 minutes, or until the cooking chamber has reached a stable temperature.</p><p>Avoid placing food inside while the smoker is still producing heavy white startup smoke. Clean, light smoke produces better flavor than thick, bitter smoke.</p></section>
              <section><h3>Choosing Wood Pellets</h3><p>Use only food-grade hardwood pellets made specifically for pellet grills and smokers.</p><p>Do not use heating pellets, fireplace pellets, or pellets containing binders, chemicals, or unknown wood materials.</p><p>Different woods produce different flavor profiles:</p><ul><li>Hickory provides a strong, traditional barbecue flavor.</li><li>Oak produces a balanced smoke that works well with most meats.</li><li>Mesquite gives food a bold, intense smoke flavor and should be used carefully.</li><li>Apple and cherry provide a mild, slightly sweet flavor.</li><li>Pecan offers a rich, nutty smoke that is milder than hickory.</li><li>Maple produces a light, slightly sweet smoke.</li></ul><p>Pellet blends are a good all-purpose option when cooking several different foods at the same time.</p></section>
              <section><h3>Managing Temperature</h3><p>Pellet smokers automatically feed pellets into the fire pot to maintain the selected temperature. Outdoor temperature, wind, rain, pellet quality, and how often the lid is opened can affect performance.</p><p>Keep the lid closed as much as possible. Opening the smoker allows heat and smoke to escape and can significantly increase cooking time.</p><p>Use a reliable meat thermometer to monitor the internal temperature of the food. The smoker’s built-in temperature display measures the cooking chamber, not the center of the meat.</p><p>For long cooks, check the pellet level periodically. Do not allow the hopper to run empty.</p><p>Place the smoker away from strong wind when possible. Wind can affect combustion, increase pellet use, and cause temperature fluctuations.</p><p>An insulated smoker blanket may help maintain temperature during cold weather, but it should be approved for the specific smoker model.</p></section>
              <section><h3>Low-and-Slow Cooking</h3><p>Pellet smokers are especially effective for brisket, pork shoulder, ribs, poultry, roasts, and other foods that benefit from slow cooking.</p><p>Common smoking temperatures range from approximately 180°F to 275°F, depending on the food and desired cooking time.</p><p>Lower temperatures generally produce more smoke flavor, while higher temperatures cook food faster and create better browning.</p><p>For larger cuts of meat, cook according to internal temperature and tenderness rather than relying only on time.</p><p>Use a temperature probe when possible, but verify the final temperature in several areas with an instant-read thermometer.</p><p>Allow large cuts of meat to rest after cooking so the juices can redistribute.</p></section>
              <section><h3>Using Smoke Settings</h3><p>Some pellet smokers have a smoke setting or adjustable smoke-control feature.</p><p>Smoke settings usually work best at lower cooking temperatures. At higher temperatures, the fire burns more efficiently and produces less visible smoke.</p><p>A small amount of light blue or nearly invisible smoke is ideal. Thick white or gray smoke can create a bitter or sooty flavor.</p><p>Food absorbs smoke most readily during the earlier part of the cooking process, especially while the surface is still cool and moist.</p><p>Do not continually add extra smoke just because the smoke is difficult to see. Clean smoke is often barely visible.</p></section>
              <section><h3>Preventing Dry Food</h3><p>Pellet smokers use circulating heat, which can dry the surface of food during long cooks.</p><p>Lightly coat meat with oil, mustard, sauce, or another binder before applying seasoning.</p><p>A water pan can add moisture to the cooking chamber and help stabilize temperature, particularly during long cooks.</p><p>Spritzing meat may help keep the surface moist, but opening the lid too often will slow the cook.</p><p>Wrapping large cuts in butcher paper or foil can reduce moisture loss and help the food cook through the stall.</p><p>Avoid wrapping too early if you want a firm, well-developed bark.</p></section>
              <section><h3>Searing and High-Heat Cooking</h3><p>Many pellet smokers can roast and grill at higher temperatures, but most do not sear as intensely as a charcoal or gas grill.</p><p>For better browning, preheat the smoker thoroughly and use the highest recommended temperature.</p><p>Some models have a direct-flame searing area or movable heat shield. Use these features only as directed by the manufacturer.</p><p>A cast-iron skillet, griddle, or grill grate can improve browning and create a stronger sear.</p><p>Food can also be smoked at a low temperature and then finished over high heat. This technique is commonly called reverse searing.</p><p>Never exceed the smoker’s maximum recommended temperature.</p></section>
              <section><h3>Grease-Fire Prevention</h3><p>Grease buildup is one of the most common causes of pellet-smoker fires.</p><p>Keep the grease tray, drain channel, and drip bucket clean.</p><p>Use disposable grease-tray liners only if they do not block airflow or interfere with grease drainage.</p><p>Trim excessive exterior fat from large cuts of meat when appropriate.</p><p>Be especially careful when increasing the temperature after a long, low-temperature cook. Accumulated grease can ignite when exposed to sudden high heat.</p><p>Never leave the smoker unattended while cooking at high temperatures.</p><p>If a grease fire occurs, keep the lid closed, turn off and unplug the smoker if it is safe to do so, and close the hopper lid.</p><p>Do not pour water onto a grease fire.</p></section>
              <section><h3>Cleaning After Cooking</h3><p>After removing the food, follow the smoker’s recommended shutdown cycle.</p><p>Do not unplug the smoker before the shutdown cycle is complete. The fan may need to continue running to burn out the remaining pellets and cool the fire pot safely.</p><p>Once the smoker is completely cool, scrape food residue from the cooking grates.</p><p>Empty the grease bucket before it becomes full.</p><p>Wipe grease and loose debris from the drip tray and grease channel.</p><p>Do not use excessive water inside the cooking chamber. Moisture can damage electrical components and cause pellets or pellet dust to swell.</p><p>Avoid using harsh oven cleaner unless the manufacturer specifically approves it.</p></section>
              <section><h3>Cleaning the Fire Pot</h3><p>Ash should be removed regularly to maintain reliable ignition and steady airflow.</p><p>Make sure the smoker is turned off, unplugged, and completely cool.</p><p>Remove the cooking grates, grease tray, and heat diffuser.</p><p>Use an ash vacuum or shop vacuum designed for cold ash to clean the fire pot and the bottom of the cooking chamber.</p><p>Never vacuum warm ash, burning pellets, or hot embers.</p><p>Check that the igniter is not buried in ash or blocked by debris.</p><p>The fire pot may need to be cleaned every few cooking sessions or before each long cook, depending on the smoker and the amount of ash produced.</p></section>
              <section><h3>Cleaning the Temperature Sensor</h3><p>Most pellet smokers have an internal temperature sensor mounted on the wall of the cooking chamber.</p><p>Grease and smoke residue can coat the sensor and cause inaccurate temperature readings.</p><p>When the smoker is cool, gently wipe the sensor with a damp cloth.</p><p>Do not bend, scrape, or damage the sensor.</p><p>If cooking temperatures become unusually unstable, inspect and clean the sensor before assuming the controller has failed.</p></section>
              <section><h3>Caring for the Hopper and Auger</h3><p>Keep the hopper covered and protected from rain and humidity.</p><p>Do not leave pellets in the hopper for extended periods in damp conditions.</p><p>If the smoker will not be used for several weeks, empty the hopper and run the auger until most remaining pellets have cleared.</p><p>Vacuum loose pellet dust from the bottom of the hopper periodically.</p><p>Excessive pellet dust can restrict pellet flow or contribute to auger jams.</p><p>Never place fingers, tools, or other objects into the auger while the smoker is plugged in.</p></section>
              <section><h3>Pellet Storage</h3><p>Store wood pellets indoors in a dry, sealed container.</p><p>Keep pellet bags off concrete floors, where they may absorb moisture.</p><p>Discard pellets that are soft, swollen, crumbling, or damp.</p><p>Healthy pellets should be firm, smooth, and break with a clean snap.</p><p>Do not mix damaged pellets with fresh pellets.</p></section>
              <section><h3>Weather Protection</h3><p>Pellet smokers contain electrical controls, motors, fans, and wiring that must be protected from moisture.</p><p>Do not operate the smoker in heavy rain unless it is specifically designed and safely protected for those conditions.</p><p>Never allow electrical cords, plugs, or controllers to sit in standing water.</p><p>Use an outdoor-rated grounded electrical outlet.</p><p>Avoid lightweight household extension cords. If an extension cord is necessary, use a properly rated outdoor cord that meets the manufacturer’s requirements.</p><p>Cover the smoker only after it is fully cool and dry.</p><p>A fitted weather-resistant cover will help protect the hopper, controller, and metal surfaces.</p></section>
              <section><h3>Routine Maintenance</h3><p>Inspect the power cord and plug for damage.</p><p>Check the lid gasket, door seal, and cooking-chamber seams for excessive smoke leakage.</p><p>Inspect the grease drain and drip bucket.</p><p>Check the fire pot for cracks, burn-through, or corrosion.</p><p>Make sure the fan and auger operate without unusual grinding, squealing, or clicking sounds.</p><p>Inspect the hopper lid and seals to make sure water cannot easily reach the pellets.</p><p>Tighten loose handles, shelves, wheels, and fasteners.</p><p>Replace damaged parts with components approved for the smoker model.</p></section>
              <section><h3>Cooking Safety</h3><p>Always use the pellet smoker outdoors in a well-ventilated area.</p><p>Never operate it inside a house, garage, enclosed porch, tent, shed, or other enclosed space.</p><p>Keep children and pets away from the smoker, grease bucket, electrical cord, and hot surfaces.</p><p>Use heat-resistant gloves and long-handled cooking tools.</p><p>Keep raw meat separate from cooked food and clean utensils.</p><p>Wash hands, cutting boards, knives, and preparation surfaces after contact with raw meat.</p><p>Use a food thermometer to verify safe internal temperatures.</p><p>Refrigerate leftovers promptly and store them in shallow, covered containers.</p></section>
              <section><h3>Shutting Down the Smoker</h3><p>Remove the food and set the controller to the manufacturer’s shutdown mode.</p><p>Allow the shutdown cycle to finish completely.</p><p>The combustion fan may continue operating for several minutes.</p><p>Once the smoker has cooled and the shutdown cycle is complete, turn off the power and unplug it if recommended.</p><p>Check the grease bucket and cooking chamber after the smoker has cooled.</p><p>Do not place the cover on the smoker while any part of it is still warm.</p></section>
              <section><h3>Long-Term Storage</h3><p>Clean the cooking chamber, grease tray, fire pot, and grease bucket.</p><p>Empty the hopper and remove loose pellet dust.</p><p>Store unused pellets in a sealed container indoors.</p><p>Make sure the smoker is completely dry.</p><p>Cover it with a fitted weather-resistant cover.</p><p>If possible, store the smoker beneath a roof or in a protected outdoor area.</p><p>Inspect the smoker for insects, moisture, corrosion, and damaged wiring before using it again.</p></section>
              <section><h3>Helpful Pellet-Smoker Tips</h3><p>Allow extra cooking time when smoking large cuts of meat. Barbecue is finished when it reaches the proper temperature and tenderness, not simply when the planned cooking time has passed.</p><p>Keep a second bag of pellets available during long cooks.</p><p>Use a separate ambient-temperature probe if you want to verify the temperature near the food.</p><p>Rotate food when necessary because some pellet smokers have hotter areas near the fire pot or chimney.</p><p>Keep notes about pellet type, smoker temperature, cooking time, weather, and results. This makes successful cooks easier to repeat.</p><p>Clean smoke, steady heat, dry pellets, and accurate temperature readings are the keys to consistent pellet-smoker cooking.</p></section>
            </div>

            <p className="gasGrillGuideClosing">Clean smoke, steady heat, dry pellets, and accurate temperature readings are the keys to consistent pellet-smoker cooking.</p>
          </article>
        </HeroTopicPage>
      )}
{activePage === "Cooking Methods" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-air-fryer.png"
            alt="Air fryer with wings and potatoes on a kitchen counter"
            eyebrow="COOKING METHODS"
            title="Cooking Methods"
            text="Different cooking methods can produce very different results, even when the ingredients are similar. This section organizes recipes according to the appliance or equipment used, making it easier to find meals that fit your kitchen and your available time.\n\nChoose the method you enjoy most, or use these pages to become more comfortable with equipment you do not use often. Each section may also include practical tips for temperatures, timing, preparation, and cleanup."
          />
          <PlaceholderInfoPage
            eyebrow="COOKING METHODS"
            title="Cooking Methods"
            text="This page will help visitors browse recipes by appliance or method, including air fryer, oven, microwave, gas grill, smoker, stovetop, slow cooker, and other practical cooking options."
            setActivePage={setActivePage}
            recipes={classifiedRecipes}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            addToPlan={addToPlan}
            openRecipeCard={openRecipeCard}
          />
        </>
      )}
      {activePage === "Suggested Meal Plans" && (
        <HeroTopicPage
          eyebrow="OUR RECIPES"
          title="Suggested Meal Plans"
          heroImage="images/heroes/hero-weekly-plan.png"
          heroAlt="Weekly meal planner with fresh vegetables"
          text="This page will collect practical meal-plan ideas for smaller households, planned leftovers, freezer meals, and easy weekly routines."
          setActivePage={setActivePage}
          primaryPage="Meal Planner"
          primaryLabel="Plan Your Meals"
        />
      )}
      {activePage === "Bread Tips" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-page-breadmaking.png"
            alt="Breadmaking setup with sliced loaf, dough, flour, yeast, loaf pan, measuring spoons, and kitchen towel"
            eyebrow="TIPS & ORGANIZATION"
            title="Tips: Breadmaking"
            className="pageHeroDepth464"
            text="Breadmaking can seem intimidating, but most breads depend on a few basic ingredients and repeatable steps. Understanding yeast, flour, liquid temperature, kneading, rising, shaping, and baking will make the process easier to manage.\n\nThese tips are intended for both bread machines and traditional preparation. They can help explain why dough behaves differently from one day to another and how small adjustments can improve the finished loaf or roll."
          />
          <PlaceholderInfoPage
            eyebrow="TIPS & TECHNIQUES"
            title="Baking Your Own Breads"
            text="This page will include practical bread-baking tips, freezer ideas, recipe-card guidance, and simple ways to bake breads and rolls at home."
            setActivePage={setActivePage}
            recipes={classifiedRecipes}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            addToPlan={addToPlan}
            openRecipeCard={openRecipeCard}
          />

          <section className="gasGrillGuide breadMakingGuide" aria-labelledby="bread-making-guide-title">
            <header className="gasGrillGuideHeader">
              <span className="gasGrillGuideKicker">Breadmaking Care & Cooking Guide</span>
              <h2 id="bread-making-guide-title">Making Bread by Hand or With a Bread Machine</h2>
              <p>Homemade bread can be prepared entirely by hand, mixed and kneaded with a stand mixer, or made in a bread machine. Each method can produce excellent results when the ingredients are measured accurately, the dough is allowed to rise properly, and the bread is baked until fully cooked.</p>
            </header>

            <div className="gasGrillGuideGrid breadMakingGuideGrid">
              <section><h3>Before You Begin</h3><p>Read the entire recipe before starting. Bread recipes often include several resting, rising, shaping, and baking stages.</p><p>Check that the yeast is fresh and has not passed its expiration date. Old or improperly stored yeast may cause the dough to rise slowly or not rise at all.</p><p>Use the type of flour listed in the recipe. Bread flour contains more protein than all-purpose flour and usually creates a stronger, chewier loaf.</p><p>Measure ingredients carefully. For the most reliable results, weigh flour with a kitchen scale. When using measuring cups, spoon the flour lightly into the cup and level it without packing.</p><p>Use liquids at the temperature recommended by the recipe. Water or milk that is too hot can damage the yeast, while cold liquid may slow the rising process.</p></section>
              <section><h3>Understanding Yeast</h3><p>Active dry yeast is commonly dissolved in warm liquid before being mixed with the remaining ingredients.</p><p>Instant yeast or bread-machine yeast may usually be mixed directly into the flour.</p><p>When proofing yeast, the liquid should generally feel comfortably warm rather than hot. After several minutes, the mixture should appear creamy or foamy.</p><p>If the yeast does not foam when the recipe says it should, the yeast may be inactive or the liquid temperature may have been incorrect.</p><p>Salt adds flavor and helps control yeast activity. Do not omit it unless the recipe has been specifically developed without salt.</p><p>Avoid placing concentrated salt directly against the yeast when loading a bread machine for delayed baking.</p></section>
              <section><h3>Making Bread by Hand</h3><p>Combine the ingredients in a large mixing bowl according to the recipe. Begin with a sturdy spoon or dough whisk, then use your hands when the dough becomes too thick to stir.</p><p>Turn the dough onto a lightly floured work surface. Add only enough extra flour to prevent excessive sticking.</p><p>Knead by pushing the dough away with the heel of your hand, folding it back over itself, rotating it, and repeating.</p><p>Most yeast doughs require approximately 8 to 12 minutes of hand kneading, although the exact time varies.</p><p>Properly kneaded dough should feel smooth, elastic, and slightly tacky rather than wet or heavily coated with flour.</p><p>To test the dough, stretch a small piece gently between your fingers. If it forms a thin, nearly translucent membrane before tearing, it has developed sufficient gluten. This is commonly called the windowpane test.</p></section>
              <section><h3>Using a Stand Mixer</h3><p>Use the dough hook attachment rather than a flat beater once the ingredients have combined.</p><p>Mix on a low speed to prevent flour from scattering and to avoid overheating the dough.</p><p>Do not exceed the mixer manufacturer’s recommended speed or maximum dough capacity.</p><p>Mixer kneading usually takes less time than hand kneading. Check the dough frequently rather than relying only on the time listed in the recipe.</p><p>Stop the mixer if it begins moving across the counter or if the motor becomes unusually warm.</p></section>
              <section><h3>The First Rise</h3><p>Place the dough in a lightly greased bowl and turn it once so the surface is lightly coated.</p><p>Cover the bowl with plastic wrap, a reusable cover, or a clean damp towel to prevent the dough from drying out.</p><p>Allow the dough to rise in a warm, draft-free location. A temperature of approximately 75°F to 80°F is comfortable for many yeast doughs.</p><p>Do not place the dough directly on a hot stove, heating pad, or other surface that could overheat the yeast.</p><p>Rising times are estimates. Judge the dough by its appearance and volume rather than by the clock alone.</p><p>Most doughs are ready when they have approximately doubled in size. To test, gently press two fingers into the dough. If the indentations remain, the rise is usually complete.</p></section>
              <section><h3>Shaping the Dough</h3><p>Gently deflate the risen dough to release large air pockets. Avoid aggressively punching or tearing it.</p><p>Shape the dough according to the recipe, creating enough surface tension to help the loaf hold its form.</p><p>For a loaf-pan bread, flatten the dough into a rectangle, roll it tightly, pinch the seam closed, and place it seam-side down in the prepared pan.</p><p>For rolls, divide the dough into evenly sized portions. Weighing the pieces helps them bake at the same rate.</p><p>Allow shaped dough to rest briefly if it repeatedly springs back or resists stretching.</p></section>
              <section><h3>The Final Rise</h3><p>Cover the shaped dough loosely and allow it to rise again before baking.</p><p>The dough is usually ready when it appears puffy and slowly springs back after being touched lightly.</p><p>Under-proofed dough may split unpredictably or form a dense loaf.</p><p>Over-proofed dough may collapse, spread, or fail to rise properly in the oven.</p><p>Begin preheating the oven before the final rise is complete so the bread can be baked as soon as it is ready.</p></section>
              <section><h3>Baking Bread in the Oven</h3><p>Position the oven rack as directed, usually near the center of the oven.</p><p>Preheat the oven fully before adding the bread.</p><p>Bake the loaf until it is evenly browned and sounds hollow when tapped on the bottom.</p><p>For greater accuracy, check the internal temperature with an instant-read thermometer inserted into the center of the loaf.</p><p>Many lean yeast breads are fully baked at approximately 190°F to 200°F. Enriched or dense breads may require a slightly different temperature, so follow the recipe when one is provided.</p><p>If the crust browns too quickly, loosely cover the loaf with aluminum foil during the final portion of baking.</p><p>Remove bread from the pan promptly unless the recipe says otherwise. Leaving it in the pan may create a damp or soggy crust.</p><p>Cool the loaf on a wire rack. Cutting bread while it is very hot can compress the interior and make it appear gummy.</p></section>
              <section><h3>Using a Bread Machine</h3><p>Read the bread-machine instruction manual before using a new recipe. Machines vary in capacity, cycle length, ingredient order, and available settings.</p><p>Use a recipe designed for the size of your machine. Do not exceed the manufacturer’s maximum loaf capacity.</p><p>Add ingredients to the bread pan in the order recommended by the machine manufacturer. Many machines require liquids first, followed by dry ingredients, with yeast added last.</p><p>Before inserting the pan, confirm that the kneading paddle is properly installed.</p><p>Keep the outside and bottom of the bread pan clean and dry before placing it into the machine.</p><p>Select the correct loaf size, crust setting, and bread cycle before starting.</p></section>
              <section><h3>Checking Bread-Machine Dough</h3><p>Open the lid briefly during the first several minutes of mixing to inspect the dough, unless the manufacturer advises against it.</p><p>The dough should form a soft, smooth ball that clears most of the sides of the pan while remaining slightly tacky.</p><p>If the dough looks wet and smears along the pan, add flour one tablespoon at a time.</p><p>If the dough looks dry, crumbly, or stiff, add water one teaspoon at a time.</p><p>Allow the machine to mix for a minute or two after each adjustment before adding more.</p><p>Humidity, flour storage, room temperature, and ingredient brands can affect how much liquid the dough requires.</p><p>Avoid opening the lid repeatedly during the rising or baking portions of the cycle because heat may escape.</p></section>
              <section><h3>Bread-Machine Ingredients</h3><p>Bread-machine yeast or instant yeast generally works best for standard machine cycles.</p><p>Use room-temperature ingredients unless the machine instructions or recipe says otherwise.</p><p>Cut butter into small pieces so it distributes evenly during mixing.</p><p>Powdered milk is used in some bread-machine recipes because it can be safely combined with dry ingredients, particularly during a delayed cycle.</p><p>Do not use perishable ingredients such as fresh milk, eggs, soft cheese, or refrigerated ingredients with a delayed-start cycle unless the manufacturer specifically states that it is safe.</p></section>
              <section><h3>Adding Fruit, Nuts, Cheese, or Seeds</h3><p>Add mix-ins when the machine signals, when the dispenser releases them, or at the time directed by the recipe.</p><p>Adding heavy ingredients too early may cause them to be crushed or interfere with gluten development.</p><p>Drain moist ingredients thoroughly and pat them dry when possible.</p><p>Coat sticky dried fruit lightly with flour to help separate the pieces.</p><p>Do not exceed the recommended quantity of mix-ins because excessive additions can make the loaf heavy or damage the machine.</p></section>
              <section><h3>Using the Dough Cycle</h3><p>The dough cycle mixes, kneads, and completes the first rise without baking the bread.</p><p>After the cycle ends, remove the dough, shape it, allow it to complete its final rise, and bake it in a conventional oven.</p><p>The dough cycle is useful for rolls, hamburger buns, pizza dough, cinnamon rolls, baguettes, and shaped loaves.</p><p>Check the dough during the first mixing stage and make small flour or water adjustments when necessary.</p><p>Remove the dough promptly when the cycle is complete so it does not over-rise inside the machine.</p></section>
              <section><h3>Removing Bread From a Bread Machine</h3><p>Use oven mitts when removing the bread pan because the pan, handle, and surrounding surfaces will be hot.</p><p>Allow the loaf to rest in the pan only as long as recommended by the manufacturer, usually several minutes.</p><p>Turn the pan upside down and shake it gently until the loaf releases.</p><p>Do not use metal utensils or knives inside a nonstick bread pan because they may scratch the coating.</p><p>Remove the kneading paddle carefully if it remains inside the loaf. Use the manufacturer’s paddle-removal tool when one is provided.</p><p>Cool the loaf completely on a wire rack before slicing.</p></section>
              <section><h3>Common Bread Problems</h3><p>A loaf that does not rise may be caused by inactive yeast, liquid that was too hot or too cold, too much salt, insufficient rising time, or a room that was too cool.</p><p>A loaf that rises and then collapses may contain too much yeast or liquid, too little flour or salt, or may have risen too long.</p><p>A dense loaf may result from too much flour, insufficient kneading, inadequate rising, or slicing before the loaf has cooled.</p><p>A dry or crumbly loaf may contain too much flour or may have been baked too long.</p><p>A gummy interior usually indicates that the loaf was underbaked or cut while still too hot.</p><p>A large hole beneath the top crust may be caused by over-proofing, excessive yeast, or too much liquid.</p><p>A pale crust may result from a low baking temperature, a light bread-machine crust setting, or insufficient sugar or milk in the recipe.</p></section>
              <section><h3>Flour and Weather Adjustments</h3><p>Flour absorbs moisture differently depending on humidity, storage conditions, and brand.</p><p>On humid days, the dough may require slightly more flour.</p><p>In dry conditions, the dough may require slightly more liquid.</p><p>Make adjustments gradually. A small amount of flour or water can significantly change the texture of bread dough.</p><p>Do not add large amounts of flour simply because the dough initially feels sticky. Many doughs become smoother as kneading continues.</p></section>
              <section><h3>Cooling, Slicing, and Storage</h3><p>Allow bread to cool completely before placing it in a storage container.</p><p>Use a serrated bread knife and a gentle sawing motion to avoid crushing the loaf.</p><p>Store soft sandwich bread in an airtight bag or container at room temperature.</p><p>Store crusty artisan-style bread in paper or a bread box for short-term use. Airtight storage softens the crust.</p><p>Avoid refrigerating most bread because refrigeration can cause it to become stale more quickly.</p><p>For longer storage, slice the cooled loaf and freeze it in a freezer-safe bag or airtight container.</p><p>Place parchment or waxed paper between slices when individual removal is desired.</p><p>Thaw bread at room temperature, toast slices directly from frozen, or warm a whole loaf briefly in the oven.</p></section>
              <section><h3>Cleaning and Maintaining a Bread Machine</h3><p>Unplug the machine and allow it to cool completely before cleaning.</p><p>Remove the bread pan and kneading paddle after each use.</p><p>Wash removable parts according to the manufacturer’s directions. Many nonstick bread pans should be washed by hand rather than placed in a dishwasher.</p><p>Use a soft cloth or sponge. Avoid abrasive cleaners, steel wool, or metal utensils.</p><p>Do not immerse the bread-machine body, electrical cord, or heating chamber in water.</p><p>Wipe flour, crumbs, and dried dough from the interior after the machine has cooled.</p><p>Check beneath and around the kneading paddle for trapped dough.</p><p>Dry the bread pan and paddle thoroughly before reassembling or storing them.</p><p>Do not pour ingredients directly into the machine without the bread pan installed.</p></section>
              <section><h3>Safety Tips</h3><p>Keep the bread machine on a stable, heat-resistant surface with adequate ventilation.</p><p>Do not place it beneath low cabinets or near curtains while it is operating.</p><p>Keep hands, utensils, and loose clothing away from moving parts.</p><p>Never reach into the bread pan while the machine is mixing.</p><p>Use oven mitts when handling freshly baked bread, pans, paddles, or oven racks.</p><p>Do not leave a bread machine running unattended until you are familiar with the recipe and the machine’s operation.</p><p>Unplug the machine when it is not in use and before cleaning or removing trapped food.</p></section>
            </div>
          </section>
        </>
      )}
      {activePage === "Submit Recipes" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-page-family.png"
            alt="Family recipe setup with vintage recipe binder, handwritten cards, coffee, potted plant, bread, and old family photograph"
            eyebrow="TIPS & ORGANIZATION"
            title="Submit Your Family Recipes"
            className="pageHeroDepth464"
            text="Family recipes often carry stories and memories that are just as important as the ingredients. A handwritten card, a holiday dish, or a meal someone prepared for years can become difficult to preserve if it is never organized or recorded.\n\nUse this page to share a favorite family recipe or food memory. Submitted recipes may be reviewed, clarified, formatted, and adapted so they can be preserved in a clean and useful form."
          />
          <PlaceholderInfoPage
            eyebrow="TIPS & TECHNIQUES"
            title="Submit Your Family Recipes"
            text="This page will explain how visitors can suggest recipe ideas, family favorites, copycat-style meals, or practical cooking tips for future consideration."
            setActivePage={setActivePage}
            recipes={classifiedRecipes}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            addToPlan={addToPlan}
            openRecipeCard={openRecipeCard}
          />
        </>
      )}
      {activePage === "Safe Cooking Rules" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-page-food-safety.png"
            alt="Food-safety setup with meal-prep containers, salad, digital thermometer, coffee, and kitchen towel"
            eyebrow="TIPS & ORGANIZATION"
            title="Food Safety"
            className="pageHeroDepth464"
            text="Basic food-safety reminders for cooking, cooling, freezing, thawing, reheating, and checking safe internal temperatures."
          />
          <PlaceholderInfoPage
            eyebrow="TIPS & TECHNIQUES"
            title="Food Safety"
            text="This page will collect basic food-safety reminders for cooking, cooling, freezing, thawing, reheating, and checking safe internal temperatures."
            setActivePage={setActivePage}
            recipes={classifiedRecipes}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            addToPlan={addToPlan}
            openRecipeCard={openRecipeCard}
          />
          <article className="gasGrillGuide foodSafetyGuide" aria-labelledby="food-safety-guide-title">
            <header className="gasGrillGuideHeader">
              <span className="gasGrillGuideKicker">Food Handling, Cooking & Storage Guide</span>
              <h2 id="food-safety-guide-title">Food Safety Rules for Handling, Cooking, and Storage</h2>
              <p>Safe food handling helps prevent cross-contamination, spoilage, and foodborne illness. Harmful bacteria cannot always be seen, smelled, or tasted, so food should be handled safely from the time it is purchased until it is served or stored.</p>
              <p>The four basic food-safety rules are <strong>Clean, Separate, Cook, and Chill</strong>.</p>
            </header>

            <div className="gasGrillGuideGrid">
              <section><h3>Clean Hands, Equipment, and Surfaces</h3>
<p>Wash your hands with soap and running water before preparing food and after handling raw meat, poultry, seafood, eggs, garbage, pets, or anything else that may carry germs.</p>
<p>Wash cutting boards, knives, dishes, utensils, counters, and other work surfaces with hot, soapy water after each use.</p>
<p>Use clean dishcloths and towels. Replace or wash them frequently because damp cloths and sponges can spread bacteria around the kitchen.</p>
<p>Rinse fresh fruits and vegetables under clean running water before cutting, peeling, cooking, or eating them. Do not use soap, bleach, or household cleaning products on food.</p>
<p>Do not wash raw chicken, turkey, or other poultry. Splashing water can spread bacteria from the poultry to sinks, counters, utensils, and nearby foods.</p>
</section>
              <section><h3>Prevent Cross-Contamination</h3>
<p>Keep raw meat, poultry, seafood, and eggs separate from foods that are ready to eat.</p>
<p>Use separate cutting boards when possible—one for raw meat and poultry and another for vegetables, bread, fruit, cheese, and cooked foods.</p>
<p>Never place cooked food back onto a plate or tray that previously held raw meat, poultry, seafood, or eggs unless the plate has first been thoroughly washed.</p>
<p>Store raw meat, poultry, and seafood in sealed containers or leakproof bags. Place them on the lowest refrigerator shelf so juices cannot drip onto other foods.</p>
<p>Use clean utensils when tasting or serving food. Do not reuse a spoon after tasting unless it has been washed.</p>
</section>
              <section><h3>Handle Groceries Safely</h3>
<p>Select refrigerated and frozen foods near the end of the shopping trip.</p>
<p>Keep raw meat, poultry, and seafood separated from other groceries. Place them in individual bags to help contain leaks.</p>
<p>Take perishable groceries home promptly. During hot weather or long trips, transport them in an insulated cooler with ice or frozen gel packs.</p>
<p>Check packages for tears, leaks, broken seals, swelling, rust, or severe dents. Do not purchase canned goods that are bulging, leaking, or deeply dented along a seam.</p>
</section>
              <section><h3>Thaw Food Safely</h3>
<p>Never thaw meat, poultry, seafood, or other perishable foods on the kitchen counter.</p>
<p>Use one of these safe thawing methods:</p>
<h4>Refrigerator Thawing</h4>
<p>Place the food in a container to catch any liquid and allow it to thaw slowly in the refrigerator. This is generally the safest method.</p>
<h4>Cold-Water Thawing</h4>
<p>Place the food in a leakproof package and submerge it in cold water. Change the water approximately every 30 minutes. Cook the food immediately after thawing.</p>
<h4>Microwave Thawing</h4>
<p>Use the microwave’s defrost setting and cook the food immediately after thawing because portions may begin to warm or cook during the process.</p>
<p>Food may also be cooked directly from frozen when the cooking method and recipe allow it, although additional cooking time will usually be required. Food should not be thawed or marinated at room temperature.</p>
</section>
              <section><h3>Marinate Food Safely</h3>
<p>Always marinate meat, poultry, and seafood in the refrigerator, not on the counter.</p>
<p>Do not reuse marinade that has touched raw food unless it is first brought to a full boil. A safer option is to reserve a separate portion of unused marinade for brushing or serving.</p>
</section>
              <section><h3>Cook Food to a Safe Temperature</h3>
<p>Appearance, texture, and cooking time alone cannot confirm that food is safe. Use a clean food thermometer and check the thickest part of the food without touching bone, heavy fat, or the cooking pan.</p>
<h4>Minimum Internal Temperatures</h4>
<ul><li><strong>Whole cuts of beef, pork, veal, lamb, bison, or goat:</strong> 145°F, followed by at least a 3-minute rest</li><li><strong>Ground beef, pork, veal, lamb, and sausage:</strong> 160°F</li><li><strong>Chicken, turkey, duck, and other poultry:</strong> 165°F</li><li><strong>Ground poultry:</strong> 165°F</li><li><strong>Stuffing and casseroles:</strong> 165°F</li><li><strong>Egg dishes:</strong> 160°F</li><li><strong>Fish:</strong> 145°F, or until the flesh is opaque and separates easily with a fork</li><li><strong>Shrimp, lobster, crab, and scallops:</strong> Cook until the flesh is pearly white and opaque</li><li><strong>Clams, mussels, and oysters:</strong> Cook until the shells open; discard shells that remain closed</li><li><strong>Leftovers:</strong> 165°F</li></ul>
<p>These temperatures reflect current federal food-safety guidance.</p>
<p>Clean the food thermometer before and after each use.</p>
<p>For thin foods such as hamburger patties or chicken breasts, insert the thermometer from the side when necessary so the sensing area reaches the center.</p>
</section>
              <section><h3>Microwave Cooking</h3>
<p>Arrange food evenly and cover it when appropriate to help retain moisture and distribute heat.</p>
<p>Rotate or stir food during cooking to reduce cold spots.</p>
<p>Follow package instructions, including any required standing time after cooking. Standing time allows heat to continue moving through the food.</p>
<p>Check the temperature in several locations, especially when reheating casseroles, soups, meats, and frozen meals. Microwaved leftovers should reach 165°F.</p>
</section>
              <section><h3>Slow Cookers and Warming Appliances</h3>
<p>Thaw meat and poultry before placing them in a slow cooker unless the appliance manufacturer and recipe specifically permit cooking from frozen.</p>
<p>Cut large pieces into smaller portions when needed so they heat safely and evenly.</p>
<p>Keep the lid in place as much as possible during cooking.</p>
<p>A slow cooker may be used to keep fully cooked food hot, but it should not be used to reheat cold leftovers unless the manufacturer specifically states that it is safe for that purpose. Reheat leftovers to 165°F first, then transfer them to the preheated slow cooker for holding.</p>
</section>
              <section><h3>Keep Hot Food Hot and Cold Food Cold</h3>
<p>The food-safety temperature danger zone is between <strong>40°F and 140°F</strong>, where bacteria can multiply rapidly.</p>
<p>Keep hot food at <strong>140°F or above</strong> using a warming tray, slow cooker, chafing dish, or another appropriate heat source.</p>
<p>Keep cold food at <strong>40°F or below</strong> by refrigerating it or placing serving dishes over ice.</p>
</section>
              <section><h3>Follow the Two-Hour Rule</h3>
<p>Refrigerate or freeze perishable foods within two hours of cooking, purchasing, or serving.</p>
<p>When the surrounding temperature is above 90°F—including outdoor cookouts, hot garages, or parked vehicles—refrigerate perishable food within one hour.</p>
<p>Discard food that has remained at unsafe temperatures longer than these limits. Do not taste it to determine whether it is safe.</p>
</section>
              <section><h3>Cool Food Properly</h3>
<p>Divide large quantities of soup, chili, stew, meat, pasta, and casseroles into smaller portions.</p>
<p>Place leftovers in shallow containers so they cool more quickly.</p>
<p>Large cuts of meat may be divided into smaller pieces before refrigeration.</p>
<p>Do not leave food on the counter for several hours to cool. Refrigerate it promptly in suitable containers.</p>
<p>Avoid tightly packing a warm refrigerator with large containers because cold air needs room to circulate.</p>
</section>
              <section><h3>Refrigerator and Freezer Temperatures</h3>
<p>Keep the refrigerator at <strong>40°F or below</strong>.</p>
<p>Keep the freezer at <strong>0°F or below</strong>.</p>
<p>Place an appliance thermometer inside each unit and check it periodically. The refrigerator control setting does not always show the actual temperature.</p>
<p>Avoid overfilling the refrigerator. Cold air must circulate around the food.</p>
<p>A freezer may be packed more tightly, but vents should remain unobstructed.</p>
</section>
              <section><h3>Storing Leftovers</h3>
<p>Refrigerate leftovers promptly in clean, covered containers.</p>
<p>Label containers with the food name and the date prepared.</p>
<p>Most cooked leftovers, soups, stews, casseroles, pizza, and cooked meat or poultry should be eaten or frozen within <strong>three to four days</strong>.</p>
<p>Reheat leftovers to an internal temperature of 165°F.</p>
<p>Bring leftover sauces, soups, and gravies to a boil when reheating them.</p>
<p>Reheat only the amount needed whenever practical. Repeated cycles of warming and cooling reduce quality and increase the chance of unsafe handling.</p>
</section>
              <section><h3>General Refrigerator Storage Times</h3>
<p>These are common home-storage guidelines:</p>
<ul><li><strong>Raw ground meat and ground poultry:</strong> 1 to 2 days</li><li><strong>Raw chicken or turkey:</strong> 1 to 2 days</li><li><strong>Fresh steaks, chops, and roasts:</strong> 3 to 5 days</li><li><strong>Fresh fish:</strong> commonly 1 to 3 days, depending on the type</li><li><strong>Opened luncheon meat:</strong> 3 to 5 days</li><li><strong>Cooked meat and poultry:</strong> 3 to 4 days</li><li><strong>Soups, stews, casseroles, and pizza:</strong> 3 to 4 days</li><li><strong>Hard-cooked eggs:</strong> 1 week</li><li><strong>Raw shell eggs:</strong> 3 to 5 weeks</li></ul>
<p>Storage recommendations vary by product. Follow package dates and manufacturer instructions when they are more restrictive.</p>
</section>
              <section><h3>Freezer Storage</h3>
<p>Freezing at 0°F keeps properly handled food safe for extended periods, but quality may decline over time.</p>
<p>Wrap food tightly in freezer-safe packaging or airtight containers. Remove as much air as practical to reduce freezer burn.</p>
<p>Label each package with the food name, amount, and freezing date.</p>
<p>Freeze foods in meal-sized portions so only the amount needed must be thawed.</p>
<p>Freezer burn affects quality but does not automatically make food unsafe.</p>
</section>
              <section><h3>Safe Serving at Parties and Cookouts</h3>
<p>Use smaller serving dishes and replace them with freshly chilled or heated food rather than leaving large quantities out for long periods.</p>
<p>Keep cold dishes over ice and replenish the ice as needed.</p>
<p>Use chafing dishes, warming trays, or slow cookers to keep hot food at 140°F or above.</p>
<p>Provide separate utensils for each dish.</p>
<p>Keep raw grilling foods and their utensils away from cooked foods.</p>
<p>Use one plate for raw meat going to the grill and a clean plate for the cooked food coming back.</p>
<p>Discard perishable food that has exceeded the two-hour limit, or the one-hour limit when temperatures are above 90°F.</p>
</section>
              <section><h3>Power Outages</h3>
<p>Keep refrigerator and freezer doors closed as much as possible.</p>
<p>An unopened refrigerator generally keeps food cold for about four hours.</p>
<p>A full unopened freezer may maintain a safe temperature for approximately 48 hours, while a half-full freezer may maintain it for approximately 24 hours.</p>
<p>Frozen food that still contains ice crystals or remains at 40°F or below may generally be cooked or refrozen.</p>
<p>Discard perishable refrigerated food that has remained above 40°F for two hours or longer. Never taste food to test its safety.</p>
</section>
              <section><h3>Watch for Signs of Spoilage</h3>
<p>Discard food with mold, unusual discoloration, leaking or swollen packaging, unexpected bubbling, a slimy texture, or an unusual odor.</p>
<p>However, food can contain harmful germs even when it looks and smells normal. Proper handling, temperatures, and storage times remain the most reliable safeguards.</p>
<p>Do not taste questionable food. When its safety is uncertain, throw it away.</p>
</section>
              <section><h3>People at Greater Risk</h3>
<p>Older adults, young children, pregnant people, and people with weakened immune systems are more likely to become seriously ill from foodborne germs.</p>
<p>Extra caution should be taken with raw or undercooked meat, poultry, seafood, eggs, sprouts, unpasteurized dairy products, refrigerated smoked seafood, and other higher-risk foods.</p>
</section>
              <section><h3>Basic Rule to Remember</h3>
<p>When handling food:</p>
<p><strong>Keep it clean. Keep raw and cooked foods separate. Cook it thoroughly. Chill it promptly. When in doubt, throw it out.</strong></p>
</section>
            </div>

            <p className="gasGrillGuideClosing"><strong>Keep it clean. Keep raw and cooked foods separate. Cook it thoroughly. Chill it promptly. When in doubt, throw it out.</strong></p>
          </article>
        </>
      )}
      {activePage === "Storage Organization" && (
        <HeroTopicPage
          eyebrow="TIPS & TECHNIQUES"
          title="Storage & Organization"
          heroImage="images/heroes/hero-page-storage.jpg"
          heroAlt="Storage and organization setup with labeled containers, pantry items, basket, and kitchen notes"
          text="An organized kitchen makes it easier to find ingredients, use the equipment you own, and prepare meals without unnecessary frustration. Better storage can also reduce wasted food and prevent supplies from being forgotten.\n\nExplore ideas for pantries, refrigerators, freezers, cookware, utensils, spices, recipes, and meal-preparation supplies. The goal is not a perfect showroom kitchen, but a practical space that works better for the people using it."
          setActivePage={setActivePage}
          primaryPage="Products I Use"
          primaryLabel="Products I Recommend"
        />
      )}
      {activePage === "Other Interests" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-mission.png"
            alt="Recipe box, notebook, and kitchen organization setup"
            eyebrow="TIPS & ORGANIZATION"
            title="Other Interests"
            text="Additional practical topics, experiments, tools, and ideas that do not fit neatly into the main recipe sections."
          />
          <PlaceholderInfoPage
            eyebrow="TIPS & TECHNIQUES"
            title="Other Interests"
            text="This page will hold additional practical topics, experiments, tools, and ideas that do not fit neatly into the main recipe sections."
            setActivePage={setActivePage}
            recipes={classifiedRecipes}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            addToPlan={addToPlan}
            openRecipeCard={openRecipeCard}
          />
        </>
      )}
      {activePage === "How To Use" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-recipes.png"
            alt="Recipe card organization setup on a kitchen counter"
            eyebrow="OUR RECIPES"
            title="How to Use This Site"
            text="Get the most from the recipe library, meal-planning tools, shopping lists, favorites, and practical kitchen features."
          />
          <HowToUsePage setActivePage={setActivePage} />
        </>
      )}
      {activePage === "About Recipes" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-page-ai-generated.jpg"
            alt="AI-generated recipes setup with recipe box, chicken dinner, notebook, and planning clipboard"
            eyebrow="OUR RECIPES"
            title="AI-Generated, Never Copied"
            text="The recipes on Robert’s Recipe Box are created with the help of artificial intelligence under Robert’s direction. He chooses the meal type, ingredients, flavor profile, number of servings, cooking method, practical goals, and other details that shape each recipe.\n\nThe recipes are not copied and pasted from other food websites or cookbooks. They are developed as original recipe concepts, then reviewed, adjusted, organized, and presented in a consistent format intended to be useful in a real home kitchen."
            className="pageHeroDepth464"
/>
          <AboutRecipesPage setActivePage={setActivePage} />
        </>
      )}
      {activePage === "About Smoking" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-smoker.jpg"
            alt="Pellet smoker with sliced brisket on a cutting board"
            eyebrow="TIPS & ORGANIZATION"
            title="Tips: Smoking Meats"
            text="Smoking meat combines seasoning, controlled heat, smoke, time, and patience. Understanding how those elements work together can help you produce meat that is tender, flavorful, and safely cooked without relying only on the clock.\n\nThis section covers wood pellets, temperatures, bark development, moisture, wrapping, resting, slicing, and common problems. The advice is written for home cooks who want dependable results rather than professional barbecue competition techniques."
          />
          <AboutSmokingPage setActivePage={setActivePage} />
        </>
      )}

      
      {activePage === "Affiliate Marketing" && (
        <>
          <PageHeroImage
            src="images/heroes/hero-page-affiliate.jpg"
            alt="Affiliate marketing setup with laptop dashboard, notebook, coffee, and affiliate partner checklist"
            eyebrow="TIPS & ORGANIZATION"
            title="Affiliate Marketing"
            text="Some pages on Robert’s Recipe Box may include links to products sold by outside retailers. When a visitor makes a qualifying purchase through certain links, the website may receive a small commission without increasing the customer’s price.\n\nAffiliate relationships help support website expenses, recipe development, and future improvements. Product mentions should still be based on usefulness and relevance, and visitors are never required to purchase anything to use the site."
            className="pageHeroDepth464"
/>
          <PlaceholderInfoPage
            eyebrow="TIPS & ORGANIZATION"
            title="Affiliate Marketing"
            text="This page will explain affiliate links, product recommendations, and how Robert’s Recipe Box may earn a small commission from qualifying purchases at no additional cost to the visitor."
            setActivePage={setActivePage}
            recipes={classifiedRecipes}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            addToPlan={addToPlan}
            openRecipeCard={openRecipeCard}
          />
        </>
      )}
<RecipeCardViewer
        viewer={cardViewer}
        onClose={() => setCardViewer(null)}
        setViewer={setCardViewer}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
      />

      <footer className="footer">
        Robert’s Recipe Box uses AI-generated recipes and organization as a practical planning tool. Favorites and meal plans are saved in this browser only and are not shared between your devices. Some product links may earn a small commission at no extra cost to you, however, you are not required to purchase anything to use my site.
      </footer>
      </div>
    </PageNavigationContext.Provider>
  );
}
