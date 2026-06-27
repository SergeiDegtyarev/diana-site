import { useCallback, useEffect, useState } from "react";
import { DEFAULT_SITE_CONTENT } from "@/data/siteContent";
import { getWorkStatus, normalizeWorkCategory, slugify, sortWorks } from "@/utils/work";

const CONTENT_CHANGED_EVENT = "diana-site-content-changed";

const uniqueImages = (images) =>
  [...new Set((images || []).map((image) => String(image || "").trim()).filter(Boolean))];

const normalizeWork = (work, index) => {
  const defaultWork = DEFAULT_SITE_CONTENT.works[index] || {};
  const title = work?.title || defaultWork.title || "Новая картина";
  const status = getWorkStatus(work);
  const images = uniqueImages([
    work?.image || defaultWork.image,
    ...(Array.isArray(work?.images) ? work.images : []),
    ...(Array.isArray(defaultWork.images) ? defaultWork.images : []),
  ]);

  return {
    ...defaultWork,
    ...work,
    id: work?.id || defaultWork.id || `work-${Date.now().toString(36)}-${index}`,
    slug: work?.slug || defaultWork.slug || slugify(title),
    title,
    images,
    previewImage: work?.previewImage || work?.image || defaultWork.previewImage || defaultWork.image,
    order: Number.isFinite(Number(work?.order)) ? Number(work.order) : (index + 1) * 10,
    category: Object.prototype.hasOwnProperty.call(work || {}, "category")
      ? normalizeWorkCategory(work.category)
      : normalizeWorkCategory(defaultWork.category),
    status,
    sold: status === "sold",
    featured: Boolean(work?.featured ?? defaultWork.featured),
    price: Number(work?.price ?? defaultWork.price) || 0,
  };
};

const sortByOrder = (items) =>
  [...items].sort((a, b) => {
    const orderA = Number.isFinite(Number(a?.order)) ? Number(a.order) : 0;
    const orderB = Number.isFinite(Number(b?.order)) ? Number(b.order) : 0;
    if (orderA !== orderB) return orderA - orderB;
    return String(a?.title || "").localeCompare(String(b?.title || ""), "ru");
  });

const normalizeInterior = (project, index) => {
  const defaultProject = DEFAULT_SITE_CONTENT.interiors?.[index] || {};
  const title = project?.title || defaultProject.title || "Новый интерьер";
  const images = uniqueImages([
    project?.image || defaultProject.image,
    ...(Array.isArray(project?.images) ? project.images : []),
    ...(Array.isArray(defaultProject.images) ? defaultProject.images : []),
  ]);

  return {
    ...defaultProject,
    ...project,
    id: project?.id || defaultProject.id || `interior-${Date.now().toString(36)}-${index}`,
    slug: project?.slug || defaultProject.slug || slugify(title),
    title,
    type: project?.type ?? defaultProject.type ?? "",
    location: project?.location ?? defaultProject.location ?? "",
    year: project?.year ?? defaultProject.year ?? "",
    status: project?.status ?? defaultProject.status ?? "",
    image: project?.image || defaultProject.image || images[0] || "",
    previewImage: project?.previewImage || project?.image || defaultProject.previewImage || defaultProject.image,
    images,
    order: Number.isFinite(Number(project?.order)) ? Number(project.order) : (index + 1) * 10,
    featured: Boolean(project?.featured ?? defaultProject.featured),
    published: project?.published !== false,
    description: project?.description ?? defaultProject.description ?? "",
  };
};

const mergeContent = (content) => {
  const worksSource = Array.isArray(content?.works) ? content.works : DEFAULT_SITE_CONTENT.works;
  const interiorsSource = Array.isArray(content?.interiors)
    ? content.interiors
    : DEFAULT_SITE_CONTENT.interiors || [];

  return {
    settings: {
      ...DEFAULT_SITE_CONTENT.settings,
      ...(content?.settings || {}),
    },
    works: sortWorks(worksSource.map(normalizeWork)),
    interiors: sortByOrder(interiorsSource.map(normalizeInterior)),
  };
};

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Ошибка запроса");
  }

  return response.json();
};

