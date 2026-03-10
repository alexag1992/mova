// ============================================================
// pages.js — рендеринг всех страниц приложения
// ============================================================

// ---------- Данные: модули и уроки ----------

const MODULES = [
    {
        id: 0,
        title: 'МОДУЛЬ 0: АЛФАВІТ',
        lessons: [
            { id: 0, title: 'Беларускі алфавіт', desc: 'Алфавит, фонетика, чтение', isAlphabet: true }
        ]
    },
    {
        id: 1,
        title: 'МОДУЛЬ 1: ПЕРШЫЯ КРОКІ',
        lessons: [
            { id: 1,  title: 'Прывітанні і развітанні', desc: 'Приветствия и прощания' },
            { id: 2,  title: 'Знаёмства',               desc: 'Знакомство' },
            { id: 3,  title: 'Лічбы',                   desc: 'Числа' },
            { id: 4,  title: 'Колеры і формы',          desc: 'Цвета и формы' },
        ]
    },
    {
        id: 2,
        title: 'МОДУЛЬ 2: ПРА СЯБЕ',
        lessons: [
            { id: 5,  title: "Сям'я",                   desc: 'Семья' },
            { id: 6,  title: 'Знешнасць',               desc: 'Внешность' },
            { id: 7,  title: 'Характар і эмоцыі',       desc: 'Характер и эмоции' },
            { id: 8,  title: 'Прафесіі',                desc: 'Профессии' },
            { id: 9,  title: 'Хобі',                    desc: 'Хобби' },
        ]
    },
    {
        id: 3,
        title: 'МОДУЛЬ 3: ШТОДЗЁННАЕ ЖЫЦЦЁ',
        lessons: [
            { id: 10, title: 'Ежа і напоі',             desc: 'Еда и напитки' },
            { id: 11, title: 'У краме',                  desc: 'В магазине' },
            { id: 12, title: 'У кафэ і рэстаране',      desc: 'В кафе и ресторане' },
            { id: 13, title: 'Дом і кватэра',            desc: 'Дом и квартира' },
            { id: 14, title: 'Мой дзень',                desc: 'Мой день' },
            { id: 15, title: 'Каляндар',                 desc: 'Календарь' },
        ]
    },
    {
        id: 4,
        title: 'МОДУЛЬ 4: У ГОРАДЗЕ',
        lessons: [
            { id: 16, title: 'Транспарт',               desc: 'Транспорт' },
            { id: 17, title: 'Накірункі',                desc: 'Направления' },
            { id: 18, title: 'Установы',                 desc: 'Учреждения' },
            { id: 19, title: "Надвор'е і прырода",      desc: 'Погода и природа' },
        ]
    },
    {
        id: 5,
        title: 'МОДУЛЬ 5: ЗНОСІНЫ',
        lessons: [
            { id: 20, title: 'У лекара',                 desc: 'У врача' },
            { id: 21, title: 'Тэлефонная размова',       desc: 'Телефонный разговор' },
            { id: 22, title: 'Святы і традыцыі',         desc: 'Праздники и традиции' },
            { id: 23, title: 'Падарожжа',                desc: 'Путешествие' },
            { id: 24, title: 'Беларусь — мая краіна',   desc: 'Беларусь — моя страна' },
        ]
    }
];

const ALL_LESSONS = MODULES.flatMap(m => m.lessons);
const TOTAL_LESSONS = 24;

function getLessonById(id) {
    return ALL_LESSONS.find(l => l.id === parseInt(id));
}

function getModuleForLesson(lessonId) {
    return MODULES.find(m => m.lessons.some(l => l.id === parseInt(lessonId)));
}

// ---------- Утилиты ----------

function renderSectionTitle(text) {
    return `<div class="section-title">[ ${text} ]</div>`;
}

function renderBackButton(href, label) {
    return `<button class="btn-back" onclick="navigate('${href}')">${label}</button>`;
}

function renderSpinner() {
    return `<div class="spinner-wrap"><div class="spinner"></div></div>`;
}

function renderStars(count) {
    let html = '';
    for (let i = 0; i < 3; i++) html += i < count ? '⭐' : '☆';
    return html;
}

// ---------- User bar (auth) ----------

function renderUserBar() {
    const user = window.Auth ? Auth.getCurrentUser() : null;
    if (user) {
        const avatar = user.photoURL
            ? `<img src="${user.photoURL}" class="user-avatar" referrerpolicy="no-referrer" alt="">`
            : `<div class="user-avatar user-avatar-letter">${(user.displayName || '?')[0].toUpperCase()}</div>`;
        return `
<div class="user-bar user-bar-auth">
    ${avatar}
    <div class="user-bar-info">
        <span class="user-bar-name">${user.displayName || user.email}</span>
        <span id="sync-icon" class="sync-icon" title="Захавана ў воблаку">☁️</span>
    </div>
    <button class="btn-signout" onclick="Auth.signOut()">Выйсці</button>
</div>`;
    }
    return `
<div class="user-bar user-bar-anon">
    <span class="user-bar-anon-text">💾 Прагрэс толькі на гэтым прыладзе</span>
    <button class="btn-signin" onclick="Auth.signInWithGoogle()">
        <svg width="16" height="16" viewBox="0 0 18 18" style="vertical-align:middle;margin-right:6px"><path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/><path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/><path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/><path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z"/></svg>Увайсці праз Google
    </button>
</div>`;
}

// ---------- Главная страница ----------

