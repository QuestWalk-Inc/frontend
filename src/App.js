import { useState, useEffect } from "react";
import StartPage from "./StartPage";
import MainPage from "./MainPage";
import InventoryPage from "./InventoryPage";
import MapPage from "./MapPage";
import TavernPage from "./TavernPage";

function App() {
  const [started, setStarted] = useState(false);
  const [userId, setUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState("main"); // "main", "inventory", "map", or "tavern"

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    if (!tg) {
      console.warn("Telegram WebApp API is unavailable in this environment");
      return;
    }

    tg.ready();

    const telegramUserId = tg.initDataUnsafe?.user?.id;
    if (telegramUserId) {
      setUserId(String(telegramUserId));
    } else {
      console.warn("User ID not found in Telegram WebApp data");
    }
  }, []);

  if (!started) {
    return <StartPage onStart={() => setStarted(true)} />;
  }

  if (currentPage === "inventory") {
    return <InventoryPage userId={userId} onBack={() => setCurrentPage("main")} />;
  }

  if (currentPage === "map") {
    return (
      <MapPage
        onBack={() => setCurrentPage("main")}
        onOpenTavern={() => setCurrentPage("tavern")}
      />
    );
  }

  if (currentPage === "tavern") {
    return (
      <TavernPage
        userId={userId}
        onBack={() => setCurrentPage("map")}
      />
    );
  }

  return (
    <MainPage 
      userId={userId} 
      onInventoryClick={() => setCurrentPage("inventory")}
      onMapClick={() => setCurrentPage("map")}
    />
  );
}

export default App;
