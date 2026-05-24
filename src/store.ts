import Chart from 'chart.js/auto';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Html5QrcodeScanner } from 'html5-qrcode';
import QRCode from 'qrcode';

export interface Book {
    id: string;
    entryDate: string;
    cote: string;
    title: string;
    author: string;
    publisher: string;
    place: string;
    publishDate: string;
    quantity: number;
    isbn: string;
    category: string;
    status: 'Disponible' | 'Emprunté' | 'Réservé';
}

// ────────────────────────────────────────────────────────────────
// Structure académique réelle de l'Université Julius Nyerere de Labé
// ────────────────────────────────────────────────────────────────
export const UNIVERSITE_LABE = [
    {
        id: 'FST',
        label: 'Faculté des Sciences et Techniques',
        shortLabel: 'FST',
        color: 'bg-blue-500/10 text-blue-700',
        departments: [
            'Département de Mathématiques',
            "Département d'Informatique",
            'Département MIAGE',
            "Département d'Énergie Photovoltaïque",
            'Département de Biologie Appliquée'
        ]
    },
    {
        id: 'FSAG',
        label: 'Faculté des Sciences Administratives et de Gestion',
        shortLabel: 'FSAG',
        color: 'bg-emerald-500/10 text-emerald-700',
        departments: [
            "Département d'Administration Publique",
            'Département de Gestion',
            "Département d'Économie",
            "Département d'Économie Sociale Familiale"
        ]
    },
    {
        id: 'FLSH',
        label: 'Faculté des Lettres et Sciences Humaines',
        shortLabel: 'FLSH',
        color: 'bg-purple-500/10 text-purple-700',
        departments: [
            'Département de Sociologie',
            "Département d'Anglais",
            'Département de Langue Arabe'
        ]
    }
] as const;

export type FacultyId = typeof UNIVERSITE_LABE[number]['id'];

export interface User {
    id: string;
    fullname: string;
    username: string;
    role: string;
    photoUrl?: string;
    qrCodeDataUrl?: string;
    matricule?: string;
    faculty?: string;       // ex: 'FST'
    department?: string;   // ex: 'Département d\'Informatique'
    fonction?: string;
    address?: string;
    licence?: string;
    amount?: string;
    telephone?: string;
    registrationDate?: string;
    registrationHistory?: Array<{ date: string, type: 'Inscription' | 'Réinscription' }>;
    isActive?: boolean;
}

export interface Borrow {
    id: string;
    bookId: string;
    userId: string;
    borrowDate: string;
    expectedReturnDate: string;
    actualReturnDate?: string;
    status: 'En cours' | 'Retourné' | 'En retard';
    caution?: string;
}

export interface Attendance {
    id: string;
    userId: string;
    timeIn: string;
    timeOut?: string;
    status: 'Présent' | 'Terminé';
}

export interface RequestModel {
    id: string;
    fullname: string;
    type: 'Inscription' | 'Renouvellement' | 'Emprunt' | 'Autre';
    date: string;
    status: 'En attente' | 'Acceptée' | 'Refusée' | 'Traitée';
    message?: string;
    email?: string;
}

