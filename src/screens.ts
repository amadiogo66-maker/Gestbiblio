
export const roleConfig = {
    admin: {
        label: 'ADMIN PRINCIPAL',
        menu: [
            { id: 'dashboard', icon: 'dashboard', label: 'Tableau de bord' },
            { id: 'students', icon: 'group', label: 'Étudiants' },
            { id: 'books', icon: 'book', label: 'Ouvrages' },
            { id: 'attendance', icon: 'event_available', label: 'Présences' },
            { id: 'stats', icon: 'insert_chart', label: 'Statistiques' },
            { id: 'requests', icon: 'pending', label: 'Demandes' },
            { id: 'interface', icon: 'admin_panel_settings', label: 'Administration' },
            { id: 'profile', icon: 'person', label: 'Mon dossier' },
        ],
        allowedPages: ['dashboard', 'students', 'books', 'attendance', 'stats', 'requests', 'profile', 'reinscription', 'interface'],
    },
    librarian: {
        label: 'BIBLIOTHÉCAIRE',
        menu: [
            { id: 'dashboard', icon: 'dashboard', label: 'Gestion bibliothèque' },
            { id: 'books', icon: 'book', label: 'Catalogue' },
            { id: 'attendance', icon: 'event_available', label: 'Emprunts' },
            { id: 'students', icon: 'group', label: 'Étudiants actifs' },
            { id: 'interface', icon: 'admin_panel_settings', label: 'Interface Bibliothécaire' },
            { id: 'requests', icon: 'pending', label: 'Demandes' },
            { id: 'profile', icon: 'person', label: 'Mon dossier' },
        ],
        allowedPages: ['dashboard', 'books', 'attendance', 'students', 'requests', 'profile', 'reinscription', 'interface'],
    },
    student: {
        label: 'ÉTUDIANT',
        menu: [
            { id: 'dashboard', icon: 'dashboard', label: 'Mon espace' },
            { id: 'books', icon: 'book', label: 'Catalogue' },
            { id: 'profile', icon: 'person', label: 'Mon dossier' },
        ],
        allowedPages: ['dashboard', 'books', 'profile', 'reinscription'],
    },
    professor: {
        label: 'PROFESSEUR',
        menu: [
            { id: 'dashboard', icon: 'dashboard', label: 'Espace académique' },
            { id: 'books', icon: 'book', label: 'Ressources' },
            { id: 'profile', icon: 'person', label: 'Mon dossier' },
        ],
        allowedPages: ['dashboard', 'books', 'profile', 'reinscription'],
    },
    professorAdmin: {
        label: 'PROFESSEUR ADMIN',
        menu: [
            { id: 'dashboard', icon: 'dashboard', label: 'Statistiques départementales' },
            { id: 'books', icon: 'book', label: 'Ressources' },
            { id: 'stats', icon: 'insert_chart', label: 'Stats dépt.' },
            { id: 'profile', icon: 'person', label: 'Mon dossier' },
        ],
        allowedPages: ['dashboard', 'books', 'stats', 'profile', 'reinscription'],
    },
};

export function getRoleLabel(role: string = 'admin') {
    return roleConfig[role]?.label ?? 'Profil Administrateur';
}

export function getSidebar(activePage: string, role: string = 'admin') {
    const config = roleConfig[role] || roleConfig.admin;
    const items = config.menu;

    return `
        <aside class="w-[260px] h-full fixed left-0 top-0 bg-primary flex flex-col py-4 px-1 border-r border-outline-variant z-50">
            <div class="px-4 mb-8">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-primary-fixed flex items-center justify-center rounded">
                        <span class="material-symbols-outlined text-primary">account_balance</span>
                    </div>
                    <div>
                        <h1 class="text-lg font-bold text-on-primary">Gest Biblio</h1>
                        <p class="text-xs text-on-primary/60">Administration Centrale</p>
                    </div>
                </div>
            </div>
            <nav class="flex-grow space-y-1">
                ${items.map(item => `
                    <button onclick="navigate('${item.id}')" 
                        class="w-full flex items-center gap-3 px-4 py-3 transition-colors ${activePage === item.id ? 'bg-secondary text-white border-l-4 border-primary-fixed' : 'text-on-primary/70 hover:bg-secondary hover:text-on-primary'}">
                        <span class="material-symbols-outlined">${item.icon}</span>
                        <span class="text-sm">${item.label}</span>
                    </button>
                `).join('')}
            </nav>
            <div class="mt-auto border-t border-on-primary/10 pt-4 space-y-1">
                <button class="w-full flex items-center gap-3 px-4 py-3 text-on-primary/70 hover:bg-secondary hover:text-on-primary transition-colors">
                    <span class="material-symbols-outlined">settings</span>
                    <span class="text-sm">Paramètres</span>
                </button>
                <button onclick="navigate('login')" class="w-full flex items-center gap-3 px-4 py-3 text-on-primary/70 hover:bg-secondary hover:text-on-primary transition-colors">
                    <span class="material-symbols-outlined">logout</span>
                    <span class="text-sm">Déconnexion</span>
                </button>
            </div>
        </aside>
    `;
}

export function getTopBar(userType: string = 'Profil Administrateur') {
    return `
        <header class="h-16 sticky top-0 z-40 bg-surface-container-lowest flex justify-between items-center px-6 w-full border-b border-outline-variant">
            <div class="flex items-center gap-4 flex-1">
                <div class="flex items-center gap-3">
                    <img src="/ule-logo.svg" alt="Logo Université de Labé" class="h-10 w-auto rounded-md border border-outline-variant bg-surface" />
                    <p class="hidden sm:block text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">Université de Labé</p>
                </div>
                <div class="relative w-full max-w-md">
                    <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                    <input type="text" class="w-full bg-surface-container-low border-none rounded-lg pl-10 py-2 text-sm focus:ring-2 focus:ring-primary" placeholder="Rechercher...">
                </div>
            </div>
            <div class="flex items-center gap-4">
                <button class="p-2 text-on-surface-variant hover:text-primary transition-all">
                    <span class="material-symbols-outlined">notifications</span>
                </button>
                <button class="p-2 text-on-surface-variant hover:text-primary transition-all">
                    <span class="material-symbols-outlined">calendar_today</span>
                </button>
                <div class="h-8 w-px bg-outline-variant mx-2"></div>
                <div class="flex items-center gap-3">
                    <span class="text-[11px] font-bold uppercase text-primary">${userType}</span>
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" class="w-10 h-10 rounded-full object-cover border border-outline-variant">
                </div>
            </div>
        </header>
    `;
}

