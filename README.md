# تنگه | عملیات خنثی‌سازی — Hormuz Minesweeper

یک بازی مرورگری فارسی به سبک **Minesweeper** که صفحهٔ بازی را روی نقشهٔ جغرافیایی و تصاویر ماهواره‌ای محدودهٔ تنگهٔ هرمز نمایش می‌دهد. خانه‌ها و خطرها برای هر دور به‌صورت تصادفی ساخته می‌شوند؛ این پروژه **بازی و شبیه‌سازی سرگرمی** است و هیچ محل واقعی مین یا اطلاعات عملیاتی را نشان نمی‌دهد.

**[English](#english)** · **[فارسی](#فارسی)**

**GitHub:** [HamidYaraliOfficial](https://github.com/HamidYaraliOfficial)

## ویژگی‌ها

- نمایش محدودهٔ تنگهٔ هرمز روی تصاویر ماهواره‌ای واقعی (Esri) با امکان جابه‌جایی به نقشهٔ جغرافیایی (CARTO / OpenStreetMap).
- شبکهٔ قابل‌بازی ۱۲×۱۶ که روی نقشه قرار می‌گیرد.
- سه سطح دشواری: آسان، معمولی و سخت.
- اولین خانهٔ انتخاب‌شده در هر دور امن است.
- بازکردن خانه‌ها، شمارش خطرهای اطراف، پرچم‌گذاری با کلیک راست یا حالت پرچم.
- زمان‌سنج، شمارندهٔ خانه‌های باز و ذخیرهٔ بهترین زمان محلی برای هر سطح.
- کنترل بزرگ‌نمایی، جابه‌جایی نقشه و خاموش/روشن کردن شبکه.
- رابط فارسی و راست‌چین، طراحی واکنش‌گرا برای رایانه و موبایل.
- قابل میزبانی در GitHub Pages بدون نیاز به سرور یا نصب پکیج.

## اجرای سریع

1. فایل ZIP را استخراج کن.
2. فایل `index.html` را با مرورگر به‌روز مانند Chrome یا Edge باز کن.
3. برای دریافت نقشهٔ ماهواره‌ای و کتابخانهٔ Leaflet، اتصال اینترنت لازم است.

این پروژه به Node.js، دیتابیس یا بک‌اند نیاز ندارد.

## انتشار در GitHub Pages

1. یک مخزن جدید در حساب GitHub ایجاد کن.
2. همهٔ فایل‌ها و پوشه‌های داخل این پروژه را به مخزن اضافه کن (محتویات پوشه، نه پوشهٔ ZIP).
3. از بخش **Settings → Pages**، در صورت نیاز، منبع انتشار را روی **GitHub Actions** قرار بده.
4. فایل گردش‌کار `.github/workflows/pages.yml` با push به شاخهٔ `main` سایت را منتشر می‌کند.
5. پس از پایان گردش‌کار، آدرس GitHub Pages در همان بخش نمایش داده می‌شود.

همچنین می‌توانی به‌جای GitHub Pages، فایل‌ها را روی هر میزبانی استاتیک بارگذاری کنی.

## ساختار پروژه

```text
hormuz-minesweeper/
├── index.html                 # ساختار رابط کاربری
├── styles.css                 # استایل‌ها و طراحی واکنش‌گرا
├── app.js                     # منطق بازی و نقشه
├── README.md                  # مستندات فارسی و انگلیسی
├── LICENSE                    # مجوز MIT
├── .gitignore
└── .github/
    └── workflows/
        └── pages.yml          # انتشار خودکار در GitHub Pages
```

## منابع نقشه و حریم استفاده

- نقشهٔ ماهواره‌ای: **Esri World Imagery**؛ اعتباردهی ارائه‌شده در خود نقشه نمایش داده می‌شود.
- نقشهٔ جغرافیایی: **CARTO** و داده‌های **OpenStreetMap**؛ اعتباردهی در خود نقشه نمایش داده می‌شود.
- کتابخانهٔ نقشه: **Leaflet**، بارگذاری از CDN.
- کاشی‌های نقشه و کتابخانه از سرویس‌های خارجی دریافت می‌شوند؛ دسترس‌پذیری آن‌ها به اینترنت و شرایط سرویس‌دهندگان وابسته است.
- مرزهای محدوده فقط قاب نمایشی بازی را تعیین می‌کنند. این نقشه برای ناوبری، تصمیم‌گیری عملیاتی یا استفادهٔ میدانی طراحی نشده است.
- موقعیت تمام خطرها در هر دور به‌صورت تصادفی و درون بازی تولید می‌شود و بیانگر موقعیت واقعی مین‌ها نیست.

## فناوری‌ها

HTML5 · CSS3 · JavaScript · Leaflet · Esri World Imagery · CARTO / OpenStreetMap

## مشارکت

برای پیشنهاد ویژگی یا گزارش باگ، در مخزن GitHub یک Issue باز کن یا Pull Request بفرست. لطفاً هر تغییری که به اطلاعات واقعیِ میدان یا موقعیت واقعی مواد منفجره مربوط باشد، خارج از دامنهٔ این بازی نگه داشته شود.

---

## English

A Persian, browser-based **Minesweeper-style puzzle** rendered over real satellite and geographic basemaps of the Strait of Hormuz. Mine-like hazards are randomly generated for gameplay in every round. **This is a fictional entertainment simulation; it does not contain or display real mine locations or operational data.**

### Features

- Real satellite imagery (Esri World Imagery) with a switchable geographic basemap (CARTO / OpenStreetMap).
- A 12 × 16 playable grid over the map.
- Easy, Normal, and Hard difficulty levels.
- The first selected cell is always safe.
- Reveal cells, count neighboring hazards, and flag suspicious cells with right-click or Flag Mode.
- Timer, revealed-cell counter, and local best times per difficulty.
- Map zoom/pan, grid visibility toggle, responsive layout, and a Persian RTL interface.
- Static site: no server, database, build step, or package installation required.

### Run locally

Extract the ZIP and open `index.html` in a modern browser. An internet connection is required to load Leaflet and the map tiles. No Node.js or backend is required.

### Deploy to GitHub Pages

1. Create a repository on GitHub.
2. Upload the contents of this project directory to the repository root.
3. In **Settings → Pages**, use **GitHub Actions** as the source if prompted.
4. Push to `main`. The included `.github/workflows/pages.yml` workflow publishes the static site.
5. Find the published URL in the Pages settings after the workflow finishes.

### Attribution and limitations

- Satellite basemap: Esri World Imagery.
- Geographic basemap: CARTO and OpenStreetMap.
- Map library: Leaflet, loaded from a CDN.
- Attribution links are displayed on the map. Map tiles and the library require internet access and remain subject to the providers' availability and terms.
- The playable grid is a game overlay, not a navigation chart. Hazards are randomly generated and fictional; this project is not intended for real-world navigation or operational use.

### License

Released under the MIT License. See `LICENSE`.
