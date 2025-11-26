import "./MapPage.css";
import { MAP_IMAGE_URL } from "./constants";
import { useRef, useEffect } from "react";

function MapPage({ onBack, onOpenTavern }) {
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const img = imgRef.current;

    if (!container || !img) return;

    let scale = 1.6;
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

    function clamp(val, min, max) {
      return Math.min(Math.max(val, min), max);
    }

    function updateTransform() {
      const containerRect = container.getBoundingClientRect();
      const imgWidth = img.naturalWidth * scale;
      const imgHeight = img.naturalHeight * scale;

      const maxX = 0;
      const minX = containerRect.width - imgWidth;
      posX = clamp(posX, minX > 0 ? 0 : minX, maxX);

      const maxY = 0;
      const minY = containerRect.height - imgHeight;
      posY = clamp(posY, minY > 0 ? 0 : minY, maxY);

      img.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
    }

    const handleTouchStart = e => {
      if (e.touches.length === 1) {
        isDragging = true;
        lastX = e.touches[0].clientX - posX;
        lastY = e.touches[0].clientY - posY;
      }
      if (e.touches.length === 2) {
        initialDistance = distance(e.touches);
        lastScale = scale;
      }
    };

    const handleTouchMove = e => {
      e.preventDefault();
      if (e.touches.length === 1 && isDragging) {
        posX = e.touches[0].clientX - lastX;
        posY = e.touches[0].clientY - lastY;
      }
      if (e.touches.length === 2) {
        const newDist = distance(e.touches);
        scale = Math.min(4, Math.max(1, (newDist / initialDistance) * lastScale));
      }
      updateTransform();
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    const handleMouseDown = e => {
      isDragging = true;
      lastX = e.clientX - posX;
      lastY = e.clientY - posY;
    };

    const handleMouseMove = e => {
      if (!isDragging) return;
      posX = e.clientX - lastX;
      posY = e.clientY - lastY;
      updateTransform();
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleWheel = e => {
      const delta = -e.deltaY * 0.001;
      scale = Math.max(1, Math.min(4, scale + delta));
      updateTransform();
    };

    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);

    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    container.addEventListener("wheel", handleWheel);

    updateTransform();

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);

      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <div className="map-page">
      <div className="map-page__header">
        <div className="map-page__title">MAP</div>
      </div>

      <div className="map-page__content" ref={containerRef}>
        
        {/* КАРТА */}
        <div className="map-page__map-wrapper">
          <img
            ref={imgRef}
            src={MAP_IMAGE_URL}
            alt="Quest Map"
            className="map-page__image"
          />
        </div>

        {/* КНОПКА ТАВЕРНЫ — ВСЕГДА СВЕРХУ */}
        <button
          className="map-page__poi-button"
          type="button"
          onClick={onOpenTavern}
        >
          <img
            src="https://dsrljeikegnnkujbjitp.supabase.co/storage/v1/object/sign/map%20stuff/tavern_map.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81MTQ4YTcwMS0xN2YzLTQ1ZTEtYjA2ZC00M2Q0OGU3ZDYyMDgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtYXAgc3R1ZmYvdGF2ZXJuX21hcC5wbmciLCJpYXQiOjE3NjQxNzk4NTksImV4cCI6MjAxNzgwMDcwNTl9.pk9wyrqDPrxGgP1RttZhH1bgq_B2R1RtdDAthPp57YM"
            alt="Tavern"
            className="map-page__poi-image"
          />
        </button>
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