function renderHome() {
    const streak   = getStreak();
    const points   = getPoints();
    const words    = getWords();
    const progress = getProgress();
    const completed = getCompletedLessonsCount();
    const pct = Math.round((completed / TOTAL_LESSONS) * 100);

    let nextLesson = 1;
    for (let i = 1; i <= TOTAL_LESSONS; i++) {
        if (!progress[i] || !progress[i].completed) { nextLesson = i; break; }
    }
    const btnLabel = completed === 0 ? 'Начать обучение' : 'Продолжить обучение';

    // Review block — show only if there are words to review
    const reviewWords = window.Repetition ? Repetition.getWordsForReview() : [];
    const reviewBlock = reviewWords.length > 0 ? `
<div class="review-banner card" onclick="navigate('#/review')">
    <span style="font-size:28px">🔄</span>
    <div class="review-banner-text">
        <strong>Час паўтарыць!</strong>
        <span>${reviewWords.length} слоў чакаюць паўтарэння</span>
    </div>
    <span class="card-arrow">→</span>
</div>` : '';

    return `
<div class="page page-home">
    ${renderUserBar()}

    <header class="home-header">
        <h1 class="logo">МОВА</h1>
        <p class="logo-sub">Самавучак беларускай мовы</p>
        <p class="logo-quote"><em>Мова — душа народа</em></p>
    </header>

    <div class="stats-row">
        <div class="stat-item">
            <span class="stat-icon">🔥</span>
            <span class="stat-value">${streak.count}</span>
            <span class="stat-label">дней</span>
        </div>
        <div class="stat-item">
            <span class="stat-icon">📚</span>
            <span class="stat-value">${words.length}</span>
            <span class="stat-label">слов</span>
        </div>
        <div class="stat-item">
            <span class="stat-icon">⭐</span>
            <span class="stat-value">${points}</span>
            <span class="stat-label">очков</span>
        </div>
    </div>

    <div class="progress-block">
        <div class="progress-bar-wrap">
            <div class="progress-bar-fill" style="width: ${pct}%"></div>
        </div>
        <p class="progress-label">${completed} из ${TOTAL_LESSONS} уроков пройдено</p>
    </div>

    <button class="btn-primary" onclick="navigate('#/lesson/${nextLesson}')">
        ${btnLabel}
    </button>

    ${reviewBlock}

    <nav class="cards-nav">
        <div class="card card-nav" onclick="navigate('#/alphabet')">
            <span class="card-icon">🔤</span>
            <div class="card-text">
                <strong>Алфавіт</strong>
                <span>Белорусский алфавит и фонетика</span>
            </div>
            <span class="card-arrow">→</span>
        </div>
        <div class="card card-nav" onclick="navigate('#/lessons')">
            <span class="card-icon">📚</span>
            <div class="card-text">
                <strong>Урокі</strong>
                <span>5 модулей, 24 урока</span>
            </div>
            <span class="card-arrow">→</span>
        </div>
        <div class="card card-nav" onclick="navigate('#/phrasebook')">
            <span class="card-icon">💬</span>
            <div class="card-text">
                <strong>Размоўнік</strong>
                <span>Готовые фразы на каждый день</span>
            </div>
            <span class="card-arrow">→</span>
        </div>
        <div class="card card-nav" onclick="navigate('#/dictionary')">
            <span class="card-icon">📖</span>
            <div class="card-text">
                <strong>Слоўнік</strong>
                <span>Все изученные слова</span>
            </div>
            <span class="card-arrow">→</span>
        </div>
        <div class="card card-nav" onclick="navigate('#/progress')">
            <span class="card-icon">📊</span>
            <div class="card-text">
                <strong>Мой прагрэс</strong>
                <span>Статистика и достижения</span>
            </div>
            <span class="card-arrow">→</span>
        </div>
    </nav>
</div>`;
}

// ---------- Список уроков ----------

function renderLessons() {
    const progress = getProgress();

    function isUnlocked(lessonId) {
        if (lessonId === 0 || lessonId === 1) return true;
        return progress[lessonId - 1] && progress[lessonId - 1].completed;
    }

    let modulesHtml = '';
    for (const module of MODULES) {
        let lessonsHtml = '';
        for (const lesson of module.lessons) {
            const unlocked = isUnlocked(lesson.id);
            const lp = progress[lesson.id] || { stars: 0, completed: false };
            const href = lesson.isAlphabet ? '#/alphabet' : `#/lesson/${lesson.id}`;

            lessonsHtml += `
<div class="card lesson-card ${unlocked ? '' : 'lesson-locked'}"
     onclick="${unlocked ? `navigate('${href}')` : ''}">
    <div class="lesson-num">${lesson.id}</div>
    <div class="lesson-info">
        <strong>${lesson.title}</strong>
        <span>${lesson.desc}</span>
    </div>
    <div class="lesson-right">
        ${unlocked
            ? `<span class="lesson-stars">${renderStars(lp.stars)}</span>`
            : `<span class="lesson-lock">🔒</span>`
        }
    </div>
</div>`;
        }

        modulesHtml += `
<section class="module-section">
    ${renderSectionTitle(module.title)}
    <div class="lessons-list">${lessonsHtml}</div>
</section>`;
    }

    return `
<div class="page page-lessons">
    <div class="page-nav">
        ${renderBackButton('#/', '← Главная')}
        <h2>Урокі</h2>
        <div></div>
    </div>
    ${modulesHtml}
</div>`;
}

// ---------- Алфавит ----------

function renderAlphabet() {
    // Загрузка запускается через triggerPageLoad() после вставки HTML в DOM
    return `
<div class="page page-alphabet">
    <div class="page-nav">
        ${renderBackButton('#/', '← Галоўная')}
        <h2>Беларускі алфавіт</h2>
        <div></div>
    </div>
    <p class="page-sub">32 літары • Навучыся чытаць па-беларуску</p>
    <div id="alphabet-content">
        ${renderSpinner()}
        <p class="loading-text">Загружаем алфавіт...</p>
    </div>
</div>`;
}

function getBasePath() {
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.protocol === 'file:') {
        return '';
    }
    return '/mova';
}

function loadAlphabetContent() {
    const el = document.getElementById('alphabet-content');
    if (!el) return;

    fetch(`${getBasePath()}/data/alphabet.json`)
        .then(r => r.json())
        .then(letters => {
            el.innerHTML = buildAlphabetHTML(letters);
            initAlphabetExercises();
        })
        .catch(() => {
            el.innerHTML = renderFetchError();
        });
}

function renderFetchError() {
    return `
<div class="fetch-error card">
    <p style="font-size:24px;margin-bottom:8px">⚠️</p>
    <p style="color:#fff;font-weight:600;margin-bottom:8px">Не удалось загрузить данные</p>
    <p style="color:var(--text-muted);font-size:14px;margin-bottom:16px">
        При открытии через <code>file://</code> браузер блокирует загрузку файлов.
        Запустите локальный сервер:
    </p>
    <div class="fetch-error-code">python -m http.server 8080</div>
    <p style="color:var(--text-muted);font-size:13px;margin-top:12px">
        Затем откройте <code>http://localhost:8080</code> в браузере.<br>
        На GitHub Pages всё работает автоматически.
    </p>
</div>`;
}

