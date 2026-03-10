// ============================================================
// dictionary.js — загрузка и управление словарём
// ============================================================

const Dictionary = {

    /**
     * Собрать все слова из всех уроков
     * Слова из пройденных уроков — unlocked:true, остальные — unlocked:false
     */
    async loadAllWords() {
        const progress = JSON.parse(localStorage.getItem('mova_progress') || '{}');
        const savedWords = JSON.parse(localStorage.getItem('mova_words') || '[]');
        const words = [];

        for (let i = 1; i <= 24; i++) {
            try {
                const base = getBasePath();
                const response = await fetch(`${base}/data/lesson-${String(i).padStart(2, '0')}.json`);
                if (!response.ok) continue;
                const lesson = await response.json();

                const lessonKey = `lesson_${i}`;
                const isPassed = (progress[i] && progress[i].completed) ||
                                 (progress[lessonKey] && progress[lessonKey].completed);

                for (const section of lesson.sections || []) {
                    if (section.type !== 'words') continue;
                    for (const word of section.words || []) {
                        const saved = savedWords.find(w => w.be === word.be);
                        words.push({
                            be: word.be,
                            ru: word.ru,
                            transcription: word.transcription || '',
                            audio: word.audio || '',
                            lesson: i,
                            lessonTitle: lesson.title || '',
                            category: section.title || '',
                            mastered: saved ? (saved.mastered || false) : false,
                            timesCorrect: saved ? (saved.timesCorrect || 0) : 0,
                            timesWrong: saved ? (saved.timesWrong || 0) : 0,
                            lastSeen: saved ? (saved.lastSeen || null) : null,
                            unlocked: isPassed || i === 1
                        });
                    }
                }
            } catch (e) {
                console.warn(`Не удалось загрузить урок ${i}:`, e);
            }
        }
        return words;
    },

    updateWord(be, data) {
        const words = JSON.parse(localStorage.getItem('mova_words') || '[]');
        const idx = words.findIndex(w => w.be === be);
        if (idx >= 0) {
            words[idx] = { ...words[idx], ...data };
        } else {
            words.push({ be, ...data });
        }
        localStorage.setItem('mova_words', JSON.stringify(words));
    },

    getStats() {
        const words = JSON.parse(localStorage.getItem('mova_words') || '[]');
        return {
            total: words.length,
            mastered: words.filter(w => w.mastered).length,
            learning: words.filter(w => !w.mastered && w.timesCorrect > 0).length,
            new: words.filter(w => w.timesCorrect === 0).length
        };
    }
};

window.Dictionary = Dictionary;
