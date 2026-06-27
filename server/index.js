import express from "express";
import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import multer from "multer";
import path from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { clearSessionCookie, createSession, readSession, requireAdmin, setSessionCookie } from "./auth.js";
import {
  createInquiry,
  deleteInquiry,
  getSiteContent,
  listInquiries,
  saveSiteContent,
  updateInquiryStatus,
} from "./db.js";

const app = express();
const port = Number(process.env.API_PORT || 3001);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const uploadsDir = path.join(rootDir, "public", "uploads");
const distDir = path.join(rootDir, "dist");

const adminUsername = process.env.ADMIN_USERNAME || "admin";
const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
const httpsKeyPath = process.env.HTTPS_KEY_PATH;
const httpsCertPath = process.env.HTTPS_CERT_PATH;
const httpsCaPath = process.env.HTTPS_CA_PATH;
const httpRedirectPort = process.env.HTTP_REDIRECT_PORT ? Number(process.env.HTTP_REDIRECT_PORT) : null;
const publicSiteUrl = (process.env.PUBLIC_SITE_URL || "https://www.diana-rents.ru").replace(/\/+$/, "");
const compressThresholdBytes = 10 * 1024 * 1024;
const targetCompressedBytes = 5 * 1024 * 1024;
const inquiryStatuses = new Set(["new", "in_progress", "done"]);

fs.mkdirSync(uploadsDir, { recursive: true });

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 60 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new Error("Можно загружать только изображения"));
      return;
    }
    callback(null, true);
  },
});

const getUploadedImage = async (file) => {
  const originalExtension = path.extname(file.originalname).toLowerCase() || ".jpg";
  const baseName = slugify(path.basename(file.originalname, originalExtension)) || "image";

  if (file.size <= compressThresholdBytes) {
    return {
      buffer: file.buffer,
      filename: `${Date.now()}-${baseName}${originalExtension}`,
      compressed: false,
      size: file.size,
    };
  }

  let width = 2400;
  let bestBuffer = null;

  for (let attempt = 0; attempt < 7; attempt += 1) {
    let minQuality = 45;
    let maxQuality = 82;

    while (minQuality <= maxQuality) {
      const quality = Math.floor((minQuality + maxQuality) / 2);
      const buffer = await sharp(file.buffer)
        .rotate()
        .resize({ width, height: width, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();

      if (buffer.length <= targetCompressedBytes) {
        bestBuffer = buffer;
        minQuality = quality + 1;
      } else {
        maxQuality = quality - 1;
      }
    }

    if (bestBuffer?.length <= targetCompressedBytes) {
      break;
    }

    width = Math.floor(width * 0.82);
  }

  const buffer =
    bestBuffer ||
    (await sharp(file.buffer)
      .rotate()
      .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 42, mozjpeg: true })
      .toBuffer());

  return {
    buffer,
    filename: `${Date.now()}-${baseName}.jpg`,
    compressed: true,
    size: buffer.length,
  };
};

const getPreviewImage = async (file, baseFilename) => {
  const filename = `${path.basename(baseFilename, path.extname(baseFilename))}-preview.webp`;
  const buffer = await sharp(file.buffer)
    .rotate()
    .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78 })
    .toBuffer();

  return { buffer, filename, size: buffer.length };
};

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const getRequestOrigin = (req) => {
  if (publicSiteUrl) {
    return publicSiteUrl;
  }

  const protocol = req.headers["x-forwarded-proto"] || (httpsKeyPath && httpsCertPath ? "https" : req.protocol);
  return `${protocol}://${req.get("host")}`;
};

const buildSitemap = (origin) => {
  const { works } = getSiteContent();
  const now = new Date().toISOString();
  const urls = [
    { loc: "/", priority: "1.0" },
    { loc: "/works", priority: "0.9" },
    { loc: "/biography", priority: "0.7" },
    { loc: "/contacts", priority: "0.6" },
    ...(Array.isArray(works) ? works : [])
      .filter((work) => work?.slug || work?.id)
      .map((work) => ({
        loc: `/works/${encodeURIComponent(work.slug || work.id)}`,
        priority: "0.8",
      })),
  ];

  const items = urls
    .map(
      ({ loc, priority }) => `  <url>
    <loc>${escapeXml(`${origin}${loc}`)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</urlset>
`;
};

const cleanText = (value, maxLength) => String(value || "").trim().slice(0, maxLength);

app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/content", (_req, res) => {
  res.json(getSiteContent());
});

app.get("/robots.txt", (req, res) => {
  const origin = getRequestOrigin(req);
  res.type("text/plain").send(`User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`);
});

app.get("/sitemap.xml", (req, res) => {
  res.type("application/xml").send(buildSitemap(getRequestOrigin(req)));
});