function buildAlphabetHTML(letters) {
    const grid = letters.map(l => {
        const char = l.letter.split(' ')[0];
        const audioSrc = `alphabet/${char.toLowerCase()}.mp3`;
        const safeChar = char.replace(/"/g, '&quot;');
        return `
<div class="letter-card card ${l.note ? 'letter-has-note' : ''}" onclick="toggleLetterNote(this)">
    <div class="letter-main">${char}</div>
    <div class="letter-name">${l.name}</div>
    <div class="letter-sound">${l.sound}</div>
    <div class="letter-example">${l.example}</div>
    <button class="letter-audio audio-btn audio-btn-sm"
            data-audio="${audioSrc}"
            data-text="${safeChar}"
            onclick="event.stopPropagation();playWordAudio(this)">🔊</button>
    ${l.note ? `<div class="letter-note-text">${l.note}</div>` : ''}
</div>`;
    }).join('');

    const diffRows = [
        ['Буква И',      'И и',      'І і',         'кніга (книга)'],
        ['Буква Щ',      'Щ щ',      '❌ нет',       'шчасце (счастье)'],
        ['Буква Ъ',      'Ъ ъ',      '❌ нет',       "аб'ява (объявл.)"],
        ['Уникальная Ў', '❌ нет',   'Ў ў',          'воўк (волк)'],
        ['Д перед і,е',  'ди, де',   'дзі, дзе',     'дзень (день)'],
        ['Т перед і,е',  'ти, те',   'ці, це',       'цішыня (тишина)'],
        ['Г',            'взрывной', 'фрикативный',  'гара (гора)'],
        ['Аканне',       'молоко',   'малако',       'вада (вода)'],
    ].map(([what, ru, be, ex]) => `
<tr>
    <td>${what}</td>
    <td class="diff-ru">${ru}</td>
    <td class="diff-be">${be}</td>
    <td class="diff-ex">${ex}</td>
</tr>`).join('');

    const rules = [
        {
            icon: '💡', title: 'АКАННЕ',
            text: 'Безударная О всегда пишется как А.<br>' +
                  '<strong>молоко</strong> → <span class="rule-be">малако</span> &nbsp;|&nbsp; ' +
                  '<strong>вода</strong> → <span class="rule-be">вада</span>'
        },
        {
            icon: '💡', title: 'ДЗЕКАННЕ',
            text: 'Д перед мягкими гласными (і,е,ё,ю,я) → ДЗ.<br>' +
                  '<span class="rule-be">дзень</span> (день), <span class="rule-be">дзеці</span> (дети), ' +
                  '<span class="rule-be">дзякуй</span> (спасибо)'
        },
        {
            icon: '💡', title: 'ЦЕКАННЕ',
            text: 'Т перед мягкими гласными (і,е,ё,ю,я) → Ц.<br>' +
                  '<span class="rule-be">цішыня</span> (тишина), <span class="rule-be">цёплы</span> (тёплый), ' +
                  '<span class="rule-be">цікава</span> (интересно)'
        },
        {
            icon: '💡', title: 'ФРИКАТИВНОЕ Г',
            text: 'Белорусское Г — фрикативное, как украинское. Не взрывной, а мягкий выдох.<br>' +
                  '<span class="rule-be">гара</span> (гора), <span class="rule-be">горад</span> (город)'
        },
    ].map(r => `
<div class="rule-block card">
    <div class="rule-title">${r.icon} ${r.title}</div>
    <p class="rule-text">${r.text}</p>
</div>`).join('');

    const exSlots = [0,1,2,3,4,5].map(i =>
        `<div class="alpha-ex" id="alpha-ex-${i}"></div>`
    ).join('');

    return `
<div class="intro-block">
    Белорусский алфавит состоит из <strong>32 букв</strong>. Здесь нет <strong>Щ</strong>, <strong>Ъ</strong> и <strong>И</strong>,
    но есть уникальные <strong class="text-blue">Ў</strong> и <strong class="text-blue">І</strong>.
    Д и Т перед мягкими гласными произносятся как ДЗ и Ц.
</div>

${renderSectionTitle('АЛФАВІТ')}
<div class="letter-grid">${grid}</div>

${renderSectionTitle('АДРОЗНЕННІ АД РУСКАЙ МОВЫ')}
<div class="diff-table-wrap">
    <table class="diff-table">
        <thead><tr><th>Что</th><th>Русский</th><th>Белорусский</th><th>Пример</th></tr></thead>
        <tbody>${diffRows}</tbody>
    </table>
</div>

${renderSectionTitle('ГАЛОЎНЫЯ ПРАВІЛЫ')}
<div class="rules-list">${rules}</div>

${renderSectionTitle('ПРАКТЫКА')}
<div class="alpha-exercises">${exSlots}</div>`;
}

function toggleLetterNote(card) {
    if (card.classList.contains('letter-has-note')) {
        card.classList.toggle('letter-note-open');
    }
}

function initAlphabetExercises() {
    const exercises = [
        {
            type: 'choose_translation',
            question: 'Выбери букву, которой НЕТ в русском алфавите:',
            options: ['А', 'Ў', 'Б', 'К'],
            correct: 1,
            explanation: 'Верно! Ў (у краткое) — уникальная белорусская буква.'
        },
        {
            type: 'choose_translation',
            question: "Как произносится Д в слове 'дзень'?",
            options: ['Д', 'ДЗ', 'Ц', 'З'],
            correct: 1,
            explanation: 'Верно! Перед мягкими гласными Д → ДЗ — это дзеканне.'
        },
        {
            type: 'choose_translation',
            question: "Как будет 'молоко' по-белорусски?",
            options: ['молоко', 'малоко', 'малако', 'молако'],
            correct: 2,
            explanation: 'Верно! Безударная О → А — это аканне.'
        },
        {
            type: 'choose_translation',
            question: "Какой буквы НЕТ в белорусском алфавите?",
            options: ['Ё', 'Щ', 'Ў', 'І'],
            correct: 1,
            explanation: 'Верно! Вместо Щ пишется ШЧ: шчасце (счастье).'
        },
        {
            type: 'choose_translation',
            question: "Как произносится Т в слове 'цікава'?",
            options: ['Т', 'Д', 'Ц', 'ДЗ'],
            correct: 2,
            explanation: 'Верно! Т перед мягкими гласными → Ц — цеканне.'
        },
        {
            type: 'match_pairs',
            instruction: 'Соедини белорусское слово с переводом:',
            pairs: [
                { left: 'кніга',  right: 'книга' },
                { left: 'дзень',  right: 'день' },
                { left: 'вада',   right: 'вода' },
                { left: 'малако', right: 'молоко' },
            ]
        }
    ];

    let current = 0;

    function showNext() {
        if (current >= exercises.length) return;
        const container = document.getElementById(`alpha-ex-${current}`);
        if (!container) return;
        renderExercise(container, exercises[current], () => {
            current++;
            setTimeout(showNext, 300);
        });
    }

    showNext();
}

// ---------- Урок ----------

function renderLesson(id) {
    const lesson = getLessonById(id);
    if (!lesson) {
        return `<div class="page"><p class="error-text">Урок не найден</p></div>`;
    }

    const module = getModuleForLesson(id);
    const moduleNum = module ? module.id : '?';
    const prevId = parseInt(id) > 1 ? parseInt(id) - 1 : null;
    const nextId = parseInt(id) < TOTAL_LESSONS ? parseInt(id) + 1 : null;

    // Загрузка запускается через triggerPageLoad() после вставки HTML в DOM
    return `
<div class="page page-lesson">
    <div class="page-nav">
        ${renderBackButton('#/lessons', '← Урокі')}
        <button class="btn-hint" title="Подсказка" onclick="showAudioStub()">?</button>
    </div>

    <div class="lesson-header">
        <h2>${lesson.title}</h2>
        <p class="lesson-meta">МОДУЛЬ ${moduleNum} • Урок ${id} из ${TOTAL_LESSONS}</p>
        <div class="progress-bar-wrap lesson-progress">
            <div class="progress-bar-fill" id="lesson-progress-bar" style="width: 0%"></div>
        </div>
    </div>

    <div id="lesson-content">
        ${renderSpinner()}
        <p class="loading-text">Загружаем урок...</p>
    </div>

    <div class="lesson-footer" id="lesson-footer" style="display:none">
        ${prevId !== null ? `<button class="btn-secondary" onclick="navigate('#/lesson/${prevId}')">← Предыдущий</button>` : '<div></div>'}
        ${nextId !== null ? `<button class="btn-primary" onclick="navigate('#/lesson/${nextId}')">Следующий →</button>` : '<div></div>'}
    </div>
</div>`;
}

function loadLessonContent(id) {
    const contentEl = document.getElementById('lesson-content');
    if (!contentEl) return;

    const num = String(id).padStart(2, '0');
    fetch(`${getBasePath()}/data/lesson-${num}.json`)
        .then(r => { if (!r.ok) throw new Error('not found'); return r.json(); })
        .then(data => buildLessonUI(id, data, contentEl))
        .catch(() => {
            contentEl.innerHTML = `
            <div class="content-placeholder" style="min-height:200px">
                <p class="loading-text">Контент этого урока ещё не готов.</p>
                <p style="color:var(--text-muted);font-size:13px;text-align:center;margin-top:8px">Он появится в следующем обновлении!</p>
            </div>`;
            const footer = document.getElementById('lesson-footer');
            if (footer) footer.style.display = 'flex';
        });
}

// ---------- UI урока ----------

function buildLessonUI(lessonId, data, contentEl) {
    const sections = data.sections || [];
    let currentSection = 0;
    let totalPoints = 0;

    const wrapper = document.createElement('div');
    wrapper.className = 'lesson-sections';
    contentEl.innerHTML = '';
    contentEl.appendChild(wrapper);

    function updateProgress() {
        const pct = Math.round((currentSection / (sections.length + 1)) * 100);
        const bar = document.getElementById('lesson-progress-bar');
        if (bar) bar.style.width = pct + '%';
    }

    function showSection(idx) {
        if (idx >= sections.length) {
            if (data.finalTest) showFinalTest();
            else finishLesson(totalPoints, 2);
            return;
        }

        const section = sections[idx];
        const el = document.createElement('div');
        el.className = 'lesson-section-item fade-in';
        el.innerHTML = buildSectionHTML(section, lessonId);
        wrapper.appendChild(el);
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);

        if (section.type === 'exercise') {
            const exContainer = el.querySelector('.section-exercise-container');
            if (exContainer && section.exercise) {
                renderExercise(exContainer, section.exercise, (result) => {
                    totalPoints += result.points || 0;
                    currentSection++;
                    updateProgress();
                    setTimeout(() => showSection(currentSection), 300);
                });
            }
        } else {
            const nextBtn = el.querySelector('.section-next-btn');
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    nextBtn.disabled = true;
                    currentSection++;
                    updateProgress();
                    showSection(currentSection);
                });
            } else {
                // Нет кнопки — авто-продолжение
                currentSection++;
                updateProgress();
                showSection(currentSection);
            }
        }
    }

    function showFinalTest() {
        const testEl = document.createElement('div');
        testEl.className = 'lesson-section-item fade-in';
        testEl.innerHTML = `<div class="section-title-wrap">${renderSectionTitle('ФІНАЛЬНЫ ТЭСТ')}</div>`;
        const testContainer = document.createElement('div');
        testEl.appendChild(testContainer);
        wrapper.appendChild(testEl);
        setTimeout(() => testEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);

        renderFinalTest(testContainer, data.finalTest.questions, (result) => {
            totalPoints += result.points || 0;
            finishLesson(totalPoints, result.stars);
        });
    }

    function finishLesson(points, stars) {
        setLessonProgress(lessonId, stars);
        // Слова урока → словарь
        sections
            .filter(s => s.type === 'words')
            .forEach(s => {
                (s.words || []).forEach(w => addWord({ word: w.be, translation: w.ru, lessonId }));
            });

        const bar = document.getElementById('lesson-progress-bar');
        if (bar) bar.style.width = '100%';

        const resultEl = document.createElement('div');
        resultEl.className = 'lesson-section-item fade-in lesson-complete';
        resultEl.innerHTML = `
        <div class="complete-block card">
            <div class="complete-stars">${renderStars(stars)}</div>
            <h3>Урок пройден!</h3>
            <p style="color:var(--text-muted)">Заработано: <strong style="color:#fff">+${points} очков</strong></p>
            <div style="display:flex;flex-direction:column;gap:12px;margin-top:16px">
                <button class="btn-primary" onclick="navigate('#/lessons')">К списку уроков</button>
                ${lessonId < TOTAL_LESSONS
                    ? `<button class="btn-secondary" onclick="navigate('#/lesson/${lessonId + 1}')">Следующий урок →</button>`
                    : ''
                }
            </div>
        </div>`;
        wrapper.appendChild(resultEl);
        setTimeout(() => resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    }

    updateProgress();
    showSection(0);
}

