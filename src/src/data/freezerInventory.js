export const FREEZER_CATEGORIES = [
  {
    id: "meat-poultry",
    title: "Meat & Poultry",
    items: [
      "Ground beef", "Hamburger patties", "Steaks", "Beef roasts", "Beef stew meat", "Beef ribs", "Brisket", "Pork chops", "Pork tenderloin", "Pork roast", "Pork ribs", "Pulled pork", "Bacon", "Breakfast sausage", "Italian sausage", "Smoked sausage", "Hot dogs", "Chicken breasts", "Chicken thighs", "Chicken drumsticks", "Chicken wings", "Whole chicken", "Turkey breast", "Ground turkey", "Meatballs", "Cooked shredded chicken", "Cooked taco meat", "Cooked ground beef"
    ],
  },
  { id: "seafood", title: "Seafood", items: ["Fish fillets", "Salmon", "Tilapia", "Cod", "Catfish", "Tuna steaks", "Shrimp", "Scallops", "Crab meat", "Lobster", "Breaded fish", "Fish sticks", "Frozen seafood meals"] },
  { id: "frozen-vegetables", title: "Frozen Vegetables", items: ["Broccoli", "Cauliflower", "Green beans", "Peas", "Corn", "Carrots", "Mixed vegetables", "Stir-fry vegetables", "Brussels sprouts", "Spinach", "Okra", "Asparagus", "Bell peppers", "Onions", "Potatoes", "Sweet potatoes", "Vegetable noodles"] },
  { id: "frozen-fruit", title: "Frozen Fruit", items: ["Strawberries", "Blueberries", "Blackberries", "Raspberries", "Cherries", "Peaches", "Pineapple", "Mango", "Bananas", "Mixed berries", "Smoothie fruit blends", "Frozen fruit cups"] },
  { id: "bread-bakery", title: "Bread & Bakery", items: ["Sandwich bread", "Hamburger buns", "Hot dog buns", "Dinner rolls", "Biscuits", "Croissants", "Bagels", "English muffins", "Tortillas", "Pizza crusts", "Garlic bread", "Cornbread", "Muffins", "Pancakes", "Waffles", "Cakes", "Pies", "Cookie dough"] },
  { id: "breakfast-foods", title: "Breakfast Foods", items: ["Breakfast sandwiches", "Breakfast burritos", "Sausage biscuits", "Frozen pancakes", "Frozen waffles", "French toast", "Hash browns", "Breakfast potatoes", "Egg bites", "Quiche", "Muffins", "Cinnamon rolls"] },
  { id: "prepared-meals", title: "Prepared Meals", items: ["Casseroles", "Lasagna", "Enchiladas", "Meatloaf", "Salisbury steak", "Chicken pot pie", "Shepherd’s pie", "Stuffed peppers", "Pasta dishes", "Rice bowls", "Soup", "Chili", "Gumbo", "Stew", "Pot roast", "Pulled pork", "Taco filling", "Spaghetti sauce", "Complete dinner combinations", "Individual meal-prep containers"] },
  { id: "side-dishes", title: "Side Dishes", items: ["Mashed potatoes", "Scalloped potatoes", "Macaroni and cheese", "Rice", "Spanish rice", "Fried rice", "Pasta", "Noodles", "Dressing or stuffing", "Green bean casserole", "Corn casserole", "Twice-baked potatoes", "Beans", "Dinner rolls"] },
  { id: "convenience-foods", title: "Convenience Foods", items: ["Frozen pizza", "Pizza rolls", "Chicken nuggets", "Chicken tenders", "Breaded chicken patties", "Corn dogs", "Mozzarella sticks", "Egg rolls", "Taquitos", "Burritos", "Pot pies", "Frozen sandwiches", "French fries", "Tater tots", "Onion rings", "Frozen appetizers", "Microwave meals"] },
  { id: "soups-sauces-bases", title: "Soups, Sauces & Cooking Bases", items: ["Chicken broth", "Beef broth", "Vegetable broth", "Homemade stock", "Gravy", "Pasta sauce", "Pizza sauce", "Enchilada sauce", "Chili base", "Gumbo base", "Soup base", "Pesto", "Tomato paste portions", "Herb-and-butter portions", "Marinades"] },
  { id: "dairy-refrigerated-extras", title: "Dairy & Refrigerated Extras", items: ["Butter", "Margarine", "Shredded cheese", "Cheese slices", "Cream cheese", "Sour cream", "Heavy cream", "Milk", "Buttermilk", "Yogurt", "Eggs removed from shells", "Whipped topping"] },
  { id: "desserts-treats", title: "Desserts & Treats", items: ["Ice cream", "Frozen yogurt", "Ice cream bars", "Popsicles", "Frozen fruit bars", "Cookies", "Brownies", "Cake slices", "Cheesecake", "Pie slices", "Mini desserts", "Dessert cups", "Frozen candy"] },
  { id: "pet-food", title: "Pet Food", items: ["Frozen dog food", "Cooked chicken for pets", "Cooked ground meat for pets", "Frozen vegetables for pets", "Frozen pet treats", "Medication treats"] },
  { id: "freezer-supplies", title: "Freezer Supplies", items: ["Freezer bags", "Vacuum-sealer bags", "Foil pans", "Meal-prep containers", "Soup containers", "Silicone freezer trays", "Aluminum foil", "Freezer paper", "Plastic wrap", "Labels", "Permanent markers"] },
];

export const FREEZER_STATUS_OPTIONS = [
  "Plenty on hand",
  "Running low",
  "One remaining",
  "Use soon",
  "Thaw for this week",
  "Reserved for meal plan",
  "Needs portioning",
  "Needs labeling",
  "Do not replace",
];

export const FREEZER_FILTERS = [
  { id: "all", label: "Show all items" },
  { id: "checked", label: "Show checked items only" },
  { id: "soon", label: "Show Use Soon items" },
  { id: "low", label: "Show Running Low items" },
  { id: "grocery", label: "Added to Grocery List" },
];

export const DEFAULT_FREEZER_LOCATIONS = [
  "Kitchen freezer",
  "Refrigerator top shelf",
  "Refrigerator middle shelf",
  "Refrigerator bottom shelf",
  "Refrigerator door",
  "Left drawer",
  "Right drawer",
  "Upright freezer",
  "Chest freezer",
  "Garage freezer",
  "Other",
];

export function slugifyFreezerItem(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getDefaultFreezerItems() {
  return FREEZER_CATEGORIES.flatMap((category) =>
    category.items.map((name) => ({
      id: `${category.id}-${slugifyFreezerItem(name)}`,
      categoryId: category.id,
      categoryTitle: category.title,
      name,
      custom: false,
    }))
  );
}
