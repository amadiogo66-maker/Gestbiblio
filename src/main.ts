import './index.css';
import { screens } from './screens.ts';
import { store } from './store.ts';

// Simple Router / Page Switcher
const app = document.getElementById('app');

function navigate(page: string, pushHistory = true, skipAuthRedirect = false) {
    if (!app) return;
    
    // --- AUTH GUARDS ---
    // Skip the automatic redirect logic when caller explicitly requests (startup)
    if (!skipAuthRedirect) {
        const isPublic = ['home', 'login', 'register'].includes(page);

        // If trying to access a non-public page while not authenticated -> go home
        if (!store.isAuthenticated && !isPublic) {
            page = 'home';
        }

        // If authenticated, enforce ACLs and default redirects
        if (store.isAuthenticated) {
            const role = store.currentUser?.role;
            const defaultPage = store.getDefaultRouteForRole ? store.getDefaultRouteForRole(role) : 'dashboard';

            // Redirect away from public pages if logged in
            if (isPublic) {
                page = defaultPage;
            }

            // Normalize generic dashboard navigation to role-specific dashboard
            if (page === 'dashboard') {
                page = defaultPage;
            }

            // Enforce ACL using centralized helper
            if (!(store as any).canAccess(page)) {
                page = defaultPage;
            }
        }
    }
    // -------------------
    
    // Always scroll to top on navigation
    window.scrollTo(0, 0);
    
    // History API
    if (pushHistory) {
        window.history.pushState({ page }, '', '#' + page);
    }
    
    const renderFunc = (screens as any)[page];
    if (renderFunc) {
        app.innerHTML = renderFunc();
        
        // Post-render lifecycles
        if (page === 'dashboard') {
            setTimeout(() => store.initDashboardCharts(), 50);
        } else if (page === 'stats') {
            // Can add specific stats charts here later
        } else if (page === 'presences') {
            setTimeout(() => store.initScanner(), 50);
        } else {
            // Clean up scanner if we leave the page
            if (store.scanner) {
                store.scanner.clear().catch(e => console.error(e));
                store.scanner = null;
            }
        }
        
        // Update notifications badge
        if ((window as any).updateNotificationsList) {
            (window as any).updateNotificationsList();
        }
    } else {
        app.innerHTML = `<div class="p-10"><h1>404 - Page non trouvée</h1><button onclick="navigate('dashboard')" class="text-primary underline">Retour à l'accueil</button></div>`;
    }
}

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    // Initialize store from localStorage then show home as first screen
    try { store.init(); } catch (e) { console.error('Store init failed', e); }

    // Always show the modern Home page first on application start
    navigate('home', false, true);
});

// Handle browser Back/Forward buttons
window.addEventListener('popstate', (event) => {
    const page = event.state?.page || window.location.hash.replace('#', '') || 'home';
    navigate(page, false);
});

// Expose navigate globally for onclick handlers in template strings
(window as any).navigate = navigate;
(window as any).appStore = store;

// Notifications Logic
(window as any).updateNotificationsList = () => {
    const list = document.getElementById('notif-list');
    const badge = document.getElementById('notif-badge');
    const countBadge = document.getElementById('notif-count');
    
    if (!store) return;
    
    const lateBorrows = store.borrows.filter((b: any) => b.status === 'En retard');
    const pendingRequests = store.requests.filter((r: any) => r.status === 'En attente');
    
    const totalNotifs = lateBorrows.length + pendingRequests.length;
    
    if (badge) {
        if (totalNotifs > 0) badge.classList.remove('hidden');
        else badge.classList.add('hidden');
    }
    
    if (countBadge) {
        countBadge.innerText = totalNotifs.toString();
    }
    
    if (!list) return; // if dropdown is not rendered, still update badges
    
    if (totalNotifs === 0) {
        list.innerHTML = `<div class="p-6 text-center text-on-surface-variant text-xs flex flex-col items-center gap-2">
            <span class="material-symbols-outlined text-3xl opacity-50">notifications_paused</span>
            Aucune notification récente
        </div>`;
        return;
    }
    
    let html = '';
    
    lateBorrows.forEach((b: any) => {
        const book = store.books.find((bk: any) => bk.id === b.bookId) || { title: 'Livre Inconnu' };
        const user = store.users.find((u: any) => u.id === b.userId) || { fullname: 'Lecteur' };
        html += `
            <div class="p-3 border-b border-outline-variant/30 hover:bg-surface-container transition-colors cursor-pointer" onclick="navigate('attendance')">
                <div class="flex items-start gap-3">
                    <div class="w-8 h-8 rounded bg-error/10 text-error flex items-center justify-center shrink-0">
                        <span class="material-symbols-outlined text-sm">assignment_late</span>
                    </div>
                    <div>
                        <p class="text-xs font-bold text-on-surface">Retard: ${user.fullname}</p>
                        <p class="text-[10px] text-on-surface-variant line-clamp-1">${book.title}</p>
                        <p class="text-[9px] text-error font-bold mt-1">Action requise</p>
                    </div>
                </div>
            </div>
        `;
    });
    
    pendingRequests.forEach((r: any) => {
        html += `
            <div class="p-3 border-b border-outline-variant/30 hover:bg-surface-container transition-colors cursor-pointer" onclick="navigate('requests')">
                <div class="flex items-start gap-3">
                    <div class="w-8 h-8 rounded bg-orange-500/10 text-orange-700 flex items-center justify-center shrink-0">
                        <span class="material-symbols-outlined text-sm">pending</span>
                    </div>
                    <div>
                        <p class="text-xs font-bold text-on-surface">Demande en attente</p>
                        <p class="text-[10px] text-on-surface-variant line-clamp-1">${r.fullname} - ${r.type}</p>
                        <p class="text-[9px] text-orange-700 font-bold mt-1">À examiner</p>
                    </div>
                </div>
            </div>
        `;
    });
    
    list.innerHTML = html;
};

(window as any).toggleNotifications = () => {
    const dropdown = document.getElementById('notif-dropdown');
    if (dropdown) {
        if (dropdown.classList.contains('hidden')) {
            dropdown.classList.remove('hidden');
            (window as any).updateNotificationsList();
        } else {
            dropdown.classList.add('hidden');
        }
    }
};

// Close dropdown on click outside
document.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const dropdown = document.getElementById('notif-dropdown');
    
    if (dropdown && !dropdown.classList.contains('hidden')) {
        const notifButton = target.closest('button[onclick="window.toggleNotifications()"]');
        const notifDropdown = target.closest('#notif-dropdown');
        
        if (!notifButton && !notifDropdown) {
            dropdown.classList.add('hidden');
        }
    }
});
