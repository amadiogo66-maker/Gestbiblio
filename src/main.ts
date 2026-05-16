import './index.css';
import { screens, roleConfig } from './screens.ts';

// Simple Router / Page Switcher
const app = document.getElementById('app');

// Global helpers for the auth UI (used by injected templates)
const authUI = {
    currentTab: 'login',
    selectedRole: 'librarian',
    currentRole: 'admin',
    currentUser: '',
    registeredUsers: JSON.parse(localStorage.getItem('gestbiblio-users') || '{}'),
    saveUsers() {
        localStorage.setItem('gestbiblio-users', JSON.stringify(this.registeredUsers));
    },
    getCurrentUser() {
        return this.currentUser ? this.registeredUsers[this.currentUser] : null;
    },
    addHistory(username: string, action: string, note = '') {
        const user = this.registeredUsers[username];
        if (!user) return;
        user.history = user.history || [];
        user.history.unshift({ date: new Date().toLocaleString('fr-FR'), action, note });
        this.saveUsers();
    },
    setStatus(username: string, status: string) {
        const user = this.registeredUsers[username];
        if (!user) return;
        user.status = status;
        this.addHistory(username, `Statut modifié : ${status}`);
        this.saveUsers();
    },
    async readFileDataURL(input: HTMLInputElement | null) {
        const file = input?.files?.[0];
        if (!file) return null;
        return await new Promise<string | null>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
        });
    },
    openPrintableProfile(username: string) {
        const user = this.registeredUsers[username];
        if (!user) return;
        const content = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Fiche utilisateur ${user.fullname}</title><style>body{font-family:Inter,sans-serif;color:#111;background:#fff;padding:24px}h1{font-size:24px}h2{margin-top:20px;font-size:16px}table{width:100%;border-collapse:collapse;margin-top:12px}td,th{border:1px solid #ccc;padding:8px;text-align:left}th{background:#f3f3f3}</style></head><body><h1>Fiche utilisateur</h1><p><strong>Nom :</strong> ${user.fullname}</p><p><strong>Statut :</strong> ${user.status || 'N/A'}</p><h2>Informations personnelles</h2><table><tr><th>Nom d'utilisateur</th><td>${user.username}</td></tr><tr><th>Sexe</th><td>${user.sex || 'N/A'}</td></tr><tr><th>Date de naissance</th><td>${user.dob || 'N/A'}</td></tr><tr><th>Téléphone</th><td>${user.phone || 'N/A'}</td></tr><tr><th>Email</th><td>${user.email || 'N/A'}</td></tr><tr><th>Adresse</th><td>${user.address || 'N/A'}</td></tr></table><h2>Informations académiques</h2><table><tr><th>INE / Matricule</th><td>${user.ine || user.matricule || 'N/A'}</td></tr><tr><th>Faculté</th><td>${user.faculty || 'N/A'}</td></tr><tr><th>Département</th><td>${user.department || 'N/A'}</td></tr><tr><th>Niveau</th><td>${user.level || 'N/A'}</td></tr><tr><th>Filière</th><td>${user.filiere || 'N/A'}</td></tr><tr><th>Année universitaire</th><td>${user.academicYear || 'N/A'}</td></tr></table><p style="margin-top:28px;font-size:12px;color:#555;">Gest Biblio - Université de Labé</p></body></html>`;
        const printWindow = window.open('', '_blank', 'width=900,height=700');
        if (!printWindow) return;
        printWindow.document.write(content);
        printWindow.document.close();
    },
    downloadProfile(username: string) {
        const user = this.registeredUsers[username];
        if (!user) return;
        const data = JSON.stringify(user, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${username}_fiche.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },
    approveRequest(username: string) {
        this.setStatus(username, 'Inscrit');
        this.addHistory(username, 'Inscription approuvée', 'Demande validée par l’administration');
        this.saveUsers();
        (window as any).navigate('requests');
    },
    rejectRequest(username: string) {
        this.setStatus(username, 'Compte expiré');
        this.addHistory(username, 'Inscription rejetée', 'Demande rejetée par l’administration');
        this.saveUsers();
        (window as any).navigate('requests');
    },
    async submitReRegistration(e: Event) {
        e.preventDefault();
        const user = this.getCurrentUser();
        if (!user) return;
        const get = (sel: string) => document.querySelector(sel) as HTMLInputElement | null;
        let valid = true;
        const clear = () => document.querySelectorAll('.auth-error').forEach(el => el.textContent = '');
        clear();
        const phone = get('#re-phone');
        const address = get('#re-address');
        const level = get('#re-level');
        const filiere = get('#re-filiere');
        const academicYear = get('#re-academic-year');
        if (!phone?.value.trim()) { document.getElementById('err-re-phone')!.textContent = 'Requis'; valid = false; }
        if (!address?.value.trim()) { document.getElementById('err-re-address')!.textContent = 'Requis'; valid = false; }
        if (!level?.value.trim()) { document.getElementById('err-re-level')!.textContent = 'Requis'; valid = false; }
        if (!filiere?.value.trim()) { document.getElementById('err-re-filiere')!.textContent = 'Requis'; valid = false; }
        if (!academicYear?.value.trim()) { document.getElementById('err-re-academic-year')!.textContent = 'Requis'; valid = false; }
        const documentData = await this.readFileDataURL(get('#re-document'));
        if (!valid) return;
        user.phone = phone.value.trim();
        user.address = address.value.trim();
        user.level = level.value.trim();
        user.filiere = filiere.value.trim();
        user.academicYear = academicYear.value.trim();
        if (documentData) {
            user.documentData = documentData;
            user.documentName = get('#re-document')?.files?.[0]?.name || user.documentName;
        }
        user.status = 'Réinscrit';
        this.addHistory(this.currentUser, 'Réinscription soumise', `Année ${user.academicYear}`);
        this.saveUsers();
        this.showToast('Réinscription enregistrée, en attente de validation.', 1800);
        (window as any).navigate('profile');
    },
    switchTab(tab: string) {
        this.currentTab = tab;
        const loginPane = document.getElementById('auth-pane-login');
        const registerPane = document.getElementById('auth-pane-register');
        const tabLogin = document.getElementById('auth-tab-login');
        const tabRegister = document.getElementById('auth-tab-register');
        if (loginPane && registerPane && tabLogin && tabRegister) {
            if (tab === 'login') {
                loginPane.classList.remove('hidden');
                registerPane.classList.add('hidden');
                tabLogin.classList.add('border-b-2');
                tabRegister.classList.remove('border-b-2');
            } else {
                loginPane.classList.add('hidden');
                registerPane.classList.remove('hidden');
                tabLogin.classList.remove('border-b-2');
                tabRegister.classList.add('border-b-2');
                this.selectRole(this.selectedRole);
            }
        }
    },
    selectRole(role: string) {
        this.selectedRole = role;
        const cards = document.querySelectorAll('[data-auth-role]');
        cards.forEach((c) => {
            const el = c as HTMLElement;
            if (el.dataset.authRole === role) {
                el.classList.add('ring-2', 'ring-primary');
            } else {
                el.classList.remove('ring-2', 'ring-primary');
            }
        });
        // show corresponding fields group
        const groups = document.querySelectorAll('[data-role-group]');
        groups.forEach((g) => {
            const el = g as HTMLElement;
            el.classList.toggle('hidden', el.dataset.roleGroup !== role);
        });
    },
    togglePassword(id: string) {
        const input = document.getElementById(id) as HTMLInputElement | null;
        if (!input) return;
        input.type = input.type === 'password' ? 'text' : 'password';
    },
    showToast(msg: string, timeout = 3000) {
        let toast = document.getElementById('auth-toast');
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.remove('opacity-0', 'translate-y-2');
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-2');
        }, timeout);
    },
    async submitForm(e: Event) {
        e.preventDefault();
        const isRegister = this.currentTab === 'register';
        // basic client-side validation
        const get = (sel: string) => document.querySelector(sel) as HTMLInputElement | null;
        let valid = true;
        const clearErrors = () => document.querySelectorAll('.auth-error').forEach(el => el.textContent = '');
        clearErrors();

        if (!isRegister) {
            const username = get('#login-username');
            const password = get('#login-password');
            const demoCredentials: Record<string, { role: string; password: string }> = {
                admin: { role: 'admin', password: 'admin123' },
                etudiant: { role: 'student', password: 'etudiant123' },
                professeur: { role: 'professor', password: 'prof123' },
                bibliothecaire: { role: 'librarian', password: 'biblio123' },
                profadmin: { role: 'professorAdmin', password: 'profadmin123' },
            };
            if (!username || !username.value.trim()) {
                document.getElementById('err-login-username')!.textContent = 'Requis';
                valid = false;
            }
            if (!password || !password.value.trim()) {
                document.getElementById('err-login-password')!.textContent = 'Requis';
                valid = false;
            }
            if (username && password && username.value.trim() && password.value.trim()) {
                const cleanUser = username.value.trim().toLowerCase();
                const storedUser = this.registeredUsers[cleanUser];
                if (storedUser && storedUser.password === password.value.trim()) {
                    if (storedUser.status === 'En attente validation') {
                        this.showToast('Compte en attente de validation', 1800);
                        valid = false;
                    } else if (storedUser.status === 'Compte expiré') {
                        this.showToast('Compte expiré, contactez l’administration', 1800);
                        valid = false;
                    } else {
                        this.currentRole = storedUser.role;
                        this.currentUser = cleanUser;
                        this.showToast(`Connexion ${storedUser.role} validée`, 1200);
                    }
                } else {
                    const credentials = demoCredentials[cleanUser];
                    if (credentials && credentials.password === password.value.trim()) {
                        this.currentRole = credentials.role;
                        this.currentUser = cleanUser;
                        this.showToast(`Connexion démo ${credentials.role} validée`, 1200);
                    } else {
                        document.getElementById('err-login-password')!.textContent = 'Identifiants invalides';
                        valid = false;
                    }
                }
            }
        } else {
            const role = this.selectedRole;
            const fullname = get('#reg-fullname');
            const username = get('#reg-username');
            const email = get('#reg-email');
            const pwd = get('#reg-password');
            const pwdc = get('#reg-password-confirm');
            if (!fullname || !fullname.value.trim()) { document.getElementById('err-reg-fullname')!.textContent = 'Requis'; valid = false; }
            if (!username || !username.value.trim()) { document.getElementById('err-reg-username')!.textContent = 'Requis'; valid = false; }
            if (username && username.value.trim()) {
                const key = username.value.trim().toLowerCase();
                if (this.registeredUsers[key]) {
                    document.getElementById('err-reg-username')!.textContent = 'Nom d\'utilisateur déjà utilisé';
                    valid = false;
                }
            }
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { document.getElementById('err-reg-email')!.textContent = 'Email invalide'; valid = false; }
            if (!pwd || pwd.value.length < 6) { document.getElementById('err-reg-password')!.textContent = 'Minimum 6 caractères'; valid = false; }
            if (!pwdc || pwdc.value !== (pwd?.value ?? '')) { document.getElementById('err-reg-password-confirm')!.textContent = 'Doit correspondre'; valid = false; }
            // role-specific requireds
            if (role === 'student') {
                const ine = get('#reg-ine'); if (!ine || !ine.value.trim()) { document.getElementById('err-reg-ine')!.textContent = 'Requis'; valid = false; }
            }
            if (role === 'librarian') {
                const pid = get('#reg-profid'); if (!pid || !pid.value.trim()) { document.getElementById('err-reg-profid')!.textContent = 'Requis'; valid = false; }
            }
            if (role === 'professor') {
                const mat = get('#reg-matricule'); if (!mat || !mat.value.trim()) { document.getElementById('err-reg-matricule')!.textContent = 'Requis'; valid = false; }
            }
        }

        if (!valid) {
            this.showToast('Veuillez corriger les erreurs du formulaire', 2500);
            return;
        }

        if (isRegister) {
            const regUsername = get('#reg-username');
            const regPassword = get('#reg-password');
            const regSex = get('#reg-sex');
            const regDob = get('#reg-dob');
            const regPhone = get('#reg-phone');
            const regAddress = get('#reg-address');
            const regIne = get('#reg-ine');
            const regMatricule = get('#reg-matricule');
            const regProfId = get('#reg-profid');
            const regFaculty = get('#reg-faculty');
            const regDepartment = get('#reg-department');
            const regDeptProf = get('#reg-dept-prof');
            const regGrade = get('#reg-grade');
            const regLevel = get('#reg-level');
            const regFiliere = get('#reg-filiere');
            const regAcademicYear = get('#reg-academic-year');
            const regPhoto = get('#reg-photo');
            const regDocument = get('#reg-document');
            if (regUsername && regPassword && regUsername.value.trim()) {
                const key = regUsername.value.trim().toLowerCase();
                const profilePhoto = await this.readFileDataURL(regPhoto);
                const documentData = await this.readFileDataURL(regDocument);
                this.registeredUsers[key] = {
                    username: regUsername.value.trim(),
                    password: regPassword.value,
                    role: this.selectedRole,
                    fullname: get('#reg-fullname')?.value.trim() || '',
                    sex: regSex?.value || '',
                    dob: regDob?.value || '',
                    phone: regPhone?.value.trim() || '',
                    email: get('#reg-email')?.value.trim() || '',
                    address: regAddress?.value.trim() || '',
                    ine: regIne?.value.trim() || '',
                    matricule: regMatricule?.value.trim() || '',
                    professionalId: regProfId?.value.trim() || '',
                    faculty: regFaculty?.value.trim() || '',
                    department: regDepartment?.value.trim() || '',
                    departmentProf: regDeptProf?.value.trim() || '',
                    grade: regGrade?.value.trim() || '',
                    level: regLevel?.value.trim() || '',
                    filiere: regFiliere?.value.trim() || '',
                    academicYear: regAcademicYear?.value.trim() || '',
                    profilePhoto,
                    documentName: regDocument?.files?.[0]?.name || '',
                    documentData,
                    status: 'En attente validation',
                    history: [{ date: new Date().toLocaleString('fr-FR'), action: 'Inscription initiale', note: 'Demande en attente de validation' }],
                    createdAt: new Date().toISOString(),
                };
                this.saveUsers();
            }
        }

        const submitBtn = document.querySelector('#auth-submit') as HTMLButtonElement | null;
        if (submitBtn) {
            submitBtn.disabled = true;
            const orig = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Traitement...';
            await new Promise(r => setTimeout(r, 600));
            submitBtn.innerHTML = orig;
            submitBtn.disabled = false;
        }

        // For login pane, preserve original quick navigation behavior (demo mode)
        if (!isRegister) {
            this.showToast('Connexion réussie — redirection...', 800);
            setTimeout(() => navigate('dashboard'), 700);
            return;
        }

        this.showToast('Inscription enregistrée, en attente de validation.', 1800);
        this.switchTab('login');
    }
};

(window as any).authUI = authUI;

function canNavigate(page: string, role: string) {
    const publicPages = ['login', 'home'];
    if (publicPages.includes(page)) return true;
    const currentUser = (window as any).authUI?.currentUser;
    if ((page === 'profile' || page === 'reinscription') && !currentUser) return false;
    if (page === 'requests') {
        return ['admin', 'librarian'].includes(role);
    }
    return roleConfig[role]?.allowedPages?.includes(page);
}

function navigate(page: string) {
    if (!app) return;
    
    const currentRole = (window as any).authUI?.currentRole || 'admin';
    if (!canNavigate(page, currentRole)) {
        (window as any).authUI?.showToast?.('Accès restreint', 1800);
        page = 'dashboard';
    }
    
    // Always scroll to top on navigation
    window.scrollTo(0, 0);
    
    const renderFunc = (screens as any)[page];
    if (renderFunc) {
        app.innerHTML = renderFunc();
    } else {
        app.innerHTML = `<div class="p-10"><h1>404 - Page non trouvée</h1><button onclick="navigate('login')" class="text-primary underline">Retour à la connexion</button></div>`;
    }
}

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    navigate('home');
});

// Expose navigate globally for onclick handlers in template strings
(window as any).navigate = navigate;
