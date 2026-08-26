# 🚀 Astronautes — Plateforme de Gestion & Système de Rangs

Une application web d'excellence conçue sur mesure pour le **Ministère des Enfants Astronautes**, alliant rigueur pédagogique, notation quotidienne basée sur 8 critères officiels, qualification des recrues, matrice solennelle de 18 rangs bibliques, gouvernance par rôles (RBAC) sécurisée par code PIN, et assistant IA embarqué.

---
> **Important — mode prototype :** les données de démonstration sont conservées localement dans le navigateur. Cette version ne fournit pas encore d’authentification serveur, de RBAC inviolable ni de sauvegarde multi-utilisateur. Ne pas utiliser avec des données personnelles réelles sans ajouter un backend sécurisé.

## 🌟 Points Clés & Fonctionnalités Majeures

### 1. 🛡️ Système de Sécurité & Rôles Hiérarchiques (RBAC)
- **Authentification par Code PIN à 4 chiffres** : Chaque utilisateur dispose d'un PIN unique.
- **5 Niveaux de Rôles :**
  - `Dev` *(PIN Master par défaut : 1926)* : Contrôle absolu du système, télémétrie, gestion des PINs utilisateurs, console de diagnostic et réinitialisation de base de données.
  - `Admin` *(PIN : 0000)* : Supervision globale des 4 groupes, répertoire de tous les enfants, gestion des rapports mensuels consolidés et exportations.
  - `Pilote` *(PINs : 1001 à 1004)* : Responsable d'un groupe de couleur dédié (Rouge, Vert, Jaune, Bleu), notation des enfants, validation des recrues et des examens de passage de rang.
  - `Co-Pilote` *(PINs : 2001 à 2004)* : Assistant du Pilote pour la notation quotidienne et le suivi de présence.
  - `Helper` *(PINs : 3001 à 3004)* : Soutien opérationnel pour les séances de groupe.
- **Verrouillage de Session Automatique & Manuel** : Verrouillage instantané avec pavé numérique tactile optimisé pour mobile et bureau.

---

### 2. 📋 Barème Officiel de Notation Quotidienne (250 Points Max)
Chaque séance permet d'évaluer les enfants en temps réel selon les 8 critères officiels du ministère :

| Critère | Points | Description |
| :--- | :---: | :--- |
| **Présence** | `+30 pts` | Présence effective à la séance |
| **Ponctualité** | `+40 pts` | Arrivée à l'heure convenue |
| **Bonne Conduite** | `+40 pts` | Respect, écoute et discipline |
| **Verset du Jour** | `+40 pts` | Récitation sans faute du verset thématique |
| **Bible** | `+50 pts` | Possession de sa propre Bible physique |
| **Propreté** | `+30 pts` | Tenue soignée et respect de l'hygiène |
| **Foulard** | `+20 pts` | Port du foulard officiel Astronautes |
| **Visiteurs** | `+25 pts / ami` | Chaque invité amené à la séance |

> **Total Séance :** `250 points de base` (+ 25 pts supplémentaires par visiteur additionnel).  
> **Sauvegarde Automatique :** Tout changement d'état est synchronisé instantanément avec calcul en direct et jauge visuelle de progression.

---

### 3. 🎖️ Protocole de Qualification des Recrues
Avant d'obtenir le statut d'**Astronaute Qualifié**, toute nouvelle recrue doit valider les 4 exigences statutaires :
1. **3 Semaines Consécutives de Présence**
2. **Verset Fondateur des Astronautes** : Récitation de *2 Timothée 2:16*
3. **Devise Officielle des Astronautes**
4. **27 Livres du Nouveau Testament** (de Matthieu à l'Apocalypse dans l'ordre exact)

---

### 4. 🏆 Matrice Officielle des 18 Rangs Bibliques
La progression se fait par cumul continu de points et examen solennel de récitation du verset de rang :