export function renderDashboardContent(role: string = 'admin') {
    const normalized = role === 'professeur' ? 'professor' : role === 'professeurAdmin' ? 'professorAdmin' : role;
    switch (normalized) {
        case 'librarian':
            return `
                <div class="p-6 space-y-6">
                    <div class="flex items-baseline justify-between">
                        <h2 class="text-lg font-bold text-primary">Gestion opérationnelle de la bibliothèque</h2>
                        <span class="text-xs text-on-surface-variant">Suivi des ouvrages et des emprunts</span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        ${renderStatCard('menu_book', 'Catalogue', 'Ouvrages disponibles', '12,840', 'bg-primary-fixed')}
                        ${renderStatCard('assignment_return', 'Actions', 'Emprunts en cours', '432', 'bg-secondary-fixed')}
                        ${renderStatCard('person', 'Public', 'Étudiants actifs', '1,240', 'bg-tertiary-fixed')}
                        ${renderStatCard('inventory', 'Flux', 'Retours aujourd’hui', '58', 'bg-primary-container', 'text-primary')}
                    </div>
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div class="lg:col-span-2 bg-surface-container-lowest border border-outline-variant p-6 rounded-lg">
                            <h3 class="font-bold mb-6">Gestion du catalogue</h3>
                            <div class="h-64 flex items-end justify-between gap-2 border-b border-outline-variant pb-2 px-4">
                                ${[55, 72, 60, 85, 74, 92, 69, 52, 61, 88, 76, 81].map(h => `
                                    <div class="w-full bg-primary-container/20 rounded-t-sm" style="height: ${h}%"></div>
                                `).join('')}
                            </div>
                            <div class="flex justify-between mt-4 px-4 text-[10px] font-bold text-on-surface-variant">
                                <span>JAN</span><span>FÉV</span><span>MAR</span><span>AVR</span><span>MAI</span><span>JUN</span>
                                <span>JUL</span><span>AOU</span><span>SEP</span><span>OCT</span><span>NOV</span><span>DÉC</span>
                            </div>
                        </div>
                        <div class="bg-white border border-outline-variant rounded-lg overflow-hidden">
                            <div class="p-4 border-b border-outline-variant flex justify-between items-center">
                                <h3 class="font-bold">Alertes de retards</h3>
                                <span class="bg-error text-on-primary text-[10px] px-2 py-1 rounded">12 Critiques</span>
                            </div>
                            <div class="flex-grow overflow-y-auto max-h-[350px] p-4 space-y-4">
                                ${renderAlert('Mamadou Bah', 'Le Petit Prince', 'Retard: 8 jours')}
                                ${renderAlert('Mariama Sylla', 'Droit Constitutionnel', 'Retard: 5 jours')}
                                ${renderAlert('Ibrahima Diallo', 'Physique Quantique', 'Échéance: Demain', false)}
                            </div>
                            <button class="w-full p-4 text-primary text-[11px] font-bold uppercase border-t border-outline-variant hover:bg-surface-container transition-colors">Voir tous les litiges</button>
                        </div>
                    </div>
                </div>
            `;
        case 'student':
            return `
                <div class="p-6 space-y-6">
                    <div class="flex items-baseline justify-between">
                        <div>
                            <h2 class="text-lg font-bold text-primary">Espace étudiant</h2>
                            <p class="text-xs text-on-surface-variant">Consultez vos emprunts, réservations et ressources.</p>
                        </div>
                        <span class="text-xs text-on-surface-variant">Bienvenue dans votre tableau de bord personnel</span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        ${renderStatCard('menu_book', 'Disponible', 'Livres accessibles', '7,230', 'bg-primary-fixed')}
                        ${renderStatCard('schedule', 'Réservations', 'Demandes ouvertes', '18', 'bg-secondary-fixed')}
                        ${renderStatCard('inventory_2', 'Emprunts', 'En cours', '4', 'bg-tertiary-fixed')}
                        ${renderStatCard('history_edu', 'Historique', 'Consultations', '26', 'bg-primary-container', 'text-primary')}
                    </div>
                    <div class="bg-white border border-outline-variant rounded-lg p-6">
                        <h3 class="font-bold mb-4">Mes emprunts récents</h3>
                        <table class="w-full text-left border-collapse text-sm">
                            <thead class="bg-surface-container-low border-b border-outline-variant">
                                <tr class="text-[10px] uppercase font-bold text-on-surface-variant">
                                    <th class="px-4 py-3">Ouvrage</th>
                                    <th class="px-4 py-3">Statut</th>
                                    <th class="px-4 py-3">Retour</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-outline-variant">
                                <tr class="hover:bg-surface-container transition-colors"><td class="px-4 py-3">Droit Constitutionnel</td><td class="px-4 py-3">Emprunté</td><td class="px-4 py-3">12 mai</td></tr>
                                <tr class="hover:bg-surface-container transition-colors"><td class="px-4 py-3">Macroéconomie Appliquée</td><td class="px-4 py-3">Disponible</td><td class="px-4 py-3">—</td></tr>
                                <tr class="hover:bg-surface-container transition-colors"><td class="px-4 py-3">Physique Quantique</td><td class="px-4 py-3">Réservé</td><td class="px-4 py-3">Demande envoyée</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        case 'professor':
            return `
                <div class="p-6 space-y-6">
                    <div class="flex items-baseline justify-between">
                        <div>
                            <h2 class="text-lg font-bold text-primary">Espace académique</h2>
                            <p class="text-xs text-on-surface-variant">Accédez aux ressources pédagogiques et départements.</p>
                        </div>
                        <span class="text-xs text-on-surface-variant">Ressources spécialisées à votre disposition</span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        ${renderStatCard('menu_book', 'Ouvrages', 'Consultables', '3,410', 'bg-primary-fixed')}
                        ${renderStatCard('school', 'Réserves', 'Ressources', '12', 'bg-secondary-fixed')}
                        ${renderStatCard('description', 'Documents', 'Pédagogiques', '48', 'bg-tertiary-fixed')}
                        ${renderStatCard('location_city', 'Département', 'Accès spécial', '1', 'bg-primary-container', 'text-primary')}
                    </div>
                    <div class="bg-surface-container-lowest border border-outline-variant p-6 rounded-lg">
                        <h3 class="font-bold mb-4">Ressources départementales</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="bg-white border border-outline-variant p-4 rounded-lg">
                                <p class="text-[10px] uppercase text-on-surface-variant mb-2">Réserves scientifiques</p>
                                <p class="font-bold text-primary">15 titres</p>
                            </div>
                            <div class="bg-white border border-outline-variant p-4 rounded-lg">
                                <p class="text-[10px] uppercase text-on-surface-variant mb-2">Soutien pédagogique</p>
                                <p class="font-bold text-primary">4 dossiers</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        case 'professorAdmin':
            return `
                <div class="p-6 space-y-6">
                    <div class="flex items-baseline justify-between">
                        <div>
                            <h2 class="text-lg font-bold text-primary">Administration départementale</h2>
                            <p class="text-xs text-on-surface-variant">Statistiques et ressources académiques du département.</p>
                        </div>
                        <span class="text-xs text-on-surface-variant">Gestion académique et suivi pédagogique</span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        ${renderStatCard('analytics', 'Statistiques', 'Départementales', '72%', 'bg-primary-fixed')}
                        ${renderStatCard('inventory_2', 'Propositions', 'Ouvrages validés', '18', 'bg-secondary-fixed')}
                        ${renderStatCard('supervised_user_circle', 'Suivi', 'Activités pédagogiques', '6', 'bg-tertiary-fixed')}
                        ${renderStatCard('workspace_premium', 'Ressources', 'Supervisées', '34', 'bg-primary-container', 'text-primary')}
                    </div>
                    <div class="grid lg:grid-cols-2 gap-6">
                        <div class="bg-surface-container-lowest border border-outline-variant p-6 rounded-lg">
                            <h3 class="font-bold mb-4">Suivi des ressources</h3>
                            <div class="h-48 flex items-end gap-2 border-b border-outline-variant pb-2 px-2">
                                ${Array.from({ length: 7 }).map((_, i) => `
                                    <div class="w-full bg-secondary-container rounded-t-sm" style="height: ${30 + Math.random() * 50}%"></div>
                                `).join('')}
                            </div>
                            <div class="flex justify-between mt-2 text-[10px] font-bold text-on-surface-variant">
                                <span>LUN</span><span>MAR</span><span>MER</span><span>JEU</span><span>VEN</span><span>SAM</span><span>DIM</span>
                            </div>
                        </div>
                        <div class="bg-white border border-outline-variant p-6 rounded-lg">
                            <h3 class="font-bold mb-4">Actions du département</h3>
                            <p class="text-sm text-on-surface-variant leading-relaxed">Proposez de nouveaux ouvrages, gérez les ressources académiques et suivez les retours des élèves.</p>
                        </div>
                    </div>
                </div>
            `;
        default:
            return `
                <div class="p-6 space-y-6">
                    <div class="flex items-baseline justify-between">
                        <h2 class="text-lg font-bold text-primary">Vue d'ensemble de l'activité</h2>
                        <span class="text-xs text-on-surface-variant">Dernière mise à jour: Aujourd'hui, 10:45</span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        ${renderStatCard('person', '+4.2%', 'Étudiants Inscrits', '12,458', 'bg-primary-fixed')}
                        ${renderStatCard('login', 'Aujourd\'hui', 'Visites du jour', '842', 'bg-secondary-fixed')}
                        ${renderStatCard('menu_book', 'Total: 45k', 'Ouvrages Disponibles', '38,210', 'bg-tertiary-fixed')}
                        ${renderStatCard('outbound', '+12 en attente', 'Livres Empruntés', '6,790', 'bg-error-container', 'text-error')}
                    </div>
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div class="lg:col-span-2 bg-surface-container-lowest border border-outline-variant p-6 rounded-lg">
                            <h3 class="font-bold mb-6">Fréquentation de la Bibliothèque</h3>
                            <div class="h-64 flex items-end justify-between gap-2 border-b border-outline-variant pb-2 px-4">
                                ${[40, 60, 55, 85, 70, 90, 65, 45, 50, 95, 80, 75].map(h => `
                                    <div class="w-full bg-primary-container/20 rounded-t-sm" style="height: ${h}%"></div>
                                `).join('')}
                            </div>
                            <div class="flex justify-between mt-4 px-4 text-[10px] font-bold text-on-surface-variant">
                                <span>JAN</span><span>FÉV</span><span>MAR</span><span>AVR</span><span>MAI</span><span>JUN</span>
                                <span>JUL</span><span>AOU</span><span>SEP</span><span>OCT</span><span>NOV</span><span>DÉC</span>
                            </div>
                        </div>
                        <div class="bg-white border border-outline-variant flex flex-col rounded-lg">
                            <div class="p-4 border-b border-outline-variant flex items-center justify-between">
                                <h3 class="font-bold">Alertes & Retards</h3>
                                <span class="bg-error text-on-primary text-[10px] px-2 py-1 rounded">12 Critiques</span>
                            </div>
                            <div class="flex-grow overflow-y-auto max-h-[350px] p-4 space-y-4">
                                ${renderAlert('Mamadou Bah', 'Le Petit Prince', 'Retard: 8 jours')}
                                ${renderAlert('Mariama Sylla', 'Droit Constitutionnel', 'Retard: 5 jours')}
                                ${renderAlert('Ibrahima Diallo', 'Physique Quantique', 'Échéance: Demain', false)}
                            </div>
                            <button class="w-full p-4 text-primary text-[11px] font-bold uppercase border-t border-outline-variant hover:bg-surface-container transition-colors">Voir tous les litiges</button>
                        </div>
                    </div>
                </div>
            `;
    }
}

