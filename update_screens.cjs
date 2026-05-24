const fs = require('fs');

const replacement = `    students: () => {
        const { users } = (window as any).appStore || { users: [] };
        
        if (!(window as any).initStudentsUI) {
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

            (window as any).handleRoleChange = (role: string) => {
                document.getElementById('roleInput')!.setAttribute('value', role);
                document.getElementById('btnRoleStudent')!.className = role === 'Étudiant' 
                    ? 'flex-1 py-2 bg-primary text-white text-sm font-bold rounded-l-lg shadow-inner transition-colors' 
                    : 'flex-1 py-2 bg-surface text-on-surface text-sm font-bold rounded-l-lg border border-outline-variant hover:bg-surface-container transition-colors';
                document.getElementById('btnRoleProf')!.className = role === 'Professeur' 
                    ? 'flex-1 py-2 bg-primary text-white text-sm font-bold rounded-r-lg shadow-inner transition-colors' 
                    : 'flex-1 py-2 bg-surface text-on-surface text-sm font-bold rounded-r-lg border border-outline-variant hover:bg-surface-container transition-colors';
                
                const matriculeContainer = document.getElementById('matriculeContainer');
                const matriculeInput = document.getElementById('matriculeInput') as HTMLInputElement;
                if (role === 'Étudiant') {
                    matriculeContainer?.classList.remove('hidden');
                    matriculeInput.required = true;
                } else {
                    matriculeContainer?.classList.add('hidden');
                    matriculeInput.required = false;
                    matriculeInput.value = '';
                }
            };

            (window as any).switchFormMode = (mode: string) => {
                const tabIns = document.getElementById('tabInscription')!;
                const tabReins = document.getElementById('tabReinscription')!;
                const reSearch = document.getElementById('reRegistrationSearch')!;
                const submitBtn = document.getElementById('submitBtn')!;
                
                (window as any).cancelEdit(); // Reset everything
                
                if (mode === 'inscription') {
                    tabIns.className = 'flex-1 py-3.5 text-[13px] font-bold bg-surface-container-lowest text-primary border-b-2 border-primary transition-colors flex justify-center items-center gap-2';
                    tabReins.className = 'flex-1 py-3.5 text-[13px] font-bold bg-surface-container-lowest text-on-surface-variant border-b-2 border-transparent hover:text-primary transition-colors flex justify-center items-center gap-2';
                    reSearch.classList.add('hidden');
                    submitBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">person_add</span> Enregistrer l\\'inscription';
                    (document.getElementById('isReinscriptionInput') as HTMLInputElement).value = 'false';
                } else {
                    tabReins.className = 'flex-1 py-3.5 text-[13px] font-bold bg-surface-container-lowest text-primary border-b-2 border-primary transition-colors flex justify-center items-center gap-2';
                    tabIns.className = 'flex-1 py-3.5 text-[13px] font-bold bg-surface-container-lowest text-on-surface-variant border-b-2 border-transparent hover:text-primary transition-colors flex justify-center items-center gap-2';
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
                        const defaultPhoto = \`https://ui-avatars.com/api/?name=\${encodeURIComponent(u.fullname || '')}&background=random\`;
                        return \`
                            <div onclick="window.selectForReRegistration('\${u.id}')" class="flex items-center gap-3 p-3 hover:bg-surface-container cursor-pointer border-b border-outline-variant/30 last:border-0">
                                <img src="\${u.photoUrl || defaultPhoto}" class="w-8 h-8 rounded-full object-cover shadow-sm" />
                                <div>
                                    <div class="text-sm font-bold text-on-surface">\${u.fullname} <span class="text-[10px] text-on-surface-variant font-normal">(@\${u.username})</span></div>
                                    <div class="text-[10px] text-primary font-bold uppercase tracking-wider">\${u.role} \${u.matricule ? ' - ' + u.matricule : ''}</div>
                                </div>
                            </div>
                        \`;
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
                    // It's a simple edit from the table, not a re-registration tab context
                    document.getElementById('tabInscription')!.className = 'flex-1 py-3.5 text-[13px] font-bold bg-surface-container-lowest text-primary border-b-2 border-primary transition-colors flex justify-center items-center gap-2';
                    document.getElementById('tabReinscription')!.className = 'flex-1 py-3.5 text-[13px] font-bold bg-surface-container-lowest text-on-surface-variant border-b-2 border-transparent hover:text-primary transition-colors flex justify-center items-center gap-2';
                    document.getElementById('reRegistrationSearch')!.classList.add('hidden');
                    document.getElementById('submitBtn')!.innerHTML = '<span class="material-symbols-outlined text-[18px]">update</span> Mettre à jour';
                    document.getElementById('tabInscription')!.innerHTML = '<span class="material-symbols-outlined text-[18px]">edit</span> Modification Rapide';
                } else {
                    document.getElementById('submitBtn')!.innerHTML = '<span class="material-symbols-outlined text-[18px]">update</span> Valider la réinscription';
                    document.getElementById('tabInscription')!.innerHTML = '<span class="material-symbols-outlined text-[18px]">person_add</span> Nouvelle Inscription';
                }
                
                (document.getElementById('fullnameInput') as HTMLInputElement).value = user.fullname || '';
                (document.getElementById('usernameInput') as HTMLInputElement).value = user.username || '';
                (document.getElementById('departmentInput') as HTMLInputElement).value = user.department || '';
                (document.getElementById('matriculeInput') as HTMLInputElement).value = user.matricule || '';
                
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

            (window as any).cancelEdit = () => {
                document.getElementById('userIdInput')!.setAttribute('value', '');
                (document.getElementById('isReinscriptionInput') as HTMLInputElement).value = 'false';
                (document.getElementById('userForm') as HTMLFormElement).reset();
                document.getElementById('tabInscription')!.innerHTML = '<span class="material-symbols-outlined text-[18px]">person_add</span> Nouvelle Inscription';
                
                document.getElementById('photoPreview')!.classList.add('hidden');
                document.getElementById('photoPlaceholder')!.classList.remove('hidden');
                (document.getElementById('photoUrlInput') as HTMLInputElement).value = '';
                
                (window as any).handleRoleChange('Étudiant');
                
                // If we are on Reinscription tab, keep the right button
                const isReinsTab = !document.getElementById('reRegistrationSearch')!.classList.contains('hidden');
                if (isReinsTab) {
                    document.getElementById('submitBtn')!.innerHTML = '<span class="material-symbols-outlined text-[18px]">update</span> Valider la réinscription';
                    (document.getElementById('isReinscriptionInput') as HTMLInputElement).value = 'true';
                } else {
                    document.getElementById('submitBtn')!.innerHTML = '<span class="material-symbols-outlined text-[18px]">person_add</span> Enregistrer l\\'inscription';
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
                    department: fd.get('department') as string,
                    matricule: fd.get('matricule') as string || undefined,
                    photoUrl: fd.get('photoUrl') as string || undefined,
                };
                
                // Clean undefined strings
                if (data.matricule === 'undefined' || data.matricule === '') data.matricule = undefined;
                if (data.photoUrl === 'undefined' || data.photoUrl === '') data.photoUrl = undefined;
                
                if (id) {
                    if (isReins) {
                        data.isReinscription = true;
                    }
                    (window as any).appStore.updateUser(id, data);
                } else {
                    (window as any).appStore.addUser(data);
                }
            };
            
            (window as any).filterUsers = () => {
                const search = (document.getElementById('searchUser') as HTMLInputElement).value.toLowerCase();
                const role = (document.getElementById('filterRole') as HTMLSelectElement).value;
                
                const rows = document.querySelectorAll('.user-row');
                let count = 0;
                rows.forEach((row: any) => {
                    const rowName = row.getAttribute('data-name').toLowerCase();
                    const rowRole = row.getAttribute('data-role');
                    const rowMatricule = row.getAttribute('data-matricule').toLowerCase();
                    
                    const matchSearch = rowName.includes(search) || rowMatricule.includes(search);
                    const matchRole = role === 'all' || rowRole === role;
                    
                    if (matchSearch && matchRole) {
                        row.classList.remove('hidden');
                        count++;
                    } else {
                        row.classList.add('hidden');
                    }
                });
                
                document.getElementById('usersCount')!.innerText = count + ' inscrit' + (count > 1 ? 's' : '');
            };
            
            (window as any).initStudentsUI = true;
        }

        const renderUserCard = (u: any) => {
            const defaultPhoto = \`https://ui-avatars.com/api/?name=\${encodeURIComponent(u.fullname || '')}&background=random\`;
            const photo = u.photoUrl || defaultPhoto;
            
            const historyText = u.registrationHistory && u.registrationHistory.length > 1 
                ? \`<div class="text-[9px] text-on-surface-variant font-medium mt-1"><span class="material-symbols-outlined text-[10px] align-middle text-primary">history</span> Réinscrit le \${new Date(u.registrationHistory[u.registrationHistory.length-1].date).toLocaleDateString()}</div>\`
                : \`<div class="text-[9px] text-on-surface-variant font-medium mt-1"><span class="material-symbols-outlined text-[10px] align-middle text-secondary">new_releases</span> Inscrit le \${u.registrationDate ? new Date(u.registrationDate).toLocaleDateString() : 'Inconnu'}</div>\`;
            
            return \`
            <tr class="user-row hover:bg-surface-container transition-colors text-sm border-b border-outline-variant/30" 
                data-name="\${u.fullname || ''}" 
                data-role="\${u.role || ''}" 
                data-matricule="\${u.matricule || ''}">
                <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                        <img src="\${photo}" class="w-10 h-10 rounded-full object-cover border border-outline-variant shadow-sm" loading="lazy" />
                        <div>
                            <div class="font-bold text-primary flex items-center gap-1">\${u.fullname || 'Inconnu'} \${u.isActive ? '<span class="w-2 h-2 rounded-full bg-green-500 shadow-sm" title="Actif"></span>' : ''}</div>
                            <div class="text-[10px] text-on-surface-variant">@\${u.username || 'n/a'}</div>
                            \${historyText}
                        </div>
                    </div>
                </td>
                <td class="px-4 py-3">
                    <span class="px-2 py-1 text-[10px] font-bold rounded-full \${u.role === 'Professeur' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'} border \${u.role === 'Professeur' ? 'border-secondary/20' : 'border-primary/20'}">
                        \${u.role}
                    </span>
                </td>
                <td class="px-4 py-3">
                    <div class="font-semibold text-on-surface">\${u.department || 'Non assigné'}</div>
                    \${u.matricule ? \`<div class="text-[10px] text-on-surface-variant uppercase tracking-wider">\${u.matricule}</div>\` : ''}
                </td>
                <td class="px-4 py-3 text-center">
                    \${u.qrCodeDataUrl ? \`<img src="\${u.qrCodeDataUrl}" class="h-10 w-10 mx-auto rounded border border-outline-variant shadow-sm hover:scale-150 transition-transform cursor-pointer" />\` : '<span class="text-[10px] text-on-surface-variant">Non généré</span>'}
                </td>
                <td class="px-4 py-3 text-right">
                    <div class="flex items-center justify-end gap-2">
                        <button onclick="window.editUser('\${u.id}')" class="w-8 h-8 rounded-full bg-surface text-primary border border-outline-variant hover:bg-primary/10 flex items-center justify-center transition-colors" title="Modifier">
                            <span class="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button onclick="if(confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) window.appStore.deleteUser('\${u.id}')" class="w-8 h-8 rounded-full bg-surface text-error border border-outline-variant hover:bg-error/10 flex items-center justify-center transition-colors" title="Supprimer">
                            <span class="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                    </div>
                </td>
            </tr>
            \`;
        };

        return \`
        <div class="flex min-h-screen bg-surface-container-lowest">
            \${getSidebar('students')}
            <main class="flex-grow ml-[260px]">
                \${getTopBar()}
                
                <div class="p-6">
                    <!-- Header -->
                    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                        <div>
                            <h2 class="text-2xl font-black text-primary tracking-tight">Inscription & Réinscription</h2>
                            <p class="text-sm text-on-surface-variant mt-1">Gérez les comptes étudiants et professeurs de la bibliothèque.</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="window.appStore.exportPDF('users')" class="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant rounded-lg text-sm font-bold text-on-surface hover:bg-surface-container transition-all shadow-sm">
                                <span class="material-symbols-outlined text-[18px]">picture_as_pdf</span> Exporter PDF
                            </button>
                            <button onclick="window.appStore.exportExcel('users')" class="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant rounded-lg text-sm font-bold text-on-surface hover:bg-surface-container transition-all shadow-sm">
                                <span class="material-symbols-outlined text-[18px]">table</span> Exporter Excel
                            </button>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        <!-- LEFT COLUMN: FORM -->
                        <div class="lg:col-span-4">
                            <div class="bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden sticky top-24">
                                
                                <!-- TABS -->
                                <div class="flex border-b border-outline-variant bg-surface-container-lowest">
                                    <button id="tabInscription" type="button" onclick="window.switchFormMode('inscription')" class="flex-1 py-3.5 text-[13px] font-bold bg-surface-container-lowest text-primary border-b-2 border-primary transition-colors flex justify-center items-center gap-2">
                                        <span class="material-symbols-outlined text-[18px]">person_add</span> Nouvelle Inscription
                                    </button>
                                    <button id="tabReinscription" type="button" onclick="window.switchFormMode('reinscription')" class="flex-1 py-3.5 text-[13px] font-bold bg-surface-container-lowest text-on-surface-variant border-b-2 border-transparent hover:text-primary transition-colors flex justify-center items-center gap-2">
                                        <span class="material-symbols-outlined text-[18px]">update</span> Réinscription
                                    </button>
                                </div>
                                
                                <div class="p-5">
                                    <div class="flex justify-end mb-2">
                                        <button id="cancelEditBtn" onclick="window.cancelEdit()" class="hidden text-[10px] uppercase font-bold text-error bg-error/10 px-2 py-1 rounded hover:bg-error/20 transition-colors">
                                            Annuler l'action
                                        </button>
                                    </div>
                                    
                                    <!-- Search for re-registration (hidden by default) -->
                                    <div id="reRegistrationSearch" class="hidden mb-6 relative">
                                        <label class="block text-xs font-bold text-on-surface-variant mb-2">Rechercher un utilisateur existant <span class="text-error">*</span></label>
                                        <div class="relative">
                                            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                                            <input type="text" id="searchReRegistration" onkeyup="window.handleReRegistrationSearch()" onfocus="window.handleReRegistrationSearch()" placeholder="Nom, matricule ou @pseudo..." class="w-full border border-outline-variant rounded-lg pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-primary/5 border-primary/30" />
                                        </div>
                                        <!-- Dropdown -->
                                        <div id="reRegistrationDropdown" class="absolute z-50 left-0 right-0 mt-1 bg-white border border-outline-variant rounded-lg shadow-xl max-h-48 overflow-y-auto hidden">
                                        </div>
                                    </div>

                                    <form id="userForm" onsubmit="window.handleUserSubmit(event)" class="space-y-5">
                                        <input type="hidden" name="userId" id="userIdInput" value="">
                                        <input type="hidden" name="role" id="roleInput" value="Étudiant">
                                        <input type="hidden" name="isReinscription" id="isReinscriptionInput" value="false">
                                        
                                        <!-- Role Toggle -->
                                        <div class="flex rounded-lg shadow-sm w-full">
                                            <button type="button" id="btnRoleStudent" onclick="window.handleRoleChange('Étudiant')" class="flex-1 py-2 bg-primary text-white text-sm font-bold rounded-l-lg shadow-inner transition-colors">
                                                Étudiant
                                            </button>
                                            <button type="button" id="btnRoleProf" onclick="window.handleRoleChange('Professeur')" class="flex-1 py-2 bg-surface text-on-surface text-sm font-bold rounded-r-lg border border-outline-variant hover:bg-surface-container transition-colors">
                                                Professeur
                                            </button>
                                        </div>
                                        
                                        <!-- Photo Upload -->
                                        <div>
                                            <label class="block text-xs font-bold text-on-surface-variant mb-2">Photo de profil (Optionnel)</label>
                                            <div class="flex items-center gap-4">
                                                <div class="w-14 h-14 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center overflow-hidden shadow-inner shrink-0" id="photoPreviewContainer">
                                                    <span class="material-symbols-outlined text-outline-variant text-2xl" id="photoPlaceholder">add_a_photo</span>
                                                    <img id="photoPreview" class="w-full h-full object-cover hidden" />
                                                </div>
                                                <div class="flex-1">
                                                    <input type="file" id="photoInput" accept="image/*" class="hidden" onchange="window.handlePhotoUpload(this)" />
                                                    <button type="button" onclick="document.getElementById('photoInput')!.click()" class="px-4 py-2 bg-white border border-outline-variant text-primary rounded-lg text-xs font-bold shadow-sm hover:bg-primary/5 transition-colors w-full flex justify-center items-center gap-2">
                                                        <span class="material-symbols-outlined text-[16px]">upload</span> Parcourir
                                                    </button>
                                                    <input type="hidden" name="photoUrl" id="photoUrlInput" />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Common Fields -->
                                        <div class="space-y-4">
                                            <div>
                                                <label class="block text-xs font-bold text-on-surface-variant mb-1">Nom complet <span class="text-error">*</span></label>
                                                <input type="text" name="fullname" id="fullnameInput" required placeholder="Ex: Mariama Sylla" class="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-surface-container-lowest" />
                                            </div>
                                            
                                            <div class="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label class="block text-xs font-bold text-on-surface-variant mb-1">Nom d'utilisateur <span class="text-error">*</span></label>
                                                    <input type="text" name="username" id="usernameInput" required placeholder="ex: msylla" class="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-surface-container-lowest" />
                                                </div>
                                                <div>
                                                    <label class="block text-xs font-bold text-on-surface-variant mb-1">Département <span class="text-error">*</span></label>
                                                    <input type="text" name="department" id="departmentInput" required placeholder="Ex: Économie" class="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-surface-container-lowest" />
                                                </div>
                                            </div>
                                            
                                            <div id="matriculeContainer">
                                                <label class="block text-xs font-bold text-on-surface-variant mb-1">Matricule <span class="text-error">*</span></label>
                                                <input type="text" name="matricule" id="matriculeInput" required placeholder="Ex: ETUD-2023-01" class="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-surface-container-lowest font-mono uppercase" />
                                            </div>
                                        </div>
                                        
                                        <button type="submit" id="submitBtn" class="w-full py-3 bg-primary text-white rounded-lg font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all mt-4 flex justify-center items-center gap-2">
                                            <span class="material-symbols-outlined text-[18px]">person_add</span> Enregistrer l'inscription
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                        
                        <!-- RIGHT COLUMN: LIST -->
                        <div class="lg:col-span-8 flex flex-col">
                            <div class="bg-white border border-outline-variant rounded-2xl shadow-sm flex-grow flex flex-col overflow-hidden">
                                
                                <!-- Toolbar -->
                                <div class="p-4 border-b border-outline-variant bg-surface-container-lowest flex flex-col sm:flex-row gap-4 justify-between items-center">
                                    <div class="flex items-center gap-2">
                                        <h3 class="font-bold">Base de données</h3>
                                        <span id="usersCount" class="bg-primary/10 text-primary text-[10px] px-2 py-1 rounded-full font-bold">
                                            \${users.length} inscrit(s)
                                        </span>
                                    </div>
                                    
                                    <div class="flex gap-2 w-full sm:w-auto">
                                        <div class="relative flex-grow sm:w-64">
                                            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                                            <input type="text" id="searchUser" onkeyup="window.filterUsers()" placeholder="Rechercher nom, matricule..." class="w-full border border-outline-variant rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white" />
                                        </div>
                                        <select id="filterRole" onchange="window.filterUsers()" class="border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none bg-white font-semibold">
                                            <option value="all">Tous les rôles</option>
                                            <option value="Étudiant">Étudiants</option>
                                            <option value="Professeur">Professeurs</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <!-- Table -->
                                <div class="overflow-x-auto flex-grow">
                                    <table class="w-full text-left text-sm whitespace-nowrap">
                                        <thead class="bg-surface-container-lowest border-b border-outline-variant text-[10px] uppercase tracking-wider text-on-surface-variant sticky top-0 z-10 shadow-sm">
                                            <tr>
                                                <th class="px-4 py-3 font-bold">Profil utilisateur</th>
                                                <th class="px-4 py-3 font-bold">Rôle</th>
                                                <th class="px-4 py-3 font-bold">Département & Matricule</th>
                                                <th class="px-4 py-3 font-bold text-center">Carte QR</th>
                                                <th class="px-4 py-3 font-bold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody id="usersTableBody" class="divide-y divide-outline-variant">
                                            \${users.length > 0 
                                                ? users.map((u: any) => renderUserCard(u)).join('')
                                                : '<tr><td colspan="5" class="p-8 text-center text-on-surface-variant"><div class="flex flex-col items-center gap-2"><span class="material-symbols-outlined text-4xl opacity-50">group_off</span><p>Aucun utilisateur inscrit</p></div></td></tr>'
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
        \`;
    },`;

let fileContent = fs.readFileSync('src/screens.ts', 'utf8');

const startIndex = fileContent.indexOf('    students: () => {');
const endIndex = fileContent.indexOf('    books: () => {');

if (startIndex !== -1 && endIndex !== -1) {
    const newContent = fileContent.substring(0, startIndex) + replacement + '\n' + fileContent.substring(endIndex);
    fs.writeFileSync('src/screens.ts', newContent, 'utf8');
    console.log("Successfully replaced the students function in screens.ts");
} else {
    console.error("Could not find the students or books function markers.");
}