// ---------- Секции урока ----------

function buildSectionHTML(section, lessonId) {
    switch (section.type) {

        case 'intro':
            return `
<div class="section-intro card">
    <p>${section.content}</p>
    <button class="btn-primary section-next-btn" style="margin-top:16px">Начать урок →</button>
</div>`;

        case 'words': {
            const wordsHtml = (section.words || []).map(w => `
<div class="word-item card">
    <div class="word-top">
        <div class="word-left">
            <div class="word-be">${w.be}</div>
            ${w.transcription ? `<div class="word-transcription">${w.transcription}</div>` : ''}
        </div>
        <button class="audio-btn audio-btn-sm" data-audio="${w.audio || ''}" data-text="${w.be}" onclick="playWordAudio(this)">🔊</button>
    </div>
    <div class="word-ru">${w.ru}</div>
    ${w.example && w.example.be ? `<div class="word-example"><span class="word-ex-be">${w.example.be}</span> — <span class="word-ex-ru">${w.example.ru}</span></div>` : ''}
    ${w.note ? `<span class="word-note">${w.note}</span>` : ''}
</div>`).join('');

            return `
<div class="section-words">
    ${renderSectionTitle(section.title)}
    <div class="words-grid">${wordsHtml}</div>
    <button class="btn-secondary section-next-btn" style="margin-top:8px;width:100%">Продолжить →</button>
</div>`;
        }

        case 'exercise':
            return `<div class="section-exercise">
                <div class="section-exercise-container"></div>
            </div>`;

        case 'grammar':
            return `
<div class="section-grammar">
    <div class="grammar-block">
        <div class="grammar-title">📚 ${section.title}</div>
        <p class="grammar-text">${(section.content || '').replace(/\n/g, '<br>')}</p>
    </div>
    ${section.tip ? `<div class="tip-block">💡 ${section.tip}</div>` : ''}
    <button class="btn-secondary section-next-btn" style="margin-top:8px;width:100%">Понятно →</button>
</div>`;

        case 'dialogue': {
            const linesHtml = (section.lines || []).map((line, idx) => {
                const char = line.character || line.speaker || '?';
                const avatar = char.charAt(0).toUpperCase();
                return `
<div class="dialogue-line" data-index="${idx}">
    <div class="dialogue-avatar avatar-${avatar.toLowerCase()}">${avatar}</div>
    <div class="dialogue-bubble">
        <div class="dialogue-name">${char}</div>
        <div class="dialogue-be">${line.be}
            <button class="audio-btn audio-btn-sm" data-text="${line.be.replace(/"/g, '&quot;')}" onclick="playWordAudio(this)" style="margin-left:6px;vertical-align:middle">🔊</button>
        </div>
        <div class="dialogue-ru hidden">${line.ru}</div>
    </div>
</div>`;
            }).join('');

            return `
<div class="section-dialogue">
    ${renderSectionTitle(section.title || 'ДЫЯЛОГ')}
    <div class="dialogue-wrap">${linesHtml}</div>
    <div style="display:flex;gap:8px;margin-top:12px">
        <button class="btn-secondary" style="flex:1" onclick="toggleDialogueTranslation(this)">👁 Показать перевод</button>
        <button class="btn-secondary" style="flex:1" onclick="playDialogSequence(this)">🔊 Послушать</button>
    </div>
    <button class="btn-secondary section-next-btn" style="margin-top:8px;width:100%">Продолжить →</button>
</div>`;
        }

        case 'fun_fact':
            return `
<div class="fun-fact-block card">
    <div class="fun-fact-flag">${section.flag || '🇧🇾'}</div>
    <div class="fun-fact-be">${section.be}
        <button class="audio-btn audio-btn-sm" data-text="${(section.be || '').replace(/"/g, '&quot;')}" onclick="playWordAudio(this)" style="margin-left:8px;vertical-align:middle">🔊</button>
    </div>
    <div class="fun-fact-ru">${section.ru}</div>
    <button class="btn-secondary section-next-btn" style="margin-top:12px;width:100%">Интересно! →</button>
</div>`;

        case 'review':
            return `
<div class="section-review card">
    <h3 style="color:#fff;margin-bottom:8px">🎉 ${section.title || 'Повторение'}</h3>
    <p style="color:var(--text-muted)">${section.content || ''}</p>
</div>`;

        default:
            return `<div class="card" style="color:var(--text-muted);padding:16px">Секция: ${section.type}</div>`;
    }
}

