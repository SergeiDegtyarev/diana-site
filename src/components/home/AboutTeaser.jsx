import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useSiteContent } from "@/hooks/useSiteContent";

const easing = [0.16, 1, 0.3, 1];

export default function AboutTeaser() {
  const { settings } = useSiteContent();

  return (
    <section className="px-6 md:px-12 lg:px-20 py-24 md:py-40 bg-[#F7F7F7]">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: easing }}
          className="md:col-start-2 md:col-span-4"
        >
          <img
            src={settings.aboutImage}
            alt={settings.artistName}
            className="w-full aspect-[3/4] object-cover"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, delay: 0.15, ease: easing }}
          className="md:col-span-5 md:col-start-7"
        >
          <div className="w-10 h-px bg-[#121212]/20 mb-6" />
          <h2 className="font-display text-2xl md:text-3xl font-light italic text-[#121212] mb-6">
            {settings.aboutTitle}
          </h2>
          <p className="text-sm text-[#121212]/60 leading-[1.8] mb-4">
            {settings.aboutParagraph1}
          </p>
          <p className="text-sm text-[#121212]/60 leading-[1.8] mb-8">
            {settings.aboutParagraph2}
          </p>
          <div className="flex items-center gap-8">
            <Link
              to="/biography"
              className="text-xs tracking-widest uppercase text-[#121212] border-b border-[#121212]/20 pb-1 hover:border-[#121212] transition-all duration-700"
              style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
            >
              Биография
            </Link>
            <Link
              to="/contacts"
              className="text-xs tracking-widest uppercase text-[#121212]/50 border-b border-[#121212]/10 pb-1 hover:text-[#121212] hover:border-[#121212]/30 transition-all duration-700"
              style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
            >
              Связаться
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
