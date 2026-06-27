import React from "react";
import { Link } from "react-router-dom";
import { useSiteContent } from "@/hooks/useSiteContent";

export default function Footer() {
  const { settings } = useSiteContent();

  return (
    <footer className="border-t border-[#121212]/5 mt-auto">
      <div className="px-6 md:px-12 lg:px-20 py-10 md:py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <span className="font-display text-lg text-[#121212]">{settings.artistName}</span>
          <span className="text-xs text-[#121212]/35">
            © {new Date().getFullYear()} Все права защищены
          </span>
        </div>

        <div className="flex items-center gap-8">
          <Link
            to="/works"
            className="text-xs text-[#121212]/40 hover:text-[#121212] transition-opacity duration-500"
          >
            Работы
          </Link>
          <Link
            to="/biography"
            className="text-xs text-[#121212]/40 hover:text-[#121212] transition-opacity duration-500"
          >
            Биография
          </Link>
          <Link
            to="/contacts"
            className="text-xs text-[#121212]/40 hover:text-[#121212] transition-opacity duration-500"
          >
            Контакты
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <a
            href={settings.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#121212]/40 hover:text-[#121212] transition-opacity duration-500"
          >
            Instagram
          </a>
          <a
            href={settings.behanceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#121212]/40 hover:text-[#121212] transition-opacity duration-500"
          >
            Behance
          </a>
        </div>
      </div>
    </footer>
  );
}
