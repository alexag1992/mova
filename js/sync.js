// ============================================================
// sync.js — синхронизация прогресса с Cloud Firestore
// ============================================================

const Sync = {
    _db:    null,
    _timer: null,
    _status: 'idle', // 'idle' | 'syncing' | 'synced' | 'error'

    // localStorage ключи и соответствующие Firestore поля
    _fields: {
        mova_progress:     'progress',
        mova_streak:       'streak',
        mova_words:        'words',
        mova_activity:     'activity',
        mova_achievements: 'achievements',
    },

    init() {
        this._db = firebase.firestore();
        // Включаем офлайн-кэш Firestore
        this._db.enablePersistence({ synchronizeTabs: false }).catch(() => {});
    },

    // ---------- Загрузить данные из Firestore в localStorage ----------

    async load(uid) {
        if (!uid || !this._db) return false;
        try {
            const doc = await this._db.collection('users').doc(uid).get();
            if (!doc.exists) return false;

            const d = doc.data();

            for (const [key, field] of Object.entries(this._fields)) {
                if (d[field] !== undefined) {
                    localStorage.setItem(key, JSON.stringify(d[field]));
                }
            }
            if (d.points !== undefined) {
                localStorage.setItem('mova_points', String(d.points));
            }

            console.log('Sync: loaded from Firestore');
            return true;
        } catch (e) {
            console.warn('Sync.load failed:', e);
            return false;
        }
    },

    // ---------- Сохранить данные из localStorage в Firestore ----------

    async save(uid) {
        if (!uid || !this._db) return;
        this._setStatus('syncing');

        const data = { updatedAt: firebase.firestore.FieldValue.serverTimestamp() };

        for (const [key, field] of Object.entries(this._fields)) {
            try { data[field] = JSON.parse(localStorage.getItem(key) || (key === 'mova_words' || key === 'mova_achievements' ? '[]' : '{}')); }
            catch { data[field] = key === 'mova_words' || key === 'mova_achievements' ? [] : {}; }
        }
        data.points = parseInt(localStorage.getItem('mova_points') || '0');

        try {
            await this._db.collection('users').doc(uid).set(data, { merge: true });
            this._setStatus('synced');
        } catch (e) {
            console.warn('Sync.save failed:', e);
            this._setStatus('error');
        }
    },

    // ---------- Сохранить профиль пользователя ----------

    async saveProfile(user) {
        if (!user || !this._db) return;
        try {
            await this._db.collection('users').doc(user.uid).set({
                profile: {
                    displayName: user.displayName,
                    email:       user.email,
                    photoURL:    user.photoURL,
                    lastSeen:    firebase.firestore.FieldValue.serverTimestamp(),
                }
            }, { merge: true });
        } catch (e) { /* silent */ }
    },

    // ---------- Отложенное сохранение (debounce 2s) ----------

    schedule() {
        const user = window.Auth ? Auth.getCurrentUser() : null;
        if (!user) return;
        clearTimeout(this._timer);
        this._timer = setTimeout(() => this.save(user.uid), 2000);
        this._setStatus('syncing');
        this._updateIcon();
    },

    // ---------- Утилиты ----------

    _setStatus(s) {
        this._status = s;
        this._updateIcon();
    },

    _updateIcon() {
        const el = document.getElementById('sync-icon');
        if (!el) return;
        const icons  = { syncing: '🔄', synced: '☁️', error: '⚠️', idle: '☁️' };
        const titles = {
            syncing: 'Сінхранізацыя...',
            synced:  'Захавана ў воблаку',
            error:   'Памылка сінхранізацыі',
            idle:    'Воблачны захаванне'
        };
        el.textContent = icons[this._status]  || '☁️';
        el.title       = titles[this._status] || '';
        el.style.animation = this._status === 'syncing' ? 'spin 1s linear infinite' : '';
    }
};

window.Sync = Sync;