// ---------- Аудио-хелперы ----------

function playWordAudio(btn) {
    const audio = btn.dataset.audio;
    const text = btn.dataset.text;
    if (audio) {
        AudioPlayer.play(audio, btn);
    } else if (text) {
        btn.classList.add('playing');
        AudioPlayer.speakFallback(text);
        setTimeout(() => btn.classList.remove('playing'), 1500);
    }
}

function playDialogSequence(btn) {
    const wrap = btn.closest('.section-dialogue').querySelector('.dialogue-wrap');
    const lines = [...wrap.querySelectorAll('.dialogue-be')].map(el => el.firstChild?.textContent?.trim() || el.textContent.trim());
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    lines.forEach(text => {
        const utt = new SpeechSynthesisUtterance(text);
        utt.lang = 'uk-UA';
        utt.rate = 0.85;
        window.speechSynthesis.speak(utt);
    });
}

function toggleDialogueTranslation(btn) {
    const wrap = btn.closest('.section-dialogue').querySelector('.dialogue-wrap');
    const ruEls = wrap.querySelectorAll('.dialogue-ru');
    const hidden = ruEls[0]?.classList.contains('hidden');
    ruEls.forEach(el => el.classList.toggle('hidden'));
    btn.textContent = hidden ? '👁 Скрыть перевод' : '👁 Показать перевод';
}

// ---------- Словарь ----------

let _dictWords = null;
let _dictFilter = { lesson: 'all', status: 'all', query: '' };

function renderDictionary() {
    const stats = window.Dictionary ? Dictionary.getStats() : { mastered: 0, learning: 0, total: 0 };
    return `
<div class="page page-dictionary">
    <div class="page-nav">
        ${renderBackButton('#/', '← Галоўная')}
        <h2>Слоўнік</h2>
        <div></div>
    </div>
    <div class="dict-stats">
        <div class="dict-stat-card"><span class="dict-stat-val" style="color:#22c55e">${stats.mastered}</span><span class="dict-stat-lbl">🟢 вывучана</span></div>
        <div class="dict-stat-card"><span class="dict-stat-val" style="color:#f59e0b">${stats.learning}</span><span class="dict-stat-lbl">🟡 вывучаецца</span></div>
        <div class="dict-stat-card"><span class="dict-stat-val" style="color:#00d4ff">${stats.total}</span><span class="dict-stat-lbl">🔵 усяго</span></div>
    </div>
    <div class="search-wrap">
        <span class="search-icon">🔍</span>
        <input type="text" id="dict-search" class="search-input" placeholder="Шукаць слова..." oninput="dictSearch(this.value)">
    </div>
    <div class="filter-tags" id="dict-filters">
        <button class="tag tag-active" onclick="dictFilterLesson('all',this)">Усе</button>
        <button class="tag" onclick="dictFilterStatus('mastered',this)">⭐ Вывучаныя</button>
        <button class="tag" onclick="dictFilterStatus('new',this)">📝 Новыя</button>
    </div>
    <div id="dict-content">${renderSpinner()}<p class="loading-text" style="text-align:center;margin-top:8px">Загружаем слоўнік...</p></div>
</div>`;
}

function renderDictWordCard(w) {
    const statusHtml = w.mastered
        ? `<span style="color:#22c55e;font-size:12px">⭐ Вывучана</span>`
        : w.timesCorrect > 0 ? `<span style="color:#f59e0b;font-size:12px">📝 Вывучаецца</span>` : '';
    const locked = !w.unlocked;
    return `
<div class="dict-word-card card ${locked ? 'dict-word-locked' : ''}">
    <button class="audio-btn audio-btn-sm" data-audio="${w.audio||''}" data-text="${w.be.replace(/"/g,'&quot;')}" onclick="playWordAudio(this)">🔊</button>
    <div class="dict-word-body">
        <div class="dict-word-be">${w.be}${w.transcription?` <span class="dict-word-tr">${w.transcription}</span>`:''}</div>
        <div class="dict-word-ru">${w.ru}</div>
        <div class="dict-word-meta"><span class="dict-lesson-tag">📚 Урок ${w.lesson}</span>${statusHtml}</div>
    </div>
    ${locked ? '<span style="font-size:18px;flex-shrink:0">🔒</span>' : ''}
</div>`;
}

