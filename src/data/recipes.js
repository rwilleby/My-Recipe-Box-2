const baseCategories = [
  { id: "AM", name: "American Cuisine", count: 0, icon: "🍽️", iconImage: "images/categories/AM.png" },
  { id: "AS", name: "Asian Cuisine", count: 0, icon: "🍜", iconImage: "images/categories/AS.png" },
  { id: "CC", name: "Cheesecakes", count: 0, icon: "🍰", iconImage: "images/categories/CC.png" },
  { id: "CO", name: "Cobblers", count: 0, icon: "🥧", iconImage: "images/categories/CO.png" },
  { id: "CR", name: "Cinnamon Rolls", count: 0, icon: "🌀", iconImage: "images/categories/CR.png" },
  { id: "CS", name: "Casseroles", count: 0, icon: "🥘", iconImage: "images/categories/CS.png" },
  { id: "DN", name: "Donuts", count: 0, icon: "🍩", iconImage: "images/categories/DN.png" },
  { id: "DS", name: "Desserts", count: 0, icon: "🍰", iconImage: "images/categories/DS.png" },
  { id: "HB", name: "Hamburgers", count: 0, icon: "🍔", iconImage: "images/categories/HB.png" },
  { id: "HBP", name: "Hamburger Patties", count: 0, icon: "🍔", iconImage: "images/categories/HBP.png" },
  { id: "IT", name: "Italian Cuisine", count: 0, icon: "🍝", iconImage: "images/categories/IT.png" },
  { id: "JJ", name: "Jams & Jellies", count: 0, icon: "🍓", iconImage: "images/categories/JJ.png" },
  { id: "KR", name: "Kolaches", count: 0, icon: "🥐", iconImage: "images/categories/KR.png" },
  { id: "LF", name: "Loafs & Rolls", count: 0, icon: "🍞", iconImage: "images/categories/LF.png" },
  { id: "MR", name: "Marinades", count: 0, icon: "🫙", iconImage: "images/categories/MR.png" },
  { id: "MX", name: "Mexican Cuisine", count: 0, icon: "🌮", iconImage: "images/categories/MX.png" },
  { id: "PM", name: "Protein Muffins", count: 0, icon: "🧁", iconImage: "images/categories/PM.png" },
  { id: "QP", name: "Quiche & Pies", count: 0, icon: "🥧", iconImage: "images/categories/QP.png" },
  { id: "RS", name: "Rubs & Seasonings", count: 0, icon: "🧂", iconImage: "images/categories/RS.png" },
  { id: "SB", name: "Salads & Bowls", count: 0, icon: "🥗", iconImage: "images/categories/SB.png" },
  { id: "SD", name: "Side Dishes", count: 0, icon: "🍲", iconImage: "images/categories/SD.png" },
  { id: "SF", name: "Seafood Dishes", count: 0, icon: "🐟", iconImage: "images/categories/SF.png" },
  { id: "SG", name: "Smoked & Grilled Meats", count: 0, icon: "🔥", iconImage: "images/categories/SG.png" },
  { id: "SW", name: "Sandwiches", count: 0, icon: "🥪", iconImage: "images/categories/SW.png" },
];

const CATEGORY_INFO = Object.fromEntries(baseCategories.map((category) => [category.id, category]));

const CATEGORY_DEFAULTS = {
  AM: { time: 35, servings: 4, price: "$$", emoji: "🍽️" },
  AS: { time: 30, servings: 4, price: "$$", emoji: "🍜" },
  CC: { time: 70, servings: 8, price: "$$", emoji: "🍰" },
  CO: { time: 55, servings: 8, price: "$$", emoji: "🥧" },
  CR: { time: 90, servings: 8, price: "$$", emoji: "🌀" },
  CS: { time: 45, servings: 6, price: "$$", emoji: "🥘" },
  DN: { time: 60, servings: 8, price: "$$", emoji: "🍩" },
  DS: { time: 45, servings: 8, price: "$$", emoji: "🍰" },
  HB: { time: 25, servings: 4, price: "$$", emoji: "🍔" },
  HBP: { time: 20, servings: 4, price: "$$", emoji: "🍔" },
  IT: { time: 40, servings: 4, price: "$$", emoji: "🍝" },
  JJ: { time: 50, servings: 8, price: "$", emoji: "🍓" },
  KR: { time: 90, servings: 8, price: "$$", emoji: "🥐" },
  LF: { time: 90, servings: 8, price: "$$", emoji: "🍞" },
  MR: { time: 10, servings: 4, price: "$", emoji: "🫙" },
  MX: { time: 35, servings: 4, price: "$$", emoji: "🌮" },
  PM: { time: 35, servings: 6, price: "$$", emoji: "🧁" },
  QP: { time: 55, servings: 6, price: "$$", emoji: "🥧" },
  RS: { time: 10, servings: 8, price: "$", emoji: "🧂" },
  SB: { time: 20, servings: 4, price: "$$", emoji: "🥗" },
  SD: { time: 25, servings: 4, price: "$", emoji: "🍲" },
  SF: { time: 30, servings: 4, price: "$$$", emoji: "🐟" },
  SG: { time: 60, servings: 4, price: "$$", emoji: "🔥" },
  SW: { time: 20, servings: 4, price: "$$", emoji: "🥪" },
};

