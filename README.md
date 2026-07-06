# QOORYA Image Lab Autopublisher

Depot separe pour le systeme autonome QOORYA_IMAGE_LAB.

Ce depot ne remplace pas l'ancien projet GitHub `autoInstaPublication`.

## Etat valide

Le pipeline suivant a ete valide :

```text
DONE Post simple / DONE carrousel
-> caption + hashtags si manquants
-> READY TO PUBLISH
-> upload Cloudinary si manquant
-> READY FOR INSTAGRAM
-> publication Instagram
-> PUBLISHED
```

Tests valides :

- post simple publie avec image, caption et hashtags ;
- carrousel 3 slides publie avec caption et hashtags ;
- upload Cloudinary de 5 visuels ;
- pipeline autonome par numero de ligne.

## Fichiers

- `appsscript.json` : manifeste Apps Script.
- `.clasp.example.json` : modele a copier en `.clasp.json` avec le bon Script ID.
- `docs/HANDOFF_QOORYA_IMAGE_LAB_2026-05-30.md` : etat complet de reprise.
- `docs/workflow-publication-instagram-qoorya-image-lab.md` : workflow de publication.

## Etat du repo

Code Apps Script importe via `clasp pull` depuis le projet Apps Script lie a la Sheet `QOORYA_IMAGE_LAB`.

Verification effectuee :

- moteur image conserve : `gpt-image-2`, format `1088x1360` ;
- onglet cible : `Image Lab` ;
- pipeline present : image -> caption/hashtags -> Cloudinary -> Instagram ;
- publication beta validee cote Sheet pour post simple et carrousel 3 slides ;
- `.clasp.json` reste ignore par Git.

## Mise en route

1. Copier `.clasp.example.json` en `.clasp.json`.
2. Remplacer `scriptId` par l'ID du projet Apps Script lie a `QOORYA_IMAGE_LAB`.
3. Recuperer le script :

```bash
clasp pull
```

4. Verifier que le script contient bien les fonctions du pipeline autonome.
5. Commit puis push vers le nouveau repo GitHub.

## Proprietes Apps Script requises

OpenAI :

```text
OPENAI_API_KEY
```

Cloudinary :

```text
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

Instagram / Meta :

```text
ACCESS_TOKEN
IG_USER_ID
GRAPH_VERSION
```

### Renouveler le token Instagram / Meta

Le script publie via l'Instagram Graph API sur `https://graph.facebook.com/{GRAPH_VERSION}`. Il faut donc utiliser un token Facebook Graph API long-lived, pas un token `graph.instagram.com`.

App Meta QOORYA :

```text
APP_ID = 2045107766391334
```

Procedure :