function renderDictWords(words) {
    const el = document.getElementById('dict-content');
    if (!el) return;
    if (!words || words.length === 0) {
        el.innerHTML = `<div class="empty-state"><p>🔍</p><p>Нічога не знойдзена</p></div>`;
        return;
    }
    let shown = 30;
    function renderBatch() {
        el.innerHTML = words.slice(0, shown).map(renderDictWordCard).join('') +
            (shown < words.length ? `<div id="dict-sentinel" style="height:1px"></div>` : '');
        const sentinel = document.getElementById('dict-sentinel');
        if (sentinel) {
            const obs = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting) { obs.disconnect(); shown = Math.min(shown+30, words.length); renderBatch(); }
            });
            obs.observe(sentinel);
        }
    }
    renderBatch();
}

function dictApplyFilters() {
    if (!_dictWords) return;
    let words = [..._dictWords];
    if (_dictFilter.lesson !== 'all') words = words.filter(w => String(w.lesson) === String(_dictFilter.lesson));
    if (_dictFilter.status === 'mastered') words = words.filter(w => w.mastered);
    if (_dictFilter.status === 'new') words = words.filter(w => !w.timesCorrect);
    if (_dictFilter.query) {
        const q = _dictFilter.query.toLowerCase();
        words = words.filter(w => w.be.toLowerCase().includes(q) || w.ru.toLowerCase().includes(q));
    }
    renderDictWords(words);
}

function dictSearch(q) { _dictFilter.query = q; dictApplyFilters(); }

function dictFilterLesson(val, btn) {
    _dictFilter.lesson = val; _dictFilter.status = 'all';
    document.querySelectorAll('#dict-filters .tag').forEach(t => t.classList.remove('tag-active'));
    btn.classList.add('tag-active');
    dictApplyFilters();
}

function dictFilterStatus(val, btn) {
    _dictFilter.status = val; _dictFilter.lesson = 'all';
    document.querySelectorAll('#dict-filters .tag').forEach(t => t.classList.remove('tag-active'));
    btn.classList.add('tag-active');
    dictApplyFilters();
}

function loadDictionaryContent() {
    _dictFilter = { lesson: 'all', status: 'all', query: '' };
    if (!window.Dictionary) return;
    Dictionary.loadAllWords().then(words => {
        _dictWords = words;
        if (words.length === 0) {
            const el = document.getElementById('dict-content');
            if (el) el.innerHTML = `<div class="empty-state"><p style="font-size:48px">📖</p><p>Слоўнік пакуль пусты</p><p class="empty-sub">Пачніце вывучаць урокі, і тут з'явяцца вашы словы!</p><button class="btn-primary" style="margin-top:16px" onclick="navigate('#/lesson/1')">Пачаць урок 1 →</button></div>`;
            return;
        }
        const lessons = [...new Set(words.map(w => w.lesson))].sort((a,b)=>a-b);
        const filtersEl = document.getElementById('dict-filters');
        if (filtersEl) {
            filtersEl.innerHTML = `<button class="tag tag-active" onclick="dictFilterLesson('all',this)">Усе</button><button class="tag" onclick="dictFilterStatus('mastered',this)">⭐ Вывучаныя</button><button class="tag" onclick="dictFilterStatus('new',this)">📝 Новыя</button>` +
                lessons.map(n => `<button class="tag" onclick="dictFilterLesson('${n}',this)">Урок ${n}</button>`).join('');
        }
        dictApplyFilters();
    }).catch(() => { const el = document.getElementById('dict-content'); if (el) el.innerHTML = renderFetchError(); });
}

function renderWordsList(words) { return words.map(renderDictWordCard).join(''); }
function filterDictByLesson(f, btn) { dictFilterLesson(f, btn); }

// ---------- Разговорник ----------

let _phrasebookData = null;

function renderPhrasebook() {
    return `
<div class="page page-phrasebook">
    <div class="page-nav">
        ${renderBackButton('#/', '← Галоўная')}
        <h2>Размоўнік</h2>
        <div></div>
    </div>
    <p class="page-sub">Гатовыя фразы на кожны дзень</p>
    <div class="search-wrap" style="margin-bottom:12px">
        <span class="search-icon">🔍</span>
        <input type="text" class="search-input" placeholder="Шукаць фразу..." oninput="phrasebookSearch(this.value)">
    </div>
    <div id="phrasebook-content">${renderSpinner()}<p class="loading-text" style="text-align:center;margin-top:8px">Загружаем...</p></div>
</div>`;
}

function renderPhrasebookCategory(catId) {
    return `
<div class="page page-phrasebook">
    <div class="page-nav">
        ${renderBackButton('#/phrasebook', '← Размоўнік')}
        <h2 id="pb-cat-title">...</h2>
        <div></div>
    </div>
    <div id="phrasebook-content">${renderSpinner()}</div>
</div>`;
}

function loadPhrasebookContent(catId) {
    const base = getBasePath();
    fetch(`${base}/data/phrasebook.json`)
        .then(r => r.json())
        .then(data => {
            _phrasebookData = data;
            const el = document.getElementById('phrasebook-content');
            if (!el) return;
            if (catId) {
                const cat = data.categories.find(c => c.id === catId);
                if (!cat) { el.innerHTML = renderFetchError(); return; }
                const titleEl = document.getElementById('pb-cat-title');
                if (titleEl) titleEl.textContent = cat.title;
                el.innerHTML = cat.phrases.map(p => renderPhraseCard(p)).join('');
            } else {
                el.innerHTML = data.categories.map(c => `
<div class="card card-nav" onclick="navigate('#/phrasebook/${c.id}')">
    <span class="card-icon" style="font-size:28px">${c.icon}</span>
    <div class="card-text">
        <strong>${c.title}</strong>
        <span>${c.titleRu} · ${c.phrases.length} фраз</span>
    </div>
    <span class="card-arrow">→</span>
</div>`).join('');
            }
        })
        .catch(() => {
            const el = document.getElementById('phrasebook-content');
            if (el) el.innerHTML = renderFetchError();
        });
}