const CATEGORY_INGREDIENTS = {
  AS: [
    { name: "Protein", qty: 1, unit: "lb", aisle: "Meat", cost: 7 },
    { name: "Vegetables", qty: 2, unit: "cups", aisle: "Produce", cost: 3 },
    { name: "Soy sauce", qty: 1, unit: "bottle", aisle: "Pantry", cost: 3 },
    { name: "Rice", qty: 1, unit: "pkg", aisle: "Pantry", cost: 3 },
  ],
  CC: [
    { name: "Cream cheese", qty: 2, unit: "pkg", aisle: "Dairy", cost: 6 },
    { name: "Sugar", qty: 1, unit: "cup", aisle: "Pantry", cost: 1 },
    { name: "Vanilla", qty: 1, unit: "tsp", aisle: "Pantry", cost: 1 },
    { name: "Crust ingredients", qty: 1, unit: "set", aisle: "Pantry", cost: 2 },
  ],
  CO: [
    { name: "Fruit filling", qty: 1, unit: "set", aisle: "Produce", cost: 5 },
    { name: "Flour", qty: 1, unit: "cup", aisle: "Pantry", cost: 1 },
    { name: "Sugar", qty: 1, unit: "cup", aisle: "Pantry", cost: 1 },
    { name: "Butter", qty: 1, unit: "stick", aisle: "Dairy", cost: 2 },
  ],
  CR: [
    { name: "Dough ingredients", qty: 1, unit: "set", aisle: "Pantry", cost: 4 },
    { name: "Butter", qty: 1, unit: "stick", aisle: "Dairy", cost: 2 },
    { name: "Cinnamon sugar", qty: 1, unit: "set", aisle: "Pantry", cost: 2 },
  ],
  DN: [
    { name: "Flour", qty: 1, unit: "cup", aisle: "Pantry", cost: 1 },
    { name: "Sugar", qty: 1, unit: "cup", aisle: "Pantry", cost: 1 },
    { name: "Eggs", qty: 2, unit: "each", aisle: "Dairy", cost: 1 },
    { name: "Oil for frying", qty: 1, unit: "set", aisle: "Pantry", cost: 3 },
  ],
  HB: [
    { name: "Ground beef", qty: 1, unit: "lb", aisle: "Meat", cost: 7 },
    { name: "Burger buns", qty: 1, unit: "pkg", aisle: "Bakery", cost: 3 },
    { name: "Cheese & toppings", qty: 1, unit: "set", aisle: "Dairy", cost: 4 },
  ],
  HBP: [
    { name: "Ground beef", qty: 1, unit: "lb", aisle: "Meat", cost: 7 },
    { name: "Seasonings", qty: 1, unit: "set", aisle: "Pantry", cost: 2 },
  ],
  IT: [
    { name: "Protein", qty: 1, unit: "lb", aisle: "Meat", cost: 7 },
    { name: "Pasta", qty: 1, unit: "box", aisle: "Pantry", cost: 2 },
    { name: "Tomato sauce", qty: 1, unit: "jar", aisle: "Pantry", cost: 3 },
    { name: "Parmesan cheese", qty: 1, unit: "pkg", aisle: "Dairy", cost: 4 },
  ],
  JJ: [
    { name: "Fruit", qty: 1, unit: "set", aisle: "Produce", cost: 5 },
    { name: "Sugar or sweetener", qty: 1, unit: "set", aisle: "Pantry", cost: 2 },
    { name: "Pectin", qty: 1, unit: "box", aisle: "Pantry", cost: 2 },
  ],
  KR: [
    { name: "Dough ingredients", qty: 1, unit: "set", aisle: "Pantry", cost: 4 },
    { name: "Main filling", qty: 1, unit: "set", aisle: "Meat", cost: 5 },
    { name: "Cheese", qty: 1, unit: "pkg", aisle: "Dairy", cost: 3 },
  ],
  LF: [
    { name: "Flour", qty: 1, unit: "bag", aisle: "Pantry", cost: 4 },
    { name: "Yeast", qty: 1, unit: "pkg", aisle: "Pantry", cost: 2 },
    { name: "Butter or oil", qty: 1, unit: "set", aisle: "Pantry", cost: 2 },
  ],
  MX: [
    { name: "Protein", qty: 1, unit: "lb", aisle: "Meat", cost: 7 },
    { name: "Tortillas", qty: 1, unit: "pkg", aisle: "Bakery", cost: 3 },
    { name: "Salsa", qty: 1, unit: "jar", aisle: "Pantry", cost: 3 },
    { name: "Shredded cheese", qty: 1, unit: "pkg", aisle: "Dairy", cost: 4 },
  ],
  PM: [
    { name: "Protein powder", qty: 1, unit: "scoop", aisle: "Pantry", cost: 3 },
    { name: "Flour", qty: 1, unit: "cup", aisle: "Pantry", cost: 1 },
    { name: "Eggs", qty: 2, unit: "each", aisle: "Dairy", cost: 1 },
    { name: "Milk", qty: 1, unit: "cup", aisle: "Dairy", cost: 1 },
  ],
  QP: [
    { name: "Pie crust", qty: 1, unit: "each", aisle: "Frozen", cost: 3 },
    { name: "Eggs", qty: 4, unit: "each", aisle: "Dairy", cost: 2 },
    { name: "Cheese", qty: 1, unit: "cup", aisle: "Dairy", cost: 3 },
    { name: "Main filling", qty: 1, unit: "set", aisle: "Grocery", cost: 6 },
  ],
  SB: [
    { name: "Greens", qty: 1, unit: "pkg", aisle: "Produce", cost: 4 },
    { name: "Protein", qty: 1, unit: "lb", aisle: "Meat", cost: 7 },
    { name: "Vegetables", qty: 2, unit: "cups", aisle: "Produce", cost: 4 },
    { name: "Dressing", qty: 1, unit: "bottle", aisle: "Pantry", cost: 3 },
  ],
  SD: [
    { name: "Vegetables or starch", qty: 1, unit: "pkg", aisle: "Produce", cost: 4 },
    { name: "Butter", qty: 1, unit: "stick", aisle: "Dairy", cost: 2 },
    { name: "Pantry staples", qty: 1, unit: "set", aisle: "Pantry", cost: 2 },
  ],
  SF: [
    { name: "Seafood", qty: 1, unit: "lb", aisle: "Seafood", cost: 12 },
    { name: "Lemon", qty: 1, unit: "each", aisle: "Produce", cost: 1 },
    { name: "Butter", qty: 1, unit: "stick", aisle: "Dairy", cost: 2 },
    { name: "Pantry staples", qty: 1, unit: "set", aisle: "Pantry", cost: 2 },
  ],
  SG: [
    { name: "Meat", qty: 1, unit: "lb", aisle: "Meat", cost: 9 },
    { name: "BBQ sauce", qty: 1, unit: "bottle", aisle: "Pantry", cost: 3 },
    { name: "Seasoning", qty: 1, unit: "set", aisle: "Pantry", cost: 2 },
  ],
};

function codePrefix(id = "") {
  return id.match(/^[A-Z]+/)?.[0] || "";
}

function titleHas(title = "", terms = []) {
  const lower = title.toLowerCase();
  return terms.some((term) => lower.includes(term));
}

