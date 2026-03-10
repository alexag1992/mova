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
        const timeout = setTimeout(() => { firstAuthHandled = true; resolve(); }, 2000);

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
                // Перерисовываем немедленно — чтобы показать авторизованного пользователя
                handleRoute();
                // Синхронизацию грузим в фоне, потом перерисовываем ещё раз
                if (user) {
                    Sync.load(user.uid)
                        .then(loaded => { if (loaded) handleRoute(); })
                        .catch(() => {});
                    Sync.saveProfile(user).catch(() => {});
                }
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
    showOnboarding();
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

// ---------- Онбординг ----------

const ONBOARDING_SLIDES = [
    {
        icon: '🇧🇾',
        title: 'Добро пожаловать!',
        desc: 'МОВА — бесплатный самоучитель белорусского языка. Без рекламы, без подписок.',
    },
    {
        icon: '📚',
        title: '24 урока',
        desc: 'От алфавита до уверенного разговора. Упражнения, аудио и словарь — всё в одном месте.',
    },
    {
        icon: '🔄',
        title: 'Умное повторение',
        desc: 'Приложение запоминает, какие слова тебе даются сложнее, и предлагает их повторить в нужный момент.',
    },
    {
        icon: '☁️',
        title: 'Сохрани прогресс',
        desc: 'Войди через Google — и твой прогресс сохранится на всех устройствах. Можно заниматься с телефона и компьютера.',
        isLast: true,
    },
];

let _onboardingStep = 0;

function showOnboarding() {
    if (localStorage.getItem('mova_onboarded')) return;

    const overlay = document.createElement('div');
    overlay.id = 'onboarding-overlay';
    overlay.innerHTML = _buildOnboardingHTML();
    document.body.appendChild(overlay);
}

function _buildOnboardingHTML() {
    const slides = ONBOARDING_SLIDES.map((s, i) => `
<div class="onboarding-slide${i === 0 ? ' active' : ''}" data-slide="${i}">
    <div class="onboarding-icon">${s.icon}</div>
    <h2 class="onboarding-title">${s.title}</h2>
    <p class="onboarding-desc">${s.desc}</p>
</div>`).join('');

    const dots = ONBOARDING_SLIDES.map((_, i) =>
        `<span class="onboarding-dot${i === 0 ? ' active' : ''}"></span>`
    ).join('');

    return `
<button class="onboarding-skip" onclick="completeOnboarding()">Пропустить</button>
<div class="onboarding-slides">${slides}</div>
<div class="onboarding-bottom">
    <div class="onboarding-dots">${dots}</div>
    <div id="onboarding-next-wrap">
        <button class="btn-onboarding-next" onclick="onboardingNext()">Далее →</button>
    </div>
</div>`;
}

function onboardingNext() {
    const slides = document.querySelectorAll('.onboarding-slide');
    const dots   = document.querySelectorAll('.onboarding-dot');
    const total  = ONBOARDING_SLIDES.length;

    if (_onboardingStep >= total - 1) {
        completeOnboarding();
        return;
    }

    slides[_onboardingStep].classList.remove('active');
    slides[_onboardingStep].classList.add('exit');
    dots[_onboardingStep].classList.remove('active');

    _onboardingStep++;

    slides[_onboardingStep].classList.add('active');
    dots[_onboardingStep].classList.add('active');

    // На последнем слайде: меняем кнопку и добавляем Google-кнопку
    if (_onboardingStep === total - 1) {
        const wrap = document.getElementById('onboarding-next-wrap');
        const user = window.Auth ? Auth.getCurrentUser() : null;
        const signinHTML = !user ? `
<button class="btn-onboarding-signin" onclick="completeOnboardingAndSignIn()">
    <svg width="16" height="16" viewBox="0 0 18 18"><path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/><path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/><path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/><path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z"/></svg>
    Войти через Google
</button>` : '';
        wrap.innerHTML = `<button class="btn-onboarding-next" onclick="completeOnboarding()">Начать обучение →</button>${signinHTML}`;
        wrap.style.display = 'flex';
        wrap.style.flexDirection = 'column';
        wrap.style.gap = '12px';
        wrap.style.width = '100%';
    }
}

function completeOnboarding() {
    localStorage.setItem('mova_onboarded', '1');
    const overlay = document.getElementById('onboarding-overlay');
    if (!overlay) return;
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s ease';
    setTimeout(() => overlay.remove(), 300);
    _onboardingStep = 0;
}

function completeOnboardingAndSignIn() {
    completeOnboarding();
    if (window.Auth) Auth.signInWithGoogle();
}
