import fs from 'fs';

let content = fs.readFileSync('src/screens.ts', 'utf-8');

// 1. Remove "Identifiant" field from HTML
content = content.replace(
    /<!-- Common fields -->\s*<div class="grid grid-cols-2 gap-4">\s*<div>\s*<label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Nom complet \*<\/label>\s*<input id="reg-fullname" type="text" placeholder="Prénom Nom"\s*class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none" \/>\s*<\/div>\s*<div>\s*<label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Identifiant \*<\/label>\s*<input id="reg-username" type="text" placeholder="ex: jdupont"\s*class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none" \/>\s*<\/div>\s*<\/div>/,
    `<!-- Common fields -->
                    <div class="grid grid-cols-1 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Nom complet *</label>
                            <input id="reg-fullname" type="text" placeholder="Prénom Nom"
                                class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                        </div>
                    </div>`
);

// 2. Modify doRegister logic
// Replace the start of doRegister:
const oldDoRegisterStart = `    const fullname = (document.getElementById('reg-fullname') as HTMLInputElement)?.value?.trim();
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
    };`;

const newDoRegisterStart = `    const fullname = (document.getElementById('reg-fullname') as HTMLInputElement)?.value?.trim();
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
    };`;

content = content.replace(oldDoRegisterStart, newDoRegisterStart);

fs.writeFileSync('src/screens.ts', content, 'utf-8');
console.log("Applied remove-authentication fix");
