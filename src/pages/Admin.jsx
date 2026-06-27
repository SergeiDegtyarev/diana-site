import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, Edit3, ImageUp, Lock, LogOut, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { DEFAULT_SITE_CONTENT } from "@/data/siteContent";
import { useAdminSession } from "@/hooks/useAdminSession";
import { formatPrice, useSiteContent } from "@/hooks/useSiteContent";
import { getWorkCategoryLabel, getWorkStatusLabel, slugify, workStatusOptions } from "@/utils/work";

const emptyWork = {
  id: "",
  slug: "",
  title: "",
  year: "2026",
  medium: "Холст, масло",
  size: "",
  image: "/assets/work-fuji.png",
  previewImage: "/assets/work-fuji.png",
  images: ["/assets/work-fuji.png"],
  cols: "md:col-span-6",
  aspect: "aspect-[4/3]",
  order: "",
  category: "",
  status: "available",
  price: "",
  sold: false,
  featured: false,
  description: "",
};

const emptyInterior = {
  id: "",
  slug: "",
  title: "",
  type: "Частный интерьер",
  location: "",
  year: "2026",
  status: "Концепция",
  image: "/assets/interior-dressing-1.png",
  previewImage: "/assets/interior-dressing-1.png",
  images: ["/assets/interior-dressing-1.png"],
  order: "",
  featured: false,
  published: true,
  description: "",
};

const aspectOptions = [
  { value: "aspect-[4/3]", label: "4:3" },
  { value: "aspect-[3/4]", label: "3:4" },
  { value: "aspect-[4/5]", label: "4:5" },
  { value: "aspect-square", label: "1:1" },
];

const columnOptions = [
  { value: "md:col-span-4", label: "Узкая" },
  { value: "md:col-span-5", label: "Средняя" },
  { value: "md:col-span-6", label: "Половина" },
  { value: "md:col-span-7", label: "Широкая" },
  { value: "md:col-span-8", label: "Большая" },
];

const inquiryStatusOptions = [
  { value: "new", label: "Новая" },
  { value: "in_progress", label: "В работе" },
  { value: "done", label: "Закрыта" },
];

const makeWorkId = (title) => {
  const fallback = Date.now().toString(36);
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, "-")
    .replace(/^-|-$/g, "");

  return `work-${slug || fallback}`;
};

const makeInteriorId = (title) => {
  const fallback = Date.now().toString(36);
  const slug = slugify(title);

  return `interior-${slug || fallback}`;
};

const uniqueImages = (images) =>
  [...new Set((images || []).map((image) => String(image || "").trim()).filter(Boolean))];

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getInquiryStatusLabel = (status) =>
  inquiryStatusOptions.find((option) => option.value === status)?.label || "Новая";

function TextField({ label, value, onChange, type = "text", required = false }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-widest text-[#121212]/35 mb-2">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="w-full bg-transparent border-b border-[#121212]/10 pb-2 text-sm text-[#121212] focus:border-[#121212]/50 focus:outline-none transition-colors duration-300"
      />
    </label>
  );
}

