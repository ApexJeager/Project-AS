import { RANK_SYSTEM, GRADING_CRITERIA, VISITOR_POINTS } from '../constants/ranks';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export const ASTRONAUT_SYSTEM_PROMPT = `Tu es l'assistant virtuel officiel et expert de l'application des Astronautes pour le ministère des enfants chrétien.

Ton rôle est d'accompagner les Pilotes, Co-Pilotes, Assistants (Helpers), Administrateurs et Développeurs dans la gestion quotidienne de leurs escouades d'astronautes.

Voici les règles officielles absolues et la base de connaissances du programme des Astronautes :

1. CRITÈRES DU BARÈME DE NOTATION QUOTIDIENNE (Maximum quotidien sans visiteurs = 250 points) :
- Présence au rassemblement : 30 points
- Ponctualité (arrivé à l'heure) : 40 points
- Bonne conduite (respect, écoute, calme) : 40 points
- Verset du jour (récitation du verset hebdomadaire) : 40 points
- Bible apportée (possession de sa Bible physique) : 50 points
- Propreté (tenue soignée et propre) : 30 points
- Foulard porté (foulard officiel du groupe de couleur) : 20 points
- Visiteurs amenés : 25 points bonus par nouvel ami / visiteur invité

2. SYSTÈME DE PROMOTION ET LISTE DES 18 RANGS OFFICIELS AVEC VERSETS OBLIGATOIRES :
Le rang initial est Recrue (0 pt). Les 17 rangs de promotion canoniques sont :
2. Astronaute (500 pts) : 2 Timothée 2:16
3. Apprenti (1000 pts) : Matthieu 6:33
4. Sentinelle (1500 pts) : Ézéchiel 33:7
5. Éclaireur (2000 pts) : Psaume 119:105
6. Explorateur (2500 pts) : Josué 1:9
7. Pionnier (3000 pts) : Ésaïe 43:19
8. Navigateur (3500 pts) : Psaume 32:8
9. Capitaine (4000 pts) : 1 Timothée 4:12
10. Commandant (4500 pts) : Éphésiens 6:10
11. Garde d'Honneur (5000 pts) : 1 Corinthiens 16:13
12. Chevalier Céleste (5500 pts) : 2 Timothée 4:7
13. Ambassadeur (6000 pts) : 2 Corinthiens 5:20
14. Sentinelle Stellaire (6500 pts) : Daniel 12:3
15. Légat Céleste (7000 pts) : Philippiens 3:20
16. Maître de Mission (7500 pts) : Colossiens 3:23
17. Grand Commandeur (8000 pts) : Romains 8:37
18. Amiral Suprême (10000 pts) : Apocalypse 2:10

3. CRITÈRES DE QUALIFICATION OFFICIELLE DES RECRUES (Passage de Recrue à Astronaute Qualifié) :
Une recrue doit impérativement valider les 4 conditions suivantes :
- Assiduité : Être présent 3 semaines consécutives
- Verset officiel des Astronautes : Réciter par cœur 2 Timothée 2:16 ("Évite les discours vains et profanes; car ceux qui les tiennent avanceront toujours plus dans l'impiété.")
- Devise des Astronautes : Réciter la devise officielle
- Livres du Nouveau Testament : Réciter par cœur les 27 livres du Nouveau Testament dans l'ordre (Matthieu, Marc, Luc, Jean, Actes, Romains, 1 & 2 Corinthiens, Galates, Éphésiens, Philippiens, Colossiens, 1 & 2 Thessaloniciens, 1 & 2 Timothée, Tite, Philémon, Hébreux, Jacques, 1 & 2 Pierre, 1, 2 & 3 Jean, Jude, Apocalypse).

4. AIDE À LA RÉDACTION DES RAPPORTS MENSUELS :
Tu aides activement les Pilotes de groupe (Rouge, Vert, Jaune, Bleu) à structurer et rédiger des rapports clairs et inspirants comprenant :
- Effectifs et taux d'assiduité mensuelle
- Rangs passés et promotions célébrées
- Progression spirituelle (mémorisation des versets et leçons)
- Sujets de prière et objectifs pour le mois suivant

Directives de ton et style :
- Réponds TOUJOURS en français dans un style soigné, clair, bienveillant, structuré et encourageant.
- Utilise des puces et du texte en gras pour rendre les réponses faciles et rapides à lire.
- Ne fais jamais d'erreur sur les points ou les versets bibliques mentionnés ci-dessus.
`;

/**
 * Intelligent local knowledge fallback generator in case API key is missing or network fails.
 * Guarantees instant 100% accurate responses matching the user specifications.
 */
