const fs = require('fs');
let file = fs.readFileSync('src/screens.ts', 'utf8');

// Replace the students: () => { ... } block
const newStudents = `students: () => {
        const { users } = window.appStore || { users: [] };
        return \\\`
        <div class="flex min-h-screen">
            \\\${getSidebar('students')}
            <main class="flex-grow ml-[260px]">
                \\\${getTopBar()}
                <div class="p-6 space-y-6">
                    <div class="flex items-center justify-between">
                        <h2 class="text-lg font-bold text-primary">Gestion des Utilisateurs</h2>
                        <div class="flex gap-2">
                            <button onclick="window.appStore.exportPDF('users')" class="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant rounded-lg text-sm font-bold text-on-surface hover:bg-surface transition-colors">
                                <span class="material-symbols-outlined text-sm">picture_as_pdf</span> PDF
                            </button>
                            <button onclick="window.appStore.exportExcel('users')" class="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant rounded-lg text-sm font-bold text-on-surface hover:bg-surface transition-colors">
                                <span class="material-symbols-outlined text-sm">table</span> Excel
                            </button>
                            <div class="relative group">
                                <button class="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold shadow-sm hover:opacity-90 transition-opacity">
                                    <span class="material-symbols-outlined text-sm">person_add</span> Créer un compte
                                </button>
                                <div class="absolute right-0 top-full mt-2 w-48 bg-white border border-outline-variant rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                                    <button onclick="document.getElementById('addStudentModal').classList.remove('hidden')" class="w-full text-left px-4 py-3 text-sm hover:bg-surface-container font-semibold border-b border-outline-variant">Étudiant</button>
                                    <button onclick="document.getElementById('addProfessorModal').classList.remove('hidden')" class="w-full text-left px-4 py-3 text-sm hover:bg-surface-container font-semibold border-b border-outline-variant">Professeur</button>
                                    <button onclick="document.getElementById('addLibrarianModal').classList.remove('hidden')" class="w-full text-left px-4 py-3 text-sm hover:bg-surface-container font-semibold">Bibliothécaire</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
                        <table class="w-full text-left text-sm whitespace-nowrap">
                            <thead class="bg-surface-container-lowest border-b border-outline-variant text-[11px] uppercase tracking-wider text-on-surface-variant">
                                <tr>
                                    <th class="px-6 py-4 font-bold">Identité</th>
                                    <th class="px-6 py-4 font-bold">Rôle</th>
                                    <th class="px-6 py-4 font-bold">Détails (Matricule / Dépt)</th>
                                    <th class="px-6 py-4 font-bold text-center">QR Code</th>
                                    <th class="px-6 py-4 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-outline-variant">
                                \\\${users.map((u:any) => renderUserRow(u)).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
        
        <!-- Modal Étudiant -->
        <div id="addStudentModal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center transition-all">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                <div class="bg-primary px-6 py-4 flex justify-between items-center">
                    <h3 class="text-lg font-bold text-white flex items-center gap-2"><span class="material-symbols-outlined">school</span> Nouvel Étudiant</h3>
                    <button onclick="document.getElementById('addStudentModal').classList.add('hidden')" class="text-white/80 hover:text-white"><span class="material-symbols-outlined">close</span></button>
                </div>
                <form onsubmit="event.preventDefault(); const fd = new FormData(this); window.appStore.addUser({role: 'Étudiant', fullname: fd.get('fullname'), username: fd.get('username'), matricule: fd.get('matricule'), department: fd.get('department'), photoUrl: fd.get('photoUrl')}); this.reset(); document.getElementById('addStudentModal').classList.add('hidden');" class="p-6 space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="col-span-2"><label class="block text-xs font-bold text-on-surface-variant mb-1">Nom complet</label><input name="fullname" required class="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" /></div>
                        <div><label class="block text-xs font-bold text-on-surface-variant mb-1">Nom d'utilisateur</label><input name="username" required class="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" /></div>
                        <div><label class="block text-xs font-bold text-on-surface-variant mb-1">Matricule</label><input name="matricule" required class="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" /></div>
                        <div class="col-span-2"><label class="block text-xs font-bold text-on-surface-variant mb-1">Département</label><input name="department" required class="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" /></div>
                        <div class="col-span-2"><label class="block text-xs font-bold text-on-surface-variant mb-1">URL Photo (optionnel)</label><input type="url" name="photoUrl" placeholder="https://..." class="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" /></div>
                    </div>
                    <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-outline-variant">
                        <button type="button" onclick="document.getElementById('addStudentModal').classList.add('hidden')" class="px-5 py-2.5 rounded-lg font-bold text-sm text-on-surface-variant hover:bg-surface-container transition-colors">Annuler</button>
                        <button type="submit" class="px-5 py-2.5 bg-primary text-white rounded-lg font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">Enregistrer</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Modal Professeur -->
        <div id="addProfessorModal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center transition-all">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                <div class="bg-secondary px-6 py-4 flex justify-between items-center">
                    <h3 class="text-lg font-bold text-white flex items-center gap-2"><span class="material-symbols-outlined">history_edu</span> Nouveau Professeur</h3>
                    <button onclick="document.getElementById('addProfessorModal').classList.add('hidden')" class="text-white/80 hover:text-white"><span class="material-symbols-outlined">close</span></button>
                </div>
                <form onsubmit="event.preventDefault(); const fd = new FormData(this); window.appStore.addUser({role: 'Professeur', fullname: fd.get('fullname'), username: fd.get('username'), department: fd.get('department'), photoUrl: fd.get('photoUrl')}); this.reset(); document.getElementById('addProfessorModal').classList.add('hidden');" class="p-6 space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="col-span-2"><label class="block text-xs font-bold text-on-surface-variant mb-1">Nom complet</label><input name="fullname" required class="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-secondary outline-none transition-all" /></div>
                        <div class="col-span-2"><label class="block text-xs font-bold text-on-surface-variant mb-1">Nom d'utilisateur</label><input name="username" required class="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-secondary outline-none transition-all" /></div>
                        <div class="col-span-2"><label class="block text-xs font-bold text-on-surface-variant mb-1">Département</label><input name="department" required class="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-secondary outline-none transition-all" /></div>
                        <div class="col-span-2"><label class="block text-xs font-bold text-on-surface-variant mb-1">URL Photo (optionnel)</label><input type="url" name="photoUrl" placeholder="https://..." class="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-secondary outline-none transition-all" /></div>
                    </div>
                    <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-outline-variant">
                        <button type="button" onclick="document.getElementById('addProfessorModal').classList.add('hidden')" class="px-5 py-2.5 rounded-lg font-bold text-sm text-on-surface-variant hover:bg-surface-container transition-colors">Annuler</button>
                        <button type="submit" class="px-5 py-2.5 bg-secondary text-white rounded-lg font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">Enregistrer</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Modal Bibliothécaire -->
        <div id="addLibrarianModal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center transition-all">
            <div class="bg-tertiary px-6 py-4 flex justify-between items-center">
                <h3 class="text-lg font-bold text-white flex items-center gap-2"><span class="material-symbols-outlined">badge</span> Nouveau Bibliothécaire</h3>
                <button onclick="document.getElementById('addLibrarianModal').classList.add('hidden')" class="text-white/80 hover:text-white"><span class="material-symbols-outlined">close</span></button>
            </div>
            <form onsubmit="event.preventDefault(); const fd = new FormData(this); window.appStore.addUser({role: 'Bibliothécaire', fullname: fd.get('fullname'), username: fd.get('username'), fonction: fd.get('fonction'), photoUrl: fd.get('photoUrl')}); this.reset(); document.getElementById('addLibrarianModal').classList.add('hidden');" class="bg-white p-6 space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div class="col-span-2"><label class="block text-xs font-bold text-on-surface-variant mb-1">Nom complet</label><input name="fullname" required class="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tertiary outline-none transition-all" /></div>
                    <div class="col-span-2"><label class="block text-xs font-bold text-on-surface-variant mb-1">Nom d'utilisateur</label><input name="username" required class="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tertiary outline-none transition-all" /></div>
                    <div class="col-span-2"><label class="block text-xs font-bold text-on-surface-variant mb-1">Fonction (ex: Guichet, Archives...)</label><input name="fonction" required class="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tertiary outline-none transition-all" /></div>
                    <div class="col-span-2"><label class="block text-xs font-bold text-on-surface-variant mb-1">URL Photo (optionnel)</label><input type="url" name="photoUrl" placeholder="https://..." class="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tertiary outline-none transition-all" /></div>
                </div>
                <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-outline-variant">
                    <button type="button" onclick="document.getElementById('addLibrarianModal').classList.add('hidden')" class="px-5 py-2.5 rounded-lg font-bold text-sm text-on-surface-variant hover:bg-surface-container transition-colors">Annuler</button>
                    <button type="submit" class="px-5 py-2.5 bg-tertiary text-white rounded-lg font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">Enregistrer</button>
                </div>
            </form>
        </div>
        \\\`;
    },`;

