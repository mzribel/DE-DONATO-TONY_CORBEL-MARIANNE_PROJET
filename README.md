# Pomodoro App

Rendu du dernier TP de cours de développement Desktop, par Tony De Donato et Marianne Corbel.

Avec nos excuses pour le retard, Marianne a cassé l'authentification en voulant factoriser le code-
Aussi, on n'a pas pu rendre de zip, Moodle a refusé qu'on envoie deux fichiers ?

## Fonctionnalités

### Gestion des sessions Pomodoro
- Création de sessions Pomodoro personnalisées
- Définition des durées :
  - Pomodoro (temps de focus)
  - Pause courte
  - Pause longue
- Paramétrage du nombre de cycles avant une pause longue

### Contrôle en temps réel
- Démarrer, mettre en pause, reprendre et arrêter une session
- Passer manuellement à la phase suivante
- Affichage dynamique du temps restant
- Barre de progression pour visualiser l’avancement

### Notifications et sons
- Notifications système à la fin de chaque phase
- Différents sons configurables pour signaler la fin d’un Pomodoro ou d’une pause
- Lecture de son test et aperçu de sonnerie depuis les paramètres
- Activation/désactivation des notifications sonores et visuelles

### Paramètres utilisateurs
- Interface de configuration accessible à tout moment
- Sauvegarde et chargement automatique des paramètres liés à l'utilisateur
- Réinitialisation complète des paramètres

### Résilience et état
- Reprise automatique de la dernière session en cours
- Gestion des interruptions (fermeture de l’application, redémarrage…)

### Technologies utilisées
- Vue 3 avec TypeScript
- Electron pour la version desktop
- Supabase pour l’authentification et la persistance des données
- PrimeVue pour l’interface utilisateur
- Vite comme bundler

## Prérequis 

Les credentials Supabase doivent être mis à jour dans `src/services/supabase/client.ts` :
```ts
import { createClient } from '@supabase/supabase-js';

// TODO : Ne pas push ça
const supabaseUrl = "..."
const supabaseAnonKey = "..."

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```
Pour le bien de la correction, les credentials de l'appli Supabase utilisée peuvent être (temporairement) trouvés [ici](https://docs.google.com/document/d/1VYfCE7G91zUQGG0wOpZKpIn7KGbLnetFCoTNEBAYpk0/edit?usp=sharing).

A noter que certaines fonctionnalités optionnelles (notamment la modification du mot de passe et la suppression du compte) fonctionnent en dév mais pas en build donc les boutons sont grisés.
De la même façon, les fichiers sonores posent encore problème donc le son n'est pas disponible en build, seulement en dév.


## Dév

1. Run server
```shell
npm run dev
```

2. Dans un autre terminal, run l'app electron :
```shell
npm run dev:electron
```

## Build

Il faut modifier le fichier `/electron/main.ts` :
```ts
    // Dév : npm run dev + npm run dev:electron
    // await mainWindow.loadURL('http://localhost:5173');

    // Prod : npm run dist
    await mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
```

Puis dans un terminal **en administrateur** :
```shell
npm run dist
```

L'application générée se trouvera dans `/dist/win-unpacked`.

**Note** : L'application fonctionne en build, mais les sons ne sont pas importés correctement pour l'instant.