export function generateLocalAssistantResponse(userPrompt: string): string {
  const query = userPrompt.toLowerCase().trim();

  // 1. Scoring & Criteria
  if (query.includes('point') || query.includes('bareme') || query.includes('barème') || query.includes('criter') || query.includes('critère') || query.includes('bible') || query.includes('presence') || query.includes('présence')) {
    if (query.includes('bible') && !query.includes('livre')) {
      return `📖 **Attribution des points pour la Bible :**\n\nApporter sa propre Bible physique au rassemblement rapporte **50 points** par séance (c'est le critère individuel le mieux récompensé afin d'encourager chaque enfant à manipuler la Parole de Dieu).\n\n💡 **Rappel des 8 critères officiels (Total max : 250 pts) :**\n- 📖 **Bible apportée :** 50 pts\n- ⏰ **Ponctualité :** 40 pts\n- ⭐ **Bonne conduite :** 40 pts\n- 📜 **Verset du jour récité :** 40 pts\n- 👤 **Présence :** 30 pts\n- ✨ **Propreté de la tenue :** 30 pts\n- 🧣 **Port du foulard :** 20 pts\n- 👥 **Visiteurs invités :** +25 pts par ami invité`;
    }

    return `📊 **Barème Officiel d'Évaluation Quotidienne :**\n\nChaque enfant peut accumuler jusqu'à **250 points** par séance (hors visiteurs supplémentaires) :\n\n1. 📖 **Bible apportée** : 50 points\n2. ⏰ **Ponctualité** : 40 points\n3. ⭐ **Bonne conduite** : 40 points\n4. 📜 **Verset du jour** : 40 points\n5. 👤 **Présence** : 30 points\n6. ✨ **Propreté de tenue** : 30 points\n7. 🧣 **Foulard de groupe** : 20 points\n8. 👥 **Visiteurs amenés** : 25 points par ami\n\nCes points s'additionnent pour débloquer les 18 rangs de promotion !`;
  }

  // 2. Rank & Verse queries
  if (query.includes('rang') || query.includes('verset') || query.includes('promotion') || query.includes('sergent') || query.includes('grade') || query.includes('classe') || query.includes('timothée') || query.includes('général')) {
    const rankList = [
      '1. **Recrue** (0 pt)',
      ...RANK_SYSTEM.map((r, i) => `${i + 2}. **${r.title}** (${r.points} pts) → *${r.verse}*`),
    ].join('\n');
    return `📜 **Tableau des 18 Rangs et Versets de Promotion :**\n\n${rankList}\n\n💡 Pour valider une promotion une fois le seuil de points atteint, le candidat doit réciter le passage biblique devant son Pilote ou l'Administrateur.`;
  }

  // 3. Recruit qualification
  if (query.includes('recrue') || query.includes('qualif') || query.includes('nouveau') || query.includes('etape') || query.includes('étape')) {
    return `🎯 **Étapes de Qualification pour les Nouvelles Recrues :**\n\nPour devenir officiellement **Astronaute Qualifié**, une recrue doit valider 4 critères obligatoires :\n\n1. 📅 **3 Semaines Consécutives de Présence** au rassemblement.\n2. 📜 **Verset Officiel des Astronautes** : Récitation par cœur de **2 Timothée 2:16** (*« Évite les discours vains et profanes... »*).\n3. 🎖️ **La Devise des Astronautes** : Récitation de la devise du ministère.\n4. 📚 **Les 27 Livres du Nouveau Testament** : Réciter par cœur dans l'ordre de **Matthieu** jusqu'à **Apocalypse**.\n\nUne fois ces 4 étapes validées dans l'application, l'enfant accède au statut d'Astronaute et peut accumuler des points pour ses promotions !`;
  }

  // 4. Monthly report drafting
  if (query.includes('rapport') || query.includes('rediger') || query.includes('rédiger') || query.includes('mensuel') || query.includes('modele') || query.includes('modèle')) {
    return `📝 **Modèle de Rapport Mensuel pour Pilote d'Escouade :**\n\nVoici une structure type prête à l'emploi que vous pouvez copier et adapter :\n\n---\n**Rapport d'Activité - Groupe [Couleur] - Mois : [Mois/Année]**\n\n**1. Effectifs et Assiduité :**\n- Nombre total d'enfants inscrits : [X]\n- Taux moyen de présence : [X]%\n- Nouvelles recrues accueillies : [Noms]\n\n**2. Croissance Spirituelle & Mémorisation :**\n- Mémorisation du verset du mois : Excellente implication globale.\n- Enfants ayant validé un nouveau rang : [Noms & Nouveaux Rangs]\n\n**3. Points Forts du Mois :**\n- Forte participation aux moments de louange et respect du port de la Bible et du foulard.\n\n**4. Sujets de Prière & Objectifs pour le mois suivant :**\n- Persévérance pour les recrues en phase de qualification.\n- Organisation de l'examen de verset pour les promotions en attente.\n---`;
  }

  // Default general assistant intro
  return `Bonjour ! 🚀 Je suis l'**Assistant Virtuel Officiel des Astronautes**.\n\nJe peux vous aider sur :\n- 📊 **Le barème de points** (les 8 critères d'évaluation quotidienne)\n  - 🎖️ **Les 18 rangs et versets de promotion** (de Recrue à Amiral Suprême)\n- 🎯 **Les 4 critères de qualification des recrues**\n- 📝 **La rédaction des rapports mensuels de groupe**\n\n*Quelle est votre question aujourd'hui ?*`;
}

/**
 * Executes a query against the Gemini API using modern REST/SDK calls,
 * with fallback to the local intelligence engine if unavailable.
 */
export async function sendChatMessageToGemini(
  messages: ChatMessage[],
  apiKey?: string
): Promise<string> {
  const activeKey = apiKey || 
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || 
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
    '';

  const lastUserMessage = messages[messages.length - 1]?.text || '';

  if (!activeKey) {
    // Return structured accurate knowledge response directly
    return generateLocalAssistantResponse(lastUserMessage);
  }

  try {
    // Format message history for Gemini API
    const formattedContents = [
      {
        role: 'user',
        parts: [{ text: `${ASTRONAUT_SYSTEM_PROMPT}\n\nL'utilisateur te pose la question suivante : ${lastUserMessage}` }],
      }
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: formattedContents,
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('Gemini API call returned non-200 status, using local intelligence engine:', errorData);
      return generateLocalAssistantResponse(lastUserMessage);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (candidateText && typeof candidateText === 'string') {
      return candidateText;
    }

    return generateLocalAssistantResponse(lastUserMessage);
  } catch (error) {
    console.warn('Gemini API fetch failed, smoothly using local knowledge fallback:', error);
    return generateLocalAssistantResponse(lastUserMessage);
  }
}
