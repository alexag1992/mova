// ============================================================
// exercises.js — универсальная система упражнений
// ============================================================

// ---------- Главная функция ----------

/**
 * Рендерит упражнение в контейнер.
 * @param {HTMLElement} container  — элемент для рендеринга
 * @param {Object}      data       — данные упражнения
 * @param {Function}    onComplete — callback({correct, points, attempts})
 */
function renderExercise(container, data, onComplete) {
    container.innerHTML = '';
    container.classList.add('exercise-fade-in');

    switch (data.type) {
        case 'choose_translation':  renderChooseTranslation(container, data, onComplete); break;
        case 'listen_choose':       renderListenChoose(container, data, onComplete);      break;
        case 'match_pairs':         renderMatchPairs(container, data, onComplete);        break;
        case 'build_sentence':      renderBuildSentence(container, data, onComplete);     break;
        case 'type_answer':         renderTypeAnswer(container, data, onComplete);        break;
        case 'flashcard_set':       renderFlashcardSet(container, data, onComplete);      break;
        case 'multiple_choice':     renderMultipleChoice(container, data, onComplete);    break;
        default:
            container.innerHTML = `<p style="color:var(--text-muted)">Неизвестный тип: ${data.type}</p>`;
    }
}

// ---------- 1. CHOOSE_TRANSLATION ----------

function renderChooseTranslation(container, data, onComplete) {
    let attempts = 0;
    let answered = false;

    container.innerHTML = `
    <div class="ex-box">
        <p class="ex-question">${data.question}</p>
        <div class="ex-options" id="ex-opts">
            ${data.options.map((opt, i) =>
                `<button class="ex-option" data-idx="${i}">${opt}</button>`
            ).join('')}
        </div>
        <div class="ex-feedback" id="ex-fb"></div>
    </div>`;

    container.querySelectorAll('.ex-option').forEach(btn => {
        btn.addEventListener('click', () => {
            if (answered) return;
            attempts++;
            const idx = parseInt(btn.dataset.idx);
            const isCorrect = idx === data.correct;

            // Блокируем все кнопки
            container.querySelectorAll('.ex-option').forEach(b => b.disabled = true);

            if (isCorrect) {
                answered = true;
                btn.classList.add('ex-correct');
                const points = attempts === 1 ? 10 : 5;
                addPoints(points);

                const fb = container.querySelector('#ex-fb');
                fb.innerHTML = `<div class="ex-feedback-ok">✅ ${data.explanation || 'Верна!'} <span class="ex-points">+${points} очков</span></div>`;

                setTimeout(() => onComplete({ correct: true, points, attempts }), 1500);
            } else {
                btn.classList.add('ex-wrong');
                // Подсвечиваем правильный
                container.querySelectorAll('.ex-option')[data.correct].classList.add('ex-correct');

                const fb = container.querySelector('#ex-fb');
                fb.innerHTML = `<div class="ex-feedback-err">❌ Не совсем. Правильный ответ выделен зелёным.</div>`;

                // Разблокируем неправильные для повторной попытки
                setTimeout(() => {
                    if (answered) return;
                    container.querySelectorAll('.ex-option').forEach(b => {
                        b.disabled = false;
                        b.classList.remove('ex-wrong', 'ex-correct');
                    });
                    fb.innerHTML = '';
                }, 1500);
            }
        });
    });
}

// ---------- 2. LISTEN_CHOOSE ----------

function renderListenChoose(container, data, onComplete) {
    container.innerHTML = `
    <div class="ex-box">
        <p class="ex-question">${data.question}</p>
        <div class="listen-stub card">
            <button class="audio-btn" style="width:56px;height:56px;font-size:24px" data-audio="${data.audioFile || ''}" data-text="${data.audioText || ''}" onclick="playWordAudio && playWordAudio(this)">🔊</button>
        </div>
        <div class="ex-options">
            ${data.options.map((opt, i) =>
                `<button class="ex-option" data-idx="${i}">${opt}</button>`
            ).join('')}
        </div>
        <div class="ex-feedback" id="ex-fb"></div>
    </div>`;

    // Та же логика что у choose_translation
    renderChooseTranslation(container.querySelector('.ex-box'), data, onComplete);
}

// ---------- 3. MATCH_PAIRS ----------

