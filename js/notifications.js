// ============================================================
// notifications.js — всплывающие уведомления
// ============================================================

const Notifications = {
    container: null,

    init() {
        if (this.container) return;
        this.container = document.createElement('div');
        this.container.id = 'notifications';
        document.body.appendChild(this.container);
    },

    show(message, type = 'info', duration = 3000) {
        this.init();
        const colors = {
            info:        { bg: '#141414',  border: '#00d4ff', text: '#e4e4e4' },
            success:     { bg: '#0a2e1a',  border: '#22c55e', text: '#22c55e' },
            error:       { bg: '#2e0a0a',  border: '#ef4444', text: '#ef4444' },
            achievement: { bg: '#2e2000',  border: '#f59e0b', text: '#f59e0b' },
            points:      { bg: '#0a1a2e',  border: '#00d4ff', text: '#00d4ff' }
        };
        const c = colors[type] || colors.info;

        const el = document.createElement('div');
        el.className = 'notification-item';
        el.style.cssText = `background:${c.bg};border:1px solid ${c.border};color:${c.text};`;
        el.textContent = message;
        el.onclick = () => el.remove();

        this.container.appendChild(el);

        setTimeout(() => {
            el.style.animation = 'slideUp 0.3s ease forwards';
            setTimeout(() => el.remove(), 300);
        }, duration);
    },

    achievement(name) { this.show(`🏆 Новае дасягненне: ${name}!`, 'achievement', 4000); },
    points(amount)    { this.show(`+${amount} ачкоў!`, 'points', 2000); },
    success(message)  { this.show(message, 'success'); },
    error(message)    { this.show(message, 'error'); },
    copied()          { this.show('✓ Скапіравана!', 'success', 1500); }
};

window.Notifications = Notifications;
