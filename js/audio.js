// ============================================================
// audio.js — AudioPlayer: воспроизведение MP3 + Web Speech API fallback
// ============================================================

const AudioPlayer = {
    currentAudio: null,
    isPlaying: false,

    /**
     * Воспроизвести аудио файл
     * @param {string} src — путь к MP3 (например "lesson-01/dobry-dzien.mp3")
     * @param {HTMLElement} button — кнопка 🔊 которую нажали (для анимации)
     */
    play(src, button = null) {
        // Остановить предыдущее
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
        }

        // Убрать анимацию со всех кнопок
        document.querySelectorAll('.audio-btn.playing').forEach(btn => {
            btn.classList.remove('playing');
        });

        const fullPath = `audio/${src}`;
        this.currentAudio = new Audio(fullPath);
        this.isPlaying = true;

        if (button) {
            button.classList.add('playing');
        }

        this.currentAudio.onended = () => {
            this.isPlaying = false;
            if (button) button.classList.remove('playing');
        };

        this.currentAudio.onerror = () => {
            this.isPlaying = false;
            if (button) button.classList.remove('playing');
            console.warn(`Аудио не найдено: ${fullPath}`);
            this.showFallback(src, button);
        };

        this.currentAudio.play().catch(() => {
            this.showFallback(src, button);
        });
    },

    /**
     * Воспроизвести текст через Web Speech API (fallback)
     */
    speakFallback(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'uk-UA';
            utterance.rate = 0.9;
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
        }
    },

    /**
     * Fallback когда MP3 не найден
     */
    showFallback(src, button) {
        if (button) {
            const text = button.dataset.text;
            if (text) {
                this.speakFallback(text);
            } else {
                button.title = 'Аудио загружается...';
            }
        }
    },

    /**
     * Остановить воспроизведение
     */
    stop() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.isPlaying = false;
        }
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        document.querySelectorAll('.audio-btn.playing').forEach(btn => {
            btn.classList.remove('playing');
        });
    },

    /**
     * Создать кнопку 🔊 для слова
     * @param {string} audioSrc — путь к MP3
     * @param {string} text — текст слова (для fallback)
     * @param {string} size — '' | 'sm' (маленькая)
     */
    createButton(audioSrc, text, size = '') {
        const btn = document.createElement('button');
        btn.className = 'audio-btn' + (size ? ` audio-btn-${size}` : '');
        btn.innerHTML = '🔊';
        btn.title = 'Послушать';
        btn.dataset.text = text || '';
        btn.dataset.src = audioSrc || '';

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (audioSrc) {
                this.play(audioSrc, btn);
            } else if (text) {
                btn.classList.add('playing');
                this.speakFallback(text);
                setTimeout(() => btn.classList.remove('playing'), 1500);
            }
        });

        return btn;
    }
};

window.AudioPlayer = AudioPlayer;
