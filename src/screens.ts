
// ==========================================
// DYNAMIC FORMS & AUTH LOGIC (Global Scope)
// ==========================================
(window as any).doLogin = function() {
    const selectedRole = (window as any).selectedRole;
    const username = (document.getElementById('login-username') as HTMLInputElement)?.value?.trim();
    const errBox = document.getElementById('login-error');
    const errText = document.getElementById('login-error-text');
    const showError = (msg: string) => {
        if(errText) errText.innerText = msg;
        if(errBox) errBox.classList.remove('hidden');
    };

    if (selectedRole) {
        const ok = (window as any).appStore.loginAsRole(selectedRole);
        if (!ok) {
            showError('Impossible de se connecter avec ce rôle. Choisissez un rôle valide.');
        }
        return;
    }

    if (!username) {
        showError('Choisissez un rôle ou saisissez un identifiant de démonstration.');
        return;
    }

    const ok = (window as any).appStore.login(username);
    if (!ok) {
        showError('Compte de démonstration introuvable. Utilisez un rôle ou un identifiant existant.');
        document.getElementById('login-username')?.classList.add('border-error');
    }
};

(window as any).regPhotoDataUrl = null;
if (!(window as any)._photoEventBound) {
    document.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target && target.id === 'reg-photo' && target.files && target.files[0]) {
            const file = target.files[0];
            const reader = new FileReader();
            reader.onload = (ev) => { (window as any).regPhotoDataUrl = ev.target?.result || null; };
            reader.readAsDataURL(file);
        }
    });
    (window as any)._photoEventBound = true;
}

(window as any).selectedRole = '';
(window as any).selectRole = function(role: string) {
    (window as any).selectedRole = role;

    // Highlight selected role button
    document.querySelectorAll('.role-btn').forEach(btn => {
        const isSelected = (btn as HTMLElement).dataset.role === role;
        if (isSelected) {
            btn.classList.add('border-primary', 'bg-primary/10');
            btn.classList.remove('border-outline-variant');
            btn.querySelectorAll('[class*="text-on-surface-variant"]').forEach(el => {
                (el as HTMLElement).classList.add('!text-primary');
            });
        } else {
            btn.classList.remove('border-primary', 'bg-primary/10');
            btn.classList.add('border-outline-variant');
            btn.querySelectorAll('[class*="!text-primary"]').forEach(el => {
                (el as HTMLElement).classList.remove('!text-primary');
            });
        }
    });

    // Hide all role-specific fields first
    const allFields = ['student-tel-field', 'student-dept-field', 'student-licence-field',
     'prof-matricule-field', 'prof-dept-field', 'prof-service-field', 'prof-fonction-field', 'prof-address-field',
     'manager-fonction-field', 'manager-service-field', 'manager-tel-field'];
    
    allFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) { 
            el.style.display = 'none'; 
            el.classList.add('hidden'); 
        }
    });

    // Show role-specific fields
    let fieldsToShow: string[] = [];
    if (role === 'Étudiant') {
        fieldsToShow = ['student-tel-field', 'student-dept-field', 'student-licence-field'];
    } else if (role === 'Professeur') {
        fieldsToShow = ['prof-matricule-field', 'prof-dept-field', 'prof-service-field', 'prof-fonction-field', 'prof-address-field'];
    } else if (role === 'Gestionnaire') {
        fieldsToShow = ['manager-fonction-field', 'manager-service-field', 'manager-tel-field'];
    }
    
    fieldsToShow.forEach(id => {
        const el = document.getElementById(id);
        if (el) { 
            el.style.display = 'block'; 
            el.classList.remove('hidden'); 
        }
    });
};

(window as any).doRegister = async function() {
    const errBox = document.getElementById('reg-error');
    const errText = document.getElementById('reg-error-text');
    const show = (msg: string) => {
        if(errText) errText.innerText = msg;
        if(errBox) errBox.classList.remove('hidden');
    };

    const fullname = (document.getElementById('reg-fullname') as HTMLInputElement)?.value?.trim();
    const selectedRole = (window as any).selectedRole;

    if (!fullname) return show('Le nom complet est requis.');
    if (!selectedRole) return show('Veuillez sélectionner un type de compte.');

    let username = '';
    if (selectedRole === 'Professeur') {
        username = (document.getElementById('reg-prof-matricule') as HTMLInputElement)?.value?.trim() || '';
    } else if (selectedRole === 'Étudiant') {
        username = (document.getElementById('reg-tel') as HTMLInputElement)?.value?.trim() || '';
    } else if (selectedRole === 'Gestionnaire') {
        username = (document.getElementById('reg-manager-tel') as HTMLInputElement)?.value?.trim() || '';
    }
    
    // Fallback if no phone/matricule provided
    if (!username) {
        username = fullname.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 1000);
    }

    const existing = (window as any).appStore.users.find((u: any) => u.username === username);
    if (existing) return show('Cet identifiant (Matricule/Téléphone) est déjà utilisé.');

    const userData: any = {
        fullname,
        username,
        role: selectedRole,
        photoUrl: (window as any).regPhotoDataUrl || ('https://ui-avatars.com/api/?name=' + encodeURIComponent(fullname) + '&background=002147&color=ffffff')
    };

    if (selectedRole === 'Étudiant') {
        const dept = (document.getElementById('reg-student-dept') as HTMLInputElement)?.value?.trim();
        const licence = (document.getElementById('reg-licence') as HTMLSelectElement)?.value?.trim();
        if (!dept) return show('Le département est requis pour un étudiant.');
        if (!licence) return show('Le niveau/licence est requis pour un étudiant.');
        userData.department = dept;
        userData.licence = licence;
        userData.telephone = (document.getElementById('reg-tel') as HTMLInputElement)?.value?.trim() || '';
    } else if (selectedRole === 'Professeur') {
        const matricule = (document.getElementById('reg-prof-matricule') as HTMLInputElement)?.value?.trim();
        const dept = (document.getElementById('reg-prof-dept') as HTMLInputElement)?.value?.trim();
        const service = (document.getElementById('reg-prof-service') as HTMLInputElement)?.value?.trim();
        const fonction = (document.getElementById('reg-prof-fonction') as HTMLInputElement)?.value?.trim();
        const address = (document.getElementById('reg-prof-address') as HTMLInputElement)?.value?.trim();
        if (!matricule) return show('Le matricule est requis pour un professeur.');
        if (!dept) return show('Le département est requis pour un professeur.');
        if (!service) return show('Le service est requis pour un professeur.');
        if (!fonction) return show('La fonction est requise pour un professeur.');
        if (!address) return show('L\'adresse est requise pour un professeur.');
        userData.matricule = matricule;
        userData.department = dept;
        userData.service = service;
        userData.fonction = fonction;
        userData.address = address;
    } else if (selectedRole === 'Gestionnaire') {
        const fonction = (document.getElementById('reg-manager-fonction') as HTMLInputElement)?.value?.trim();
        const service = (document.getElementById('reg-manager-service') as HTMLInputElement)?.value?.trim();
        const telephone = (document.getElementById('reg-manager-tel') as HTMLInputElement)?.value?.trim();
        if (!fonction) return show('La fonction est requise pour un gestionnaire.');
        if (!service) return show('Le service est requis pour un gestionnaire.');
        if (!telephone) return show('Le téléphone est requis pour un gestionnaire.');
        userData.fonction = fonction;
        userData.service = service;
        userData.telephone = telephone;
    }

    // Save user and log them in immediately
    await (window as any).appStore.addUser(userData, true);
    (window as any).appStore.login(username); // Autologin
    (window as any).appStore.showToast('Compte créé ! Redirection vers votre espace...');
};
// ==========================================

