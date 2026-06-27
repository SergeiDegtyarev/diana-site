import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useSiteContent } from "@/hooks/useSiteContent";

const easing = [0.16, 1, 0.3, 1];

const splitLines = (value) =>
  String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

export default function Interiors() {
  const { settings, interiors } = useSiteContent();
  const publishedProjects = interiors.filter((project) => project.published !== false);
  const featuredProject = publishedProjects.find((project) => project.featured) || publishedProjects[0];
  const services = splitLines(settings.interiorsServices);

  usePageMeta({
    title: "Интерьеры — Диана Ренц",
    description:
      "Интерьерные проекты Дианы Ренц: авторские концепции, подбор искусства, света, фактур и предметов для частных пространств.",
    image: featuredProject?.previewImage || featuredProject?.image,
  });

  return (
    <div className="pt-28 md:pt-36 pb-24 md:pb-40">
      <div className="px-6 md:px-12 lg:px-20 mb-12 md:mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: easing }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-end"
        >
          <div className="lg:col-span-6">
            <div className="w-10 h-px bg-[#121212]/20 mb-6" />
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-light italic text-[#121212]">
              {settings.interiorsTitle || "Интерьеры"}
            </h1>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="text-sm md:text-base text-[#121212]/55 leading-[1.9]">
              {settings.interiorsSubtitle}
            </p>
          </div>
        </motion.div>
      </div>

      <div className="px-6 md:px-12 lg:px-20 mb-16 md:mb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 border-y border-[#121212]/10 py-12 md:py-16">
          <div className="lg:col-span-5">
            <p className="font-display text-2xl md:text-3xl italic text-[#121212] leading-[1.35]">
              {settings.interiorsIntro}
            </p>
          </div>
          <div className="lg:col-span-4 lg:col-start-8 space-y-5">
            {services.map((service, index) => (
              <div key={service} className="flex items-baseline gap-5 border-b border-[#121212]/5 pb-4">
                <span className="text-[10px] text-[#121212]/25">{String(index + 1).padStart(2, "0")}</span>
                <span className="text-sm text-[#121212]/65">{service}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
          {publishedProjects.map((project, index) => (
            <motion.article
              key={project.id}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.9, delay: index * 0.08, ease: easing }}
              className={index % 3 === 0 ? "md:col-span-7" : "md:col-span-5"}
            >
              <Link to={`/interiors/${project.slug}`} className="group block">
                <div className="overflow-hidden bg-[#F7F7F7]">
                  <img
                    src={project.previewImage || project.image}
                    alt={project.title}
                    className="aspect-[4/3] w-full object-cover transition-transform duration-1000 group-hover:scale-[1.03]"
                    style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                    loading="lazy"
                  />
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <span className="text-sm text-[#121212]">{project.title}</span>
                  <span className="text-xs text-[#121212]/30">{project.year}</span>
                </div>
                <p className="mt-1 text-xs text-[#121212]/35">
                  {[project.type, project.location, project.status].filter(Boolean).join(" · ")}
                </p>
              </Link>
            </motion.article>
          ))}
        </div>

        {publishedProjects.length === 0 && (
          <div className="border border-[#121212]/10 px-5 py-12">
            <p className="font-display text-xl italic text-[#121212] mb-3">
              Проекты скоро появятся
            </p>
            <p className="text-sm text-[#121212]/45">
              Раздел уже готов к наполнению через админку.
            </p>
          </div>
        )}

        {settings.interiorsArtNote && (
          <div className="mt-16 md:mt-24 max-w-2xl">
            <div className="w-10 h-px bg-[#121212]/20 mb-6" />
            <p className="text-sm md:text-base text-[#121212]/55 leading-[1.9]">
              {settings.interiorsArtNote}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