function TextAreaField({ label, value, onChange, rows = 3 }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-widest text-[#121212]/35 mb-2">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        className="w-full bg-transparent border border-[#121212]/10 p-3 text-sm text-[#121212] focus:border-[#121212]/50 focus:outline-none transition-colors duration-300 resize-none"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-widest text-[#121212]/35 mb-2">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-transparent border-b border-[#121212]/10 pb-2 text-sm text-[#121212] focus:border-[#121212]/50 focus:outline-none transition-colors duration-300"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ImageUploadField({ label, value, onChange, onUpload, isUploading }) {
  const inputId = `upload-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div>
      <TextField label={label} value={value} onChange={onChange} />
      <div className="mt-3 flex items-center gap-3">
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (file) {
              await onUpload(file);
              event.target.value = "";
            }
          }}
        />
        <label
          htmlFor={inputId}
          className="inline-flex cursor-pointer items-center gap-2 min-h-10 px-4 border border-[#121212]/15 text-xs tracking-widest uppercase text-[#121212]/70 hover:text-[#121212] hover:border-[#121212]/45 transition-colors"
        >
          <ImageUp size={15} />
          {isUploading ? "Загрузка..." : "Загрузить"}
        </label>
        {value && (
          <img
            src={value}
            alt=""
            className="h-10 w-10 object-cover border border-[#121212]/10"
          />
        )}
      </div>
    </div>
  );
}

function ToggleField({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 border border-[#121212]/10 px-4 py-3">
      <span className="text-sm text-[#121212]/60">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[#121212]"
      />
    </label>
  );
}

export default function Admin() {
  const { isAuthenticated, isCheckingSession, login, logout } = useAdminSession();
  const {
    settings,
    works,
    interiors,
    updateSettings,
    saveWork,
    deleteWork,
    saveInterior,
    deleteInterior,
    resetContent,
  } = useSiteContent();
  const [activeTab, setActiveTab] = useState("works");
  const [settingsDraft, setSettingsDraft] = useState(settings);
  const [editingWorkId, setEditingWorkId] = useState(null);
  const [workDraft, setWorkDraft] = useState(emptyWork);
  const [editingInteriorId, setEditingInteriorId] = useState(null);
  const [interiorDraft, setInteriorDraft] = useState(emptyInterior);
  const [loginDraft, setLoginDraft] = useState({ username: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [inquiries, setInquiries] = useState([]);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(false);
  const [galleryImageUrl, setGalleryImageUrl] = useState("");
  const [interiorGalleryImageUrl, setInteriorGalleryImageUrl] = useState("");
  const [uploadingField, setUploadingField] = useState(null);
  const successTimeoutRef = useRef(null);
  const soldCount = useMemo(() => works.filter((work) => work.sold).length, [works]);
  const newInquiryCount = useMemo(
    () => inquiries.filter((inquiry) => inquiry.status === "new").length,
    [inquiries]
  );

  useEffect(() => {
    setSettingsDraft(settings);
  }, [settings]);

  useEffect(
    () => () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    },
    []
  );

  const showSuccess = (message) => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }

    setSuccessMessage(message);
    successTimeoutRef.current = setTimeout(() => {
      setSuccessMessage("");
      successTimeoutRef.current = null;
    }, 3000);
  };

  const loadInquiries = async () => {
    try {
      setSaveError("");
      setIsLoadingInquiries(true);
      const response = await fetch("/api/inquiries", { credentials: "include" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Не удалось загрузить заявки");
      }
      setInquiries(result.inquiries || []);
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setIsLoadingInquiries(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadInquiries();
    }
  }, [isAuthenticated]);

  const updateInquiry = async (id, status) => {
    try {
      setSaveError("");
      setSuccessMessage("");
      const response = await fetch(`/api/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Не удалось обновить заявку");
      }
      setInquiries(result.inquiries || []);
      showSuccess("Статус заявки обновлен");
    } catch (error) {
      setSaveError(error.message);
    }
  };

  const removeInquiry = async (id) => {
    try {
      setSaveError("");
      setSuccessMessage("");
      const response = await fetch(`/api/inquiries/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Не удалось удалить заявку");
      }
      setInquiries(result.inquiries || []);
      showSuccess("Заявка удалена");
    } catch (error) {
      setSaveError(error.message);
    }
  };

  const updateSettingsDraft = (key, value) => {
    setSettingsDraft((draft) => ({ ...draft, [key]: value }));
  };

  const updateWorkDraft = (key, value) => {
    setWorkDraft((draft) => ({ ...draft, [key]: value }));
  };

  const updateInteriorDraft = (key, value) => {
    setInteriorDraft((draft) => ({ ...draft, [key]: value }));
  };

  const addWorkImage = (image) => {
    const cleanImage = String(image || "").trim();
    if (!cleanImage) return;

    setWorkDraft((draft) => ({
      ...draft,
      images: uniqueImages([...(draft.images || []), cleanImage]),
    }));
    setGalleryImageUrl("");
  };

  const updateWorkImage = (index, value) => {
    setWorkDraft((draft) => ({
      ...draft,
      images: (draft.images || []).map((image, imageIndex) => (imageIndex === index ? value : image)),
    }));
  };

  const removeWorkImage = (index) => {
    setWorkDraft((draft) => ({
      ...draft,
      images: (draft.images || []).filter((_, imageIndex) => imageIndex !== index),
    }));
  };

  const addInteriorImage = (image) => {
    const cleanImage = String(image || "").trim();
    if (!cleanImage) return;

    setInteriorDraft((draft) => ({
      ...draft,
      images: uniqueImages([...(draft.images || []), cleanImage]),
    }));
    setInteriorGalleryImageUrl("");
  };

  const updateInteriorImage = (index, value) => {
    setInteriorDraft((draft) => ({
      ...draft,
      images: (draft.images || []).map((image, imageIndex) => (imageIndex === index ? value : image)),
    }));
  };

  const removeInteriorImage = (index) => {
    setInteriorDraft((draft) => ({
      ...draft,
      images: (draft.images || []).filter((_, imageIndex) => imageIndex !== index),
    }));
  };

  const startNewWork = () => {
    setEditingWorkId(null);
    setWorkDraft({ ...emptyWork, order: (works.length + 1) * 10 });
    setGalleryImageUrl("");
    setActiveTab("works");
  };

  const startNewInterior = () => {
    setEditingInteriorId(null);
    setInteriorDraft({ ...emptyInterior, order: (interiors.length + 1) * 10 });
    setInteriorGalleryImageUrl("");
    setActiveTab("interiors");
  };

  const startEditWork = (work) => {
    setEditingWorkId(work.id);
    setWorkDraft({ ...work, price: work.price || "", status: work.status || (work.sold ? "sold" : "available") });
    setGalleryImageUrl("");
    setActiveTab("works");
  };

  const startEditInterior = (project) => {
    setEditingInteriorId(project.id);
    setInteriorDraft({ ...project });
    setInteriorGalleryImageUrl("");
    setActiveTab("interiors");
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setAuthError("");
    try {
      await login(loginDraft);
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleSaveWork = async (event) => {
    event.preventDefault();
    const isNewWork = !editingWorkId;
    const id = editingWorkId || makeWorkId(workDraft.title);
    const slug = workDraft.slug || slugify(workDraft.title);
    try {
      setSaveError("");
      setSuccessMessage("");
      await saveWork({ ...workDraft, id, slug });
      setEditingWorkId(id);
      showSuccess(isNewWork ? "Картина добавлена" : "Изменения по картине сохранены");
    } catch (error) {
      setSaveError(error.message);
    }
  };

  const handleDeleteWork = async (id) => {
    try {
      setSaveError("");
      setSuccessMessage("");
      await deleteWork(id);
      showSuccess("Картина удалена");
      if (editingWorkId === id) {
        startNewWork();
      }
    } catch (error) {
      setSaveError(error.message);
    }
  };

  const handleSaveInterior = async (event) => {
    event.preventDefault();
    const isNewProject = !editingInteriorId;
    const id = editingInteriorId || makeInteriorId(interiorDraft.title);
    const slug = interiorDraft.slug || slugify(interiorDraft.title);
    try {
      setSaveError("");
      setSuccessMessage("");
      await saveInterior({ ...interiorDraft, id, slug });
      setEditingInteriorId(id);
      showSuccess(isNewProject ? "Интерьер добавлен" : "Изменения по интерьеру сохранены");
    } catch (error) {
      setSaveError(error.message);
    }
  };

  const handleDeleteInterior = async (id) => {
    try {
      setSaveError("");
      setSuccessMessage("");
      await deleteInterior(id);
      showSuccess("Интерьер удалён");
      if (editingInteriorId === id) {
        startNewInterior();
      }
    } catch (error) {
      setSaveError(error.message);
    }
  };

  const handleReset = async () => {
    try {
      setSaveError("");
      setSuccessMessage("");
      await resetContent();
      setSettingsDraft(DEFAULT_SITE_CONTENT.settings);
      startNewWork();
      showSuccess("Данные сброшены");
    } catch (error) {
      setSaveError(error.message);
    }
  };

  const uploadImage = async (file, onUploaded, fieldKey) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      setSaveError("");
      setUploadingField(fieldKey);
      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const responseText = await response.text();
      let result = {};
      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(`Сервер вернул неожиданный ответ при загрузке файла (${response.status}).`);
      }
      if (!response.ok) {
        throw new Error(result.error || "Не удалось загрузить изображение");
      }
      if (!result.url) {
        throw new Error("Сервер не вернул путь к загруженному изображению");
      }
      onUploaded(result);
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setUploadingField(null);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="pt-28 md:pt-36 pb-24 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#121212]/10 border-t-[#121212] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="pt-28 md:pt-36 pb-24 min-h-screen">
        <div className="px-6 md:px-12 lg:px-20">
          <div className="max-w-sm mx-auto">
            <div className="w-10 h-px bg-[#121212]/20 mb-6" />
            <h1 className="font-display text-4xl md:text-5xl font-light italic text-[#121212] mb-4">
              Вход
            </h1>
            <p className="text-sm text-[#121212]/45 mb-10">
              Панель управления доступна только администратору.
            </p>

            <form onSubmit={handleLogin} className="space-y-8">
              <TextField
                label="Логин"
                value={loginDraft.username}
                onChange={(value) => setLoginDraft((draft) => ({ ...draft, username: value }))}
                required
              />
              <TextField
                label="Пароль"
                type="password"
                value={loginDraft.password}
                onChange={(value) => setLoginDraft((draft) => ({ ...draft, password: value }))}
                required
              />
              {authError && <p className="text-sm text-red-700">{authError}</p>}
              <button
                type="submit"
                className="inline-flex items-center gap-2 min-h-11 px-5 bg-[#121212] text-white text-xs tracking-widest uppercase hover:bg-[#121212]/80 transition-colors"
              >
                <Lock size={15} />
                Войти
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 md:pt-36 pb-24 md:pb-36 min-h-screen bg-white">
      <div className="px-6 md:px-12 lg:px-20">
        <div className="mb-10 md:mb-14">
          <div className="w-10 h-px bg-[#121212]/20 mb-6" />
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-light italic text-[#121212]">
                Админка
              </h1>
              <p className="text-sm text-[#121212]/45 mt-3">
                {works.length} картин · {soldCount} продано
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center justify-center min-h-11 w-11 border border-[#121212]/10 text-[#121212]/45 hover:text-[#121212] hover:border-[#121212]/40 transition-colors"
                aria-label="Выйти"
              >
                <LogOut size={16} />
              </button>
              <button
                type="button"
                onClick={startNewWork}
                className="inline-flex items-center gap-2 min-h-11 px-4 border border-[#121212]/15 text-xs tracking-widest uppercase text-[#121212] hover:border-[#121212]/50 transition-colors"
              >
                <Plus size={15} />
                Новая картина
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center min-h-11 w-11 border border-[#121212]/10 text-[#121212]/45 hover:text-[#121212] hover:border-[#121212]/40 transition-colors"
                aria-label="Сбросить данные"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
        </div>

        {saveError && (
          <div className="mb-8 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {saveError}
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            aria-live="polite"
            className="mb-8 flex items-center gap-3 border border-[#121212]/10 bg-[#F7F7F7] px-4 py-3 text-sm text-[#121212]/65"
          >
            <Check size={15} className="shrink-0 text-[#121212]" />
            {successMessage}
          </div>
        )}

        <div className="flex border-b border-[#121212]/10 mb-10">
          {[
            { id: "works", label: "Картины" },
            { id: "interiors", label: "Интерьеры" },
            { id: "inquiries", label: newInquiryCount ? `Заявки ${newInquiryCount}` : "Заявки" },
            { id: "settings", label: "Сайт" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-11 px-5 text-xs tracking-widest uppercase border-b transition-colors ${
                activeTab === tab.id
                  ? "border-[#121212] text-[#121212]"
                  : "border-transparent text-[#121212]/35 hover:text-[#121212]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "settings" ? (
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              try {
                setSaveError("");
                setSuccessMessage("");
                await updateSettings(settingsDraft);
                showSuccess("Настройки сайта сохранены");
              } catch (error) {
                setSaveError(error.message);
              }
            }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10"
          >
            <div className="lg:col-span-5 space-y-8">
              <TextField
                label="Имя в шапке"
                value={settingsDraft.artistName}
                onChange={(value) => updateSettingsDraft("artistName", value)}
                required
              />
              <div className="grid grid-cols-2 gap-5">
                <TextField
                  label="Имя"
                  value={settingsDraft.heroFirstName}
                  onChange={(value) => updateSettingsDraft("heroFirstName", value)}
                />
                <TextField
                  label="Фамилия"
                  value={settingsDraft.heroLastName}
                  onChange={(value) => updateSettingsDraft("heroLastName", value)}
                />
              </div>
              <TextAreaField
                label="Подзаголовок"
                value={settingsDraft.heroSubtitle}
                onChange={(value) => updateSettingsDraft("heroSubtitle", value)}
              />
              <ImageUploadField
                label="Hero изображение"
                value={settingsDraft.heroImage}
                onChange={(value) => updateSettingsDraft("heroImage", value)}
                onUpload={(file) =>
                  uploadImage(file, (result) => updateSettingsDraft("heroImage", result.url), "heroImage")
                }
                isUploading={uploadingField === "heroImage"}
              />
              <ImageUploadField
                label="Изображение о художнице"
                value={settingsDraft.aboutImage}
                onChange={(value) => updateSettingsDraft("aboutImage", value)}
                onUpload={(file) =>
                  uploadImage(file, (result) => updateSettingsDraft("aboutImage", result.url), "aboutImage")
                }
                isUploading={uploadingField === "aboutImage"}
              />
              <ToggleField
                label="Показывать категории картин"
                checked={settingsDraft.showWorkCategories !== false}
                onChange={(value) => updateSettingsDraft("showWorkCategories", value)}
              />
              <div className="border-t border-[#121212]/10 pt-8 space-y-8">
                <div>
                  <span className="block text-[11px] uppercase tracking-widest text-[#121212]/35 mb-2">
                    Раздел интерьеров
                  </span>
                  <p className="text-xs text-[#121212]/35">
                    Эти тексты выводятся на странице «Интерьеры» над списком проектов.
                  </p>
                </div>
                <TextField
                  label="Заголовок"
                  value={settingsDraft.interiorsTitle || ""}
                  onChange={(value) => updateSettingsDraft("interiorsTitle", value)}
                />
                <TextAreaField
                  label="Подзаголовок"
                  rows={3}
                  value={settingsDraft.interiorsSubtitle || ""}
                  onChange={(value) => updateSettingsDraft("interiorsSubtitle", value)}
                />
                <TextAreaField
                  label="Вводный текст"
                  rows={4}
                  value={settingsDraft.interiorsIntro || ""}
                  onChange={(value) => updateSettingsDraft("interiorsIntro", value)}
                />
                <TextAreaField
                  label="Услуги, по одной строке"
                  rows={6}
                  value={settingsDraft.interiorsServices || ""}
                  onChange={(value) => updateSettingsDraft("interiorsServices", value)}
                />
                <TextAreaField
                  label="Заметка про искусство"
                  rows={4}
                  value={settingsDraft.interiorsArtNote || ""}
                  onChange={(value) => updateSettingsDraft("interiorsArtNote", value)}
                />
              </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
              <TextField
                label="Email"
                type="email"
                value={settingsDraft.contactEmail}
                onChange={(value) => updateSettingsDraft("contactEmail", value)}
              />
              <TextField
                label="Заголовок адреса"
                value={settingsDraft.studioTitle}
                onChange={(value) => updateSettingsDraft("studioTitle", value)}
              />
              <TextField
                label="Адрес"
                value={settingsDraft.studioAddress}
                onChange={(value) => updateSettingsDraft("studioAddress", value)}
              />
              <TextField
                label="Примечание"
                value={settingsDraft.studioNote}
                onChange={(value) => updateSettingsDraft("studioNote", value)}
              />
              <TextField
                label="Instagram"
                value={settingsDraft.instagramUrl}
                onChange={(value) => updateSettingsDraft("instagramUrl", value)}
              />
              <TextField
                label="Telegram"
                value={settingsDraft.telegramUrl}
                onChange={(value) => updateSettingsDraft("telegramUrl", value)}
              />
            </div>

            <div className="lg:col-span-3 space-y-8">
              <TextField
                label="Заголовок блока"
                value={settingsDraft.aboutTitle}
                onChange={(value) => updateSettingsDraft("aboutTitle", value)}
              />
              <TextAreaField
                label="Абзац 1"
                rows={7}
                value={settingsDraft.aboutParagraph1}
                onChange={(value) => updateSettingsDraft("aboutParagraph1", value)}
              />
              <TextAreaField
                label="Абзац 2"
                rows={5}
                value={settingsDraft.aboutParagraph2}
                onChange={(value) => updateSettingsDraft("aboutParagraph2", value)}
              />
              <div className="border-t border-[#121212]/10 pt-8 space-y-8">
                <div>
                  <span className="block text-[11px] uppercase tracking-widest text-[#121212]/35 mb-2">
                    Биография
                  </span>
                  <p className="text-xs text-[#121212]/35">
                    Для списков используйте формат: год или период, затем вертикальная черта, затем текст.
                  </p>
                </div>
                <TextField
                  label="Подпись под фото"
                  value={settingsDraft.biographyPortraitCaption}
                  onChange={(value) => updateSettingsDraft("biographyPortraitCaption", value)}
                />
                <TextAreaField
                  label="Биография, абзац 1"
                  rows={6}
                  value={settingsDraft.biographyIntro1}
                  onChange={(value) => updateSettingsDraft("biographyIntro1", value)}
                />
                <TextAreaField
                  label="Биография, абзац 2"
                  rows={6}
                  value={settingsDraft.biographyIntro2}
                  onChange={(value) => updateSettingsDraft("biographyIntro2", value)}
                />
                <TextAreaField
                  label="Хронология"
                  rows={10}
                  value={settingsDraft.biographyTimeline}
                  onChange={(value) => updateSettingsDraft("biographyTimeline", value)}
                />
                <TextAreaField
                  label="Выставки"
                  rows={8}
                  value={settingsDraft.biographyExhibitions}
                  onChange={(value) => updateSettingsDraft("biographyExhibitions", value)}
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 min-h-11 px-5 bg-[#121212] text-white text-xs tracking-widest uppercase hover:bg-[#121212]/80 transition-colors"
              >
                <Save size={15} />
                Сохранить
              </button>
            </div>
          </form>
        ) : activeTab === "interiors" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <form onSubmit={handleSaveInterior} className="lg:col-span-4 space-y-7 lg:sticky lg:top-28 self-start">
              <div className="flex items-center justify-between gap-4 border-b border-[#121212]/10 pb-4">
                <h2 className="font-display text-2xl italic text-[#121212]">
                  {editingInteriorId ? "Редактирование" : "Новый интерьер"}
                </h2>
                {editingInteriorId && (
                  <button
                    type="button"
                    onClick={startNewInterior}
                    className="text-xs text-[#121212]/40 hover:text-[#121212] transition-colors"
                  >
                    Очистить
                  </button>
                )}
              </div>

              <TextField
                label="Название"
                value={interiorDraft.title}
                onChange={(value) => {
                  updateInteriorDraft("title", value);
                  if (!editingInteriorId && !interiorDraft.slug) {
                    updateInteriorDraft("slug", slugify(value));
                  }
                }}
                required
              />
              <TextField
                label="Адрес страницы"
                value={interiorDraft.slug}
                onChange={(value) => updateInteriorDraft("slug", slugify(value))}
              />
              <div className="grid grid-cols-2 gap-5">
                <TextField
                  label="Тип"
                  value={interiorDraft.type}
                  onChange={(value) => updateInteriorDraft("type", value)}
                />
                <TextField
                  label="Локация"
                  value={interiorDraft.location}
                  onChange={(value) => updateInteriorDraft("location", value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-5">
                <TextField
                  label="Год"
                  value={interiorDraft.year}
                  onChange={(value) => updateInteriorDraft("year", value)}
                />
                <TextField
                  label="Порядок"
                  type="number"
                  value={interiorDraft.order}
                  onChange={(value) => updateInteriorDraft("order", value)}
                />
                <TextField
                  label="Статус"
                  value={interiorDraft.status}
                  onChange={(value) => updateInteriorDraft("status", value)}
                />
              </div>
              <ImageUploadField
                label="Главное изображение"
                value={interiorDraft.image}
                onChange={(value) => updateInteriorDraft("image", value)}
                onUpload={(file) =>
                  uploadImage(
                    file,
                    (result) => {
                      setInteriorDraft((draft) => ({
                        ...draft,
                        image: result.url,
                        previewImage: result.previewUrl || result.url,
                        images: uniqueImages([result.url, ...(draft.images || [])]),
                      }));
                    },
                    "interiorImage"
                  )
                }
                isUploading={uploadingField === "interiorImage"}
              />
              <TextField
                label="Превью для списка"
                value={interiorDraft.previewImage}
                onChange={(value) => updateInteriorDraft("previewImage", value)}
              />

              <div className="space-y-4 border-t border-[#121212]/10 pt-6">
                <div>
                  <span className="block text-[11px] uppercase tracking-widest text-[#121212]/35 mb-2">
                    Галерея интерьера
                  </span>
                  <p className="text-xs text-[#121212]/35">
                    Добавляйте рендеры, планы, детали материалов или разные ракурсы проекта.
                  </p>
                </div>

                {(interiorDraft.images || []).map((image, index) => (
                  <div key={`${image}-${index}`} className="flex items-center gap-3">
                    <img
                      src={image}
                      alt=""
                      className="h-14 w-14 shrink-0 object-cover border border-[#121212]/10"
                    />
                    <input
                      type="text"
                      value={image}
                      onChange={(event) => updateInteriorImage(index, event.target.value)}
                      className="min-w-0 flex-1 bg-transparent border-b border-[#121212]/10 pb-2 text-sm text-[#121212] focus:border-[#121212]/50 focus:outline-none transition-colors duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeInteriorImage(index)}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-[#121212]/10 text-[#121212]/45 hover:text-[#121212] hover:border-[#121212]/40 transition-colors"
                      aria-label="Удалить изображение из галереи"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}

                <ImageUploadField
                  label="Новое изображение галереи"
                  value={interiorGalleryImageUrl}
                  onChange={setInteriorGalleryImageUrl}
                  onUpload={(file) =>
                    uploadImage(file, (result) => addInteriorImage(result.url), "interiorGalleryImage")
                  }
                  isUploading={uploadingField === "interiorGalleryImage"}
                />
                {interiorGalleryImageUrl && (
                  <button
                    type="button"
                    onClick={() => addInteriorImage(interiorGalleryImageUrl)}
                    className="inline-flex items-center gap-2 min-h-10 px-4 border border-[#121212]/15 text-xs tracking-widest uppercase text-[#121212]/70 hover:text-[#121212] hover:border-[#121212]/45 transition-colors"
                  >
                    <Plus size={15} />
                    Добавить ссылку
                  </button>
                )}
              </div>

              <TextAreaField
                label="Описание"
                rows={5}
                value={interiorDraft.description}
                onChange={(value) => updateInteriorDraft("description", value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <ToggleField
                  label="Избранное"
                  checked={interiorDraft.featured}
                  onChange={(value) => updateInteriorDraft("featured", value)}
                />
                <ToggleField
                  label="Опубликовано"
                  checked={interiorDraft.published !== false}
                  onChange={(value) => updateInteriorDraft("published", value)}
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 min-h-11 px-5 bg-[#121212] text-white text-xs tracking-widest uppercase hover:bg-[#121212]/80 transition-colors"
              >
                <Save size={15} />
                Сохранить интерьер
              </button>
            </form>

            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-5">
              {interiors.map((project) => (
                <article key={project.id} className="border border-[#121212]/10">
                  <div className="relative overflow-hidden bg-[#F7F7F7]">
                    <img
                      src={project.previewImage || project.image}
                      alt={project.title}
                      className="w-full aspect-[4/3] object-cover"
                    />
                    {project.published === false && (
                      <span className="absolute top-4 left-4 bg-white/90 px-3 py-1 text-[10px] tracking-widest uppercase text-[#121212]/70">
                        Скрыто
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-sm text-[#121212]">{project.title}</h3>
                        <p className="text-xs text-[#121212]/35 mt-1">
                          {[project.type, project.location, project.year, project.status]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      {project.featured && (
                        <span className="shrink-0 text-[10px] tracking-widest uppercase text-[#121212]/35">
                          Избранное
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs text-[#121212]/55">
                        {project.published === false ? "Не опубликовано" : "Опубликовано"}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEditInterior(project)}
                          className="inline-flex items-center justify-center h-10 w-10 border border-[#121212]/10 text-[#121212]/50 hover:text-[#121212] hover:border-[#121212]/40 transition-colors"
                          aria-label="Редактировать интерьер"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteInterior(project.id)}
                          className="inline-flex items-center justify-center h-10 w-10 border border-[#121212]/10 text-[#121212]/50 hover:text-[#121212] hover:border-[#121212]/40 transition-colors"
                          aria-label="Удалить интерьер"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : activeTab === "inquiries" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-3">
              <div className="lg:sticky lg:top-28">
                <div className="w-10 h-px bg-[#121212]/20 mb-6" />
                <h2 className="font-display text-2xl italic text-[#121212] mb-3">
                  Заявки
                </h2>
                <p className="text-sm text-[#121212]/45 leading-[1.7] mb-6">
                  Здесь сохраняются обращения с формы контактов и запросы по конкретным картинам.
                </p>
                <button
                  type="button"
                  onClick={loadInquiries}
                  className="inline-flex items-center gap-2 min-h-10 px-4 border border-[#121212]/15 text-xs tracking-widest uppercase text-[#121212]/70 hover:text-[#121212] hover:border-[#121212]/45 transition-colors"
                >
                  <RotateCcw size={15} />
                  Обновить
                </button>
              </div>
            </div>

            <div className="lg:col-span-9 space-y-5">
              {isLoadingInquiries ? (
                <div className="py-12 text-sm text-[#121212]/40">
                  Загрузка заявок...
                </div>
              ) : inquiries.length === 0 ? (
                <div className="border border-[#121212]/10 px-5 py-10">
                  <p className="font-display text-xl italic text-[#121212] mb-3">
                    Заявок пока нет
                  </p>
                  <p className="text-sm text-[#121212]/45">
                    Новые обращения появятся здесь после отправки формы на странице контактов.
                  </p>
                </div>
              ) : (
                inquiries.map((inquiry) => (
                  <article key={inquiry.id} className="border border-[#121212]/10 p-5">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 mb-5">
                      <div>
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="text-sm text-[#121212]">{inquiry.name}</h3>
                          <span className="text-[10px] uppercase tracking-widest text-[#121212]/30">
                            {getInquiryStatusLabel(inquiry.status)}
                          </span>
                        </div>
                        <a
                          href={`mailto:${inquiry.email}`}
                          className="text-sm text-[#121212]/50 hover:text-[#121212] transition-colors break-all"
                        >
                          {inquiry.email}
                        </a>
                        <p className="text-xs text-[#121212]/30 mt-2">
                          {formatDateTime(inquiry.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <select
                          value={inquiry.status}
                          onChange={(event) => updateInquiry(inquiry.id, event.target.value)}
                          className="bg-transparent border-b border-[#121212]/10 pb-2 text-sm text-[#121212] focus:border-[#121212]/50 focus:outline-none transition-colors"
                        >
                          {inquiryStatusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => removeInquiry(inquiry.id)}
                          className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-[#121212]/10 text-[#121212]/45 hover:text-[#121212] hover:border-[#121212]/40 transition-colors"
                          aria-label="Удалить заявку"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {inquiry.workTitle && (
                      <p className="text-xs uppercase tracking-widest text-[#121212]/30 mb-3">
                        Картина/проект: {inquiry.workTitle}
                      </p>
                    )}
                    <p className="text-sm text-[#121212]/65 leading-[1.8] whitespace-pre-wrap">
                      {inquiry.message}
                    </p>
                  </article>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <form onSubmit={handleSaveWork} className="lg:col-span-4 space-y-7 lg:sticky lg:top-28 self-start">
              <div className="flex items-center justify-between gap-4 border-b border-[#121212]/10 pb-4">
                <h2 className="font-display text-2xl italic text-[#121212]">
                  {editingWorkId ? "Редактирование" : "Новая картина"}
                </h2>
                {editingWorkId && (
                  <button
                    type="button"
                    onClick={startNewWork}
                    className="text-xs text-[#121212]/40 hover:text-[#121212] transition-colors"
                  >
                    Очистить
                  </button>
                )}
              </div>

              <TextField
                label="Название"
                value={workDraft.title}
                onChange={(value) => {
                  updateWorkDraft("title", value);
                  if (!editingWorkId && !workDraft.slug) {
                    updateWorkDraft("slug", slugify(value));
                  }
                }}
                required
              />
              <TextField
                label="Адрес страницы"
                value={workDraft.slug}
                onChange={(value) => updateWorkDraft("slug", slugify(value))}
              />
              <div className="grid grid-cols-3 gap-5">
                <TextField
                  label="Год"
                  value={workDraft.year}
                  onChange={(value) => updateWorkDraft("year", value)}
                />
                <TextField
                  label="Порядок"
                  type="number"
                  value={workDraft.order}
                  onChange={(value) => updateWorkDraft("order", value)}
                />
                <TextField
                  label="Цена"
                  type="number"
                  value={workDraft.price}
                  onChange={(value) => updateWorkDraft("price", value)}
                />
              </div>
              <SelectField
                label="Статус"
                value={workDraft.status}
                onChange={(value) => updateWorkDraft("status", value)}
                options={workStatusOptions}
              />
              <TextField
                label="Категория"
                value={workDraft.category}
                onChange={(value) => updateWorkDraft("category", value)}
              />
              <TextField
                label="Материал"
                value={workDraft.medium}
                onChange={(value) => updateWorkDraft("medium", value)}
              />
              <TextField
                label="Размер"
                value={workDraft.size}
                onChange={(value) => updateWorkDraft("size", value)}
              />
              <ImageUploadField
                label="Изображение"
                value={workDraft.image}
                onChange={(value) => updateWorkDraft("image", value)}
                onUpload={(file) =>
                  uploadImage(
                    file,
                    (result) => {
                      setWorkDraft((draft) => ({
                        ...draft,
                        image: result.url,
                        previewImage: result.previewUrl || result.url,
                        images: uniqueImages([result.url, ...(draft.images || [])]),
                      }));
                    },
                    "workImage"
                  )
                }
                isUploading={uploadingField === "workImage"}
              />
              <TextField
                label="Превью для галереи"
                value={workDraft.previewImage}
                onChange={(value) => updateWorkDraft("previewImage", value)}
              />
              <div className="space-y-4 border-t border-[#121212]/10 pt-6">
                <div>
                  <span className="block text-[11px] uppercase tracking-widest text-[#121212]/35 mb-2">
                    Галерея картины
                  </span>
                  <p className="text-xs text-[#121212]/35">
                    Первое изображение обычно используется как основной вид. Можно добавить детали, фото в интерьере или фрагменты фактуры.
                  </p>
                </div>

                {(workDraft.images || []).map((image, index) => (
                  <div key={`${image}-${index}`} className="flex items-center gap-3">
                    <img
                      src={image}
                      alt=""
                      className="h-14 w-14 shrink-0 object-cover border border-[#121212]/10"
                    />
                    <input
                      type="text"
                      value={image}
                      onChange={(event) => updateWorkImage(index, event.target.value)}
                      className="min-w-0 flex-1 bg-transparent border-b border-[#121212]/10 pb-2 text-sm text-[#121212] focus:border-[#121212]/50 focus:outline-none transition-colors duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeWorkImage(index)}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-[#121212]/10 text-[#121212]/45 hover:text-[#121212] hover:border-[#121212]/40 transition-colors"
                      aria-label="Удалить изображение из галереи"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}

                <ImageUploadField
                  label="Новое изображение галереи"
                  value={galleryImageUrl}
                  onChange={setGalleryImageUrl}
                  onUpload={(file) =>
                    uploadImage(file, (result) => addWorkImage(result.url), "workGalleryImage")
                  }
                  isUploading={uploadingField === "workGalleryImage"}
                />
                {galleryImageUrl && (
                  <button
                    type="button"
                    onClick={() => addWorkImage(galleryImageUrl)}
                    className="inline-flex items-center gap-2 min-h-10 px-4 border border-[#121212]/15 text-xs tracking-widest uppercase text-[#121212]/70 hover:text-[#121212] hover:border-[#121212]/45 transition-colors"
                  >
                    <Plus size={15} />
                    Добавить ссылку
                  </button>
                )}
              </div>
              <TextAreaField
                label="Описание"
                rows={4}
                value={workDraft.description}
                onChange={(value) => updateWorkDraft("description", value)}
              />
              <div className="grid grid-cols-2 gap-5">
                <SelectField
                  label="Пропорция"
                  value={workDraft.aspect}
                  onChange={(value) => updateWorkDraft("aspect", value)}
                  options={aspectOptions}
                />
                <SelectField
                  label="Ширина"
                  value={workDraft.cols}
                  onChange={(value) => updateWorkDraft("cols", value)}
                  options={columnOptions}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <ToggleField
                  label="Избранное"
                  checked={workDraft.featured}
                  onChange={(value) => updateWorkDraft("featured", value)}
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 min-h-11 px-5 bg-[#121212] text-white text-xs tracking-widest uppercase hover:bg-[#121212]/80 transition-colors"
              >
                <Save size={15} />
                Сохранить картину
              </button>
            </form>

            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-5">
              {works.map((work) => (
                <article key={work.id} className="border border-[#121212]/10">
                  <div className="relative overflow-hidden bg-[#F7F7F7]">
                    <img
                      src={work.image}
                      alt={work.title}
                      className={`w-full ${work.aspect} object-cover`}
                    />
                    {work.sold && (
                      <span className="absolute top-4 left-4 bg-white/90 px-3 py-1 text-[10px] tracking-widest uppercase text-[#121212]/70">
                        Продано
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-sm text-[#121212]">{work.title}</h3>
                        <p className="text-xs text-[#121212]/35 mt-1">
                          {[getWorkCategoryLabel(work), `${work.medium}, ${work.size}`, work.year]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      {work.featured && (
                        <span className="shrink-0 text-[10px] tracking-widest uppercase text-[#121212]/35">
                          Избранное
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs text-[#121212]/55">
                        {getWorkStatusLabel(work)} · {work.status === "sold" ? "Продано" : formatPrice(work.price)}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              setSaveError("");
                              await saveWork({
                                ...work,
                                status: work.status === "sold" ? "available" : "sold",
                              });
                            } catch (error) {
                              setSaveError(error.message);
                            }
                          }}
                          className="inline-flex items-center justify-center h-10 w-10 border border-[#121212]/10 text-[#121212]/50 hover:text-[#121212] hover:border-[#121212]/40 transition-colors"
                          aria-label={work.sold ? "Снять отметку продано" : "Отметить как продано"}
                        >
                          <Check size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => startEditWork(work)}
                          className="inline-flex items-center justify-center h-10 w-10 border border-[#121212]/10 text-[#121212]/50 hover:text-[#121212] hover:border-[#121212]/40 transition-colors"
                          aria-label="Редактировать картину"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteWork(work.id)}
                          className="inline-flex items-center justify-center h-10 w-10 border border-[#121212]/10 text-[#121212]/50 hover:text-[#121212] hover:border-[#121212]/40 transition-colors"
                          aria-label="Удалить картину"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
