import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonLoading,
  IonToast,
} from "@ionic/react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import "./SettingsPage.css";

interface Preference {
  id: string;
  isChecked: boolean;
  preferenceId: string;
}

const SettingsPage: React.FC = () => {
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    setIsLoading(true);
    try {
      const preferencesCollection = collection(db, "preferences");
      const preferencesSnapshot = await getDocs(preferencesCollection);
      const preferencesList = preferencesSnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Preference)
      );
      setPreferences(preferencesList);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      setToastMessage("Failed to load preferences");
      setShowToast(true);
    }
    setIsLoading(false);
  };

  const handleToggleChange = async (id: string, newValue: boolean) => {
    setIsLoading(true);
    try {
      const preferenceRef = doc(db, "preferences", id);
      await updateDoc(preferenceRef, { isChecked: newValue });
      setPreferences(
        preferences.map((pref) =>
          pref.id === id ? { ...pref, isChecked: newValue } : pref
        )
      );
      setToastMessage("Preference updated successfully");
      setShowToast(true);
    } catch (error) {
      console.error("Error updating preference:", error);
      setToastMessage("Failed to update preference");
      setShowToast(true);
    }
    setIsLoading(false);
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Settings</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonList className="settings-list">
          {preferences.map((pref) => (
            <IonItem key={pref.id} className="preference-item">
              <IonLabel>{capitalizeFirstLetter(pref.preferenceId)}</IonLabel>
              <IonToggle
                slot="end"
                checked={pref.isChecked}
                onIonChange={(e) =>
                  handleToggleChange(pref.id, e.detail.checked)
                }
              />
            </IonItem>
          ))}
        </IonList>
        <IonLoading isOpen={isLoading} message={"Please wait..."} />
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
        />
      </IonContent>
    </IonPage>
  );
};

export default SettingsPage;
