export const REFRIGERATOR_STATUS_OPTIONS = [
  "Available",
  "Running Low",
  "Use Soon",
  "Out",
];

export const REFRIGERATOR_FILTERS = [
  { id: "all", label: "All Items" },
  { id: "in", label: "In Refrigerator" },
  { id: "low", label: "Running Low" },
  { id: "soon", label: "Use Soon" },
  { id: "out", label: "Out" },
  { id: "grocery", label: "Added to Grocery List" },
];

export const REFRIGERATOR_CATEGORIES = [
  {
    id: "fresh-produce",
    title: "Fresh Produce",
    groups: [
      {
        label: "Vegetables",
        items: [
          "Asparagus", "Avocados", "Bell Peppers", "Broccoli", "Brussels Sprouts", "Cabbage", "Carrots", "Cauliflower", "Celery", "Corn", "Cucumbers", "Eggplant", "Fresh Green Beans", "Green Onions", "Jalapeños", "Lettuce", "Mushrooms", "Onions, Cut or Peeled", "Radishes", "Salad Greens", "Spinach", "Squash", "Tomatoes", "Zucchini",
        ],
      },
      {
        label: "Fruits",
        items: [
          "Apples", "Berries", "Cherries", "Citrus Fruit", "Cut Melon", "Grapes", "Kiwi", "Lemons", "Limes", "Peaches", "Pears", "Pineapple", "Plums",
        ],
      },
      {
        label: "Fresh Herbs",
        items: ["Basil", "Cilantro", "Dill", "Mint", "Parsley", "Rosemary", "Thyme"],
      },
    ],
  },
  {
    id: "dairy-refrigerated",
    title: "Dairy & Refrigerated Foods",
    groups: [
      { label: "Milk and Cream", items: ["Whole Milk", "Reduced-Fat Milk", "Skim Milk", "Lactose-Free Milk", "Almond Milk", "Oat Milk", "Half-and-Half", "Heavy Cream", "Coffee Creamer", "Buttermilk"] },
      { label: "Butter and Spreads", items: ["Salted Butter", "Unsalted Butter", "Margarine", "Spreadable Butter", "Cream Cheese"] },
      { label: "Cheese", items: ["American Cheese", "Cheddar Cheese", "Colby Jack Cheese", "Monterey Jack Cheese", "Mozzarella Cheese", "Parmesan Cheese", "Pepper Jack Cheese", "Provolone Cheese", "Swiss Cheese", "Feta Cheese", "Cottage Cheese", "Ricotta Cheese", "Shredded Cheese", "Sliced Cheese", "Cheese Sticks"] },
      { label: "Yogurt and Snacks", items: ["Plain Yogurt", "Greek Yogurt", "Flavored Yogurt", "Pudding Cups", "Gelatin Cups", "Applesauce Cups", "Refrigerated Protein Shakes"] },
    ],
  },
  {
    id: "eggs-breakfast",
    title: "Eggs & Breakfast Foods",
    groups: [{ label: "Breakfast Staples", items: ["Eggs", "Egg Whites", "Liquid Egg Substitute", "Hard-Boiled Eggs", "Bacon", "Breakfast Sausage", "Ham", "Refrigerated Biscuits", "Refrigerated Cinnamon Rolls", "Refrigerated Crescent Rolls", "Pancake Batter", "Waffle Batter"] }],
  },
  {
    id: "meat-poultry",
    title: "Meat & Poultry",
    groups: [
      { label: "Beef", items: ["Ground Beef", "Steaks", "Roast", "Beef Tips", "Stew Meat", "Cooked Beef"] },
      { label: "Chicken and Turkey", items: ["Chicken Breasts", "Chicken Thighs", "Chicken Legs", "Chicken Wings", "Whole Chicken", "Ground Chicken", "Ground Turkey", "Turkey Breast", "Cooked Chicken", "Rotisserie Chicken"] },
      { label: "Pork", items: ["Pork Chops", "Pork Tenderloin", "Pork Roast", "Ground Pork", "Sausage", "Bacon", "Ham", "Cooked Pork"] },
    ],
  },
  {
    id: "seafood",
    title: "Seafood",
    groups: [{ label: "Seafood", items: ["Fresh Fish", "Shrimp", "Crab", "Crawfish", "Scallops", "Smoked Salmon", "Cooked Seafood"] }],
  },
  {
    id: "deli-sandwich",
    title: "Deli & Sandwich Supplies",
    groups: [{ label: "Deli & Sandwich Supplies", items: ["Deli Turkey", "Deli Ham", "Roast Beef", "Chicken Slices", "Salami", "Pepperoni", "Bologna", "Hot Dogs", "Bratwurst", "Sandwich Cheese", "Pickles", "Olives", "Coleslaw", "Potato Salad", "Macaroni Salad", "Prepared Chicken Salad", "Prepared Tuna Salad", "Hummus"] }],
  },
  {
    id: "condiments-sauces",
    title: "Condiments & Sauces",
    groups: [
      { label: "Everyday Condiments", items: ["Ketchup", "Yellow Mustard", "Dijon Mustard", "Spicy Mustard", "Mayonnaise", "Miracle Whip", "Ranch Dressing", "Barbecue Sauce", "Steak Sauce", "Hot Sauce"] },
      { label: "Cooking Sauces", items: ["Soy Sauce", "Teriyaki Sauce", "Worcestershire Sauce", "Hoisin Sauce", "Oyster Sauce", "Fish Sauce", "Stir-Fry Sauce", "Taco Sauce", "Enchilada Sauce", "Salsa", "Pasta Sauce", "Alfredo Sauce", "Pesto", "Pizza Sauce"] },
      { label: "Specialty Condiments", items: ["Horseradish", "Tartar Sauce", "Cocktail Sauce", "Relish", "Chutney", "Kimchi", "Sauerkraut", "Pickled Jalapeños", "Capers", "Minced Garlic", "Ginger Paste"] },
    ],
  },
  {
    id: "salad-dressings",
    title: "Salad Dressings & Toppings",
    groups: [{ label: "Dressings & Toppings", items: ["Ranch", "Italian", "Caesar", "Thousand Island", "French", "Blue Cheese", "Honey Mustard", "Balsamic Vinaigrette", "Raspberry Vinaigrette", "Greek Dressing", "Bacon Bits", "Croutons", "Shredded Cheese", "Salad Toppings"] }],
  },
  {
    id: "doughs-prepared",
    title: "Refrigerated Doughs & Prepared Foods",
    groups: [{ label: "Doughs & Prepared Foods", items: ["Pizza Dough", "Pie Crust", "Biscuit Dough", "Crescent-Roll Dough", "Cookie Dough", "Pasta Dough", "Fresh Pasta", "Ravioli", "Tortellini", "Prepared Mashed Potatoes", "Prepared Macaroni and Cheese", "Prepared Side Dishes"] }],
  },
  {
    id: "beverages",
    title: "Beverages",
    groups: [{ label: "Beverages", items: ["Bottled Water", "Sparkling Water", "Soft Drinks", "Tea", "Lemonade", "Fruit Juice", "Vegetable Juice", "Sports Drinks", "Protein Drinks", "Coffee Drinks"] }],
  },
  {
    id: "breads-tortillas",
    title: "Breads & Tortillas",
    groups: [{ label: "Breads & Tortillas", items: ["Sandwich Bread", "Hamburger Buns", "Hot Dog Buns", "Dinner Rolls", "Biscuits", "Bagels", "English Muffins", "Flour Tortillas", "Corn Tortillas", "Pita Bread", "Naan"] }],
  },
  {
    id: "cooked-staples",
    title: "Cooked Staples & Meal Prep",
    groups: [{ label: "Cooked Staples & Meal Prep", items: ["Cooked White Rice", "Cooked Brown Rice", "Spanish Rice", "Fried Rice", "Cooked Pasta", "Cooked Noodles", "Mashed Potatoes", "Roasted Potatoes", "Cooked Beans", "Cooked Vegetables", "Grilled Chicken", "Shredded Chicken", "Cooked Ground Beef", "Cooked Sausage", "Hard-Boiled Eggs", "Chopped Vegetables", "Prepared Salad Mix"] }],
  },
  {
    id: "leftovers",
    title: "Leftovers & Prepared Meals",
    groups: [{ label: "Leftovers & Prepared Meals", items: ["Breakfast Leftovers", "Lunch Leftovers", "Dinner Leftovers", "Soup", "Stew", "Chili", "Casserole", "Pasta Dish", "Rice Dish", "Cooked Meat", "Cooked Vegetables", "Restaurant Leftovers", "Takeout Containers", "Meal-Prep Containers"] }],
  },
  {
    id: "desserts-sweets",
    title: "Desserts & Sweets",
    groups: [{ label: "Desserts & Sweets", items: ["Cake", "Pie", "Cheesecake", "Cookies", "Brownies", "Pudding", "Gelatin", "Whipped Topping", "Frosting", "Chocolate Syrup", "Caramel Sauce"] }],
  },
];

export function slugifyRefrigeratorItem(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getDefaultRefrigeratorItems() {
  return REFRIGERATOR_CATEGORIES.flatMap((category) =>
    category.groups.flatMap((group) =>
      group.items.map((name) => ({
        id: `${category.id}-${slugifyRefrigeratorItem(name)}`,
        name,
        categoryId: category.id,
        categoryTitle: category.title,
        group: group.label,
        custom: false,
      }))
    )
  );
}
