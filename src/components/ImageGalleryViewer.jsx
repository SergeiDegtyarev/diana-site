import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";

const easing = [0.16, 1, 0.3, 1];

const uniqueImages = (images) =>
  [...new Set((images || []).map((image) => String(image || "").trim()).filter(Boolean))];

export default function ImageGalleryViewer({ images, primaryImage, alt }) {
  const imageList = useMemo(
    () => uniqueImages([primaryImage, ...(Array.isArray(images) ? images : [])]),
    [images, primaryImage]
  );
  const imageKey = imageList.join("|");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const swipeStartX = useRef(null);
  const closeButtonRef = useRef(null);
  const activeImage = imageList[activeIndex] || primaryImage;

  const showPrevious = useCallback(() => {
    setActiveIndex((index) => (index - 1 + imageList.length) % imageList.length);
  }, [imageList.length]);

  const showNext = useCallback(() => {
    setActiveIndex((index) => (index + 1) % imageList.length);
  }, [imageList.length]);

  useEffect(() => {
    setActiveIndex(0);
  }, [imageKey]);

  useEffect(() => {
    if (!isFullscreen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsFullscreen(false);
      if (event.key === "ArrowLeft" && imageList.length > 1) showPrevious();
      if (event.key === "ArrowRight" && imageList.length > 1) showNext();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [imageList.length, isFullscreen, showNext, showPrevious]);

  if (!activeImage) {
    return null;
  }

  const handleFullscreenPointerUp = (event) => {
    if (swipeStartX.current === null || imageList.length < 2) return;

    const distance = event.clientX - swipeStartX.current;
    swipeStartX.current = null;
    if (Math.abs(distance) < 55) return;
    if (distance > 0) showPrevious();
    else showNext();
  };

  const fullscreen = typeof document !== "undefined"
    ? createPortal(
        <AnimatePresence>
          {isFullscreen && (
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`Полноэкранная галерея: ${alt}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: easing }}
              className="fixed inset-0 z-[100] bg-[#0A0A0A] text-white"
            >
              <div className="absolute inset-x-0 top-0 z-20 flex h-20 items-center justify-between px-5 md:px-8">
                <span className="text-[10px] tracking-widest text-white/50">
                  {String(activeIndex + 1).padStart(2, "0")} / {String(imageList.length).padStart(2, "0")}
                </span>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="inline-flex h-11 w-11 items-center justify-center border border-white/15 text-white/70 transition-colors hover:border-white/50 hover:text-white"
                  aria-label="Закрыть полноэкранную галерею"
                  title="Закрыть"
                >
                  <X size={20} />
                </button>
              </div>

              <div
                className="flex h-full items-center justify-center px-4 pb-20 pt-20 md:px-20"
                onPointerDown={(event) => {
                  swipeStartX.current = event.clientX;
                }}
                onPointerUp={handleFullscreenPointerUp}
                onPointerCancel={() => {
                  swipeStartX.current = null;
                }}
              >
                <motion.img
                  key={activeImage}
                  src={activeImage}
                  alt={`${alt}, изображение ${activeIndex + 1}`}
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.45, ease: easing }}
                  className="max-h-full max-w-full select-none object-contain"
                  style={{ touchAction: "pan-y pinch-zoom" }}
                  draggable={false}
                />
              </div>

              {imageList.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPrevious}
                    className="absolute left-3 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-white/15 bg-black/20 text-white/70 transition-colors hover:border-white/50 hover:text-white md:left-7"
                    aria-label="Предыдущее изображение"
                    title="Предыдущее изображение"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    onClick={showNext}
                    className="absolute right-3 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-white/15 bg-black/20 text-white/70 transition-colors hover:border-white/50 hover:text-white md:right-7"
                    aria-label="Следующее изображение"
                    title="Следующее изображение"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}

              <div className="absolute inset-x-0 bottom-0 z-20 flex h-16 items-center justify-center px-20">
                <p className="max-w-full truncate text-xs text-white/45">{alt}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )
    : null;

  return (
    <>
      <div className="relative flex justify-center bg-[#F7F7F7]">
        <button
          type="button"
          onClick={() => setIsFullscreen(true)}
          className="relative inline-flex max-w-full cursor-pointer items-center justify-center overflow-hidden"
          aria-label={`Открыть ${alt} в полноэкранной галерее`}
        >
          <img
            src={activeImage}
            alt={alt}
            className="block h-auto max-h-[78vh] w-auto max-w-full object-contain"
          />
        </button>

        <button
          type="button"
          onClick={() => setIsFullscreen(true)}
          className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center border border-[#121212]/10 bg-white/90 text-[#121212]/55 transition-colors hover:border-[#121212]/40 hover:text-[#121212]"
          aria-label="Открыть полноэкранную галерею"
          title="Открыть на весь экран"
        >
          <Maximize2 size={17} />
        </button>
      </div>

      {imageList.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6">
          {imageList.map((image, index) => {
            const isActive = activeIndex === index;

            return (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Показать изображение ${index + 1}`}
                aria-pressed={isActive}
                className={`relative aspect-square overflow-hidden border transition-colors ${
                  isActive ? "border-[#121212]/60" : "border-[#121212]/10 hover:border-[#121212]/35"
                }`}
              >
                <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            );
          })}
        </div>
      )}

      {fullscreen}
    </>
  );
}
