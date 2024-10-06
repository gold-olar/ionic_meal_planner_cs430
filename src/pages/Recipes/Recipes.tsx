import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonModal,
  IonInput,
  IonTextarea,
  IonChip,
  IonFab,
  IonFabButton,
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCardContent,
  IonButtons,
  IonItem,
  IonLabel,
} from "@ionic/react";
import { add, create, trash } from "ionicons/icons";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import "./recipes.css";

interface Recipe {
  id: string;
  name: string;
  instructions: string;
  dietaryTags: string[];
  prepTime: number;
  cookTime: number;
}

const Tab3: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const currentRecipeRef = useRef<Recipe | null>(null);

  const fetchRecipes = useCallback(async () => {
    console.log("Fetching recipes...");
    try {
      const recipesCollection = collection(db, "recipes");
      const recipesSnapshot = await getDocs(recipesCollection);
      const recipesList = recipesSnapshot.docs.map(
        (doc) => ({ ...doc.data(), id: doc.id } as Recipe)
      );
      console.log("Fetched recipes:", recipesList);
      setRecipes(recipesList);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const handleInputChange = (field: keyof Recipe, value: any) => {
    console.log(`Input change - Field: ${field}, Value:`, value);
    setCurrentRecipe((prevRecipe) => {
      if (!prevRecipe) return null;
      const updatedRecipe = { ...prevRecipe, [field]: value };
      console.log("Updated current recipe state:", updatedRecipe);
      currentRecipeRef.current = updatedRecipe; // Update the ref
      return updatedRecipe;
    });
  };

  const handleSaveRecipe = async () => {
    const recipeToSave = currentRecipeRef.current; // Use the ref instead of state
    if (recipeToSave) {
      console.log("Attempting to save recipe:", recipeToSave);
      try {
        if (isEditing) {
          const { id, ...updateData } = recipeToSave;
          console.log(
            `Updating recipe with id ${id}. Data being sent:`,
            updateData
          );
          await updateDoc(doc(db, "recipes", id), updateData);
          console.log(
            "Update operation completed. Response from Firebase:",
            "Success"
          );
        } else {
          const { id, ...newRecipeData } = recipeToSave;
          console.log("Adding new recipe. Data being sent:", newRecipeData);
          const docRef = await addDoc(collection(db, "recipes"), newRecipeData);
          console.log("Add operation completed. New document ID:", docRef.id);
        }
        await fetchRecipes();
        setIsModalOpen(false);
        setCurrentRecipe(null);
        currentRecipeRef.current = null; // Reset the ref
        setIsEditing(false);
        console.log("Recipe saved successfully. Modal closed and state reset.");
      } catch (error) {
        console.error("Error saving recipe:", error);
      }
    } else {
      console.error("Attempted to save recipe, but currentRecipe is null");
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    console.log(`Attempting to delete recipe with id: ${id}`);
    try {
      await deleteDoc(doc(db, "recipes", id));
      console.log(`Recipe with id ${id} deleted successfully`);
      await fetchRecipes();
    } catch (error) {
      console.error(`Error deleting recipe with id ${id}:`, error);
    }
  };

  const openNewRecipeModal = () => {
    console.log("Opening modal for new recipe");
    setCurrentRecipe({
      id: "",
      name: "",
      instructions: "",
      dietaryTags: [],
      prepTime: 0,
      cookTime: 0,
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditRecipeModal = (recipe: Recipe) => {
    console.log("Opening modal to edit recipe:", recipe);
    setCurrentRecipe(recipe);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Recipes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="recipe-list">
          {recipes.map((recipe) => (
            <IonCard key={recipe.id} className="recipe-card">
              <IonCardHeader>
                <IonCardTitle>{recipe.name}</IonCardTitle>
                <IonCardSubtitle>
                  Prep: {recipe.prepTime} min | Cook: {recipe.cookTime} min
                </IonCardSubtitle>
              </IonCardHeader>
              <IonCardContent>
                <div className="tag-container">
                  {recipe.dietaryTags.map((tag) => (
                    <IonChip key={tag} className="recipe-tag">
                      {tag}
                    </IonChip>
                  ))}
                </div>
                <IonButtons className="action-buttons">
                  <IonButton
                    fill="clear"
                    onClick={() => openEditRecipeModal(recipe)}
                  >
                    <IonIcon slot="icon-only" icon={create} />
                  </IonButton>
                  <IonButton
                    fill="clear"
                    onClick={() => handleDeleteRecipe(recipe.id)}
                  >
                    <IonIcon slot="icon-only" icon={trash} />
                  </IonButton>
                </IonButtons>
              </IonCardContent>
            </IonCard>
          ))}
        </div>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={openNewRecipeModal}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <IonModal
          isOpen={isModalOpen}
          onDidDismiss={() => {
            console.log("Modal dismissed");
            setIsModalOpen(false);
            currentRecipeRef.current = null; // Reset the ref when modal is dismissed
          }}
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>{isEditing ? "Edit Recipe" : "New Recipe"}</IonTitle>
              <IonButtons slot="end">
                <IonButton
                  onClick={() => {
                    console.log("Modal close button clicked");
                    setIsModalOpen(false);
                  }}
                >
                  Close
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {currentRecipe && (
              <form
                className="recipe-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  console.log("Form submitted");
                  handleSaveRecipe();
                }}
              >
                <IonItem>
                  <IonLabel position="stacked">Recipe Name</IonLabel>
                  <IonInput
                    value={currentRecipe.name}
                    onIonChange={(e) =>
                      handleInputChange("name", e.detail.value!)
                    }
                    placeholder="Enter recipe name"
                    className="custom-input"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Instructions</IonLabel>
                  <IonTextarea
                    value={currentRecipe.instructions}
                    onIonChange={(e) =>
                      handleInputChange("instructions", e.detail.value!)
                    }
                    placeholder="Enter cooking instructions"
                    rows={4}
                    className="custom-input"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Prep Time (minutes)</IonLabel>
                  <IonInput
                    type="number"
                    value={currentRecipe.prepTime}
                    onIonChange={(e) =>
                      handleInputChange(
                        "prepTime",
                        parseInt(e.detail.value!) || 0
                      )
                    }
                    placeholder="Enter prep time"
                    className="custom-input"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Cook Time (minutes)</IonLabel>
                  <IonInput
                    type="number"
                    value={currentRecipe.cookTime}
                    onIonChange={(e) =>
                      handleInputChange(
                        "cookTime",
                        parseInt(e.detail.value!) || 0
                      )
                    }
                    placeholder="Enter cook time"
                    className="custom-input"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Dietary Tags</IonLabel>
                  <IonSelect
                    multiple={true}
                    value={currentRecipe.dietaryTags}
                    onIonChange={(e) =>
                      handleInputChange("dietaryTags", e.detail.value)
                    }
                    placeholder="Select dietary tags"
                    className="custom-input"
                  >
                    <IonSelectOption value="vegetarian">
                      Vegetarian
                    </IonSelectOption>
                    <IonSelectOption value="vegan">Vegan</IonSelectOption>
                    <IonSelectOption value="glutenFree">
                      Gluten-Free
                    </IonSelectOption>
                    <IonSelectOption value="lowCarb">Low Carb</IonSelectOption>
                  </IonSelect>
                </IonItem>

                <IonButton expand="block" type="submit" className="save-button">
                  {isEditing ? "Update Recipe" : "Create Recipe"}
                </IonButton>
              </form>
            )}
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