1. **Recrue** (`0 pt`) — Entrée dans le ministère
2. **Astronaute** (`500 pts`) — *2 Timothée 2:16*
3. **Apprenti** (`1 000 pts`) — *Matthieu 6:33*
4. **Sentinelle** (`1 500 pts`) — *Ézéchiel 33:7*
5. **Éclaireur** (`2 000 pts`) — *Psaume 119:105*
6. **Explorateur** (`2 500 pts`) — *Josué 1:9*
7. **Pionnier** (`3 000 pts`) — *Ésaïe 43:19*
8. **Navigateur** (`3 500 pts`) — *Psaume 32:8*
9. **Capitaine** (`4 000 pts`) — *1 Timothée 4:12*
10. **Commandant** (`4 500 pts`) — *Éphésiens 6:10*
11. **Garde d'Honneur** (`5 000 pts`) — *1 Corinthiens 16:13*
12. **Chevalier Céleste** (`5 500 pts`) — *2 Timothée 4:7*
13. **Ambassadeur** (`6 000 pts`) — *2 Corinthiens 5:20*
14. **Sentinelle Stellaire** (`6 500 pts`) — *Daniel 12:3*
15. **Légat Céleste** (`7 000 pts`) — *Philippiens 3:20*
16. **Maître de Mission** (`7 500 pts`) — *Colossiens 3:23*
17. **Grand Commandeur** (`8 000 pts`) — *Romains 8:37*
18. **Amiral Suprême** (`10 000 pts`) — *Apocalypse 2:10*

---

### 5. 🤖 Assistant IA Astronautes (Intégration Gemini)
- Guide interactif des règles, barèmes et passages bibliques.
- Suggestions de questions rapides (barème du jour, règles de promotion, conditions recrue, rapport mensuel).
- Moteur intelligent embarqué avec bascule fluide vers l'API Google Gemini si configurée.

---

### 6. 📊 Tableaux de Bord & Vues Dédiées
- **Vue Équipe / Groupe (`TeamView`)** : Vue opérationnelle pour le Pilote avec notation par cartes tactiles, boutons de qualification rapide et génération de rapports mensuels.
- **Tableau d'Honneur (`LeaderboardView`)** : Podium 🥇🥈🥉, barres d'avancement dynamiques, filtres par groupe/statut et matrice des 18 rangs.
- **Administration Globale (`AdminView`)** : KPIs consolidés (Effectif total, Astronautes qualifiés, Recrues, Total points distribués), gestion des 4 groupes de couleur et répertoire complet.
- **Console Développeur (`DevView`)** : Contrôle des PINs, ajout d'utilisateurs, inspection de l'état système et actions de maintenance.

---

## 🎨 Design & Ergonomie de Haut Vol

- **Thème Obsidian & Or Luxueux** : Fond zinc profond (`zinc-950`/`zinc-900`) marié à des accents or champagne (`amber-400`/`amber-500`) et halos de lumière feutrés.
- **Typographie Triangulaire de Précision** :
  - *Outfit* : Titres et labels exécutifs à fort impact.
  - *Plus Jakarta Sans* : Lecture fluide du corps de texte et des listes d'élèves.
  - *JetBrains Mono* : Précision mathématique des points, scores et identifiants.
- **100% Mobile & Touch Ready** : Cibles tactiles calibrées (≥ 44px), pavé numérique géant, barres de défilement masquées et disposition adaptative.

---

## 🛠️ Pile Technologique

- **Frontend** : React 18+ & TypeScript
- **Bundler & Serveur** : Vite
- **Styling** : Tailwind CSS v4 avec polices Google Fonts et design system personnalisé
- **Icônes** : Lucide React
- **Intelligence Artificielle** : Google Gemini API (`@google/genai`)

---

## 🚀 Démarrage & Utilisation Rapide

### 1. Installation des dépendances
\`\`\`bash
npm install
\`\`\`

### 2. Lancement en mode développement
\`\`\`bash
npm run dev
\`\`\`
L'application démarre immédiatement sur \`http://localhost:3000\`.

### 3. Compilation pour la production
\`\`\`bash
npm run build
\`\`\`

---

## 🔑 Identifiants & Codes PIN de Test

| Profil | Rôle | Groupe | Code PIN |
| :--- | :--- | :--- | :---: |
| **Justin (Dev)** | Développeur Maître | Global | **`1926`** |
| **Pasteur Admin** | Administrateur | Global | **`0000`** |
| **Sarah (Pilote)** | Pilote | Groupe Rouge | **`1001`** |
| **David (Pilote)** | Pilote | Groupe Vert | **`1002`** |
| **Esther (Pilote)** | Pilote | Groupe Jaune | **`1003`** |
| **Samuel (Pilote)** | Pilote | Groupe Bleu | **`1004`** |

---

*Développé pour l'édification et la formation de la jeunesse dans le Ministère des Enfants Astronautes.*