// Update students screen
file = file.replace(/students:\s*\(\)\s*=>\s*\{[\s\S]*?(?=books:\s*\(\)\s*=>)/, newStudents + '\n    ');

// Replace renderStudentRow with renderUserRow
const renderUserRow = `function renderUserRow(u: any) {
    const defaultPhoto = \`https://ui-avatars.com/api/?name=\${encodeURIComponent(u.fullname)}&background=random\`;
    const photo = u.photoUrl || defaultPhoto;
    
    let roleBadge = '';
    let details = '';
    
    if (u.role === 'Étudiant') {
        roleBadge = '<span class="px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-primary-container text-primary">Étudiant</span>';
        details = \`<div class="text-sm font-semibold">\${u.matricule || 'N/A'}</div><div class="text-[10px] text-on-surface-variant uppercase">\${u.department || 'N/A'}</div>\`;
    } else if (u.role === 'Professeur') {
        roleBadge = '<span class="px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-secondary-container text-secondary">Professeur</span>';
        details = \`<div class="text-sm font-semibold">\${u.department || 'N/A'}</div><div class="text-[10px] text-on-surface-variant uppercase">Département</div>\`;
    } else {
        roleBadge = '<span class="px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-tertiary-container text-tertiary">Bibliothécaire</span>';
        details = \`<div class="text-sm font-semibold">\${u.fonction || 'N/A'}</div><div class="text-[10px] text-on-surface-variant uppercase">Fonction</div>\`;
    }

    return \\\`
        <tr class="hover:bg-surface-container-lowest transition-colors group">
            <td class="px-6 py-4">
                <div class="flex items-center gap-4">
                    <img src="\\\${photo}" class="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" alt="\\\${u.fullname}" />
                    <div>
                        <div class="font-bold text-on-surface">\\\${u.fullname}</div>
                        <div class="text-[11px] text-on-surface-variant">@\\\${u.username}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">\\\${roleBadge}</td>
            <td class="px-6 py-4">\\\${details}</td>
            <td class="px-6 py-4 text-center">
               \\\${u.qrCodeDataUrl ? \\\`<img src="\\\${u.qrCodeDataUrl}" class="h-10 w-10 mx-auto rounded border border-outline-variant opacity-80 group-hover:opacity-100 transition-opacity" />\\\` : '<span class="text-[10px] text-on-surface-variant">Non généré</span>'}
            </td>
            <td class="px-6 py-4 text-right">
                <button onclick="if(confirm('Supprimer cet utilisateur ?')) window.appStore.deleteUser('\\\${u.id}')" class="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-error hover:text-white transition-colors">
                    <span class="material-symbols-outlined text-sm">delete</span>
                </button>
            </td>
        </tr>
    \\\`;
}`;

// We will remove the old renderStudentRow and inject renderUserRow
file = file.replace(/function renderStudentRow[\s\S]*?`\s*;\s*}/, renderUserRow);

fs.writeFileSync('src/screens.ts', file, 'utf8');
console.log('done');
