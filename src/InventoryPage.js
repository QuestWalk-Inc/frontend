import { useState, useEffect } from "react";
import "./InventoryPage.css";

function InventoryPage({ userId, onBack }) {
  const [inventoryData, setInventoryData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadInventory = async () => {
      try {
        const response = await fetch(
          `https://fastapi-python-boilerplate-git-addcors-kanshandirs-projects.vercel.app/api/users/${userId}/`
        );
        if (!response.ok) throw new Error("Failed to load inventory");

        const userData = await response.json();

        // Extract JSON column "inventory"
        const inventory = userData.inventory || {};

        setInventoryData({
          weapon: inventory.weapon || 0,
          armour: inventory.armour || 0
        });
      } catch (err) {
        setError(err.message);
      }
    };

    if (userId) loadInventory();
  }, [userId]);

  if (error)
    return (
      <div className="inventory-page">
        <div className="inventory-page__error">Error: {error}</div>
        <button className="inventory-page__back-button" onClick={onBack}>
          BACK
        </button>
      </div>
    );

  if (!inventoryData)
    return (
      <div className="inventory-page">
        <div className="inventory-page__loading">Loading...</div>
      </div>
    );

  return (
    <div className="inventory-page">
      <div className="inventory-page__header">
        <div className="inventory-page__title">INVENTORY</div>
      </div>

      <div className="inventory-page__content">
        <div className="inventory-page__item">
          <div className="inventory-page__item-label">WEAPON</div>
          <div className="inventory-page__item-value">
            +{inventoryData.weapon}
          </div>
        </div>

        <div className="inventory-page__item">
          <div className="inventory-page__item-label">ARMOUR</div>
          <div className="inventory-page__item-value">
            {inventoryData.armour}
          </div>
        </div>
      </div>

      <div className="inventory-page__buttons">
        <button className="inventory-page__back-button" onClick={onBack}>
          BACK
        </button>
      </div>
    </div>
  );
}

export default InventoryPage;
