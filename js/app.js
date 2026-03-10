// ============================================================
// app.js — роутинг, инициализация, loading screen
// ============================================================

// ---------- Инициализация при загрузке ----------

document.addEventListener('DOMContentLoaded', () => {
    // Обновляем streak при каждом входе
    updateStreak();

    // Глобальные обработчики ошибок
    initErrorHandlers();

    // Online/offline уведомления
    initNetworkHandlers();

    // Захватываем промпт установки PWA
    initInstallPrompt();

    // Прячем нав при скролле вниз
    initScrollNav();

    // Показываем loading screen, потом запускаем роутер
    showLoadingScreen();
});

// ---------- Loading screen ----------

function showLoadingScreen() {
    const loading = document.getElementById('loading');
    const app = document.getElementById('app');

    app.style.opacity = '0';

    setTimeout(() => {
        loading.style.opacity = '0';
        loading.style.transition = 'opacity 0.4s ease';

        setTimeout(() => {
            loading.style.display = 'none';
            app.style.opacity = '1';
            app.style.transition = 'opacity 0.3s ease';
            initRouter();
        }, 400);
    }, 1000);
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

// Навигация программно
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
        const catId = hash.replace('#/phrasebook/', '');
        html = renderPhrasebookCategory(catId);
    } else if (hash === '#/phrasebook') {
        html = renderPhrasebook();
    } else if (hash === '#/dictionary') {
        html = renderDictionary();
    } else if (hash === '#/progress') {
        html = renderProgress();
    } else if (hash.startsWith('#/lesson/')) {
        const id = hash.replace('#/lesson/', '');
        html = renderLesson(id);
    } else if (hash.startsWith('#/test/')) {
        const id = hash.replace('#/test/', '');
        html = renderTest(id);
    } else {
        html = render404();
    }

    // Плавный переход: скрываем → рендерим → показываем
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
    const navItems = document.querySelectorAll('.bottom-nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        const itemHash = item.dataset.hash;
        if (hash === itemHash || (itemHash !== '#/' && hash.startsWith(itemHash))) {
            item.classList.add('active');
        } else if (itemHash === '#/' && (hash === '#/' || hash === '' || hash === '#')) {
            item.classList.add('active');
        }
    });
}

// ---------- Скрытие навигации при скролле вниз ----------

function initScrollNav() {
    const nav = document.getElementById('bottom-nav');
    if (!nav) return;

    let lastScrollY = 0;
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentY = window.scrollY;
                if (currentY > lastScrollY + 10 && currentY > 80) {
                    nav.classList.add('nav-hidden');
                } else if (currentY < lastScrollY - 10) {
                    nav.classList.remove('nav-hidden');
                }
                lastScrollY = currentY;
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// ---------- Глобальные обработчики ошибок ----------

function initErrorHandlers() {
    window.addEventListener('error', event => {
        console.error('JS Error:', event.message, event.filename, event.lineno);
    });

    window.addEventListener('unhandledrejection', event => {
        console.error('Unhandled Promise rejection:', event.reason);
        event.preventDefault();
    });
}

// ---------- Online / Offline ----------

function initNetworkHandlers() {
    window.addEventListener('online', () => {
        if (window.Notifications) Notifications.success('🌐 Злучэнне адноўлена');
    });
    window.addEventListener('offline', () => {
        if (window.Notifications) Notifications.show('📵 Няма злучэння з інтэрнэтам', 'error', 4000);
    });
}

// ---------- PWA Install Prompt ----------

let _deferredInstallPrompt = null;

function initInstallPrompt() {
    window.addEventListener('beforeinstallprompt', event => {
        event.preventDefault();
        _deferredInstallPrompt = event;
        showInstallPrompt();
    });

    window.addEventListener('appinstalled', () => {
        _deferredInstallPrompt = null;
        const container = document.getElementById('install-prompt-container');
        if (container) container.innerHTML = '';
        if (window.Notifications) Notifications.success('🎉 МОВА ўстаноўлена!');
    });
}

function showInstallPrompt() {
    const container = document.getElementById('install-prompt-container');
    if (!container || !_deferredInstallPrompt) return;

    container.innerHTML = `
<div class="install-prompt" id="install-prompt">
    <div class="install-prompt-body">
        <span class="install-prompt-icon">📱</span>
        <div>
            <strong>Усталяваць МОВА</strong>
            <span>Працуйце офлайн, без браўзера</span>
        </div>
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
    const { outcome } = await _deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') {
        _deferredInstallPrompt = null;
    }
    dismissInstall();
}

function dismissInstall() {
    const prompt = document.getElementById('install-prompt');
    if (prompt) {
        prompt.style.animation = 'slideDown 0.3s ease reverse forwards';
        setTimeout(() => prompt.remove(), 300);
    }
}

// ---------- Безопасный fetch ----------

async function safeFetch(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (err) {
        console.warn('safeFetch failed:', url, err);
        throw err;
    }
}

// filterDictionary is handled by dictSearch() in pages.js
