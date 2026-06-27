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

const setCanonical = (value) => {
  if (!value) return;

  let element = document.head.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }
  element.setAttribute("href", value);
};

const setJsonLd = (jsonLd) => {
  const id = "page-json-ld";
  let element = document.head.querySelector(`#${id}`);

  if (!jsonLd) {
    element?.remove();
    return;
  }

  if (!element) {
    element = document.createElement("script");
    element.setAttribute("id", id);
    element.setAttribute("type", "application/ld+json");
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(jsonLd);
};

export function usePageMeta({ title, description, image, type = "website", keywords, jsonLd }) {
  useEffect(() => {
    const resolvedTitle = title || "Диана Ренц";
    const resolvedDescription = description || "Современная живопись, Санкт-Петербург";
    const absoluteImage = image ? new URL(image, window.location.origin).toString() : "";
    const canonicalUrl = window.location.origin + window.location.pathname;

    document.title = resolvedTitle;
    setCanonical(canonicalUrl);
    setMeta('meta[name="description"]', "content", resolvedDescription);
    setMeta('meta[name="keywords"]', "content", keywords);
    setMeta('meta[property="og:title"]', "content", resolvedTitle);
    setMeta('meta[property="og:description"]', "content", resolvedDescription);
    setMeta('meta[property="og:type"]', "content", type);
    setMeta('meta[property="og:url"]', "content", canonicalUrl);
    setMeta('meta[property="og:image"]', "content", absoluteImage);
    setJsonLd(jsonLd);

    return () => {
      setJsonLd(null);
    };
  }, [description, image, jsonLd, keywords, title, type]);
}
