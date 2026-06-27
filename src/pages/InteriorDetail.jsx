import React from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import ImageGalleryViewer from "@/components/ImageGalleryViewer";
import PageNotFound from "@/lib/PageNotFound";
import { usePageMeta } from "@/hooks/usePageMeta";
import { formatPrice, useSiteContent } from "@/hooks/useSiteContent";
import { isWorkSold } from "@/utils/work";

const easing = [0.16, 1, 0.3, 1];

export default function InteriorDetail() {
  const { slug } = useParams();
  const { settings, interiors, works } = useSiteContent();
  const project = interiors.find((item) => item.slug === slug || item.id === slug);
  const projectImages = project?.images?.length ? project.images : project?.image ? [project.image] : [];
  const relatedWorkIds = new Set(project?.relatedWorkIds || []);
  const relatedWorks = works.filter((work) => relatedWorkIds.has(work.id) || relatedWorkIds.has(work.slug));

  usePageMeta({
    title: project
      ? project.seoTitle || `${project.title} — интерьерный проект Дианы Ренц`
      : "Интерьер не найден — Диана Ренц",
    description: project
      ? project.seoDescription ||
        `${project.title}. ${[project.type, project.location, project.year].filter(Boolean).join(", ")}. Подбор искусства и картин для интерьера.`
      : "Интерьерный проект не найден.",
    image: project?.image,
    type: "article",
    keywords: "дизайн интерьера, подбор картин в интерьер, интерьерный проект, искусство в интерьере",
    jsonLd: project
      ? {
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: project.title,
          creator: {
            "@type": "Person",
            name: settings.artistName,
          },
          about: "Interior design",
          image: project.image ? new URL(project.image, window.location.origin).toString() : undefined,
          description: project.seoDescription || project.description,
          url: `${window.location.origin}/interiors/${project.slug}`,
        }
      : null,
  });

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
          <ImageGalleryViewer
            images={projectImages}
            primaryImage={project.image}
            alt={project.title}
          />
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

      {relatedWorks.length > 0 && (
        <section className="px-6 md:px-12 lg:px-20 mt-20 md:mt-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <div className="w-10 h-px bg-[#121212]/20 mb-6" />
              <h2 className="font-display text-3xl md:text-4xl font-light italic text-[#121212]">
                Картины для пространства
              </h2>
              <p className="mt-5 text-sm text-[#121212]/50 leading-[1.8]">
                Эти картины могут поддержать палитру, масштаб и настроение интерьера.
              </p>
            </div>
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedWorks.slice(0, 3).map((work) => (
                <Link key={work.id} to={`/works/${work.slug}`} className="group block">
                  <div className="overflow-hidden bg-[#F7F7F7]">
                    <img
                      src={work.previewImage || work.image}
                      alt={work.title}
                      className="aspect-[4/5] w-full object-cover transition-transform duration-1000 group-hover:scale-[1.03]"
                      style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                      loading="lazy"
                    />
                  </div>
                  <div className="mt-4 flex items-baseline justify-between gap-4">
                    <span className="text-sm text-[#121212]">{work.title}</span>
                    <span className="text-xs text-[#121212]/30">{work.year}</span>
                  </div>
                  <p className="mt-1 text-xs text-[#121212]/40">
                    {isWorkSold(work) ? "Продано" : formatPrice(work.price)}
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
