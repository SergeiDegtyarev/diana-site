import crypto from "node:crypto";

const COOKIE_NAME = "diana_admin_session";
const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

const secret = process.env.SESSION_SECRET || "change-this-secret-in-production";

const base64url = (value) => Buffer.from(value).toString("base64url");

const sign = (payload) =>
  crypto.createHmac("sha256", secret).update(payload).digest("base64url");

const parseCookies = (cookieHeader = "") =>
  Object.fromEntries(
    cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const separatorIndex = cookie.indexOf("=");
        return [
          decodeURIComponent(cookie.slice(0, separatorIndex)),
          decodeURIComponent(cookie.slice(separatorIndex + 1)),
        ];
      })
  );

const serializeCookie = (name, value, options = {}) => {
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options.path) parts.push(`Path=${options.path}`);
  return parts.join("; ");
};

export function createSession(username) {
  const payload = base64url(
    JSON.stringify({
      username,
      exp: Math.floor(Date.now() / 1000) + ONE_WEEK_SECONDS,
    })
  );
  return `${payload}.${sign(payload)}`;
}

export function readSession(req) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[COOKIE_NAME];
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expectedSignature = sign(payload);
  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!session.exp || session.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function setSessionCookie(res, token) {
  res.setHeader(
    "Set-Cookie",
    serializeCookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "Lax",
      path: "/",
      maxAge: ONE_WEEK_SECONDS,
    })
  );
}

export function clearSessionCookie(res) {
  res.setHeader(
    "Set-Cookie",
    serializeCookie(COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: "Lax",
      path: "/",
      maxAge: 0,
    })
  );
}

export function requireAdmin(req, res, next) {
  const session = readSession(req);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.session = session;
  next();
}
