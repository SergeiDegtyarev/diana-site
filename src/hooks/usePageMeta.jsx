import { useEffect } from "react";

const setMeta = (selector, attribute, value) => {
  if (!value) return;

  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    if (selector.includes("property=")) {
      element.setAttribute("property", selector.match(/property="([^"]+)"/)?.[1] || "");
    } else {
      element.setAttribute("name", selector.match(/name="([^"]+)"/)?.[1] || "");
    }
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
};

export function usePageMeta({ title, description, image, type = "website" }) {
  useEffect(() => {
    const resolvedTitle = title || "Диана Ренц";
    const resolvedDescription = description || "Современная живопись, Санкт-Петербург";
    const absoluteImage = image ? new URL(image, window.location.origin).toString() : "";

    document.title = resolvedTitle;
    setMeta('meta[name="description"]', "content", resolvedDescription);
    setMeta('meta[property="og:title"]', "content", resolvedTitle);
    setMeta('meta[property="og:description"]', "content", resolvedDescription);
    setMeta('meta[property="og:type"]', "content", type);
    setMeta('meta[property="og:url"]', "content", window.location.href);
    setMeta('meta[property="og:image"]', "content", absoluteImage);
  }, [description, image, title, type]);
}