function renderMatchPairs(container, data, onComplete) {
    const pairs = data.pairs;
    const shuffledRight = [...pairs.map((p, i) => ({text: p.right, idx: i}))].sort(() => Math.random() - 0.5);
    let selectedLeft = null;
    let matchedCount = 0;
    let totalPoints = 0;

    container.innerHTML = `
    <div class="ex-box">
        <p class="ex-question">${data.instruction}</p>
        <div class="match-grid">
            <div class="match-col" id="match-left">
                ${pairs.map((p, i) =>
                    `<button class="match-item" data-idx="${i}" data-side="left">${p.left}</button>`
                ).join('')}
            </div>
            <div class="match-col" id="match-right">
                ${shuffledRight.map((p, i) =>
                    `<button class="match-item" data-idx="${p.idx}" data-side="right">${p.text}</button>`
                ).join('')}
            </div>
        </div>
        <div class="ex-feedback" id="ex-fb"></div>
    </div>`;

    container.querySelectorAll('.match-item').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('match-done') || btn.disabled) return;

            if (btn.dataset.side === 'left') {
                // Снимаем предыдущее выделение
                container.querySelectorAll('[data-side="left"]').forEach(b => b.classList.remove('match-selected'));
                selectedLeft = btn;
                btn.classList.add('match-selected');
            } else if (selectedLeft) {
                const leftIdx = parseInt(selectedLeft.dataset.idx);
                const rightIdx = parseInt(btn.dataset.idx);

                if (leftIdx === rightIdx) {
                    // Правильно
                    selectedLeft.classList.remove('match-selected');
                    selectedLeft.classList.add('match-done');
                    btn.classList.add('match-done');
                    selectedLeft.disabled = true;
                    btn.disabled = true;
                    selectedLeft = null;
                    matchedCount++;
                    totalPoints += 5;
                    addPoints(5);

                    if (matchedCount === pairs.length) {
                        const fb = container.querySelector('#ex-fb');
                        fb.innerHTML = `<div class="ex-feedback-ok">✅ Все пары найдены! <span class="ex-points">+${totalPoints} очков</span></div>`;
                        setTimeout(() => onComplete({ correct: true, points: totalPoints, attempts: 1 }), 1500);
                    }
                } else {
                    // Неправильно — тряска
                    selectedLeft.classList.add('match-wrong', 'shake');
                    btn.classList.add('match-wrong', 'shake');
                    setTimeout(() => {
                        selectedLeft.classList.remove('match-wrong', 'shake', 'match-selected');
                        btn.classList.remove('match-wrong', 'shake');
                        selectedLeft = null;
                    }, 700);
                }
            }
        });
    });
}

// ---------- 4. BUILD_SENTENCE ----------

function renderBuildSentence(container, data, onComplete) {
    const shuffled = [...data.words].sort(() => Math.random() - 0.5);
    let built = [];

    function renderBS() {
        container.innerHTML = `
        <div class="ex-box">
            <p class="ex-question">${data.instruction}</p>
            <div class="build-zone" id="build-zone">
                ${built.length === 0
                    ? '<span class="build-placeholder">Нажмите на слова ниже</span>'
                    : built.map((w, i) =>
                        `<button class="build-word build-word-used" data-bidx="${i}">${w}</button>`
                      ).join('')
                }
            </div>
            <div class="build-bank" id="build-bank">
                ${shuffled.map((w, i) =>
                    built.includes(w) && shuffled.filter(x => x === w).length <= built.filter(x => x === w).length
                        ? `<button class="build-word build-word-used" disabled>${w}</button>`
                        : `<button class="build-word" data-widx="${i}">${w}</button>`
                ).join('')}
            </div>
            <div style="display:flex;gap:8px;margin-top:12px">
                <button class="btn-secondary" id="bs-clear" style="flex:1">Очистить</button>
                <button class="btn-primary" id="bs-check" style="flex:2">Проверить</button>
            </div>
            <div class="ex-feedback" id="ex-fb"></div>
        </div>`;

        // Добавить слово из банка
        container.querySelectorAll('#build-bank .build-word:not([disabled])').forEach(btn => {
            btn.addEventListener('click', () => {
                built.push(btn.textContent);
                renderBS();
            });
        });

        // Убрать слово из зоны сборки
        container.querySelectorAll('#build-zone .build-word-used').forEach(btn => {
            btn.addEventListener('click', () => {
                built.splice(parseInt(btn.dataset.bidx), 1);
                renderBS();
            });
        });

        // Очистить
        container.querySelector('#bs-clear').addEventListener('click', () => {
            built = [];
            renderBS();
        });

        // Проверить
        container.querySelector('#bs-check').addEventListener('click', () => {
            const answer = built.join(' ');
            const fb = container.querySelector('#ex-fb');
            if (answer === data.correct) {
                addPoints(15);
                fb.innerHTML = `<div class="ex-feedback-ok">✅ Верно! "${answer}" <span class="ex-points">+15 очков</span></div>`;
                container.querySelectorAll('button').forEach(b => b.disabled = true);
                setTimeout(() => onComplete({ correct: true, points: 15, attempts: 1 }), 1500);
            } else {
                fb.innerHTML = `<div class="ex-feedback-err">❌ Не совсем. Попробуй ещё раз. Правильно: "${data.correct}"</div>`;
            }
        });
    }

    renderBS();
}