export const formatPrice = (price) => {
  const numericPrice = Number(price);
  if (!numericPrice) {
    return "Цена по запросу";
  }

  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(numericPrice);
};

export function useSiteContent() {
  const [content, setContent] = useState(DEFAULT_SITE_CONTENT);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [contentError, setContentError] = useState(null);

  const loadContent = useCallback(async () => {
    try {
      setContentError(null);
      const loadedContent = mergeContent(await requestJson("/api/content"));
      setContent(loadedContent);
      return loadedContent;
    } catch (error) {
      setContentError(error.message);
      return DEFAULT_SITE_CONTENT;
    } finally {
      setIsLoadingContent(false);
    }
  }, []);

  useEffect(() => {
    loadContent();

    const syncContent = (event) => {
      if (event.detail) {
        setContent(mergeContent(event.detail));
      } else {
        loadContent();
      }
    };

    window.addEventListener(CONTENT_CHANGED_EVENT, syncContent);
    return () => window.removeEventListener(CONTENT_CHANGED_EVENT, syncContent);
  }, [loadContent]);

  const saveContent = useCallback(async (nextContent) => {
    const merged = mergeContent(nextContent);
    const savedContent = mergeContent(
      await requestJson("/api/content", {
        method: "PUT",
        body: JSON.stringify(merged),
      })
    );
    setContent(savedContent);
    window.dispatchEvent(new CustomEvent(CONTENT_CHANGED_EVENT, { detail: savedContent }));
    return savedContent;
  }, []);

  const updateSettings = useCallback(
    (settings) =>
      saveContent({
        ...content,
        settings: {
          ...content.settings,
          ...settings,
        },
      }),
    [content, saveContent]
  );

  const saveWork = useCallback(
    (work) => {
      const normalizedWork = {
        ...work,
        price: Number(work.price) || 0,
        status: work.status || (work.sold ? "sold" : "available"),
        sold: (work.status || (work.sold ? "sold" : "available")) === "sold",
        featured: Boolean(work.featured),
        order: Number(work.order) || 0,
        category: normalizeWorkCategory(work.category),
        slug: work.slug || slugify(work.title),
        previewImage: work.previewImage || work.image,
        images: uniqueImages([work.image, ...(Array.isArray(work.images) ? work.images : [])]),
      };
      const exists = content.works.some((item) => item.id === normalizedWork.id);
      const works = exists
        ? content.works.map((item) => (item.id === normalizedWork.id ? normalizedWork : item))
        : [...content.works, normalizedWork];

      return saveContent({ ...content, works: sortWorks(works) });
    },
    [content, saveContent]
  );

  const saveInterior = useCallback(
    (project) => {
      const normalizedProject = {
        ...project,
        slug: project.slug || slugify(project.title),
        previewImage: project.previewImage || project.image,
        images: uniqueImages([project.image, ...(Array.isArray(project.images) ? project.images : [])]),
        order: Number(project.order) || 0,
        featured: Boolean(project.featured),
        published: project.published !== false,
      };
      const exists = content.interiors.some((item) => item.id === normalizedProject.id);
      const interiors = exists
        ? content.interiors.map((item) => (item.id === normalizedProject.id ? normalizedProject : item))
        : [...content.interiors, normalizedProject];

      return saveContent({ ...content, interiors: sortByOrder(interiors) });
    },
    [content, saveContent]
  );

  const deleteInterior = useCallback(
    (id) =>
      saveContent({
        ...content,
        interiors: content.interiors.filter((project) => project.id !== id),
      }),
    [content, saveContent]
  );

  const deleteWork = useCallback(
    (id) =>
      saveContent({
        ...content,
        works: content.works.filter((work) => work.id !== id),
      }),
    [content, saveContent]
  );

  const resetContent = useCallback(() => saveContent(DEFAULT_SITE_CONTENT), [saveContent]);

  return {
    content,
    settings: content.settings,
    works: content.works,
    interiors: content.interiors,
    isLoadingContent,
    contentError,
    loadContent,
    updateSettings,
    saveWork,
    deleteWork,
    saveInterior,
    deleteInterior,
    resetContent,
  };
}
