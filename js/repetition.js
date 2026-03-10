// ============================================================
// repetition.js — система интервального повторения
// ============================================================

const Repetition = {

    getWordsForReview() {
        const allWords = JSON.parse(localStorage.getItem('mova_words') || '[]');
        const now = Date.now();
        const seenWords = allWords.filter(w => w.lastSeen);
        if (seenWords.length === 0) return [];

        const scored = seenWords.map(w => {
            const daysSince = (now - (w.lastSeen || 0)) / (1000 * 60 * 60 * 24);
            const errorRate = w.timesWrong / Math.max(1, (w.timesCorrect || 0) + (w.timesWrong || 0));
            const totalAttempts = (w.timesCorrect || 0) + (w.timesWrong || 0);
            let score = 0;
            score += errorRate * 50;
            score += Math.min(daysSince, 30) * 2;
            score += Math.max(0, 10 - totalAttempts) * 3;
            if (w.mastered) score -= 20;
            return { ...w, score };
        });

        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, 15);
    },

    recordResult(be, correct) {
        const words = JSON.parse(localStorage.getItem('mova_words') || '[]');
        const idx = words.findIndex(w => w.be === be);
        if (idx >= 0) {
            if (correct) {
                words[idx].timesCorrect = (words[idx].timesCorrect || 0) + 1;
            } else {
                words[idx].timesWrong = (words[idx].timesWrong || 0) + 1;
            }
            words[idx].lastSeen = Date.now();
            const total = (words[idx].timesCorrect || 0) + (words[idx].timesWrong || 0);
            const errorRate = (words[idx].timesWrong || 0) / total;
            if ((words[idx].timesCorrect || 0) >= 5 && errorRate < 0.2) {
                words[idx].mastered = true;
            }
        } else {
            words.push({
                be,
                timesCorrect: correct ? 1 : 0,
                timesWrong: correct ? 0 : 1,
                lastSeen: Date.now(),
                mastered: false
            });
        }
        localStorage.setItem('mova_words', JSON.stringify(words));
    },

    generateExercises(words) {
        if (!words || words.length === 0) return [];
        const exercises = [];
        for (const word of words) {
            const type = this.randomType();
            if (type === 'choose_translation') {
                const wrong = this.getRandomWords(words, word.be, 3);
                const options = this.shuffle([word.ru, ...wrong.map(w => w.ru)]);
                exercises.push({
                    type: 'choose_translation',
                    question: `Як перакласці '${word.be}'?`,
                    options,
                    correct: options.indexOf(word.ru),
                    word: word.be
                });
            } else if (type === 'choose_original') {
                const wrong = this.getRandomWords(words, word.be, 3);
                const options = this.shuffle([word.be, ...wrong.map(w => w.be)]);
                exercises.push({
                    type: 'choose_translation',
                    question: `Як будзе '${word.ru}' па-беларуску?`,
                    options,
                    correct: options.indexOf(word.be),
                    word: word.be
                });
            } else {
                exercises.push({
                    type: 'flashcard',
                    front: word.be,
                    back: word.ru,
                    audio: word.audio || '',
                    word: word.be
                });
            }
        }
        return exercises;
    },

    randomType() {
        const types = ['choose_translation', 'choose_original', 'flashcard'];
        return types[Math.floor(Math.random() * types.length)];
    },

    getRandomWords(allWords, excludeBe, count) {
        const filtered = allWords.filter(w => w.be !== excludeBe);
        return this.shuffle([...filtered]).slice(0, count);
    },

    shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
};

window.Repetition = Repetition;
