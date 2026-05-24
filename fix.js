const fs = require('fs');

let content = fs.readFileSync('src/screens.ts', 'utf-8');

const logicToPrepend = `
// ==========================================
// DYNAMIC FORMS & AUTH LOGIC (Global Scope)
// ==========================================
(window as any).doLogin = function() {
    const username = (document.getElementById('login-username') as HTMLInputElement)?.value?.trim();
    const errBox = document.getElementById('login-error');
    const errText = document.getElementById('login-error-text');
    if (!username) {
        if(errText) errText.innerText = 'Veuillez saisir votre identifiant.';
        if(errBox) errBox.classList.remove('hidden');
        return;
    }
    const ok = (window as any).appStore.login(username);
    if (!ok) {
        if(errText) errText.innerText = 'Identifiant introuvable. Vérifiez vos informations.';
        if(errBox) errBox.classList.remove('hidden');
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

(window as any).doRegister = function() {
    const errBox = document.getElementById('reg-error');
    const errText = document.getElementById('reg-error-text');
    const show = (msg: string) => {
        if(errText) errText.innerText = msg;
        if(errBox) errBox.classList.remove('hidden');
    };

    const fullname = (document.getElementById('reg-fullname') as HTMLInputElement)?.value?.trim();
    const username = (document.getElementById('reg-username') as HTMLInputElement)?.value?.trim();
    const selectedRole = (window as any).selectedRole;

    if (!fullname) return show('Le nom complet est requis.');
    if (!username) return show("L'identifiant est requis.");
    if (!selectedRole) return show('Veuillez sélectionner un type de compte.');

    const existing = (window as any).appStore.users.find((u: any) => u.username === username);
    if (existing) return show('Cet identifiant est déjà utilisé.');

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
        if (!address) return show('L\\'adresse est requise pour un professeur.');
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

    // Save user
    (window as any).appStore.addUser(userData);
    (window as any).appStore.showToast('Compte créé avec succès ! Redirection vers la connexion...');
    
    setTimeout(() => {
        if((window as any).navigate) (window as any).navigate('login');
    }, 500);
};
// ==========================================

`;

if (!content.includes('DYNAMIC FORMS & AUTH LOGIC')) {
    content = logicToPrepend + content;
}

// Ensure style display block overrides are correctly handled.
// Also Regex replacement.
// Removing old inline scripts from login and register templates:
const scriptRegex1 = /<script>\s*\(function\(\)\s*\{\s*window\.doLogin = function\(\)[\s\S]*?\}\)\(\);\s*<\/script>/g;
const scriptRegex2 = /<script>\s*\(function\(\)\{\s*let selectedRole = '';[\s\S]*?\}\)\(\);\s*<\/script>/g;
const scriptRegex3 = /<script>\s*\(function\(\)\{\s*\/\/ Departments handled as free-text[\s\S]*?\}\)\(\);\s*<\/script>/g;

content = content.replace(scriptRegex1, '');
content = content.replace(scriptRegex2, '');
content = content.replace(scriptRegex3, '');

// Ensure elements have style="display: none;" default:
const fields = ['student-tel-field', 'student-dept-field', 'student-licence-field', 'prof-matricule-field', 'prof-dept-field', 'prof-service-field', 'prof-fonction-field', 'prof-address-field', 'manager-fonction-field', 'manager-service-field', 'manager-tel-field'];
fields.forEach(f => {
    // some might be <div id="X" class="hidden">
    content = content.replace(new RegExp('<div id="' + f + '" class="hidden">', 'g'), '<div id="' + f + '" class="hidden" style="display: none;">');
});

fs.writeFileSync('src/screens.ts', content, 'utf-8');
console.log("Fixed screens.ts successfully");
