import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useSiteContent } from "@/hooks/useSiteContent";

const easing = [0.16, 1, 0.3, 1];

const getInitialMessage = (work, project) => {
  if (work) return `Здравствуйте, интересует картина "${work}".`;
  if (project) return `Здравствуйте, хочу обсудить интерьерный проект "${project}".`;
  return "";
};

export default function Contacts() {
  const [searchParams] = useSearchParams();
  const requestedWork = searchParams.get("work");
  const requestedProject = searchParams.get("project");
  const [sent, setSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: getInitialMessage(requestedWork, requestedProject),
  });
  const { settings } = useSiteContent();

  useEffect(() => {
    if (!requestedWork && !requestedProject) return;
    setForm((currentForm) => {
      if (currentForm.message) return currentForm;
      return {
        ...currentForm,
        message: getInitialMessage(requestedWork, requestedProject),
      };
    });
  }, [requestedProject, requestedWork]);

  usePageMeta({
    title: "Контакты — Диана Ренц",
    description:
      "Связаться с Дианой Ренц по вопросам картин, интерьерных проектов, выставок и визита в мастерскую.",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    try {
      setIsSending(true);
      setSubmitError("");
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          workTitle: requestedWork || requestedProject || "",
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Не удалось отправить заявку");
      }

      setSent(true);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="pt-28 md:pt-36 pb-24 md:pb-40 min-h-screen">
      <div className="px-6 md:px-12 lg:px-20">
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
                  Заявка отправлена. Я свяжусь с вами по указанному email.
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
                    placeholder="Интересующая картина, интерьерный проект или вопрос"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSending}
                  className="text-xs tracking-widest uppercase text-[#121212] border-b border-[#121212]/20 pb-1 hover:border-[#121212] transition-all duration-700 disabled:opacity-30 min-h-[44px] min-w-[44px]"
                  style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                >
                  {isSending ? "Отправка..." : "Отправить"}
                </button>
                {submitError && (
                  <p className="text-sm text-red-700">
                    {submitError}
                  </p>
                )}
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