function renderPhraseCard(p) {
    const safe = p.be.replace(/'/g,'&#39;').replace(/"/g,'&quot;');
    return `
<div class="phrase-card card" onclick="copyPhrase('${safe}')">
    <button class="audio-btn audio-btn-sm" data-text="${p.be.replace(/"/g,'&quot;')}" onclick="event.stopPropagation();playWordAudio(this)">🔊</button>
    <div class="phrase-body">
        <div class="phrase-be">${p.be}</div>
        <div class="phrase-ru">${p.ru}</div>
    </div>
</div>`;
}

function copyPhrase(text) {
    navigator.clipboard.writeText(text).then(() => {
        if (window.Notifications) Notifications.copied();
    }).catch(() => {});
}

function phrasebookSearch(q) {
    if (!_phrasebookData) return;
    const el = document.getElementById('phrasebook-content');
    if (!el) return;
    if (!q) {
        el.innerHTML = _phrasebookData.categories.map(c => `
<div class="card card-nav" onclick="navigate('#/phrasebook/${c.id}')">
    <span class="card-icon" style="font-size:28px">${c.icon}</span>
    <div class="card-text"><strong>${c.title}</strong><span>${c.titleRu} · ${c.phrases.length} фраз</span></div>
    <span class="card-arrow">→</span>
</div>`).join('');
        return;
    }
    const ql = q.toLowerCase();
    const results = [];
    for (const cat of _phrasebookData.categories) {
        for (const p of cat.phrases) {
            if (p.be.toLowerCase().includes(ql) || p.ru.toLowerCase().includes(ql)) {
                results.push({ ...p, catTitle: cat.title, catIcon: cat.icon });
            }
        }
    }
    if (results.length === 0) { el.innerHTML = `<div class="empty-state"><p>🔍</p><p>Нічога не знойдзена</p></div>`; return; }
    el.innerHTML = results.map(p => `
<div class="phrase-card card" onclick="copyPhrase('${p.be.replace(/'/g,"&#39;")}')">
    <button class="audio-btn audio-btn-sm" data-text="${p.be.replace(/"/g,'&quot;')}" onclick="event.stopPropagation();playWordAudio(this)">🔊</button>
    <div class="phrase-body">
        <div class="phrase-be">${p.be}</div>
        <div class="phrase-ru">${p.ru}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px">${p.catIcon} ${p.catTitle}</div>
    </div>
</div>`).join('');
}

// ---------- Прогресс ----------

function renderProgress() {
    const streak    = getStreak();
    const points    = getPoints();
    const savedWords = getWords();
    const completed = getCompletedLessonsCount();
    const pct = Math.round((completed / TOTAL_LESSONS) * 100);
    const progress  = getProgress();

    const dictStats = window.Dictionary ? Dictionary.getStats() : { mastered: 0, learning: savedWords.length, total: savedWords.length };
    const wordsTotal = dictStats.total || savedWords.length;

    const ACHIEVEMENTS = [
        { icon:'🏆', title:'Першы крок',      desc:'Пройдзі першы ўрок',          done: completed >= 1 },
        { icon:'🏆', title:'Дзесятка',         desc:'Вывучы 10 слоў',              done: wordsTotal >= 10 },
        { icon:'🏆', title:'Палова шляху',     desc:'Пройдзі 12 урокаў',           done: completed >= 12 },
        { icon:'🏆', title:'Сотня',            desc:'Вывучы 100 слоў',             done: wordsTotal >= 100 },
        { icon:'🏆', title:'Тыднёвы страйк',   desc:'7 дзён запар',                done: streak.count >= 7 },
        { icon:'🏆', title:'Месяцавы страйк',  desc:'30 дзён запар',               done: streak.count >= 30 },
        { icon:'🏆', title:'Ведаю алфавіт',    desc:'Пройдзі ўрок алфавіту',       done: !!(progress[0] && progress[0].completed) },
        { icon:'🏆', title:'Трыста слоў',      desc:'Вывучы 300 слоў',             done: wordsTotal >= 300 },
        { icon:'🏆', title:'Выдатнік',         desc:'3 зоркі ў 10 уроках',         done: Object.values(progress).filter(v => v.stars >= 3).length >= 10 },
        { icon:'🏆', title:'Курс завершаны',   desc:'Пройдзі ўсе 24 урокі',        done: completed >= TOTAL_LESSONS },
        { icon:'🏆', title:'Паліглот',         desc:'Вывучы 400 слоў',             done: wordsTotal >= 400 },
        { icon:'🏆', title:'Бездакорны',       desc:'5 тэстаў на 100%',            done: Object.values(progress).filter(v => v.stars >= 3).length >= 5 },
    ];

    // Прогресс по урокам
    const lessonsHtml = ALL_LESSONS.filter(l => l.id > 0).map(l => {
        const lp = progress[l.id] || { stars: 0, completed: false };
        const borderClass = lp.completed ? 'style="border-color:#22c55e40"' : lp.stars > 0 ? 'style="border-color:#00d4ff30"' : '';
        return `
<div class="card" ${borderClass} style="display:flex;align-items:center;gap:12px;padding:10px 14px;margin-bottom:8px">
    <span style="color:var(--text-muted);font-size:13px;width:24px;text-align:center;flex-shrink:0">${l.id}</span>
    <span style="flex:1;font-size:14px">${l.title}</span>
    <span style="flex-shrink:0">${renderStars(lp.stars)}</span>
</div>`;
    }).join('');

    // Активность за последние 30 дней
    const activity = getActivityLog();
    const today = new Date();
    const cells = Array.from({length: 30}, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (29 - i));
        const key = d.toISOString().slice(0, 10);
        const active = activity[key] > 0;
        return `<div class="activity-cell ${active ? 'activity-active' : ''}" title="${key}"></div>`;
    }).join('');
    const activeDays = Object.values(activity).filter(v => v > 0).length;

    return `
<div class="page page-progress">
    <div class="page-nav">
        ${renderBackButton('#/', '← Галоўная')}
        <h2>Мой прагрэс</h2>
        <div></div>
    </div>

    <div class="stats-grid">
        <div class="stat-card card">
            <span class="stat-card-icon">🔥</span>
            <span class="stat-card-value">${streak.count}</span>
            <span class="stat-card-label">дзён запар</span>
        </div>
        <div class="stat-card card">
            <span class="stat-card-icon">📚</span>
            <span class="stat-card-value">${wordsTotal}</span>
            <span class="stat-card-label">слоў вывучана</span>
        </div>
        <div class="stat-card card">
            <span class="stat-card-icon">⭐</span>
            <span class="stat-card-value">${points}</span>
            <span class="stat-card-label">ачкоў</span>
        </div>
        <div class="stat-card card">
            <span class="stat-card-icon">📖</span>
            <span class="stat-card-value">${completed}</span>
            <span class="stat-card-label">урокаў з ${TOTAL_LESSONS}</span>
        </div>
    </div>

    <div class="progress-block">
        <div class="progress-bar-wrap progress-bar-lg">
            <div class="progress-bar-fill" style="width:${pct}%"></div>
        </div>
        <p class="progress-label">${completed} з ${TOTAL_LESSONS} урокаў пройдзена (${pct}%)</p>
    </div>

    ${renderSectionTitle('УРОКІ')}
    <div style="margin-bottom:16px">${lessonsHtml}</div>

    ${renderSectionTitle('ДАСЯГНЕННІ')}
    <div class="achievements-grid">
        ${ACHIEVEMENTS.map(a => `
        <div class="achievement card ${a.done ? 'achievement-done' : 'achievement-locked'}">
            <span class="achievement-icon">${a.icon}</span>
            <strong>${a.title}</strong>
            <span>${a.desc}</span>
        </div>`).join('')}
    </div>

    ${renderSectionTitle('ГРАФІК АКТЫЎНАСЦІ')}
    <div class="activity-grid">${cells}</div>
    <p class="progress-label" style="margin-top:8px">Актыўных дзён: ${activeDays} з 30</p>
</div>`;
}