function proteinForRecipe(categoryCode, title = "") {
  if (titleHas(title, ["chicken breast", "grilled chicken", "chicken fajita", "chicken alfredo", "chicken parmesan", "chicken piccata", "chicken marsala", "chicken scampi", "chicken florentine", "chicken cacciatore", "chicken enchilada", "shredded chicken", "chicken tortilla", "chicken quesadilla", "chicken street taco"])) {
    return { name: "Boneless skinless chicken breasts", qty: 1.5, unit: "lb", aisle: "Meat", cost: 8 };
  }

  if (titleHas(title, ["chicken thighs"])) {
    return { name: "Boneless skinless chicken thighs", qty: 1.5, unit: "lb", aisle: "Meat", cost: 7 };
  }

  if (titleHas(title, ["chicken tenders", "chicken nugget"])) {
    return { name: "Chicken tenders", qty: 1.5, unit: "lb", aisle: "Meat", cost: 8 };
  }

  if (titleHas(title, ["beef & broccoli", "beijing beef", "mongolian beef", "pepper steak", "black pepper beef", "beef fajita", "steak", "chile colorado", "beef ragu"])) {
    return { name: "Lean beef strips or sirloin", qty: 1.5, unit: "lb", aisle: "Meat", cost: 10 };
  }

  if (titleHas(title, ["burger", "hamburger", "patty", "taco meat", "meatballs", "meatloaf", "cheeseburger", "ground beef", "beef taco"])) {
    return { name: "Lean ground beef", qty: 1.5, unit: "lb", aisle: "Meat", cost: 8 };
  }

  if (titleHas(title, ["pork", "carnitas", "pulled pork", "sliced pork", "sausage", "boudin"])) {
    return { name: "Pork or sausage", qty: 1.5, unit: "lb", aisle: "Meat", cost: 7 };
  }

  if (titleHas(title, ["shrimp", "coconut shrimp", "boiled shrimp", "scampi"])) {
    return { name: "Peeled raw shrimp", qty: 1.5, unit: "lb", aisle: "Seafood", cost: 12 };
  }

  if (titleHas(title, ["salmon"])) {
    return { name: "Salmon portions", qty: 1.5, unit: "lb", aisle: "Seafood", cost: 14 };
  }

  if (titleHas(title, ["tilapia"])) {
    return { name: "Tilapia fillets", qty: 1.5, unit: "lb", aisle: "Seafood", cost: 9 };
  }

  if (titleHas(title, ["cod"])) {
    return { name: "Cod fillets", qty: 1.5, unit: "lb", aisle: "Seafood", cost: 11 };
  }

  if (titleHas(title, ["crab", "crab cakes", "crab ravioli"])) {
    return { name: "Crab meat", qty: 1, unit: "lb", aisle: "Seafood", cost: 16 };
  }

  if (titleHas(title, ["crawfish"])) {
    return { name: "Crawfish tails", qty: 1, unit: "lb", aisle: "Seafood", cost: 14 };
  }

  return { name: "Main protein", qty: 1.5, unit: "lb", aisle: "Meat", cost: 8 };
}

function defaultIngredients(categoryCode, title = "", id = "") {
  const protein = proteinForRecipe(categoryCode, title);

  if (categoryCode === "AS") {
    if (titleHas(title, ["fried rice"])) {
      return [
        protein,
        { name: "Microwave rice cups or cooked rice", qty: 2, unit: "cups", aisle: "Pantry", cost: 3 },
        { name: "Frozen stir-fry vegetables", qty: 1, unit: "bag", aisle: "Frozen", cost: 3 },
        { name: "Lower-sodium soy sauce", qty: 1, unit: "bottle", aisle: "Pantry", cost: 3 },
      ];
    }

    if (titleHas(title, ["lo mein", "chow mein", "singapore noodles"])) {
      return [
        protein,
        { name: "Higher-protein or lower-carb noodles", qty: 1, unit: "pkg", aisle: "Pantry", cost: 4 },
        { name: "Frozen stir-fry vegetables", qty: 1, unit: "bag", aisle: "Frozen", cost: 3 },
        { name: "Lower-sodium soy sauce", qty: 1, unit: "bottle", aisle: "Pantry", cost: 3 },
      ];
    }

    if (titleHas(title, ["egg rolls", "spring rolls", "crab rangoons"])) {
      return [
        protein,
        { name: "Egg roll or wonton wrappers", qty: 1, unit: "pkg", aisle: "Produce", cost: 4 },
        { name: "Bagged coleslaw mix", qty: 1, unit: "bag", aisle: "Produce", cost: 3 },
        { name: "Lower-sodium soy sauce", qty: 1, unit: "bottle", aisle: "Pantry", cost: 3 },
      ];
    }

    return [
      protein,
      { name: "Frozen stir-fry vegetables", qty: 1, unit: "bag", aisle: "Frozen", cost: 3 },
      { name: "Lower-sodium soy sauce", qty: 1, unit: "bottle", aisle: "Pantry", cost: 3 },
      { name: "Microwave rice cups or cauliflower rice", qty: 1, unit: "pkg", aisle: "Pantry", cost: 3 },
    ];
  }

  if (categoryCode === "MX") {
    if (titleHas(title, ["queso"])) {
      return [
        { name: "Reduced-fat shredded Mexican cheese", qty: 2, unit: "cups", aisle: "Dairy", cost: 4 },
        { name: "Light evaporated milk", qty: 1, unit: "can", aisle: "Pantry", cost: 2 },
        { name: "Diced green chiles", qty: 1, unit: "can", aisle: "Pantry", cost: 2 },
        { name: "Lower-carb tortilla chips", qty: 1, unit: "bag", aisle: "Snack", cost: 4 },
      ];
    }

    if (titleHas(title, ["rice bowl", "burrito bowl", "bowls"])) {
      return [
        protein,
        { name: "Cauliflower rice or microwave rice cups", qty: 1, unit: "pkg", aisle: "Frozen", cost: 3 },
        { name: "Salsa", qty: 1, unit: "jar", aisle: "Pantry", cost: 3 },
        { name: "Reduced-fat shredded Mexican cheese", qty: 1, unit: "pkg", aisle: "Dairy", cost: 4 },
      ];
    }

    if (titleHas(title, ["soup"])) {
      return [
        protein,
        { name: "Low-sodium chicken broth", qty: 1, unit: "carton", aisle: "Pantry", cost: 3 },
        { name: "Salsa or enchilada sauce", qty: 1, unit: "jar", aisle: "Pantry", cost: 3 },
        { name: "Black beans", qty: 1, unit: "can", aisle: "Pantry", cost: 1 },
      ];
    }

    return [
      protein,
      { name: "Low-carb flour tortillas", qty: 1, unit: "pkg", aisle: "Bakery", cost: 4 },
      { name: "Salsa or enchilada sauce", qty: 1, unit: "jar", aisle: "Pantry", cost: 3 },
      { name: "Reduced-fat shredded Mexican cheese", qty: 1, unit: "pkg", aisle: "Dairy", cost: 4 },
    ];
  }

  if (categoryCode === "IT") {
    if (titleHas(title, ["pizza", "flatbread", "stromboli", "calzone", "subs", "sliders", "sandwiches"])) {
      return [
        protein,
        { name: "Lower-calorie bread, buns, or pizza crust", qty: 1, unit: "pkg", aisle: "Bakery", cost: 4 },
        { name: "Part-skim mozzarella cheese", qty: 1, unit: "pkg", aisle: "Dairy", cost: 4 },
        { name: "Tomato sauce", qty: 1, unit: "jar", aisle: "Pantry", cost: 3 },
      ];
    }

    if (titleHas(title, ["soup"])) {
      return [
        protein,
        { name: "Low-sodium broth", qty: 1, unit: "carton", aisle: "Pantry", cost: 3 },
        { name: "Diced tomatoes", qty: 1, unit: "can", aisle: "Pantry", cost: 2 },
        { name: "Higher-protein or lower-carb pasta", qty: 1, unit: "box", aisle: "Pantry", cost: 4 },
      ];
    }

    return [
      protein,
      { name: "Higher-protein or lower-carb pasta", qty: 1, unit: "box", aisle: "Pantry", cost: 4 },
      { name: "Tomato sauce", qty: 1, unit: "jar", aisle: "Pantry", cost: 3 },
      { name: "Part-skim mozzarella or parmesan cheese", qty: 1, unit: "pkg", aisle: "Dairy", cost: 4 },
    ];
  }

  if (categoryCode === "SB") {
    return [
      protein,
      { name: "Bagged salad greens or chopped salad mix", qty: 1, unit: "bag", aisle: "Produce", cost: 4 },
      { name: "Fresh vegetables", qty: 2, unit: "cups", aisle: "Produce", cost: 4 },
      { name: "Light salad dressing or Greek yogurt dressing", qty: 1, unit: "bottle", aisle: "Pantry", cost: 4 },
    ];
  }

  if (categoryCode === "SF") {
    return [
      protein,
      { name: "Lemon", qty: 1, unit: "each", aisle: "Produce", cost: 1 },
      { name: "Butter or olive oil", qty: 1, unit: "set", aisle: "Pantry", cost: 2 },
      { name: "Cauliflower rice, salad greens, or microwave rice cups", qty: 1, unit: "pkg", aisle: "Frozen", cost: 3 },
    ];
  }

  if (categoryCode === "SG") {
    return [
      protein,
      { name: "Lower-sugar BBQ sauce", qty: 1, unit: "bottle", aisle: "Pantry", cost: 4 },
      { name: "Dry rub or seasoning blend", qty: 1, unit: "set", aisle: "Pantry", cost: 2 },
      { name: "Freezer bags or vacuum seal bags", qty: 1, unit: "box", aisle: "Storage", cost: 5 },
    ];
  }

  if (categoryCode === "HB" || categoryCode === "HBP") {
    return [
      { name: "Lean ground beef", qty: 1.5, unit: "lb", aisle: "Meat", cost: 8 },
      { name: "Lower-calorie burger buns", qty: 1, unit: "pkg", aisle: "Bakery", cost: 4 },
      { name: "Reduced-fat sliced cheese", qty: 1, unit: "pkg", aisle: "Dairy", cost: 4 },
      { name: "Burger toppings", qty: 1, unit: "set", aisle: "Produce", cost: 4 },
    ];
  }

  if (categoryCode === "QP") {
    return [
      protein,
      { name: "Pie crust", qty: 1, unit: "each", aisle: "Frozen", cost: 3 },
      { name: "Eggs", qty: 4, unit: "each", aisle: "Dairy", cost: 2 },
      { name: "Reduced-fat shredded cheese", qty: 1, unit: "cup", aisle: "Dairy", cost: 3 },
    ];
  }

  if (categoryCode === "PM") {
    return [
      { name: "Protein powder", qty: 1, unit: "scoop", aisle: "Pantry", cost: 3 },
      { name: "Rolled oats or flour", qty: 1, unit: "cup", aisle: "Pantry", cost: 1 },
      { name: "Eggs", qty: 2, unit: "each", aisle: "Dairy", cost: 1 },
      { name: "Milk or unsweetened almond milk", qty: 1, unit: "cup", aisle: "Dairy", cost: 1 },
    ];
  }

  if (categoryCode === "JJ") {
    return [
      { name: "Fresh or frozen fruit", qty: 4, unit: "cups", aisle: "Produce", cost: 5 },
      { name: "Low-calorie sweetener or sugar", qty: 1, unit: "set", aisle: "Pantry", cost: 2 },
      { name: "Pectin", qty: 1, unit: "box", aisle: "Pantry", cost: 2 },
      { name: "Freezer-safe jars or containers", qty: 1, unit: "set", aisle: "Storage", cost: 4 },
    ];
  }

  if (categoryCode === "LF" || categoryCode === "KR" || categoryCode === "CR" || categoryCode === "DN" || categoryCode === "CC" || categoryCode === "CO") {
    return CATEGORY_INGREDIENTS[categoryCode] || [
      { name: "Baking ingredients", qty: 1, unit: "set", aisle: "Pantry", cost: 6 },
      { name: "Freezer bags or containers", qty: 1, unit: "set", aisle: "Storage", cost: 4 },
    ];
  }

  return [
    protein,
    { name: "Fresh vegetables", qty: 2, unit: "cups", aisle: "Produce", cost: 4 },
    { name: "Pantry staples", qty: 1, unit: "set", aisle: "Pantry", cost: 3 },
  ];
}