export const store = {
    books: [] as Book[],
    users: [] as User[],
    borrows: [] as Borrow[],
    attendances: [] as Attendance[],
    requests: [] as RequestModel[],
    currentUserId: null as string | null,
    currentUser: null as User | null,
    isAuthenticated: false as boolean,
    
    scanner: null as Html5QrcodeScanner | null,
    dashboardChart: null as any,
    dashboardCharts: {} as any,
    
    init() {
        this.books = JSON.parse(localStorage.getItem('gb-books') || '[]');
        this.users = JSON.parse(localStorage.getItem('gb-users') || '[]');
        this.borrows = JSON.parse(localStorage.getItem('gb-borrows') || '[]');
        this.attendances = JSON.parse(localStorage.getItem('gb-attendances') || '[]');
        this.requests = JSON.parse(localStorage.getItem('gb-requests') || '[]');
        this.currentUserId = localStorage.getItem('gb-current-user-id') || null;

        if (this.books.length === 0 && this.users.length === 0) {
            this.seedData();
        }
        
        if (this.currentUserId) {
            this.currentUser = this.users.find(u => u.id === this.currentUserId) || null;
            if (this.currentUser) {
                this.isAuthenticated = true;
            } else {
                this.currentUserId = null;
                localStorage.removeItem('gb-current-user-id');
            }
        }
    },
    
    save() {
        localStorage.setItem('gb-books', JSON.stringify(this.books));
        localStorage.setItem('gb-users', JSON.stringify(this.users));
        localStorage.setItem('gb-borrows', JSON.stringify(this.borrows));
        localStorage.setItem('gb-attendances', JSON.stringify(this.attendances));
        localStorage.setItem('gb-requests', JSON.stringify(this.requests));
        if (this.currentUserId) {
            localStorage.setItem('gb-current-user-id', this.currentUserId);
        } else {
            localStorage.removeItem('gb-current-user-id');
        }
    },

    getCurrentUser() {
        return this.currentUser;
    },

    setCurrentUserById(id: string | null) {
        if (!id) {
            this.currentUser = null;
            this.currentUserId = null;
            this.isAuthenticated = false;
            localStorage.removeItem('gb-current-user-id');
            return;
        }
        const user = this.users.find(u => u.id === id) || null;
        if (user) {
            this.currentUser = user;
            this.currentUserId = user.id;
            this.isAuthenticated = true;
            localStorage.setItem('gb-current-user-id', user.id);
        } else {
            this.currentUser = null;
            this.currentUserId = null;
            this.isAuthenticated = false;
            localStorage.removeItem('gb-current-user-id');
        }
    },
    
    seedData() {
        const now = new Date();
        const dateOffset = (days: number, hours = 0) => {
            const d = new Date();
            d.setDate(now.getDate() - days);
            d.setHours(d.getHours() - hours);
            return d.toISOString();
        };

        this.books = [
            { id: 'B1', entryDate: dateOffset(20), cote: 'DC-2026-01', title: 'Droit Constitutionnel', author: 'Jean-Claude Masclet', publisher: 'Dalloz', place: 'Paris', publishDate: '2020', quantity: 5, isbn: '978-2247209', category: 'Droit', status: 'Disponible' },
            { id: 'B2', entryDate: dateOffset(18), cote: 'EC-2026-02', title: 'Macroéconomie moderne', author: 'Gregory Mankiw', publisher: 'Dunod', place: 'Paris', publishDate: '2022', quantity: 3, isbn: '978-2807328', category: 'Économie', status: 'Emprunté' },
            { id: 'B3', entryDate: dateOffset(15), cote: 'SC-2026-03', title: 'Physique Quantique pour tous', author: 'Claude Cohen-Tannoudji', publisher: 'EDP Sciences', place: 'Paris', publishDate: '2018', quantity: 2, isbn: '978-2705682', category: 'Sciences', status: 'Disponible' },
            { id: 'B4', entryDate: dateOffset(12), cote: 'INF-2026-04', title: 'Algorithmique & Structures de Données', author: 'Thomas Cormen', publisher: 'Dunod', place: 'Paris', publishDate: '2021', quantity: 4, isbn: '978-2100814', category: 'Informatique', status: 'Disponible' },
            { id: 'B5', entryDate: dateOffset(10), cote: 'LIT-2026-05', title: 'L\'Enfant Noir', author: 'Camara Laye', publisher: 'Plon', place: 'Paris', publishDate: '1953', quantity: 8, isbn: '978-2266155', category: 'Littérature', status: 'Disponible' },
            { id: 'B6', entryDate: dateOffset(8), cote: 'HIS-2026-06', title: 'Histoire de la Guinée', author: 'Djibril Tamsir Niane', publisher: 'Présence Africaine', place: 'Dakar', publishDate: '1998', quantity: 3, isbn: '978-2708706', category: 'Histoire', status: 'Disponible' },
            { id: 'B7', entryDate: dateOffset(5), cote: 'MAT-2026-07', title: 'Algèbre Linéaire Fondamentale', author: 'Serge Lang', publisher: 'InterEditions', place: 'Paris', publishDate: '2015', quantity: 2, isbn: '978-2729600', category: 'Mathématiques', status: 'Disponible' },
            { id: 'B8', entryDate: dateOffset(2), cote: 'INF-2026-08', title: 'Introduction à l\'Intelligence Artificielle', author: 'Stuart Russell', publisher: 'Pearson', place: 'New York', publishDate: '2020', quantity: 1, isbn: '978-2326002', category: 'Informatique', status: 'Emprunté' }
        ];

        this.users = [
            { id: 'ADMIN1', fullname: 'Administrateur Principal', username: 'admin', role: 'Administrateur', telephone: '+224 600 00 00 00', registrationDate: dateOffset(200), isActive: true, photoUrl: 'https://ui-avatars.com/api/?name=Admin+Principal&background=002147&color=ffffff', registrationHistory: [{ date: dateOffset(200), type: 'Inscription' }] },
            { id: 'GEST1', fullname: 'Gestionnaire Accueil', username: 'gest', role: 'Gestionnaire', telephone: '+224 600 11 11 11', registrationDate: dateOffset(180), isActive: true, photoUrl: 'https://ui-avatars.com/api/?name=Gest+Accueil&background=2e7d32&color=ffffff', registrationHistory: [{ date: dateOffset(180), type: 'Inscription' }] },
            { id: 'U1', fullname: 'Mamadou Bah', username: 'mbah', matricule: 'ETUD-2023-01', faculty: 'FSAG', department: "Département d'Économie", role: 'Étudiant', licence: 'Licence 1', telephone: '+224 620 45 87 90', amount: '20 000 FG', registrationDate: dateOffset(120), isActive: true, photoUrl: 'https://ui-avatars.com/api/?name=Mamadou+Bah&background=002147&color=ffffff', registrationHistory: [{ date: dateOffset(120), type: 'Inscription' }] },
            { id: 'U2', fullname: 'Mariama Sylla', username: 'msylla', matricule: 'ETUD-2023-02', faculty: 'FSAG', department: "Département d'Administration Publique", role: 'Étudiant', licence: 'Licence 2', telephone: '+224 624 11 22 33', amount: '22 500 FG', registrationDate: dateOffset(90), isActive: true, photoUrl: 'https://ui-avatars.com/api/?name=Mariama+Sylla&background=545f72&color=ffffff', registrationHistory: [{ date: dateOffset(90), type: 'Inscription' }] },
            { id: 'U3', fullname: 'Dr. Ibrahima Diallo', username: 'idiallo', faculty: 'FST', department: "Département d'Informatique", role: 'Professeur', fonction: 'Enseignant-Chercheur', address: 'Campus Universitaire, Bâtiment C', telephone: '+224 622 99 88 77', registrationDate: dateOffset(150), isActive: true, photoUrl: 'https://ui-avatars.com/api/?name=Ibrahima+Diallo&background=0086d2&color=ffffff', registrationHistory: [{ date: dateOffset(150), type: 'Inscription' }] },
            { id: 'U4', fullname: 'Aminata Sow', username: 'asow', matricule: 'ETUD-2024-04', faculty: 'FST', department: "Département d'Informatique", role: 'Étudiant', licence: 'Licence 3', telephone: '+224 628 33 44 55', amount: '25 000 FG', registrationDate: dateOffset(60), isActive: true, photoUrl: 'https://ui-avatars.com/api/?name=Aminata+Sow&background=2e7d32&color=ffffff', registrationHistory: [{ date: dateOffset(60), type: 'Inscription' }, { date: dateOffset(2), type: 'Réinscription' }] },
            { id: 'U5', fullname: 'Alpha Baldé', username: 'abalde', matricule: 'ETUD-2024-05', faculty: 'FLSH', department: "Département d'Anglais", role: 'Étudiant', licence: 'Licence 2', telephone: '+224 621 55 66 77', amount: '20 000 FG', registrationDate: dateOffset(30), isActive: true, photoUrl: 'https://ui-avatars.com/api/?name=Alpha+Balde&background=e65100&color=ffffff', registrationHistory: [{ date: dateOffset(30), type: 'Inscription' }] },
            { id: 'U6', fullname: 'Prof. Fatoumata Barry', username: 'fbarry', faculty: 'FST', department: 'Département de Mathématiques', role: 'Professeur', fonction: 'Directrice de Département', address: 'Quartier Konkola, Labé', telephone: '+224 620 99 00 11', registrationDate: dateOffset(110), isActive: true, photoUrl: 'https://ui-avatars.com/api/?name=Fatoumata+Barry&background=6a1b9a&color=ffffff', registrationHistory: [{ date: dateOffset(110), type: 'Inscription' }] },
            { id: 'U7', fullname: 'Mamadou Alimou Diallo', username: 'adiallo', matricule: 'ETUD-2025-07', faculty: 'FST', department: 'Département MIAGE', role: 'Étudiant', licence: 'Licence 1', telephone: '+224 625 77 88 99', amount: '25 000 FG', registrationDate: dateOffset(10), isActive: true, photoUrl: 'https://ui-avatars.com/api/?name=Mamadou+Alimou+Diallo&background=002147&color=ffffff', registrationHistory: [{ date: dateOffset(10), type: 'Inscription' }] }
        ];

        this.borrows = [
            { id: 'BR1', bookId: 'B2', userId: 'U1', borrowDate: dateOffset(15), expectedReturnDate: dateOffset(5), status: 'En retard', caution: 'Carte d\'étudiant' },
            { id: 'BR2', bookId: 'B1', userId: 'U2', borrowDate: dateOffset(12), expectedReturnDate: dateOffset(2), actualReturnDate: dateOffset(3), status: 'Retourné', caution: 'Carte d\'identité' },
            { id: 'BR3', bookId: 'B4', userId: 'U4', borrowDate: dateOffset(8), expectedReturnDate: dateOffset(2), actualReturnDate: dateOffset(2), status: 'Retourné', caution: 'Carte d\'étudiant' },
            { id: 'BR4', bookId: 'B5', userId: 'U5', borrowDate: dateOffset(6), expectedReturnDate: dateOffset(4), actualReturnDate: dateOffset(4), status: 'Retourné', caution: 'Tuteur académique' },
            { id: 'BR5', bookId: 'B3', userId: 'U3', borrowDate: dateOffset(5), expectedReturnDate: dateOffset(15), status: 'En cours', caution: 'Dépôt de garantie' },
            { id: 'BR6', bookId: 'B8', userId: 'U7', borrowDate: dateOffset(1), expectedReturnDate: dateOffset(10), status: 'En cours', caution: 'Carte d\'étudiant' }
        ];

        this.attendances = [
            // Today's attendances
            { id: 'A1', userId: 'U1', timeIn: dateOffset(0, 9), timeOut: dateOffset(0, 7), status: 'Terminé' },
            { id: 'A2', userId: 'U2', timeIn: dateOffset(0, 8), status: 'Présent' },
            { id: 'A3', userId: 'U4', timeIn: dateOffset(0, 6), timeOut: dateOffset(0, 4), status: 'Terminé' },
            { id: 'A4', userId: 'U5', timeIn: dateOffset(0, 5), status: 'Présent' },
            { id: 'A5', userId: 'U3', timeIn: dateOffset(0, 4), timeOut: dateOffset(0, 2), status: 'Terminé' },
            { id: 'A6', userId: 'U7', timeIn: dateOffset(0, 2), status: 'Présent' },
            // Previous days' attendances (last 7 days)
            { id: 'A7', userId: 'U2', timeIn: dateOffset(1, 4), timeOut: dateOffset(1, 2), status: 'Terminé' },
            { id: 'A8', userId: 'U5', timeIn: dateOffset(1, 5), timeOut: dateOffset(1, 1), status: 'Terminé' },
            { id: 'A9', userId: 'U1', timeIn: dateOffset(2, 6), timeOut: dateOffset(2, 3), status: 'Terminé' },
            { id: 'A10', userId: 'U4', timeIn: dateOffset(2, 8), timeOut: dateOffset(2, 4), status: 'Terminé' },
            { id: 'A11', userId: 'U3', timeIn: dateOffset(3, 3), timeOut: dateOffset(3, 1), status: 'Terminé' },
            { id: 'A12', userId: 'U7', timeIn: dateOffset(3, 5), timeOut: dateOffset(3, 2), status: 'Terminé' },
            { id: 'A13', userId: 'U5', timeIn: dateOffset(4, 7), timeOut: dateOffset(4, 5), status: 'Terminé' },
            { id: 'A14', userId: 'U2', timeIn: dateOffset(4, 2), timeOut: dateOffset(4, 1), status: 'Terminé' },
            { id: 'A15', userId: 'U4', timeIn: dateOffset(5, 6), timeOut: dateOffset(5, 3), status: 'Terminé' },
            { id: 'A16', userId: 'U1', timeIn: dateOffset(5, 8), timeOut: dateOffset(5, 5), status: 'Terminé' },
            { id: 'A17', userId: 'U3', timeIn: dateOffset(6, 4), timeOut: dateOffset(6, 2), status: 'Terminé' },
            { id: 'A18', userId: 'U7', timeIn: dateOffset(6, 7), timeOut: dateOffset(6, 4), status: 'Terminé' }
        ];

        this.requests = [
            { id: 'REQ1', fullname: 'Aissatou Barry', email: 'abarry@labe.gn', type: 'Inscription', date: dateOffset(3), status: 'En attente', message: 'Je souhaite m\'inscrire à la bibliothèque pour cette année universitaire afin d\'accéder aux livres d\'informatique.' },
            { id: 'REQ2', fullname: 'Ousmane Camara', email: 'ocamara@labe.gn', type: 'Emprunt', date: dateOffset(4), status: 'Acceptée', message: 'Demande de prolongation pour le livre Droit Constitutionnel.' },
            { id: 'REQ3', fullname: 'Fatimata Sow', email: 'fsow@labe.gn', type: 'Autre', date: dateOffset(5), status: 'Refusée', message: 'Est-il possible de réserver une salle de lecture pour un groupe d\'étude ?' },
            { id: 'REQ4', fullname: 'Thierno Diallo', email: 'tdiallo@labe.gn', type: 'Renouvellement', date: dateOffset(1), status: 'En attente', message: 'Je sollicite la réinscription et le renouvellement de ma carte de bibliothèque pour le semestre en cours.' },
            { id: 'REQ5', fullname: 'Maimouna Keita', email: 'mkeita@labe.gn', type: 'Inscription', date: dateOffset(2), status: 'En attente', message: 'Nouvelle inscription pour la faculté de Médecine. Pièce jointe transmise.' }
        ];
        this.generateQRs();
        this.save();
    },

    async generateQRs() {
        for (const user of this.users) {
            if (!user.qrCodeDataUrl) {
                user.qrCodeDataUrl = await QRCode.toDataURL(user.id);
            }
        }
        this.save();
    },

    // --- BOOKS ---
    addBook(data: Omit<Book, 'id'>) {
        const newBook = { ...data, id: 'B' + Date.now() };
        this.books.push(newBook);
        this.save();
        this.showToast('Livre ajouté avec succès');
        (window as any).navigate('books');
    },
    deleteBook(id: string) {
        this.books = this.books.filter(b => b.id !== id);
        this.save();
        this.showToast('Livre supprimé');
        (window as any).navigate('books');
    },
    
    // --- USERS ---
    async generateRichQRCode(user: any, id: string, now: string) {
        if (user.role === 'Étudiant') {
            const qrData = {
                id: id,
                nom: user.fullname,
                matricule: user.matricule || 'N/A',
                dept: user.department || 'N/A',
                niveau: user.licence || 'N/A',
                date: now
            };
            return await QRCode.toDataURL(JSON.stringify(qrData));
        } else {
            const qrData = {
                id: id,
                nom: user.fullname,
                matricule: user.matricule || 'N/A',
                dept: user.department || 'N/A',
                service: user.fonction || 'N/A',
                date: now
            };
            return await QRCode.toDataURL(JSON.stringify(qrData));
        }
    },

    async addUser(data: Omit<User, 'id' | 'qrCodeDataUrl'>, skipPostSaveNavigation = false) {
        const id = 'U' + Date.now();
        const now = new Date().toISOString();
        const qrCodeDataUrl = await this.generateRichQRCode(data, id, now);
        const newUser: User = { 
            ...data, 
            id, 
            qrCodeDataUrl,
            registrationDate: now,
            isActive: true,
            registrationHistory: [{ date: now, type: 'Inscription' }]
        };
        this.users.push(newUser);
        this.save();
        this.showToast('Utilisateur ajouté');
        if ((window as any).showUserCard) {
            (window as any).showUserCard(id);
        } else if (!skipPostSaveNavigation) {
            (window as any).navigate('students');
        }
    },
    deleteUser(id: string) {
        this.users = this.users.filter(u => u.id !== id);
        this.save();
        this.showToast('Utilisateur supprimé');
        (window as any).navigate('students');
    },
    async updateUser(id: string, data: Partial<User>) {
        const idx = this.users.findIndex(u => u.id === id);
        if (idx !== -1) {
            const now = new Date().toISOString();
            const user = this.users[idx];
            const history = user.registrationHistory || [];
            if ((data as any).isReinscription) {
                history.push({ date: now, type: 'Réinscription' });
                delete (data as any).isReinscription;
            }
            const updatedUser = { ...user, ...data, isActive: true, registrationHistory: history };
            updatedUser.qrCodeDataUrl = await this.generateRichQRCode(updatedUser, id, updatedUser.registrationDate || now);
            
            this.users[idx] = updatedUser;
            this.save();
            this.showToast('Opération effectuée avec succès');
            
            if ((window as any).showUserCard) {
                (window as any).showUserCard(id);
            } else {
                (window as any).navigate('students');
            }
        }
    },

    // --- BORROWS ---
    addBorrow(bookId: string, userId: string, days: number, caution: string) {
        const book = this.books.find(b => b.id === bookId);
        if (!book || book.status !== 'Disponible') {
            this.showToast('Livre non disponible');
            return;
        }
        
        book.status = 'Emprunté';
        const borrowDate = new Date().toISOString();
        const expectedReturnDate = new Date(Date.now() + 86400000 * days).toISOString();
        
        this.borrows.push({
            id: 'BR' + Date.now(),
            bookId,
            userId,
            borrowDate,
            expectedReturnDate,
            status: 'En cours',
            caution
        });
        
        this.save();
        this.showToast('Emprunt enregistré');
        (window as any).navigate('attendance');
    },
    returnBorrow(borrowId: string) {
        const borrow = this.borrows.find(b => b.id === borrowId);
        if (borrow) {
            borrow.status = 'Retourné';
            borrow.actualReturnDate = new Date().toISOString();
            const book = this.books.find(b => b.id === borrow.bookId);
            if (book) book.status = 'Disponible';
            this.save();
            this.showToast('Retour enregistré');
            (window as any).navigate('attendance');
        }
    },

    // --- ATTENDANCE ---
    recordAttendance(userId: string) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            this.showToast('Utilisateur introuvable');
            return;
        }
        
        // check if already active (present)
        let active = this.attendances.find(a => a.userId === userId && a.status === 'Présent');
        const now = new Date();
        if (active) {
            // Mark exit
            active.status = 'Terminé';
            active.timeOut = now.toISOString();
            this.showToast('Sortie enregistrée pour ' + user.fullname);
        } else {
            // Determine session and tardiness thresholds
            const isMorning = now.getHours() < 12;
            const morningThreshold = new Date(now);
            morningThreshold.setHours(9, 30, 0, 0);
            const afternoonThreshold = new Date(now);
            afternoonThreshold.setHours(14, 30, 0, 0);

            const isRetard = isMorning ? now >= morningThreshold : now >= afternoonThreshold;

            this.attendances.push({
                id: 'A' + Date.now(),
                userId,
                timeIn: now.toISOString(),
                status: 'Présent',
                isRetard,
                session: isMorning ? 'matin' : 'apresmidi'
            });
            this.showToast('Entrée enregistrée pour ' + user.fullname + (isRetard ? ' (Retard)' : ''));
        }
        this.save();
        (window as any).navigate('presences');
    },
    
    // --- EXPORTS ---
    exportPDF(type: 'users' | 'books' | 'borrows' | 'attendances') {
        const doc = new jsPDF();
        let head: string[][] = [];
        let body: string[][] = [];
        let title = '';
        
        if (type === 'users') {
            title = 'Liste des Inscriptions et Reinscriptions';
            head = [['ID', 'Nom Complet', 'Département', 'Rôle']];
            body = this.users.map(u => [u.id, u.fullname, u.department, u.role]);
        } else if (type === 'books') {
            title = 'Catalogage des Livres';
            head = [["Date d'entrée", 'Cotes', 'Titre du document', 'Auteur', 'Editeur', 'Lieu', "Date d'édition", "Nombre d'exemplaire", 'ISBN/ISSN', 'Statut']];
            body = this.books.map(b => [
                b.entryDate || 'N/A',
                b.cote || 'N/A',
                b.title || 'N/A',
                b.author || 'N/A',
                b.publisher || 'N/A',
                b.place || 'N/A',
                b.publishDate || 'N/A',
                String(b.quantity || 0),
                b.isbn || 'N/A',
                b.status || 'N/A'
            ]);
        } else if (type === 'borrows') {
            title = 'Historique des Emprunts';
            head = [['Livre', 'Utilisateur', 'Date Emprunt', 'Statut']];
            body = this.borrows.map(br => {
                const b = this.books.find(x => x.id === br.bookId)?.title || 'Inconnu';
                const u = this.users.find(x => x.id === br.userId)?.fullname || 'Inconnu';
                return [b, u, new Date(br.borrowDate).toLocaleDateString(), br.status];
            });
        } else if (type === 'attendances') {
            title = 'Journal des Presences';
            head = [['Nom', 'Role', 'Heure Entree', 'Heure Sortie', 'Statut']];
            body = this.attendances.map(a => {
                const u = this.users.find(x => x.id === a.userId);
                return [
                    u ? u.fullname : 'Inconnu',
                    u ? u.role : 'N/A',
                    new Date(a.timeIn).toLocaleString(),
                    a.timeOut ? new Date(a.timeOut).toLocaleString() : 'N/A',
                    a.status
                ];
            });
        }
        
        doc.text(title, 14, 15);
        autoTable(doc, { head, body, startY: 20 });
        doc.save(title + '.pdf');
        this.showToast('PDF généré avec succès');
    },
    
    exportExcel(type: 'users' | 'books' | 'borrows' | 'attendances') {
        let data: any[] = [];
        let title = '';
        if (type === 'users') {
            title = 'Inscriptions_et_Reinscriptions';
            data = this.users;
        } else if (type === 'books') {
            title = 'Catalogage';
            data = this.books.map(b => ({
                "Date d'entrée": b.entryDate || 'N/A',
                "Cotes": b.cote || 'N/A',
                "Titre du document": b.title || 'N/A',
                "Auteur": b.author || 'N/A',
                "Editeur": b.publisher || 'N/A',
                "Lieu": b.place || 'N/A',
                "Date d'édition": b.publishDate || 'N/A',
                "Nombre d'exemplaire": b.quantity || 0,
                "ISBN/ISSN": b.isbn || 'N/A',
                "Statut": b.status || 'N/A'
            }));
        } else if (type === 'borrows') {
            title = 'Emprunts';
            data = this.borrows;
        } else if (type === 'attendances') {
            title = 'Presences';
            data = this.attendances.map(a => {
                const u = this.users.find(x => x.id === a.userId);
                return {
                    "Nom & Prénom": u ? u.fullname : 'Inconnu',
                    "Rôle": u ? u.role : 'N/A',
                    "Heure d'entrée": new Date(a.timeIn).toLocaleString(),
                    "Heure de sortie": a.timeOut ? new Date(a.timeOut).toLocaleString() : 'N/A',
                    "Statut": a.status
                };
            });
        }
        
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, title);
        XLSX.writeFile(wb, title + '.xlsx');
        this.showToast('Excel généré avec succès');
    },

    // --- UI HELPERS ---
    showToast(msg: string, timeout = 3000) {
        let toast = document.getElementById('app-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'app-toast';
            toast.className = 'fixed bottom-8 right-8 bg-primary text-on-primary rounded px-4 py-2 transition-all transform duration-300 opacity-0 translate-y-2 z-50';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.remove('opacity-0', 'translate-y-2');
        setTimeout(() => toast?.classList.add('opacity-0', 'translate-y-2'), timeout);
    },
    
    // --- CHARTS & SCANNER ---
    initDashboardCharts() {
        if (this.dashboardCharts) {
            Object.values(this.dashboardCharts).forEach((chart: any) => {
                if (chart) chart.destroy();
            });
        }
        this.dashboardCharts = {};

        const getCtx = (id: string) => document.getElementById(id) as HTMLCanvasElement;

        // Chart 1: Fréquentation de la Bibliothèque (Line Chart)
        const ctxAttendance = getCtx('chartAttendance');
        if (ctxAttendance && typeof Chart !== 'undefined') {
            const daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
            const labels = [];
            const dataIn = [];
            const dataOut = [];

            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                labels.push(daysOfWeek[d.getDay()]);

                const dateStr = d.toISOString().split('T')[0];
                const entries = this.attendances.filter(a => a.timeIn && a.timeIn.startsWith(dateStr)).length;
                const exits = this.attendances.filter(a => a.timeOut && a.timeOut.startsWith(dateStr)).length;
                dataIn.push(entries);
                dataOut.push(exits);
            }

            this.dashboardCharts.attendance = new Chart(ctxAttendance, {
                type: 'line',
                data: {
                    labels,
                    datasets: [
                        {
                            label: 'Entrées',
                            data: dataIn,
                            borderColor: '#002147',
                            backgroundColor: 'rgba(0, 33, 71, 0.08)',
                            borderWidth: 3,
                            tension: 0.4,
                            fill: true,
                            pointBackgroundColor: '#002147',
                            pointRadius: 4
                        },
                        {
                            label: 'Sorties',
                            data: dataOut,
                            borderColor: '#708ab5',
                            backgroundColor: 'rgba(112, 138, 181, 0.03)',
                            borderWidth: 2,
                            tension: 0.4,
                            fill: true,
                            pointBackgroundColor: '#708ab5',
                            pointRadius: 3,
                            borderDash: [5, 5]
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'top', labels: { boxWidth: 12, font: { family: 'Inter', size: 10, weight: 'bold' } } }
                    },
                    scales: {
                        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { stepSize: 1 } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }

        // Chart 2: Évolution des Inscriptions (Area Chart)
        const ctxRegistrations = getCtx('chartRegistrations');
        if (ctxRegistrations && typeof Chart !== 'undefined') {
            const monthsList = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Déc'];
            const labels = [];
            const dataReg = [];
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            for (let i = 5; i >= 0; i--) {
                const d = new Date(currentYear, currentMonth - i, 1);
                labels.push(monthsList[d.getMonth()]);

                const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
                const count = this.users.filter(u => {
                    const regDate = u.registrationDate ? new Date(u.registrationDate) : new Date();
                    return regDate <= endOfMonth;
                }).length;
                dataReg.push(count);
            }

            this.dashboardCharts.registrations = new Chart(ctxRegistrations, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: 'Total Inscrits',
                        data: dataReg,
                        borderColor: '#2e7d32',
                        backgroundColor: 'rgba(46, 125, 50, 0.08)',
                        borderWidth: 3,
                        tension: 0.35,
                        fill: true,
                        pointBackgroundColor: '#2e7d32',
                        pointRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { stepSize: 2 } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }

        // Chart 3: Répartition de la Communauté par Rôle (Doughnut Chart)
        const ctxUserDistribution = getCtx('chartUserDistribution');
        if (ctxUserDistribution && typeof Chart !== 'undefined') {
            const studentCount = this.users.filter(u => u.role === 'Étudiant').length;
            const professorCount = this.users.filter(u => u.role === 'Professeur').length;

            this.dashboardCharts.userDistribution = new Chart(ctxUserDistribution, {
                type: 'doughnut',
                data: {
                    labels: ['Étudiants', 'Professeurs'],
                    datasets: [{
                        data: [studentCount, professorCount],
                        backgroundColor: ['#002147', '#708ab5'],
                        borderWidth: 2,
                        hoverOffset: 6
                    }]
                },
                options: {
                    cutout: '70%',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 10, font: { family: 'Inter', size: 10, weight: 'bold' } } }
                    }
                }
            });
        }

        // Chart 4: Flux des Emprunts & Retours (Bar Chart - Grouped)
        const ctxBorrowsReturns = getCtx('chartBorrowsReturns');
        if (ctxBorrowsReturns && typeof Chart !== 'undefined') {
            const monthsList = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Déc'];
            const labels = [];
            const borrowsData = [];
            const returnsData = [];
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            for (let i = 5; i >= 0; i--) {
                const d = new Date(currentYear, currentMonth - i, 1);
                labels.push(monthsList[d.getMonth()]);

                const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
                const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

                const countBorrows = this.borrows.filter(b => {
                    const bDate = new Date(b.borrowDate);
                    return bDate >= startOfMonth && bDate <= endOfMonth;
                }).length;

                const countReturns = this.borrows.filter(b => {
                    if (!b.actualReturnDate) return false;
                    const rDate = new Date(b.actualReturnDate);
                    return rDate >= startOfMonth && rDate <= endOfMonth;
                }).length;

                borrowsData.push(countBorrows);
                returnsData.push(countReturns);
            }

            this.dashboardCharts.borrowsReturns = new Chart(ctxBorrowsReturns, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [
                        {
                            label: 'Emprunts',
                            data: borrowsData,
                            backgroundColor: '#e65100',
                            borderRadius: 4
                        },
                        {
                            label: 'Retours',
                            data: returnsData,
                            backgroundColor: '#2e7d32',
                            borderRadius: 4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'top', labels: { boxWidth: 12, font: { family: 'Inter', size: 10, weight: 'bold' } } }
                    },
                    scales: {
                        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { stepSize: 1 } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }

        // Chart 5: Statistiques Journalières (Hourly entries) (Bar Chart)
        const ctxHourlyDensity = getCtx('chartHourlyDensity');
        if (ctxHourlyDensity && typeof Chart !== 'undefined') {
            const labels = ['08h-10h', '10h-12h', '12h-14h', '14h-16h', '16h-18h', '18h-20h'];
            const hourlyData = [0, 0, 0, 0, 0, 0];
            const todayStr = new Date().toISOString().split('T')[0];

            this.attendances.forEach(a => {
                if (a.timeIn && a.timeIn.startsWith(todayStr)) {
                    const hour = new Date(a.timeIn).getHours();
                    if (hour >= 8 && hour < 10) hourlyData[0]++;
                    else if (hour >= 10 && hour < 12) hourlyData[1]++;
                    else if (hour >= 12 && hour < 14) hourlyData[2]++;
                    else if (hour >= 14 && hour < 16) hourlyData[3]++;
                    else if (hour >= 16 && hour < 18) hourlyData[4]++;
                    else if (hour >= 18 && hour < 20) hourlyData[5]++;
                }
            });

            this.dashboardCharts.hourlyDensity = new Chart(ctxHourlyDensity, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Visiteurs',
                        data: hourlyData,
                        backgroundColor: '#6a1b9a',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { stepSize: 1 } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }
    },

    initScanner() {
        if (this.scanner) {
            this.scanner.clear();
        }
        const qrElement = document.getElementById('qr-reader');
        if (!qrElement) return;
        
        this.scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: {width: 250, height: 250} }, false);
        this.scanner.render((decodedText: string) => {
            if (this.scanner) {
                this.scanner.clear();
                this.recordAttendance(decodedText);
            }
        }, (errorMessage: string) => {
            // ignore constant read errors
        });
    },

    // --- AUTHENTICATION ---
    getDefaultRouteForRole(role: string) {
        if (role === 'Étudiant') return 'dashboard-etudiant';
        if (role === 'Professeur') return 'dashboard-professeur';
        if (role === 'Gestionnaire') return 'dashboard-gestionnaire';
        return 'dashboard';
    },

    getRoleFromInput(input: string) {
        const cleaned = String(input || '').trim().toLowerCase();
        const normalizedMap: Record<string, string> = {
            admin: 'Administrateur',
            administrateur: 'Administrateur',
            gest: 'Gestionnaire',
            gestionnaire: 'Gestionnaire',
            etudiant: 'Étudiant',
            étudiant: 'Étudiant',
            professeur: 'Professeur'
        };
        return normalizedMap[cleaned] || '';
    },

    getDemoUserForRole(role: string) {
        const canonicalRole = this.getRoleFromInput(role) || String(role || '').trim();
        const demoUsernames: Record<string, string> = {
            'Administrateur': 'admin',
            'Gestionnaire': 'gest',
            'Étudiant': 'mbah',
            'Professeur': 'idiallo'
        };
        const username = demoUsernames[canonicalRole];
        if (username) {
            return this.users.find(u => u.username === username) || null;
        }
        return this.users.find(u => String(u.role || '').trim() === canonicalRole) || null;
    },

    loginAsRole(role: string) {
        const canonicalRole = this.getRoleFromInput(role) || String(role || '').trim();
        if (!canonicalRole) return false;
        const user = this.getDemoUserForRole(canonicalRole);
        if (!user) return false;
        this.setCurrentUserById(user.id);
        this.save();
        this.showToast(`Bienvenue, ${user.fullname}`);
        const route = this.getDefaultRouteForRole(user.role);
        (window as any).navigate(route);
        return true;
    },

    // Role-based allowed pages
    roleAllowedPages: {
        'Étudiant': ['dashboard-etudiant', 'profile', 'books', 'requests', 'presences', 'borrows'],
        'Professeur': ['dashboard-professeur', 'profile', 'books', 'requests', 'presences', 'borrows'],
        'Gestionnaire': ['dashboard-gestionnaire', 'students', 'reinscription', 'attendance', 'presences', 'borrows', 'profile'],
        'Administrateur': ['*']
    } as any,

    canAccess(page: string) {
        // public pages
        const publicPages = ['home', 'login', 'register'];
        if (publicPages.includes(page)) return true;

        if (!this.isAuthenticated) return false;

        const role = this.currentUser?.role || 'Administrateur';
        const allowed = this.roleAllowedPages[role];
        if (!allowed) return false;
        if (allowed.includes('*')) return true;
        return allowed.includes(page);
    },

    login(username: string) {
        const cleaned = String(username || '').trim();
        const user = this.users.find(u => u.username === cleaned || u.matricule === cleaned);
        if (user) {
            this.setCurrentUserById(user.id);
            this.save();
            this.showToast(`Bienvenue, ${user.fullname}`);

            const route = this.getDefaultRouteForRole(user.role);
            (window as any).navigate(route);
            return true;
        }
        const role = this.getRoleFromInput(cleaned);
        if (role) {
            return this.loginAsRole(role);
        }
        return false;
    },
    
    logout() {
        this.setCurrentUserById(null);
        (window as any).navigate('home');
        this.showToast('Déconnexion réussie');
    }
};

store.init();
(window as any).appStore = store;