// ---------- Повторение ----------

function renderReview() {
    if (!window.Repetition) return render404();
    const words = Repetition.getWordsForReview();
    if (words.length === 0) {
        return `
<div class="page">
    <div class="page-nav">${renderBackButton('#/', '← Галоўная')}<h2>Паўтарэнне</h2><div></div></div>
    <div class="empty-state" style="padding:40px 0">
        <p style="font-size:48px">🎉</p>
        <p>Пакуль няма слоў для паўтарэння!</p>
        <p class="empty-sub">Вывучайце новыя ўрокі — і тут з'явяцца заданні.</p>
        <button class="btn-primary" style="margin-top:16px" onclick="navigate('#/lessons')">Да ўрокаў →</button>
    </div>
</div>`;
    }
    const exercises = Repetition.generateExercises(words);
    return `
<div class="page page-review">
    <div class="page-nav">${renderBackButton('#/', '← Галоўная')}<h2>🔄 Паўтарэнне</h2><div></div></div>
    <p class="page-sub">${words.length} слоў для паўтарэння</p>
    <div id="review-progress-bar" class="progress-bar-wrap" style="margin-bottom:16px"><div class="progress-bar-fill" id="review-pb-fill" style="width:0%"></div></div>
    <p id="review-counter" class="progress-label">Слова 1 з ${exercises.length}</p>
    <div id="review-container"></div>
</div>`;
}

function loadReviewContent() {
    if (!window.Repetition) return;
    const words = Repetition.getWordsForReview();
    if (words.length === 0) return;
    const exercises = Repetition.generateExercises(words);
    const container = document.getElementById('review-container');
    if (!container) return;

    let current = 0, correct = 0;

    function showNext() {
        if (current >= exercises.length) {
            showReviewResult(correct, exercises.length);
            return;
        }
        const ex = exercises[current];
        const pct = Math.round((current / exercises.length) * 100);
        const pbFill = document.getElementById('review-pb-fill');
        const counter = document.getElementById('review-counter');
        if (pbFill) pbFill.style.width = pct + '%';
        if (counter) counter.textContent = `Слова ${current + 1} з ${exercises.length}`;

        if (ex.type === 'flashcard') {
            container.innerHTML = `
<div class="ex-box">
    <p class="ex-question">Памятаеш гэтае слова?</p>
    <div class="flashcard-scene" id="fc-scene"><div class="flashcard" id="fc-card">
        <div class="flashcard-front"><p class="fc-text">${ex.front}</p><button class="fc-audio-btn">🔊</button></div>
        <div class="flashcard-back"><p class="fc-text">${ex.back}</p></div>
    </div></div>
    <button class="btn-secondary" id="fc-flip" style="width:100%;margin-bottom:12px">Паказаць пераклад</button>
    <div id="fc-actions" style="display:none;gap:12px">
        <button class="btn-fc-no" id="fc-no">❌ Не памятаю</button>
        <button class="btn-fc-yes" id="fc-yes">✅ Памятаю</button>
    </div>
</div>`;
            container.querySelector('.fc-audio-btn').onclick = () => AudioPlayer.speakFallback(ex.front);
            container.querySelector('#fc-flip').onclick = () => {
                document.getElementById('fc-card').classList.add('flipped');
                document.getElementById('fc-flip').style.display = 'none';
                document.getElementById('fc-actions').style.display = 'flex';
            };
            container.querySelector('#fc-yes').onclick = () => { Repetition.recordResult(ex.word, true); correct++; current++; showNext(); };
            container.querySelector('#fc-no').onclick  = () => { Repetition.recordResult(ex.word, false); current++; showNext(); };
        } else {
            renderExercise(container, ex, ({correct: isCorrect}) => {
                Repetition.recordResult(ex.word, isCorrect);
                if (isCorrect) correct++;
                current++;
                setTimeout(showNext, 300);
            });
        }
    }

    showNext();
}

function showReviewResult(correct, total) {
    const container = document.getElementById('review-container');
    if (!container) return;
    const pct = Math.round((correct / total) * 100);
    const [color, emoji, msg] = pct >= 80
        ? ['#22c55e', '🎉', 'Выдатна!']
        : pct >= 50
            ? ['#f59e0b', '👍', 'Добра!']
            : ['#ef4444', '📚', 'Трэба яшчэ папрацаваць.'];
    const pbFill = document.getElementById('review-pb-fill');
    if (pbFill) pbFill.style.width = '100%';
    container.innerHTML = `
<div class="ex-box" style="text-align:center;padding:32px 16px">
    <p style="font-size:48px;margin-bottom:8px">${emoji}</p>
    <p style="color:${color};font-size:20px;font-weight:700;margin-bottom:8px">${msg} ${correct} з ${total} правільна!</p>
    <div style="display:flex;gap:12px;margin-top:24px">
        <button class="btn-secondary" style="flex:1" onclick="navigate('#/review')">Паўтарыць яшчэ</button>
        <button class="btn-primary" style="flex:1" onclick="navigate('#/')">На галоўную</button>
    </div>
</div>`;
    if (window.Notifications) Notifications.success(`${emoji} ${correct} з ${total} правільна!`);
    checkAchievements();
}

// ---------- Post-render hook (вызывается из app.js после вставки HTML) ----------

function triggerPageLoad(hash) {
    if (hash === '#/alphabet') {
        loadAlphabetContent();
    } else if (hash.startsWith('#/lesson/')) {
        const id = hash.replace('#/lesson/', '');
        loadLessonContent(id);
    } else if (hash === '#/dictionary') {
        loadDictionaryContent();
    } else if (hash === '#/phrasebook') {
        loadPhrasebookContent(null);
    } else if (hash.startsWith('#/phrasebook/')) {
        const catId = hash.replace('#/phrasebook/', '');
        loadPhrasebookContent(catId);
    } else if (hash === '#/review') {
        loadReviewContent();
    }
    // Log activity on every page navigation
    if (typeof logActivity === 'function') logActivity();
}

// ---------- Тест ----------

function renderTest(id) {
    const lesson = getLessonById(id);
    const title = lesson ? lesson.title : `Урок ${id}`;

    return `
<div class="page page-test">
    <div class="page-nav">
        ${renderBackButton(`#/lesson/${id}`, '← Урок')}
        <h2>Тест</h2>
        <div></div>
    </div>
    <p class="page-sub">${title}</p>
    <div class="content-placeholder">
        ${renderSpinner()}
        <p class="loading-text">Тест загружается...</p>
    </div>
</div>`;
}