function defaultCost(price = "$$") {
  const base = price === "$" ? 10 : price === "$$$" ? 28 : 18;
  return {
    2: Number((base * 0.55).toFixed(2)),
    4: Number(base.toFixed(2)),
    6: Number((base * 1.45).toFixed(2)),
  };
}


const MEAL_BALANCE_LABELS = [
  { min: 1, max: 2, label: "Very Light" },
  { min: 3, max: 4, label: "Balanced" },
  { min: 5, max: 6, label: "Moderate" },
  { min: 7, max: 8, label: "Rich" },
  { min: 9, max: 10, label: "Indulgent" },
];

function mealBalanceLabel(score) {
  return MEAL_BALANCE_LABELS.find((range) => score >= range.min && score <= range.max)?.label || "Moderate";
}

function estimateMealBalance(categoryCode, title) {
  const normalized = String(title || "").toLowerCase();
  const has = (...terms) => terms.some((term) => normalized.includes(term));

  const categoryBase = {
    AM: 6, AS: 5, CC: 9, CO: 8, CR: 9, CS: 7, DN: 9, DS: 8,
    HB: 7, HBP: 7, IT: 6, JJ: 6, KR: 8, LF: 7, MR: 3, MX: 6,
    PM: 4, QP: 7, RS: 2, SB: 3, SD: 5, SF: 4, SG: 7, SW: 6,
  };

  let score = categoryBase[categoryCode] ?? 5;

  if (has("salad", "vegetable", "asparagus", "cabbage", "okra", "brussel", "green bean", "broccoli", "cauliflower")) score -= 2;
  if (has("grilled", "roasted", "baked", "boiled", "steamed", "lemon", "garlic", "teriyaki")) score -= 1;
  if (has("protein", "light", "lean", "fresh fruit", "sugar free", "low carb")) score -= 1;

  if (has("fried", "country fried", "chicken fried", "crispy", "breaded")) score += 2;
  if (has("cheese", "cheesy", "cream", "creamy", "alfredo", "bisque", "gravy")) score += 1;
  if (has("bacon", "sausage", "pork belly", "brisket", "ribs", "meatloaf", "pot roast")) score += 1;
  if (has("cake", "cheesecake", "cobbler", "donut", "cinnamon roll", "fudge", "brownie", "pie")) score += 2;
  if (has("double", "loaded", "supreme", "stuffed", "smothered")) score += 1;

  score = Math.max(1, Math.min(10, Math.round(score)));
  return {
    score,
    label: mealBalanceLabel(score),
    status: "estimated",
  };
}

