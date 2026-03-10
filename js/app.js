// ============================================================
// app.js — роутинг, инициализация, loading screen
// ============================================================

// ---------- Инициализация при загрузке ----------

document.addEventListener('DOMContentLoaded', () => {
    updateStreak();
    initErrorHandlers();
    initNetworkHandlers();
    initInstallPrompt();
    initScrollNav();
    showLoadingScreen();
});

// ---------- Loading screen ----------

function showLoadingScreen() {
    const loading = document.getElementById('loading');
    const app     = document.getElementById('app');
    app.style.opacity = '0';

    // Инициализируем Firestore
    if (window.Sync) Sync.init();

    // Флаг: был ли уже обработан первый auth-event
    let firstAuthHandled = false;

    // Промис: ждём определения auth-состояния (или timeout 2s)
    const authReady = new Promise(resolve => {
        const timeout = setTimeout(resolve, 2000);

        if (!window.Auth) { resolve(); return; }

        Auth.onStateChanged(async user => {
            if (!firstAuthHandled) {
                // Первый вызов — при загрузке страницы
                firstAuthHandled = true;
                clearTimeout(timeout);

                if (user) {
                    const loaded = await Sync.load(user.uid).catch(() => false);
                    if (!loaded) {
                        // Первый вход — заливаем локальные данные в облако
                        await Sync.save(user.uid).catch(() => {});
                    }
                    Sync.saveProfile(user).catch(() => {});
                }
                resolve();
            } else {
                // Последующие изменения (вход / выход после загрузки)
                if (user) {
                    const loaded = await Sync.load(user.uid).catch(() => false);
                    if (!loaded) await Sync.save(user.uid).catch(() => {});
                    Sync.saveProfile(user).catch(() => {});
                }
                // Перерисовываем текущую страницу с новыми данными
                handleRoute();
            }
        });
    });

    // Минимум 1 секунда экрана загрузки + ждём auth
    Promise.all([authReady, new Promise(r => setTimeout(r, 1000))]).then(() => {
        loading.style.opacity = '0';
        loading.style.transition = 'opacity 0.4s ease';

        setTimeout(() => {
            loading.style.display = 'none';
            app.style.opacity = '1';
            app.style.transition = 'opacity 0.3s ease';
            initRouter();
        }, 400);
    });
}

// ---------- Роутер ----------

function initRouter() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
}

function handleRoute() {
    const hash = location.hash || '#/';
    renderPage(hash);
    updateBottomNav(hash);
}

function navigate(href) {
    location.hash = href;
}

// ---------- Рендеринг страниц ----------

function renderPage(hash) {
    const app = document.getElementById('app');

    let html = '';
    if (hash === '#/' || hash === '') {
        html = renderHome();
    } else if (hash === '#/alphabet') {
        html = renderAlphabet();
    } else if (hash === '#/lessons') {
        html = renderLessons();
    } else if (hash === '#/review') {
        html = renderReview();
    } else if (hash.startsWith('#/phrasebook/')) {
        html = renderPhrasebookCategory(hash.replace('#/phrasebook/', ''));
    } else if (hash === '#/phrasebook') {
        html = renderPhrasebook();
    } else if (hash === '#/dictionary') {
        html = renderDictionary();
    } else if (hash === '#/progress') {
        html = renderProgress();
    } else if (hash.startsWith('#/lesson/')) {
        html = renderLesson(hash.replace('#/lesson/', ''));
    } else if (hash.startsWith('#/test/')) {
        html = renderTest(hash.replace('#/test/', ''));
    } else {
        html = render404();
    }

    app.style.opacity = '0';
    setTimeout(() => {
        app.innerHTML = html;
        app.style.opacity = '1';
        window.scrollTo(0, 0);
        triggerPageLoad(hash);
    }, 200);
}

// ---------- 404 ----------

function render404() {
    return `
<div class="page">
    <div class="page-nav">
        <button class="btn-back" onclick="navigate('#/')">← Галоўная</button>
    </div>
    <div class="empty-state">
        <p style="font-size:48px">🤔</p>
        <p>Старонка не знойдзена</p>
        <p class="empty-sub">Паспрабуйце вярнуцца на галоўную</p>
    </div>
</div>`;
}

// ---------- Bottom navigation ----------

function updateBottomNav(hash) {
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
        item.classList.remove('active');
        const ih = item.dataset.hash;
        if (hash === ih || (ih !== '#/' && hash.startsWith(ih))) {
            item.classList.add('active');
        } else if (ih === '#/' && (hash === '#/' || hash === '' || hash === '#')) {
            item.classList.add('active');
        }
    });
}

// ---------- Скрытие навигации при скролле вниз ----------

function initScrollNav() {
    const nav = document.getElementById('bottom-nav');
    if (!nav) return;
    let lastY = 0, ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const y = window.scrollY;
                if (y > lastY + 10 && y > 80) nav.classList.add('nav-hidden');
                else if (y < lastY - 10) nav.classList.remove('nav-hidden');
                lastY = y;
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// ---------- Глобальные обработчики ошибок ----------

function initErrorHandlers() {
    window.addEventListener('error', e => console.error('JS Error:', e.message, e.filename, e.lineno));
    window.addEventListener('unhandledrejection', e => { console.error('Unhandled rejection:', e.reason); e.preventDefault(); });
}

// ---------- Online / Offline ----------

function initNetworkHandlers() {
    window.addEventListener('online',  () => { if (window.Notifications) Notifications.success('🌐 Злучэнне адноўлена'); });
    window.addEventListener('offline', () => { if (window.Notifications) Notifications.show('📵 Няма злучэння', 'error', 4000); });
}

// ---------- PWA Install Prompt ----------

let _deferredInstallPrompt = null;

function initInstallPrompt() {
    window.addEventListener('beforeinstallprompt', e => {
        e.preventDefault();
        _deferredInstallPrompt = e;
        showInstallPrompt();
    });
    window.addEventListener('appinstalled', () => {
        _deferredInstallPrompt = null;
        const c = document.getElementById('install-prompt-container');
        if (c) c.innerHTML = '';
        if (window.Notifications) Notifications.success('🎉 МОВА ўстаноўлена!');
    });
}

function showInstallPrompt() {
    const c = document.getElementById('install-prompt-container');
    if (!c || !_deferredInstallPrompt) return;
    c.innerHTML = `
<div class="install-prompt" id="install-prompt">
    <div class="install-prompt-body">
        <span class="install-prompt-icon">📱</span>
        <div><strong>Усталяваць МОВА</strong><span>Працуйце офлайн, без браўзера</span></div>
    </div>
    <div class="install-prompt-actions">
        <button class="btn-install" onclick="triggerInstall()">Усталяваць</button>
        <button class="btn-install-dismiss" onclick="dismissInstall()">✕</button>
    </div>
</div>`;
}

async function triggerInstall() {
    if (!_deferredInstallPrompt) return;
    _deferredInstallPrompt.prompt();
    await _deferredInstallPrompt.userChoice;
    _deferredInstallPrompt = null;
    dismissInstall();
}

function dismissInstall() {
    const p = document.getElementById('install-prompt');
    if (p) { p.style.animation = 'slideDown 0.3s ease reverse forwards'; setTimeout(() => p.remove(), 300); }
}

// ---------- Безопасный fetch ----------

async function safeFetch(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
}

// filterDictionary is handled by dictSearch() in pages.js
