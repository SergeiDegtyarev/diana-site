import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSiteContent } from "@/hooks/useSiteContent";

const easing = [0.16, 1, 0.3, 1];

export default function HeroSection() {
  const { settings } = useSiteContent();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={containerRef} className="relative h-screen overflow-hidden">
      {/* Background name — large, behind everything */}
      <motion.div
        style={{ y: textY, opacity }}
        className="absolute inset-0 flex items-end pb-20 md:pb-32 px-6 md:px-12 lg:px-20 pointer-events-none z-0"
      >
        <h1 className="font-display text-[15vw] md:text-[12vw] lg:text-[10vw] leading-none tracking-tight text-[#121212]/[0.04] select-none whitespace-nowrap">
          Ренц
        </h1>
      </motion.div>

      {/* Artwork — anchored right, bleeds off edge */}
      <motion.div
        style={{ y: imageY }}
        className="absolute top-0 right-0 h-full w-[70%] md:w-[55%] lg:w-[48%] z-10"
      >
        <img
          src={settings.heroImage}
          alt="Художница Диана Ренц"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/20 to-transparent w-1/3" />
      </motion.div>

      {/* Text content */}
      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-20 h-full flex flex-col justify-end pb-24 md:pb-32 px-6 md:px-12 lg:px-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: easing, delay: 0.2 }}
          className="max-w-md"
        >
          <div className="w-10 h-px bg-[#121212]/20 mb-6" />
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl italic font-light text-[#121212] leading-tight mb-4">
            {settings.heroFirstName}
            <br />
            {settings.heroLastName}
          </h2>
          <p className="text-sm text-[#121212]/50 leading-relaxed mb-8 max-w-xs">
            {settings.heroSubtitle.split("\n").map((line) => (
              <React.Fragment key={line}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </p>
          <Link
            to="/works"
            className="inline-block text-xs tracking-widest uppercase text-[#121212] border-b border-[#121212]/20 pb-1 hover:border-[#121212] transition-all duration-700"
            style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
          >
            Смотреть картины
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