function makeRecipe(entry) {
  const [id, title, options = {}] = entry;
  const categoryCode = options.categoryCode || codePrefix(id);
  const category = CATEGORY_INFO[categoryCode];
  const defaults = CATEGORY_DEFAULTS[categoryCode] || CATEGORY_DEFAULTS.AM;
  const price = options.price ?? defaults.price;

  return {
    id,
    title,
    category: options.category || category?.name || categoryCode,
    categoryCode,
    time: options.time ?? defaults.time,
    servings: options.servings ?? defaults.servings,
    price,
    emoji: options.emoji ?? defaults.emoji,
    imageStyle: options.imageStyle || "linear-gradient(135deg, #f8fafc, #e5e7eb)",
    image: options.image || `images/recipes/${id}.png`,
    cardImage: options.cardImage || `images/recipes/${id}.png`,
    heroImage: options.heroImage || `images/heroes/${id}.png`,
    cost: options.cost || defaultCost(price),
    ingredients: options.ingredients || defaultIngredients(categoryCode, title, id),
    mediaLinks: options.mediaLinks || undefined,
    mealBalance: options.mealBalance || estimateMealBalance(categoryCode, title),
  };
}

const recipeRows = [
  ["AM-001", "Salisbury Steak"],
  ["AM-002", "Beef Tips"],
  ["AM-003", "Country Fried Steak"],
  ["AM-004", "Chicken Fried Chicken"],
  ["AM-005", "Hamburger Steak"],
  ["AM-006", "Swiss Steak"],
  ["AM-007", "Meatloaf"],
  ["AM-008", "Texas Chili"],
  ["AM-009", "Beef Pot Pie"],
  ["AM-010", "Roast Beef with Gravy"],
  ["AM-011", "Beef and Noodles"],
  ["AM-012", "Beef Hash"],
  ["AM-013", "Beefy Macaroni Skillet"],
  ["AM-014", "Pot Roast"],
  ["AM-015", "Chuck Roast with Vegetables"],
  ["AM-016", "Mississippi Pot Roast"],
  ["AM-017", "Sunday Roast Dinner"],
  ["AM-018", "Smothered Beef Patties"],
  ["AM-019", "Open-Faced Roast Beef Sandwiches"],
  ["AM-020", "Beef Stroganoff"],
  ["AM-021", "Chicken and Dumplings"],
  ["AM-022", "Chicken and Rice"],
  ["AM-023", "Chicken Fried Steak"],
  ["AM-024", "Fried Chicken"],
  ["AM-025", "Baked Chicken"],
  ["AM-026", "Smothered Chicken"],
  ["AM-027", "Chicken Tenders"],
  ["AM-028", "Chicken Nuggets"],
  ["AM-029", "Chicken and Noodles"],
  ["AM-030", "Chicken Pot Pie"],
  ["AM-031", "Turkey and Dressing"],
  ["AM-032", "Turkey Tetrazzini"],
  ["AM-033", "Ham Steak Dinner"],
  ["AM-034", "Pork Chops with Gravy"],
  ["AM-035", "Pork Tenderloin"],
  ["AM-036", "Pork Roast"],
  ["AM-037", "Smothered Pork Chops"],
  ["AM-038", "Sausage and Peppers"],
  ["AM-039", "Sausage Gravy and Biscuits"],
  ["AM-040", "Hot Dogs and Beans"],
  ["AM-041", "BBQ Chicken"],
  ["AM-042", "BBQ Ribs"],
  ["AM-043", "BBQ Meatballs"],
  ["AM-044", "BBQ Sausage"],
  ["AM-045", "Pulled Chicken Sandwiches"],
  ["AM-046", "Sloppy Joes"],
  ["AM-047", "Chili Dogs"],
  ["AM-048", "Corn Dogs"],
  ["AM-049", "Philly Cheesesteak Sandwiches"],
  ["AM-050", "BBQ Pulled Pork Sandwiches"],
  ["AM-051", "Tuna Noodle Casserole"],
  ["AM-052", "Chicken Noodle Casserole"],
  ["AM-053", "Hamburger Helper Style Skillet"],
  ["AM-054", "Baked Ziti American-Style"],
  ["AM-055", "Macaroni & Cheese"],
  ["AM-056", "Loaded Baked Potatoes"],
  ["AM-057", "Mashed Potato Bowls"],
  ["AM-058", "Beans and Cornbread"],
  ["AM-059", "Biscuits and Gravy"],
  ["AM-060", "Grilled Cheese & Tomato Soup"],
  ["AM-061", "Club Sandwich"],
  ["AM-062", "Chicken Salad Sandwiches"],
  ["AM-063", "Tuna Salad Sandwiches"],
  ["AM-064", "Patty Melt"],
  ["AM-065", "Hot Beef Sandwiches"],
  ["AM-066", "Meatball Subs"],
  ["AM-067", "Shepherd’s Pie American-Style"],
  ["AM-068", "Frito Pie"],
  ["AM-069", "Loaded Baked Potato Dinner"],
  ["AM-070", "Cheeseburger Casserole"],
  ["AM-071", "Tater Tot Casserole"],
  ["AM-072", "Hamburger Potato Casserole"],
  ["AM-073", "Green Bean Chicken Casserole"],
  ["AM-074", "Chicken Cordon Bleu Casserole"],
  ["AM-075", "Philly Cheesesteak Casserole"],
  ["AM-076", "Stuffed Pepper Casserole"],
  ["AM-077", "BBQ Chicken & Baked Bean Casserole"],
  ["AM-078", "Ham & Cheese Pasta Bake"],
  ["AS-001", "Beef & Broccoli"],
  ["AS-002", "Beijing Beef"],
  ["AS-003", "Mongolian Beef"],
  ["AS-004", "Pepper Steak"],
  ["AS-005", "Black Pepper Beef"],
  ["AS-006", "Korean Beef"],
  ["AS-007", "Teriyaki Chicken"],
  ["AS-008", "Sweet & Sour Chicken"],
  ["AS-009", "Sesame Chicken"],
  ["AS-010", "Orange Chicken"],
  ["AS-011", "Kung Pao Chicken"],
  ["AS-012", "Honey Garlic Chicken"],
  ["AS-013", "General Tso’s Chicken"],
  ["AS-014", "Cashew Chicken"],
  ["AS-015", "Hunan Chicken"],
  ["AS-016", "Szechuan Chicken"],
  ["AS-017", "Black Pepper Chicken"],
  ["AS-018", "Fried Rice"],
  ["AS-019", "Lo Mein"],
  ["AS-020", "Chow Mein"],
  ["AS-021", "Singapore Noodles"],
  ["AS-022", "Chicken Egg Rolls"],
  ["AS-023", "Spring Rolls"],
  ["AS-024", "Crab Rangoons"],
  ["CC-001", "Mini Cheesecakes: Classic Plain"],
  ["CC-002", "Mini Cheesecakes: Salted Caramel"],
  ["CC-003", "Mini Cheesecakes: Oreo Cookie"],
  ["CC-004", "Mini Cheesecakes: Strawberry Swirl"],
  ["CC-005", "Mini Cheesecakes: Chocolate Swirl"],
  ["CC-006", "Mini Cheesecakes: Blueberry"],
  ["CO-001", "Apple Cobbler"],
  ["CO-002", "Blackberry Cobbler"],
  ["CO-003", "Blueberry Cobbler"],
  ["CO-004", "Cherry Cobbler"],
  ["CO-005", "Strawberry Cobbler"],
  ["CO-006", "Peach Cobbler"],
  ["CR-001", "Traditional Cinnamon Rolls"],
  ["CR-002", "Chocolate Cinnamon Rolls"],
  ["CR-003", "Apple Cinnamon Rolls"],
  ["CR-004", "Pecan Raisin Cinnamon Rolls"],
  ["CR-005", "Crescent Dough Cinnamon Rolls"],
  ["DN-001", "Yeast Glazed Donuts"],
  ["DN-002", "Classic Cake Donuts"],
  ["DN-003", "Chocolate Cake Donuts"],
  ["DN-004", "Old-Fashioned Buttermilk Donuts"],
  ["DN-005", "Filled Donuts"],
  ["DN-006", "Apple Fritters"],
  ["DN-007", "Blueberry Cake Donuts"],
  ["HB-001", "Big Mac Style Burger"],
  ["HB-002", "Whataburger Style Burger"],
  ["HB-003", "In-N-Out Style Burger"],
  ["HB-004", "Five Guys Style Burger"],
  ["HB-005", "Sonic Style Burger"],
  ["HB-006", "Shake Shack Style Burger"],
  ["HB-007", "Steakhouse Burger"],
  ["HB-008", "Breakfast Burger with Egg"],
  ["HB-009", "Avocado Bacon Burger"],
  ["HB-010", "Blue Cheese Burger"],
  ["HB-011", "Garlic Butter Burger"],
  ["HB-012", "Pizza Burger"],
  ["HB-013", "Mac & Cheese Burger"],
  ["HB-014", "Western Burger with Onion Rings"],
  ["HB-015", "French Onion Burger"],
  ["HB-016", "Classic Cheeseburger"],
  ["HB-017", "Double Cheeseburger"],
  ["HB-018", "Bacon Cheeseburger"],
  ["HB-019", "Mushroom Swiss Burger"],
  ["HB-020", "Patty Melt"],
  ["HB-021", "Smash Burger"],
  ["HB-022", "Diner Burger"],
  ["HB-023", "Oklahoma Onion Burger"],
  ["HB-024", "BBQ Bacon Burger"],
  ["HB-025", "Smokehouse Burger"],
  ["HB-026", "Jalapeño BBQ Burger"],
  ["HB-027", "Chili Cheese Burger"],
  ["HB-028", "Texas Burger"],
  ["HB-029", "Fried Onion Burger"],
  ["HB-030", "Pimento Cheese Burger"],
  ["HB-031", "Lipsey Burger"],
  ["HBP-001", "Standard Thin Hamburger Patty"],
  ["HBP-002", "Quarter-Pound Hamburger Patty"],
  ["HBP-003", "Smashburger Patty"],
  ["HBP-004", "Garlic Pepper Patty"],
  ["HBP-005", "Worcestershire Onion Patty"],
  ["HBP-006", "Steakhouse Patty"],
  ["HBP-007", "BBQ Bacon Patty"],
  ["HBP-008", "Jalapeño Cheddar Patty"],
  ["HBP-009", "Cajun Patty"],
  ["HBP-010", "Taco Burger Patty"],
  ["HBP-011", "Garlic Butter Patty"],
  ["HBP-012", "Lipsey-Style Chili"],
  ["IT-001", "Chicken Alfredo"],
  ["IT-002", "Chicken Parmesan"],
  ["IT-003", "Chicken Marsala"],
  ["IT-004", "Chicken Piccata"],
  ["IT-005", "Tuscan Chicken"],
  ["IT-006", "Creamy Garlic Chicken Pasta"],
  ["IT-007", "Italian Baked Chicken"],
  ["IT-008", "Chicken Cacciatore"],
  ["IT-009", "Chicken Florentine"],
  ["IT-010", "Chicken Scampi"],
  ["IT-011", "Spaghetti & Meatballs"],
  ["IT-012", "Baked Ziti with Italian Sausage"],
  ["IT-013", "Lasagna"],
  ["IT-014", "Italian Meatloaf"],
  ["IT-015", "Beef Ragu"],
  ["IT-016", "Italian Beef Sandwiches"],
  ["IT-017", "Sausage & Peppers"],
  ["IT-018", "Stuffed Shells with Meat Sauce"],
  ["IT-019", "Manicotti with Meat Sauce"],
  ["IT-020", "Italian Meatballs"],
  ["IT-021", "Fettuccine Alfredo"],
  ["IT-022", "Baked Spaghetti"],
  ["IT-023", "Pasta Primavera"],
  ["IT-024", "Penne Alla Vodka"],
  ["IT-025", "Cheese Ravioli Bake"],
  ["IT-026", "Tortellini Alfredo"],
  ["IT-027", "Pesto Pasta"],
  ["IT-028", "Creamy Tomato Pasta"],
  ["IT-029", "Spinach Ricotta Stuffed Shells"],
  ["IT-030", "Eggplant Parmesan"],
  ["IT-031", "Shrimp Scampi"],
  ["IT-032", "Seafood Alfredo"],
  ["IT-033", "Linguine with Clam Sauce"],
  ["IT-034", "Lemon Garlic Shrimp Pasta"],
  ["IT-035", "Italian Baked Cod"],
  ["IT-036", "Salmon Florentine"],
  ["IT-037", "Shrimp Fra Diavolo"],
  ["IT-038", "Crab Ravioli"],
  ["IT-039", "Scallop Pasta"],
  ["IT-040", "Tuna Pasta Bake"],
  ["IT-041", "Margherita Pizza"],
  ["IT-042", "Pepperoni Pizza"],
  ["IT-043", "Italian Sausage Pizza"],
  ["IT-044", "Garlic Bread Pizza"],
  ["IT-045", "Stromboli"],
  ["IT-046", "Calzone"],
  ["IT-047", "Meatball Subs"],
  ["IT-048", "Chicken Parmesan Subs"],
  ["IT-049", "Italian Sliders"],
  ["IT-050", "Caprese Flatbread"],
  ["IT-051", "Zuppa Toscana"],
  ["IT-052", "Pasta Fagioli"],
  ["IT-053", "Italian Wedding Soup"],
  ["IT-054", "Minestrone Soup"],
  ["IT-055", "Tomato Basil Soup"],
  ["IT-056", "Chicken Gnocchi Soup"],
  ["IT-057", "Sausage Tortellini Soup"],
  ["IT-058", "Ribollita"],
  ["IT-059", "Italian Lentil Soup"],
  ["IT-060", "Creamy Parmesan Soup"],
  ["JJ-001", "Homemade Blackberry Jam"],
  ["JJ-002", "Lower-Cal Blackberry Jam"],
  ["JJ-003", "Lower-Cal Blueberry Jam"],
  ["JJ-004", "Lower-Cal Peach Jam"],
  ["JJ-005", "Lower-Cal Strawberry Jam"],
  ["JJ-006", "Jalapeño Bacon Jam"],
  ["JJ-007", "Jalapeño Mint Bacon Jam"],
  ["JJ-008", "Maple Bourbon Bacon Jam"],
  ["JJ-009", "Peach Jalapeño Jam"],
  ["JJ-010", "Pineapple Bacon Jam"],
  ["JJ-011", "Pineapple Jalapeño Jam"],
  ["JJ-012", "Strawberry Jalapeño Jam"],
  ["JJ-013", "Tomato Onion Bacon Jam"],
  ["JJ-014", "Low-Cal Strawberry Preserves"],
  ["JJ-015", "Low-Cal Grape Jam"],
  ["JJ-016", "Low-Cal Raspberry Preserves"],
  ["JJ-017", "Low-Cal Blackberry Preserves"],
  ["JJ-018", "Low-Cal Blueberry Preserves"],
  ["JJ-019", "Low-Cal Peach Preserves"],
  ["JJ-020", "All-Fruit Strawberry Preserves"],
  ["JJ-021", "All-Fruit Grape Jam"],
  ["JJ-022", "All-Fruit Raspberry Preserves"],
  ["JJ-023", "All-Fruit Blackberry Preserves"],
  ["JJ-024", "All-Fruit Blueberry Preserves"],
  ["JJ-025", "All-Fruit Peach Preserves"],
  ["KR-001", "Sausage & Cheese Kolaches"],
  ["KR-002", "Ham & Swiss Kolaches"],
  ["KR-003", "Bacon, Egg & Cheese Kolaches"],
  ["KR-004", "Sausage, Egg & Cheese Kolaches"],
  ["KR-005", "Boudin Kolaches"],
  ["KR-006", "Chicken Nugget Kolaches"],
  ["KR-007", "Mini Sausage Kolaches"],
  ["LF-001", "Basic White Breads"],
  ["LF-002", "Honey Wheat Breads"],
  ["LF-003", "Buttermilk Breads"],
  ["LF-004", "Whole Wheat Breads"],
  ["LF-005", "Cheddar Cheese Breads"],
  ["LF-006", "Jalapeño Cheddar Breads"],
  ["LF-007", "Italian-Style Breads"],
  ["LF-008", "Onion-Olive Breads"],
  ["LF-009", "Parmesan Garlic Breads"],
  ["LF-010", "Hawaiian-Style Breads"],
  ["LF-011", "Pretzel Breads"],
  ["LF-012", "Garlic-Cheese Breads"],
  ["LF-013", "Sourdough: No-Knead Artisan Bread"],
  ["LF-014", "Sourdough: Overnight Artisan Bread"],
  ["LF-015", "Sourdough: Rustic Farmhouse Bread"],
  ["LF-FZ1", "Making & Storing Frozen Breads"],
  ["LF-FZ2", "Freezing Dough After Proofing, Before Baking"],
  ["MX-001", "Beef Enchilada Bake"],
  ["MX-002", "Chicken Enchilada Bake"],
  ["MX-003", "Taco Meat & Cheese"],
  ["MX-004", "Beef Fajitas"],
  ["MX-005", "Chicken Fajitas"],
  ["MX-006", "Beef Enchiladas"],
  ["MX-007", "Chicken Enchiladas"],
  ["MX-008", "Tacos"],
  ["MX-009", "Burritos"],
  ["MX-010", "Quesadillas"],
  ["MX-011", "Nachos"],
  ["MX-012", "Tamale Pie"],
  ["MX-013", "Mexican Rice"],
  ["MX-014", "Refried Beans"],
  ["MX-015", "Black Beans"],
  ["MX-016", "Pinto Beans"],
  ["MX-017", "Corn Maque Choux"],
  ["MX-018", "Guacamole Dip"],
  ["MX-019", "Queso Dip"],
  ["MX-020", "White Queso Dip"],
  ["MX-021", "Enchilada Casserole"],
  ["MX-022", "Taco Casserole"],
  ["MX-023", "Mexican Lasagna"],
  ["MX-024", "Tamale Casserole"],
  ["MX-025", "Beef Fajita Rice Bowls"],
  ["MX-026", "Beef Taco Rice Bowls"],
  ["MX-027", "Carnitas Rice Bowls"],
  ["MX-028", "Chicken Burrito Bowls"],
  ["MX-029", "Chicken Enchilada Verde Bowls"],
  ["MX-030", "Chicken Fajita Rice Bowls"],
  ["MX-031", "Chicken Quesadillas"],
  ["MX-032", "Chicken Street Tacos"],
  ["MX-033", "Chicken Tamale Casserole"],
  ["MX-034", "Chicken Tortilla Soup"],
  ["MX-035", "Chile Colorado"],
  ["MX-036", "Chile Verde Pork"],
  ["MX-037", "Chimichangas"],
  ["MX-038", "Fajita Quesadillas"],
  ["MX-039", "Flautas"],
  ["MX-040", "King Ranch Chicken"],
  ["MX-041", "Mexican Chicken & Rice"],
  ["MX-042", "Mexican Taco Soup"],
  ["MX-043", "Taco Bell-Style Taco Meat"],
  ["MX-044", "Shredded Chicken"],
  ["PM-001", "Apple Cinnamon"],
  ["PM-002", "Blueberry"],
  ["PM-003", "Chocolate Chip"],
  ["PM-004", "Double Chocolate"],
  ["PM-005", "Lemon Poppyseed"],
  ["PM-006", "Pumpkin Spice"],
  ["PM-007", "Banana Nut"],
  ["PM-008", "Raspberry"],
  ["PM-009", "Cranberry Orange"],
  ["PM-010", "Cinnamon Roll"],
  ["PM-011", "Strawberry Cheesecake"],
  ["PM-012", "Brown Sugar Oatmeal"],
  ["PM-013", "Apple Streusel"],
  ["PM-014", "Carrot Cake"],
  ["QP-001", "Classic Cheese"],
  ["QP-002", "Lorraine"],
  ["QP-003", "Ham & Cheese"],
  ["QP-004", "Spinach"],
  ["QP-005", "Broccoli & Cheese"],
  ["QP-006", "Cowboy"],
  ["QP-007", "Bacon & Cheddar"],
  ["QP-008", "Western"],
  ["QP-009", "Ham & Swiss"],
  ["QP-010", "Sausage & Cheese"],
  ["QP-011", "Crab"],
  ["QP-012", "Beef Taco"],
  ["QP-013", "Tomato Basil"],
  ["QP-014", "Caramelized Onion"],
  ["QP-015", "Crawfish"],
  ["QP-016", "Cheeseburger"],
  ["QP-017", "Chicken Pot Pie"],
  ["QP-018", "Beef Pot Pie"],
  ["QP-019", "Apple Pie"],
  ["QP-020", "Cherry Pie"],
  ["QP-021", "Peach Pie"],
  ["QP-022", "Blueberry Pie"],
  ["QP-023", "Blackberry Pie"],
  ["QP-024", "Strawberry Rhubarb Pie"],
  ["QP-025", "Pecan Pie"],
  ["QP-026", "Coconut Custard Pie"],
  ["QP-027", "Chocolate Cream Ice Box Pie"],
  ["QP-028", "Pink Lemonade Ice Box Pie"],
  ["QP-029", "Key Lime Ice Box Pie"],
  ["QP-030", "Strawberry Ice Box Pie"],
  ["SB-001", "Asian Chicken Crunch"],
  ["SB-002", "BLT Chicken Salad"],
  ["SB-003", "Buffalo Chicken"],
  ["SB-004", "Burger Bowl"],
  ["SB-005", "High-Protein Chef Salad"],
  ["SB-006", "High-Protein Chicken Caesar"],
  ["SB-007", "High-Protein Chicken Cobb"],
  ["SB-008", "High-Protein Chicken Salad"],
  ["SB-009", "High-Protein Cottage Cheese"],
  ["SB-010", "High-Protein Crab Salad"],
  ["SB-011", "High-Protein Egg Salad"],
  ["SB-012", "High-Protein Greek Chicken Salad"],
  ["SB-013", "High-Protein Italian Chicken Pasta"],
  ["SB-014", "High-Protein Mediterranean Chickpea"],
  ["SB-015", "High-Protein Pimento Chicken Salad"],
  ["SB-016", "High-Protein Salmon Salad"],
  ["SB-017", "High-Protein Shrimp Cobb Salad"],
  ["SB-018", "High-Protein Tuna Salad"],
  ["SB-019", "Jersey Mike’s Sub-in-a-Tub"],
  ["SB-020", "Base Chopped Salad Mix"],
  ["SD-001", "Baked Beans"],
  ["SD-002", "Cornbread Stuffing"],
  ["SD-003", "Mashed Potatoes"],
  ["SD-004", "Green Beans"],
  ["SD-005", "Broccoli"],
  ["SD-006", "Garlic Parmesan Pasta"],
  ["SD-007", "Macaroni & Cheese"],
  ["SD-008", "Whole Corn"],
  ["SD-009", "Oriental Stir-Fry"],
  ["SD-010", "Fried Rice"],
  ["SD-011", "Egg Noodles"],
  ["SD-012", "Peas & Carrots"],
  ["SD-013", "Southern-Style Green Beans"],
  ["SD-014", "Pinto Beans"],
  ["SD-015", "Spanish Rice"],
  ["SD-016", "Dirty Rice"],
  ["SD-017", "Scalloped Potatoes"],
  ["SD-018", "Rice Pilaf"],
  ["SD-019", "Refried Beans"],
  ["SD-020", "Spaghetti Noodles"],
  ["SD-021", "Italian Vegetables"],
  ["SD-022", "Coleslaw"],
  ["SD-023", "Mustard Potato Salad"],
  ["SD-024", "German Potato Salad"],
  ["SD-025", "Glazed Carrots"],
  ["SD-026", "Corn on the Cob"],
  ["SD-027", "Baked Potato"],
  ["SD-028", "Baked Sweet Potato"],
  ["SD-029", "Flattened Mini Potatoes"],
  ["SD-030", "Roasted Asparagus"],
  ["SD-031", "Brussels Sprouts"],
  ["SD-032", "Fried Okra"],
  ["SD-033", "Cabbage"],
  ["SD-034", "Hashbrown Casserole"],
  ["SD-035", "Cheesy Grits"],
  ["SD-036", "Roasted Zucchini"],
  ["SD-037", "Roasted Red Potatoes"],
  ["SD-038", "Wild Rice Pilaf"],
  ["SD-039", "Roasted Vegetables"],
  ["SD-040", "Butter Grits"],
  ["SD-041", "Steak Fries"],
  ["SD-042", "Crinkle-Cut Fries"],
  ["SD-043", "Waffle Fries"],
  ["SD-044", "McDonald’s Fries"],
  ["SD-045", "Sweet Potato Fries"],
  ["SD-046", "Tater Tots"],
  ["SD-047", "Dinner Salad"],
  ["SD-048", "White Rice"],
  ["SD-049", "Cilantro Lime Rice"],
  ["SD-050", "Broccoli Cheese Rice"],
  ["SD-051", "Creamy Mushroom Rice"],
  ["SD-052", "Jasmine Rice"],
  ["SF-001", "Baked Coconut Shrimp"],
  ["SF-002", "Shrimp Scampi"],
  ["SF-003", "Shrimp & Grits"],
  ["SF-004", "Salmon Patties"],
  ["SF-005", "Crab Cakes"],
  ["SF-006", "Coconut Lime Shrimp"],
  ["SF-007", "Cajun Shrimp"],
  ["SF-008", "Teriyaki Salmon"],
  ["SF-009", "Honey Garlic Salmon"],
  ["SF-010", "Cornmeal Tilapia"],
  ["SF-011", "Blackened Tilapia"],
  ["SF-012", "Cajun Tilapia"],
  ["SF-013", "Parmesan Tilapia"],
  ["SF-014", "Lemon Garlic Tilapia"],
  ["SF-015", "Boiled Shrimp"],
  ["SF-016", "Seafood Gumbo"],
  ["SF-017", "Crawfish Bisque"],
  ["SF-018", "Crawfish Étouffée"],
  ["SF-019", "Hush Puppies"],
  ["SF-020", "Dirty Rice"],
  ["SG-001", "Grilled Flank Steak"],
  ["SG-002", "Beef Fajitas"],
  ["SG-003", "Grilled Hot Dogs"],
  ["SG-004", "Grilled Sausage Links"],
  ["SG-005", "Grilled Chicken Breasts"],
  ["SG-008", "Texas-Style Brisket"],
  ["SG-009", "Sliced Pork Butt"],
  ["SG-010", "Pulled Pork Butt"],
  ["SG-011", "Smoked Chicken Breast"],
  ["SG-012", "Smoked Pork Ribs"],
  ["SG-013", "Smoked Beef Ribs"],
  ["SG-014", "Smoked Chicken Legs"],
  ["SG-015", "Smoked Chicken Wings"],
  ["SG-016", "Smoked Chicken Quarters"]
];

export const recipes = recipeRows.map(makeRecipe);

const categoryCounts = recipes.reduce((counts, recipe) => {
  counts[recipe.categoryCode] = (counts[recipe.categoryCode] || 0) + 1;
  return counts;
}, {});

export const categories = baseCategories.map((category) => ({
  ...category,
  count: categoryCounts[category.id] || 0,
}));

export const categoriesWithCounts = categories;
