import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonButton,
  IonDatetime,
  IonModal,
  IonToast,
  IonSearchbar,
  IonList,
  IonIcon,
  IonFab,
  IonFabButton,
} from "@ionic/react";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { closeCircleOutline, listOutline } from "ionicons/icons";
import "./mealplanner.css";

interface Recipe {
  id: string;
  name: string;
}

interface Meal {
  recipeId: string;
  recipeName: string;
}

interface DayMeal {
  day: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
}

interface WeeklyMealPlan {
  weekStartDate: string;
  meals: DayMeal[];
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const Tab2: React.FC = () => {
  const [weekStartDate, setWeekStartDate] = useState<string>("");
  const [mealPlan, setMealPlan] = useState<WeeklyMealPlan>({
    weekStartDate: "",
    meals: DAYS_OF_WEEK.map((day) => ({
      day,
      breakfast: { recipeId: "", recipeName: "" },
      lunch: { recipeId: "", recipeName: "" },
      dinner: { recipeId: "", recipeName: "" },
    })),
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSelection, setCurrentSelection] = useState<{
    day: string;
    mealType: "breakfast" | "lunch" | "dinner";
  } | null>(null);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    const recipesCollection = collection(db, "recipes");
    const recipesSnapshot = await getDocs(recipesCollection);
    const recipesList = recipesSnapshot.docs.map(
      (doc) => ({ id: doc.id, name: doc.data().name } as Recipe)
    );
    setRecipes(recipesList);
  };

  const handleDateChange = (e: CustomEvent) => {
    setWeekStartDate(e.detail.value);
    setMealPlan((prev) => ({ ...prev, weekStartDate: e.detail.value }));
  };

  const openRecipeModal = (
    day: string,
    mealType: "breakfast" | "lunch" | "dinner"
  ) => {
    setCurrentSelection({ day, mealType });
    setFilteredRecipes(recipes);
    setIsRecipeModalOpen(true);
  };

  const handleRecipeSearch = (e: CustomEvent) => {
    const searchTerm = e.detail.value.toLowerCase();
    setSearchTerm(searchTerm);
    const filtered = recipes.filter((recipe) =>
      recipe.name.toLowerCase().includes(searchTerm)
    );
    setFilteredRecipes(filtered);
  };

  const selectRecipe = (recipe: Recipe) => {
    if (currentSelection) {
      const { day, mealType } = currentSelection;
      setMealPlan((prev) => ({
        ...prev,
        meals: prev.meals.map((meal) =>
          meal.day === day
            ? {
                ...meal,
                [mealType]: { recipeId: recipe.id, recipeName: recipe.name },
              }
            : meal
        ),
      }));
    }
    setIsRecipeModalOpen(false);
  };

  const handleSubmit = async () => {
    try {
      await addDoc(collection(db, "meals"), mealPlan);
      setShowToast(true);
      // Reset form after successful submission
      setWeekStartDate("");
      setMealPlan({
        weekStartDate: "",
        meals: DAYS_OF_WEEK.map((day) => ({
          day,
          breakfast: { recipeId: "", recipeName: "" },
          lunch: { recipeId: "", recipeName: "" },
          dinner: { recipeId: "", recipeName: "" },
        })),
      });
    } catch (error) {
      console.error("Error adding meal plan: ", error);
    }
  };

  const handleGroceryListClick = () => {
    // Implement the action for when the Grocery List button is clicked
    console.log("Grocery List button clicked");
    // You can navigate to a new page or open a modal here
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Create Meal Plan</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="meal-plan-form">
          <IonItem>
            <IonLabel>Week Start Date</IonLabel>
            <IonButton onClick={() => setIsDatePickerOpen(true)}>
              {weekStartDate
                ? new Date(weekStartDate).toLocaleDateString()
                : "Select Date"}
            </IonButton>
          </IonItem>
          <IonModal isOpen={isDatePickerOpen} className="date-picker-modal">
            <div className="date-picker-container">
              <IonDatetime
                presentation="date"
                onIonChange={handleDateChange}
                onIonCancel={() => setIsDatePickerOpen(false)}
                className="centered-calendar"
              />
              <IonButton onClick={() => setIsDatePickerOpen(false)}>
                Close
              </IonButton>
            </div>
          </IonModal>
          <IonGrid>
            {mealPlan.meals.map((dayMeal, index) => (
              <IonCard key={index} className="day-card">
                <IonCardHeader>
                  <IonCardTitle>{dayMeal.day}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  {["breakfast", "lunch", "dinner"].map((mealType) => (
                    <IonItem key={mealType}>
                      <IonLabel position="stacked">
                        {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                      </IonLabel>
                      <IonButton
                        expand="block"
                        onClick={() =>
                          openRecipeModal(
                            dayMeal.day,
                            mealType as "breakfast" | "lunch" | "dinner"
                          )
                        }
                      >
                        {dayMeal[mealType as "breakfast" | "lunch" | "dinner"]
                          .recipeName || `Select ${mealType}`}
                      </IonButton>
                    </IonItem>
                  ))}
                </IonCardContent>
              </IonCard>
            ))}
          </IonGrid>
          <IonButton
            expand="block"
            onClick={handleSubmit}
            className="submit-button"
          >
            Create Meal Plan
          </IonButton>
        </div>
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton
            onClick={handleGroceryListClick}
            className="grocery-list-fab"
          >
            <IonIcon icon={listOutline} />
            <span className="grocery-list-text">Grocery List</span>
          </IonFabButton>
        </IonFab>
        <IonModal
          isOpen={isRecipeModalOpen}
          onDidDismiss={() => setIsRecipeModalOpen(false)}
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Select Recipe</IonTitle>
              <IonButton slot="end" onClick={() => setIsRecipeModalOpen(false)}>
                <IonIcon icon={closeCircleOutline} />
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonSearchbar
              value={searchTerm}
              onIonChange={handleRecipeSearch}
              placeholder="Search recipes"
            />
            <IonList>
              {filteredRecipes.map((recipe) => (
                <IonItem
                  key={recipe.id}
                  button
                  onClick={() => selectRecipe(recipe)}
                >
                  <IonLabel>{recipe.name}</IonLabel>
                </IonItem>
              ))}
            </IonList>
          </IonContent>
        </IonModal>
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="Meal plan created successfully!"
          duration={2000}
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
