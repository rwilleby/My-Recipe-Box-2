// src/components/AdminRecipeClassifier.jsx
import { useEffect, useMemo, useState } from "react";
import {
  COOKING_METHODS,
  RECIPE_ATTRIBUTES,
  RECIPE_COLLECTIONS,
  normalizeRecipeClassification,
  saveRecipeClassifications,
} from "../data/recipeClassifications";
import "./AdminRecipeClassifier.css";

function CheckboxGroup({ title, options, selected, onToggle }) {
  return (
    <fieldset className="adminClassifierGroup">
      <legend>{title}</legend>
      <div className="adminClassifierChecks">
        {options.map((option) => (
          <label className="adminClassifierCheck" key={option}>
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onToggle(option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function BulkAssignmentGroup({ title, options, changes, onChange }) {
  function setAction(option, action) {
    onChange((current) => {
      const next = { ...current };
      if (action === "keep") delete next[option];
      else next[option] = action;
      return next;
    });
  }

  return (
    <fieldset className="adminClassifierGroup adminBulkAssignmentGroup">
      <legend>{title}</legend>
      <p className="adminBulkHelp">
        Choose Add or Remove. Items left as Keep Existing will not be changed.
      </p>
      <div className="adminBulkAssignmentList">
        {options.map((option) => (
          <div className="adminBulkAssignmentRow" key={option}>
            <strong>{option}</strong>
            <div className="adminBulkChoiceButtons" aria-label={`${option} bulk action`}>
              {[
                ["keep", "Keep Existing"],
                ["add", "Add"],
                ["remove", "Remove"],
              ].map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  className={(changes[option] || "keep") === value ? "active" : ""}
                  onClick={() => setAction(option, value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  );
}

function applyListChanges(existingValues = [], changes = {}) {
  const next = new Set(existingValues);
  Object.entries(changes).forEach(([value, action]) => {
    if (action === "add") next.add(value);
    if (action === "remove") next.delete(value);
  });
  return [...next];
}

export default function AdminRecipeClassifier({
  recipes,
  categories,
  classifications,
  setClassifications,
  onClose,
}) {
  const [mode, setMode] = useState("single");
  const [query, setQuery] = useState("");
  const [selectedRecipeId, setSelectedRecipeId] = useState(recipes[0]?.id || "");
  const [selectedRecipeIds, setSelectedRecipeIds] = useState([]);
  const [bulkPrimaryCategory, setBulkPrimaryCategory] = useState("");
  const [bulkCollections, setBulkCollections] = useState({});
  const [bulkAttributes, setBulkAttributes] = useState({});
  const [bulkCookingMethods, setBulkCookingMethods] = useState({});
  const [status, setStatus] = useState("");

  const filteredRecipes = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return recipes;

    return recipes.filter((recipe) =>
      `${recipe.id} ${recipe.title} ${recipe.category}`.toLowerCase().includes(search)
    );
  }, [query, recipes]);

  useEffect(() => {
    if (
      filteredRecipes.length &&
      !filteredRecipes.some((recipe) => recipe.id === selectedRecipeId)
    ) {
      setSelectedRecipeId(filteredRecipes[0].id);
    }
  }, [filteredRecipes, selectedRecipeId]);

  const recipe = recipes.find((item) => item.id === selectedRecipeId) || recipes[0];

  if (!recipe) {
    return (
      <main className="pageShell adminClassifierPage">
        <p>No recipes are available.</p>
      </main>
    );
  }

  const current = normalizeRecipeClassification(recipe, classifications[recipe.id]);
  const selectedCount = selectedRecipeIds.length;

  function updateCurrent(patch) {
    setClassifications((existing) => ({
      ...existing,
      [recipe.id]: {
        ...current,
        ...patch,
      },
    }));
    setStatus("Unsaved changes");
  }

  function toggleListValue(field, value) {
    const selected = current[field] || [];
    updateCurrent({
      [field]: selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    });
  }

  function toggleBulkRecipe(recipeId) {
    setSelectedRecipeIds((existing) =>
      existing.includes(recipeId)
        ? existing.filter((id) => id !== recipeId)
        : [...existing, recipeId]
    );
    setStatus("");
  }

  function selectAllFiltered() {
    const filteredIds = filteredRecipes.map((item) => item.id);
    setSelectedRecipeIds((existing) => [...new Set([...existing, ...filteredIds])]);
    setStatus(`${filteredIds.length} visible recipes selected`);
  }

  function clearBulkSelection() {
    setSelectedRecipeIds([]);
    setStatus("Group selection cleared");
  }

  function resetBulkChanges() {
    setBulkPrimaryCategory("");
    setBulkCollections({});
    setBulkAttributes({});
    setBulkCookingMethods({});
    setStatus("Group assignment choices reset");
  }

  function applyBulkChanges() {
    if (!selectedCount) {
      setStatus("Select at least one recipe first");
      return;
    }

    setClassifications((existing) => {
      const next = { ...existing };

      selectedRecipeIds.forEach((recipeId) => {
        const selectedRecipe = recipes.find((item) => item.id === recipeId);
        if (!selectedRecipe) return;

        const normalized = normalizeRecipeClassification(
          selectedRecipe,
          existing[recipeId]
        );

        next[recipeId] = {
          ...normalized,
          primaryCategory: bulkPrimaryCategory || normalized.primaryCategory,
          collections: applyListChanges(normalized.collections, bulkCollections),
          attributes: applyListChanges(normalized.attributes, bulkAttributes),
          cookingMethods: applyListChanges(
            normalized.cookingMethods,
            bulkCookingMethods
          ),
        };
      });

      return next;
    });

    setStatus(`Group changes applied to ${selectedCount} recipes — save when ready`);
  }

  function saveChanges() {
    saveRecipeClassifications(classifications);
    setStatus("Saved in this browser");
  }

  function resetCurrent() {
    setClassifications((existing) => {
      const next = { ...existing };
      delete next[recipe.id];
      return next;
    });
    setStatus("Recipe classifications reset");
  }

  function exportClassifications() {
    const blob = new Blob([JSON.stringify(classifications, null, 2)], {
      type: "application/json",
    });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = "recipe-classifications.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
    setStatus("Classification file downloaded");
  }

  function copySuggestedRecipeObject() {
    const output = {
      id: recipe.id,
      primaryCategory: current.primaryCategory,
      collections: current.collections,
      attributes: current.attributes,
      cookingMethods: current.cookingMethods,
    };

    navigator.clipboard
      ?.writeText(JSON.stringify(output, null, 2))
      .then(() => setStatus("Recipe classification copied"))
      .catch(() => setStatus("Copy was blocked; use Export JSON instead"));
  }

  return (
    <main className="pageShell adminClassifierPage">
      <header className="adminClassifierHeader">
        <div>
          <div className="aiBadge">ADMIN RECIPE CLASSIFICATION</div>
          <h1>Assign Recipes to Categories & Collections</h1>
          <p>
            Edit one recipe at a time, or select a group of recipes and add or
            remove shared categories, collections, attributes, and cooking methods.
          </p>
        </div>

        <div className="adminClassifierHeaderButtons">
          <button className="secondary" type="button" onClick={exportClassifications}>
            Export JSON
          </button>
          <button className="secondary" type="button" onClick={onClose}>
            Close Admin
          </button>
        </div>
      </header>

      <div className="adminClassifierModeTabs" role="tablist" aria-label="Classification mode">
        <button
          type="button"
          className={mode === "single" ? "active" : ""}
          onClick={() => {
            setMode("single");
            setStatus("");
          }}
        >
          One Recipe
        </button>
        <button
          type="button"
          className={mode === "group" ? "active" : ""}
          onClick={() => {
            setMode("group");
            setStatus("");
          }}
        >
          Recipe Group
          {selectedCount > 0 && <span>{selectedCount}</span>}
        </button>
      </div>

      <div className="adminClassifierLayout">
        <aside className="adminRecipePicker">
          <label htmlFor="admin-recipe-search">
            {mode === "group" ? "Find and select recipes" : "Find a recipe"}
          </label>
          <input
            id="admin-recipe-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Recipe code, name, or category"
          />

          {mode === "group" && (
            <div className="adminBulkPickerActions">
              <button type="button" onClick={selectAllFiltered}>
                Select Visible
              </button>
              <button type="button" onClick={clearBulkSelection} disabled={!selectedCount}>
                Clear Selection
              </button>
            </div>
          )}

          <div className={mode === "group" ? "adminRecipeList groupMode" : "adminRecipeList"}>
            {filteredRecipes.map((item) => {
              if (mode === "group") {
                const checked = selectedRecipeIds.includes(item.id);
                return (
                  <label className={checked ? "adminBulkRecipeRow selected" : "adminBulkRecipeRow"} key={item.id}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleBulkRecipe(item.id)}
                    />
                    <strong>{item.id}</strong>
                    <span>{item.title}</span>
                  </label>
                );
              }

              return (
                <button
                  type="button"
                  key={item.id}
                  className={item.id === recipe.id ? "active" : ""}
                  onClick={() => {
                    setSelectedRecipeId(item.id);
                    setStatus("");
                  }}
                >
                  <strong>{item.id}</strong>
                  <span>{item.title}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {mode === "single" ? (
          <section className="adminClassifierEditor">
            <div className="adminSelectedRecipe">
              <div>
                <span>{recipe.id}</span>
                <h2>{recipe.title}</h2>
                <small>Current category: {recipe.category}</small>
              </div>
              <span className="adminAssignmentCount">
                {current.collections.length +
                  current.attributes.length +
                  current.cookingMethods.length}{" "}
                assignments
              </span>
            </div>

            <label className="adminPrimaryCategory">
              <span>Primary Recipe Category</span>
              <select
                value={current.primaryCategory}
                onChange={(event) =>
                  updateCurrent({ primaryCategory: event.target.value })
                }
              >
                <option value="">Choose a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <CheckboxGroup
              title="Collections"
              options={RECIPE_COLLECTIONS}
              selected={current.collections}
              onToggle={(value) => toggleListValue("collections", value)}
            />

            <CheckboxGroup
              title="Recipe Attributes"
              options={RECIPE_ATTRIBUTES}
              selected={current.attributes}
              onToggle={(value) => toggleListValue("attributes", value)}
            />

            <CheckboxGroup
              title="Cooking Methods"
              options={COOKING_METHODS}
              selected={current.cookingMethods}
              onToggle={(value) => toggleListValue("cookingMethods", value)}
            />

            <div className="adminClassifierActions">
              <button className="primary" type="button" onClick={saveChanges}>
                Save Classifications
              </button>
              <button className="secondary" type="button" onClick={copySuggestedRecipeObject}>
                Copy This Recipe
              </button>
              <button className="secondary" type="button" onClick={resetCurrent}>
                Reset Recipe
              </button>
              <span role="status" aria-live="polite">{status}</span>
            </div>
          </section>
        ) : (
          <section className="adminClassifierEditor adminBulkEditor">
            <div className="adminSelectedRecipe adminBulkSelectedHeader">
              <div>
                <span>GROUP EDITOR</span>
                <h2>{selectedCount} Recipes Selected</h2>
                <small>
                  Search by code, name, or category, then check every recipe that
                  should receive the same assignment changes.
                </small>
              </div>
              <span className="adminAssignmentCount">{selectedCount} selected</span>
            </div>

            <div className="adminBulkNotice">
              Existing classifications are preserved unless you explicitly choose
              Add, Remove, or a new primary category.
            </div>

            <label className="adminPrimaryCategory">
              <span>Primary Recipe Category</span>
              <select
                value={bulkPrimaryCategory}
                onChange={(event) => setBulkPrimaryCategory(event.target.value)}
              >
                <option value="">Keep each recipe’s existing category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    Change all selected recipes to {category.name}
                  </option>
                ))}
              </select>
            </label>

            <BulkAssignmentGroup
              title="Collections"
              options={RECIPE_COLLECTIONS}
              changes={bulkCollections}
              onChange={setBulkCollections}
            />

            <BulkAssignmentGroup
              title="Recipe Attributes"
              options={RECIPE_ATTRIBUTES}
              changes={bulkAttributes}
              onChange={setBulkAttributes}
            />

            <BulkAssignmentGroup
              title="Cooking Methods"
              options={COOKING_METHODS}
              changes={bulkCookingMethods}
              onChange={setBulkCookingMethods}
            />

            <div className="adminClassifierActions adminBulkActions">
              <button
                className="primary"
                type="button"
                onClick={applyBulkChanges}
                disabled={!selectedCount}
              >
                Apply to {selectedCount || 0} Selected Recipes
              </button>
              <button className="secondary" type="button" onClick={saveChanges}>
                Save Classifications
              </button>
              <button className="secondary" type="button" onClick={resetBulkChanges}>
                Reset Group Choices
              </button>
              <span role="status" aria-live="polite">{status}</span>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
