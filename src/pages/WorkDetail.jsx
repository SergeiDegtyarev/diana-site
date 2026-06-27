import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import PageNotFound from "@/lib/PageNotFound";
import { usePageMeta } from "@/hooks/usePageMeta";
import { formatPrice, useSiteContent } from "@/hooks/useSiteContent";
import { getWorkCategoryLabel, getWorkStatusLabel, isWorkSold } from "@/utils/work";

const easing = [0.16, 1, 0.3, 1];

export default function WorkDetail() {
  const { slug } = useParams();
  const { settings, works, interiors } = useSiteContent();
  const work = works.find((item) => item.slug === slug || item.id === slug);
  const [activeImage, setActiveImage] = useState("");
  const workImages = work?.images?.length ? work.images : work?.image ? [work.image] : [];
  const relatedInteriors = work
    ? interiors.filter(
        (project) =>
          project.published !== false &&
          Array.isArray(project.relatedWorkIds) &&
          (project.relatedWorkIds.includes(work.id) || project.relatedWorkIds.includes(work.slug))
      )
    : [];

  usePageMeta({
    title: work ? `${work.title} — картина Дианы Ренц` : "Картина не найдена — Диана Ренц",
    description: work
      ? `${work.title}, ${work.year}. ${work.medium}, ${work.size}. ${getWorkStatusLabel(work)}. Картина для коллекции или подбора в интерьер.`
      : "Картина не найдена.",
    image: work?.image,
    type: "article",
    keywords: "картина в интерьер, современная живопись, купить картину, Диана Ренц",
    jsonLd: work
      ? {
          "@context": "https://schema.org",
          "@type": "VisualArtwork",
          name: work.title,
          creator: {
            "@type": "Person",
            name: settings.artistName,
          },
          artMedium: work.medium,
          width: work.size,
          image: work.image ? new URL(work.image, window.location.origin).toString() : undefined,
          url: `${window.location.origin}/works/${work.slug}`,
        }
      : null,
  });

  useEffect(() => {
    setActiveImage(work?.image || "");
  }, [work?.id, work?.image]);

  if (!work) {
    return <PageNotFound />;
  }

  const inquiryUrl = `/contacts?work=${encodeURIComponent(work.title)}`;
  const workCategory = settings.showWorkCategories !== false ? getWorkCategoryLabel(work) : "";

  return (
    <div className="pt-28 md:pt-36 pb-24 md:pb-40">
      <div className="px-6 md:px-12 lg:px-20 mb-12">
        <Link
          to="/works"
          className="text-xs tracking-widest uppercase text-[#121212]/35 hover:text-[#121212] transition-colors"
        >
          Картины
        </Link>
      </div>

      <div className="px-6 md:px-12 lg:px-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: easing }}
          className="lg:col-span-7"
        >
          <img
            src={activeImage || work.image}
            alt={work.title}
            className="w-full max-h-[78vh] object-contain bg-[#F7F7F7]"
          />
          {workImages.length > 1 && (
            <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 gap-3">
              {workImages.map((image, index) => {
                const isActive = (activeImage || work.image) === image;

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
                    <img
                      src={image}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
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
          className="lg:col-span-4 lg:col-start-9 lg:sticky lg:top-28 self-start"
        >
          <div className="w-10 h-px bg-[#121212]/20 mb-6" />
          <h1 className="font-display text-4xl md:text-5xl font-light italic text-[#121212] mb-5">
            {work.title}
          </h1>

          <dl className="space-y-4 mb-8">
            {[
              ["Год", work.year],
              workCategory ? ["Категория", workCategory] : null,
              ["Материал", work.medium],
              ["Размер", work.size],
              ["Статус", getWorkStatusLabel(work)],
              ["Цена", isWorkSold(work) ? "Продано" : formatPrice(work.price)],
            ].filter(Boolean).map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-6 border-b border-[#121212]/5 pb-3">
                <dt className="text-xs uppercase tracking-widest text-[#121212]/30">{label}</dt>
                <dd className="text-sm text-[#121212]/65 text-right">{value}</dd>
              </div>
            ))}
          </dl>

          {work.description && (
            <p className="text-sm text-[#121212]/60 leading-[1.8] mb-8">
              {work.description}
            </p>
          )}

          <div className="flex flex-col sm:flex-row lg:flex-col gap-4">
            <Link
              to={inquiryUrl}
              className="inline-flex items-center justify-center min-h-11 px-5 bg-[#121212] text-white text-xs tracking-widest uppercase hover:bg-[#121212]/80 transition-colors"
            >
              Запросить картину
            </Link>
            <a
              href={`mailto:${settings.contactEmail}?subject=${encodeURIComponent(`Запрос по картине "${work.title}"`)}&body=${encodeURIComponent(`Здравствуйте, интересует картина "${work.title}".`)}`}
              className="inline-flex items-center justify-center min-h-11 px-5 border border-[#121212]/15 text-xs tracking-widest uppercase text-[#121212] hover:border-[#121212]/50 transition-colors"
            >
              Написать напрямую
            </a>
          </div>
        </motion.aside>
      </div>

      {relatedInteriors.length > 0 && (
        <section className="px-6 md:px-12 lg:px-20 mt-20 md:mt-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 border-t border-[#121212]/10 pt-12 md:pt-16">
            <div className="lg:col-span-4">
              <div className="w-10 h-px bg-[#121212]/20 mb-6" />
              <h2 className="font-display text-3xl md:text-4xl font-light italic text-[#121212]">
                Картина в интерьере
              </h2>
              <p className="mt-5 text-sm text-[#121212]/50 leading-[1.8]">
                Эту работу можно рассматривать как часть интерьерной композиции: по цвету, масштабу и настроению пространства.
              </p>
            </div>
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-5">
              {relatedInteriors.slice(0, 2).map((project) => (
                <Link key={project.id} to={`/interiors/${project.slug}`} className="group block">
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
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
