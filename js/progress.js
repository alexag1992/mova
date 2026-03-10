// ============================================================
// progress.js — работа с localStorage: прогресс, streak, очки
// ============================================================

const KEYS = {
    progress: 'mova_progress', // {0: {stars:0, completed:false}, 1: {...}, ...}
    streak:   'mova_streak',   // {count: 0, lastDate: "2024-01-01"}
    points:   'mova_points',   // число
    words:    'mova_words',    // [{word, translation, lessonId}, ...]
};

// ---------- Прогресс уроков ----------

function getProgress() {
    try {
        return JSON.parse(localStorage.getItem(KEYS.progress)) || {};
    } catch {
        return {};
    }
}

function saveProgress(data) {
    localStorage.setItem(KEYS.progress, JSON.stringify(data));
}

function getLessonProgress(lessonId) {
    const p = getProgress();
    return p[lessonId] || { stars: 0, completed: false };
}

function setLessonProgress(lessonId, stars) {
    const p = getProgress();
    p[lessonId] = { stars, completed: stars > 0 };
    saveProgress(p);
}

function getCompletedLessonsCount() {
    const p = getProgress();
    return Object.values(p).filter(v => v.completed).length;
}

// ---------- Streak ----------

function getStreak() {
    try {
        return JSON.parse(localStorage.getItem(KEYS.streak)) || { count: 0, lastDate: '' };
    } catch {
        return { count: 0, lastDate: '' };
    }
}

function updateStreak() {
    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    const streak = getStreak();

    if (streak.lastDate === today) {
        // Уже заходили сегодня — ничего не меняем
        return streak;
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    if (streak.lastDate === yesterday) {
        // Заходили вчера — продолжаем streak
        streak.count += 1;
    } else {
        // Пропустили день (или первый вход) — сбрасываем
        streak.count = 1;
    }

    streak.lastDate = today;
    localStorage.setItem(KEYS.streak, JSON.stringify(streak));
    return streak;
}

// ---------- Очки ----------

function getPoints() {
    return parseInt(localStorage.getItem(KEYS.points)) || 0;
}

function addPoints(n) {
    const current = getPoints();
    localStorage.setItem(KEYS.points, current + n);
    return current + n;
}

// ---------- Словарь изученных слов ----------

function getWords() {
    try {
        return JSON.parse(localStorage.getItem(KEYS.words)) || [];
    } catch {
        return [];
    }
}

function addWord(word) {
    const words = getWords();
    // Не добавляем дубликаты
    if (!words.find(w => w.word === word.word)) {
        words.push(word);
        localStorage.setItem(KEYS.words, JSON.stringify(words));
    }
    return words;
}

// ---------- Журнал активности ----------

function getActivityLog() {
    try {
        return JSON.parse(localStorage.getItem('mova_activity')) || {};
    } catch {
        return {};
    }
}

function logActivity() {
    const today = new Date().toISOString().slice(0, 10);
    const log = getActivityLog();
    log[today] = (log[today] || 0) + 1;
    localStorage.setItem('mova_activity', JSON.stringify(log));
}

// ---------- Достижения ----------

function checkAchievements() {
    const progress  = getProgress();
    const streak    = getStreak();
    const words     = getWords();
    const completed = getCompletedLessonsCount();
    const wordsCount = words.length;

    const checks = [
        { key: 'first_step',    done: completed >= 1,    title: 'Першы крок',    emoji: '🏆' },
        { key: 'ten_words',     done: wordsCount >= 10,  title: 'Дзесятка',      emoji: '📖' },
        { key: 'halfway',       done: completed >= 12,   title: 'Палова шляху',  emoji: '🎯' },
        { key: 'hundred_words', done: wordsCount >= 100, title: 'Сотня слоў',    emoji: '💯' },
        { key: 'week_streak',   done: streak.count >= 7, title: 'Тыднёвы страйк',emoji: '🔥' },
        { key: 'course_done',   done: completed >= 24,   title: 'Курс завершаны',emoji: '🎓' },
    ];

    const earned = JSON.parse(localStorage.getItem('mova_achievements') || '[]');
    checks.forEach(c => {
        if (c.done && !earned.includes(c.key)) {
            earned.push(c.key);
            if (window.Notifications) Notifications.achievement(`${c.emoji} ${c.title}`);
        }
    });
    localStorage.setItem('mova_achievements', JSON.stringify(earned));
}
