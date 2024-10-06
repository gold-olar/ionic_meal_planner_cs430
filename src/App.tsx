import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { home, fastFood, pizza, settings } from "ionicons/icons";

import MealPlanner from "./pages/MealPlanner/MealPlanner";
import Recipes from "./pages/Recipes/Recipes";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

import { LocalNotifications } from "@capacitor/local-notifications";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import "@ionic/react/css/palettes/dark.system.css";

/* Theme variables */
import "./theme/variables.css";
import HomePage from "./pages/HomePage/homepage";
import GroceryPage from "./pages/GroceryPage/GroceryPage";
import SettingsPage from "./pages/SettingPage/SettingPage";
import { useEffect } from "react";

setupIonicReact();

const App: React.FC = () => {
  useEffect(() => {
    requestPermissions();
    scheduleNotifications();
  }, []);

  // This function requests permission to show notifications.
  const requestPermissions = async () => {
    await LocalNotifications.requestPermissions();
  };

  // Ideally, we would schedule notifications based on the user's meal plan,
  // but for now, we'll just schedule one notification.
  const scheduleNotifications = async () => {
    await LocalNotifications.schedule({
      notifications: [
        {
          title: "Meal Planner Reminder",
          body: "It's time top plan your meal!",
          id: 1,
          schedule: {
            every: "week",
            on: { day: 1 },
            at: new Date(Date.now() + 10000),
          },
        },
      ],
    });
  };

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/home">
              <HomePage />
            </Route>
            <Route exact path="/meal-planner">
              <MealPlanner />
            </Route>
            <Route path="/recipes">
              <Recipes />
            </Route>
            <Route path="/groceries">
              <GroceryPage />
            </Route>
            <Route path="/settings">
              <SettingsPage />
            </Route>
            <Route exact path="/">
              <Redirect to="/home" />
            </Route>
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="home" href="/home">
              <IonIcon aria-hidden="true" icon={home} />
              <IonLabel>Home</IonLabel>
            </IonTabButton>
            <IonTabButton tab="meal-planner" href="/meal-planner">
              <IonIcon aria-hidden="true" icon={fastFood} />
              <IonLabel>Meal Planner</IonLabel>
            </IonTabButton>
            <IonTabButton tab="recipes" href="/recipes">
              <IonIcon aria-hidden="true" icon={pizza} />
              <IonLabel>Recipes</IonLabel>
            </IonTabButton>
            <IonTabButton tab="settings" href="/settings">
              <IonIcon aria-hidden="true" icon={settings} />
              <IonLabel>settings</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
