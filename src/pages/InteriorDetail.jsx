import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import PageNotFound from "@/lib/PageNotFound";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useSiteContent } from "@/hooks/useSiteContent";

const easing = [0.16, 1, 0.3, 1];

export default function InteriorDetail() {
  const { slug } = useParams();
  const { settings, interiors } = useSiteContent();
  const project = interiors.find((item) => item.slug === slug || item.id === slug);
  const [activeImage, setActiveImage] = useState("");
  const projectImages = project?.images?.length ? project.images : project?.image ? [project.image] : [];

  usePageMeta({
    title: project ? `${project.title} — Интерьеры Дианы Ренц` : "Интерьер не найден — Диана Ренц",
    description: project
      ? `${project.title}. ${[project.type, project.location, project.year].filter(Boolean).join(", ")}.`
      : "Интерьерный проект не найден.",
    image: project?.image,
    type: "article",
  });

  useEffect(() => {
    setActiveImage(project?.image || "");
  }, [project?.id, project?.image]);

  if (!project || project.published === false) {
    return <PageNotFound />;
  }

  const inquiryUrl = `/contacts?project=${encodeURIComponent(project.title)}`;
  const mailSubject = `Интерьерный проект "${project.title}"`;
  const mailBody = `Здравствуйте, хочу обсудить интерьерный проект "${project.title}".`;

  return (
    <div className="pt-28 md:pt-36 pb-24 md:pb-40">
      <div className="px-6 md:px-12 lg:px-20 mb-12">
        <Link
          to="/interiors"
          className="text-xs tracking-widest uppercase text-[#121212]/35 hover:text-[#121212] transition-colors"
        >
          Интерьеры
        </Link>
      </div>

      <div className="px-6 md:px-12 lg:px-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: easing }}
          className="lg:col-span-8"
        >
          <img
            src={activeImage || project.image}
            alt={project.title}
            className="w-full max-h-[78vh] object-contain bg-[#F7F7F7]"
          />
          {projectImages.length > 1 && (
            <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 gap-3">
              {projectImages.map((image, index) => {
                const isActive = (activeImage || project.image) === image;

                return (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(image)}
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
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: easing }}
          className="lg:col-span-4 lg:sticky lg:top-28 self-start"
        >
          <div className="w-10 h-px bg-[#121212]/20 mb-6" />
          <h1 className="font-display text-4xl md:text-5xl font-light italic text-[#121212] mb-5">
            {project.title}
          </h1>

          <dl className="space-y-4 mb-8">
            {[
              ["Тип", project.type],
              ["Локация", project.location],
              ["Год", project.year],
              ["Статус", project.status],
            ]
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-between gap-6 border-b border-[#121212]/5 pb-3">
                  <dt className="text-xs uppercase tracking-widest text-[#121212]/30">{label}</dt>
                  <dd className="text-sm text-[#121212]/65 text-right">{value}</dd>
                </div>
              ))}
          </dl>

          {project.description && (
            <p className="text-sm text-[#121212]/60 leading-[1.8] mb-8">
              {project.description}
            </p>
          )}

          <div className="flex flex-col sm:flex-row lg:flex-col gap-4">
            <Link
              to={inquiryUrl}
              className="inline-flex items-center justify-center min-h-11 px-5 bg-[#121212] text-white text-xs tracking-widest uppercase hover:bg-[#121212]/80 transition-colors"
            >
              Обсудить проект
            </Link>
            <a
              href={`mailto:${settings.contactEmail}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`}
              className="inline-flex items-center justify-center min-h-11 px-5 border border-[#121212]/15 text-xs tracking-widest uppercase text-[#121212] hover:border-[#121212]/50 transition-colors"
            >
              Написать напрямую
            </a>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