const roleConfig = {
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

function getRoleLabel(role: string = 'admin') {
    return roleConfig[role as keyof typeof roleConfig]?.label ?? 'Profil Administrateur';
}

function normalizeDashboardPage(activePage: string) {
    if (activePage === 'dashboard-etudiant' || activePage === 'dashboard-professeur' || activePage === 'dashboard-gestionnaire') {
        return 'dashboard';
    }
    return activePage;
}

export function getSidebar(activePage: string) {
    const store = (window as any).appStore;
    const user = store?.currentUser;
    const role = user?.role || 'Administrateur';
    
    let menuItems: any[] = [];
    
    if (role === 'Administrateur') {
        menuItems = [
            { id: 'dashboard', icon: 'dashboard', label: 'Tableau de bord' },
            { id: 'students', icon: 'group', label: 'Utilisateurs & Cartes' },
            { id: 'books', icon: 'book', label: 'Catalogage' },
            { id: 'attendance', icon: 'event_available', label: 'Emprunts & Retours' },
            { id: 'presences', icon: 'co_present', label: 'Journal des Présences' },
            { id: 'requests', icon: 'pending', label: 'Demandes' },
            { id: 'stats', icon: 'insert_chart', label: 'Statistiques' },
        ];
    } else if (role === 'Gestionnaire') {
        menuItems = [
            { id: 'dashboard-gestionnaire', icon: 'dashboard', label: 'Tableau de bord' },
            { id: 'students', icon: 'group', label: 'Inscriptions & Cartes' },
            { id: 'attendance', icon: 'event_available', label: 'Emprunts & Retours' },
            { id: 'presences', icon: 'co_present', label: 'Journal des Présences' },
        ];
    } else if (role === 'Étudiant') {
        menuItems = [
            { id: 'dashboard-etudiant', icon: 'dashboard', label: 'Tableau de bord' },
            { id: 'profile', icon: 'person', label: 'Profil & Carte' },
            { id: 'books', icon: 'book', label: 'Emprunts' },
            { id: 'presences', icon: 'co_present', label: 'Présences' },
            { id: 'requests', icon: 'pending', label: 'Demandes' },
        ];
    } else if (role === 'Professeur') {
        menuItems = [
            { id: 'dashboard-professeur', icon: 'dashboard', label: 'Tableau de bord' },
            { id: 'profile', icon: 'person', label: 'Profil & Carte' },
            { id: 'books', icon: 'book', label: 'Emprunts' },
            { id: 'presences', icon: 'co_present', label: 'Présences' },
            { id: 'requests', icon: 'pending', label: 'Demandes' },
        ];
    }

    const normalizedPage = normalizeDashboardPage(activePage);

    return `
        <aside class="w-[260px] h-full fixed left-0 top-0 bg-primary flex flex-col py-4 px-1 border-r border-outline-variant z-50">
            <div class="px-4 mb-8">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-primary-fixed flex items-center justify-center rounded cursor-pointer" onclick="navigate('home')">
                        <span class="material-symbols-outlined text-primary">account_balance</span>
                    </div>
                    <div>
                        <h1 class="text-lg font-bold text-on-primary">Gest Biblio</h1>
                        <p class="text-[10px] text-on-primary/60 font-bold uppercase">${role}</p>
                    </div>
                </div>
            </div>
            <nav class="flex-grow space-y-1">
                ${menuItems.map(item => `
                    <button onclick="navigate('${item.id}')" 
                        class="w-full flex items-center gap-3 px-4 py-3 transition-colors ${normalizedPage === item.id ? 'bg-secondary text-white border-l-4 border-primary-fixed' : 'text-on-primary/70 hover:bg-secondary hover:text-on-primary'}">
                        <span class="material-symbols-outlined">${item.icon}</span>
                        <span class="text-sm">${item.label}</span>
                    </button>
                `).join('')}
            </nav>
            <div class="px-4 mt-auto">
                <button onclick="window.appStore.logout()" class="w-full flex items-center gap-3 px-4 py-3 text-error-container hover:bg-error/20 hover:text-white transition-colors rounded-xl font-bold">
                    <span class="material-symbols-outlined">logout</span>
                    <span class="text-sm">Déconnexion</span>
                </button>
            </div>
        </aside>
    `;
}

export function getTopBar(userType: string = 'ADMINISTRATION') {
    const store = (window as any).appStore;
    const user = store?.currentUser;
    const role = user?.role || 'Visiteur';
    
    return `
        <header class="h-16 sticky top-0 z-40 bg-surface-container-lowest flex justify-between items-center px-6 w-full border-b border-outline-variant">
            <div class="flex items-center gap-4 flex-1">
                <div class="flex items-center gap-3 cursor-pointer" onclick="navigate('home')">
                    <img src="/ule-logo.svg" alt="Logo Université de Labé" class="h-10 w-auto rounded-md border border-outline-variant bg-surface" />
                    <p class="hidden sm:block text-[11px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Université de Labé</p>
                </div>
                ${(role === 'Administrateur' || role === 'Gestionnaire') ? `
                <div class="relative w-full max-w-md hidden md:block">
                    <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                    <input type="text" class="w-full bg-surface-container-low border-none rounded-lg pl-10 py-2 text-sm focus:ring-2 focus:ring-primary" placeholder="Rechercher étudiant, livre...">
                </div>` : ''}
            </div>
            <div class="flex items-center gap-4">
                ${(role === 'Administrateur' || role === 'Gestionnaire') ? `
                <div class="relative">
                    <button onclick="window.toggleNotifications()" class="p-2 text-on-surface-variant hover:text-primary transition-all relative">
                        <span class="material-symbols-outlined">notifications</span>
                        <span id="notif-badge" class="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full hidden"></span>
                    </button>
                    
                    <div id="notif-dropdown" class="absolute right-0 top-full mt-2 w-80 bg-surface border border-outline-variant rounded-2xl shadow-xl hidden flex-col z-50 overflow-hidden">
                        <div class="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
                            <h3 class="font-bold text-sm text-on-surface">Notifications</h3>
                            <span id="notif-count" class="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">0</span>
                        </div>
                        <div id="notif-list" class="max-h-[350px] overflow-y-auto bg-surface flex flex-col">
                            <!-- Injected dynamically -->
                        </div>
                        <div class="p-3 border-t border-outline-variant/30 text-center bg-surface-container-lowest">
                            <button onclick="navigate('dashboard')" class="text-xs font-bold text-primary hover:underline">Voir le tableau de bord</button>
                        </div>
                    </div>
                </div>` : ''}
                
                <div class="h-8 w-px bg-outline-variant mx-2 hidden sm:block"></div>
                
                <!-- User Profile -->
                <div class="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onclick="navigate('profile')">
                    <div class="text-right hidden sm:block">
                        <span class="text-[11px] font-bold uppercase text-primary">${role}</span>
                        <p class="text-xs font-bold text-on-surface">${user?.fullname || 'Utilisateur'}</p>
                    </div>
                    <img src="${user?.photoUrl || `https://ui-avatars.com/api/?name=${user?.fullname || 'U'}&background=002147&color=ffffff`}" class="w-10 h-10 rounded-full border border-outline-variant object-cover shadow-sm" alt="Profile" />
                </div>
            </div>
        </header>
    `;
}

function renderDashboardPage(role: string) {
    const route = role === 'Étudiant' ? 'dashboard-etudiant'
        : role === 'Professeur' ? 'dashboard-professeur'
        : role === 'Gestionnaire' ? 'dashboard-gestionnaire'
        : 'dashboard';

    return `
        <div class="flex min-h-screen">
            ${getSidebar(route)}
            <main class="flex-grow ml-[260px]">
                ${getTopBar()}
                ${renderDashboardContent(role)}
            </main>
        </div>
    `;
}

export function renderDashboardContent(role: string = 'Administrateur') {
    const store = (window as any).appStore || {
        users: [],
        books: [],
        borrows: [],
        attendances: [],
        requests: []
    };

    const currentUser = store.currentUser || { role: 'Administrateur', id: null };
    const isStudent = role === 'Étudiant';
    const isProfessor = role === 'Professeur';
    const isManager = role === 'Gestionnaire';

    const dashboardLabel = isStudent ? 'Tableau de bord Étudiant'
        : isProfessor ? 'Tableau de bord Professeur'
        : isManager ? 'Tableau de bord Gestionnaire'
        : 'Tableau de bord Administrateur';

    const myBorrows = store.borrows.filter((b: any) => b.userId === currentUser.id);
    const activeMyBorrows = myBorrows.filter((br: any) => br.status === 'En cours').length;
    const returnedMyBorrows = myBorrows.filter((br: any) => br.status === 'Retourné').length;
    const myRequests = store.requests.filter((r: any) => r.email === currentUser?.email || r.fullname === currentUser?.fullname).length;
    const myPresences = store.attendances.filter((a: any) => a.userId === currentUser.id).length;
    
    const totalUsers = store.users.length;
    const activeStudents = store.users.filter((u: any) => u.role === 'Étudiant').length;
    const activeProfessors = store.users.filter((u: any) => u.role === 'Professeur').length;
    
    const totalBooksAvailable = store.books
        .filter((b: any) => b.status === 'Disponible')
        .reduce((sum: number, b: any) => sum + (b.quantity || 1), 0);

    const activeBorrows = store.borrows.filter((b: any) => b.status === 'En cours' || b.status === 'En retard').length;

    const todayStr = new Date().toISOString().split('T')[0];
    const todayAttendances = store.attendances.filter((a: any) => a.timeIn && a.timeIn.startsWith(todayStr)).length;

    const pendingRequests = store.requests.filter((r: any) => r.status === 'En attente').length;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayBorrows = store.borrows.filter((b: any) => new Date(b.borrowDate) >= todayStart).length;
    const todayRequests = store.requests.filter((r: any) => new Date(r.date) >= todayStart).length;
    const todayActivitiesCount = todayBorrows + todayAttendances + todayRequests;

    // 1. Inscriptions activities (last 5 users)
    const sortedUsers = [...store.users].sort((a: any, b: any) => {
        const da = a.registrationDate ? new Date(a.registrationDate).getTime() : 0;
        const db = b.registrationDate ? new Date(b.registrationDate).getTime() : 0;
        return db - da;
    }).slice(0, 5);

    const inscriptionsActivities = sortedUsers.map((u: any) => ({
        type: 'inscription',
        title: u.fullname,
        subtitle: `Compte ${u.role.toLowerCase()} créé dans le département ${u.department || 'Général'}`,
        date: u.registrationDate || new Date().toISOString(),
        icon: 'person_add',
        color: 'bg-primary/10 text-primary',
        badge: 'Nouvel Inscrit'
    }));

    // 2. Emprunts activities (last 5 borrows)
    const sortedBorrows = [...store.borrows].sort((a: any, b: any) => new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime()).slice(0, 5);
    const borrowsActivities = sortedBorrows.map((b: any) => {
        const book = store.books.find((bk: any) => bk.id === b.bookId) || { title: 'Livre Inconnu' };
        const user = store.users.find((u: any) => u.id === b.userId) || { fullname: 'Lecteur Anonyme' };
        const statusLabel = b.status === 'Retourné' ? 'Retourné' : b.status === 'En retard' ? 'En retard' : 'En cours';
        const badgeColor = b.status === 'Retourné' ? 'bg-green-500/10 text-green-700' : b.status === 'En retard' ? 'bg-red-500/10 text-red-700' : 'bg-amber-500/10 text-amber-700';

        return {
            type: 'emprunt',
            title: user.fullname,
            subtitle: `Emprunt de "${book.title}" (${statusLabel})`,
            date: b.borrowDate,
            icon: 'assignment_return',
            color: badgeColor,
            badge: 'Emprunt'
        };
    });

    // 3. Présences activities (last 5 attendances)
    const sortedAttendances = [...store.attendances].sort((a: any, b: any) => new Date(b.timeIn).getTime() - new Date(a.timeIn).getTime()).slice(0, 5);
    const presencesActivities = sortedAttendances.map((a: any) => {
        const user = store.users.find((u: any) => u.id === a.userId) || { fullname: 'Visiteur' };
        const timeStr = new Date(a.timeIn).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const text = a.status === 'Présent' ? `Entrée à ${timeStr} (En salle)` : `Entrée et Sortie enregistrées (Session close)`;
        
        return {
            type: 'presence',
            title: user.fullname,
            subtitle: text,
            date: a.timeIn,
            icon: 'co_present',
            color: 'bg-purple-500/10 text-purple-700',
            badge: 'Passage'
        };
    });

    // 4. Demandes activities (last 5 requests)
    const sortedRequests = [...store.requests].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
    const requestsActivities = sortedRequests.map((r: any) => ({
        type: 'request',
        title: r.fullname,
        subtitle: `Demande de ${r.type.toLowerCase()} (${r.status})`,
        date: r.date,
        icon: 'pending',
        color: r.status === 'En attente' ? 'bg-orange-500/10 text-orange-700' : r.status === 'Acceptée' ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700',
        badge: 'Requête'
    }));

    // Combine all and sort by date desc
    const allActivities: any[] = [];
    allActivities.push(...inscriptionsActivities, ...borrowsActivities, ...presencesActivities, ...requestsActivities);
    allActivities.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const finalAllActivities = allActivities.slice(0, 6);

    const timeAgo = (dateStr: string) => {
        try {
            const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
            if (seconds < 60) return "À l'instant";
            const minutes = Math.floor(seconds / 60);
            if (minutes < 60) return `Il y a ${minutes} min`;
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `Il y a ${hours} h`;
            const days = Math.floor(hours / 24);
            if (days === 1) return "Hier";
            return `Il y a ${days} jours`;
        } catch (e) {
            return "Récemment";
        }
    };

    const renderActivityItem = (act: any) => {
        return `
            <div class="flex items-start justify-between p-3.5 bg-surface-container-low border border-outline-variant/30 rounded-2xl hover:bg-surface-container transition-all shadow-sm">
                <div class="flex items-start gap-3">
                    <div class="w-10 h-10 ${act.color} rounded-xl flex items-center justify-center shrink-0">
                        <span class="material-symbols-outlined text-lg">${act.icon}</span>
                    </div>
                    <div class="min-w-0">
                        <h4 class="text-xs font-black text-on-surface truncate">${act.title}</h4>
                        <p class="text-[10px] text-on-surface-variant mt-0.5">${act.subtitle}</p>
                    </div>
                </div>
                <div class="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                    <span class="text-[8px] text-on-surface-variant font-bold">${timeAgo(act.date)}</span>
                    <span class="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${act.color}">${act.badge}</span>
                </div>
            </div>
        `;
    };

    const renderEmptyState = (msg: string) => {
        return `
            <div class="py-12 flex flex-col items-center justify-center text-center space-y-2">
                <span class="material-symbols-outlined text-on-surface-variant/40 text-4xl bg-surface-container-high p-3 rounded-full">hourglass_empty</span>
                <p class="text-xs font-bold text-on-surface-variant">${msg}</p>
            </div>
        `;
    };

    const lateBorrows = store.borrows.filter((b: any) => b.status === 'En retard');

    const formattedDate = new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date());

    (window as any).switchDashboardTab = (tab: string) => {
        const tabs = ['all', 'inscriptions', 'emprunts', 'presences', 'requests'];
        tabs.forEach(t => {
            const btn = document.getElementById(`tab-btn-${t}`);
            const cnt = document.getElementById(`tab-content-${t}`);
            if (btn && cnt) {
                if (t === tab) {
                    btn.classList.add('bg-primary', 'text-white', 'shadow-sm');
                    btn.classList.remove('bg-surface-container', 'text-on-surface-variant');
                    cnt.classList.remove('hidden');
                } else {
                    btn.classList.remove('bg-primary', 'text-white', 'shadow-sm');
                    btn.classList.add('bg-surface-container', 'text-on-surface-variant');
                    cnt.classList.add('hidden');
                }
            }
        });
    };

    return `
        <div class="p-6 space-y-6 max-w-[1600px] mx-auto">
            <!-- Top Welcome Banner -->
            <div class="bg-gradient-to-r from-primary to-primary-container p-6 rounded-3xl text-white shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 class="text-xl font-black tracking-wide">${dashboardLabel}</h2>
                    <p class="text-xs text-on-primary-container/80 mt-1">
                        Bonjour, <span class="font-bold text-white uppercase">${currentUser.role || 'UTILISATEUR'}</span>.
                        Nous sommes le <span class="font-bold text-white">${formattedDate}</span>.
                    </p>
                </div>
                <div class="flex items-center gap-3">
                    ${isStudent || isProfessor ? `<button onclick="navigate('presences')" class="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/25 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-sm">co_present</span> Mes présences
                    </button>` : `<button onclick="navigate('attendance')" class="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/25 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-sm">qr_code_scanner</span> Emprunts & Retours
                    </button>`}
                    ${isStudent || isProfessor ? `<button onclick="navigate('profile')" class="px-4 py-2 bg-white text-primary hover:bg-surface-container rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 shadow">
                        <span class="material-symbols-outlined text-sm">person</span> Mon profil
                    </button>` : `<button onclick="navigate('students')" class="px-4 py-2 bg-white text-primary hover:bg-surface-container rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 shadow">
                        <span class="material-symbols-outlined text-sm">person_add</span> Inscriptions
                    </button>`}
                </div>
            </div>

            <!-- 8 Statistical Cards Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <!-- Card 1: Total Utilisateurs -->
                <div class="bg-white border border-outline-variant/50 p-5 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group">
                    <div>
                        <p class="text-xs font-bold text-on-surface-variant/70 uppercase tracking-wider">Total Utilisateurs</p>
                        <h3 class="text-2xl font-black text-primary mt-1">${totalUsers}</h3>
                        <p class="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                            <span class="material-symbols-outlined text-[12px]">trending_up</span> +12% cette semaine
                        </p>
                    </div>
                    <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                        <span class="material-symbols-outlined text-2xl">group</span>
                    </div>
                </div>

                <!-- Card 2: Étudiants Actifs -->
                <div class="bg-white border border-outline-variant/50 p-5 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group">
                    <div>
                        <p class="text-xs font-bold text-on-surface-variant/70 uppercase tracking-wider">Étudiants Actifs</p>
                        <h3 class="text-2xl font-black text-primary mt-1">${activeStudents}</h3>
                        <p class="text-[10px] text-on-surface-variant mt-1">Facultés & Départements</p>
                    </div>
                    <div class="w-12 h-12 bg-secondary-container/40 rounded-xl flex items-center justify-center text-secondary-container-on group-hover:bg-secondary group-hover:text-white transition-all duration-300 shadow-sm">
                        <span class="material-symbols-outlined text-2xl">school</span>
                    </div>
                </div>

                <!-- Card 3: Enseignants Actifs -->
                <div class="bg-white border border-outline-variant/50 p-5 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group">
                    <div>
                        <p class="text-xs font-bold text-on-surface-variant/70 uppercase tracking-wider">Professeurs Actifs</p>
                        <h3 class="text-2xl font-black text-primary mt-1">${activeProfessors}</h3>
                        <p class="text-[10px] text-on-surface-variant mt-1">Espaces de recherche</p>
                    </div>
                    <div class="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300 shadow-sm">
                        <span class="material-symbols-outlined text-2xl">co_present</span>
                    </div>
                </div>

                <!-- Card 4: Livres Disponibles -->
                <div class="bg-white border border-outline-variant/50 p-5 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group">
                    <div>
                        <p class="text-xs font-bold text-on-surface-variant/70 uppercase tracking-wider">Ouvrages Disponibles</p>
                        <h3 class="text-2xl font-black text-primary mt-1">${totalBooksAvailable}</h3>
                        <p class="text-[10px] text-on-surface-variant mt-1">Catalogage physique</p>
                    </div>
                    <div class="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                        <span class="material-symbols-outlined text-2xl">menu_book</span>
                    </div>
                </div>

                <!-- Card 5: Emprunts Actifs -->
                <div class="bg-white border border-outline-variant/50 p-5 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group">
                    <div>
                        <p class="text-xs font-bold text-on-surface-variant/70 uppercase tracking-wider">Emprunts Actifs</p>
                        <h3 class="text-2xl font-black text-primary mt-1">${activeBorrows}</h3>
                        <p class="text-[10px] text-error font-bold flex items-center gap-1 mt-1">
                            <span class="material-symbols-outlined text-[12px]">warning</span> ${store.borrows.filter((b: any) => b.status === 'En retard').length} en retard
                        </p>
                    </div>
                    <div class="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 shadow-sm">
                        <span class="material-symbols-outlined text-2xl">assignment_return</span>
                    </div>
                </div>

                <!-- Card 6: Présences du Jour -->
                <div class="bg-white border border-outline-variant/50 p-5 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group">
                    <div>
                        <p class="text-xs font-bold text-on-surface-variant/70 uppercase tracking-wider">Passages du Jour</p>
                        <h3 class="text-2xl font-black text-primary mt-1">${todayAttendances}</h3>
                        <p class="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                            <span class="material-symbols-outlined text-[12px]">check_circle</span> Journal ouvert
                        </p>
                    </div>
                    <div class="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-sm">
                        <span class="material-symbols-outlined text-2xl">co_present</span>
                    </div>
                </div>

                <!-- Card 7: Demandes en Attente -->
                <div class="bg-white border border-outline-variant/50 p-5 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group">
                    <div>
                        <p class="text-xs font-bold text-on-surface-variant/70 uppercase tracking-wider">Demandes en Attente</p>
                        <h3 class="text-2xl font-black text-primary mt-1">${pendingRequests}</h3>
                        <p class="text-[10px] text-amber-600 font-bold flex items-center gap-1 mt-1">
                            <span class="material-symbols-outlined text-[12px]">schedule</span> Action requise
                        </p>
                    </div>
                    <div class="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-700 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300 shadow-sm">
                        <span class="material-symbols-outlined text-2xl">pending</span>
                    </div>
                </div>

                <!-- Card 8: Flux du Jour -->
                <div class="bg-white border border-outline-variant/50 p-5 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group">
                    <div>
                        <p class="text-xs font-bold text-on-surface-variant/70 uppercase tracking-wider">Flux Récents (24h)</p>
                        <h3 class="text-2xl font-black text-primary mt-1">${todayActivitiesCount}</h3>
                        <p class="text-[10px] text-on-surface-variant mt-1">Mouvements système</p>
                    </div>
                    <div class="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center text-pink-700 group-hover:bg-pink-600 group-hover:text-white transition-all duration-300 shadow-sm">
                        <span class="material-symbols-outlined text-2xl">insights</span>
                    </div>
                </div>
            </div>

            <!-- Row 1 Charts: Library Attendance & Hourly Density -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 bg-white border border-outline-variant/50 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div class="flex items-center justify-between mb-6">
                        <div>
                            <h3 class="text-base font-black text-primary">Fréquentation de la Bibliothèque</h3>
                            <p class="text-xs text-on-surface-variant">Entrées et sorties enregistrées ces 7 derniers jours</p>
                        </div>
                        <div class="flex gap-2">
                            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary flex items-center gap-1">
                                <span class="w-2 h-2 rounded-full bg-primary"></span>Entrées
                            </span>
                            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-secondary-container/40 text-secondary-container-on flex items-center gap-1">
                                <span class="w-2 h-2 rounded-full bg-secondary"></span>Sorties
                            </span>
                        </div>
                    </div>
                    <div class="h-72">
                        <canvas id="chartAttendance"></canvas>
                    </div>
                </div>

                <div class="bg-white border border-outline-variant/50 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div class="flex items-center justify-between mb-6">
                        <div>
                            <h3 class="text-base font-black text-primary">Statistiques Journalières</h3>
                            <p class="text-xs text-on-surface-variant">Affluence horaire (passages aujourd'hui)</p>
                        </div>
                        <span class="material-symbols-outlined text-purple-700 bg-purple-500/10 p-2 rounded-xl text-lg">schedule</span>
                    </div>
                    <div class="h-72">
                        <canvas id="chartHourlyDensity"></canvas>
                    </div>
                </div>
            </div>

            <!-- Row 2 Charts: Registrations, User Distribution, Borrows/Returns -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="bg-white border border-outline-variant/50 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h3 class="text-base font-black text-primary">Croissance des Inscriptions</h3>
                            <p class="text-xs text-on-surface-variant">Évolution cumulative des inscriptions</p>
                        </div>
                        <span class="material-symbols-outlined text-green-700 bg-green-500/10 p-2 rounded-xl text-lg">person_add</span>
                    </div>
                    <div class="h-64">
                        <canvas id="chartRegistrations"></canvas>
                    </div>
                </div>

                <div class="bg-white border border-outline-variant/50 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h3 class="text-base font-black text-primary">Répartition de la Communauté</h3>
                            <p class="text-xs text-on-surface-variant">Distribution des utilisateurs par rôle</p>
                        </div>
                        <span class="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl text-lg">pie_chart</span>
                    </div>
                    <div class="h-64 flex items-center justify-center">
                        <div class="relative w-full max-w-[200px] h-[190px]">
                            <canvas id="chartUserDistribution"></canvas>
                        </div>
                    </div>
                </div>

                <div class="bg-white border border-outline-variant/50 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h3 class="text-base font-black text-primary">Mouvements des Ouvrages</h3>
                            <p class="text-xs text-on-surface-variant">Emprunts vs retours effectifs mensuels</p>
                        </div>
                        <span class="material-symbols-outlined text-orange-700 bg-orange-500/10 p-2 rounded-xl text-lg">swap_horiz</span>
                    </div>
                    <div class="h-64">
                        <canvas id="chartBorrowsReturns"></canvas>
                    </div>
                </div>
            </div>

            <!-- Row 3 Feed & Alert: Recent Activities Feed & Late Borrows Alert -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div class="lg:col-span-7 bg-white border border-outline-variant/50 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h3 class="text-base font-black text-primary">Journal d'Activité Récente</h3>
                            <p class="text-xs text-on-surface-variant">Suivi en temps réel des actions de la plateforme</p>
                        </div>
                    </div>
                    
                    <div class="flex flex-wrap gap-2 mb-6 border-b border-outline-variant/30 pb-4">
                        <button id="tab-btn-all" onclick="window.switchDashboardTab('all')" class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-primary text-white shadow-sm flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-sm">list</span> Tout
                        </button>
                        <button id="tab-btn-inscriptions" onclick="window.switchDashboardTab('inscriptions')" class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-surface-container text-on-surface-variant hover:bg-surface-container-high flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-sm">person_add</span> Inscriptions
                        </button>
                        <button id="tab-btn-emprunts" onclick="window.switchDashboardTab('emprunts')" class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-surface-container text-on-surface-variant hover:bg-surface-container-high flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-sm">assignment_return</span> Emprunts
                        </button>
                        <button id="tab-btn-presences" onclick="window.switchDashboardTab('presences')" class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-surface-container text-on-surface-variant hover:bg-surface-container-high flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-sm">co_present</span> Présences
                        </button>
                        <button id="tab-btn-requests" onclick="window.switchDashboardTab('requests')" class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-surface-container text-on-surface-variant hover:bg-surface-container-high flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-sm">pending</span> Demandes
                        </button>
                    </div>

                    <div class="flex-grow space-y-4 max-h-[380px] overflow-y-auto pr-1">
                        <div id="tab-content-all" class="space-y-4">
                            ${finalAllActivities.length === 0 ? renderEmptyState('Aucune activité enregistrée') : finalAllActivities.map(act => renderActivityItem(act)).join('')}
                        </div>

                        <div id="tab-content-inscriptions" class="hidden space-y-4">
                            ${inscriptionsActivities.length === 0 ? renderEmptyState('Aucun compte inscrit récemment') : inscriptionsActivities.map(act => renderActivityItem(act)).join('')}
                        </div>

                        <div id="tab-content-emprunts" class="hidden space-y-4">
                            ${borrowsActivities.length === 0 ? renderEmptyState('Aucun emprunt enregistré récemment') : borrowsActivities.map(act => renderActivityItem(act)).join('')}
                        </div>

                        <div id="tab-content-presences" class="hidden space-y-4">
                            ${presencesActivities.length === 0 ? renderEmptyState('Aucun passage de bibliothèque enregistré') : presencesActivities.map(act => renderActivityItem(act)).join('')}
                        </div>

                        <div id="tab-content-requests" class="hidden space-y-4">
                            ${requestsActivities.length === 0 ? renderEmptyState('Aucune demande soumise récemment') : requestsActivities.map(act => renderActivityItem(act)).join('')}
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-5 bg-white border border-outline-variant/50 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col">
                    <div class="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-error/5">
                        <div>
                            <h3 class="text-base font-black text-error flex items-center gap-1.5">
                                <span class="material-symbols-outlined text-error">warning</span> Alertes de Retards
                            </h3>
                            <p class="text-xs text-on-surface-variant">Retour d'ouvrages hors délais</p>
                        </div>
                        <span class="bg-error text-white text-[10px] px-2.5 py-1 rounded-full font-bold shadow-sm">${lateBorrows.length} Litiges</span>
                    </div>
                    <div class="flex-grow overflow-y-auto max-h-[320px] p-6 space-y-4">
                        ${lateBorrows.length === 0 ? `
                            <div class="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                                <span class="material-symbols-outlined text-emerald-500 text-4xl bg-emerald-500/10 p-3 rounded-full">check_circle</span>
                                <h4 class="text-xs font-bold text-on-surface">Aucun litige en cours</h4>
                                <p class="text-[10px] text-on-surface-variant">Tous les emprunts sont retournés dans les délais.</p>
                            </div>
                        ` : lateBorrows.map(b => {
                            const book = store.books.find((bk: any) => bk.id === b.bookId) || { title: 'Livre Inconnu' };
                            const user = store.users.find((u: any) => u.id === b.userId) || { fullname: 'Lecteur Anonyme' };
                            const diffDays = Math.ceil((Date.now() - new Date(b.expectedReturnDate).getTime()) / (1000 * 60 * 60 * 24));
                            return `
                                <div class="flex items-start gap-3 p-3 bg-error-container/20 border border-error-container rounded-2xl hover:bg-error-container/30 transition-all shadow-sm">
                                    <span class="material-symbols-outlined text-error bg-error-container/40 p-2 rounded-xl text-lg mt-0.5">assignment_late</span>
                                    <div class="flex-1 min-w-0">
                                        <h4 class="text-xs font-black text-on-surface truncate">${user.fullname}</h4>
                                        <p class="text-[10px] text-on-surface-variant truncate mt-0.5">Ouvrage : <span class="font-bold text-primary">${book.title}</span></p>
                                        <div class="flex items-center gap-1.5 mt-2">
                                            <span class="bg-error/10 text-error text-[8px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                                <span class="material-symbols-outlined text-[10px]">schedule</span> Retard: ${diffDays} jours
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <button onclick="navigate('attendance')" class="w-full p-4 text-primary hover:text-white hover:bg-primary text-[10px] font-black uppercase border-t border-outline-variant/30 hover:border-primary transition-all duration-300 tracking-wider">
                        Gérer les Emprunts & Litiges
                    </button>
                </div>
            </div>
        </div>
    `;
}



export const screens = {
    home: () => {
        const { books, users, borrows, attendances } = (window as any).appStore || { books: [], users: [], borrows: [], attendances: [] };
        const totalBooks = books.reduce((s:number,b:any) => s + (b.quantity||1), 0);
        const activeNow = attendances.filter((a:any) => a.status === 'Présent').length;
        const activeBorrows = borrows.filter((b:any) => b.status !== 'Retourné').length;

        const featureCard = (icon:string, title:string, desc:string, color:string) => `
            <div class="feature-card group bg-white border border-outline-variant rounded-2xl p-7 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer relative overflow-hidden">
                <div class="absolute top-0 right-0 w-24 h-24 ${color} rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity -translate-y-6 translate-x-6"></div>
                <div class="w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined text-2xl">${icon}</span>
                </div>
                <h4 class="font-bold text-lg text-on-surface mb-2">${title}</h4>
                <p class="text-base text-on-surface leading-relaxed">${desc}</p>
            </div>`;

        const statPill = (val:string, label:string, color:string) => `
            <div class="text-center px-6">
                <p class="text-4xl font-black ${color} mb-1">${val}</p>
                <p class="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">${label}</p>
            </div>`;

        return `
        <div class="homepage min-h-screen bg-surface-container-lowest text-on-surface font-sans overflow-x-hidden scroll-smooth relative">
            <style>
                @keyframes floatUp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
                .homepage-book-icon { position: absolute; top: 1rem; left: 1rem; width: 3rem; height: 3rem; z-index: 60; border-radius: 1rem; background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.24); display: flex; align-items: center; justify-content: center; box-shadow: 0 15px 40px rgba(15,23,42,0.08); }
                .homepage-book-icon .material-symbols-outlined { font-size: 1.3rem; color: #2563eb; }
                .homepage p, .homepage li, .homepage span, .homepage a { color: inherit; }
                .homepage p, .homepage li { line-height: 1.85; }
                .homepage .text-copy { color: var(--on-surface); }
                .homepage .text-copy-strong { color: var(--on-surface); }
                @keyframes fadeInUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
                @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
                .float-anim { animation: floatUp 4s ease-in-out infinite; }
                .fade-up { animation: fadeInUp 0.8s ease-out both; }
                .fade-up-d1 { animation-delay: 0.15s; }
                .fade-up-d2 { animation-delay: 0.3s; }
                .fade-up-d3 { animation-delay: 0.45s; }
                .shimmer-bg { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent); background-size: 200% 100%; animation: shimmer 3s linear infinite; }

                /* Micro-interactions */
                .feature-card { transition: transform .28s ease, box-shadow .28s ease; }
                .feature-card:hover { transform: translateY(-6px); box-shadow: 0 18px 40px rgba(2,6,23,0.12); }
                button:focus-visible { outline: 3px solid rgba(59,130,246,0.18); outline-offset: 3px; }
            </style>

            <div class="homepage-book-icon"><span class="material-symbols-outlined">menu_book</span></div>
            <!-- HEADER -->
            <header class="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-outline-variant/50 shadow-sm transition-all">
                <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div class="w-11 h-11 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
                            <span class="material-symbols-outlined text-white text-xl">auto_stories</span>
                        </div>
                        <div>
                            <h1 class="text-xl font-black text-primary tracking-tight">Gest Biblio</h1>
                            <p class="text-[9px] uppercase tracking-[0.25em] text-on-surface-variant font-bold">Université de Labé</p>
                        </div>
                    </div>
                    <nav class="hidden md:flex items-center gap-1">
                        <a href="#hero" class="px-4 py-2 rounded-lg text-sm font-semibold text-on-surface hover:text-primary hover:bg-primary/5 transition-all">Accueil</a>
                        <a href="#features" class="px-4 py-2 rounded-lg text-sm font-semibold text-on-surface hover:text-primary hover:bg-primary/5 transition-all">Modules</a>
                        <a href="#stats-section" class="px-4 py-2 rounded-lg text-sm font-semibold text-on-surface hover:text-primary hover:bg-primary/5 transition-all">Chiffres</a>
                        <a href="#contact" class="px-4 py-2 rounded-lg text-sm font-semibold text-on-surface hover:text-primary hover:bg-primary/5 transition-all">Contact</a>
                    </nav>
                    <div class="hidden md:flex items-center gap-3">
                        <button onclick="navigate('login')" aria-label="Se connecter" class="flex items-center gap-2 px-5 py-2.5 border-2 border-primary text-primary rounded-xl font-bold text-sm hover:bg-primary/5 hover:-translate-y-0.5 transition-all">
                            <span class="material-symbols-outlined text-[18px]">login</span> Se connecter
                        </button>
                        <button onclick="navigate('register')" aria-label="S'inscrire" class="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
                            <span class="material-symbols-outlined text-[18px]">person_add</span> S'inscrire
                        </button>
                    </div>
                </div>
            </header>

            <!-- HERO -->
            <section id="hero" class="relative pt-36 pb-24 lg:pt-44 lg:pb-36 overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-secondary/[0.06] -z-10"></div>
                <div class="absolute top-16 right-0 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[100px] -z-10"></div>
                <div class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/15 rounded-full blur-[100px] -z-10"></div>

                <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div class="space-y-8 fade-up">
                        <div class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                            <span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span></span>
                            Plateforme v2.0 · Opérationnelle
                        </div>
                        <h2 class="text-5xl lg:text-[4.2rem] font-black tracking-tight text-on-surface leading-[1.08]">
                            La Bibliothèque<br/><span class="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary">Intelligente</span>
                        </h2>
                        <p class="text-lg text-on-surface max-w-xl leading-relaxed text-copy">
                            Modernisez la gestion de la Bibliothèque Centrale de l'Université de Labé. Catalogage, emprunts, présences et suivi QR Code — tout en un seul système.
                        </p>
                        <div class="flex flex-wrap items-center gap-4 pt-2">
                            <button onclick="navigate('login')" aria-label="Se connecter" class="group flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-bold text-base shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all">
                                <span class="material-symbols-outlined text-xl">login</span>
                                Se connecter
                                <span class="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                            <button onclick="navigate('register')" aria-label="S'inscrire" class="flex items-center gap-2 px-8 py-4 bg-white border-2 border-outline-variant text-on-surface rounded-2xl font-bold text-base hover:border-primary/30 hover:bg-primary/5 transition-all">
                                <span class="material-symbols-outlined text-primary text-xl">person_add</span> S'inscrire
                            </button>
                        </div>
                    </div>
                    <div class="relative w-full flex justify-center fade-up fade-up-d2 lg:justify-center lg:w-auto order-last lg:order-none">
                        <div class="absolute inset-4 bg-gradient-to-tr from-primary/20 to-secondary/10 rounded-[2rem] transform rotate-2 scale-[1.02] -z-10 blur-sm"></div>
                        <img src="/hero_library.png" alt="Bibliothèque Universitaire Moderne" class="rounded-[2rem] shadow-2xl border-2 border-white/30 object-cover w-full max-h-[520px] lg:h-[560px] lg:w-full" style="object-position:center;" />
                        <div class="absolute -left-10 bottom-16 bg-white/95 backdrop-blur-xl p-5 rounded-2xl shadow-2xl border border-outline-variant/50 float-anim">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 shadow-sm">
                                    <span class="material-symbols-outlined">check_circle</span>
                                </div>
                                <div>
                                    <p class="font-bold text-on-surface text-sm">Retour validé</p>
                                    <p class="text-xs text-on-surface">Livre : Macroéconomie</p>
                                </div>
                            </div>
                        </div>
                        <div class="absolute -right-6 top-20 bg-white/95 backdrop-blur-xl p-5 rounded-2xl shadow-2xl border border-outline-variant/50 float-anim" style="animation-delay:1.5s">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm">
                                    <span class="material-symbols-outlined">qr_code_scanner</span>
                                </div>
                                <div>
                                    <p class="font-bold text-on-surface text-sm">Scan détecté</p>
                                    <p class="text-xs text-on-surface">Entrée enregistrée</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- LIVE STATS BANNER -->
            <section id="stats-section" class="relative py-12 bg-gradient-to-r from-primary via-secondary to-primary overflow-hidden">
                <div class="absolute inset-0 shimmer-bg"></div>
                <div class="max-w-5xl mx-auto flex flex-wrap justify-center gap-8 relative z-10 text-white">
                    ${statPill(totalBooks > 0 ? String(totalBooks) : '12k+', 'Ouvrages', 'text-white')}
                    ${statPill(String(users.length || '2.5k+'), 'Utilisateurs', 'text-white')}
                    ${statPill(String(activeBorrows), 'Emprunts actifs', 'text-white')}
                    ${statPill(String(activeNow), 'Présents maintenant', 'text-white')}
                </div>
            </section>

            <!-- FEATURES / MODULES -->
            <section id="features" class="py-28 bg-surface-container-lowest">
                <div class="max-w-7xl mx-auto px-6">
                    <div class="text-center max-w-2xl mx-auto mb-16 fade-up">
                        <p class="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-3">Modules intégrés</p>
                        <h2 class="text-4xl font-black text-on-surface mb-4">Tout ce dont vous avez besoin</h2>
                        <p class="text-on-surface text-base leading-relaxed">Un ensemble complet d'outils pour la gestion moderne des bibliothèques universitaires.</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        ${featureCard('qr_code_scanner', 'QR Intelligent', 'Scan ultra-rapide des cartes par webcam pour les entrées et sorties automatisées.', 'bg-primary/10 text-primary')}
                        ${featureCard('library_books', 'Catalogage', 'Gestion complète des livres avec disponibilité en temps réel et catégories.', 'bg-secondary/10 text-secondary')}
                        ${featureCard('swap_horiz', 'Emprunts & Retours', 'Suivi précis des emprunts, dates d\'échéance et détection automatique des retards.', 'bg-tertiary/10 text-tertiary')}
                        ${featureCard('analytics', 'Statistiques', 'Tableaux de bord interactifs avec graphiques et exports PDF / Excel.', 'bg-green-500/10 text-green-600')}
                        ${featureCard('group', 'Inscriptions', 'Enregistrement des étudiants et professeurs avec photo et QR code généré.', 'bg-indigo-500/10 text-indigo-600')}
                        ${featureCard('co_present', 'Présences', 'Journal en temps réel des entrées et sorties avec filtres avancés.', 'bg-pink-500/10 text-pink-600')}
                        ${featureCard('inbox', 'Demandes', 'Gestion des demandes d\'inscription et de services avec suivi de statut.', 'bg-amber-500/10 text-amber-600')}
                        ${featureCard('person', 'Profils', 'Fiches utilisateurs complètes avec historique et carte QR d\'accès.', 'bg-orange-500/10 text-orange-600')}
                    </div>
                </div>
            </section>

            <!-- WHY US -->
            <section class="py-28 bg-white">
                <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div class="grid grid-cols-2 gap-5 relative fade-up">
                        <div class="absolute inset-0 bg-primary/5 rounded-full blur-[80px] -z-10"></div>
                        <img src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=600" class="rounded-2xl shadow-lg mt-10 object-cover h-60 w-full border border-outline-variant/30" />
                        <img src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=600" class="rounded-2xl shadow-lg object-cover h-60 w-full border border-outline-variant/30" />
                    </div>
                    <div class="fade-up fade-up-d1">
                        <p class="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-3">Avantages</p>
                        <h2 class="text-4xl font-black text-on-surface mb-8">Pourquoi Gest Biblio ?</h2>
                        <div class="space-y-7">
                            <div class="flex gap-5 group">
                                <div class="mt-0.5 w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm"><span class="material-symbols-outlined">bolt</span></div>
                                <div><h4 class="font-bold text-lg mb-1">Automatisation</h4><p class="text-on-surface text-base leading-relaxed">Validez un emprunt en 2 clics ou scannez un QR code instantanément.</p></div>
                            </div>
                            <div class="flex gap-5 group">
                                <div class="mt-0.5 w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm"><span class="material-symbols-outlined">security</span></div>
                                <div><h4 class="font-bold text-lg mb-1">Fiabilité</h4><p class="text-on-surface text-base leading-relaxed">Archivage sécurisé des historiques avec sauvegardes automatiques.</p></div>
                            </div>
                            <div class="flex gap-5 group">
                                <div class="mt-0.5 w-12 h-12 rounded-2xl bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm"><span class="material-symbols-outlined">insights</span></div>
                                <div><h4 class="font-bold text-lg mb-1">Vision Stratégique</h4><p class="text-on-surface text-base leading-relaxed">Des statistiques avancées pour optimiser le budget et la gestion.</p></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- CTA -->
            <section class="py-20 bg-gradient-to-br from-primary to-secondary relative overflow-hidden">
                <div class="absolute inset-0 shimmer-bg"></div>
                <div class="max-w-3xl mx-auto px-6 text-center relative z-10">
                    <h2 class="text-4xl font-black text-white mb-4">Prêt à commencer ?</h2>
                    <p class="text-white/80 text-lg mb-8">Accédez au tableau de bord et gérez votre bibliothèque dès maintenant.</p>
                    <button onclick="navigate('dashboard')" aria-label="Accéder au portail" class="inline-flex items-center gap-3 px-10 py-4 bg-white text-primary rounded-2xl font-bold text-lg shadow-2xl hover:-translate-y-1 hover:shadow-white/30 transition-all">
                        Accéder au portail <span class="material-symbols-outlined">arrow_forward</span>
                    </button>
                </div>
            </section>

            <!-- FOOTER -->
            <footer id="contact" class="bg-[#0a0f1a] text-slate-400 pt-20 pb-8">
                <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div class="md:col-span-2">
                        <div class="flex items-center gap-3 mb-6">
                            <div class="w-11 h-11 bg-primary rounded-xl flex items-center justify-center shadow-md"><span class="material-symbols-outlined text-white">auto_stories</span></div>
                            <div><h3 class="text-white font-black text-xl">Gest Biblio</h3><p class="text-[10px] uppercase tracking-widest text-slate-500">Université de Labé</p></div>
                        </div>
                        <p class="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">Plateforme officielle de gestion pour la Bibliothèque Centrale de l'Université de Labé. Moderniser l'accès au savoir.</p>
                        <div class="flex gap-3">
                            <a href="#" class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors text-slate-400 hover:text-white"><span class="material-symbols-outlined text-lg">language</span></a>
                            <a href="#" class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors text-slate-400 hover:text-white"><span class="material-symbols-outlined text-lg">mail</span></a>
                            <a href="#" class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors text-slate-400 hover:text-white"><span class="material-symbols-outlined text-lg">call</span></a>
                        </div>
                    </div>
                    <div>
                        <h4 class="text-white font-bold mb-5 text-sm uppercase tracking-wider">Contact</h4>
                        <ul class="space-y-3 text-sm">
                            <li class="flex items-center gap-2.5"><span class="material-symbols-outlined text-sm text-primary">location_on</span>Campus de Labé, Bâtiment Central</li>
                            <li class="flex items-center gap-2.5"><span class="material-symbols-outlined text-sm text-primary">email</span>contact-biblio@univ-labe.gn</li>
                            <li class="flex items-center gap-2.5"><span class="material-symbols-outlined text-sm text-primary">phone</span>+224 622 00 00 00</li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="text-white font-bold mb-5 text-sm uppercase tracking-wider">Liens Rapides</h4>
                        <ul class="space-y-3 text-sm">
                            <li><a href="#" onclick="navigate('dashboard')" class="hover:text-white transition-colors flex items-center gap-2"><span class="material-symbols-outlined text-xs">chevron_right</span>Portail</a></li>
                            <li><a href="#" onclick="navigate('books')" class="hover:text-white transition-colors flex items-center gap-2"><span class="material-symbols-outlined text-xs">chevron_right</span>Catalogage</a></li>
                            <li><a href="#" onclick="navigate('stats')" class="hover:text-white transition-colors flex items-center gap-2"><span class="material-symbols-outlined text-xs">chevron_right</span>Statistiques</a></li>
                            <li><a href="#" class="hover:text-white transition-colors flex items-center gap-2"><span class="material-symbols-outlined text-xs">chevron_right</span>Support Technique</a></li>
                        </ul>
                    </div>
                </div>
                <div class="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-800/60 text-xs text-slate-600 flex flex-col md:flex-row justify-between items-center gap-2">
                    <p>&copy; 2026 Université de Labé · Gest Biblio. Tous droits réservés.</p>
                    <p>Projet Universitaire d'Excellence · Conçu avec passion</p>
                </div>
            </footer>
        </div>
        `;
    },



    dashboard: () => renderDashboardPage('Administrateur'),
    'dashboard-etudiant': () => renderDashboardPage('Étudiant'),
    'dashboard-professeur': () => renderDashboardPage('Professeur'),
    'dashboard-gestionnaire': () => renderDashboardPage('Gestionnaire'),
    students: () => {
        const { users } = (window as any).appStore || { users: [] };
        
        if (!(window as any).initStudentsUI) {
            (window as any).activeDbTab = 'Étudiant';

            (window as any).handlePhotoUpload = (input: any) => {
                const file = input.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const dataUrl = e.target?.result as string;
                        document.getElementById('photoPreview')!.setAttribute('src', dataUrl);
                        document.getElementById('photoPreview')!.classList.remove('hidden');
                        document.getElementById('photoPlaceholder')!.classList.add('hidden');
                        (document.getElementById('photoUrlInput') as HTMLInputElement).value = dataUrl;
                    };
                    reader.readAsDataURL(file);
                }
            };

            // ── Université de Labé — structure académique ─────────────────
            const UNIVERSITE_LABE_DEPTS: Record<string, string[]> = {
                FST: [
                    'Département de Mathématiques',
                    "Département d'Informatique",
                    'Département MIAGE',
                    "Département d'Énergie Photovoltaïque",
                    'Département de Biologie Appliquée'
                ],
                FSAG: [
                    "Département d'Administration Publique",
                    'Département de Gestion',
                    "Département d'Économie",
                    "Département d'Économie Sociale Familiale"
                ],
                FLSH: [
                    'Département de Sociologie',
                    "Département d'Anglais",
                    'Département de Langue Arabe'
                ]
            };

            (window as any).handleFacultyChange = (facultyId: string) => {
                const deptSelect = document.getElementById('departmentInput') as HTMLSelectElement;
                if (!deptSelect) return;
                const depts = UNIVERSITE_LABE_DEPTS[facultyId] || [];
                if (depts.length === 0) {
                    deptSelect.innerHTML = "<option value=''>— Choisir d'abord une faculté —</option>";
                    deptSelect.disabled = true;
                    return;
                }
                deptSelect.disabled = false;
                deptSelect.innerHTML = "<option value=''>— Sélectionner un département —</option>" +
                    depts.map((d: string) => `<option value="${d}">${d}</option>`).join('');
            };



            (window as any).handleRoleChange = (role: string) => {
                document.getElementById('roleInput')!.setAttribute('value', role);
                document.getElementById('btnRoleStudent')!.className = role === 'Étudiant' 
                    ? 'flex-1 py-2.5 bg-primary text-white text-sm font-bold rounded-l-xl shadow-md transition-all duration-300' 
                    : 'flex-1 py-2.5 bg-surface text-on-surface text-sm font-bold rounded-l-xl border border-outline-variant hover:bg-surface-container transition-all duration-300';
                document.getElementById('btnRoleProf')!.className = role === 'Professeur' 
                    ? 'flex-1 py-2.5 bg-primary text-white text-sm font-bold rounded-r-xl shadow-md transition-all duration-300' 
                    : 'flex-1 py-2.5 bg-surface text-on-surface text-sm font-bold rounded-r-xl border border-outline-variant hover:bg-surface-container transition-all duration-300';
                
                const studentFields = document.getElementById('studentFields');
                const professorFields = document.getElementById('professorFields');
                
                const licenceInput = document.getElementById('licenceInput') as HTMLInputElement;
                const amountInput = document.getElementById('amountInput') as HTMLInputElement;
                const telephoneInput = document.getElementById('telephoneInput') as HTMLInputElement;
                
                const matriculeInput = document.getElementById('matriculeInput') as HTMLInputElement;
                const fonctionInput = document.getElementById('fonctionInput') as HTMLInputElement;
                const addressInput = document.getElementById('addressInput') as HTMLInputElement;

                if (role === 'Étudiant') {
                    studentFields?.classList.remove('hidden');
                    professorFields?.classList.add('hidden');
                    
                    licenceInput.required = true;
                    amountInput.required = true;
                    telephoneInput.required = true;
                    
                    matriculeInput.required = false;
                    fonctionInput.required = false;
                    addressInput.required = false;
                } else {
                    studentFields?.classList.add('hidden');
                    professorFields?.classList.remove('hidden');
                    
                    licenceInput.required = false;
                    amountInput.required = false;
                    telephoneInput.required = false;
                    
                    matriculeInput.required = true;
                    fonctionInput.required = true;
                    addressInput.required = true;
                }
            };

            (window as any).switchFormMode = (mode: string) => {
                const tabIns = document.getElementById('tabInscription')!;
                const tabReins = document.getElementById('tabReinscription')!;
                const reSearch = document.getElementById('reRegistrationSearch')!;
                const submitBtn = document.getElementById('submitBtn')!;
                
                (window as any).cancelEdit(); // Reset everything
                
                if (mode === 'inscription') {
                    tabIns.className = 'flex-1 py-3.5 text-[13px] font-bold bg-surface-container-lowest text-primary border-b-2 border-primary transition-all flex justify-center items-center gap-2';
                    tabReins.className = 'flex-1 py-3.5 text-[13px] font-bold bg-surface-container-lowest text-on-surface-variant border-b-2 border-transparent hover:text-primary transition-all flex justify-center items-center gap-2';
                    reSearch.classList.add('hidden');
                    submitBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">person_add</span> Enregistrer l\'inscription';
                    (document.getElementById('isReinscriptionInput') as HTMLInputElement).value = 'false';
                } else {
                    tabReins.className = 'flex-1 py-3.5 text-[13px] font-bold bg-surface-container-lowest text-primary border-b-2 border-primary transition-all flex justify-center items-center gap-2';
                    tabIns.className = 'flex-1 py-3.5 text-[13px] font-bold bg-surface-container-lowest text-on-surface-variant border-b-2 border-transparent hover:text-primary transition-all flex justify-center items-center gap-2';
                    reSearch.classList.remove('hidden');
                    submitBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">update</span> Valider la réinscription';
                    (document.getElementById('isReinscriptionInput') as HTMLInputElement).value = 'true';
                    setTimeout(() => document.getElementById('searchReRegistration')!.focus(), 50);
                }
            };

            (window as any).handleReRegistrationSearch = () => {
                const searchInput = document.getElementById('searchReRegistration') as HTMLInputElement;
                const search = searchInput.value.toLowerCase().trim();
                const dropdown = document.getElementById('reRegistrationDropdown')!;
                
                if (search.length < 2) {
                    dropdown.classList.add('hidden');
                    return;
                }
                
                const storeUsers = (window as any).appStore.users;
                const matches = storeUsers.filter((u: any) => 
                    (u.fullname && u.fullname.toLowerCase().includes(search)) ||
                    (u.matricule && u.matricule.toLowerCase().includes(search)) ||
                    (u.username && u.username.toLowerCase().includes(search))
                ).slice(0, 5);
                
                if (matches.length > 0) {
                    dropdown.innerHTML = matches.map((u: any) => {
                        const defaultPhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullname || '')}&background=random`;
                        return `
                            <div onclick="window.selectForReRegistration('${u.id}')" class="flex items-center gap-3 p-3 hover:bg-surface-container cursor-pointer border-b border-outline-variant/30 last:border-0">
                                <img src="${u.photoUrl || defaultPhoto}" class="w-8 h-8 rounded-full object-cover shadow-sm" />
                                <div>
                                    <div class="text-sm font-bold text-on-surface">${u.fullname} <span class="text-[10px] text-on-surface-variant font-normal">(@${u.username})</span></div>
                                    <div class="text-[10px] text-primary font-bold uppercase tracking-wider">${u.role} ${u.matricule ? ' - ' + u.matricule : ''}</div>
                                </div>
                            </div>
                        `;
                    }).join('');
                    dropdown.classList.remove('hidden');
                } else {
                    dropdown.innerHTML = '<div class="p-3 text-xs text-on-surface-variant text-center"><span class="material-symbols-outlined text-[16px] align-middle">error</span> Aucun utilisateur trouvé</div>';
                    dropdown.classList.remove('hidden');
                }
            };
            
            // Hide dropdown when clicking outside
            document.addEventListener('click', (e) => {
                const dropdown = document.getElementById('reRegistrationDropdown');
                const searchInput = document.getElementById('searchReRegistration');
                if (dropdown && !dropdown.contains(e.target as Node) && e.target !== searchInput) {
                    dropdown.classList.add('hidden');
                }
            });

            (window as any).selectForReRegistration = (id: string) => {
                document.getElementById('reRegistrationDropdown')!.classList.add('hidden');
                (document.getElementById('searchReRegistration') as HTMLInputElement).value = '';
                (window as any).editUser(id, true);
            };

            (window as any).editUser = (id: string, isReRegistration = false) => {
                const user = (window as any).appStore.users.find((u: any) => u.id === id);
                if (!user) return;
                
                document.getElementById('userIdInput')!.setAttribute('value', user.id);
                (document.getElementById('isReinscriptionInput') as HTMLInputElement).value = isReRegistration ? 'true' : 'false';
                
                if (!isReRegistration) {
                    document.getElementById('tabInscription')!.className = 'flex-1 py-3.5 text-[13px] font-bold bg-surface-container-lowest text-primary border-b-2 border-primary transition-all flex justify-center items-center gap-2';
                    document.getElementById('tabReinscription')!.className = 'flex-1 py-3.5 text-[13px] font-bold bg-surface-container-lowest text-on-surface-variant border-b-2 border-transparent hover:text-primary transition-all flex justify-center items-center gap-2';
                    document.getElementById('reRegistrationSearch')!.classList.add('hidden');
                    document.getElementById('submitBtn')!.innerHTML = '<span class="material-symbols-outlined text-[18px]">update</span> Mettre à jour';
                    document.getElementById('tabInscription')!.innerHTML = '<span class="material-symbols-outlined text-[18px]">edit</span> Modification Rapide';
                } else {
                    document.getElementById('submitBtn')!.innerHTML = '<span class="material-symbols-outlined text-[18px]">update</span> Valider la réinscription';
                    document.getElementById('tabInscription')!.innerHTML = '<span class="material-symbols-outlined text-[18px]">person_add</span> Nouvelle Inscription';
                }
                
                (document.getElementById('fullnameInput') as HTMLInputElement).value = user.fullname || '';
                (document.getElementById('usernameInput') as HTMLInputElement).value = user.username || '';

                // Populate faculty → department cascade
                const facultySelect = document.getElementById('facultyInput') as HTMLSelectElement;
                const deptSelect = document.getElementById('departmentInput') as HTMLSelectElement;
                if (facultySelect && deptSelect) {
                    const fac = user.faculty || '';
                    facultySelect.value = fac;
                    (window as any).handleFacultyChange(fac);
                    setTimeout(() => {
                        deptSelect.value = user.department || '';
                    }, 20);
                }
                
                // Load extra fields safely without undefined
                (document.getElementById('matriculeInput') as HTMLInputElement).value = user.matricule || '';
                (document.getElementById('licenceInput') as HTMLInputElement).value = user.licence || '';
                (document.getElementById('amountInput') as HTMLInputElement).value = user.amount || '';
                (document.getElementById('telephoneInput') as HTMLInputElement).value = user.telephone || '';
                (document.getElementById('fonctionInput') as HTMLInputElement).value = user.fonction || '';
                (document.getElementById('addressInput') as HTMLInputElement).value = user.address || '';
                
                if (user.photoUrl) {
                    document.getElementById('photoPreview')!.setAttribute('src', user.photoUrl);
                    document.getElementById('photoPreview')!.classList.remove('hidden');
                    document.getElementById('photoPlaceholder')!.classList.add('hidden');
                    (document.getElementById('photoUrlInput') as HTMLInputElement).value = user.photoUrl;
                } else {
                    document.getElementById('photoPreview')!.classList.add('hidden');
                    document.getElementById('photoPlaceholder')!.classList.remove('hidden');
                    (document.getElementById('photoUrlInput') as HTMLInputElement).value = '';
                }
                
                (window as any).handleRoleChange(user.role === 'Professeur' ? 'Professeur' : 'Étudiant');
                
                document.getElementById('cancelEditBtn')!.classList.remove('hidden');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };

            (window as any).showUserCard = (userId: string) => {
                const user = (window as any).appStore.users.find((u: any) => u.id === userId);
                if (!user) return;
                
                const modal = document.getElementById('userCardModal');
                if (!modal) return;
                
                const defaultPhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname || '')}&background=random`;
                const photoUrl = user.photoUrl || defaultPhoto;
                const formattedDate = new Date(user.registrationDate || new Date()).toLocaleDateString('fr-FR');
                
                document.getElementById('card-photo')!.setAttribute('src', photoUrl);
                document.getElementById('card-qr')!.setAttribute('src', user.qrCodeDataUrl || '');
                document.getElementById('card-name')!.innerText = user.fullname || '';
                document.getElementById('card-matricule')!.innerText = user.matricule || 'N/A';
                document.getElementById('card-dept')!.innerText = user.department || 'N/A';
                document.getElementById('card-date')!.innerText = formattedDate;
                document.getElementById('card-id')!.innerText = user.id;

                const isProf = user.role === 'Professeur';
                
                document.getElementById('card-type-title')!.innerText = isProf ? 'Carte Professionnelle' : "Carte d'Étudiant";
                document.getElementById('modal-title-text')!.innerText = isProf ? 'Carte Professionnelle' : 'Carte Étudiant';
                
                const labelNiveau = document.getElementById('card-label-niveau')!;
                const valNiveau = document.getElementById('card-val-niveau')!;
                
                if (isProf) {
                    labelNiveau.innerText = 'Service / Fonction';
                    valNiveau.innerText = user.fonction || 'N/A';
                    document.getElementById('card-header-bg')!.className = 'bg-secondary px-4 py-3 flex items-center gap-3';
                    document.getElementById('card-bottom-bar')!.className = 'h-1.5 w-full bg-gradient-to-r from-secondary via-primary to-secondary';
                    document.getElementById('card-name')!.className = 'text-[14px] font-black text-on-surface leading-tight mb-2 text-secondary';
                } else {
                    labelNiveau.innerText = "Niveau d'étude";
                    valNiveau.innerText = user.licence || 'N/A';
                    document.getElementById('card-header-bg')!.className = 'bg-primary px-4 py-3 flex items-center gap-3';
                    document.getElementById('card-bottom-bar')!.className = 'h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-primary';
                    document.getElementById('card-name')!.className = 'text-[14px] font-black text-on-surface leading-tight mb-2 text-primary';
                }
                
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            };
            
            (window as any).closeUserCard = () => {
                const modal = document.getElementById('userCardModal');
                if (modal) {
                    modal.classList.add('hidden');
                    modal.classList.remove('flex');
                }
                (window as any).navigate('students'); // Refresh list
            };
            
            (window as any).printUserCard = () => {
                const cardContent = document.getElementById('user-card-content')?.innerHTML;
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                    printWindow.document.write(`
                        <html>
                        <head>
                            <title>Impression Carte</title>
                            <script src="https://cdn.tailwindcss.com"></script>
                            <style>
                                @media print {
                                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                                    @page { size: portrait; margin: 0; }
                                }
                                body { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; margin: 0; }
                            </style>
                        </head>
                        <body>
                            <div class="w-[340px] bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-200" style="font-family: system-ui, sans-serif;">
                                ${cardContent}
                            </div>
                            <script>
                                setTimeout(() => { window.print(); window.close(); }, 500);
                            </script>
                        </body>
                        </html>
                    `);
                    printWindow.document.close();
                }
            };

            (window as any).cancelEdit = () => {
                document.getElementById('userIdInput')!.setAttribute('value', '');
                (document.getElementById('isReinscriptionInput') as HTMLInputElement).value = 'false';
                (document.getElementById('userForm') as HTMLFormElement).reset();
                document.getElementById('tabInscription')!.innerHTML = '<span class="material-symbols-outlined text-[18px]">person_add</span> Nouvelle Inscription';
                
                document.getElementById('photoPreview')!.classList.add('hidden');
                document.getElementById('photoPlaceholder')!.classList.remove('hidden');
                (document.getElementById('photoUrlInput') as HTMLInputElement).value = '';
                
                (document.getElementById('licenceInput') as HTMLInputElement).value = '';
                (document.getElementById('amountInput') as HTMLInputElement).value = '';
                (document.getElementById('telephoneInput') as HTMLInputElement).value = '';
                (document.getElementById('matriculeInput') as HTMLInputElement).value = '';
                (document.getElementById('fonctionInput') as HTMLInputElement).value = '';
                (document.getElementById('addressInput') as HTMLInputElement).value = '';

                (window as any).handleRoleChange('Étudiant');
                
                const isReinsTab = !document.getElementById('reRegistrationSearch')!.classList.contains('hidden');
                if (isReinsTab) {
                    document.getElementById('submitBtn')!.innerHTML = '<span class="material-symbols-outlined text-[18px]">update</span> Valider la réinscription';
                    (document.getElementById('isReinscriptionInput') as HTMLInputElement).value = 'true';
                } else {
                    document.getElementById('submitBtn')!.innerHTML = '<span class="material-symbols-outlined text-[18px]">person_add</span> Enregistrer l\'inscription';
                }
                
                document.getElementById('cancelEditBtn')!.classList.add('hidden');
            };

            (window as any).handleUserSubmit = (e: Event) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const fd = new FormData(form);
                const id = fd.get('userId') as string;
                const isReins = fd.get('isReinscription') === 'true';
                
                const data: any = {
                    role: fd.get('role') as string,
                    fullname: fd.get('fullname') as string,
                    username: fd.get('username') as string,
                    faculty: fd.get('faculty') as string || undefined,
                    department: fd.get('department') as string,
                    matricule: fd.get('matricule') as string || undefined,
                    photoUrl: fd.get('photoUrl') as string || undefined,
                    licence: fd.get('licence') as string || undefined,
                    amount: fd.get('amount') as string || undefined,
                    telephone: fd.get('telephone') as string || undefined,
                    fonction: fd.get('fonction') as string || undefined,
                    address: fd.get('address') as string || undefined,
                };
                
                if (data.role === 'Étudiant') {
                    data.matricule = undefined;
                    data.fonction = undefined;
                    data.address = undefined;
                } else {
                    data.licence = undefined;
                    data.amount = undefined;
                    data.telephone = undefined;
                }
                
                if (id) {
                    if (isReins) {
                        data.isReinscription = true;
                    }
                    (window as any).appStore.updateUser(id, data);
                } else {
                    (window as any).appStore.addUser(data);
                }
            };
            
            (window as any).switchDbTab = (tab: string) => {
                (window as any).activeDbTab = tab;
                const dbTabStudent = document.getElementById('dbTabStudent');
                const dbTabProf = document.getElementById('dbTabProf');
                const studentTableWrapper = document.getElementById('studentTableWrapper');
                const professorTableWrapper = document.getElementById('professorTableWrapper');
                
                if (tab === 'Étudiant') {
                    dbTabStudent?.classList.add('text-primary', 'border-primary');
                    dbTabStudent?.classList.remove('text-on-surface-variant', 'border-transparent');
                    
                    dbTabProf?.classList.remove('text-primary', 'border-primary');
                    dbTabProf?.classList.add('text-on-surface-variant', 'border-transparent');
                    
                    studentTableWrapper?.classList.remove('hidden');
                    professorTableWrapper?.classList.add('hidden');
                } else {
                    dbTabProf?.classList.add('text-primary', 'border-primary');
                    dbTabProf?.classList.remove('text-on-surface-variant', 'border-transparent');
                    
                    dbTabStudent?.classList.remove('text-primary', 'border-primary');
                    dbTabStudent?.classList.add('text-on-surface-variant', 'border-transparent');
                    
                    professorTableWrapper?.classList.remove('hidden');
                    studentTableWrapper?.classList.add('hidden');
                }
                (window as any).filterUsers(); // update active search filter
            };

            (window as any).filterUsers = () => {
                const search = (document.getElementById('searchUser') as HTMLInputElement).value.toLowerCase();
                const activeTab = (window as any).activeDbTab || 'Étudiant';
                const activeFaculty = (window as any).activeFacultyFilter || '';
                
                const rows = document.querySelectorAll('.user-row');
                let activeCount = 0;

                rows.forEach((row: any) => {
                    const rowName = (row.getAttribute('data-name') || '').toLowerCase();
                    const rowRole = row.getAttribute('data-role');
                    const rowMatricule = (row.getAttribute('data-matricule') || '').toLowerCase();
                    const rowFaculty = (row.getAttribute('data-faculty') || '').toLowerCase();
                    const rowDept = (row.getAttribute('data-department') || '').toLowerCase();
                    
                    const matchSearch = rowName.includes(search) || rowMatricule.includes(search) || rowDept.includes(search.toLowerCase());
                    const matchTab = rowRole === activeTab;
                    const matchFaculty = !activeFaculty
                        ? true
                        : activeFaculty === 'none'
                        ? !rowFaculty
                        : rowFaculty === activeFaculty.toLowerCase();
                    
                    if (matchSearch && matchTab && matchFaculty) {
                        row.style.display = '';
                        activeCount++;
                    } else {
                        row.style.display = 'none';
                    }
                });
                
                const countBadge = document.getElementById('usersCount');
                if (countBadge) {
                    countBadge.innerText = activeCount + ' ' + (activeTab === 'Étudiant' ? 'étudiant' : 'professeur') + (activeCount > 1 ? 's' : '') + ' trouvé(s)';
                }
            };

            (window as any).filterByFaculty = (facultyId: string) => {
                (window as any).activeFacultyFilter = facultyId;
                // Update chip styles
                const chips: Record<string, string> = {
                    '': 'filter-fac-all',
                    'FST': 'filter-fac-fst',
                    'FSAG': 'filter-fac-fsag',
                    'FLSH': 'filter-fac-flsh',
                    'none': 'filter-fac-none'
                };
                const colorMap: Record<string, string> = {
                    'filter-fac-all': 'bg-primary text-white shadow-sm',
                    'filter-fac-fst': 'bg-blue-500 text-white shadow-sm',
                    'filter-fac-fsag': 'bg-emerald-500 text-white shadow-sm',
                    'filter-fac-flsh': 'bg-purple-500 text-white shadow-sm',
                    'filter-fac-none': 'bg-on-surface text-white shadow-sm'
                };
                const defaultMap: Record<string, string> = {
                    'filter-fac-all': 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high',
                    'filter-fac-fst': 'bg-blue-500/10 text-blue-700 hover:bg-blue-500/20',
                    'filter-fac-fsag': 'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20',
                    'filter-fac-flsh': 'bg-purple-500/10 text-purple-700 hover:bg-purple-500/20',
                    'filter-fac-none': 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                };
                Object.entries(chips).forEach(([key, id]) => {
                    const el = document.getElementById(id);
                    if (!el) return;
                    const isActive = key === facultyId;
                    el.className = `px-3 py-1 rounded-full text-[10px] font-bold transition-all ${isActive ? colorMap[id] : defaultMap[id]}`;
                });
                (window as any).filterUsers();
            };

            
            (window as any).initStudentsUI = true;
        }

        const studentsList = users.filter((u: any) => u.role === 'Étudiant');
        const professorsList = users.filter((u: any) => u.role === 'Professeur');

        return `
        <div class="flex min-h-screen bg-surface-container-lowest">
            ${getSidebar('students', window.authUI?.currentRole || 'admin')}
            <main class="flex-grow ml-[260px]">
                ${getTopBar(window.authUI?.currentRole || 'admin')}
                
                <div class="p-6">
                    <!-- Header -->
                    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                        <div>
                            <h2 class="text-2xl font-black text-primary tracking-tight text-black">Inscription & Réinscription</h2>
                            <p class="text-xs text-on-surface-variant mt-1">Gérez les comptes étudiants et professeurs de la bibliothèque.</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="window.appStore.exportPDF('users')" class="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container transition-all shadow-sm">
                                <span class="material-symbols-outlined text-[16px]">picture_as_pdf</span> Exporter PDF
                            </button>
                            <button onclick="window.appStore.exportExcel('users')" class="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container transition-all shadow-sm">
                                <span class="material-symbols-outlined text-[16px]">table</span> Exporter Excel
                            </button>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        <!-- LEFT COLUMN: FORM -->
                        <div class="lg:col-span-4">
                            <div class="bg-white border border-outline-variant rounded-3xl shadow-sm overflow-hidden sticky top-24">
                                
                                <!-- TABS -->
                                <div class="flex border-b border-outline-variant bg-surface-container-lowest">
                                    <button id="tabInscription" type="button" onclick="window.switchFormMode('inscription')" class="flex-1 py-3.5 text-[12px] font-bold bg-surface-container-lowest text-primary border-b-2 border-primary transition-all flex justify-center items-center gap-2">
                                        <span class="material-symbols-outlined text-[18px]">person_add</span> Inscription
                                    </button>
                                    <button id="tabReinscription" type="button" onclick="window.switchFormMode('reinscription')" class="flex-1 py-3.5 text-[12px] font-bold bg-surface-container-lowest text-on-surface-variant border-b-2 border-transparent hover:text-primary transition-all flex justify-center items-center gap-2">
                                        <span class="material-symbols-outlined text-[18px]">update</span> Réinscription
                                    </button>
                                </div>
                                
                                <div class="p-5">
                                    <div class="flex justify-end mb-2">
                                        <button id="cancelEditBtn" onclick="window.cancelEdit()" class="hidden text-[9px] uppercase font-bold text-error bg-error/10 px-2 py-1 rounded-lg hover:bg-error/20 transition-all">
                                            Annuler modification
                                        </button>
                                    </div>
                                    
                                    <!-- Search for re-registration (hidden by default) -->
                                    <div id="reRegistrationSearch" class="hidden mb-6 relative">
                                        <label class="block text-[10px] uppercase tracking-wider font-bold text-on-surface-variant mb-2">Rechercher l'utilisateur à réinscrire *</label>
                                        <div class="relative">
                                            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                                            <input type="text" id="searchReRegistration" onkeyup="window.handleReRegistrationSearch()" onfocus="window.handleReRegistrationSearch()" placeholder="Nom, matricule ou @pseudo..." class="w-full border border-outline-variant rounded-xl pl-9 pr-3 py-2.5 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all bg-primary/5 border-primary/30" />
                                        </div>
                                        <!-- Dropdown -->
                                        <div id="reRegistrationDropdown" class="absolute z-50 left-0 right-0 mt-1 bg-white border border-outline-variant rounded-xl shadow-xl max-h-48 overflow-y-auto hidden">
                                        </div>
                                    </div>
 
                                    <form id="userForm" onsubmit="window.handleUserSubmit(event)" class="space-y-4">
                                        <input type="hidden" name="userId" id="userIdInput" value="">
                                        <input type="hidden" name="role" id="roleInput" value="Étudiant">
                                        <input type="hidden" name="isReinscription" id="isReinscriptionInput" value="false">
                                        
                                        <!-- Role Toggle -->
                                        <div class="flex rounded-xl bg-surface-container p-1 shadow-sm w-full">
                                            <button type="button" id="btnRoleStudent" onclick="window.handleRoleChange('Étudiant')" class="flex-1 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-md transition-all duration-300">
                                                Étudiant
                                            </button>
                                            <button type="button" id="btnRoleProf" onclick="window.handleRoleChange('Professeur')" class="flex-1 py-2 bg-transparent text-on-surface text-xs font-bold rounded-xl hover:bg-surface-container transition-all duration-300">
                                                Professeur
                                            </button>
                                        </div>
                                        
                                        <!-- Photo Upload -->
                                        <div class="bg-surface-container-low p-3 rounded-2xl border border-outline-variant/40">
                                            <label class="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">Photo de profil (Recommandée)</label>
                                            <div class="flex items-center gap-4">
                                                <div class="w-14 h-14 rounded-full bg-white border border-outline-variant flex items-center justify-center overflow-hidden shadow-sm shrink-0" id="photoPreviewContainer">
                                                    <span class="material-symbols-outlined text-outline-variant text-xl" id="photoPlaceholder">add_a_photo</span>
                                                    <img id="photoPreview" class="w-full h-full object-cover hidden" />
                                                </div>
                                                <div class="flex-1">
                                                    <input type="file" id="photoInput" accept="image/*" class="hidden" onchange="window.handlePhotoUpload(this)" />
                                                    <button type="button" onclick="document.getElementById('photoInput').click()" class="px-4 py-2.5 bg-white border border-outline-variant text-primary rounded-xl text-xs font-bold shadow-sm hover:bg-primary/5 transition-all w-full flex justify-center items-center gap-2">
                                                        <span class="material-symbols-outlined text-[16px]">upload</span> Choisir une photo
                                                    </button>
                                                    <input type="hidden" name="photoUrl" id="photoUrlInput" />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Fields Group -->
                                        <div class="space-y-4">
                                            <div>
                                                <label class="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Nom complet *</label>
                                                <input type="text" name="fullname" id="fullnameInput" required placeholder="Mariama Sylla" class="w-full border border-outline-variant rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary transition-all bg-surface-container-lowest" />
                                            </div>
                                            
                                            <div class="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label class="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Nom d'utilisateur *</label>
                                                    <input type="text" name="username" id="usernameInput" required placeholder="msylla" class="w-full border border-outline-variant rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary transition-all bg-surface-container-lowest" />
                                                </div>
                                            </div>

                                            <!-- FACULTÉ + DÉPARTEMENT CASCADE -->
                                            <div class="space-y-2 p-3 rounded-2xl bg-primary/5 border border-primary/20">
                                                <p class="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Structure Académique — Université de Labé</p>
                                                <div>
                                                    <label class="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Faculté *</label>
                                                    <select name="faculty" id="facultyInput" required onchange="window.handleFacultyChange(this.value)" class="w-full border border-outline-variant rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary transition-all bg-white appearance-none cursor-pointer">
                                                        <option value="">— Sélectionner une faculté —</option>
                                                        <option value="FST">FST — Faculté des Sciences et Techniques</option>
                                                        <option value="FSAG">FSAG — Faculté des Sciences Administratives et de Gestion</option>
                                                        <option value="FLSH">FLSH — Faculté des Lettres et Sciences Humaines</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label class="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Département *</label>
                                                    <select name="department" id="departmentInput" required class="w-full border border-outline-variant rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary transition-all bg-white appearance-none cursor-pointer disabled:opacity-50">
                                                        <option value="">— Choisir d'abord une faculté —</option>
                                                    </select>
                                                </div>
                                            </div>
                                            
                                            <!-- STUDENT FIELDS -->
                                            <div id="studentFields" class="space-y-4">
                                                <div class="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label class="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Licence *</label>
                                                        <input type="text" name="licence" id="licenceInput" required placeholder="Licence 3" class="w-full border border-outline-variant rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary transition-all bg-surface-container-lowest" />
                                                    </div>
                                                    <div>
                                                        <label class="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Montant *</label>
                                                        <input type="text" name="amount" id="amountInput" required placeholder="250 000 FG" class="w-full border border-outline-variant rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary transition-all bg-surface-container-lowest" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label class="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Téléphone *</label>
                                                    <input type="tel" name="telephone" id="telephoneInput" required placeholder="+224 620 00 00 00" class="w-full border border-outline-variant rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary transition-all bg-surface-container-lowest" />
                                                </div>
                                            </div>

                                            <!-- PROFESSOR FIELDS -->
                                            <div id="professorFields" class="space-y-4 hidden">
                                                <div class="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label class="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Matricule *</label>
                                                        <input type="text" name="matricule" id="matriculeInput" placeholder="PROF-LABE-09" class="w-full border border-outline-variant rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary transition-all bg-surface-container-lowest font-mono uppercase" />
                                                    </div>
                                                    <div>
                                                        <label class="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Service / Fonction *</label>
                                                        <input type="text" name="fonction" id="fonctionInput" placeholder="Enseignant-Chercheur" class="w-full border border-outline-variant rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary transition-all bg-surface-container-lowest" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label class="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Adresse *</label>
                                                    <input type="text" name="address" id="addressInput" placeholder="Ex: Konkola, Labé" class="w-full border border-outline-variant rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary transition-all bg-surface-container-lowest" />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <button type="submit" id="submitBtn" class="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-xs shadow-md hover:shadow-lg transition-all mt-4 flex justify-center items-center gap-2">
                                            <span class="material-symbols-outlined text-[18px]">person_add</span> Enregistrer l'inscription
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                        
                        <!-- RIGHT COLUMN: LIST -->
                        <div class="lg:col-span-8 flex flex-col">
                            <div class="bg-white border border-outline-variant rounded-3xl shadow-sm flex-grow flex flex-col overflow-hidden">
                                
                                <!-- Toolbar -->
                                <div class="p-4 border-b border-outline-variant bg-surface-container-lowest flex flex-col gap-3">
                                    <div class="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                                        <div class="flex items-center gap-3">
                                            <h3 class="font-black text-sm text-black">Base de données</h3>
                                            <span id="usersCount" class="bg-primary/10 text-primary text-[10px] px-2.5 py-1 rounded-full font-bold">
                                                ${studentsList.length} étudiant(s) trouvé(s)
                                            </span>
                                        </div>
                                        
                                        <div class="flex gap-2 w-full sm:w-auto">
                                            <div class="relative flex-grow sm:w-64 bg-white border border-outline-variant rounded-xl px-3 py-1.5 focus-within:ring-1 focus-within:ring-primary transition-all flex items-center gap-2">
                                                <span class="material-symbols-outlined text-on-surface-variant text-base">search</span>
                                                <input type="text" id="searchUser" onkeyup="window.filterUsers()" placeholder="Rechercher nom, matricule, département..." class="w-full bg-transparent text-xs outline-none border-none p-0" />
                                            </div>
                                        </div>
                                    </div>
                                    <!-- Faculty Filter Chips -->
                                    <div class="flex flex-wrap gap-2">
                                        <button onclick="window.filterByFaculty('')" id="filter-fac-all" class="px-3 py-1 rounded-full text-[10px] font-bold transition-all bg-primary text-white shadow-sm">Toutes les facultés</button>
                                        <button onclick="window.filterByFaculty('FST')" id="filter-fac-fst" class="px-3 py-1 rounded-full text-[10px] font-bold transition-all bg-blue-500/10 text-blue-700 hover:bg-blue-500/20">FST</button>
                                        <button onclick="window.filterByFaculty('FSAG')" id="filter-fac-fsag" class="px-3 py-1 rounded-full text-[10px] font-bold transition-all bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20">FSAG</button>
                                        <button onclick="window.filterByFaculty('FLSH')" id="filter-fac-flsh" class="px-3 py-1 rounded-full text-[10px] font-bold transition-all bg-purple-500/10 text-purple-700 hover:bg-purple-500/20">FLSH</button>
                                        <button onclick="window.filterByFaculty('none')" id="filter-fac-none" class="px-3 py-1 rounded-full text-[10px] font-bold transition-all bg-surface-container text-on-surface-variant hover:bg-surface-container-high">Non assigné</button>
                                    </div>
                                </div>

                                <!-- Tab Switcher for Student vs Professor Database -->
                                <div class="flex border-b border-outline-variant bg-surface-container-lowest">
                                    <button id="dbTabStudent" type="button" onclick="window.switchDbTab('Étudiant')" class="flex-1 py-3 text-xs font-black uppercase tracking-wider text-primary border-b-2 border-primary transition-all flex justify-center items-center gap-2">
                                        <span class="material-symbols-outlined text-[16px]">school</span> Étudiants (${studentsList.length})
                                    </button>
                                    <button id="dbTabProf" type="button" onclick="window.switchDbTab('Professeur')" class="flex-1 py-3 text-xs font-black uppercase tracking-wider text-on-surface-variant border-b-2 border-transparent hover:text-primary transition-all flex justify-center items-center gap-2">
                                        <span class="material-symbols-outlined text-[16px]">co_present</span> Professeurs (${professorsList.length})
                                    </button>
                                </div>
                                
                                <!-- STUDENT TABLE WRAPPER -->
                                <div id="studentTableWrapper" class="overflow-x-auto flex-grow">
                                    <table class="student-table w-full text-left text-sm border-separate" style="border-spacing: 0 0.85rem;">
                                        <thead class="bg-surface-container-highest border border-outline-variant text-[10px] uppercase tracking-[0.18em] text-on-surface-variant sticky top-0 z-10 shadow-sm">
                                            <tr>
                                                <th class="px-4 py-4 font-semibold text-black">N°</th>
                                                <th class="px-4 py-4 font-semibold text-black">Nom & Prénom</th>
                                                <th class="px-4 py-4 font-semibold text-black">Département</th>
                                                <th class="px-4 py-4 font-semibold text-black">Licence</th>
                                                <th class="px-4 py-4 font-semibold text-black">Numéro de Téléphone</th>
                                                <th class="px-4 py-4 font-semibold text-black">Photo</th>
                                                <th class="px-4 py-4 font-semibold text-black">Le montant</th>
                                                <th class="px-4 py-4 font-semibold text-center text-black">Carte & QR</th>
                                                <th class="px-4 py-4 font-semibold text-right text-black">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${studentsList.length > 0 
                                                ? studentsList.map((u: any, idx: number) => {
                                                    const defaultPhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullname || '')}&background=random`;
                                                    const photo = u.photoUrl || defaultPhoto;
                                                    const historyText = u.registrationHistory && u.registrationHistory.length > 1 
                                                        ? `<div class="text-[9px] text-on-surface-variant font-medium mt-0.5 flex items-center gap-0.5"><span class="material-symbols-outlined text-[10px] text-primary">history</span> Réinscrit</div>`
                                                        : `<div class="text-[9px] text-on-surface-variant font-medium mt-0.5 flex items-center gap-0.5"><span class="material-symbols-outlined text-[10px] text-secondary">new_releases</span> Nouvel inscrit</div>`;

                                                    return `
                                                    <tr class="user-row bg-white shadow-sm hover:bg-surface-container transition-all duration-200" 
                                                        data-name="${u.fullname || ''}" 
                                                        data-role="Étudiant" 
                                                        data-faculty="${u.faculty || ''}" 
                                                        data-department="${u.department || ''}" 
                                                        data-matricule="">
                                                        <td class="px-4 py-4 first:rounded-l-3xl last:rounded-r-3xl font-semibold text-on-surface-variant align-top">${idx + 1}</td>
                                                        <td class="px-4 py-4 first:rounded-l-3xl last:rounded-r-3xl align-top">
                                                            <div>
                                                                <div class="font-bold text-primary flex items-center gap-1">${u.fullname || 'Inconnu'} ${u.isActive ? '<span class="w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm" title="Actif"></span>' : ''}</div>
                                                                <div class="text-[9px] text-on-surface-variant font-mono">@${u.username || 'n/a'}</div>
                                                                ${historyText}
                                                            </div>
                                                        </td>
                                                        <td class="px-4 py-4 first:rounded-l-3xl last:rounded-r-3xl align-top">
                                                            <div class="space-y-1">
                                                                ${u.faculty ? `<span class="inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${ u.faculty === 'FST' ? 'bg-blue-500/10 text-blue-700' : u.faculty === 'FSAG' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-purple-500/10 text-purple-700' }">${u.faculty}</span>` : ''}
                                                                <div class="font-bold text-on-surface text-[11px]">${u.department || 'Non assigné'}</div>
                                                            </div>
                                                        </td>
                                                        <td class="px-4 py-4 first:rounded-l-3xl last:rounded-r-3xl align-top">
                                                            <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">${u.licence || 'Licence n/a'}</span>
                                                        </td>
                                                        <td class="px-4 py-4 first:rounded-l-3xl last:rounded-r-3xl font-medium text-on-surface-variant align-top">${u.telephone || 'Aucun numéro'}</td>
                                                        <td class="px-4 py-4 first:rounded-l-3xl last:rounded-r-3xl align-top">
                                                            <img src="${photo}" class="w-9 h-9 rounded-full object-cover border border-outline-variant shadow-sm hover:scale-110 transition-transform cursor-pointer" />
                                                        </td>
                                                        <td class="px-4 py-4 first:rounded-l-3xl last:rounded-r-3xl align-top">
                                                            <span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">${u.amount || 'Non payé'}</span>
                                                        </td>
                                                        <td class="px-4 py-4 first:rounded-l-3xl last:rounded-r-3xl text-center align-top">
                                                            <div class="flex flex-col items-center gap-2">
                                                                ${u.qrCodeDataUrl ? `<img src="${u.qrCodeDataUrl}" onclick="window.showUserCard('${u.id}')" class="h-10 w-10 mx-auto rounded border border-outline-variant shadow-sm hover:scale-110 transition-transform cursor-pointer" />` : '<span class="text-[9px] text-on-surface-variant">Non généré</span>'}
                                                                <button onclick="window.showUserCard('${u.id}')" class="text-[9px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-full hover:bg-primary/20 transition-all flex items-center gap-1">
                                                                    <span class="material-symbols-outlined text-[12px]">badge</span> Voir carte
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td class="px-4 py-4 first:rounded-l-3xl last:rounded-r-3xl text-right align-top">
                                                            <div class="flex items-center justify-end gap-1.5">
                                                                <button onclick="window.editUser('${u.id}')" class="w-8 h-8 rounded-xl bg-white text-primary border border-outline-variant hover:bg-primary/5 flex items-center justify-center transition-all shadow-sm hover:shadow" title="Modifier">
                                                                    <span class="material-symbols-outlined text-[16px]">edit</span>
                                                                </button>
                                                                <button onclick="if(confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) window.appStore.deleteUser('${u.id}')" class="w-8 h-8 rounded-xl bg-white text-error border border-outline-variant hover:bg-error/5 flex items-center justify-center transition-all shadow-sm hover:shadow" title="Supprimer">
                                                                    <span class="material-symbols-outlined text-[16px]">delete</span>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    `;
                                                }).join('')
                                                : '<tr><td colspan="9" class="p-8 text-center text-on-surface-variant"><div class="flex flex-col items-center gap-2 py-6"><span class="material-symbols-outlined text-4xl opacity-50 text-black">school</span><p class="font-bold text-sm">Aucun étudiant inscrit</p></div></td></tr>'
                                            }
                                        </tbody>
                                    </table>
                                </div>

                                <!-- PROFESSOR TABLE WRAPPER -->
                                <div id="professorTableWrapper" class="overflow-x-auto flex-grow hidden">
                                    <table class="student-table w-full text-left text-sm border-separate" style="border-spacing: 0 0.85rem;">
                                        <thead class="bg-surface-container-highest border border-outline-variant text-[10px] uppercase tracking-[0.18em] text-on-surface-variant sticky top-0 z-10 shadow-sm">
                                            <tr>
                                                <th class="px-4 py-4 font-semibold text-black">N°</th>
                                                <th class="px-4 py-4 font-semibold text-black">Nom & Prénom</th>
                                                <th class="px-4 py-4 font-semibold text-black">Matricule</th>
                                                <th class="px-4 py-4 font-semibold text-black">Service</th>
                                                <th class="px-4 py-4 font-semibold text-black">Département</th>
                                                <th class="px-4 py-4 font-semibold text-black">Adresse</th>
                                                <th class="px-4 py-4 font-semibold text-black">Photo</th>
                                                <th class="px-4 py-4 font-semibold text-center text-black">Carte & QR</th>
                                                <th class="px-4 py-4 font-semibold text-right text-black">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${professorsList.length > 0 
                                                ? professorsList.map((u: any, idx: number) => {
                                                    const defaultPhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullname || '')}&background=random`;
                                                    const photo = u.photoUrl || defaultPhoto;
                                                    const historyText = u.registrationHistory && u.registrationHistory.length > 1 
                                                        ? `<div class="text-[9px] text-on-surface-variant font-medium mt-0.5 flex items-center gap-0.5"><span class="material-symbols-outlined text-[10px] text-primary">history</span> Réinscrit</div>`
                                                        : `<div class="text-[9px] text-on-surface-variant font-medium mt-0.5 flex items-center gap-0.5"><span class="material-symbols-outlined text-[10px] text-secondary">new_releases</span> Nouvel inscrit</div>`;

                                                    return `
                                                    <tr class="user-row bg-white shadow-sm hover:bg-surface-container transition-all duration-200" 
                                                        data-name="${u.fullname || ''}" 
                                                        data-role="Professeur" 
                                                        data-faculty="${u.faculty || ''}" 
                                                        data-department="${u.department || ''}" 
                                                        data-matricule="${u.matricule || ''}">
                                                        <td class="px-4 py-4 first:rounded-l-3xl last:rounded-r-3xl font-semibold text-on-surface-variant align-top">${idx + 1}</td>
                                                        <td class="px-4 py-4 first:rounded-l-3xl last:rounded-r-3xl align-top">
                                                            <div>
                                                                <div class="font-bold text-primary flex items-center gap-1">${u.fullname || 'Inconnu'} ${u.isActive ? '<span class="w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm" title="Actif"></span>' : ''}</div>
                                                                <div class="text-[9px] text-on-surface-variant font-mono">@${u.username || 'n/a'}</div>
                                                                ${historyText}
                                                            </div>
                                                        </td>
                                                        <td class="px-4 py-4 first:rounded-l-3xl last:rounded-r-3xl font-mono font-bold text-on-surface align-top">${u.matricule || 'PROF-N/A'}</td>
                                                        <td class="px-4 py-4 first:rounded-l-3xl last:rounded-r-3xl align-top">
                                                            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-secondary/10 text-secondary border border-secondary/20">${u.fonction || 'Enseignant'}</span>
                                                        </td>
                                                        <td class="px-4 py-4 first:rounded-l-3xl last:rounded-r-3xl align-top">
                                                            <div class="space-y-1">
                                                                ${u.faculty ? `<span class="inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${ u.faculty === 'FST' ? 'bg-blue-500/10 text-blue-700' : u.faculty === 'FSAG' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-purple-500/10 text-purple-700' }">${u.faculty}</span>` : ''}
                                                                <div class="font-bold text-on-surface text-[11px]">${u.department || 'Non assigné'}</div>
                                                            </div>
                                                        </td>
                                                        <td class="px-4 py-4 first:rounded-l-3xl last:rounded-r-3xl font-medium text-on-surface-variant max-w-[150px] truncate align-top" title="${u.address || ''}">${u.address || 'Non spécifiée'}</td>
                                                        <td class="px-4 py-4 first:rounded-l-3xl last:rounded-r-3xl align-top">
                                                            <img src="${photo}" class="w-9 h-9 rounded-full object-cover border border-outline-variant shadow-sm hover:scale-110 transition-transform cursor-pointer" />
                                                        </td>
                                                        <td class="px-4 py-4 first:rounded-l-3xl last:rounded-r-3xl text-center align-top">
                                                            <div class="flex flex-col items-center gap-2">
                                                                ${u.qrCodeDataUrl ? `<img src="${u.qrCodeDataUrl}" onclick="window.showUserCard('${u.id}')" class="h-10 w-10 mx-auto rounded border border-outline-variant shadow-sm hover:scale-110 transition-transform cursor-pointer" />` : '<span class="text-[9px] text-on-surface-variant">Non généré</span>'}
                                                                <button onclick="window.showUserCard('${u.id}')" class="text-[9px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-full hover:bg-primary/20 transition-all flex items-center gap-1">
                                                                    <span class="material-symbols-outlined text-[12px]">badge</span> Voir carte
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td class="px-4 py-4 first:rounded-l-3xl last:rounded-r-3xl text-right align-top">
                                                            <div class="flex items-center justify-end gap-1.5">
                                                                <button onclick="window.editUser('${u.id}')" class="w-8 h-8 rounded-xl bg-white text-primary border border-outline-variant hover:bg-primary/5 flex items-center justify-center transition-all shadow-sm hover:shadow" title="Modifier">
                                                                    <span class="material-symbols-outlined text-[16px]">edit</span>
                                                                </button>
                                                                <button onclick="if(confirm('Êtes-vous sûr de vouloir supprimer ce professeur ?')) window.appStore.deleteUser('${u.id}')" class="w-8 h-8 rounded-xl bg-white text-error border border-outline-variant hover:bg-error/5 flex items-center justify-center transition-all shadow-sm hover:shadow" title="Supprimer">
                                                                    <span class="material-symbols-outlined text-[16px]">delete</span>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    `;
                                                }).join('')
                                                : '<tr><td colspan="9" class="p-8 text-center text-on-surface-variant"><div class="flex flex-col items-center gap-2 py-6"><span class="material-symbols-outlined text-4xl opacity-50 text-black">co_present</span><p class="font-bold text-sm">Aucun professeur inscrit</p></div></td></tr>'
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </main>

            <!-- USER CARD MODAL -->
            <div id="userCardModal" class="fixed inset-0 bg-black/60 z-[100] hidden items-center justify-center backdrop-blur-sm p-4">
                <div class="bg-surface-container-lowest rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border border-outline-variant/30 flex flex-col">
                    <!-- Header -->
                    <div class="p-4 border-b border-outline-variant/50 flex justify-between items-center bg-surface">
                        <h3 class="font-black text-sm text-primary flex items-center gap-2"><span class="material-symbols-outlined">badge</span> <span id="modal-title-text">Carte Étudiant</span></h3>
                        <button onclick="window.closeUserCard()" class="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center transition-colors text-on-surface-variant">
                            <span class="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    </div>
                    
                    <!-- Card Preview Area -->
                    <div class="p-6 bg-surface-container-low flex justify-center items-center">
                        <!-- THE ACTUAL CARD -->
                        <div id="user-card-content" class="w-[320px] bg-white rounded-2xl overflow-hidden shadow-xl border border-outline-variant relative">
                            <!-- Card Header (University branding) -->
                            <div id="card-header-bg" class="bg-primary px-4 py-3 flex items-center gap-3">
                                <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 shrink-0">
                                    <img src="/ule-logo.svg" alt="Logo ULE" class="w-full h-full object-contain" onerror="this.src='https://ui-avatars.com/api/?name=ULE&background=ffffff&color=002147'" />
                                </div>
                                <div>
                                    <h4 class="text-white text-[11px] font-black uppercase tracking-widest leading-tight">Université de Labé</h4>
                                    <p id="card-type-title" class="text-white/80 text-[8px] font-bold uppercase tracking-widest mt-0.5">Carte d'Étudiant</p>
                                </div>
                            </div>
                            
                            <!-- Pattern Background -->
                            <div class="absolute inset-0 top-[64px] bg-[radial-gradient(#00214711_1px,transparent_1px)] [background-size:12px_12px] opacity-50 pointer-events-none"></div>
                            
                            <!-- Card Body -->
                            <div class="p-4 relative z-10 flex gap-4">
                                <!-- Photo Area -->
                                <div class="w-24 shrink-0 flex flex-col gap-2">
                                    <div class="w-24 h-28 rounded-lg overflow-hidden border-2 border-primary/20 shadow-sm">
                                        <img id="card-photo" src="" class="w-full h-full object-cover" />
                                    </div>
                                    <div class="bg-surface-container py-1 px-2 rounded border border-outline-variant text-center">
                                        <p class="text-[7px] text-on-surface-variant font-bold uppercase tracking-wider">ID Système</p>
                                        <p id="card-id" class="text-[9px] font-mono font-bold text-on-surface truncate">U1234</p>
                                    </div>
                                </div>
                                
                                <!-- Info Area -->
                                <div class="flex-1 flex flex-col justify-between pt-1">
                                    <div>
                                        <h2 id="card-name" class="text-[14px] font-black text-on-surface leading-tight mb-2 text-primary">Prénom Nom</h2>
                                        
                                        <div class="space-y-1.5">
                                            <div>
                                                <p class="text-[7px] font-bold text-on-surface-variant uppercase tracking-wider">Matricule</p>
                                                <p id="card-matricule" class="text-[10px] font-bold text-on-surface font-mono">MAT-0000</p>
                                            </div>
                                            <div>
                                                <p class="text-[7px] font-bold text-on-surface-variant uppercase tracking-wider">Département</p>
                                                <p id="card-dept" class="text-[10px] font-bold text-on-surface leading-tight">Département d'Informatique</p>
                                            </div>
                                            <div>
                                                <p id="card-label-niveau" class="text-[7px] font-bold text-on-surface-variant uppercase tracking-wider">Niveau d'étude</p>
                                                <p id="card-val-niveau" class="text-[10px] font-bold text-on-surface">Licence 3</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Card Footer (QR & Date) -->
                            <div class="px-4 pb-4 pt-1 flex items-end justify-between relative z-10">
                                <div>
                                    <p class="text-[7px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Délivrée le</p>
                                    <p id="card-date" class="text-[10px] font-bold text-on-surface">01/01/2026</p>
                                </div>
                                <div class="w-16 h-16 bg-white p-1 rounded-lg border-2 border-primary/20 shadow-sm flex items-center justify-center">
                                    <img id="card-qr" src="" class="w-full h-full object-contain" />
                                </div>
                            </div>
                            
                            <!-- Bottom Color Bar -->
                            <div id="card-bottom-bar" class="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-primary"></div>
                        </div>
                    </div>
                    
                    <!-- Actions -->
                    <div class="p-4 bg-surface border-t border-outline-variant/50 flex gap-3">
                        <button onclick="window.closeUserCard()" class="flex-1 py-2.5 rounded-xl border border-outline-variant text-on-surface font-bold text-xs hover:bg-surface-container transition-all">
                            Fermer
                        </button>
                        <button onclick="window.printUserCard()" class="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition-all shadow-md flex items-center justify-center gap-2">
                            <span class="material-symbols-outlined text-[16px]">print</span> Imprimer / PDF
                        </button>
                    </div>
                </div>
            </div>

        </div>
        `;
    },
    books: () => {
        const { books, borrows } = (window as any).appStore || { books: [], borrows: [] };
        
        // Dynamic calculations
        const totalBooks = books.reduce((s, b) => s + (Number(b.quantity) || 1), 0);
        const empruntsActifs = borrows.filter(br => br.status === 'En cours').length;
        const retards = borrows.filter(br => br.status === 'En retard').length;
        
        // Define filters and helper actions globally
        (window as any).openAddBookModal = () => {
            const modal = document.getElementById('bookModal');
            const titleEl = document.getElementById('bookModalTitle');
            const form = document.getElementById('bookForm');
            if (modal && titleEl && form) {
                form.reset();
                document.getElementById('bookFormId').value = '';
                titleEl.textContent = 'Ajouter un nouvel ouvrage';
                modal.classList.remove('hidden');
                setTimeout(() => {
                    modal.classList.add('opacity-100');
                    modal.querySelector('.transform')?.classList.remove('scale-95');
                }, 10);
            }
        };

        (window as any).closeBookModal = () => {
            const modal = document.getElementById('bookModal');
            if (modal) {
                modal.classList.remove('opacity-100');
                modal.querySelector('.transform')?.classList.add('scale-95');
                setTimeout(() => {
                    modal.classList.add('hidden');
                }, 300);
            }
        };

        (window as any).editBook = (id) => {
            const book = books.find(b => b.id === id);
            if (!book) return;
            const modal = document.getElementById('bookModal');
            const titleEl = document.getElementById('bookModalTitle');
            if (modal && titleEl) {
                titleEl.textContent = "Modifier l'ouvrage";
                document.getElementById('bookFormId').value = book.id;
                document.getElementById('bookFormTitle').value = book.title || '';
                document.getElementById('bookFormAuthor').value = book.author || '';
                document.getElementById('bookFormIsbn').value = book.isbn || '';
                document.getElementById('bookFormCote').value = book.cote || '';
                document.getElementById('bookFormCategory').value = book.category || 'Droit';
                document.getElementById('bookFormPublisher').value = book.publisher || '';
                document.getElementById('bookFormPlace').value = book.place || '';
                document.getElementById('bookFormPublishDate').value = book.publishDate || '';
                document.getElementById('bookFormQuantity').value = String(book.quantity || 1);
                
                modal.classList.remove('hidden');
                setTimeout(() => {
                    modal.classList.add('opacity-100');
                    modal.querySelector('.transform')?.classList.remove('scale-95');
                }, 10);
            }
        };

        (window as any).confirmDeleteBook = (id) => {
            if (confirm('Êtes-vous sûr de vouloir supprimer cet ouvrage ?')) {
                (window as any).appStore.deleteBook(id);
            }
        };

        (window as any).saveBook = (e) => {
            e.preventDefault();
            const id = document.getElementById('bookFormId').value;
            const title = document.getElementById('bookFormTitle').value;
            const author = document.getElementById('bookFormAuthor').value;
            const isbn = document.getElementById('bookFormIsbn').value;
            const cote = document.getElementById('bookFormCote').value;
            const category = document.getElementById('bookFormCategory').value;
            const publisher = document.getElementById('bookFormPublisher').value;
            const place = document.getElementById('bookFormPlace').value;
            const publishDate = document.getElementById('bookFormPublishDate').value;
            const quantity = Number(document.getElementById('bookFormQuantity').value) || 1;
            
            const bookData = {
                title,
                author,
                isbn,
                cote,
                category,
                publisher,
                place,
                publishDate,
                quantity,
                status: 'Disponible',
                entryDate: new Date().toISOString().split('T')[0]
            };

            if (id) {
                // Update existing
                const idx = books.findIndex(b => b.id === id);
                if (idx !== -1) {
                    const existingBook = books[idx];
                    books[idx] = { ...existingBook, ...bookData };
                    (window as any).appStore.save();
                    (window as any).appStore.showToast('Ouvrage mis à jour avec succès');
                    (window as any).navigate('books');
                }
            } else {
                // Add new
                (window as any).appStore.addBook(bookData);
            }
            (window as any).closeBookModal();
        };

        (window as any).filterBooks = () => {
            const query = document.getElementById('bookSearchInput')?.value.toLowerCase() || '';
            const cat = document.getElementById('bookCategoryFilter')?.value || '';
            const rows = document.querySelectorAll('.book-row');
            rows.forEach(row => {
                const title = row.getAttribute('data-title').toLowerCase();
                const author = row.getAttribute('data-author').toLowerCase();
                const isbn = row.getAttribute('data-isbn').toLowerCase();
                const cote = row.getAttribute('data-cote').toLowerCase();
                const category = row.getAttribute('data-category');
                
                const matchesQuery = !query || title.includes(query) || author.includes(query) || isbn.includes(query) || cote.includes(query);
                const matchesCat = !cat || category === cat;
                
                if (matchesQuery && matchesCat) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        };

        return `
        <div class="flex min-h-screen">
            ${getSidebar('books', window.authUI?.currentRole || 'admin')}
            <main class="flex-grow ml-[260px]">
                ${getTopBar(window.authUI?.currentRole || 'admin')}
                <div class="p-6 space-y-6">
                    <!-- Title & Add Button -->
                    <div class="flex justify-between items-center">
                        <div>
                            <h2 class="text-lg font-bold text-primary text-black">Catalogage des Ouvrages</h2>
                            <p class="text-xs text-on-surface-variant">Gérez le catalogue des livres, de la classification à la disponibilité.</p>
                        </div>
                        <button onclick="window.openAddBookModal()" class="bg-primary text-on-primary hover:bg-primary-hover px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all duration-300 shadow-md">
                             <span class="material-symbols-outlined text-sm">add</span> Ajouter un ouvrage
                        </button>
                    </div>

                    <!-- Statistics Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="bg-white p-5 border border-outline-variant rounded-[1.25rem] flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:border-primary/30 animate-fade-in">
                            <div class="p-3 bg-secondary-container rounded-2xl text-on-secondary-container">
                                <span class="material-symbols-outlined text-2xl">library_books</span>
                            </div>
                            <div>
                                <p class="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Total Ouvrages</p>
                                <p class="text-2xl font-black text-primary">${totalBooks}</p>
                            </div>
                        </div>
                        <div class="bg-white p-5 border border-outline-variant rounded-[1.25rem] flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:border-primary/30 animate-fade-in">
                            <div class="p-3 bg-tertiary-fixed rounded-2xl text-on-tertiary-fixed">
                                <span class="material-symbols-outlined text-2xl">assignment_return</span>
                            </div>
                            <div>
                                <p class="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Emprunts en cours</p>
                                <p class="text-2xl font-black text-primary">${empruntsActifs}</p>
                            </div>
                        </div>
                        <div class="bg-white p-5 border border-outline-variant rounded-[1.25rem] flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:border-primary/30 animate-fade-in">
                            <div class="p-3 bg-error-container rounded-2xl text-error">
                                <span class="material-symbols-outlined text-2xl">report_problem</span>
                            </div>
                            <div>
                                <p class="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Retards signalés</p>
                                <p class="text-2xl font-black text-error">${retards}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Filters and Search -->
                    <div class="bg-surface-container-low border border-outline-variant rounded-[1.25rem] p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
                        <div class="flex items-center gap-2 w-full md:w-auto bg-white border border-outline-variant rounded-xl px-3 py-1.5 focus-within:ring-1 focus-within:ring-primary transition-all">
                            <span class="material-symbols-outlined text-on-surface-variant text-base">search</span>
                            <input type="text" id="bookSearchInput" oninput="window.filterBooks()" placeholder="Rechercher par titre, auteur, ISBN, cote..." class="w-full md:w-80 bg-transparent text-xs outline-none border-none p-0" />
                        </div>
                        <div class="flex items-center gap-3 w-full md:w-auto justify-end">
                            <span class="text-xs font-semibold text-on-surface-variant">Catégorie :</span>
                            <select id="bookCategoryFilter" onchange="window.filterBooks()" class="bg-white border border-outline-variant rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary transition-all duration-300">
                                <option value="">Toutes les catégories</option>
                                <option value="Droit">Droit</option>
                                <option value="Économie">Économie</option>
                                <option value="Sciences">Sciences</option>
                                <option value="Médecine">Médecine</option>
                                <option value="Lettres">Lettres</option>
                            </select>
                        </div>
                    </div>

                    <!-- Books Table -->
                    <div class="bg-white border border-outline-variant rounded-[1.25rem] overflow-hidden shadow-sm">
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                 <thead class="bg-surface-container-low border-b border-outline-variant">
                                    <tr class="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">
                                        <th class="px-4 py-4">Date d'Ajout</th>
                                        <th class="px-4 py-4">Cote</th>
                                        <th class="px-4 py-4">Titre</th>
                                        <th class="px-4 py-4">Auteur</th>
                                        <th class="px-4 py-4">Catégorie</th>
                                        <th class="px-4 py-4">Editeur</th>
                                        <th class="px-4 py-4">Lieu</th>
                                        <th class="px-4 py-4">Date d'édition</th>
                                        <th class="px-4 py-4 text-center">Qté</th>
                                        <th class="px-4 py-4">ISBN/ISSN</th>
                                        <th class="px-4 py-4">Statut</th>
                                        <th class="px-4 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="text-sm divide-y divide-outline-variant">
                                    ${books.length > 0
                                        ? books.map(b => `
                                            <tr class="book-row hover:bg-surface-container transition-colors"
                                                data-id="${b.id}"
                                                data-title="${b.title || ''}"
                                                data-author="${b.author || ''}"
                                                data-isbn="${b.isbn || ''}"
                                                data-cote="${b.cote || ''}"
                                                data-category="${b.category || ''}">
                                                <td class="px-4 py-4 text-xs font-semibold text-on-surface-variant">${b.entryDate || 'N/A'}</td>
                                                <td class="px-4 py-4 text-xs font-mono font-semibold">${b.cote || 'N/A'}</td>
                                                <td class="px-4 py-4 font-bold text-primary">${b.title || 'N/A'}</td>
                                                <td class="px-4 py-4 text-xs font-semibold text-on-surface">${b.author || 'N/A'}</td>
                                                <td class="px-4 py-4 text-xs">${b.category || 'N/A'}</td>
                                                <td class="px-4 py-4 text-xs">${b.publisher || 'N/A'}</td>
                                                <td class="px-4 py-4 text-xs">${b.place || 'N/A'}</td>
                                                <td class="px-4 py-4 text-xs">${b.publishDate || 'N/A'}</td>
                                                <td class="px-4 py-4 text-xs text-center font-bold">${b.quantity || 1}</td>
                                                <td class="px-4 py-4 text-xs font-mono">${b.isbn || 'N/A'}</td>
                                                <td class="px-4 py-4">
                                                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                        b.status === 'Disponible' ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'
                                                    }">${b.status}</span>
                                                </td>
                                                <td class="px-4 py-4 text-right">
                                                    <div class="flex justify-end gap-2 text-on-surface-variant">
                                                        <button onclick="window.editBook('${b.id}')" class="text-primary hover:opacity-85 transition-opacity material-symbols-outlined text-lg">edit</button>
                                                        <button onclick="window.confirmDeleteBook('${b.id}')" class="text-error hover:opacity-85 transition-opacity material-symbols-outlined text-lg">delete</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        `).join('')
                                        : `<tr>
                                            <td colspan="12" class="p-8 text-center text-on-surface-variant">
                                                <div class="flex flex-col items-center gap-2 py-6">
                                                    <span class="material-symbols-outlined text-5xl opacity-40 text-black">library_books</span>
                                                    <p class="font-semibold text-sm">Aucun ouvrage dans le catalogue</p>
                                                    <p class="text-xs text-on-surface-variant/70">Cliquez sur "Ajouter un ouvrage" pour commencer.</p>
                                                </div>
                                            </td>
                                           </tr>`
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Modern Modal Dialog for Adding/Editing Books -->
                <div id="bookModal" class="fixed inset-0 bg-black/55 backdrop-blur-sm z-[9999] flex items-center justify-center hidden opacity-0 transition-all duration-300">
                    <div class="bg-white rounded-[2rem] shadow-2xl border border-outline-variant w-full max-w-lg overflow-hidden transform scale-95 transition-all duration-300">
                        <!-- Modal Header -->
                        <div class="bg-gradient-to-r from-primary to-primary-hover p-6 text-on-primary flex justify-between items-center">
                            <div>
                                <h3 id="bookModalTitle" class="font-black text-base text-white">Ajouter un nouvel ouvrage</h3>
                                <p class="text-[10px] text-white/70">Remplissez les détails ci-dessous pour cataloguer le livre.</p>
                            </div>
                            <button onclick="window.closeBookModal()" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-colors">
                                <span class="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>
                        
                        <!-- Modal Body & Form -->
                        <form id="bookForm" onsubmit="window.saveBook(event)" class="p-6 space-y-4">
                            <input type="hidden" id="bookFormId" />
                            <div class="grid grid-cols-2 gap-4">
                                <div class="col-span-2">
                                    <label class="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Titre de l'ouvrage *</label>
                                    <input type="text" id="bookFormTitle" required class="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary transition-all duration-300" placeholder="Ex: Constitution de la Guinée" />
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Auteur *</label>
                                    <input type="text" id="bookFormAuthor" required class="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary transition-all duration-300" placeholder="Ex: Archives Nationales" />
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Numéro ISBN *</label>
                                    <input type="text" id="bookFormIsbn" required class="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary transition-all duration-300" placeholder="Ex: 978-2-342" />
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Cote de classification *</label>
                                    <input type="text" id="bookFormCote" required class="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary transition-all duration-300" placeholder="Ex: DC-2026-01" />
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Catégorie *</label>
                                    <select id="bookFormCategory" required class="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary transition-all duration-300">
                                        <option value="Droit">Droit</option>
                                        <option value="Économie">Économie</option>
                                        <option value="Sciences">Sciences</option>
                                        <option value="Médecine">Médecine</option>
                                        <option value="Lettres">Lettres</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Maison d'édition</label>
                                    <input type="text" id="bookFormPublisher" class="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary transition-all duration-300" placeholder="Ex: Dalloz" />
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Lieu de publication</label>
                                    <input type="text" id="bookFormPlace" class="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary transition-all duration-300" placeholder="Ex: Paris" />
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Année de publication</label>
                                    <input type="text" id="bookFormPublishDate" class="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary transition-all duration-300" placeholder="Ex: 2020" />
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Quantité en stock *</label>
                                    <input type="number" id="bookFormQuantity" required min="1" value="1" class="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary transition-all duration-300" />
                                </div>
                            </div>
                            
                            <!-- Action Buttons -->
                            <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                                <button type="button" onclick="window.closeBookModal()" class="bg-surface-container-highest text-on-surface hover:opacity-90 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300">Annuler</button>
                                <button type="submit" class="bg-primary text-on-primary hover:bg-primary-hover px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-md">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
        `;
    },
    attendance: () => {
        const { books, users, borrows } = (window as any).appStore || { books: [], users: [], borrows: [] };

        if (!(window as any).initAttendanceUI) {
            (window as any).activeBorrowFilter = 'all';

            (window as any).handleBookSearchBorrow = () => {
                const searchInput = document.getElementById('searchBookBorrow') as HTMLInputElement;
                const search = searchInput.value.toLowerCase().trim();
                const dropdown = document.getElementById('bookBorrowDropdown')!;
                const hiddenInput = document.getElementById('bookIdInput') as HTMLInputElement;
                
                hiddenInput.value = ''; // Reset selection
                
                if (search.length < 2) {
                    dropdown.classList.add('hidden');
                    return;
                }
                
                const availableBooks = books.filter((b: any) => 
                    b.status === 'Disponible' && (
                        (b.title && b.title.toLowerCase().includes(search)) ||
                        (b.isbn && b.isbn.toLowerCase().includes(search)) ||
                        (b.cote && b.cote.toLowerCase().includes(search))
                    )
                );
                
                if (availableBooks.length > 0) {
                    dropdown.innerHTML = availableBooks.map((b: any) => `
                        <div onclick="window.selectBookForBorrow('${b.id}', '${b.title.replace(/'/g, "\\'")}', '${b.cote || ''}')" class="flex items-center justify-between p-3 hover:bg-surface-container cursor-pointer border-b border-outline-variant/30 last:border-0">
                            <div>
                                <div class="text-xs font-bold text-primary">${b.title}</div>
                                <div class="text-[10px] text-on-surface-variant font-mono">${b.cote || 'Sans Cote'} - ${b.author || 'Auteur inconnu'}</div>
                            </div>
                            <span class="text-[9px] bg-green-100 text-green-800 px-2 py-0.5 rounded font-black uppercase">Disponible</span>
                        </div>
                    `).join('');
                    dropdown.classList.remove('hidden');
                } else {
                    dropdown.innerHTML = '<div class="p-3 text-xs text-on-surface-variant text-center"><span class="material-symbols-outlined text-[16px] align-middle">error</span> Aucun livre disponible trouvé</div>';
                    dropdown.classList.remove('hidden');
                }
            };

            (window as any).selectBookForBorrow = (id: string, title: string, cote: string) => {
                (document.getElementById('bookIdInput') as HTMLInputElement).value = id;
                (document.getElementById('searchBookBorrow') as HTMLInputElement).value = `${title} (${cote})`;
                document.getElementById('bookBorrowDropdown')!.classList.add('hidden');
            };

            (window as any).handleUserSearchBorrow = () => {
                const searchInput = document.getElementById('searchUserBorrow') as HTMLInputElement;
                const search = searchInput.value.toLowerCase().trim();
                const dropdown = document.getElementById('userBorrowDropdown')!;
                const hiddenInput = document.getElementById('userIdInput') as HTMLInputElement;
                
                hiddenInput.value = ''; // Reset selection
                
                if (search.length < 2) {
                    dropdown.classList.add('hidden');
                    return;
                }
                
                const activeUsers = users.filter((u: any) => 
                    u.isActive !== false && (
                        (u.fullname && u.fullname.toLowerCase().includes(search)) ||
                        (u.matricule && u.matricule.toLowerCase().includes(search)) ||
                        (u.username && u.username.toLowerCase().includes(search))
                    )
                );
                
                if (activeUsers.length > 0) {
                    dropdown.innerHTML = activeUsers.map((u: any) => {
                        const defaultPhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullname || '')}&background=random`;
                        return `
                            <div onclick="window.selectUserForBorrow('${u.id}', '${u.fullname.replace(/'/g, "\\'")}', '${u.matricule || u.role || ''}')" class="flex items-center gap-3 p-3 hover:bg-surface-container cursor-pointer border-b border-outline-variant/30 last:border-0">
                                <img src="${u.photoUrl || defaultPhoto}" class="w-8 h-8 rounded-full object-cover" />
                                <div>
                                    <div class="text-xs font-bold text-on-surface">${u.fullname} <span class="text-[10px] text-on-surface-variant font-mono">(@${u.username})</span></div>
                                    <div class="text-[9px] text-primary font-bold uppercase tracking-wider">${u.role} - ${u.matricule || 'Sans matricule'}</div>
                                </div>
                            </div>
                        `;
                    }).join('');
                    dropdown.classList.remove('hidden');
                } else {
                    dropdown.innerHTML = '<div class="p-3 text-xs text-on-surface-variant text-center"><span class="material-symbols-outlined text-[16px] align-middle">error</span> Aucun utilisateur actif trouvé</div>';
                    dropdown.classList.remove('hidden');
                }
            };

            (window as any).selectUserForBorrow = (id: string, fullname: string, identifier: string) => {
                (document.getElementById('userIdInput') as HTMLInputElement).value = id;
                (document.getElementById('searchUserBorrow') as HTMLInputElement).value = `${fullname} (${identifier})`;
                document.getElementById('userBorrowDropdown')!.classList.add('hidden');
            };

            // Hide dropdowns when clicking outside
            document.addEventListener('click', (e) => {
                const bookDropdown = document.getElementById('bookBorrowDropdown');
                const userDropdown = document.getElementById('userBorrowDropdown');
                const bookInput = document.getElementById('searchBookBorrow');
                const userInput = document.getElementById('searchUserBorrow');
                
                if (bookDropdown && !bookDropdown.contains(e.target as Node) && e.target !== bookInput) {
                    bookDropdown.classList.add('hidden');
                }
                if (userDropdown && !userDropdown.contains(e.target as Node) && e.target !== userInput) {
                    userDropdown.classList.add('hidden');
                }
            });

            (window as any).submitBorrowForm = (e: Event) => {
                e.preventDefault();
                const bookId = (document.getElementById('bookIdInput') as HTMLInputElement).value;
                const userId = (document.getElementById('userIdInput') as HTMLInputElement).value;
                const expectedDateStr = (document.getElementById('expectedDateInput') as HTMLInputElement).value;
                const caution = (document.getElementById('cautionInput') as HTMLInputElement).value;
                
                if (!bookId || !userId) {
                    alert('Veuillez sélectionner un ouvrage et un emprunteur valides.');
                    return;
                }
                
                if (!expectedDateStr) {
                    alert('Veuillez sélectionner une date de retour prévue.');
                    return;
                }
                
                // Calculate days from today
                const today = new Date();
                today.setHours(0,0,0,0);
                const expectedDate = new Date(expectedDateStr);
                expectedDate.setHours(0,0,0,0);
                
                const timeDiff = expectedDate.getTime() - today.getTime();
                const days = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));
                
                (window as any).appStore.addBorrow(bookId, userId, days, caution);
                
                // Reset form
                (document.getElementById('borrowForm') as HTMLFormElement).reset();
                (document.getElementById('bookIdInput') as HTMLInputElement).value = '';
                (document.getElementById('userIdInput') as HTMLInputElement).value = '';
            };

            (window as any).switchBorrowFilter = (filter: string) => {
                (window as any).activeBorrowFilter = filter;
                const pills = document.querySelectorAll('.borrow-filter-pill');
                pills.forEach(pill => {
                    if (pill.getAttribute('data-filter') === filter) {
                        pill.className = 'borrow-filter-pill px-3 py-1.5 rounded-full text-xs font-black uppercase bg-primary text-white shadow-sm';
                    } else {
                        pill.className = 'borrow-filter-pill px-3 py-1.5 rounded-full text-xs font-bold uppercase bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-colors';
                    }
                });
                (window as any).filterBorrows();
            };

            (window as any).filterBorrows = () => {
                const search = (document.getElementById('searchBorrowInput') as HTMLInputElement).value.toLowerCase();
                const filter = (window as any).activeBorrowFilter || 'all';
                const rows = document.querySelectorAll('.borrow-row');
                
                rows.forEach((row: any) => {
                    const rowUser = row.getAttribute('data-user').toLowerCase();
                    const rowBook = row.getAttribute('data-book').toLowerCase();
                    const rowStatus = row.getAttribute('data-status');
                    
                    const matchSearch = rowUser.includes(search) || rowBook.includes(search);
                    
                    let matchFilter = true;
                    if (filter === 'ongoing') matchFilter = (rowStatus === 'En cours' || rowStatus === 'En retard');
                    else if (filter === 'overdue') matchFilter = (rowStatus === 'En retard');
                    else if (filter === 'returned') matchFilter = (rowStatus === 'Retourné');
                    
                    if (matchSearch && matchFilter) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });
            };

            (window as any).initAttendanceUI = true;
        }

        const formattedBorrows = borrows.map((br: any) => {
            const book = books.find((b: any) => b.id === br.bookId) || { title: 'Livre inconnu', cote: 'N/A', author: 'N/A' };
            const user = users.find((u: any) => u.id === br.userId) || { fullname: 'Utilisateur inconnu', matricule: 'N/A', role: 'N/A', photoUrl: '' };
            
            // Auto calculate overdue status
            let currentStatus = br.status;
            if (br.status === 'En cours' && new Date(br.expectedReturnDate) < new Date()) {
                currentStatus = 'En retard';
            }
            
            return {
                ...br,
                book,
                user,
                currentStatus
            };
        });

        // Set default minimum date to today
        const todayString = new Date().toISOString().split('T')[0];

        return `
        <div class="flex min-h-screen bg-surface-container-lowest">
            ${getSidebar('attendance')}
            <main class="flex-grow ml-[260px]">
                ${getTopBar(window.authUI?.currentRole || 'admin')}
                
                <div class="p-6">
                    <!-- Header -->
                    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                        <div>
                            <h2 class="text-2xl font-black text-primary tracking-tight text-black">Gestion des Emprunts & Retours</h2>
                            <p class="text-xs text-on-surface-variant mt-1">Enregistrez de nouveaux emprunts, suivez les retours et gérez les litiges.</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="window.appStore.exportPDF('borrows')" class="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container transition-all shadow-sm">
                                <span class="material-symbols-outlined text-[16px]">picture_as_pdf</span> Exporter PDF
                            </button>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        <!-- LEFT COLUMN: NEW BORROW FORM -->
                        <div class="lg:col-span-4">
                            <div class="bg-white border border-outline-variant rounded-3xl shadow-sm overflow-hidden sticky top-24">
                                <div class="p-5 border-b border-outline-variant bg-surface-container-low flex items-center gap-2">
                                    <span class="material-symbols-outlined text-primary">add_circle</span>
                                    <h3 class="font-black text-sm text-black">Nouvel Emprunt</h3>
                                </div>
                                
                                <div class="p-5">
                                    <form id="borrowForm" onsubmit="window.submitBorrowForm(event)" class="space-y-4">
                                        
                                        <!-- BOOK SELECTION WITH AUTOCOMPLETE -->
                                        <div class="relative">
                                            <label class="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Sélectionner l'Ouvrage *</label>
                                            <div class="relative">
                                                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">search</span>
                                                <input type="text" id="searchBookBorrow" required onkeyup="window.handleBookSearchBorrow()" placeholder="Rechercher par titre, ISBN, cote..." class="w-full border border-outline-variant rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none focus:ring-1 focus:ring-primary transition-all bg-surface-container-lowest" />
                                                <input type="hidden" id="bookIdInput" />
                                            </div>
                                            <!-- Dropdown -->
                                            <div id="bookBorrowDropdown" class="absolute z-50 left-0 right-0 mt-1 bg-white border border-outline-variant rounded-xl shadow-xl max-h-48 overflow-y-auto hidden">
                                            </div>
                                        </div>

                                        <!-- USER SELECTION WITH AUTOCOMPLETE -->
                                        <div class="relative">
                                            <label class="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Sélectionner l'Emprunteur *</label>
                                            <div class="relative">
                                                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">person</span>
                                                <input type="text" id="searchUserBorrow" required onkeyup="window.handleUserSearchBorrow()" placeholder="Rechercher par nom, matricule..." class="w-full border border-outline-variant rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none focus:ring-1 focus:ring-primary transition-all bg-surface-container-lowest" />
                                                <input type="hidden" id="userIdInput" />
                                            </div>
                                            <!-- Dropdown -->
                                            <div id="userBorrowDropdown" class="absolute z-50 left-0 right-0 mt-1 bg-white border border-outline-variant rounded-xl shadow-xl max-h-48 overflow-y-auto hidden">
                                            </div>
                                        </div>

                                        <!-- RETURN DATE -->
                                        <div>
                                            <label class="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Date de Retour Prévue *</label>
                                            <input type="date" id="expectedDateInput" required min="${todayString}" class="w-full border border-outline-variant rounded-xl px-3 py-2.5 text-xs outline-none focus:ring-1 focus:ring-primary transition-all bg-surface-container-lowest font-mono" />
                                        </div>

                                        <!-- CAUTION / SECURITY DEPOSIT -->
                                        <div>
                                            <label class="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Dépôt de Garantie (Caution) *</label>
                                            <input type="text" id="cautionInput" required placeholder="Ex: Carte d'étudiant, CNI, 20 000 FG" class="w-full border border-outline-variant rounded-xl px-3 py-2.5 text-xs outline-none focus:ring-1 focus:ring-primary transition-all bg-surface-container-lowest" />
                                        </div>
                                        
                                        <button type="submit" class="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-xs shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all mt-4 flex justify-center items-center gap-2">
                                            <span class="material-symbols-outlined text-[18px]">assignment_return</span> Enregistrer l'Emprunt
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                        
                        <!-- RIGHT COLUMN: BORROW JOURNAL -->
                        <div class="lg:col-span-8 flex flex-col">
                            <div class="bg-white border border-outline-variant rounded-3xl shadow-sm flex-grow flex flex-col overflow-hidden">
                                
                                <!-- Toolbar -->
                                <div class="p-4 border-b border-outline-variant bg-surface-container-lowest flex flex-col sm:flex-row gap-4 justify-between items-center">
                                    <div class="flex items-center gap-2 w-full sm:w-auto">
                                        <div class="relative flex-grow sm:w-64 bg-white border border-outline-variant rounded-xl px-3 py-1.5 focus-within:ring-1 focus-within:ring-primary transition-all flex items-center gap-2">
                                            <span class="material-symbols-outlined text-on-surface-variant text-base">search</span>
                                            <input type="text" id="searchBorrowInput" onkeyup="window.filterBorrows()" placeholder="Rechercher par emprunteur ou livre..." class="w-full bg-transparent text-xs outline-none border-none p-0" />
                                        </div>
                                    </div>
                                    
                                    <!-- Dynamic Filter Pills -->
                                    <div class="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                                        <button onclick="window.switchBorrowFilter('all')" data-filter="all" class="borrow-filter-pill px-3 py-1.5 rounded-full text-xs font-black uppercase bg-primary text-white shadow-sm">
                                            Tous
                                        </button>
                                        <button onclick="window.switchBorrowFilter('ongoing')" data-filter="ongoing" class="borrow-filter-pill px-3 py-1.5 rounded-full text-xs font-bold uppercase bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-colors">
                                            En cours
                                        </button>
                                        <button onclick="window.switchBorrowFilter('overdue')" data-filter="overdue" class="borrow-filter-pill px-3 py-1.5 rounded-full text-xs font-bold uppercase bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-colors">
                                            En retard
                                        </button>
                                        <button onclick="window.switchBorrowFilter('returned')" data-filter="returned" class="borrow-filter-pill px-3 py-1.5 rounded-full text-xs font-bold uppercase bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-colors">
                                            Retournés
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="overflow-x-auto flex-grow">
                                    <table class="w-full text-left text-xs border-collapse">
                                        <thead class="bg-surface-container-low border-b border-outline-variant text-[10px] uppercase tracking-wider text-on-surface-variant sticky top-0 z-10 shadow-sm">
                                            <tr>
                                                <th class="px-4 py-4 font-bold text-black">N°</th>
                                                <th class="px-4 py-4 font-bold text-black">Emprunteur</th>
                                                <th class="px-4 py-4 font-bold text-black">Numero de telephone</th>
                                                <th class="px-4 py-4 font-bold text-black">Departement</th>
                                                <th class="px-4 py-4 font-bold text-black">Ouvrage Emprunté</th>
                                                <th class="px-4 py-4 font-bold text-black">Auteur(s)</th>
                                                <th class="px-4 py-4 font-bold text-black">Date Emprunt</th>
                                                <th class="px-4 py-4 font-bold text-black">Retour Prévu</th>
                                                <th class="px-4 py-4 font-bold text-black">Retour Réel</th>
                                                <th class="px-4 py-4 font-bold text-black">Caution</th>
                                                <th class="px-4 py-4 font-bold text-center text-black">Statut</th>
                                                <th class="px-4 py-4 font-bold text-right text-black">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-outline-variant">
                                            ${formattedBorrows.length > 0 
                                                ? formattedBorrows.map((br: any, idx: number) => {
                                                    const defaultPhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(br.user.fullname || '')}&background=random`;
                                                    const photo = br.user.photoUrl || defaultPhoto;

                                                    let badgeClass = 'bg-primary/10 text-primary border border-primary/20';
                                                    if (br.currentStatus === 'Retourné') {
                                                        badgeClass = 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20';
                                                    } else if (br.currentStatus === 'En retard') {
                                                        badgeClass = 'bg-error-container text-error border border-error/20 font-black animate-pulse';
                                                    }

                                                    return `
                                                    <tr class="borrow-row hover:bg-surface-container transition-colors border-b border-outline-variant/30" 
                                                        data-user="${br.user.fullname || ''}" 
                                                        data-book="${br.book.title || ''}" 
                                                        data-status="${br.currentStatus}">
                                                        <td class="px-4 py-3 font-semibold text-on-surface-variant">${idx + 1}</td>
                                                        <td class="px-4 py-3">
                                                            <div class="flex items-center gap-2.5">
                                                                <img src="${photo}" class="w-8 h-8 rounded-full object-cover border border-outline-variant shadow-inner" />
                                                                <div>
                                                                    <div class="font-bold text-on-surface">${br.user.fullname || 'Inconnu'}</div>
                                                                    <div class="text-[9px] text-on-surface-variant font-mono uppercase tracking-wider">${br.user.role || 'Étudiant'} ${br.user.matricule ? ' - ' + br.user.matricule : ''}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td class="px-4 py-3 font-medium text-on-surface-variant">${br.user.telephone || 'Aucun'}</td>
                                                        <td class="px-4 py-3 font-bold text-on-surface">${br.user.department || 'Général'}</td>
                                                        <td class="px-4 py-3">
                                                            <div>
                                                                <div class="font-bold text-primary">${br.book.title || 'Titre inconnu'}</div>
                                                                <div class="text-[9px] text-on-surface-variant font-mono">${br.book.cote || 'N/A'}</div>
                                                            </div>
                                                        </td>
                                                        <td class="px-4 py-3 font-medium text-on-surface-variant">${br.book.author || 'Inconnu'}</td>
                                                        <td class="px-4 py-3 font-medium text-on-surface-variant font-mono">${new Date(br.borrowDate).toLocaleDateString('fr-FR')}</td>
                                                        <td class="px-4 py-3 font-semibold text-on-surface font-mono">${new Date(br.expectedReturnDate).toLocaleDateString('fr-FR')}</td>
                                                        <td class="px-4 py-3 font-medium text-on-surface-variant font-mono">${br.actualReturnDate ? new Date(br.actualReturnDate).toLocaleDateString('fr-FR') : '—'}</td>
                                                        <td class="px-4 py-3 font-medium text-on-surface font-mono max-w-[100px] truncate" title="${br.caution || ''}">${br.caution || 'Aucune'}</td>
                                                        <td class="px-4 py-3 text-center">
                                                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${badgeClass}">${br.currentStatus}</span>
                                                        </td>
                                                        <td class="px-4 py-3 text-right">
                                                            ${br.currentStatus === 'En cours' || br.currentStatus === 'En retard'
                                                                ? `<button onclick="window.appStore.returnBorrow('${br.id}')" class="px-3 py-1.5 rounded-xl bg-white border border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10 text-[10px] font-bold shadow-sm flex items-center gap-1 ml-auto transition-all" title="Marquer comme retourné">
                                                                    <span class="material-symbols-outlined text-xs">assignment_turned_in</span> Retourner
                                                                   </button>`
                                                                : `<span class="text-emerald-600 font-bold flex items-center justify-end gap-0.5"><span class="material-symbols-outlined text-sm">check_circle</span> Terminé</span>`
                                                            }
                                                        </td>
                                                    </tr>
                                                    `;
                                                }).join('')
                                                : '<tr><td colspan="12" class="p-8 text-center text-on-surface-variant"><div class="flex flex-col items-center gap-2 py-6"><span class="material-symbols-outlined text-4xl opacity-50 text-black">assignment_return</span><p class="font-bold text-sm">Aucun emprunt dans le journal</p></div></td></tr>'
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </main>
        </div>
        `;
    },
    presences: () => {
        const { attendances, users } = (window as any).appStore;

        // Ensure global functions exist outside so they refresh on HMR
        (window as any).filterAttendances = () => {
            const search = (document.getElementById('searchAttendance') as HTMLInputElement).value.toLowerCase();
            const roleFilter = (document.getElementById('filterRoleAttendance') as HTMLSelectElement).value;
            const statusFilter = (document.getElementById('filterStatusAttendance') as HTMLSelectElement).value;
            const dateFilter = (document.getElementById('filterDateAttendance') as HTMLInputElement).value;
            
            const rows = document.querySelectorAll('.attendance-row');
            rows.forEach((row: any) => {
                const name = row.getAttribute('data-name').toLowerCase();
                const role = row.getAttribute('data-role');
                const status = row.getAttribute('data-status');
                const date = row.getAttribute('data-date');
                
                const matchSearch = name.includes(search);
                const matchRole = roleFilter === 'all' || role === roleFilter;
                const matchStatus = statusFilter === 'all' || status === statusFilter;
                const matchDate = !dateFilter || date === dateFilter;
                
                if (matchSearch && matchRole && matchStatus && matchDate) {
                    row.classList.remove('hidden');
                } else {
                    row.classList.add('hidden');
                }
            });
        };

        (window as any).addManualAttendance = (e: Event) => {
            e.preventDefault();
            const fd = new FormData(e.target as HTMLFormElement);
            const userId = fd.get('userId') as string;
            if (userId) {
                (window as any).appStore.recordAttendance(userId);
            }
        };

        (window as any).deleteAttendance = (id: string) => {
            if (confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement ?')) {
                (window as any).appStore.attendances = (window as any).appStore.attendances.filter((a: any) => a.id !== id);
                (window as any).appStore.save();
                (window as any).navigate('presences');
            }
        };

        (window as any).editAttendance = (id: string) => {
            const a = (window as any).appStore.attendances.find((x:any) => x.id === id);
            if (a) {
                (document.getElementById('editAttId') as HTMLInputElement).value = a.id;
                
                const formatForInput = (isoString: string) => {
                    if (!isoString) return '';
                    const d = new Date(isoString);
                    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                    return d.toISOString().slice(0, 16);
                };
                
                (document.getElementById('editAttTimeIn') as HTMLInputElement).value = formatForInput(a.timeIn);
                (document.getElementById('editAttTimeOut') as HTMLInputElement).value = formatForInput(a.timeOut);
                (document.getElementById('editAttStatus') as HTMLSelectElement).value = a.status;
                
                document.getElementById('attendanceModal')!.classList.remove('hidden');
            }
        };

        (window as any).saveAttendanceEdit = (e: Event) => {
            e.preventDefault();
            const fd = new FormData(e.target as HTMLFormElement);
            const id = fd.get('id') as string;
            const a = (window as any).appStore.attendances.find((x:any) => x.id === id);
            if (a) {
                const tIn = fd.get('timeIn') as string;
                if (tIn) a.timeIn = new Date(tIn).toISOString();
                
                const tOut = fd.get('timeOut') as string;
                if (tOut) {
                    a.timeOut = new Date(tOut).toISOString();
                } else {
                    a.timeOut = undefined;
                }
                
                a.status = fd.get('status') as string;
                
                (window as any).appStore.save();
                document.getElementById('attendanceModal')!.classList.add('hidden');
                (window as any).navigate('presences');
            }
        };

        // Compute Statistics
        const todayStr = new Date().toISOString().split('T')[0];
        const todaysAttendances = attendances.filter((a: any) => a.timeIn.startsWith(todayStr));
        
        const totalPresent = attendances.filter((a:any) => a.status === 'Présent').length;
        const studentsPresent = attendances.filter((a:any) => a.status === 'Présent' && users.find((u:any) => u.id === a.userId)?.role === 'Étudiant').length;
        const profsPresent = attendances.filter((a:any) => a.status === 'Présent' && users.find((u:any) => u.id === a.userId)?.role === 'Professeur').length;
        
        const activeUsersToday = todaysAttendances.length;
        const freqRate = users.length > 0 ? Math.round((activeUsersToday / users.length) * 100) : 0;

        // Render function
        const renderAttRow = (a: any, idx: number) => {
            const u = users.find((x:any) => x.id === a.userId);
            if (!u) return '';
            
            const timeInDate = new Date(a.timeIn);
            const timeOutStr = a.timeOut ? new Date(a.timeOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--';
            const timeInStr = timeInDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            const dateStr = timeInDate.toLocaleDateString();
            const dateYMD = timeInDate.toISOString().split('T')[0];
            const isRetard = (typeof a.isRetard !== 'undefined') ? a.isRetard : (() => {
                const t = timeInDate;
                const morningThreshold = new Date(t);
                morningThreshold.setHours(9, 30, 0, 0);
                const afternoonThreshold = new Date(t);
                afternoonThreshold.setHours(14, 30, 0, 0);
                const isMorning = t.getHours() < 12;
                return isMorning ? t >= morningThreshold : t >= afternoonThreshold;
            })();
        
            let statusBadge = '';
            if (a.status === 'Présent') {
                if (isRetard) {
                    statusBadge = '<span class="px-2 py-1 bg-orange-500/10 text-orange-600 border border-orange-500/20 rounded-md text-[10px] font-bold uppercase flex items-center gap-1 w-max"><span class="material-symbols-outlined text-[12px]">schedule</span> Retard</span>';
                } else {
                    statusBadge = '<span class="px-2 py-1 bg-green-500/10 text-green-600 border border-green-500/20 rounded-md text-[10px] font-bold uppercase flex items-center gap-1 w-max"><span class="material-symbols-outlined text-[12px]">check_circle</span> Présent</span>';
                }
            } else {
                statusBadge = '<span class="px-2 py-1 bg-surface-container-highest text-on-surface-variant border border-outline-variant rounded-md text-[10px] font-bold uppercase flex items-center gap-1 w-max"><span class="material-symbols-outlined text-[12px]">logout</span> Sortie</span>';
            }
        
            const defaultPhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullname)}&background=random`;
            const photo = u.photoUrl || defaultPhoto;
            const typeColor = u.role === 'Étudiant' ? 'text-primary bg-primary/10' : (u.role === 'Professeur' ? 'text-secondary bg-secondary/10' : 'text-tertiary bg-tertiary/10');
            const dept = u.department || u.fonction || u.service || 'Non assigné';
        
            return `
            <tr class="attendance-row hover:bg-surface-container-lowest transition-colors group"
                data-name="${u.fullname.toLowerCase()}" 
                data-role="${u.role}" 
                data-status="${a.status}" 
                data-date="${dateYMD}">
                
                <td class="px-4 py-3 font-mono text-xs text-on-surface-variant">#${String(idx).padStart(4, '0')}</td>
                <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                        <img src="${photo}" class="w-9 h-9 rounded-full object-cover border border-outline-variant shadow-sm" />
                        <div>
                            <div class="font-bold text-sm text-on-surface">${u.fullname}</div>
                            <div class="text-[9px] uppercase font-bold mt-1 w-max px-1.5 py-0.5 rounded ${typeColor}">${u.role}</div>
                        </div>
                    </div>
                </td>
                <td class="px-4 py-3 text-xs font-semibold text-on-surface-variant">${dept}</td>
                <td class="px-4 py-3 font-mono text-sm font-bold text-primary">${timeInStr}</td>
                <td class="px-4 py-3 font-mono text-sm font-bold text-on-surface-variant">${timeOutStr}</td>
                <td class="px-4 py-3 text-xs font-medium text-on-surface-variant">${dateStr}</td>
                <td class="px-4 py-3">${statusBadge}</td>
                <td class="px-4 py-3 text-right">
                    <div class="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        ${a.status === 'Présent' ? `<button onclick="window.appStore.recordAttendance('${a.userId}')" title="Marquer Sortie" class="w-8 h-8 rounded-full bg-error/10 text-error hover:bg-error hover:text-white transition-colors flex items-center justify-center shadow-sm"><span class="material-symbols-outlined text-[16px]">logout</span></button>` : ''}
                        <button onclick="window.editAttendance('${a.id}')" title="Détails / Modifier" class="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors flex items-center justify-center shadow-sm"><span class="material-symbols-outlined text-[16px]">edit</span></button>
                        <button onclick="window.deleteAttendance('${a.id}')" title="Supprimer" class="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors flex items-center justify-center shadow-sm"><span class="material-symbols-outlined text-[16px]">delete</span></button>
                    </div>
                </td>
            </tr>
            `;
        };

        // Sort attendances: newest first
        const sortedAttendances = [...attendances].sort((a: any, b: any) => new Date(b.timeIn).getTime() - new Date(a.timeIn).getTime());

        return `
        <div class="flex min-h-screen bg-surface-container-lowest">
            ${getSidebar('presences')}
            <main class="flex-grow ml-[260px]">
                ${getTopBar()}
                <div class="p-6 space-y-8">
                    <!-- En-tête de page -->
                    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h2 class="text-2xl font-black text-primary tracking-tight">Journal des Présences</h2>
                            <p class="text-sm text-on-surface-variant mt-1">Gérez et suivez le flux des entrées et sorties en temps réel.</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="window.appStore.exportPDF('attendances')" class="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant rounded-lg text-sm font-bold text-on-surface hover:bg-surface-container transition-all shadow-sm">
                                <span class="material-symbols-outlined text-[18px]">picture_as_pdf</span> Exporter PDF
                            </button>
                            <button onclick="window.appStore.exportExcel('attendances')" class="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant rounded-lg text-sm font-bold text-on-surface hover:bg-surface-container transition-all shadow-sm">
                                <span class="material-symbols-outlined text-[18px]">table</span> Exporter Excel
                            </button>
                        </div>
                    </div>
                    
                    <!-- Cartes Statistiques -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div class="bg-white p-5 border border-outline-variant rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                            <div class="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <span class="material-symbols-outlined text-2xl">groups</span>
                            </div>
                            <div>
                                <p class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Total Présents</p>
                                <div class="text-2xl font-black text-primary">${totalPresent}</div>
                            </div>
                        </div>
                        <div class="bg-white p-5 border border-outline-variant rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                            <div class="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                                <span class="material-symbols-outlined text-2xl">school</span>
                            </div>
                            <div>
                                <p class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Étudiants Présents</p>
                                <div class="text-2xl font-black text-secondary">${studentsPresent}</div>
                            </div>
                        </div>
                        <div class="bg-white p-5 border border-outline-variant rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                            <div class="w-12 h-12 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0">
                                <span class="material-symbols-outlined text-2xl">local_library</span>
                            </div>
                            <div>
                                <p class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Profs. Présents</p>
                                <div class="text-2xl font-black text-tertiary">${profsPresent}</div>
                            </div>
                        </div>
                        <div class="bg-white p-5 border border-outline-variant rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                            <div class="w-12 h-12 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center shrink-0">
                                <span class="material-symbols-outlined text-2xl">monitoring</span>
                            </div>
                            <div>
                                <p class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Entrées Aujourd'hui</p>
                                <div class="text-2xl font-black text-green-600">${activeUsersToday} <span class="text-xs text-on-surface-variant font-medium">(${freqRate}%)</span></div>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <!-- Colonne de Gauche : Scanner & Ajout Manuel -->
                        <div class="lg:col-span-4 flex flex-col gap-6">
                            <!-- Scanner Section -->
                            <div class="bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
                                <div class="p-4 border-b border-outline-variant bg-surface-container-lowest">
                                    <h3 class="font-bold flex items-center gap-2"><span class="material-symbols-outlined text-primary">qr_code_scanner</span> Scanner Entrée/Sortie</h3>
                                </div>
                                <div class="p-5">
                                    <div id="qr-reader" class="w-full overflow-hidden rounded-xl bg-black text-white aspect-square border border-outline-variant flex items-center justify-center shadow-inner">
                                        Initialisation caméra...
                                    </div>
                                    <p class="text-[11px] text-on-surface-variant mt-4 text-center">Placez le QR code de la carte devant la caméra pour enregistrer automatiquement le flux.</p>
                                </div>
                            </div>
                            
                            <!-- Ajout Manuel -->
                            <div class="bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden sticky top-24">
                                <div class="p-4 border-b border-outline-variant bg-surface-container-lowest">
                                    <h3 class="font-bold flex items-center gap-2"><span class="material-symbols-outlined text-primary">person_add</span> Enregistrement Manuel</h3>
                                </div>
                                <div class="p-5">
                                    <form onsubmit="window.addManualAttendance(event)" class="space-y-4">
                                        <div>
                                            <label class="block text-xs font-bold text-on-surface-variant mb-2">Sélectionner un utilisateur</label>
                                            <select name="userId" required class="w-full border border-outline-variant rounded-lg px-3 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-surface-container-lowest">
                                                <option value="">Rechercher et choisir...</option>
                                                ${users.map((u:any) => `<option value="${u.id}">${u.fullname} (${u.role})</option>`).join('')}
                                            </select>
                                        </div>
                                        <button type="submit" class="w-full py-3 bg-primary text-white rounded-lg font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2">
                                            <span class="material-symbols-outlined text-[18px]">how_to_reg</span> Valider l'entrée/sortie
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Colonne de Droite : Tableau des Présences -->
                        <div class="lg:col-span-8 flex flex-col">
                            <div class="bg-white border border-outline-variant rounded-2xl shadow-sm flex-grow flex flex-col overflow-hidden">
                                
                                <!-- Toolbar et Filtres -->
                                <div class="p-4 border-b border-outline-variant bg-surface-container-lowest flex flex-col xl:flex-row gap-4 justify-between items-center">
                                    <div class="relative flex-grow w-full xl:w-auto">
                                        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                                        <input type="text" id="searchAttendance" onkeyup="window.filterAttendances()" placeholder="Rechercher un nom..." class="w-full border border-outline-variant rounded-lg pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all bg-white" />
                                    </div>
                                    <div class="flex flex-wrap gap-3 w-full xl:w-auto">
                                        <input type="date" id="filterDateAttendance" onchange="window.filterAttendances()" class="border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none bg-white" />
                                        <select id="filterRoleAttendance" onchange="window.filterAttendances()" class="border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none font-semibold bg-white">
                                            <option value="all">Tous Rôles</option>
                                            <option value="Étudiant">Étudiants</option>
                                            <option value="Professeur">Professeurs</option>
                                        </select>
                                        <select id="filterStatusAttendance" onchange="window.filterAttendances()" class="border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none font-semibold bg-white">
                                            <option value="all">Tous Statuts</option>
                                            <option value="Présent">Présents</option>
                                            <option value="Terminé">Sorties</option>
                                        </select>
                                    </div>
                                </div>

                                <!-- Tableau Professionnel -->
                                <div class="overflow-x-auto flex-grow min-h-[500px]">
                                    <table class="w-full text-left text-sm whitespace-nowrap">
                                        <thead class="bg-surface-container-lowest border-b border-outline-variant text-[10px] uppercase tracking-wider text-on-surface-variant sticky top-0 z-10 shadow-sm">
                                            <tr>
                                                <th class="px-4 py-3 font-bold">N°</th>
                                                <th class="px-4 py-3 font-bold">Nom & Prénom</th>
                                                <th class="px-4 py-3 font-bold">Département</th>
                                                <th class="px-4 py-3 font-bold">Heure d'entrée</th>
                                                <th class="px-4 py-3 font-bold">Heure de sortie</th>
                                                <th class="px-4 py-3 font-bold">Date</th>
                                                <th class="px-4 py-3 font-bold">Statut</th>
                                                <th class="px-4 py-3 font-bold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-outline-variant">
                                            ${sortedAttendances.map((a: any, i: number) => renderAttRow(a, sortedAttendances.length - i)).join('')}
                                            ${sortedAttendances.length === 0 ? '<tr><td colspan="8" class="p-12 text-center text-on-surface-variant"><div class="flex flex-col items-center gap-3"><span class="material-symbols-outlined text-5xl opacity-40">event_busy</span><p class="font-medium">Aucun journal de présence enregistré.</p></div></td></tr>' : ''}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>

        <!-- Modal Edition Présence -->
        <div id="attendanceModal" class="hidden fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transform transition-all">
                <div class="p-5 border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between">
                    <h3 class="text-lg font-bold text-primary flex items-center gap-2"><span class="material-symbols-outlined">edit_calendar</span> Détails & Modification</h3>
                    <button type="button" onclick="document.getElementById('attendanceModal').classList.add('hidden')" class="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"><span class="material-symbols-outlined text-[20px]">close</span></button>
                </div>
                <form onsubmit="window.saveAttendanceEdit(event)" class="p-5 space-y-5">
                    <input type="hidden" id="editAttId" name="id" />
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-on-surface-variant mb-1">Heure d'entrée</label>
                            <input type="datetime-local" id="editAttTimeIn" name="timeIn" required class="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none bg-surface-container-lowest" />
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-on-surface-variant mb-1">Heure de sortie</label>
                            <input type="datetime-local" id="editAttTimeOut" name="timeOut" class="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none bg-surface-container-lowest" />
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-xs font-bold text-on-surface-variant mb-1">Statut de la présence</label>
                        <select id="editAttStatus" name="status" class="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none bg-surface-container-lowest font-semibold">
                            <option value="Présent">En cours (Présent)</option>
                            <option value="Terminé">Clôturé (Sortie)</option>
                        </select>
                    </div>
                    
                    <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant mt-6">
                        <button type="button" onclick="document.getElementById('attendanceModal').classList.add('hidden')" class="px-5 py-2.5 bg-surface text-on-surface border border-outline-variant rounded-lg font-bold text-sm hover:bg-surface-container transition-colors">Annuler</button>
                        <button type="submit" class="px-5 py-2.5 bg-primary text-white rounded-lg font-bold text-sm shadow hover:shadow-lg hover:-translate-y-0.5 transition-all">Enregistrer</button>
                    </div>
                </form>
            </div>
        </div>
        `;
    },

    requests: () => {
        const { requests } = (window as any).appStore || { requests: [] };

        (window as any).filterRequests = () => {
            const search = (document.getElementById('searchRequest') as HTMLInputElement).value.toLowerCase();
            const statusFilter = (document.getElementById('filterStatusRequest') as HTMLSelectElement).value;
            const typeFilter = (document.getElementById('filterTypeRequest') as HTMLSelectElement).value;
            const dateFilter = (document.getElementById('filterDateRequest') as HTMLInputElement).value;
            
            const rows = document.querySelectorAll('.request-row');
            rows.forEach((row: any) => {
                const name = row.getAttribute('data-name').toLowerCase();
                const status = row.getAttribute('data-status');
                const type = row.getAttribute('data-type');
                const date = row.getAttribute('data-date');
                
                const matchSearch = name.includes(search);
                const matchStatus = statusFilter === 'all' || status === statusFilter;
                const matchType = typeFilter === 'all' || type === typeFilter;
                const matchDate = !dateFilter || date === dateFilter;
                
                if (matchSearch && matchStatus && matchType && matchDate) {
                    row.classList.remove('hidden');
                } else {
                    row.classList.add('hidden');
                }
            });
        };

        (window as any).addManualRequest = (e: Event) => {
            e.preventDefault();
            const fd = new FormData(e.target as HTMLFormElement);
            const r: any = {
                id: 'REQ' + Date.now(),
                fullname: fd.get('fullname'),
                email: fd.get('email') || '',
                type: fd.get('type'),
                date: new Date().toISOString(),
                status: 'En attente',
                message: fd.get('message') || ''
            };
            (window as any).appStore.requests.push(r);
            (window as any).appStore.save();
            (window as any).appStore.showToast('Demande ajoutée avec succès');
            document.getElementById('addRequestModal')!.classList.add('hidden');
            (window as any).navigate('requests');
        };

        (window as any).updateRequestStatus = (id: string, newStatus: string) => {
            const r = (window as any).appStore.requests.find((x:any) => x.id === id);
            if (r) {
                r.status = newStatus;
                (window as any).appStore.save();
                (window as any).appStore.showToast('Demande ' + newStatus.toLowerCase());
                (window as any).navigate('requests');
            }
        };

        (window as any).deleteRequest = (id: string) => {
            if (confirm('Voulez-vous vraiment supprimer cette demande ?')) {
                (window as any).appStore.requests = (window as any).appStore.requests.filter((a: any) => a.id !== id);
                (window as any).appStore.save();
                (window as any).appStore.showToast('Demande supprimée');
                (window as any).navigate('requests');
            }
        };

        (window as any).viewRequestDetails = (id: string) => {
            const r = (window as any).appStore.requests.find((x:any) => x.id === id);
            if (r) {
                (document.getElementById('detReqId') as HTMLSpanElement).textContent = r.id;
                (document.getElementById('detReqName') as HTMLSpanElement).textContent = r.fullname;
                (document.getElementById('detReqType') as HTMLSpanElement).textContent = r.type;
                (document.getElementById('detReqDate') as HTMLSpanElement).textContent = new Date(r.date).toLocaleString();
                (document.getElementById('detReqStatus') as HTMLSpanElement).textContent = r.status;
                (document.getElementById('detReqMessage') as HTMLParagraphElement).textContent = r.message || 'Aucun message fourni.';
                
                const actionsDiv = document.getElementById('detReqActions');
                if (actionsDiv) {
                    if (r.status === 'En attente') {
                        actionsDiv.innerHTML = `
                            <button onclick="window.updateRequestStatus('${r.id}', 'Acceptée')" class="px-4 py-2 bg-green-500 text-white rounded font-bold hover:bg-green-600 transition-colors">Accepter</button>
                            <button onclick="window.updateRequestStatus('${r.id}', 'Refusée')" class="px-4 py-2 bg-error text-white rounded font-bold hover:bg-error/90 transition-colors">Refuser</button>
                        `;
                    } else if (r.status === 'Acceptée') {
                        actionsDiv.innerHTML = `
                            <button onclick="window.updateRequestStatus('${r.id}', 'Traitée')" class="px-4 py-2 bg-primary text-white rounded font-bold hover:bg-primary/90 transition-colors">Marquer Traitée</button>
                        `;
                    } else {
                        actionsDiv.innerHTML = '';
                    }
                }
                document.getElementById('requestDetailsModal')!.classList.remove('hidden');
            }
        };

        const sortedRequests = [...(requests || [])].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const renderRow = (r: any) => {
            const dateObj = new Date(r.date);
            const dateStr = dateObj.toLocaleDateString();
            const dateYMD = dateObj.toISOString().split('T')[0];
            
            let statusBadge = '';
            if (r.status === 'En attente') {
                statusBadge = '<span class="px-2 py-1 bg-warning/10 text-warning border border-warning/20 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-max"><span class="material-symbols-outlined text-[12px]">schedule</span> En attente</span>';
            } else if (r.status === 'Acceptée') {
                statusBadge = '<span class="px-2 py-1 bg-green-500/10 text-green-600 border border-green-500/20 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-max"><span class="material-symbols-outlined text-[12px]">done</span> Acceptée</span>';
            } else if (r.status === 'Refusée') {
                statusBadge = '<span class="px-2 py-1 bg-error/10 text-error border border-error/20 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-max"><span class="material-symbols-outlined text-[12px]">close</span> Refusée</span>';
            } else {
                statusBadge = '<span class="px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-max"><span class="material-symbols-outlined text-[12px]">task_alt</span> Traitée</span>';
            }

            return `
            <tr class="request-row hover:bg-surface-container-lowest transition-colors group"
                data-name="${r.fullname.toLowerCase()}" 
                data-status="${r.status}" 
                data-type="${r.type}"
                data-date="${dateYMD}">
                
                <td class="px-4 py-3 font-mono text-xs text-on-surface-variant">${r.id}</td>
                <td class="px-4 py-3 font-bold text-sm text-on-surface">${r.fullname}</td>
                <td class="px-4 py-3 text-xs font-semibold text-on-surface-variant">${r.type}</td>
                <td class="px-4 py-3 text-xs font-medium text-on-surface-variant">${dateStr}</td>
                <td class="px-4 py-3">${statusBadge}</td>
                <td class="px-4 py-3 text-right">
                    <div class="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="window.viewRequestDetails('${r.id}')" title="Détails" class="px-3 py-1.5 rounded bg-surface-container text-primary text-xs font-bold hover:bg-primary hover:text-white transition-colors flex items-center gap-1 shadow-sm"><span class="material-symbols-outlined text-[14px]">visibility</span> Détails</button>
                        ${r.status === 'En attente' ? `<button onclick="window.updateRequestStatus('${r.id}', 'Acceptée')" title="Accepter" class="w-7 h-7 rounded bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white transition-colors flex items-center justify-center shadow-sm"><span class="material-symbols-outlined text-[14px]">check</span></button>` : ''}
                        ${r.status === 'En attente' ? `<button onclick="window.updateRequestStatus('${r.id}', 'Refusée')" title="Refuser" class="w-7 h-7 rounded bg-error/10 text-error hover:bg-error hover:text-white transition-colors flex items-center justify-center shadow-sm"><span class="material-symbols-outlined text-[14px]">close</span></button>` : ''}
                        ${r.status === 'Acceptée' ? `<button onclick="window.updateRequestStatus('${r.id}', 'Traitée')" title="Traiter" class="w-7 h-7 rounded bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors flex items-center justify-center shadow-sm"><span class="material-symbols-outlined text-[14px]">task_alt</span></button>` : ''}
                        <button onclick="window.deleteRequest('${r.id}')" title="Supprimer" class="w-7 h-7 rounded bg-surface-container text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors flex items-center justify-center shadow-sm"><span class="material-symbols-outlined text-[14px]">delete</span></button>
                    </div>
                </td>
            </tr>
            `;
        };

        const totalReq = sortedRequests.length;
        const attenteReq = sortedRequests.filter(r => r.status === 'En attente').length;
        const acceptedReq = sortedRequests.filter(r => r.status === 'Acceptée' || r.status === 'Traitée').length;

        return `
        <div class="flex min-h-screen bg-surface-container-lowest">
            ${getSidebar('requests')}
            <main class="flex-grow ml-[260px]">
                ${getTopBar()}
                <div class="p-6 space-y-8">
                    <!-- En-tête -->
                    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h2 class="text-2xl font-black text-primary tracking-tight">Gestion des Demandes</h2>
                            <p class="text-sm text-on-surface-variant mt-1">Traitez les demandes d'inscription, d'emprunt ou autres sollicitations.</p>
                        </div>
                        <button onclick="document.getElementById('addRequestModal').classList.remove('hidden')" class="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-sm">
                            <span class="material-symbols-outlined text-[18px]">add</span> Nouvelle Demande
                        </button>
                    </div>
                    
                    <!-- Stats Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="bg-white p-5 border border-outline-variant rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                            <div class="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <span class="material-symbols-outlined text-2xl">inbox</span>
                            </div>
                            <div>
                                <p class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Total Demandes</p>
                                <div class="text-2xl font-black text-primary">${totalReq}</div>
                            </div>
                        </div>
                        <div class="bg-white p-5 border border-outline-variant rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                            <div class="w-12 h-12 rounded-full bg-warning/10 text-warning flex items-center justify-center shrink-0">
                                <span class="material-symbols-outlined text-2xl">schedule</span>
                            </div>
                            <div>
                                <p class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">En attente</p>
                                <div class="text-2xl font-black text-warning">${attenteReq}</div>
                            </div>
                        </div>
                        <div class="bg-white p-5 border border-outline-variant rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                            <div class="w-12 h-12 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center shrink-0">
                                <span class="material-symbols-outlined text-2xl">task_alt</span>
                            </div>
                            <div>
                                <p class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Traitées / Acceptées</p>
                                <div class="text-2xl font-black text-green-600">${acceptedReq}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Main Table -->
                    <div class="bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden flex flex-col">
                        <!-- Toolbar -->
                        <div class="p-4 border-b border-outline-variant bg-surface-container-lowest flex flex-col xl:flex-row gap-4 justify-between items-center">
                            <div class="relative flex-grow w-full xl:w-auto">
                                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                                <input type="text" id="searchRequest" onkeyup="window.filterRequests()" placeholder="Rechercher un demandeur..." class="w-full border border-outline-variant rounded-lg pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all bg-white" />
                            </div>
                            <div class="flex flex-wrap gap-3 w-full xl:w-auto">
                                <input type="date" id="filterDateRequest" onchange="window.filterRequests()" class="border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none bg-white" />
                                <select id="filterTypeRequest" onchange="window.filterRequests()" class="border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none font-semibold bg-white">
                                    <option value="all">Tous Types</option>
                                    <option value="Inscription">Inscription</option>
                                    <option value="Renouvellement">Renouvellement</option>
                                    <option value="Emprunt">Emprunt</option>
                                    <option value="Autre">Autre</option>
                                </select>
                                <select id="filterStatusRequest" onchange="window.filterRequests()" class="border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none font-semibold bg-white">
                                    <option value="all">Tous Statuts</option>
                                    <option value="En attente">En attente</option>
                                    <option value="Acceptée">Acceptée</option>
                                    <option value="Traitée">Traitée</option>
                                    <option value="Refusée">Refusée</option>
                                </select>
                            </div>
                        </div>

                        <!-- Table -->
                        <div class="overflow-x-auto min-h-[400px]">
                            <table class="w-full text-left text-sm whitespace-nowrap">
                                <thead class="bg-surface-container-lowest border-b border-outline-variant text-[10px] uppercase tracking-wider text-on-surface-variant sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th class="px-4 py-3 font-bold">ID</th>
                                        <th class="px-4 py-3 font-bold">Demandeur</th>
                                        <th class="px-4 py-3 font-bold">Type</th>
                                        <th class="px-4 py-3 font-bold">Date</th>
                                        <th class="px-4 py-3 font-bold">Statut</th>
                                        <th class="px-4 py-3 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-outline-variant">
                                    ${sortedRequests.map((r: any) => renderRow(r)).join('')}
                                    ${sortedRequests.length === 0 ? '<tr><td colspan="6" class="p-12 text-center text-on-surface-variant"><div class="flex flex-col items-center gap-3"><span class="material-symbols-outlined text-5xl opacity-40">inbox</span><p class="font-medium">Aucune demande trouvée.</p></div></td></tr>' : ''}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>

        <!-- Add Request Modal -->
        <div id="addRequestModal" class="hidden fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transform transition-all">
                <div class="p-5 border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between">
                    <h3 class="text-lg font-bold text-primary flex items-center gap-2"><span class="material-symbols-outlined">add_circle</span> Nouvelle Demande</h3>
                    <button type="button" onclick="document.getElementById('addRequestModal').classList.add('hidden')" class="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"><span class="material-symbols-outlined text-[20px]">close</span></button>
                </div>
                <form onsubmit="window.addManualRequest(event)" class="p-5 space-y-5">
                    <div>
                        <label class="block text-xs font-bold text-on-surface-variant mb-1">Nom complet</label>
                        <input type="text" name="fullname" required class="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none bg-surface-container-lowest" />
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-on-surface-variant mb-1">Email (optionnel)</label>
                            <input type="email" name="email" class="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none bg-surface-container-lowest" />
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-on-surface-variant mb-1">Type de demande</label>
                            <select name="type" required class="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none font-semibold bg-surface-container-lowest">
                                <option value="Inscription">Inscription</option>
                                <option value="Renouvellement">Renouvellement</option>
                                <option value="Emprunt">Emprunt</option>
                                <option value="Autre">Autre</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-on-surface-variant mb-1">Message / Description</label>
                        <textarea name="message" rows="3" required class="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none resize-none bg-surface-container-lowest"></textarea>
                    </div>
                    <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant mt-6">
                        <button type="button" onclick="document.getElementById('addRequestModal').classList.add('hidden')" class="px-5 py-2.5 bg-surface text-on-surface border border-outline-variant rounded-lg font-bold text-sm hover:bg-surface-container transition-colors">Annuler</button>
                        <button type="submit" class="px-5 py-2.5 bg-primary text-white rounded-lg font-bold text-sm shadow hover:shadow-lg hover:-translate-y-0.5 transition-all">Créer demande</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Request Details Modal -->
        <div id="requestDetailsModal" class="hidden fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col transform transition-all">
                <div class="p-5 border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between">
                    <h3 class="text-lg font-bold text-primary flex items-center gap-2"><span class="material-symbols-outlined">assignment</span> Détails de la demande</h3>
                    <button type="button" onclick="document.getElementById('requestDetailsModal').classList.add('hidden')" class="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"><span class="material-symbols-outlined text-[20px]">close</span></button>
                </div>
                <div class="p-6 space-y-5">
                    <div class="grid grid-cols-2 gap-4 bg-surface-container-lowest p-5 rounded-xl border border-outline-variant">
                        <div>
                            <p class="text-[10px] uppercase font-bold text-on-surface-variant mb-1">ID Demande</p>
                            <span id="detReqId" class="font-mono text-sm font-bold text-primary"></span>
                        </div>
                        <div>
                            <p class="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Statut</p>
                            <span id="detReqStatus" class="text-sm font-bold"></span>
                        </div>
                        <div>
                            <p class="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Demandeur</p>
                            <span id="detReqName" class="text-sm font-bold text-on-surface"></span>
                        </div>
                        <div>
                            <p class="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Date & Heure</p>
                            <span id="detReqDate" class="text-sm font-medium text-on-surface-variant"></span>
                        </div>
                        <div class="col-span-2">
                            <p class="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Type de demande</p>
                            <span id="detReqType" class="inline-block px-2.5 py-1 bg-primary/10 text-primary rounded-md text-xs font-bold"></span>
                        </div>
                    </div>
                    <div>
                        <p class="text-[10px] uppercase font-bold text-on-surface-variant mb-2">Message de la demande</p>
                        <div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant">
                            <p id="detReqMessage" class="text-sm text-on-surface leading-relaxed whitespace-pre-wrap"></p>
                        </div>
                    </div>
                </div>
                <div class="p-5 border-t border-outline-variant bg-surface-container-lowest flex justify-between items-center">
                    <button type="button" onclick="document.getElementById('requestDetailsModal').classList.add('hidden')" class="px-5 py-2.5 bg-surface text-on-surface border border-outline-variant rounded-lg font-bold text-sm hover:bg-surface-container transition-colors">Fermer</button>
                    <div id="detReqActions" class="flex gap-2">
                        <!-- Actions dynamiques (Accepter, Refuser, Traiter) -->
                    </div>
                </div>
            </div>
        </div>
        `;
    },

    profile: () => {
        const { currentUserId, users } = (window as any).appStore;
        let currentUser = users.find((u: any) => u.id === currentUserId);

        if (!currentUser) {
            return `
            <div class="flex min-h-screen bg-surface-container-lowest">
                ${getSidebar('profile')}
                <main class="flex-grow ml-[260px] flex items-center justify-center">
                    <div class="text-center p-8 bg-white border border-outline-variant rounded-2xl shadow-sm">
                        <span class="material-symbols-outlined text-6xl text-on-surface-variant opacity-50 mb-4">person_off</span>
                        <h2 class="text-xl font-bold text-primary mb-2">Aucun utilisateur trouvé</h2>
                        <p class="text-on-surface-variant text-sm mb-6">Veuillez d'abord inscrire un utilisateur dans le système.</p>
                        <button onclick="window.navigate('students')" class="px-5 py-2.5 bg-primary text-white rounded-lg font-bold text-sm shadow hover:shadow-lg transition-all">Aller aux Inscriptions</button>
                    </div>
                </main>
            </div>`;
        }

        (window as any).triggerProfilePhotoUpload = () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/png, image/jpeg, image/webp';
            input.onchange = (e: any) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        currentUser.photoUrl = ev.target?.result as string;
                        (window as any).appStore.save();
                        (window as any).appStore.showToast('Photo de profil mise à jour');
                        (window as any).navigate('profile');
                    };
                    reader.readAsDataURL(file);
                }
            };
            input.click();
        };

        (window as any).deleteProfile = () => {
            if (confirm('Voulez-vous vraiment supprimer ce profil ? Cette action est irréversible.')) {
                (window as any).appStore.users = (window as any).appStore.users.filter((u: any) => u.id !== currentUser.id);
                (window as any).appStore.setCurrentUserById(null);
                (window as any).appStore.save();
                (window as any).appStore.showToast('Profil supprimé avec succès');
                (window as any).navigate('dashboard');
            }
        };

        (window as any).editProfile = () => {
            document.getElementById('editProfileModal')!.classList.remove('hidden');
        };

        (window as any).saveProfileEdit = (e: Event) => {
            e.preventDefault();
            const fd = new FormData(e.target as HTMLFormElement);
            
            currentUser.fullname = fd.get('fullname') as string;
            currentUser.telephone = fd.get('telephone') as string;
            currentUser.address = fd.get('address') as string;
            currentUser.department = fd.get('department') as string;
            currentUser.matricule = fd.get('matricule') as string;
            
            (window as any).appStore.save();
            (window as any).appStore.showToast('Profil mis à jour avec succès');
            document.getElementById('editProfileModal')!.classList.add('hidden');
            (window as any).navigate('profile');
        };

        const defaultPhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.fullname)}&background=random&size=256`;
        const photo = currentUser.photoUrl || defaultPhoto;
        
        const typeColor = currentUser.role === 'Étudiant' ? 'text-primary bg-primary/10' : (currentUser.role === 'Professeur' ? 'text-secondary bg-secondary/10' : 'text-tertiary bg-tertiary/10');
        
        const isActive = currentUser.isActive !== false;
        const statusBadge = isActive 
            ? '<span class="px-3 py-1 bg-green-500/10 text-green-600 border border-green-500/20 rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-max"><span class="material-symbols-outlined text-[14px]">verified_user</span> Actif</span>' 
            : '<span class="px-3 py-1 bg-error/10 text-error border border-error/20 rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-max"><span class="material-symbols-outlined text-[14px]">gpp_bad</span> Inactif</span>';

        const regDate = currentUser.registrationDate ? new Date(currentUser.registrationDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Non renseignée';

        return `
        <div class="flex min-h-screen bg-surface-container-lowest">
            ${getSidebar('profile')}
            <main class="flex-grow ml-[260px]">
                ${getTopBar()}
                <div class="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
                    
                    <!-- En-tête -->
                    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h2 class="text-3xl font-black text-primary tracking-tight">Profil Utilisateur</h2>
                            <p class="text-sm text-on-surface-variant mt-1">Gérez vos informations personnelles et préférences de compte.</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        <!-- Left Column: Avatar & Quick Actions -->
                        <div class="lg:col-span-4 flex flex-col gap-6">
                            <div class="bg-white border border-outline-variant rounded-3xl shadow-sm p-8 flex flex-col items-center text-center relative overflow-hidden group">
                                <div class="absolute top-0 left-0 w-full h-32 bg-primary/5"></div>
                                
                                <div class="relative w-40 h-40 rounded-full border-4 border-white shadow-lg mb-6 overflow-hidden bg-surface-container group-hover:shadow-xl transition-all">
                                    <img src="${photo}" class="w-full h-full object-cover" alt="${currentUser.fullname}" />
                                    <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onclick="window.triggerProfilePhotoUpload()">
                                        <span class="material-symbols-outlined text-white text-3xl">photo_camera</span>
                                    </div>
                                </div>
                                
                                <h3 class="text-2xl font-black text-on-surface mb-2">${currentUser.fullname}</h3>
                                <div class="flex flex-col items-center gap-3 w-full">
                                    <span class="inline-block px-3 py-1 ${typeColor} rounded-lg text-xs font-bold uppercase tracking-wider">${currentUser.role}</span>
                                    ${statusBadge}
                                </div>
                                
                                <div class="w-full h-px bg-outline-variant my-6"></div>
                                
                                <div class="w-full flex flex-col gap-3">
                                    <button onclick="window.triggerProfilePhotoUpload()" class="w-full py-2.5 px-4 bg-surface-container-lowest border border-outline-variant text-primary rounded-xl font-bold text-sm hover:bg-primary/5 transition-colors flex items-center justify-center gap-2">
                                        <span class="material-symbols-outlined text-[18px]">imagesmode</span> Changer la photo
                                    </button>
                                    <button onclick="window.editProfile()" class="w-full py-2.5 px-4 bg-primary text-white rounded-xl font-bold text-sm shadow hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                                        <span class="material-symbols-outlined text-[18px]">edit_square</span> Modifier le profil
                                    </button>
                                    <button onclick="window.deleteProfile()" class="w-full py-2.5 px-4 bg-error/10 text-error rounded-xl font-bold text-sm hover:bg-error hover:text-white transition-colors flex items-center justify-center gap-2 mt-2">
                                        <span class="material-symbols-outlined text-[18px]">person_remove</span> Supprimer le profil
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Right Column: Details -->
                        <div class="lg:col-span-8 flex flex-col gap-6">
                            <div class="bg-white border border-outline-variant rounded-3xl shadow-sm overflow-hidden">
                                <div class="p-6 border-b border-outline-variant bg-surface-container-lowest">
                                    <h3 class="font-bold text-lg text-primary flex items-center gap-2"><span class="material-symbols-outlined">badge</span> Informations Complètes</h3>
                                </div>
                                <div class="p-8">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                                        <div class="space-y-1">
                                            <p class="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5"><span class="material-symbols-outlined text-[14px]">pin</span> Matricule / ID</p>
                                            <p class="text-base font-medium text-on-surface">${currentUser.matricule || currentUser.id || 'N/A'}</p>
                                        </div>
                                        <div class="space-y-1">
                                            <p class="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5"><span class="material-symbols-outlined text-[14px]">corporate_fare</span> Département / Service</p>
                                            <p class="text-base font-medium text-on-surface">${currentUser.department || currentUser.fonction || 'Non assigné'}</p>
                                        </div>
                                        <div class="space-y-1">
                                            <p class="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5"><span class="material-symbols-outlined text-[14px]">call</span> Téléphone</p>
                                            <p class="text-base font-medium text-on-surface">${currentUser.telephone || 'Non renseigné'}</p>
                                        </div>
                                        <div class="space-y-1">
                                            <p class="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5"><span class="material-symbols-outlined text-[14px]">location_on</span> Adresse</p>
                                            <p class="text-base font-medium text-on-surface">${currentUser.address || 'Non renseignée'}</p>
                                        </div>
                                        <div class="space-y-1">
                                            <p class="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5"><span class="material-symbols-outlined text-[14px]">calendar_month</span> Date d'inscription</p>
                                            <p class="text-base font-medium text-on-surface">${regDate}</p>
                                        </div>
                                        <div class="space-y-1">
                                            <p class="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5"><span class="material-symbols-outlined text-[14px]">qr_code_2</span> QR Code d'Accès</p>
                                            ${currentUser.qrCodeDataUrl ? `<div class="mt-2 p-2 bg-white border border-outline-variant rounded-lg inline-block shadow-sm"><img src="${currentUser.qrCodeDataUrl}" class="w-20 h-20" alt="QR Code" /></div>` : '<p class="text-sm text-warning font-medium italic mt-1">Non généré</p>'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>

        <!-- Edit Profile Modal -->
        <div id="editProfileModal" class="hidden fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm">
            <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col transform transition-all">
                <div class="p-6 border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between">
                    <h3 class="text-xl font-bold text-primary flex items-center gap-2"><span class="material-symbols-outlined">edit_document</span> Modifier les informations</h3>
                    <button type="button" onclick="document.getElementById('editProfileModal').classList.add('hidden')" class="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"><span class="material-symbols-outlined text-[20px]">close</span></button>
                </div>
                <form onsubmit="window.saveProfileEdit(event)" class="p-6 space-y-5 bg-surface-container-lowest/30">
                    <div>
                        <label class="block text-[11px] uppercase font-bold text-on-surface-variant mb-1.5">Nom complet</label>
                        <input type="text" name="fullname" value="${currentUser.fullname}" required class="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none bg-white shadow-sm transition-shadow" />
                    </div>
                    <div class="grid grid-cols-2 gap-5">
                        <div>
                            <label class="block text-[11px] uppercase font-bold text-on-surface-variant mb-1.5">Matricule</label>
                            <input type="text" name="matricule" value="${currentUser.matricule || ''}" class="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none bg-white shadow-sm transition-shadow" />
                        </div>
                        <div>
                            <label class="block text-[11px] uppercase font-bold text-on-surface-variant mb-1.5">Département</label>
                            <input type="text" name="department" value="${currentUser.department || currentUser.fonction || ''}" class="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none bg-white shadow-sm transition-shadow" />
                        </div>
                    </div>
                    <div>
                        <label class="block text-[11px] uppercase font-bold text-on-surface-variant mb-1.5">Téléphone</label>
                        <input type="tel" name="telephone" value="${currentUser.telephone || ''}" class="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none bg-white shadow-sm transition-shadow" />
                    </div>
                    <div>
                        <label class="block text-[11px] uppercase font-bold text-on-surface-variant mb-1.5">Adresse</label>
                        <input type="text" name="address" value="${currentUser.address || ''}" class="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none bg-white shadow-sm transition-shadow" />
                    </div>
                    
                    <div class="flex justify-end gap-3 pt-6 border-t border-outline-variant mt-8">
                        <button type="button" onclick="document.getElementById('editProfileModal').classList.add('hidden')" class="px-6 py-3 bg-surface-container-highest text-on-surface rounded-xl font-bold text-sm hover:bg-outline-variant/30 transition-colors">Annuler</button>
                        <button type="submit" class="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">Enregistrer les modifications</button>
                    </div>
                </form>
            </div>
        </div>
        `;
    },

    stats: () => {
        const { users, books, borrows, attendances } = (window as any).appStore;

        // ── KPIs réels ─────────────────────────────────────────────────
        const totalUsers     = users.length;
        const students       = users.filter((u:any) => u.role === 'Étudiant').length;
        const professors     = users.filter((u:any) => u.role === 'Professeur').length;
        const totalBooks     = books.reduce((s:number, b:any) => s + (b.quantity || 1), 0);
        const availableBooks = books.filter((b:any) => b.status === 'Disponible').length;
        const borrowedBooks  = borrows.filter((b:any) => b.status !== 'Retourné').length;
        const todayStr       = new Date().toISOString().split('T')[0];
        const presencesToday = attendances.filter((a:any) => a.timeIn?.startsWith(todayStr)).length;
        const presentNow     = attendances.filter((a:any) => a.status === 'Présent').length;

        // ── Emprunts par mois (6 derniers) ──────────────────────────────
        const monthLabels: string[] = [];
        const borrowsByMonth: number[] = [];
        const attendByMonth: number[] = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const ym = d.toISOString().slice(0, 7);
            monthLabels.push(d.toLocaleString('fr-FR', { month: 'short' }).toUpperCase());
            borrowsByMonth.push(borrows.filter((b:any) => b.borrowDate?.startsWith(ym)).length);
            attendByMonth.push(attendances.filter((a:any) => a.timeIn?.startsWith(ym)).length);
        }

        // ── Top 5 livres empruntés ───────────────────────────────────────
        const bookCount: Record<string, number> = {};
        borrows.forEach((b:any) => { bookCount[b.bookId] = (bookCount[b.bookId] || 0) + 1; });
        const topBooks = Object.entries(bookCount)
            .sort((a: any, b: any) => b[1] - a[1])
            .slice(0, 5)
            .map(([bookId, count]) => {
                const book = books.find((bk:any) => bk.id === bookId);
                return { title: book?.title || 'Livre inconnu', count };
            });

        // ── Répartition par rôle ──────────────────────────────────────────
        const roleData = [students, professors];
        const roleLabels = ['Étudiants', 'Professeurs'];
        const roleColors = ['#6750A4', '#B58392'];

        // ── Utilisateurs les plus actifs ─────────────────────────────────
        const userActivity: Record<string, number> = {};
        borrows.forEach((b:any) => { userActivity[b.userId] = (userActivity[b.userId] || 0) + 1; });
        const topUsers = Object.entries(userActivity)
            .sort((a: any, b: any) => b[1] - a[1])
            .slice(0, 5)
            .map(([userId, count]) => {
                const user = users.find((u:any) => u.id === userId);
                return { name: user?.fullname || 'Utilisateur inconnu', role: user?.role || '', count };
            });

        // ── Render helper : stat card ────────────────────────────────────
        const kpiCard = (icon: string, label: string, value: string|number, color: string, sub?: string) => `
            <div class="bg-white p-5 border border-outline-variant rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-all hover:-translate-y-0.5 group">
                <div class="w-13 h-13 w-[52px] h-[52px] rounded-2xl ${color} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <span class="material-symbols-outlined text-2xl">${icon}</span>
                </div>
                <div class="min-w-0">
                    <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-0.5 truncate">${label}</p>
                    <div class="text-2xl font-black text-on-surface leading-tight">${value}</div>
                    ${sub ? `<p class="text-[11px] text-on-surface-variant mt-0.5">${sub}</p>` : ''}
                </div>
            </div>`;

        return `
        <div class="flex min-h-screen bg-surface-container-lowest">
            ${getSidebar('stats')}
            <main class="flex-grow ml-[260px]">
                ${getTopBar()}
                <div class="p-6 space-y-8">

                    <!-- En-tête -->
                    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h2 class="text-2xl font-black text-primary tracking-tight">Tableau de bord analytique</h2>
                            <p class="text-sm text-on-surface-variant mt-1">Données en temps réel extraites du système.</p>
                        </div>
                        <div class="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant rounded-xl shadow-sm text-xs font-bold text-on-surface-variant">
                            <span class="material-symbols-outlined text-[16px] text-green-500">fiber_manual_record</span>
                            Données en direct — ${new Date().toLocaleString('fr-FR')}
                        </div>
                    </div>

                    <!-- KPI Grid -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        ${kpiCard('group', 'Total Utilisateurs', totalUsers, 'bg-primary/10 text-primary', `${students} étudiants · ${professors} profs`)}
                        ${kpiCard('menu_book', 'Total Livres', totalBooks, 'bg-secondary/10 text-secondary', `${availableBooks} disponibles`)}
                        ${kpiCard('swap_horiz', 'Emprunts actifs', borrowedBooks, 'bg-tertiary/10 text-tertiary', `${borrows.length} total`)}
                        ${kpiCard('co_present', 'Présences aujourd\'hui', presencesToday, 'bg-green-500/10 text-green-600', `${presentNow} actuellement`)}
                        ${kpiCard('school', 'Étudiants inscrits', students, 'bg-indigo-500/10 text-indigo-600', 'Membres actifs')}
                        ${kpiCard('local_library', 'Professeurs', professors, 'bg-pink-500/10 text-pink-600', 'Membres actifs')}
                        ${kpiCard('auto_stories', 'Livres empruntés', borrowedBooks, 'bg-orange-500/10 text-orange-600', 'En circulation')}
                    </div>

                    <!-- Graphiques Row 1 -->
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <!-- Emprunts & Présences par mois -->
                        <div class="lg:col-span-2 bg-white border border-outline-variant rounded-2xl shadow-sm p-6">
                            <div class="flex items-center justify-between mb-6">
                                <div>
                                    <h3 class="font-bold text-on-surface">Activité mensuelle</h3>
                                    <p class="text-xs text-on-surface-variant mt-0.5">Emprunts et présences sur les 6 derniers mois</p>
                                </div>
                                <span class="material-symbols-outlined text-primary">analytics</span>
                            </div>
                            <canvas id="monthlyChart" height="200"></canvas>
                        </div>

                        <!-- Répartition utilisateurs -->
                        <div class="bg-white border border-outline-variant rounded-2xl shadow-sm p-6">
                            <div class="flex items-center justify-between mb-6">
                                <div>
                                    <h3 class="font-bold text-on-surface">Répartition membres</h3>
                                    <p class="text-xs text-on-surface-variant mt-0.5">Par rôle utilisateur</p>
                                </div>
                                <span class="material-symbols-outlined text-secondary">donut_large</span>
                            </div>
                            <canvas id="roleChart" height="200"></canvas>
                            <div class="mt-4 space-y-2">
                                ${roleLabels.map((l, i) => `
                                <div class="flex items-center justify-between text-xs">
                                    <div class="flex items-center gap-2">
                                        <div class="w-3 h-3 rounded-full" style="background:${roleColors[i]}"></div>
                                        <span class="font-medium text-on-surface-variant">${l}</span>
                                    </div>
                                    <span class="font-bold text-on-surface">${roleData[i]}</span>
                                </div>`).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Graphiques Row 2 -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Top livres empruntés -->
                        <div class="bg-white border border-outline-variant rounded-2xl shadow-sm p-6">
                            <div class="flex items-center justify-between mb-6">
                                <div>
                                    <h3 class="font-bold text-on-surface">Livres les plus empruntés</h3>
                                    <p class="text-xs text-on-surface-variant mt-0.5">Top 5 ouvrages</p>
                                </div>
                                <span class="material-symbols-outlined text-tertiary">workspace_premium</span>
                            </div>
                            ${topBooks.length > 0
                                ? `<div class="space-y-4">
                                    ${topBooks.map((b, i) => {
                                        const pct = topBooks[0].count > 0 ? Math.round((b.count / topBooks[0].count) * 100) : 0;
                                        const colors = ['bg-primary','bg-secondary','bg-tertiary','bg-indigo-400','bg-pink-400'];
                                        return `
                                        <div>
                                            <div class="flex justify-between items-center mb-1.5">
                                                <span class="text-xs font-semibold text-on-surface truncate max-w-[200px]" title="${b.title}">#${i+1} ${b.title}</span>
                                                <span class="text-xs font-black text-on-surface-variant ml-2">${b.count} emprunt${b.count > 1 ? 's' : ''}</span>
                                            </div>
                                            <div class="w-full bg-surface-container-highest rounded-full h-2">
                                                <div class="${colors[i]} h-2 rounded-full transition-all" style="width:${pct}%"></div>
                                            </div>
                                        </div>`;
                                    }).join('')}
                                  </div>`
                                : `<div class="flex flex-col items-center justify-center h-40 text-on-surface-variant">
                                    <span class="material-symbols-outlined text-5xl opacity-30 mb-3">auto_stories</span>
                                    <p class="text-sm">Aucun emprunt enregistré</p>
                                   </div>`}
                        </div>

                        <!-- Top utilisateurs actifs -->
                        <div class="bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
                            <div class="p-6 border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between">
                                <div>
                                    <h3 class="font-bold text-on-surface">Utilisateurs les plus actifs</h3>
                                    <p class="text-xs text-on-surface-variant mt-0.5">Par nombre d'emprunts</p>
                                </div>
                                <span class="material-symbols-outlined text-primary">leaderboard</span>
                            </div>
                            ${topUsers.length > 0
                                ? `<table class="w-full text-sm">
                                    <thead class="text-[10px] uppercase text-on-surface-variant border-b border-outline-variant">
                                        <tr>
                                            <th class="px-5 py-3 font-bold text-left">#</th>
                                            <th class="px-5 py-3 font-bold text-left">Utilisateur</th>
                                            <th class="px-5 py-3 font-bold text-right">Emprunts</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-outline-variant">
                                        ${topUsers.map((u, i) => {
                                            const medals = ['🥇','🥈','🥉','4️⃣','5️⃣'];
                                            const photo = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random&size=64`;
                                            return `
                                            <tr class="hover:bg-surface-container-lowest transition-colors">
                                                <td class="px-5 py-3 text-lg">${medals[i]}</td>
                                                <td class="px-5 py-3">
                                                    <div class="flex items-center gap-3">
                                                        <img src="${photo}" class="w-8 h-8 rounded-full object-cover border border-outline-variant shadow-sm" />
                                                        <div>
                                                            <div class="font-semibold text-on-surface text-xs">${u.name}</div>
                                                            <div class="text-[10px] text-on-surface-variant">${u.role}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td class="px-5 py-3 text-right font-black text-primary">${u.count}</td>
                                            </tr>`;
                                        }).join('')}
                                    </tbody>
                                  </table>`
                                : `<div class="flex flex-col items-center justify-center h-40 text-on-surface-variant">
                                    <span class="material-symbols-outlined text-5xl opacity-30 mb-3">person_off</span>
                                    <p class="text-sm">Aucun emprunt enregistré</p>
                                   </div>`}
                        </div>
                    </div>

                    <!-- Tableau Récapitulatif -->
                    <div class="bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
                        <div class="p-6 border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between">
                            <div>
                                <h3 class="font-bold text-on-surface">Historique des emprunts récents</h3>
                                <p class="text-xs text-on-surface-variant mt-0.5">Les 10 dernières opérations</p>
                            </div>
                            <span class="material-symbols-outlined text-on-surface-variant">history</span>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm whitespace-nowrap">
                                <thead class="text-[10px] uppercase text-on-surface-variant border-b border-outline-variant bg-surface-container-lowest">
                                    <tr>
                                        <th class="px-5 py-3 font-bold text-left">Livre</th>
                                        <th class="px-5 py-3 font-bold text-left">Emprunteur</th>
                                        <th class="px-5 py-3 font-bold text-left">Date emprunt</th>
                                        <th class="px-5 py-3 font-bold text-left">Date retour</th>
                                        <th class="px-5 py-3 font-bold">Statut</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-outline-variant">
                                    ${[...borrows]
                                        .sort((a:any, b:any) => new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime())
                                        .slice(0, 10)
                                        .map((b:any) => {
                                            const book = books.find((bk:any) => bk.id === b.bookId);
                                            const user = users.find((u:any) => u.id === b.userId);
                                            const isReturned = b.status === 'Retourné';
                                            const isLate = !isReturned && b.returnDate && new Date(b.returnDate) < new Date();
                                            const badge = isReturned
                                                ? '<span class="px-2 py-0.5 bg-green-500/10 text-green-600 border border-green-500/20 rounded text-[10px] font-bold">Retourné</span>'
                                                : isLate
                                                    ? '<span class="px-2 py-0.5 bg-error/10 text-error border border-error/20 rounded text-[10px] font-bold">En retard</span>'
                                                    : '<span class="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded text-[10px] font-bold">En cours</span>';
                                            return `
                                            <tr class="hover:bg-surface-container-lowest transition-colors">
                                                <td class="px-5 py-3 font-medium text-on-surface max-w-[200px] truncate" title="${book?.title || ''}">${book?.title || 'Livre inconnu'}</td>
                                                <td class="px-5 py-3 text-on-surface-variant">${user?.fullname || 'Utilisateur inconnu'}</td>
                                                <td class="px-5 py-3 text-on-surface-variant">${b.borrowDate ? new Date(b.borrowDate).toLocaleDateString('fr-FR') : '—'}</td>
                                                <td class="px-5 py-3 text-on-surface-variant">${b.returnDate ? new Date(b.returnDate).toLocaleDateString('fr-FR') : '—'}</td>
                                                <td class="px-5 py-3 text-center">${badge}</td>
                                            </tr>`;
                                        }).join('')}
                                    ${borrows.length === 0 ? '<tr><td colspan="5" class="p-10 text-center text-on-surface-variant"><span class="material-symbols-outlined text-4xl opacity-30 block mb-2">swap_horiz</span>Aucun emprunt enregistré</td></tr>' : ''}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </main>
        </div>

        <script>
        (function() {
            const monthData   = ${JSON.stringify(borrowsByMonth)};
            const attendData  = ${JSON.stringify(attendByMonth)};
            const mlabels     = ${JSON.stringify(monthLabels)};
            const rData       = ${JSON.stringify(roleData)};
            const rLabels     = ${JSON.stringify(roleLabels)};
            const rColors     = ${JSON.stringify(roleColors)};

            function buildCharts() {
                // Monthly bar + line chart
                const mCtx = document.getElementById('monthlyChart');
                if (mCtx && typeof Chart !== 'undefined') {
                    new Chart(mCtx, {
                        type: 'bar',
                        data: {
                            labels: mlabels,
                            datasets: [
                                { label: 'Emprunts', data: monthData, backgroundColor: 'rgba(103,80,164,0.18)', borderColor: '#6750A4', borderWidth: 2, borderRadius: 6, borderSkipped: false },
                                { label: 'Présences', data: attendData, type: 'line', tension: 0.45, borderColor: '#58A0A0', backgroundColor: 'rgba(88,160,160,0.1)', borderWidth: 2.5, pointBackgroundColor: '#58A0A0', pointRadius: 4, fill: true }
                            ]
                        },
                        options: { responsive: true, plugins: { legend: { position: 'top', labels: { font: { size: 11, weight: 'bold' }, boxWidth: 12 } } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { stepSize: 1 } }, x: { grid: { display: false } } } }
                    });
                }

                // Role doughnut
                const rCtx = document.getElementById('roleChart');
                if (rCtx && typeof Chart !== 'undefined') {
                    const total = rData.reduce((s,v) => s+v, 0);
                    new Chart(rCtx, {
                        type: 'doughnut',
                        data: { labels: rLabels, datasets: [{ data: total > 0 ? rData : [1,1,1], backgroundColor: total > 0 ? rColors : ['#e0e0e0','#e0e0e0','#e0e0e0'], borderWidth: 0, hoverOffset: 6 }] },
                        options: { cutout: '72%', responsive: true, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ' ' + ctx.label + ': ' + ctx.parsed } } } }
                    });
                }
            }

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', buildCharts);
            } else {
                setTimeout(buildCharts, 80);
            }
        })();
        </script>
        `;
    },

        interface: () => `
        <div class="flex min-h-screen">
            ${getSidebar('interface')}
            <main class="flex-grow ml-[260px]">
                ${getTopBar()}
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
    `,

    login: () => `
    <div class="min-h-screen bg-gradient-to-br from-primary/[0.06] via-surface to-secondary/[0.06] flex items-center justify-center p-4">
        <style>
            @keyframes fadeInUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
            .auth-card { animation: fadeInUp 0.5s ease-out both; }
        </style>
        <div class="auth-card w-full max-w-md">
            <!-- Header -->
            <div class="text-center mb-8">
                <div class="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/30">
                    <span class="material-symbols-outlined text-4xl text-white">account_balance</span>
                </div>
                <h1 class="text-3xl font-black text-on-surface">Gest Biblio</h1>
                <p class="text-sm text-on-surface-variant mt-1 font-medium">Université de Labé · Portail Académique</p>
            </div>

            <!-- Card -->
            <div class="bg-white rounded-3xl shadow-2xl border border-outline-variant/30 overflow-hidden">
                <div class="bg-primary px-8 py-5">
                    <h2 class="text-xl font-black text-white">Se connecter</h2>
                    <p class="text-white/70 text-sm mt-0.5">Accédez à votre espace personnel</p>
                </div>

                <div class="p-8 space-y-5">
                    <!-- Error message -->
                    <div id="login-error" class="hidden bg-error/10 border border-error/30 text-error px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                        <span class="material-symbols-outlined text-[18px]">error</span>
                        <span id="login-error-text">Identifiant ou mot de passe incorrect.</span>
                    </div>

                    <!-- Role selector -->
                    <div>
                        <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Choisir un rôle de démonstration</label>
                        <div class="grid grid-cols-2 gap-3">
                            ${['Administrateur','Gestionnaire','Professeur','Étudiant'].map(r => `
                            <button type="button" onclick="window.selectRole('${r}')" data-role="${r}"
                                class="role-btn flex items-center justify-between gap-3 p-4 border-2 border-outline-variant rounded-xl text-left transition hover:border-primary/60 hover:bg-primary/5">
                                <div>
                                    <p class="text-sm font-bold text-on-surface">${r}</p>
                                    <p class="text-[11px] text-on-surface-variant mt-1">Accès instantané au tableau de bord</p>
                                </div>
                                <span class="material-symbols-outlined text-2xl text-on-surface-variant">person</span>
                            </button>`).join('')}
                        </div>
                    </div>

                    <div class="text-center text-sm text-on-surface-variant">ou saisissez un identifiant d'exemple existant</div>

                    <!-- Identifiant -->
                    <div>
                        <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Identifiant de démonstration (facultatif)</label>
                        <div class="relative">
                            <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant">badge</span>
                            <input id="login-username" type="text" placeholder="ex: admin, gest, mbah, idiallo"
                                class="w-full pl-11 pr-4 py-3.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                onkeydown="if(event.key==='Enter') window.doLogin()" />
                        </div>
                    </div>

                    <div class="bg-primary/5 border border-primary/20 rounded-xl p-4">
                        <p class="text-[11px] font-bold text-primary uppercase tracking-wider mb-2">Comptes de démonstration</p>
                        <div class="grid grid-cols-2 gap-2 text-xs text-on-surface-variant">
                            <span>🔑 <strong>admin</strong> → Administrateur</span>
                            <span>🗝️ <strong>gest</strong> → Gestionnaire</span>
                            <span>🎓 <strong>mbah</strong> → Étudiant</span>
                            <span>👨‍🏫 <strong>idiallo</strong> → Professeur</span>
                        </div>
                    </div>

                    <!-- Submit -->
                    <button id="login-btn" onclick="window.doLogin()"
                        class="w-full py-4 bg-primary text-white rounded-xl font-black text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3">
                        <span class="material-symbols-outlined">login</span>
                        Se connecter
                    </button>

                    <div class="text-center text-sm text-on-surface-variant">
                        Pas encore de compte ?
                        <button onclick="navigate('register')" class="text-primary font-bold hover:underline ml-1">S'inscrire</button>
                    </div>
                </div>
            </div>

            <p class="text-center text-xs text-on-surface-variant mt-6">
                <button onclick="navigate('home')" class="hover:text-primary transition-colors flex items-center gap-1 mx-auto">
                    <span class="material-symbols-outlined text-[14px]">arrow_back</span> Retour à l'accueil
                </button>
            </p>
        </div>

        
    </div>
    `,

    register: () => {
        return `
    <div class="min-h-screen bg-gradient-to-br from-secondary/[0.06] via-surface to-primary/[0.06] flex items-center justify-center p-4 py-10">
        <style>
            @keyframes fadeInUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
            .auth-card { animation: fadeInUp 0.5s ease-out both; }
        </style>
        <div class="auth-card w-full max-w-xl">
            <div class="text-center mb-8">
                <div class="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-secondary/30">
                    <span class="material-symbols-outlined text-4xl text-white">person_add</span>
                </div>
                <h1 class="text-3xl font-black text-on-surface">Créer un compte</h1>
                <p class="text-sm text-on-surface-variant mt-1 font-medium">Université de Labé · Inscription Académique</p>
            </div>

            <div class="bg-white rounded-3xl shadow-2xl border border-outline-variant/30 overflow-hidden">
                <div class="bg-secondary px-8 py-5">
                    <h2 class="text-xl font-black text-white">Formulaire d'inscription</h2>
                    <p class="text-white/70 text-sm mt-0.5">Remplissez tous les champs obligatoires</p>
                </div>

                <div class="p-8 space-y-5">
                    <div id="reg-error" class="hidden bg-error/10 border border-error/30 text-error px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                        <span class="material-symbols-outlined text-[18px]">error</span>
                        <span id="reg-error-text">Erreur.</span>
                    </div>

                    <!-- Role selector -->
                    <div>
                        <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Type de compte *</label>
                        <div class="grid grid-cols-3 gap-2" id="role-selector">
                            ${['Gestionnaire','Étudiant','Professeur'].map(r => `
                            <button type="button" onclick="window.selectRole('${r}')" data-role="${r}"
                                class="role-btn flex flex-col items-center gap-1.5 p-3 border-2 border-outline-variant rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all text-center">
                                <span class="material-symbols-outlined text-2xl text-on-surface-variant">${r==='Gestionnaire'?'manage_accounts':r==='Étudiant'?'school':'psychology'}</span>
                                <span class="text-[11px] font-bold text-on-surface-variant">${r}</span>
                            </button>`).join('')}
                        </div>
                    </div>

                    <!-- Common fields -->
                    <div class="grid grid-cols-1 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Nom complet *</label>
                            <input id="reg-fullname" type="text" placeholder="Prénom Nom"
                                class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                        </div>
                    </div>

                    <!-- Student: Téléphone, Département, Licence -->
                    <div id="student-tel-field" class="hidden" style="display: none;">
                        <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Téléphone</label>
                        <input id="reg-tel" type="tel" placeholder="+224 6XX XX XX XX"
                            class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>

                    <div id="student-dept-field" class="hidden" style="display: none;">
                        <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Département *</label>
                        <input id="reg-student-dept" type="text" placeholder="ex: Département d'Informatique"
                            class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>

                    <div id="student-licence-field" class="hidden" style="display: none;">
                        <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Niveau / Licence *</label>
                        <select id="reg-licence" class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none">
                            <option value="">-- Choisir --</option>
                            <option>Licence 1</option><option>Licence 2</option><option>Licence 3</option>
                            <option>Master 1</option><option>Master 2</option><option>Doctorat</option>
                        </select>
                    </div>

                    <!-- Professor: Matricule, Département, Service, Fonction, Adresse -->
                    <div id="prof-matricule-field" class="hidden" style="display: none;">
                        <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Matricule *</label>
                        <input id="reg-prof-matricule" type="text" placeholder="PROF-2026-00"
                            class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>

                    <div id="prof-dept-field" class="hidden" style="display: none;">
                        <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Département *</label>
                        <input id="reg-prof-dept" type="text" placeholder="ex: Département d'Informatique"
                            class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>

                    <div id="prof-service-field" class="hidden" style="display: none;">
                        <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Service *</label>
                        <input id="reg-prof-service" type="text" placeholder="ex: Service d'Informatique"
                            class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>

                    <div id="prof-fonction-field" class="hidden" style="display: none;">
                        <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Fonction / Titre *</label>
                        <input id="reg-prof-fonction" type="text" placeholder="ex: Maître de Conférences"
                            class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>

                    <div id="prof-address-field" class="hidden" style="display: none;">
                        <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Adresse *</label>
                        <input id="reg-prof-address" type="text" placeholder="ex: Campus, Bâtiment C"
                            class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>

                    <!-- Gestionnaire: Fonction, Service, Téléphone -->
                    <div id="manager-fonction-field" class="hidden" style="display: none;">
                        <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Fonction *</label>
                        <input id="reg-manager-fonction" type="text" placeholder="Ex: Responsable Accueil"
                            class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>

                    <div id="manager-service-field" class="hidden" style="display: none;">
                        <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Service *</label>
                        <input id="reg-manager-service" type="text" placeholder="ex: Accueil / Bibliothèque"
                            class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>

                    <div id="manager-tel-field" class="hidden" style="display: none;">
                        <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Téléphone *</label>
                        <input id="reg-manager-tel" type="tel" placeholder="+224 6XX XX XX XX"
                            class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>

                    <!-- Photo upload (shared) -->
                    <div>
                        <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Photo (optionnelle)</label>
                        <input id="reg-photo" type="file" accept="image/*" class="w-full text-sm" />
                    </div>

                    <button onclick="window.doRegister()"
                        class="w-full py-4 bg-secondary text-white rounded-xl font-black text-base shadow-lg hover:opacity-90 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3">
                        <span class="material-symbols-outlined">how_to_reg</span>
                        Créer mon compte
                    </button>

                    <div class="text-center text-sm text-on-surface-variant">
                        Déjà inscrit ?
                        <button onclick="navigate('login')" class="text-primary font-bold hover:underline ml-1">Se connecter</button>
                    </div>
                </div>
            </div>

            <p class="text-center text-xs text-on-surface-variant mt-6">
                <button onclick="navigate('home')" class="hover:text-primary transition-colors flex items-center gap-1 mx-auto">
                    <span class="material-symbols-outlined text-[14px]">arrow_back</span> Retour à l'accueil
                </button>
            </p>
        </div>

        
    </div>
    `; },
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

function renderUserRow(u: any) {
    const defaultPhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullname)}&background=random`;
    const photo = u.photoUrl || defaultPhoto;
    
    let roleBadge = '';
    let details = '';
    
    if (u.role === 'Étudiant') {
        roleBadge = '<span class="px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-primary-container text-primary">Étudiant</span>';
        details = `<div class="text-sm font-semibold">${u.matricule || 'N/A'}</div><div class="text-[10px] text-on-surface-variant uppercase">${u.department || 'N/A'}</div>`;
    } else if (u.role === 'Professeur') {
        roleBadge = '<span class="px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-secondary-container text-secondary">Professeur</span>';
        details = `<div class="text-sm font-semibold">${u.department || 'N/A'}</div><div class="text-[10px] text-on-surface-variant uppercase">Département</div>`;
    }

    return `
        <tr class="hover:bg-surface-container-lowest transition-colors group">
            <td class="px-6 py-4">
                <div class="flex items-center gap-4">
                    <img src="${photo}" class="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" alt="${u.fullname}" />
                    <div>
                        <div class="font-bold text-on-surface">${u.fullname}</div>
                        <div class="text-[11px] text-on-surface-variant">@${u.username}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">${roleBadge}</td>
            <td class="px-6 py-4">${details}</td>
            <td class="px-6 py-4 text-center">
               ${u.qrCodeDataUrl ? `<img src="${u.qrCodeDataUrl}" class="h-10 w-10 mx-auto rounded border border-outline-variant opacity-80 group-hover:opacity-100 transition-opacity" />` : '<span class="text-[10px] text-on-surface-variant">Non généré</span>'}
            </td>
            <td class="px-6 py-4 text-right">
                <button onclick="if(confirm('Supprimer cet utilisateur ?')) window.appStore.deleteUser('${u.id}')" class="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-error hover:text-white transition-colors">
                    <span class="material-symbols-outlined text-sm">delete</span>
                </button>
            </td>
        </tr>
    `;
}

function renderBookRow(b: any) {
    const statusClass = b.status === 'Disponible' ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container';
    return `
        <tr class="hover:bg-surface-container transition-colors">
            <td class="px-4 py-4 text-xs font-semibold">${b.entryDate || 'N/A'}</td>
            <td class="px-4 py-4 text-xs font-mono">${b.cote || 'N/A'}</td>
            <td class="px-4 py-4 font-bold text-primary">${b.title || 'N/A'}</td>
            <td class="px-4 py-4 text-xs font-semibold">${b.author || 'N/A'}</td>
            <td class="px-4 py-4 text-xs">${b.publisher || 'N/A'}</td>
            <td class="px-4 py-4 text-xs">${b.place || 'N/A'}</td>
            <td class="px-4 py-4 text-xs">${b.publishDate || 'N/A'}</td>
            <td class="px-4 py-4 text-xs text-center font-bold">${b.quantity || 0}</td>
            <td class="px-4 py-4 text-xs font-mono">${b.isbn || 'N/A'}</td>
            <td class="px-4 py-4">
                <span class="px-2 py-1 rounded text-[10px] font-bold uppercase ${statusClass}">${b.status}</span>
            </td>
            <td class="px-4 py-4 text-right">
                <button onclick="window.appStore.deleteBook('${b.id}')" class="text-error material-symbols-outlined text-lg hover:text-red-700">delete</button>
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


function renderFeatureCard(icon: string, title: string, desc: string) {
    return `
        <div class="bg-white p-8 rounded-2xl border border-outline-variant shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
            <div class="w-14 h-14 bg-surface-container rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <span class="material-symbols-outlined text-3xl text-primary group-hover:text-white transition-colors">${icon}</span>
            </div>
            <h3 class="font-bold text-xl mb-3 text-on-surface">${title}</h3>
            <p class="text-on-surface-variant text-sm leading-relaxed">${desc}</p>
        </div>
    `;
}
