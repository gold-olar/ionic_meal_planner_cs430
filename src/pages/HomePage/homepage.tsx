import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonSkeletonText,
  IonSegment,
  IonSegmentButton,
} from "@ionic/react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { calendar, chevronDown, chevronUp } from "ionicons/icons";
import "./homepage.css";

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

interface MealPlan {
  id: string;
  weekStartDate: Timestamp | string | number;
  meals: DayMeal[];
}

const HomePage: React.FC = () => {
  const [currentMealPlan, setCurrentMealPlan] = useState<MealPlan | null>(null);
  const [previousMealPlans, setPreviousMealPlans] = useState<MealPlan[]>([]);
  const [expandedDays, setExpandedDays] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"current" | "previous">("current");

  const getDateFromWeekStartDate = (
    weekStartDate: Timestamp | string | number
  ): Date => {
    if (weekStartDate instanceof Timestamp) {
      return weekStartDate.toDate();
    } else if (typeof weekStartDate === "string") {
      return new Date(weekStartDate);
    } else if (typeof weekStartDate === "number") {
      return new Date(weekStartDate);
    }
    throw new Error("Invalid weekStartDate format");
  };

  useEffect(() => {
    const fetchMealPlans = async () => {
      setLoading(true);
      const now = new Date();

      const mealPlansQuery = query(
        collection(db, "meals"),
        orderBy("weekStartDate", "desc"),
        limit(10)
      );

      const snapshot = await getDocs(mealPlansQuery);
      const mealPlans = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as MealPlan)
      );

      // Find the current week's meal plan
      const currentPlan = mealPlans.find((plan) => {
        try {
          const planStart = getDateFromWeekStartDate(plan.weekStartDate);
          const planEnd = new Date(
            planStart.getTime() + 7 * 24 * 60 * 60 * 1000
          );
          return now >= planStart && now < planEnd;
        } catch (error) {
          console.error("Error processing plan:", error);
          return false;
        }
      });

      if (currentPlan) {
        setCurrentMealPlan(currentPlan);
        setPreviousMealPlans(
          mealPlans.filter((plan) => {
            try {
              return (
                getDateFromWeekStartDate(plan.weekStartDate) <
                getDateFromWeekStartDate(currentPlan.weekStartDate)
              );
            } catch (error) {
              console.error("Error comparing plans:", error);
              return false;
            }
          })
        );
      } else {
        setPreviousMealPlans(mealPlans);
      }

      setLoading(false);
    };

    fetchMealPlans();
  }, []);

  const toggleExpand = (day: string) => {
    setExpandedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const formatDate = (weekStartDate: Timestamp | string | number) => {
    try {
      const date = getDateFromWeekStartDate(weekStartDate);
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const renderMealPlan = (mealPlan: MealPlan) => (
    <>
      <p className="week-start-date">
        Week of {formatDate(mealPlan.weekStartDate)}
      </p>
      {mealPlan.meals.map((dayMeal) => (
        <IonCard key={dayMeal.day} className="meal-card">
          <IonCardHeader>
            <IonCardTitle>{dayMeal.day}</IonCardTitle>
            <IonCardSubtitle>
              {dayMeal.breakfast.recipeName} • {dayMeal.lunch.recipeName} •{" "}
              {dayMeal.dinner.recipeName}
            </IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent
            className={expandedDays.includes(dayMeal.day) ? "expanded" : ""}
          >
            {expandedDays.includes(dayMeal.day) && (
              <>
                <IonItem lines="none">
                  <IonLabel>
                    <h3>Breakfast</h3>
                    <p>{dayMeal.breakfast.recipeName}</p>
                  </IonLabel>
                </IonItem>
                <IonItem lines="none">
                  <IonLabel>
                    <h3>Lunch</h3>
                    <p>{dayMeal.lunch.recipeName}</p>
                  </IonLabel>
                </IonItem>
                <IonItem lines="none">
                  <IonLabel>
                    <h3>Dinner</h3>
                    <p>{dayMeal.dinner.recipeName}</p>
                  </IonLabel>
                </IonItem>
              </>
            )}
          </IonCardContent>
          <IonButton
            fill="clear"
            expand="block"
            onClick={() => toggleExpand(dayMeal.day)}
          >
            <IonIcon
              slot="icon-only"
              icon={
                expandedDays.includes(dayMeal.day) ? chevronUp : chevronDown
              }
            />
          </IonButton>
        </IonCard>
      ))}
    </>
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Meal Planner</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="meal-plan-container">
          <h2 className="section-title">
            <IonIcon icon={calendar} /> Meal Plans
          </h2>
          <IonSegment
            value={viewMode}
            onIonChange={(e) =>
              setViewMode(e.detail.value as "current" | "previous")
            }
          >
            <IonSegmentButton value="current">
              <IonLabel>This Week</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="previous">
              <IonLabel>Previous Weeks</IonLabel>
            </IonSegmentButton>
          </IonSegment>
          {loading ? (
            <IonCard>
              <IonCardHeader>
                <IonSkeletonText animated style={{ width: "60%" }} />
              </IonCardHeader>
              <IonCardContent>
                <IonSkeletonText animated style={{ width: "100%" }} />
                <IonSkeletonText animated style={{ width: "100%" }} />
                <IonSkeletonText animated style={{ width: "100%" }} />
              </IonCardContent>
            </IonCard>
          ) : viewMode === "current" ? (
            currentMealPlan ? (
              renderMealPlan(currentMealPlan)
            ) : (
              <p>No meal plan available for this week.</p>
            )
          ) : previousMealPlans.length > 0 ? (
            previousMealPlans.map((plan) => renderMealPlan(plan))
          ) : (
            <p>No previous meal plans available.</p>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default HomePage;
