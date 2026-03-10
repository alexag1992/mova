// ============================================================
// auth.js — Firebase Authentication (Google Sign-In)
// ============================================================

const FIREBASE_CONFIG = {
    apiKey:            "AIzaSyBzCG8mGNG5GdLtBtajB4cLROROX32J7_A",
    authDomain:        "mova-d0d56.firebaseapp.com",
    projectId:         "mova-d0d56",
    storageBucket:     "mova-d0d56.firebasestorage.app",
    messagingSenderId: "761543579369",
    appId:             "1:761543579369:web:b750227f3c0a62a1800278"
};

// Инициализация Firebase (только один раз)
if (!firebase.apps.length) {
    firebase.initializeApp(FIREBASE_CONFIG);
}

const Auth = {

    getCurrentUser() {
        return firebase.auth().currentUser;
    },

    onStateChanged(callback) {
        return firebase.auth().onAuthStateChanged(callback);
    },

    async signInWithGoogle() {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        try {
            await firebase.auth().signInWithRedirect(provider);
            return true;
        } catch (e) {
            if (window.Notifications) Notifications.error('Памылка ўваходу: ' + e.message);
            console.error('Sign-in error:', e);
            return false;
        }
    },

    async signOut() {
        try {
            await firebase.auth().signOut();
            if (window.Notifications) Notifications.show('Вы выйшлі з акаўнта', 'info', 2000);
        } catch (e) {
            console.error('Sign-out error:', e);
        }
    }
};

// Обработка результата после редиректа от Google
firebase.auth().getRedirectResult().catch(e => {
    if (window.Notifications) Notifications.error('Памылка ўваходу: ' + e.message);
    console.error('Redirect sign-in error:', e);
});

window.Auth = Auth;
