# МОВА — Самавучак беларускай мовы

🇧🇾 **Бясплатны інтэрактыўны самавучак беларускай мовы**

🌐 **[Адкрыць МОВА](https://alexag1992.github.io/mova/)**

---

## Пра праект

**МОВА** — прагрэсіўны вэб-дадатак (PWA) для самастойнага вывучэння беларускай мовы. Ніякіх рэгістрацый, ніякай аплаты — усё бясплатна і працуе ў браўзеры.

## Функцыянал

- 📚 **24 ўрокі** па 6 модулях — ад алфавіту да свабоднай гаворкі
- 🔤 **Алфавіт** — 32 літары з прыкладамі і аудыё
- 📖 **Слоўнік** — 400+ слоў з перакладам, транскрыпцыяй і аудыё
- 💬 **Размоўнік** — 100+ гатовых фраз па 10 катэгорыях
- 🔄 **Сістэма паўтарэння** — інтэрвальнае паўтарэнне слоў
- 🎯 **7 відаў практыкаванняў** — выбар адказу, складанне сказа, слоўнік-флэшкарткі
- 🔊 **Аудыё** — вымаўленне ўсіх слоў і дыялогаў
- 📊 **Прагрэс** — серыі, ачкі, 12 дасягненняў, графік актыўнасці
- 📵 **Офлайн-рэжым** — працуе без інтэрнэту (PWA)

## Тэхналогіі

- Vanilla HTML / CSS / JavaScript (без фрэймворкаў)
- Service Worker (Cache First + Network First)
- localStorage для захавання прагрэсу
- Web Speech API для аудыё (украінскі голас як найбліжэйшы)
- GitHub Pages для хостынгу

## Структура праекта

```
mova/
├── index.html          # Галоўная старонка
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker
├── favicon.svg         # Іконка
├── css/style.css       # Усе стылі
├── js/
│   ├── app.js          # Роутынг і ініцыялізацыя
│   ├── pages.js        # Рэндэрынг старонак
│   ├── progress.js     # localStorage: streak, ачкі, прагрэс
│   ├── exercises.js    # Сістэма практыкаванняў
│   ├── audio.js        # AudioPlayer
│   ├── dictionary.js   # Слоўнік
│   ├── repetition.js   # Інтэрвальнае паўтарэнне
│   └── notifications.js # Тост-апавяшчэнні
├── data/
│   ├── alphabet.json
│   ├── phrasebook.json
│   └── lesson-01.json … lesson-24.json
├── audio/
│   ├── alphabet/
│   └── lesson-01/ … lesson-24/
├── icons/              # PWA іконкі
└── tools/
    ├── generate_audio.py
    └── generate_icons.py
```

## Запуск лакальна

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# Адкрыць у браўзеры
http://localhost:8000/mova/
```

## Генерацыя медыяфайлаў

```bash
pip install gtts Pillow

# Аудыё (MP3)
python tools/generate_audio.py

# Іконкі (PNG + ICO)
python tools/generate_icons.py
```

## Дэплой на GitHub Pages

1. Запушыць рэпазіторый на GitHub (`alexag1992/mova`)
2. Settings → Pages → Source: **Deploy from branch → main → / (root)**
3. Сайт будзе даступны па адрасе: `https://alexag1992.github.io/mova/`

---

*Мова — душа народа* 🇧🇾
