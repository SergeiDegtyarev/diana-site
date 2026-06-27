# Diana Site

Персональный сайт художницы Дианы Ренц, собранный как самостоятельное React/Vite-приложение.

## Требования

- Docker Desktop

## Запуск Через Docker Compose

```bash
docker compose up --build
```

После запуска откройте:

```text
http://localhost:5173
```

Админка:

```text
http://localhost:5173/admin
```

Логин и пароль по умолчанию для локального запуска:

```text
admin / admin123
```

Их можно изменить через переменные окружения:

```bash
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-password
SESSION_SECRET=your-random-secret
```

## Остановка

Нажмите `Ctrl+C` в терминале, где запущен Compose, затем при необходимости выполните:

```bash
docker compose down
```

## Локальный Запуск Без Docker

Если Node.js и npm установлены на машине:

```bash
npm install
npm run dev
```

Vite обычно откроется на:

```text
http://localhost:5173
```

## Сборка

Внутри Docker:

```bash
docker compose run --rm site sh -c "npm install && npm run build"
```

Локально без Docker:

```bash
npm run build
```

Готовые файлы появятся в папке `dist/`.

## Проверка production-сборки

```bash
npm run preview
```

## Production-Деплой На Ubuntu-Сервер

Для сервера используйте отдельный production compose:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Перед первым запуском создайте `.env` на сервере:

```bash
cp .env.production.example .env
nano .env
```

Обязательно задайте свои значения:

```text
ADMIN_USERNAME=admin
ADMIN_PASSWORD=strong-password
SESSION_SECRET=long-random-secret
```

Production-контейнер слушает порты:

```text
80  -> редирект на HTTPS
443 -> HTTPS-сайт
```

SSL-сертификаты нужно положить в папку `certs` на сервере:

```text
certs/certificate.key
certs/certificate.crt
certs/certificate_ca.crt
```

`certificate.crt` — основной сертификат сайта, `certificate_ca.crt` — промежуточный/CA сертификат, `certificate.key` — приватный ключ.

Права на приватный ключ:

```bash
chmod 600 certs/certificate.key
```

Данные сайта сохраняются в папках:

```text
data/site.sqlite
public/uploads
```

Для обновления сайта после загрузки новой версии кода:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Для просмотра логов:

```bash
docker compose -f docker-compose.prod.yml logs -f
```

## Контактная форма

Форма на странице контактов формирует письмо и открывает почтовое приложение через `mailto:`.

## База Данных

Сайт использует SQLite. В Docker данные сохраняются в volume `sqlite_data`, поэтому не пропадают при обычном `docker compose down`.

Загруженные через админку изображения сохраняются на диск в:

```text
public/uploads
```

После загрузки в полях админки используется путь вида `/uploads/filename.jpg`.

Чтобы полностью удалить базу и начать заново:

```bash
docker compose down -v
```
