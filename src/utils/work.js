export const workStatusOptions = [
  { value: "available", label: "В наличии" },
  { value: "reserved", label: "Зарезервировано" },
  { value: "sold", label: "Продано" },
];

const legacyWorkCategoryLabels = {
  landscape: "Пейзажи",
  figurative: "Фигуратив",
  "still-life": "Натюрморты",
  architecture: "Архитектура",
  other: "Другое",
};

export const getWorkStatus = (work) => {
  if (work?.status) return work.status;
  return work?.sold ? "sold" : "available";
};

export const getWorkStatusLabel = (work) =>
  workStatusOptions.find((option) => option.value === getWorkStatus(work))?.label || "В наличии";

export const normalizeWorkCategory = (category) => {
  const value = String(category || "").trim();
  return legacyWorkCategoryLabels[value] || value;
};

export const getWorkCategory = (work) => normalizeWorkCategory(work?.category);

export const getWorkCategoryLabel = (work) => getWorkCategory(work);

export const isWorkSold = (work) => getWorkStatus(work) === "sold";

export const slugify = (value) => {
  const slug = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, "-")
    .replace(/^-|-$/g, "");

  return slug || Date.now().toString(36);
};

export const sortWorks = (works) =>
  [...works].sort((a, b) => {
    const orderA = Number.isFinite(Number(a.order)) ? Number(a.order) : 0;
    const orderB = Number.isFinite(Number(b.order)) ? Number(b.order) : 0;
    if (orderA !== orderB) return orderA - orderB;
    return String(a.title || "").localeCompare(String(b.title || ""), "ru");
  });
