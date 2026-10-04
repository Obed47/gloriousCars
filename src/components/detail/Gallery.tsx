"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import type { VehicleImage } from "@/lib/types";

export function Gallery({
  images,
  title,
}: {
  images: VehicleImage[];
  title: string;
}) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const pointerStart = useRef<number | null>(null);

  const count = images.length;
  const go = useCallback(
    (dir: number) => {
      setDirection(dir);
      setIndex((i) => (i + dir + count) % count);
    },
    [count],
  );
  const jump = (i: number) => {
    setDirection(i > index ? 1 : -1);
    setIndex(i);
  };

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox, go]);

  function onPointerDown(e: React.PointerEvent) {
    pointerStart.current = e.clientX;
  }
  function onPointerUp(e: React.PointerEvent) {
    if (pointerStart.current == null) return;
    const dx = e.clientX - pointerStart.current;
    if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
    pointerStart.current = null;
  }

  const current = images[index];
  if (!current) return null;

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div
        className="group relative aspect-4/3 overflow-hidden rounded-2xl bg-graphite sm:aspect-16/10"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden opacity-0"
          aria-hidden
        >
          {images.map((img) => (
            <Image
              key={`preload-${img.url}`}
              src={img.url}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              loading="eager"
              className="object-cover"
            />
          ))}
        </div>
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={index}
            className="absolute inset-0"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src={current.url}
              alt={`${title} — ${current.angle}`}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
              {...(index === 0 ? { preload: true } : {})}
            />
          </motion.div>
        </AnimatePresence>

        <span className="absolute left-3 top-3 rounded-md bg-ink/70 px-2 py-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-white backdrop-blur">
          {current.angle}
        </span>

        <button
          type="button"
          onClick={() => setLightbox(true)}
          aria-label="Open full-screen gallery"
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-lg bg-ink/70 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Expand className="size-4" aria-hidden />
        </button>

        {count > 1 && (
          <>
            <GalleryArrow side="left" onClick={() => go(-1)} />
            <GalleryArrow side="right" onClick={() => go(1)} />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-ink/70 px-2.5 py-1 text-[0.6875rem] font-medium text-white backdrop-blur">
              {index + 1} / {count}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {count > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              onClick={() => jump(i)}
              aria-label={`View ${img.angle}`}
              aria-current={i === index}
              className={`relative aspect-4/3 w-24 shrink-0 overflow-hidden rounded-lg transition-all ${
                i === index
                  ? "ring-2 ring-accent ring-offset-2 ring-offset-mist"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img.url}
                alt=""
                fill
                sizes="96px"
                loading="eager"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-80 flex flex-col bg-ink/95"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${title} gallery`}
          >
            <div className="flex items-center justify-between px-5 py-4 text-white">
              <span className="text-sm font-medium">
                {index + 1} / {count} · {current.angle}
              </span>
              <button
                type="button"
                onClick={() => setLightbox(false)}
                aria-label="Close gallery"
                className="flex size-10 items-center justify-center rounded-lg hover:bg-white/10"
              >
                <X className="size-6" aria-hidden />
              </button>
            </div>

            <div
              className="relative flex-1"
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
            >
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={index}
                  className="absolute inset-0 p-4"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Image
                    src={current.url}
                    alt={`${title} — ${current.angle}`}
                    fill
                    sizes="100vw"
                    className="object-contain"
                  />
                </motion.div>
              </AnimatePresence>

              {count > 1 && (
                <>
                  <GalleryArrow side="left" onClick={() => go(-1)} light />
                  <GalleryArrow side="right" onClick={() => go(1)} light />
                </>
              )}
            </div>

            {count > 1 && (
              <div className="no-scrollbar flex justify-center gap-2 overflow-x-auto p-4">
                {images.map((img, i) => (
                  <button
                    key={img.url + i}
                    type="button"
                    onClick={() => jump(i)}
                    aria-label={`View ${img.angle}`}
                    className={`relative aspect-4/3 w-16 shrink-0 overflow-hidden rounded-md transition-opacity ${
                      i === index
                        ? "ring-2 ring-white"
                        : "opacity-50 hover:opacity-90"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt=""
                      fill
                      sizes="64px"
                      loading="eager"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GalleryArrow({
  side,
  onClick,
  light = false,
}: {
  side: "left" | "right";
  onClick: () => void;
  light?: boolean;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous image" : "Next image"}
      className={`absolute top-1/2 -translate-y-1/2 ${
        side === "left" ? "left-3" : "right-3"
      } flex size-10 items-center justify-center rounded-full backdrop-blur transition-colors ${
        light
          ? "bg-white/10 text-white hover:bg-white/20"
          : "bg-ink/60 text-white opacity-0 hover:bg-ink/80 group-hover:opacity-100"
      }`}
    >
      <Icon className="size-5" aria-hidden />
    </button>
  );
}