1. Aller dans Meta for Developers > Graph API Explorer.
2. Selectionner l'app Meta QOORYA, pas une app par defaut.
3. Generer un token court avec les permissions :
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_show_list`
   - `pages_read_engagement`
4. Echanger le token court contre un token long avec :

```text
https://graph.facebook.com/v24.0/oauth/access_token?grant_type=fb_exchange_token&client_id=2045107766391334&client_secret=APP_SECRET&fb_exchange_token=TOKEN_COURT
```

5. Verifier que la reponse contient :

```text
token_type = bearer
expires_in ~= 5180000
```

`bearer` signifie que toute personne qui possede ce token peut agir avec ses droits. Le token doit rester secret.

`expires_in` est une duree en secondes. Environ `5180000` secondes correspondent a environ 60 jours.

6. Remplacer la propriete Apps Script `ACCESS_TOKEN` par le nouveau token long.
7. Si une ligne est restee bloquee en `PUBLISHING Instagram` sans URL Instagram, verifier d'abord que le post n'est pas en ligne, puis remettre son statut a `READY FOR INSTAGRAM` et relancer `Publier Instagram par numero de ligne`.

Exemple calendrier : un token renouvele le 27 juin 2026 expire autour du 26 aout 2026. Renouveler par prudence vers le 20 aout 2026.

Activation publication autonome :

```text
AUTONOMOUS_PUBLISHING_ENABLED = YES
```

## Point de vigilance

Ne pas installer le declencheur autonome tant que le rythme de publication beta n'est pas decide.

Pendant la beta, utiliser le pipeline par numero de ligne.

Diagnostic sans publication :

```text
QOORYA Image Lab > Diagnostiquer securite beta
```

Le code protege maintenant l'installation du declencheur : `installAutonomousPipelineTrigger` refuse d'installer le trigger tant que la propriete suivante n'est pas definie :

```text
AUTONOMOUS_TRIGGER_INSTALL_ALLOWED = YES
```

Publication autonome effective seulement si :

```text
AUTONOMOUS_PUBLISHING_ENABLED = YES
```

Declencheur automatique installable seulement si :

```text
AUTONOMOUS_TRIGGER_INSTALL_ALLOWED = YES
```

Heure quotidienne optionnelle :

```text
AUTONOMOUS_TRIGGER_HOUR = 9
```

Le declencheur automatique execute `runNextAutonomousPipelineStep` une fois par jour. Avant de chercher une ligne a publier, il normalise les statuts depuis la ligne 7 jusqu'a la derniere ligne utilisee, puis ne traite que la premiere ligne eligible dont la colonne `Date` est aujourd'hui ou deja passee.

Rythme beta recommande avant declencheur : 2 publications par semaine, avec selection humaine des lignes eligibles et controle manuel de la Sheet avant activation.

## Publication des Reels

Le pipeline prend en charge les Reels si la video est deja disponible via une URL Cloudinary publique.

Pour une ligne Reel :

```text
Type = Reel
Sujet = renseigne
Angle editorial = renseigne
Mise en scene = optionnelle si le Reel est deja tourne
Legende = vide si le pipeline doit la generer
Hashtags = vide si le pipeline doit les generer
Liens Cloudinary = une seule URL video Cloudinary
Instagram URL = vide avant publication
Statut = READY FOR INSTAGRAM
```

Ne pas utiliser `READY TO PUBLISH` pour un Reel si l'objectif est de faire uploader la video vers Cloudinary par le script. L'ancien upload Cloudinary integre au script est prevu pour les visuels Drive/images. Pour un Reel, fournir directement l'URL video Cloudinary dans la colonne `Liens Cloudinary`.

Si `Legende` ou `Hashtags` sont vides, le pipeline peut les generer pour un Reel a partir du `Sujet`, de l'`Angle editorial` et, si elle est renseignee, de la `Mise en scene`.

## Programmation trimestrielle

Menu `QOORYA Image Lab` :

- `Installer workflow trimestriel` cree l'onglet `Programmation trimestre` et le document de mode d'emploi.
- `Creer onglet programmation trimestre` prepare l'onglet de saisie pour les 24 publications du trimestre.
- `Importer programmation trimestre` importe les lignes validees vers `Image Lab`.
- `Diagnostiquer import trimestre` indique combien de lignes sont deja importees, importables maintenant ou futures.
- `Installer declencheur import trimestre` scanne l'onglet tous les jours et importe automatiquement les lignes dont la date approche.
- `Creer doc workflow trimestriel` cree le document recapitulatif dans Drive.

L'onglet `Programmation trimestre` attend ces colonnes :

```text
Date de publication | Sujet | Angle editorial | Type de publication | Mise en scene des visuels | Direction visuelle | Nb slides | Intention de legende | Notes / contraintes | Statut import | Ligne Image Lab | Date import
```

L'import ecrit uniquement les valeurs dans `Image Lab`, apres la derniere ligne utile. Il ne supprime pas de lignes et ne modifie pas les formats, validations ou mises en forme conditionnelles.

L'import automatique utilise par defaut une fenetre de 14 jours avant publication. Elle peut etre modifiee avec la propriete de script `QUARTERLY_IMPORT_LEAD_DAYS`. L'heure quotidienne par defaut est 8h et peut etre modifiee avec `QUARTERLY_IMPORT_TRIGGER_HOUR`.
