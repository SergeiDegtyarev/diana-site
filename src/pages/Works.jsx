import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { formatPrice, useSiteContent } from "@/hooks/useSiteContent";
import { getWorkCategory, getWorkStatusLabel, isWorkSold } from "@/utils/work";

const easing = [0.16, 1, 0.3, 1];

export default function Works() {
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { settings, works } = useSiteContent();
  const showCategories = settings.showWorkCategories !== false;
  const categoryTabs = useMemo(
    () => {
      const categories = new Map();

      works.forEach((work) => {
        const category = getWorkCategory(work);
        if (!category) return;
        categories.set(category, (categories.get(category) || 0) + 1);
      });

      return [
        { value: "all", label: "Все", count: works.length },
        ...[...categories.entries()].map(([category, count]) => ({
          value: category,
          label: category,
          count,
        })),
      ];
    },
    [works]
  );
  const filteredWorks = useMemo(
    () =>
      !showCategories || selectedCategory === "all"
        ? works
        : works.filter((work) => getWorkCategory(work) === selectedCategory),
    [selectedCategory, showCategories, works]
  );

  useEffect(() => {
    if (
      (!showCategories && selectedCategory !== "all") ||
      (selectedCategory !== "all" && !categoryTabs.some((category) => category.value === selectedCategory))
    ) {
      setSelectedCategory("all");
    }
  }, [categoryTabs, selectedCategory, showCategories]);

  usePageMeta({
    title: "Работы — Диана Ренц",
    description: "Галерея работ Дианы Ренц: живопись, цены, наличие и проданные работы.",
    image: works[0]?.previewImage || works[0]?.image,
  });

  return (
    <div className="pt-28 md:pt-36 pb-24 md:pb-40">
      <div className="px-6 md:px-12 lg:px-20 mb-16 md:mb-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: easing }}
        >
          <div className="w-10 h-px bg-[#121212]/20 mb-6" />
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-light italic text-[#121212]">
            Работы
          </h1>
        </motion.div>
      </div>

      <div className="px-6 md:px-12 lg:px-20">
        {showCategories && categoryTabs.length > 1 && (
          <div className="mb-12 md:mb-16 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-[#121212]/10 pb-4">
            {categoryTabs.map((category) => {
              const isActive = selectedCategory === category.value;

              return (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(category.value);
                    setHoveredId(null);
                  }}
                  aria-pressed={isActive}
                  className={`group inline-flex items-baseline gap-2 border-b pb-1 text-xs uppercase tracking-widest transition-colors duration-500 ${
                    isActive
                      ? "border-[#121212] text-[#121212]"
                      : "border-transparent text-[#121212]/35 hover:text-[#121212]"
                  }`}
                >
                  <span>{category.label}</span>
                  <span className="text-[10px] text-[#121212]/25">{category.count}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          {filteredWorks.map((work, i) => (
            <motion.article
              key={work.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.9, delay: i * 0.08, ease: easing }}
              className={`${work.cols}`}
              onMouseEnter={() => setHoveredId(work.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <Link to={`/works/${work.slug}`} className="block group">
                <div className="relative overflow-hidden mb-3">
                  <motion.img
                    src={work.previewImage || work.image}
                    alt={work.title}
                    className={`w-full ${work.aspect} object-cover`}
                    animate={{
                      scale: hoveredId === work.id ? 1.03 : 1,
                      opacity: hoveredId && hoveredId !== work.id ? 0.2 : 1,
                    }}
                    transition={{ duration: 0.8, ease: easing }}
                    loading="lazy"
                  />
                  {isWorkSold(work) && (
                    <span className="absolute top-4 left-4 bg-white/90 px-3 py-1 text-[10px] tracking-widest uppercase text-[#121212]/70">
                      Продано
                    </span>
                  )}
                </div>
                <motion.div
                  animate={{ opacity: hoveredId && hoveredId !== work.id ? 0.2 : 1 }}
                  transition={{ duration: 0.6, ease: easing }}
                  className="flex items-baseline justify-between gap-4"
                >
                  <span className="text-sm text-[#121212]">{work.title}</span>
                  <span className="text-xs text-[#121212]/30">{work.year}</span>
                </motion.div>
                <motion.div
                  animate={{ opacity: hoveredId && hoveredId !== work.id ? 0.2 : 1 }}
                  transition={{ duration: 0.6, ease: easing }}
                >
                  <span className="text-xs text-[#121212]/30">
                    {work.medium}, {work.size}
                  </span>
                </motion.div>
                <motion.div
                  animate={{ opacity: hoveredId && hoveredId !== work.id ? 0.2 : 1 }}
                  transition={{ duration: 0.6, ease: easing }}
                  className="mt-1 flex items-center justify-between gap-4"
                >
                  <span className="text-xs text-[#121212]/45">
                    {isWorkSold(work) ? "Продано" : formatPrice(work.price)}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-[#121212]/30">
                    {getWorkStatusLabel(work)}
                  </span>
                </motion.div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}