// ---------- 5. TYPE_ANSWER ----------

function renderTypeAnswer(container, data, onComplete) {
    let hintUsed = false;

    container.innerHTML = `
    <div class="ex-box">
        <p class="ex-question">${data.question}</p>
        <div class="type-wrap">
            <input type="text" class="type-input" id="type-inp" placeholder="Введите ответ...">
            ${data.hint ? `<button class="btn-hint" id="type-hint" title="Подсказка">💡</button>` : ''}
        </div>
        <button class="btn-primary" id="type-check" style="margin-top:12px">Проверить</button>
        <div class="ex-feedback" id="ex-fb"></div>
    </div>`;

    const input = container.querySelector('#type-inp');
    input.focus();

    if (data.hint) {
        container.querySelector('#type-hint').addEventListener('click', () => {
            hintUsed = true;
            container.querySelector('#ex-fb').innerHTML =
                `<div class="ex-feedback-hint">💡 Подсказка: ${data.hint}</div>`;
        });
    }

    const check = () => {
        const val = input.value.trim();
        const correct = data.correct;
        const variants = Array.isArray(correct) ? correct : [correct];
        const isOk = variants.some(v => v.toLowerCase() === val.toLowerCase());
        const fb = container.querySelector('#ex-fb');

        if (isOk) {
            const pts = hintUsed ? 10 : 20;
            addPoints(pts);
            input.style.borderColor = 'var(--accent-green)';
            fb.innerHTML = `<div class="ex-feedback-ok">✅ Верно! <span class="ex-points">+${pts} очков</span></div>`;
            container.querySelector('#type-check').disabled = true;
            input.disabled = true;
            setTimeout(() => onComplete({ correct: true, points: pts, attempts: 1 }), 1500);
        } else {
            input.style.borderColor = 'var(--accent-red)';
            fb.innerHTML = `<div class="ex-feedback-err">❌ Не совсем. Правильно: "${variants[0]}"</div>`;
            setTimeout(() => { input.style.borderColor = ''; }, 1000);
        }
    };

    container.querySelector('#type-check').addEventListener('click', check);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
}

// ---------- 6. FLASHCARD_SET ----------

function renderFlashcardSet(container, data, onComplete) {
    let current = 0;
    let flipped = false;
    let remembered = 0;

    function renderCard() {
        const card = data.cards[current];
        const total = data.cards.length;
        flipped = false;

        container.innerHTML = `
        <div class="ex-box">
            <p class="ex-question">${data.instruction || 'Флешкарты'} <span style="color:var(--text-muted);font-size:14px">${current + 1} / ${total}</span></p>
            <div class="flashcard-scene" id="fc-scene">
                <div class="flashcard" id="fc-card">
                    <div class="flashcard-front">
                        <p class="fc-text">${card.front}</p>
                        <button class="fc-audio-btn">🔊</button>
                    </div>
                    <div class="flashcard-back">
                        <p class="fc-text">${card.back}</p>
                    </div>
                </div>
            </div>
            <button class="btn-secondary" id="fc-flip" style="width:100%;margin-bottom:12px">Показать перевод</button>
            <div class="fc-actions" id="fc-actions" style="display:none">
                <button class="btn-fc-no" id="fc-no">❌ Не помню</button>
                <button class="btn-fc-yes" id="fc-yes">✅ Помню</button>
            </div>
        </div>`;

        // Кнопка 🔊
        container.querySelector('.fc-audio-btn').addEventListener('click', () => {
            if (window.AudioPlayer) {
                AudioPlayer.speakFallback(card.front);
            }
        });

        // Перевернуть карточку
        const fcCard = container.querySelector('#fc-card');
        const flipBtn = container.querySelector('#fc-flip');
        flipBtn.addEventListener('click', () => {
            if (!flipped) {
                flipped = true;
                fcCard.classList.add('flipped');
                flipBtn.style.display = 'none';
                container.querySelector('#fc-actions').style.display = 'flex';
            }
        });

        // Помню
        container.querySelector('#fc-yes').addEventListener('click', () => {
            remembered++;
            addPoints(5);
            nextCard();
        });

        // Не помню
        container.querySelector('#fc-no').addEventListener('click', () => {
            nextCard();
        });
    }

    function nextCard() {
        current++;
        if (current >= data.cards.length) {
            const pts = remembered * 5;
            container.innerHTML = `
            <div class="ex-box">
                <div class="ex-feedback-ok" style="text-align:center;padding:24px">
                    ✅ Карточки просмотрены!<br>
                    Запомнено: ${remembered} из ${data.cards.length}<br>
                    <span class="ex-points">+${pts} очков</span>
                </div>
            </div>`;
            setTimeout(() => onComplete({ correct: true, points: pts, attempts: 1 }), 1500);
        } else {
            renderCard();
        }
    }

    renderCard();
}

