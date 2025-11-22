import "./MapPage.css";
import { MAP_IMAGE_URL } from "./constants";
import { useRef, useEffect } from "react";

function MapPage({ onBack }) {
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const img = imgRef.current;

    let scale = 1;
    let lastScale = 1;
    let posX = 0;
    let posY = 0;
    let lastX = 0;
    let lastY = 0;
    let isDragging = false;
    let initialDistance = 0;

    function distance(touches) {
      const [a, b] = touches;
      return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    }

    // ===== TOUCH =====
    container.addEventListener("touchstart", e => {
      if (e.touches.length === 1) {
        isDragging = true;
        lastX = e.touches[0].clientX - posX;
        lastY = e.touches[0].clientY - posY;
      }
      if (e.touches.length === 2) {
        initialDistance = distance(e.touches);
        lastScale = scale;
      }
    });

    container.addEventListener(
      "touchmove",
      e => {
        e.preventDefault();
        if (e.touches.length === 1 && isDragging) {
          posX = e.touches[0].clientX - lastX;
          posY = e.touches[0].clientY - lastY;
        }
        if (e.touches.length === 2) {
          const newDist = distance(e.touches);
          scale = Math.min(4, Math.max(0.8, (newDist / initialDistance) * lastScale));
        }
        img.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
      },
      { passive: false }
    );

    container.addEventListener("touchend", () => {
      isDragging = false;
    });

    // ===== MOUSE =====
    container.addEventListener("mousedown", e => {
      isDragging = true;
      lastX = e.clientX - posX;
      lastY = e.clientY - posY;
    });

    window.addEventListener("mousemove", e => {
      if (!isDragging) return;
      posX = e.clientX - lastX;
      posY = e.clientY - lastY;
      img.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
    });

    window.addEventListener("mouseup", () => {
      isDragging = false;
    });

    // ===== WHEEL ZOOM =====
    container.addEventListener("wheel", e => {
      const delta = -e.deltaY * 0.001;
      scale = Math.max(0.8, Math.min(4, scale + delta));
      img.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
    });
  }, []);

  return (
    <div className="map-page">
      <div className="map-page__header">
        <div className="map-page__title">MAP</div>
      </div>

      <div className="map-page__content" ref={containerRef}>
        <img
          ref={imgRef}
          src={MAP_IMAGE_URL}
          alt="Quest Map"
          className="map-page__image"
        />
      </div>

      <div className="map-page__buttons">
        <button className="map-page__back-button" onClick={onBack}>
          BACK
        </button>
      </div>
    </div>
  );
}

export default MapPage;
