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
  IonCheckbox,
  IonButton,
  IonInput,
  IonModal,
  IonButtons,
  IonIcon,
  IonFab,
  IonFabButton,
} from "@ionic/react";
import { add, close } from "ionicons/icons";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import "./GroceryPage.css";

interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  checked: boolean;
}

const GroceryPage: React.FC = () => {
  const [groceries, setGroceries] = useState<GroceryItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");

  useEffect(() => {
    fetchGroceries();
  }, []);

  const fetchGroceries = async () => {
    const groceriesCollection = collection(db, "groceryLists");
    const groceriesSnapshot = await getDocs(groceriesCollection);
    const groceryList = groceriesSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as GroceryItem)
    );
    setGroceries(groceryList);
  };

  const handleCheckboxChange = async (id: string, checked: boolean) => {
    const groceryRef = doc(db, "groceryLists", id);
    await updateDoc(groceryRef, { checked });
    setGroceries(
      groceries.map((item) => (item.id === id ? { ...item, checked } : item))
    );
  };

  const handleAddItem = async () => {
    if (newItemName && newItemQuantity) {
      const newItem = {
        name: newItemName,
        quantity: newItemQuantity,
        checked: false,
      };
      const docRef = await addDoc(collection(db, "groceryLists"), newItem);
      setGroceries([...groceries, { id: docRef.id, ...newItem }]);
      setNewItemName("");
      setNewItemQuantity("");
      setIsModalOpen(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Grocery List</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonList>
          {groceries.map((item) => (
            <IonItem key={item.id}>
              <IonCheckbox
                slot="start"
                checked={item.checked}
                onIonChange={(e) =>
                  handleCheckboxChange(item.id, e.detail.checked)
                }
              />
              <IonLabel>
                <h2>{item.name}</h2>
                <p>{item.quantity}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setIsModalOpen(true)}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <IonModal
          isOpen={isModalOpen}
          onDidDismiss={() => setIsModalOpen(false)}
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Add New Item</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setIsModalOpen(false)}>
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonInput
              value={newItemName}
              placeholder="Item Name"
              onIonChange={(e) => setNewItemName(e.detail.value!)}
            />
            <IonInput
              value={newItemQuantity}
              placeholder="Quantity"
              onIonChange={(e) => setNewItemQuantity(e.detail.value!)}
            />
            <IonButton expand="block" onClick={handleAddItem}>
              Add Item
            </IonButton>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default GroceryPage;