// ---------- 7. MULTIPLE_CHOICE ----------

function renderMultipleChoice(container, data, onComplete) {
    container.innerHTML = `
    <div class="ex-box">
        <p class="ex-question">${data.question}</p>
        <div class="mc-options">
            ${data.options.map((opt, i) =>
                `<label class="mc-label">
                    <input type="checkbox" class="mc-check" value="${i}">
                    <span class="mc-text">${opt}</span>
                </label>`
            ).join('')}
        </div>
        <button class="btn-primary" id="mc-check" style="margin-top:12px">Проверить</button>
        <div class="ex-feedback" id="ex-fb"></div>
    </div>`;

    container.querySelector('#mc-check').addEventListener('click', () => {
        const checked = [...container.querySelectorAll('.mc-check:checked')].map(c => parseInt(c.value));
        const correct = data.correct;

        const isOk = checked.length === correct.length && correct.every(i => checked.includes(i));
        const fb = container.querySelector('#ex-fb');

        // Подсвечиваем ответы
        container.querySelectorAll('.mc-label').forEach((label, i) => {
            const isCorrect = correct.includes(i);
            const isChecked = checked.includes(i);
            if (isCorrect && isChecked) label.classList.add('mc-correct');
            else if (!isCorrect && isChecked) label.classList.add('mc-wrong');
            else if (isCorrect && !isChecked) label.classList.add('mc-missed');
        });

        container.querySelector('#mc-check').disabled = true;

        if (isOk) {
            addPoints(10);
            fb.innerHTML = `<div class="ex-feedback-ok">✅ Все правильно! <span class="ex-points">+10 очков</span></div>`;
            setTimeout(() => onComplete({ correct: true, points: 10, attempts: 1 }), 1500);
        } else {
            fb.innerHTML = `<div class="ex-feedback-err">❌ Не все правильно. Правильные выделены зелёным.</div>`;
            setTimeout(() => onComplete({ correct: false, points: 0, attempts: 1 }), 2000);
        }
    });
}

// ---------- Финальный тест урока ----------

/**
 * Запускает финальный тест урока.
 * @param {HTMLElement} container
 * @param {Array}       questions  — массив вопросов (type: choose_translation)
 * @param {Function}    onFinish   — callback({score, total, stars, points})
 */
function renderFinalTest(container, questions, onFinish) {
    let current = 0;
    let correct = 0;
    let totalPoints = 0;

    function showQuestion() {
        const q = questions[current];
        const pct = Math.round((current / questions.length) * 100);

        container.innerHTML = `
        <div class="test-wrap">
            <div class="test-header">
                <p class="test-counter">Вопрос ${current + 1} из ${questions.length}</p>
                <div class="progress-bar-wrap" style="margin-top:8px">
                    <div class="progress-bar-fill" style="width:${pct}%"></div>
                </div>
            </div>
            <div id="test-ex"></div>
        </div>`;

        const exContainer = container.querySelector('#test-ex');
        renderExercise(exContainer, q, (result) => {
            if (result.correct) { correct++; totalPoints += result.points; }
            current++;
            if (current < questions.length) {
                setTimeout(showQuestion, 200);
            } else {
                showResult();
            }
        });
    }

    function showResult() {
        const pct = Math.round((correct / questions.length) * 100);
        const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : pct >= 30 ? 1 : 0;
        const starsHtml = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);

        container.innerHTML = `
        <div class="test-result">
            <div class="test-result-stars">${starsHtml}</div>
            <h2 class="test-result-title">${pct >= 60 ? 'Молодец!' : 'Попробуй ещё раз!'}</h2>
            <p class="test-result-score">${correct} из ${questions.length} правильно — ${pct}%</p>
            <p class="test-result-points">Очков заработано: <strong>+${totalPoints}</strong></p>
            <div style="display:flex;flex-direction:column;gap:12px;margin-top:24px">
                <button class="btn-secondary" onclick="renderFinalTest(this.closest('.test-result').parentElement, ${JSON.stringify(questions).replace(/"/g,"'")}, arguments[0])">
                    Пройти заново
                </button>
            </div>
        </div>`;

        onFinish({ score: correct, total: questions.length, stars, points: totalPoints });
    }

    showQuestion();
}

// ---------- Вспомогательные ----------

function showAudioStub() {
    // Показываем тост "аудио будет добавлено"
    let toast = document.getElementById('audio-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'audio-toast';
        toast.className = 'audio-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = '🔊 Аудио будет добавлено позже';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}
