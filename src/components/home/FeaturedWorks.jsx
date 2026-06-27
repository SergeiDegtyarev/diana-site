import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { formatPrice, useSiteContent } from "@/hooks/useSiteContent";
import { getWorkStatusLabel, isWorkSold } from "@/utils/work";

const easing = [0.16, 1, 0.3, 1];

export default function FeaturedWorks() {
  const [hoveredId, setHoveredId] = useState(null);
  const { works } = useSiteContent();
  const featuredWorks = works.filter((work) => work.featured);

  return (
    <section className="px-6 md:px-12 lg:px-20 py-24 md:py-40">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: easing }}
        className="mb-16 md:mb-24"
      >
        <div className="w-10 h-px bg-[#121212]/20 mb-6" />
        <h2 className="font-display text-2xl md:text-3xl font-light italic text-[#121212]">
          Избранные работы
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
        {featuredWorks.map((work, i) => (
          <motion.div
            key={work.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.9, delay: i * 0.12, ease: easing }}
            className={`${i === 0 ? "md:col-span-7" : "md:col-span-5"}`}
            onMouseEnter={() => setHoveredId(work.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <Link to={`/works/${work.slug}`} className="group block">
              <div className="relative overflow-hidden mb-4">
                <motion.img
                  src={work.previewImage || work.image}
                  alt={work.title}
                  className="w-full aspect-[4/3] object-cover"
                  animate={{
                    scale: hoveredId === work.id ? 1.03 : 1,
                    opacity: hoveredId && hoveredId !== work.id ? 0.25 : 1,
                  }}
                  transition={{ duration: 0.8, ease: easing }}
                />
                {isWorkSold(work) && (
                  <span className="absolute top-4 left-4 bg-white/90 px-3 py-1 text-[10px] tracking-widest uppercase text-[#121212]/70">
                    Продано
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-sm text-[#121212]">{work.title}</span>
                <span className="text-xs text-[#121212]/30">{work.year}</span>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-xs text-[#121212]/30">{work.medium}</span>
                <span className="text-xs text-[#121212]/45">
                  {isWorkSold(work) ? "Продано" : formatPrice(work.price)}
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-[#121212]/30">
                {getWorkStatusLabel(work)}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.5, ease: easing }}
        className="mt-16 md:mt-24 text-center"
      >
        <Link
          to="/works"
          className="inline-block text-xs tracking-widest uppercase text-[#121212]/50 border-b border-[#121212]/10 pb-1 hover:text-[#121212] hover:border-[#121212]/30 transition-all duration-700"
          style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          Все работы
        </Link>
      </motion.div>
    </section>
  );
}
