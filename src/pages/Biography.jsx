import React from "react";
import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useSiteContent } from "@/hooks/useSiteContent";

const easing = [0.16, 1, 0.3, 1];

const PORTRAIT = "/assets/portrait-main.png";

const parseEntries = (value, keyName, valueName) =>
  String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [key, ...rest] = line.split("|");
      return {
        [keyName]: key.trim(),
        [valueName]: rest.join("|").trim(),
      };
    })
    .filter((entry) => entry[keyName] && entry[valueName]);

export default function Biography() {
  const { settings } = useSiteContent();
  const portrait = settings.aboutImage || PORTRAIT;
  const timeline = parseEntries(settings.biographyTimeline, "period", "text");
  const exhibitions = parseEntries(settings.biographyExhibitions, "year", "title");

  usePageMeta({
    title: "Биография — Диана Ренц",
    description: "Биография Дианы Ренц, выставки, художественная практика и мастерская в Санкт-Петербурге.",
    image: portrait,
  });

  return (
    <div className="pt-28 md:pt-36 pb-24 md:pb-40">
      {/* Header */}
      <div className="px-6 md:px-12 lg:px-20 mb-16 md:mb-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: easing }}
        >
          <div className="w-10 h-px bg-[#121212]/20 mb-6" />
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-light italic text-[#121212]">
            Биография
          </h1>
        </motion.div>
      </div>

      {/* Split layout */}
      <div className="px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
          {/* Sticky portrait */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: easing }}
            className="md:col-start-2 md:col-span-4"
          >
            <div className="md:sticky md:top-32">
              <img
                src={portrait}
                alt="Диана Ренц"
                className="w-full aspect-[3/4] object-cover"
              />
              <p className="text-xs text-[#121212]/30 mt-3">
                {settings.biographyPortraitCaption}
              </p>
            </div>
          </motion.div>

          {/* Scrollable narrative */}
          <div className="md:col-span-5 md:col-start-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: easing }}
              className="mb-16"
            >
              <p className="text-sm text-[#121212]/70 leading-[1.8] mb-6">
                {settings.biographyIntro1}
              </p>
              <p className="text-sm text-[#121212]/70 leading-[1.8]">
                {settings.biographyIntro2}
              </p>
            </motion.div>

            {/* Timeline */}
            {timeline.map((entry, i) => (
              <motion.div
                key={entry.period}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: i * 0.06, ease: easing }}
                className="mb-12"
              >
                <div className="w-6 h-px bg-[#121212]/15 mb-4" />
                <span className="text-xs tracking-widest uppercase text-[#121212]/30 block mb-3">
                  {entry.period}
                </span>
                <p className="text-sm text-[#121212]/60 leading-[1.8]">
                  {entry.text}
                </p>
              </motion.div>
            ))}

            {/* Exhibitions list */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: easing }}
              className="mt-20 pt-16 border-t border-[#121212]/5"
            >
              <h3 className="font-display text-xl italic text-[#121212] mb-8">
                Избранные выставки
              </h3>
              <ul className="space-y-4">
                {exhibitions.map((ex) => (
                  <li key={ex.year + ex.title} className="flex items-start gap-4">
                    <span className="text-xs text-[#121212]/25 pt-0.5 shrink-0">
                      {ex.year}
                    </span>
                    <span className="text-sm text-[#121212]/50">
                      {ex.title}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
