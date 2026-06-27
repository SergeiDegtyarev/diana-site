import React from "react";
import HeroSection from "@/components/home/HeroSection";
import FeaturedWorks from "@/components/home/FeaturedWorks";
import AboutTeaser from "@/components/home/AboutTeaser";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useSiteContent } from "@/hooks/useSiteContent";

export default function Home() {
  const { settings } = useSiteContent();

  usePageMeta({
    title: "Диана Ренц — современная живопись",
    description: "Официальный сайт художницы Дианы Ренц: избранные работы, цены, наличие и контакты мастерской.",
    image: settings.heroImage,
  });

  return (
    <>
      <HeroSection />
      <FeaturedWorks />
      <AboutTeaser />
    </>
  );
}
