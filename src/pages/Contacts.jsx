import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useSiteContent } from "@/hooks/useSiteContent";

const easing = [0.16, 1, 0.3, 1];

export default function Contacts() {
  const [searchParams] = useSearchParams();
  const requestedWork = searchParams.get("work");
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: requestedWork ? `Здравствуйте, интересует работа "${requestedWork}".` : "",
  });
  const { settings } = useSiteContent();

  useEffect(() => {
    if (!requestedWork) return;
    setForm((currentForm) => {
      if (currentForm.message) return currentForm;
      return {
        ...currentForm,
        message: `Здравствуйте, интересует работа "${requestedWork}".`,
      };
    });
  }, [requestedWork]);

  usePageMeta({
    title: "Контакты — Диана Ренц",
    description: "Связаться с художницей Дианой Ренц по вопросам работ, выставок и визита в мастерскую.",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    const subject = requestedWork ? `Запрос по работе "${requestedWork}"` : `Запрос от ${form.name}`;
    const body = `Имя: ${form.name}\nEmail: ${form.email}\n\n${form.message}`;
    const mailtoUrl = `mailto:${settings.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;
    setSent(true);
  };

  return (
    <div className="pt-28 md:pt-36 pb-24 md:pb-40 min-h-screen">
      <div className="px-6 md:px-12 lg:px-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: easing }}
          className="mb-20 md:mb-32"
        >
          <div className="w-10 h-px bg-[#121212]/20 mb-6" />
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-light italic text-[#121212]">
            Контакты
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-20">
          {/* Large email */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15, ease: easing }}
            className="md:col-start-2 md:col-span-5"
          >
            <p className="text-sm text-[#121212]/40 mb-4">Напишите мне</p>
            <a
              href={`mailto:${settings.contactEmail}`}
              className="font-display text-xl md:text-2xl lg:text-3xl italic text-[#121212] hover:opacity-50 transition-opacity duration-700 break-all"
              style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
            >
              {settings.contactEmail}
            </a>

            <div className="mt-16 space-y-6">
              <div>
                <p className="text-xs text-[#121212]/30 mb-1">{settings.studioTitle}</p>
                <p className="text-sm text-[#121212]/60">
                  {settings.studioAddress}
                  <br />
                  {settings.studioNote}
                </p>
              </div>

              <div className="w-6 h-px bg-[#121212]/10" />

              <div className="flex items-center gap-6">
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#121212]/40 hover:text-[#121212] transition-opacity duration-500"
                >
                  Instagram
                </a>
                <a
                  href={settings.behanceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#121212]/40 hover:text-[#121212] transition-opacity duration-500"
                >
                  Behance
                </a>
                <a
                  href={settings.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#121212]/40 hover:text-[#121212] transition-opacity duration-500"
                >
                  Telegram
                </a>
              </div>
            </div>
          </motion.div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: easing }}
            className="md:col-span-4 md:col-start-8"
          >
            {sent ? (
              <div className="py-12">
                <div className="w-10 h-px bg-[#121212]/20 mb-6" />
                <p className="font-display text-xl italic text-[#121212] mb-3">
                  Спасибо за обращение
                </p>
                <p className="text-sm text-[#121212]/40">
                  Письмо подготовлено в вашем почтовом приложении.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label className="text-xs text-[#121212]/30 block mb-2">Имя</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-transparent border-b border-[#121212]/10 pb-2 text-sm text-[#121212] placeholder:text-[#121212]/20 focus:border-[#121212]/40 focus:outline-none transition-colors duration-500"
                    placeholder="Ваше имя"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-[#121212]/30 block mb-2">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-transparent border-b border-[#121212]/10 pb-2 text-sm text-[#121212] placeholder:text-[#121212]/20 focus:border-[#121212]/40 focus:outline-none transition-colors duration-500"
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-[#121212]/30 block mb-2">Сообщение</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={4}
                    className="w-full bg-transparent border-b border-[#121212]/10 pb-2 text-sm text-[#121212] placeholder:text-[#121212]/20 focus:border-[#121212]/40 focus:outline-none transition-colors duration-500 resize-none"
                    placeholder="Интересующая работа или вопрос"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="text-xs tracking-widest uppercase text-[#121212] border-b border-[#121212]/20 pb-1 hover:border-[#121212] transition-all duration-700 disabled:opacity-30 min-h-[44px] min-w-[44px]"
                  style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                >
                  Открыть почту
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