app.put("/api/content", requireAdmin, (req, res) => {
  saveSiteContent(req.body);
  res.json(getSiteContent());
});

app.post("/api/inquiries", (req, res) => {
  const inquiry = {
    name: cleanText(req.body?.name, 160),
    email: cleanText(req.body?.email, 200),
    message: cleanText(req.body?.message, 4000),
    workTitle: cleanText(req.body?.workTitle, 240) || null,
  };

  if (!inquiry.name || !inquiry.email || !inquiry.message) {
    res.status(400).json({ error: "Заполните имя, email и сообщение" });
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.email)) {
    res.status(400).json({ error: "Укажите корректный email" });
    return;
  }

  const created = createInquiry(inquiry);
  res.status(201).json({ ok: true, inquiry: created });
});

app.get("/api/inquiries", requireAdmin, (_req, res) => {
  res.json({ inquiries: listInquiries() });
});

app.patch("/api/inquiries/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const status = cleanText(req.body?.status, 40);

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Некорректный ID заявки" });
    return;
  }

  if (!inquiryStatuses.has(status)) {
    res.status(400).json({ error: "Некорректный статус заявки" });
    return;
  }

  updateInquiryStatus(id, status);
  res.json({ inquiries: listInquiries() });
});

app.delete("/api/inquiries/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Некорректный ID заявки" });
    return;
  }

  deleteInquiry(id);
  res.json({ inquiries: listInquiries() });
});

app.post("/api/uploads", requireAdmin, upload.single("image"), async (req, res, next) => {
  if (!req.file) {
    res.status(400).json({ error: "Файл не загружен" });
    return;
  }

  try {
    const image = await getUploadedImage(req.file);
    const preview = await getPreviewImage(req.file, image.filename);
    const filePath = path.join(uploadsDir, image.filename);
    const previewPath = path.join(uploadsDir, preview.filename);
    await fs.promises.writeFile(filePath, image.buffer);
    await fs.promises.writeFile(previewPath, preview.buffer);

    res.json({
      url: `/uploads/${image.filename}`,
      previewUrl: `/uploads/${preview.filename}`,
      filename: image.filename,
      previewFilename: preview.filename,
      compressed: image.compressed,
      size: image.size,
      previewSize: preview.size,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/auth/session", (req, res) => {
  const session = readSession(req);
  res.json({
    authenticated: Boolean(session),
    username: session?.username || null,
  });
});

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  if (username !== adminUsername || password !== adminPassword) {
    res.status(401).json({ error: "Неверный логин или пароль" });
    return;
  }

  setSessionCookie(res, createSession(username));
  res.json({ authenticated: true, username });
});

app.post("/api/auth/logout", (_req, res) => {
  clearSessionCookie(res);
  res.json({ authenticated: false });
});

app.use("/uploads", express.static(uploadsDir, { maxAge: "30d" }));

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir, { maxAge: "1h" }));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      next();
      return;
    }

    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.use((error, req, res, next) => {
  if (!req.path.startsWith("/api")) {
    next(error);
    return;
  }

  if (error instanceof multer.MulterError) {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "Файл слишком большой. Максимальный размер исходного изображения — 60 МБ."
        : error.message;
    res.status(400).json({ error: message });
    return;
  }

  res.status(400).json({
    error: error.message || "Не удалось обработать запрос",
  });
});

const createHttpsOptions = () => {
  if (!httpsKeyPath || !httpsCertPath) {
    return null;
  }

  const certParts = [fs.readFileSync(httpsCertPath, "utf8")];
  if (httpsCaPath && fs.existsSync(httpsCaPath)) {
    certParts.push(fs.readFileSync(httpsCaPath, "utf8"));
  }

  return {
    key: fs.readFileSync(httpsKeyPath, "utf8"),
    cert: certParts.join("\n"),
  };
};

const httpsOptions = createHttpsOptions();

if (httpsOptions) {
  https.createServer(httpsOptions, app).listen(port, "0.0.0.0", () => {
    console.log(`HTTPS server listening on https://localhost:${port}`);
  });

  if (httpRedirectPort) {
    http
      .createServer((req, res) => {
        const host = String(req.headers.host || "").replace(/:\d+$/, "");
        const location = `https://${host}${req.url || "/"}`;
        res.writeHead(301, { Location: location });
        res.end();
      })
      .listen(httpRedirectPort, "0.0.0.0", () => {
        console.log(`HTTP redirect listening on http://localhost:${httpRedirectPort}`);
      });
  }
} else {
  app.listen(port, "0.0.0.0", () => {
    console.log(`HTTP server listening on http://localhost:${port}`);
  });
}
