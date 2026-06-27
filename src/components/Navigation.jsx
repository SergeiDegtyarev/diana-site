import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

const navLinks = [
  { label: "Работы", path: "/works" },
  { label: "Биография", path: "/biography" },
  { label: "Контакты", path: "/contacts" },
];

const easing = [0.16, 1, 0.3, 1];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { settings } = useSiteContent();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrolled ? "bg-white/90 backdrop-blur-md" : "bg-transparent"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <nav className="flex items-center justify-between px-6 md:px-12 lg:px-20 py-5 md:py-6">
          <Link
            to="/"
            className="font-display text-xl md:text-2xl tracking-tight text-[#121212] hover:opacity-60 transition-opacity duration-500"
            style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
          >
            {settings.artistName}
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm tracking-wide transition-opacity duration-500 ${
                  location.pathname === link.path
                    ? "text-[#121212]"
                    : "text-[#121212]/50 hover:text-[#121212]"
                }`}
                style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <button
            className="md:hidden w-11 h-11 flex items-center justify-center text-[#121212]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: easing }}
            className="fixed inset-0 z-40 bg-white flex flex-col items-center justify-center gap-8"
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: easing }}
              >
                <Link
                  to={link.path}
                  className={`font-display text-3xl tracking-tight transition-opacity duration-500 ${
                    location.pathname === link.path
                      ? "text-[#121212]"
                      : "text-[#121212]/40 hover:text-[#121212]"
                  }`}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
