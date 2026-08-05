# BASE WEBSITE 3 — Backup and Restore Integration

## Placement
Place `<UserDataBackupSection />` near the bottom of the existing Favorites page, after the favorites grid/empty state and before `</main>`.

## App.jsx changes

Add the import:

```jsx
import UserDataBackupSection from "./components/UserDataBackupSection";
import "./components/UserDataBackupSection.css";
```

Inside `FavoritesPage`, add:

```jsx
<UserDataBackupSection
  onRestored={() => {
    window.location.hash = "your-recipe-box-data";
  }}
/>
```

For the footer link, replace the existing footer content with the same current text plus:

```jsx
{" · "}
<button
  type="button"
  className="footerDataLink"
  onClick={() => {
    setActivePage("Favorites");
    window.setTimeout(() => {
      document.getElementById("your-recipe-box-data")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }}
>
  Manage or back up your Recipe Box data
</button>
```

## State refresh after restore
In the main `App` component, add this effect after the state declarations:

```jsx
useEffect(() => {
  function refreshRestoredUserData() {
    setFavorites(loadJSON(STORAGE_KEYS.favorites, []));
    setPlan(normalizeTwoWeekPlan(loadJSON(STORAGE_KEYS.plan, emptyTwoWeekPlan())));
    setServings(loadJSON(STORAGE_KEYS.servings, 2));
    setChecked(loadJSON(STORAGE_KEYS.checked, {}));
    setPantry(loadJSON(STORAGE_KEYS.pantry, {}));
    setRefrigerator(loadJSON(STORAGE_KEYS.refrigerator, getDefaultRefrigeratorItems()));
    setFreezer(loadJSON(STORAGE_KEYS.freezer, getDefaultFreezerItems()));
  }

  window.addEventListener("rrb:user-data-restored", refreshRestoredUserData);
  return () => window.removeEventListener("rrb:user-data-restored", refreshRestoredUserData);
}, []);
```

Adjust setter names only if the current App component uses different names.

## Storage categories
The service maps the seven confirmed current keys and also recognizes reserved future-compatible keys for:
notes, grocery lists, saved collections, recently viewed recipes, cooked status, personal ratings, display preferences, accessibility preferences, and recipe classifications.

Unknown fields in imported backups are ignored safely.