export const screens = {
    home: () => `
        <div class="min-h-screen bg-surface text-on-surface">
            <header class="sticky top-0 z-50 bg-surface-container-highest/95 backdrop-blur-md border-b border-outline-variant shadow-sm transition-shadow duration-300">
                <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                        <img src="/ule-logo.svg" alt="Logo Université de Labé" class="h-10 w-auto rounded-md border border-white/20 bg-white" />
                        <div>
                            <p class="text-sm font-bold text-primary">Gest Biblio</p>
                            <p class="text-[11px] text-on-surface-variant uppercase tracking-[0.2em]">Bibliothèque Universitaire</p>
                        </div>
                    </div>
                    <nav class="hidden lg:flex items-center gap-6 text-sm font-medium text-on-surface-variant">
                        <a href="#hero" class="hover:text-primary transition-colors">Accueil</a>
                        <a href="#features" class="hover:text-primary transition-colors">Fonctionnalités</a>
                        <a href="#departments" class="hover:text-primary transition-colors">Départements</a>
                        <a href="#stats" class="hover:text-primary transition-colors">Statistiques</a>
                        <a href="#about" class="hover:text-primary transition-colors">À propos</a>
                        <a href="#contact" class="hover:text-primary transition-colors">Contact</a>
                    </nav>
                    <div class="hidden lg:flex items-center gap-3">
                        <button onclick="navigate('login')" class="px-4 py-2 rounded-lg border border-outline-variant text-sm font-semibold text-primary hover:bg-surface transition-colors">Se connecter</button>
                        <button onclick="navigate('login')" class="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container transition-colors">Créer un compte</button>
                    </div>
                    <details class="lg:hidden">
                        <summary class="flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant text-sm font-semibold cursor-pointer text-primary">Menu</summary>
                        <div class="mt-2 rounded-xl bg-surface-container-low border border-outline-variant shadow-sm p-4 space-y-3">
                            <a href="#hero" class="block text-sm text-on-surface-variant hover:text-primary">Accueil</a>
                            <a href="#features" class="block text-sm text-on-surface-variant hover:text-primary">Fonctionnalités</a>
                            <a href="#departments" class="block text-sm text-on-surface-variant hover:text-primary">Départements</a>
                            <a href="#stats" class="block text-sm text-on-surface-variant hover:text-primary">Statistiques</a>
                            <a href="#about" class="block text-sm text-on-surface-variant hover:text-primary">À propos</a>
                            <a href="#contact" class="block text-sm text-on-surface-variant hover:text-primary">Contact</a>
                        </div>
                    </details>
                </div>
            </header>

            <main class="relative overflow-hidden">
                <section id="hero" class="relative overflow-hidden bg-primary text-on-primary">
                    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.14),_transparent_40%),_radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.08),_transparent_30%)]"></div>
                    <div class="max-w-7xl mx-auto px-4 py-20 lg:py-28 relative z-10">
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div class="space-y-6">
                                <p class="inline-flex items-center gap-2 rounded-full bg-primary-container/20 px-4 py-2 text-xs uppercase tracking-[0.25em] font-bold text-on-primary-container">Solution universitaire</p>
                                <h1 class="text-4xl lg:text-5xl font-bold leading-tight">Le système intelligent de gestion des bibliothèques universitaires</h1>
                                <p class="max-w-xl text-sm text-on-primary-container leading-7">Modernisez la gestion documentaire, le suivi des étudiants et les ressources académiques avec Gest Biblio.</p>
                                <div class="flex flex-col sm:flex-row gap-3 mt-6">
                                    <a href="#features" class="inline-flex items-center justify-center rounded-xl bg-white text-primary font-semibold px-6 py-3 shadow-lg hover:shadow-xl transition-shadow">Découvrir</a>
                                    <button onclick="navigate('login')" class="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white font-semibold px-6 py-3 hover:bg-white/20 transition-colors">Commencer</button>
                                </div>
                                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
                                    <div class="bg-white/10 border border-white/15 rounded-2xl p-4 text-center">
                                        <p class="text-3xl font-bold">25K+</p>
                                        <p class="text-xs uppercase tracking-[0.2em] text-on-primary-container mt-2">Livres</p>
                                    </div>
                                    <div class="bg-white/10 border border-white/15 rounded-2xl p-4 text-center">
                                        <p class="text-3xl font-bold">4.8K</p>
                                        <p class="text-xs uppercase tracking-[0.2em] text-on-primary-container mt-2">Étudiants</p>
                                    </div>
                                    <div class="bg-white/10 border border-white/15 rounded-2xl p-4 text-center">
                                        <p class="text-3xl font-bold">12</p>
                                        <p class="text-xs uppercase tracking-[0.2em] text-on-primary-container mt-2">Départements</p>
                                    </div>
                                    <div class="bg-white/10 border border-white/15 rounded-2xl p-4 text-center">
                                        <p class="text-3xl font-bold">98%</p>
                                        <p class="text-xs uppercase tracking-[0.2em] text-on-primary-container mt-2">Satisfaction</p>
                                    </div>
                                </div>
                            </div>
                            <div class="relative rounded-[2rem] bg-surface-container-low p-6 shadow-2xl overflow-hidden">
                                <div class="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-2xl"></div>
                                <div class="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_top_left,_rgba(0,10,30,0.14),_transparent_35%)]"></div>
                                <div class="relative bg-white rounded-[1.75rem] p-6 md:p-8">
                                    <img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800" alt="Bibliothèque numérique" class="w-full h-72 object-cover rounded-[1.5rem] shadow-lg" />
                                    <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div class="rounded-3xl bg-primary text-on-primary p-5 shadow-sm">
                                            <p class="text-xs uppercase tracking-[0.2em]">Interface</p>
                                            <p class="mt-3 text-sm">Pilotage centralisé de la bibliothèque universitaire.</p>
                                        </div>
                                        <div class="rounded-3xl bg-surface text-on-surface p-5 shadow-sm">
                                            <p class="text-xs uppercase tracking-[0.2em]">Digitalisation</p>
                                            <p class="mt-3 text-sm">Gestion fluide des prêts, retours et ressources.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="features" class="max-w-7xl mx-auto px-4 py-20">
                    <div class="text-center mb-12">
                        <p class="text-sm uppercase tracking-[0.3em] text-primary">Fonctionnalités</p>
                        <h2 class="text-3xl lg:text-4xl font-bold mt-4">Une suite complète pour la bibliothèque universitaire</h2>
                    </div>
                    <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                        ${['Gestion des étudiants','Catalogue intelligent','Gestion des emprunts','Statistiques','Gestion des départements','Recherche rapide','Tableau de bord','Gestion des rôles'].map((title, index) => `
                            <div class="group rounded-[1.5rem] border border-outline-variant bg-white p-6 shadow-sm hover:shadow-xl transition-shadow duration-300">
                                <div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl mb-5"><span class="material-symbols-outlined">${['group','book','assignment_return','insert_chart','apartment','search','dashboard','admin_panel_settings'][index]}</span></div>
                                <h3 class="font-semibold text-lg mb-3">${title}</h3>
                                <p class="text-sm text-on-surface-variant leading-6">${['Suivi des inscriptions et profils','Recherche intelligente des ouvrages','Emprunts et retours automatisés','Analyses en temps réel','Organisation des facultés et collections','Recherche instantanée par mots-clés','Vue globale et opérationnelle','Contrôle des accès et rôles'].map((text, i) => i === index ? text : null).filter(Boolean)[0]}</p>
                            </div>
                        `).join('')}
                    </div>
                </section>

                <section id="stats" class="bg-surface-container-low py-20">
                    <div class="max-w-7xl mx-auto px-4">
                        <div class="grid gap-6 md:grid-cols-4">
                            ${[['Livres','25K+','bg-primary'],['Étudiants','4.8K','bg-secondary'],['Départements','12','bg-tertiary-fixed'],['Emprunts','18K+','bg-primary-container']].map(([label,value,bg]) => `
                                <div class="rounded-[1.5rem] p-8 ${bg} text-on-primary shadow-lg">
                                    <p class="text-3xl font-bold">${value}</p>
                                    <p class="mt-3 uppercase tracking-[0.2em] text-xs">${label}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </section>

                <section id="departments" class="max-w-7xl mx-auto px-4 py-20">
                    <div class="text-center mb-12">
                        <p class="text-sm uppercase tracking-[0.3em] text-primary">Départements</p>
                        <h2 class="text-3xl lg:text-4xl font-bold mt-4">Couverture des facultés universitaires</h2>
                    </div>
                    <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                        ${[['Mathématiques','4,120','Ouvrages spécialisés en sciences'],['Informatique','3,820','Ressources numériques et AI'],['Physique','2,540','Collections de recherche avancées'],['Chimie','2,210','Manuels et articles techniques'],['Biologie','2,890','Ressources pour la recherche'],['Économie','3,100','Études et rapports économiques'],['Droit','2,670','Références juridiques complètes'],['Lettres','1,980','Patrimoine académique']].map(([name, count, desc]) => `
                            <div class="group rounded-[1.5rem] border border-outline-variant bg-white p-6 shadow-sm hover:shadow-xl transition-shadow duration-300">
                                <p class="text-sm uppercase tracking-[0.2em] text-on-surface-variant mb-4">${name}</p>
                                <p class="text-3xl font-bold text-primary mb-3">${count}</p>
                                <p class="text-sm text-on-surface-variant leading-6">${desc}</p>
                            </div>
                        `).join('')}
                    </div>
                </section>

                <section id="advantages" class="bg-primary text-on-primary py-20">
                    <div class="max-w-7xl mx-auto px-4">
                        <div class="text-center mb-12">
                            <p class="text-sm uppercase tracking-[0.3em] text-primary-container">Avantages</p>
                            <h2 class="text-3xl lg:text-4xl font-bold mt-4">Une bibliothèque plus intelligente, rapide et sécurisée</h2>
                        </div>
                        <div class="grid gap-6 md:grid-cols-3">
                            ${[['Digitalisation universitaire','Toutes les opérations en ligne et centralisées.'],['Gain de temps','Automatisation des prêts et retours.'],['Réduction du papier','Dossiers et rapports sans impression.'],['Meilleure organisation','Flux de travail structuré par rôle.'],['Sécurité des données','Contrôles d’accès et sauvegardes fiables.'],['Gestion intelligente','Tableaux de bord et analyses avancées.']].map(([title, desc]) => `
                                <div class="rounded-[1.5rem] border border-primary-container/25 bg-primary-container/5 p-6 shadow-sm hover:bg-primary-container/10 transition-colors duration-300">
                                    <p class="font-semibold text-lg mb-3">${title}</p>
                                    <p class="text-sm text-on-primary-container leading-6">${desc}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </section>

                <section id="testimonials" class="max-w-7xl mx-auto px-4 py-20">
                    <div class="text-center mb-12">
                        <p class="text-sm uppercase tracking-[0.3em] text-primary">Témoignages</p>
                        <h2 class="text-3xl lg:text-4xl font-bold mt-4">Ils font confiance à Gest Biblio</h2>
                    </div>
                    <div class="grid gap-6 md:grid-cols-3">
                        ${[['Sophie Martin','Étudiante','« Gest Biblio m’aide à trouver mes livres en quelques secondes, même pendant les périodes de rush. »'],['Karim Diallo','Bibliothécaire','« La gestion des emprunts est devenue beaucoup plus fluide et transparente. »'],['Dr. Amara Conte','Professeur','« Un outil indispensable pour suivre les ressources académiques et les statistiques de mon département. »']].map(([name, role, quote]) => `
                            <div class="group rounded-[1.5rem] border border-outline-variant bg-white p-6 shadow-sm hover:-translate-y-1 transition-transform duration-300">
                                <div class="flex items-center gap-4 mb-5">
                                    <div class="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">${name.toString().split(' ').map(n => n[0]).join('')}</div>
                                    <div>
                                        <p class="font-bold">${name}</p>
                                        <p class="text-xs uppercase tracking-[0.2em] text-on-surface-variant">${role}</p>
                                    </div>
                                </div>
                                <p class="text-sm text-on-surface-variant leading-7">${quote}</p>
                            </div>
                        `).join('')}
                    </div>
                </section>

                <section id="about" class="bg-surface-container-low py-20">
                    <div class="max-w-7xl mx-auto px-4 grid gap-10 lg:grid-cols-2 items-center">
                        <div>
                            <p class="text-sm uppercase tracking-[0.3em] text-primary">À propos</p>
                            <h2 class="text-3xl lg:text-4xl font-bold mt-4">Un système pensé pour l’enseignement supérieur</h2>
                            <p class="mt-6 text-sm text-on-surface-variant leading-7">Gest Biblio est conçu pour répondre aux besoins des recteurs, des bibliothécaires et des enseignants. Il propose une gestion centralisée et une expérience utilisateur moderne, tout en conservant un niveau de sécurité institutionnel.</p>
                        </div>
                        <div class="grid gap-5">
                            <div class="rounded-[1.5rem] border border-outline-variant bg-white p-6 shadow-sm">
                                <p class="text-sm uppercase tracking-[0.2em] text-primary">Sécurité</p>
                                <p class="mt-3 text-sm text-on-surface-variant">Contrôle des accès et protection des données sensibles.</p>
                            </div>
                            <div class="rounded-[1.5rem] border border-outline-variant bg-white p-6 shadow-sm">
                                <p class="text-sm uppercase tracking-[0.2em] text-primary">Performance</p>
                                <p class="mt-3 text-sm text-on-surface-variant">Interface rapide, responsive et adaptée aux flux universitaires.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="contact" class="max-w-7xl mx-auto px-4 py-20">
                    <div class="rounded-[2rem] bg-primary text-on-primary p-12 shadow-2xl">
                        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div>
                                <p class="text-sm uppercase tracking-[0.3em] text-primary-container">Prêt à démarrer ?</p>
                                <h2 class="text-3xl lg:text-4xl font-bold mt-4">Transformez votre bibliothèque universitaire dès aujourd’hui.</h2>
                            </div>
                            <div class="flex flex-col sm:flex-row gap-3">
                                <button onclick="navigate('login')" class="rounded-xl bg-white text-primary font-semibold px-6 py-3 hover:shadow-xl transition-shadow">Demander une démonstration</button>
                                <button onclick="navigate('login')" class="rounded-xl border border-white/30 bg-white/10 text-white font-semibold px-6 py-3 hover:bg-white/20 transition-colors">Commencer maintenant</button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer class="bg-surface-container-highest border-t border-outline-variant py-12">
                <div class="max-w-7xl mx-auto px-4 grid gap-8 lg:grid-cols-4">
                    <div>
                        <p class="text-lg font-bold text-primary">Gest Biblio</p>
                        <p class="mt-4 text-sm text-on-surface-variant leading-6">Système intelligent de gestion de bibliothèque universitaire pour les rectorats et campus modernes.</p>
                    </div>
                    <div>
                        <p class="text-sm font-bold uppercase tracking-[0.2em] mb-4 text-on-surface-variant">Navigation</p>
                        <div class="space-y-3 text-sm text-on-surface-variant">
                            <a href="#hero" class="block hover:text-primary transition-colors">Accueil</a>
                            <a href="#features" class="block hover:text-primary transition-colors">Fonctionnalités</a>
                            <a href="#departments" class="block hover:text-primary transition-colors">Départements</a>
                            <a href="#contact" class="block hover:text-primary transition-colors">Contact</a>
                        </div>
                    </div>
                    <div>
                        <p class="text-sm font-bold uppercase tracking-[0.2em] mb-4 text-on-surface-variant">Services</p>
                        <div class="space-y-3 text-sm text-on-surface-variant">
                            <span class="block">Gestion des prêts</span>
                            <span class="block">Catalogue intelligent</span>
                            <span class="block">Tableaux de bord</span>
                            <span class="block">Statistiques</span>
                        </div>
                    </div>
                    <div>
                        <p class="text-sm font-bold uppercase tracking-[0.2em] mb-4 text-on-surface-variant">Contact</p>
                        <div class="space-y-3 text-sm text-on-surface-variant">
                            <p>contact@gestbiblio.gn</p>
                            <p>+224 600 00 00 00</p>
                            <p>Université de Conakry, Guinée</p>
                        </div>
                        <div class="mt-6 flex items-center gap-3 text-primary">
                            <span class="material-symbols-outlined">facebook</span>
                            <span class="material-symbols-outlined">twitter</span>
                            <span class="material-symbols-outlined">linkedin</span>
                        </div>
                    </div>
                </div>
                <div class="mt-10 border-t border-outline-variant pt-6">
                    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div class="flex items-center gap-3">
                            <img src="/ule-logo.svg" alt="Logo Université de Labé" class="h-10 w-auto rounded-md border border-outline-variant bg-surface" />
                            <div>
                                <p class="font-semibold text-primary">Université de Labé</p>
                                <p class="text-xs text-on-surface-variant">Projet académique destiné à la modernisation de la bibliothèque universitaire.</p>
                            </div>
                        </div>
                        <p class="text-center text-xs text-on-surface-variant">© 2026 Gest Biblio • Tous droits réservés</p>
                    </div>
                </div>
            </footer>
        </div>
    `,
    login: () => `
        <div class="min-h-screen flex items-center justify-center p-4 administrative-pattern bg-surface">
            <main class="w-full max-w-[460px]">
                <div class="rounded-[2rem] overflow-hidden border border-outline-variant bg-white shadow-2xl">
                    <div class="bg-primary text-on-primary px-8 py-12 text-center">
                        <div class="mx-auto mb-5 inline-flex items-center justify-center rounded-3xl bg-white/95 p-3 shadow-sm border border-white/20">
                            <img src="/ule-logo.svg" alt="Logo Université de Labé" class="h-12 w-auto" />
                        </div>
                        <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white text-primary text-3xl shadow-sm">
                            <span class="material-symbols-outlined">account_balance</span>
                        </div>
                        <p class="text-xs uppercase tracking-[0.3em] text-on-primary-container/80 mb-2">Université de Labé</p>
                        <h1 class="text-3xl font-bold">Gest Biblio</h1>
                        <p class="mt-3 text-sm text-primary/70">Bienvenue au Système de Gestion de la Bibliothèque</p>
                    </div>

                    <div class="p-8">
                        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                            <div class="flex gap-2 rounded-full bg-surface-container-low p-1">
                                <button id="auth-tab-login" onclick="window.authUI.switchTab('login')" class="rounded-full px-4 py-2 text-sm font-semibold transition-colors ${window.authUI?.currentTab === 'login' ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-primary'}">Se connecter</button>
                                <button id="auth-tab-register" onclick="window.authUI.switchTab('register')" class="rounded-full px-4 py-2 text-sm font-semibold transition-colors ${window.authUI?.currentTab === 'register' ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-primary'}">Créer un compte</button>
                            </div>
                            <div class="text-[11px] text-on-surface-variant">Université • Système Interne</div>
                        </div>

                        <form id="auth-form" onsubmit="window.authUI.submitForm(event)" class="space-y-6">
                            <!-- LOGIN PANE -->
                            <div id="auth-pane-login" class="space-y-4">
                                <div class="space-y-2">
                                    <label class="block text-[11px] font-bold uppercase text-on-surface-variant">Nom d'utilisateur *</label>
                                    <div class="relative">
                                        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">person</span>
                                        <input id="login-username" type="text" class="block w-full rounded-xl border border-outline-variant bg-surface px-3 py-3 pl-10 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="ex: admin_central">
                                        <div id="err-login-username" class="auth-error text-error text-xs mt-1"></div>
                                    </div>
                                </div>
                                <div class="space-y-2">
                                    <div class="flex justify-between items-center">
                                        <label class="block text-[11px] font-bold uppercase text-on-surface-variant">Mot de passe *</label>
                                        <a href="#" class="text-xs text-primary hover:underline">Oublié ?</a>
                                    </div>
                                    <div class="relative">
                                        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">lock</span>
                                        <input id="login-password" type="password" class="block w-full rounded-xl border border-outline-variant bg-surface px-3 py-3 pl-10 pr-10 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="••••••••">
                                        <button type="button" onclick="window.authUI.togglePassword('login-password')" class="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">Voir</button>
                                        <div id="err-login-password" class="auth-error text-error text-xs mt-1"></div>
                                    </div>
                                </div>

                                <div class="flex items-center justify-between text-sm text-on-surface-variant">
                                    <label class="flex items-center gap-2"><input type="checkbox" class="rounded"/> Se souvenir de moi</label>
                                    <a href="#" class="text-primary hover:underline">Assistance</a>
                                </div>

                                <button id="auth-submit" type="submit" class="w-full rounded-xl bg-primary text-on-primary py-3 text-sm font-semibold hover:bg-primary-container transition-colors flex items-center justify-center gap-2">
                                    <span>Se connecter</span>
                                    <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </button>
                            </div>

                            <!-- REGISTER PANE -->
                            <div id="auth-pane-register" class="hidden space-y-4">
                                <div>
                                    <p class="text-xs text-on-surface-variant mb-2 font-bold uppercase">Type de compte</p>
                                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div data-auth-role="librarian" onclick="window.authUI.selectRole('librarian')" role="button" tabindex="0" class="cursor-pointer rounded-3xl border border-outline-variant bg-surface p-4 text-center transition-all duration-200 hover:shadow-md">
                                            <div class="mb-3 flex items-center justify-center h-10 w-10 rounded-full bg-primary-fixed text-on-primary mx-auto">
                                                <span class="material-symbols-outlined">manage_accounts</span>
                                            </div>
                                            <div class="font-semibold">Bibliothécaire</div>
                                            <div class="text-[11px] text-on-surface-variant mt-2">Accès complet à la gestion de la bibliothèque</div>
                                        </div>
                                        <div data-auth-role="student" onclick="window.authUI.selectRole('student')" role="button" tabindex="0" class="cursor-pointer rounded-3xl border border-outline-variant bg-surface p-4 text-center transition-all duration-200 hover:shadow-md">
                                            <div class="mb-3 flex items-center justify-center h-10 w-10 rounded-full bg-secondary-container text-on-secondary-container mx-auto">
                                                <span class="material-symbols-outlined">school</span>
                                            </div>
                                            <div class="font-semibold">Étudiant</div>
                                            <div class="text-[11px] text-on-surface-variant mt-2">Accès aux ressources et services</div>
                                        </div>
                                        <div data-auth-role="professor" onclick="window.authUI.selectRole('professor')" role="button" tabindex="0" class="cursor-pointer rounded-3xl border border-outline-variant bg-surface p-4 text-center transition-all duration-200 hover:shadow-md">
                                            <div class="mb-3 flex items-center justify-center h-10 w-10 rounded-full bg-tertiary-fixed text-on-tertiary-fixed mx-auto">
                                                <span class="material-symbols-outlined">school</span>
                                            </div>
                                            <div class="font-semibold">Professeur</div>
                                            <div class="text-[11px] text-on-surface-variant mt-2">Accès aux ressources académiques et suivi pédagogique</div>
                                        </div>
                                    </div>
                                </div>

                                <div class="grid gap-4">
                                    <div class="text-sm uppercase tracking-[0.3em] text-on-surface-variant font-bold">Informations personnelles</div>
                                    <div class="grid gap-4 sm:grid-cols-2">
                                        <div class="space-y-3">
                                            <label class="block text-[11px] font-bold uppercase text-on-surface-variant">Nom complet *</label>
                                            <input id="reg-fullname" type="text" class="w-full rounded-xl border border-outline-variant bg-surface px-3 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Ex: Aminata Diallo">
                                            <div id="err-reg-fullname" class="auth-error text-error text-xs mt-1"></div>
                                        </div>
                                        <div class="space-y-3">
                                            <label class="block text-[11px] font-bold uppercase text-on-surface-variant">Nom d'utilisateur *</label>
                                            <input id="reg-username" type="text" class="w-full rounded-xl border border-outline-variant bg-surface px-3 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Nom d'utilisateur">
                                            <div id="err-reg-username" class="auth-error text-error text-xs mt-1"></div>
                                        </div>
                                    </div>
                                    <div class="grid gap-4 sm:grid-cols-2">
                                        <div class="space-y-3">
                                            <label class="block text-[11px] font-bold uppercase text-on-surface-variant">Sexe *</label>
                                            <select id="reg-sex" class="w-full rounded-xl border border-outline-variant bg-surface px-3 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                                                <option value="">Sélectionner</option>
                                                <option value="Femme">Femme</option>
                                                <option value="Homme">Homme</option>
                                                <option value="Autre">Autre</option>
                                            </select>
                                            <div id="err-reg-sex" class="auth-error text-error text-xs mt-1"></div>
                                        </div>
                                        <div class="space-y-3">
                                            <label class="block text-[11px] font-bold uppercase text-on-surface-variant">Date de naissance *</label>
                                            <input id="reg-dob" type="date" class="w-full rounded-xl border border-outline-variant bg-surface px-3 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                                            <div id="err-reg-dob" class="auth-error text-error text-xs mt-1"></div>
                                        </div>
                                    </div>
                                    <div class="grid gap-4 sm:grid-cols-2">
                                        <div class="space-y-3">
                                            <label class="block text-[11px] font-bold uppercase text-on-surface-variant">Téléphone *</label>
                                            <input id="reg-phone" type="tel" class="w-full rounded-xl border border-outline-variant bg-surface px-3 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="+224 600 00 00 00">
                                            <div id="err-reg-phone" class="auth-error text-error text-xs mt-1"></div>
                                        </div>
                                        <div class="space-y-3">
                                            <label class="block text-[11px] font-bold uppercase text-on-surface-variant">Email *</label>
                                            <input id="reg-email" type="email" class="w-full rounded-xl border border-outline-variant bg-surface px-3 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="votre@institution.gn">
                                            <div id="err-reg-email" class="auth-error text-error text-xs mt-1"></div>
                                        </div>
                                    </div>
                                    <div class="space-y-3">
                                        <label class="block text-[11px] font-bold uppercase text-on-surface-variant">Adresse *</label>
                                        <input id="reg-address" type="text" class="w-full rounded-xl border border-outline-variant bg-surface px-3 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Adresse complète">
                                        <div id="err-reg-address" class="auth-error text-error text-xs mt-1"></div>
                                    </div>
                                </div>

                                <div class="grid gap-4">
                                    <div class="text-sm uppercase tracking-[0.3em] text-on-surface-variant font-bold">Informations académiques</div>
                                    <div class="grid gap-4 sm:grid-cols-2">
                                        <div class="space-y-3">
                                            <label class="block text-[11px] font-bold uppercase text-on-surface-variant">INE / Matricule *</label>
                                            <input id="reg-ine" type="text" class="w-full rounded-xl border border-outline-variant bg-surface px-3 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="INE / Matricule">
                                            <div id="err-reg-ine" class="auth-error text-error text-xs mt-1"></div>
                                        </div>
                                        <div class="space-y-3">
                                            <label class="block text-[11px] font-bold uppercase text-on-surface-variant">Faculté *</label>
                                            <input id="reg-faculty" type="text" class="w-full rounded-xl border border-outline-variant bg-surface px-3 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Faculté">
                                            <div id="err-reg-faculty" class="auth-error text-error text-xs mt-1"></div>
                                        </div>
                                    </div>
                                    <div class="grid gap-4 sm:grid-cols-2">
                                        <div class="space-y-3">
                                            <label class="block text-[11px] font-bold uppercase text-on-surface-variant">Département *</label>
                                            <input id="reg-department" type="text" class="w-full rounded-xl border border-outline-variant bg-surface px-3 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Département">
                                            <div id="err-reg-department" class="auth-error text-error text-xs mt-1"></div>
                                        </div>
                                        <div class="space-y-3">
                                            <label class="block text-[11px] font-bold uppercase text-on-surface-variant">Niveau *</label>
                                            <input id="reg-level" type="text" class="w-full rounded-xl border border-outline-variant bg-surface px-3 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Ex: L2">
                                            <div id="err-reg-level" class="auth-error text-error text-xs mt-1"></div>
                                        </div>
                                    </div>
                                    <div class="grid gap-4 sm:grid-cols-2">
                                        <div class="space-y-3">
                                            <label class="block text-[11px] font-bold uppercase text-on-surface-variant">Filière *</label>
                                            <input id="reg-filiere" type="text" class="w-full rounded-xl border border-outline-variant bg-surface px-3 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Filière">
                                            <div id="err-reg-filiere" class="auth-error text-error text-xs mt-1"></div>
                                        </div>
                                        <div class="space-y-3">
                                            <label class="block text-[11px] font-bold uppercase text-on-surface-variant">Année universitaire *</label>
                                            <input id="reg-academic-year" type="text" class="w-full rounded-xl border border-outline-variant bg-surface px-3 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="2025/2026">
                                            <div id="err-reg-academic-year" class="auth-error text-error text-xs mt-1"></div>
                                        </div>
                                    </div>
                                </div>

                                <div class="grid gap-4">
                                    <div class="text-sm uppercase tracking-[0.3em] text-on-surface-variant font-bold">Documents</div>
                                    <div class="grid gap-4 sm:grid-cols-2">
                                        <div class="space-y-3">
                                            <label class="block text-[11px] font-bold uppercase text-on-surface-variant">Photo de profil</label>
                                            <input id="reg-photo" type="file" accept="image/*" class="w-full text-sm text-on-surface-variant" />
                                        </div>
                                        <div class="space-y-3">
                                            <label class="block text-[11px] font-bold uppercase text-on-surface-variant">Pièce justificative</label>
                                            <input id="reg-document" type="file" accept=".pdf,.jpg,.jpeg,.png" class="w-full text-sm text-on-surface-variant" />
                                        </div>
                                    </div>
                                </div>

                                <div class="grid grid-cols-2 gap-3">
                                    <div>
                                        <label class="text-[11px] font-bold uppercase text-on-surface-variant">Mot de passe *</label>
                                        <div class="relative">
                                            <input id="reg-password" type="password" class="w-full rounded-xl border border-outline-variant bg-surface px-3 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="••••••">
                                            <button type="button" onclick="window.authUI.togglePassword('reg-password')" class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">Voir</button>
                                        </div>
                                        <div id="err-reg-password" class="auth-error text-error text-xs mt-1"></div>
                                    </div>
                                    <div>
                                        <label class="text-[11px] font-bold uppercase text-on-surface-variant">Confirmer *</label>
                                        <input id="reg-password-confirm" type="password" class="w-full rounded-xl border border-outline-variant bg-surface px-3 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="••••••">
                                        <div id="err-reg-password-confirm" class="auth-error text-error text-xs mt-1"></div>
                                    </div>
                                </div>

                                <div data-role-group="librarian" class="space-y-3">
                                    <div>
                                        <label class="text-[11px] font-bold uppercase text-on-surface-variant">Identifiant professionnel *</label>
                                        <input id="reg-profid" type="text" class="w-full rounded-xl border border-outline-variant bg-surface px-3 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="ID professionnel">
                                        <div id="err-reg-profid" class="auth-error text-error text-xs mt-1"></div>
                                    </div>
                                </div>
                                <div data-role-group="professor" class="hidden space-y-3">
                                    <div>
                                        <label class="text-[11px] font-bold uppercase text-on-surface-variant">Matricule professionnel *</label>
                                        <input id="reg-matricule" type="text" class="w-full rounded-xl border border-outline-variant bg-surface px-3 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Matricule">
                                        <div id="err-reg-matricule" class="auth-error text-error text-xs mt-1"></div>
                                    </div>
                                    <div class="grid grid-cols-2 gap-3">
                                        <input id="reg-dept-prof" type="text" class="w-full rounded-xl border border-outline-variant bg-surface px-3 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Département">
                                        <input id="reg-grade" type="text" class="w-full rounded-xl border border-outline-variant bg-surface px-3 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Grade / Fonction">
                                    </div>
                                </div>

                                <button id="auth-submit" type="submit" class="w-full rounded-xl bg-primary text-on-primary py-3 text-sm font-semibold hover:bg-primary-container transition-colors flex items-center justify-center gap-2">
                                    <span>Créer le compte</span>
                                    <span class="material-symbols-outlined text-[18px]">person_add</span>
                                </button>
                            </div>

                            <div class="pt-4 border-t border-outline-variant">
                                <div class="flex items-start gap-3 p-3 rounded-2xl bg-surface-container-lowest">
                                    <span class="material-symbols-outlined text-on-surface-variant text-[20px]">verified_user</span>
                                    <p class="text-xs text-on-surface-variant leading-tight">Accès restreint au personnel autorisé. Toutes les sessions sont enregistrées.</p>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <footer class="mt-6 text-center text-[11px] text-on-surface-variant">
                    <p>© 2024 Gest Biblio - République de Guinée</p>
                </footer>

                <div id="auth-toast" class="fixed bottom-8 right-8 bg-primary text-on-primary rounded px-4 py-2 transition-all transform duration-300 opacity-0 translate-y-2"></div>
            </main>
        </div>
    `,
    dashboard: () => `
        <div class="flex min-h-screen">
            ${getSidebar('dashboard', window.authUI?.currentRole || 'admin')}
            <main class="flex-grow ml-[260px]">
                ${getTopBar(getRoleLabel(window.authUI?.currentRole || 'admin'))}
                ${renderDashboardContent(window.authUI?.currentRole || 'admin')}
            </main>
        </div>
    `,
    students: () => `
        <div class="flex min-h-screen">
            ${getSidebar('students', window.authUI?.currentRole || 'admin')}
            <main class="flex-grow ml-[260px]">
                ${getTopBar(getRoleLabel(window.authUI?.currentRole || 'admin'))}
                <div class="p-6 space-y-6">
                    <div class="flex justify-between items-end">
                        <div>
                            <p class="text-xs text-on-surface-variant mb-1">Dashboard / <span class="text-primary font-semibold">Gestion des Étudiants</span></p>
                            <h2 class="text-lg font-bold text-primary">Registre des Étudiants</h2>
                        </div>
                        <div class="flex gap-2">
                             <button class="px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded text-xs font-semibold hover:bg-surface-container transition-colors flex items-center gap-2">
                                <span class="material-symbols-outlined text-sm">download</span> Exporter
                            </button>
                            <button class="px-4 py-2 bg-primary text-on-primary rounded text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
                                <span class="material-symbols-outlined text-sm">person_add</span> Ajouter un étudiant
                            </button>
                        </div>
                    </div>
                    
                    <div class="bg-surface-container-lowest border border-outline-variant p-4 flex flex-wrap gap-4 items-center rounded-lg">
                        <div class="flex flex-col gap-1">
                            <label class="text-[10px] font-bold uppercase text-on-surface-variant">Département</label>
                            <select class="bg-white border border-outline-variant rounded px-3 py-1.5 text-xs">
                                <option>Tous les départements</option>
                            </select>
                        </div>
                        <div class="flex flex-col gap-1">
                            <label class="text-[10px] font-bold uppercase text-on-surface-variant">Statut</label>
                            <select class="bg-white border border-outline-variant rounded px-3 py-1.5 text-xs">
                                <option>Tous les statuts</option>
                            </select>
                        </div>
                        <button class="ml-auto text-primary text-xs font-semibold flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm">filter_list_off</span> Réinitialiser
                        </button>
                    </div>

                    <div class="bg-white border border-outline-variant rounded-lg overflow-hidden">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-surface-container-low border-b border-outline-variant">
                                    <th class="px-4 py-3 text-[10px] font-bold uppercase text-on-surface-variant">Nom Complet</th>
                                    <th class="px-4 py-3 text-[10px] font-bold uppercase text-on-surface-variant">ID Étudiant</th>
                                    <th class="px-4 py-3 text-[10px] font-bold uppercase text-on-surface-variant">Département</th>
                                    <th class="px-4 py-3 text-[10px] font-bold uppercase text-on-surface-variant">Statut</th>
                                    <th class="px-4 py-3 text-[10px] font-bold uppercase text-on-surface-variant text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="text-sm divide-y divide-outline-variant">
                                ${renderStudentRow('Mamadou Barry', 'm.barry@univ.gn', '#2024-UG-00124', 'Génie Informatique', 'Actif')}
                                ${renderStudentRow('Aissatou Sow', 'a.sow@univ.gn', '#2024-UG-00892', 'Médecine', 'Actif')}
                                ${renderStudentRow('Camara Kadiatou', 'c.kadi@univ.gn', '#2024-UG-01445', 'Droit Public', 'Suspendu', 'bg-error-container text-error')}
                                ${renderStudentRow('Oumar Diallo', 'o.diallo@univ.gn', '#2024-UG-00054', 'Économie', 'Actif')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    `,
    books: () => `
        <div class="flex min-h-screen">
            ${getSidebar('books', window.authUI?.currentRole || 'admin')}
            <main class="flex-grow ml-[260px]">
                ${getTopBar(getRoleLabel(window.authUI?.currentRole || 'admin'))}
                <div class="p-6 space-y-6">
                    <div class="flex justify-between items-center">
                        <h2 class="text-lg font-bold text-primary">Catalogue des Ouvrages</h2>
                        <button class="bg-primary text-on-primary px-6 py-2 rounded text-xs font-bold flex items-center gap-2">
                             <span class="material-symbols-outlined text-sm">add</span> Ajouter un ouvrage
                        </button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="bg-white p-4 border border-outline-variant rounded flex items-center gap-4">
                            <div class="p-3 bg-secondary-container rounded text-on-secondary-container">
                                <span class="material-symbols-outlined">library_books</span>
                            </div>
                            <div>
                                <p class="text-[10px] uppercase text-on-surface-variant">Total Ouvrages</p>
                                <p class="text-xl font-bold text-primary">12,840</p>
                            </div>
                        </div>
                        <div class="bg-white p-4 border border-outline-variant rounded flex items-center gap-4">
                            <div class="p-3 bg-tertiary-fixed rounded text-on-tertiary-fixed">
                                <span class="material-symbols-outlined">assignment_return</span>
                            </div>
                            <div>
                                <p class="text-[10px] uppercase text-on-surface-variant">Emprunts en cours</p>
                                <p class="text-xl font-bold text-primary">432</p>
                            </div>
                        </div>
                        <div class="bg-white p-4 border border-outline-variant rounded flex items-center gap-4">
                            <div class="p-3 bg-error-container rounded text-error">
                                <span class="material-symbols-outlined">report_problem</span>
                            </div>
                            <div>
                                <p class="text-[10px] uppercase text-on-surface-variant">Retards</p>
                                <p class="text-xl font-bold text-error">15</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white border border-outline-variant rounded-lg overflow-hidden">
                        <table class="w-full text-left border-collapse">
                             <thead class="bg-surface-container-low border-b border-outline-variant">
                                <tr class="text-[10px] font-bold uppercase text-on-surface-variant">
                                    <th class="px-4 py-3">Titre</th>
                                    <th class="px-4 py-3">Auteur</th>
                                    <th class="px-4 py-3">ISBN</th>
                                    <th class="px-4 py-3">Status</th>
                                    <th class="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="text-sm divide-y divide-outline-variant">
                                ${renderBookRow('Constitution de la Guinée', 'Archives Nationales', '978-2-342', 'Disponible')}
                                ${renderBookRow('Macroéconomie Appliquée', 'Mamadou Bah', '978-2-123', 'Emprunté', 'bg-tertiary-fixed text-on-tertiary-fixed')}
                                ${renderBookRow('Anatomie Humaine Vol. I', 'Dr. Diallo S.', '978-3-888', 'Disponible')}
                                ${renderBookRow('Histoire de la Guinée', 'Camara L.', '978-1-555', 'Disponible')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    `,
    attendance: () => `
        <div class="flex min-h-screen">
            ${getSidebar('attendance', window.authUI?.currentRole || 'admin')}
            <main class="flex-grow ml-[260px]">
                ${getTopBar(getRoleLabel(window.authUI?.currentRole || 'admin'))}
                <div class="p-6">
                    <div class="grid grid-cols-12 gap-6">
                        <section class="col-span-12 lg:col-span-4 space-y-6">
                            <div class="bg-white border border-outline-variant rounded-lg p-6">
                                <h3 class="font-bold text-primary mb-6">Contrôle d'Entrée</h3>
                                <div class="aspect-square bg-surface border-2 border-dashed border-outline-variant rounded flex flex-col items-center justify-center relative mb-6">
                                    <span class="material-symbols-outlined text-5xl text-outline mb-2">qr_code_scanner</span>
                                    <p class="text-[10px] font-bold uppercase text-outline">Scanner le QR Code</p>
                                </div>
                                <div class="space-y-4">
                                     <div>
                                        <label class="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Identifiant Étudiant</label>
                                        <div class="flex gap-2">
                                            <input type="text" class="flex-1 border border-outline-variant rounded px-3 py-2 text-sm outline-none" placeholder="Ex: MAT-2024-001">
                                            <button class="bg-primary text-on-primary px-4 py-2 rounded text-[10px] font-bold uppercase">Valider</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-white border border-outline-variant rounded-lg p-6 flex justify-between gap-4">
                                <div class="flex-1 p-3 bg-surface-container rounded border border-outline-variant/30">
                                    <p class="text-[10px] text-on-surface-variant uppercase mb-1">Entrées</p>
                                    <p class="text-2xl font-bold text-primary">142</p>
                                </div>
                                <div class="flex-1 p-3 bg-surface-container rounded border border-outline-variant/30">
                                    <p class="text-[10px] text-on-surface-variant uppercase mb-1">Actuels</p>
                                    <p class="text-2xl font-bold text-primary">38</p>
                                </div>
                            </div>
                        </section>
                        <section class="col-span-12 lg:col-span-8 space-y-6">
                             <div class="bg-white border border-outline-variant rounded-lg overflow-hidden">
                                <div class="p-4 bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
                                    <span class="font-bold">Journal des Présences</span>
                                    <button class="text-primary text-xs font-bold border border-primary/20 px-3 py-1 rounded">EXPORTER PDF</button>
                                </div>
                                <table class="w-full text-sm">
                                    <thead>
                                        <tr class="bg-surface-container-low/50 text-[10px] uppercase font-bold text-on-surface-variant border-b border-outline-variant">
                                            <th class="px-4 py-3">Heure</th>
                                            <th class="px-4 py-3">Étudiant</th>
                                            <th class="px-4 py-3">Action</th>
                                            <th class="px-4 py-3 text-right">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-outline-variant">
                                        ${renderAttendanceRow('10:45', 'Alpha BALDÉ', 'Entrée', 'Autorisé', 'bg-green-100 text-green-800')}
                                        ${renderAttendanceRow('10:38', 'Mariam CAMARA', 'Sortie', 'Terminé', 'bg-blue-100 text-blue-800')}
                                        ${renderAttendanceRow('10:22', 'Ousmane DIALLO', 'Entrée', 'Alerte Frais', 'bg-error-container text-error')}
                                        ${renderAttendanceRow('10:15', 'Fatoumata KEITA', 'Entrée', 'Autorisé', 'bg-green-100 text-green-800')}
                                    </tbody>
                                </table>
                             </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    `,
    stats: () => `
         <div class="flex min-h-screen">
            ${getSidebar('stats', window.authUI?.currentRole || 'admin')}
            <main class="flex-grow ml-[260px]">
                ${getTopBar(getRoleLabel(window.authUI?.currentRole || 'admin'))}
                <div class="p-6 space-y-6">
                    <h2 class="text-lg font-bold text-primary">Rapports et Statistiques</h2>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div class="bg-white p-6 border border-outline-variant rounded-lg">
                            <p class="text-[11px] font-bold text-on-surface-variant uppercase mb-2">Total Emprunts</p>
                            <div class="flex items-end gap-2">
                                <span class="text-2xl font-bold text-primary">12,482</span>
                                <span class="text-xs text-green-600 font-bold mb-1">↑ 12%</span>
                            </div>
                        </div>
                        <div class="bg-white p-6 border border-outline-variant rounded-lg">
                            <p class="text-[11px] font-bold text-on-surface-variant uppercase mb-2">Fréquentation Hebdo</p>
                            <div class="flex items-end gap-2">
                                <span class="text-2xl font-bold text-primary">2,150</span>
                                <span class="text-xs text-error font-bold mb-1">↓ 3%</span>
                            </div>
                        </div>
                         <div class="bg-white p-6 border border-outline-variant rounded-lg">
                            <p class="text-[11px] font-bold text-on-surface-variant uppercase mb-2">Satisfaction</p>
                            <div class="flex items-end gap-2">
                                <span class="text-2xl font-bold text-primary">94%</span>
                                <span class="text-xs text-green-600 font-bold mb-1">stable</span>
                            </div>
                        </div>
                        <div class="bg-white p-6 border border-outline-variant rounded-lg">
                            <p class="text-[11px] font-bold text-on-surface-variant uppercase mb-2">Budget Livre</p>
                            <div class="flex items-end gap-2">
                                <span class="text-2xl font-bold text-primary">2.4M</span>
                                <span class="text-xs text-green-600 font-bold mb-1">↑ 5%</span>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div class="bg-white border border-outline-variant p-6 rounded-lg">
                            <h3 class="font-bold mb-4">Répartition par Faculté</h3>
                            <div class="flex items-center gap-8">
                                <div class="w-32 h-32 rounded-full border-[12px] border-primary border-t-secondary relative flex items-center justify-center">
                                    <span class="text-lg font-bold">8.4k</span>
                                </div>
                                <div class="space-y-2 flex-grow">
                                    ${renderProgress('Droit', 42, 'bg-primary')}
                                    ${renderProgress('Médecine', 28, 'bg-secondary')}
                                    ${renderProgress('Informatique', 18, 'bg-primary-fixed')}
                                    ${renderProgress('Autres', 12, 'bg-outline-variant')}
                                </div>
                            </div>
                        </div>
                         <div class="bg-white border border-outline-variant p-6 rounded-lg">
                            <h3 class="font-bold mb-4">Taux de retour</h3>
                            <div class="h-48 flex items-end justify-between gap-4 border-b border-outline-variant px-2">
                                ${Array.from({ length: 7 }).map((_, i) => `
                                    <div class="w-full bg-secondary-container rounded-t-sm" style="height: ${40 + Math.random() * 50}%"></div>
                                `).join('')}
                            </div>
                            <div class="flex justify-between mt-2 text-[10px] font-bold text-on-surface-variant">
                                <span>LUN</span><span>MAR</span><span>MER</span><span>JEU</span><span>VEN</span><span>SAM</span><span>DIM</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
         </div>
    `,
    interface: () => `
        <div class="flex min-h-screen">
            ${getSidebar('interface', window.authUI?.currentRole || 'admin')}
            <main class="flex-grow ml-[260px]">
                ${getTopBar(getRoleLabel(window.authUI?.currentRole || 'admin'))}
                <div class="p-6 space-y-8">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <button class="flex flex-col items-center justify-center p-8 bg-primary text-on-primary rounded-xl hover:opacity-90 transition-all">
                             <span class="material-symbols-outlined text-4xl mb-3">input</span>
                             <span class="font-bold">Enregistrer un emprunt</span>
                        </button>
                        <button class="flex flex-col items-center justify-center p-8 bg-white border border-outline-variant text-primary rounded-xl hover:bg-surface transition-all">
                             <span class="material-symbols-outlined text-4xl mb-3">keyboard_return</span>
                             <span class="font-bold">Retour de livre</span>
                        </button>
                        <button class="flex flex-col items-center justify-center p-8 bg-white border border-outline-variant text-primary rounded-xl hover:bg-surface transition-all">
                             <span class="material-symbols-outlined text-4xl mb-3">manage_accounts</span>
                             <span class="font-bold">Gestion des comptes</span>
                        </button>
                    </div>

                    <div class="bg-white border border-outline-variant rounded-lg overflow-hidden">
                        <div class="p-4 border-b border-outline-variant flex items-center justify-between">
                            <h3 class="font-bold">Dernières opérations</h3>
                            <button class="text-primary text-xs font-bold hover:underline">Tout voir</button>
                        </div>
                        <div class="divide-y divide-outline-variant">
                            ${renderOpRow('Alpha Baldé', 'Constitution de la Guinée', 'Emprunt', '10:45')}
                            ${renderOpRow('Mariam Camara', 'Macroéconomie', 'Retour', '10:38')}
                            ${renderOpRow('Ibrahima Diallo', 'Physique Quantique', 'Emprunt', '10:22')}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    `
};

// Helpers for repetitive HTML
function renderStatCard(icon: string, change: string, label: string, value: string, iconBg: string, changeColor: string = 'text-green-700') {
    return `
        <div class="bg-surface-container-lowest border border-outline-variant p-4 rounded-lg flex flex-col gap-2">
            <div class="flex justify-between items-start">
                <span class="material-symbols-outlined text-primary p-2 ${iconBg} rounded">${icon}</span>
                <span class="text-[10px] font-bold ${changeColor} bg-surface-container-high px-2 py-0.5 rounded">${change}</span>
            </div>
            <span class="text-xs text-on-surface-variant">${label}</span>
            <span class="text-2xl font-bold text-primary">${value}</span>
        </div>
    `;
}

function renderAlert(name: string, book: string, time: string, isError: boolean = true) {
    return `
        <div class="flex gap-3 p-2 hover:bg-surface-container transition-colors rounded">
            <span class="material-symbols-outlined ${isError ? 'text-error' : 'text-on-tertiary-container'}">${isError ? 'warning' : 'info'}</span>
            <div class="flex flex-col">
                <span class="text-sm font-bold">${name}</span>
                <span class="text-xs text-on-surface-variant italic">"${book}"</span>
                <span class="text-[10px] font-bold ${isError ? 'text-error' : 'text-on-tertiary-container'} mt-1">${time}</span>
            </div>
        </div>
    `;
}

function renderStudentRow(name: string, email: string, id: string, dept: string, status: string, statusClass: string = 'bg-green-100 text-green-800') {
    return `
        <tr class="hover:bg-surface-container transition-colors">
            <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded bg-primary-fixed flex items-center justify-center text-primary font-bold text-xs">${name.split(' ').map(n=>n[0]).join('')}</div>
                    <div>
                        <div class="font-bold">${name}</div>
                        <div class="text-[10px] text-on-surface-variant">${email}</div>
                    </div>
                </div>
            </td>
            <td class="px-4 py-3 text-on-surface-variant">${id}</td>
            <td class="px-4 py-3">${dept}</td>
            <td class="px-4 py-3">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${statusClass}">${status}</span>
            </td>
            <td class="px-4 py-3 text-right">
                <button class="text-primary material-symbols-outlined text-lg">edit</button>
            </td>
        </tr>
    `;
}

function renderBookRow(title: string, author: string, isbn: string, status: string, statusClass: string = 'bg-secondary-container text-on-secondary-container') {
    return `
        <tr class="hover:bg-surface-container transition-colors">
            <td class="px-4 py-4 font-semibold text-primary">${title}</td>
            <td class="px-4 py-4 text-xs">${author}</td>
            <td class="px-4 py-4 text-xs font-mono">${isbn}</td>
            <td class="px-4 py-4">
                <span class="px-2 py-1 rounded text-[10px] font-bold uppercase ${statusClass}">${status}</span>
            </td>
            <td class="px-4 py-4 text-right">
                <button class="text-outline material-symbols-outlined text-lg hover:text-primary">more_vert</button>
            </td>
        </tr>
    `;
}

function renderAttendanceRow(time: string, student: string, action: string, status: string, statusClass: string) {
    return `
        <tr>
            <td class="px-4 py-3 font-bold text-primary">${time}</td>
            <td class="px-4 py-3">${student}</td>
            <td class="px-4 py-3 text-xs">${action}</td>
            <td class="px-4 py-3 text-right text-[10px]">
                <span class="px-2 py-0.5 rounded font-bold uppercase ${statusClass}">${status}</span>
            </td>
        </tr>
    `;
}

function renderProgress(label: string, value: number, color: string) {
    return `
        <div class="space-y-1">
            <div class="flex justify-between text-[10px] font-bold uppercase">
                <span>${label}</span>
                <span>${value}%</span>
            </div>
            <div class="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div class="${color} h-full" style="width: ${value}%"></div>
            </div>
        </div>
    `;
}

function renderOpRow(name: string, book: string, type: string, time: string) {
    return `
        <div class="flex items-center justify-between p-4 hover:bg-surface transition-colors">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary">${name[0]}</div>
                <div>
                    <p class="text-sm font-bold">${name} <span class="font-normal text-xs text-on-surface-variant">• ${type}</span></p>
                    <p class="text-xs italic text-on-surface-variant">"${book}"</p>
                </div>
            </div>
            <span class="text-xs font-bold text-primary">${time}</span>
        </div>
    `;
}
