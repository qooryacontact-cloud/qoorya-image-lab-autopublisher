# Workflow de publication Instagram - QOORYA_IMAGE_LAB

Derniere mise a jour : 2026-05-30

## Objectif

Mettre en place un workflow simple pour transformer un carrousel finalise en publication Instagram prete, puis publiee.

Le passage cle initial etait :

`DONE carrousel` -> `READY TO PUBLISH` -> `PUBLISHED`

Le workflow beta valide est maintenant :

`DONE Post simple / DONE carrousel` -> `caption + hashtags` -> `READY TO PUBLISH` -> `Liens Cloudinary` -> `READY FOR INSTAGRAM` -> `PUBLISHED`

## Statuts

### 1. IDEA / BACKLOG

Contenu identifie, mais pas encore produit.

Usage : stocker les idees de posts, themes, angles editoriaux ou demandes futures.

### 2. IN PRODUCTION

Le contenu est en cours de creation.

Usage : visuels, texte, structure du carrousel ou assets encore en travail.

### 3. DONE carrousel

Le carrousel est termine cote creation.

Definition minimale :
- tous les slides sont finalises ;
- l'ordre des slides est valide ;
- les fichiers exportables sont disponibles ;
- le contenu visuel ne demande plus de retouche creative.

Ce statut ne veut pas encore dire que le post peut etre publie. Il veut dire que le carrousel est pret a entrer dans la preparation de publication.

### 4. READY TO PUBLISH

Le post est pret a etre publie sur Instagram.

Definition minimale :
- carrousel final disponible ;
- caption finale validee ;
- hashtags / mentions / localisation renseignes si necessaire ;
- date ou moment de publication choisi ;
- derniere verification faite dans le contexte Instagram.

Un item passe de `DONE carrousel` a `READY TO PUBLISH` seulement quand les elements de publication sont complets.

### 5. READY FOR INSTAGRAM

Le post est techniquement pret pour l'API Instagram.

Definition minimale :
- les visuels Drive ont ete uploades vers Cloudinary ;
- la colonne `Liens Cloudinary` est remplie ;
- la caption et les hashtags sont presents ;
- le contenu a deja ete valide pour publication.

### 6. PUBLISHED

Le post a ete publie.

Definition minimale :
- publication effectivement en ligne ;
- lien Instagram ajoute dans la base ;
- date de publication renseignee ;
- si utile, capture ou preuve de publication archivee.

### Incident : token Instagram expire

Symptome typique :

```text
Error validating access token: Session has expired
```

La ligne peut rester bloquee en `PUBLISHING Instagram` sans URL Instagram. Cela signifie que le script a commence l'etape Instagram, mais que Meta a refuse l'appel avant l'ecriture du lien et du statut `PUBLISHED`.

Procedure :

1. Verifier sur Instagram que le post n'est pas deja publie.
2. Renouveler le token Meta long-lived.
3. Remplacer la propriete Apps Script `ACCESS_TOKEN`.
4. Remettre la ligne en `READY FOR INSTAGRAM`.
5. Relancer `QOORYA Image Lab > Publier Instagram par numero de ligne`.

Renouvellement du token :

```text
APP_ID = 2045107766391334
```

Dans Meta Graph API Explorer, selectionner l'app QOORYA et generer un token court avec :

```text
instagram_basic
instagram_content_publish
pages_show_list
pages_read_engagement
```

Echanger ensuite le token court contre un token long :

```text
https://graph.facebook.com/v24.0/oauth/access_token?grant_type=fb_exchange_token&client_id=2045107766391334&client_secret=APP_SECRET&fb_exchange_token=TOKEN_COURT
```

La reponse doit contenir :

```text
token_type = bearer
expires_in ~= 5180000
```

`bearer` signifie que le token donne acces aux droits accordes a toute personne qui le possede. Il doit rester secret.

`expires_in` est une duree en secondes. Environ `5180000` secondes correspondent a environ 60 jours. Pour un token renouvele le 27 juin 2026, l'expiration tombe autour du 26 aout 2026 ; renouveler par prudence vers le 20 aout 2026.

## Colonnes minimales

| Colonne | Type recommande | Obligatoire | Role |
| --- | --- | --- | --- |
| Title | Texte | Oui | Nom court du post ou du carrousel. |
| Status | Select | Oui | Etat du workflow. |
| Carousel files | Fichier / lien | Oui a partir de `DONE carrousel` | Exports finaux du carrousel. |
| Caption | Texte long | Oui a partir de `READY TO PUBLISH` | Texte final de la publication. |
| Publish date | Date | Oui a partir de `READY TO PUBLISH` | Date prevue ou effective de publication. |
| Liens Cloudinary | URL(s) | Oui a partir de `READY FOR INSTAGRAM` | URLs publiques utilisees par Instagram Graph API. |
| Instagram URL | URL | Oui a partir de `PUBLISHED` | Lien du post publie. |
| Notes | Texte long | Non | Points de vigilance, variantes, remarques. |

## Regles de passage

### De `DONE carrousel` a `READY TO PUBLISH`

Passer le statut a `READY TO PUBLISH` quand :
- les fichiers finaux du carrousel sont attaches ou lies ;
- la caption finale est renseignee ;
- la date de publication est choisie ;
- les mentions, hashtags ou CTA sont integres si necessaire ;
- aucune validation bloquante ne reste ouverte.

Checklist courte :

`Carousel files` rempli + `Caption` remplie + `Publish date` remplie = `READY TO PUBLISH`

### De `READY TO PUBLISH` a `READY FOR INSTAGRAM`

Passer le statut a `READY FOR INSTAGRAM` quand :
- les visuels Drive sont presents ;
- l'upload Cloudinary a reussi ;
- les URLs Cloudinary sont ecrites dans la Sheet.

Checklist courte :

`Liens visuels Drive` rempli + upload Cloudinary OK + `Liens Cloudinary` rempli = `READY FOR INSTAGRAM`

### De `READY FOR INSTAGRAM` a `PUBLISHED`

Passer le statut a `PUBLISHED` quand :
- le post est publie sur Instagram ;
- le lien du post est ajoute dans `Instagram URL` ;
- la date effective de publication est confirmee dans `Publish date`.

Checklist courte :

Post en ligne + `Instagram URL` rempli = `PUBLISHED`

## Vue conseillee

Creer une vue principale type Kanban groupee par `Status`, dans cet ordre :

1. `IDEA / BACKLOG`
2. `IN PRODUCTION`
3. `DONE carrousel`
4. `READY TO PUBLISH`
5. `READY FOR INSTAGRAM`
6. `PUBLISHED`

Creer aussi une vue operationnelle filtree :

`Status is READY TO PUBLISH` ou `Status is READY FOR INSTAGRAM`

Cette vue sert de file d'attente de publication Instagram.

## Version minimale absolue

Si la base doit rester tres compacte, garder seulement :

- `Title`
- `Status`
- `Carousel files`
- `Caption`
- `Publish date`
- `Instagram URL`

`Notes` peut etre ajoutee plus tard si le suivi editorial devient plus riche.

## Validation 2026-05-30

Le workflow a ete teste avec succes sur :

- un post simple publie avec image, caption et hashtags ;
- un carrousel 3 slides publie avec caption et hashtags ;
- un upload Cloudinary de 5 visuels ;
- le pipeline autonome par numero de ligne.

Le pipeline complet valide :

`DONE Post simple / DONE carrousel` -> generation caption + hashtags si manquants -> `READY TO PUBLISH` -> upload Cloudinary si manquant -> `READY FOR INSTAGRAM` -> publication Instagram -> `PUBLISHED`

Point de vigilance :

- ne pas installer le declencheur autonome tant que le rythme de publication n'est pas decide ;
- garder `AUTONOMOUS_PUBLISHING_ENABLED = YES` seulement si l'on accepte que le pipeline publie vraiment ;
- utiliser le pipeline par numero de ligne pendant la beta.

## Securite beta ajoutee

Le mode beta doit rester volontaire et controle.

Le pipeline par numero de ligne respecte maintenant la propriete :

```text
AUTONOMOUS_PUBLISHING_ENABLED = YES
```

Si cette propriete n'est pas `YES`, le pipeline prepare la ligne jusqu'a `READY FOR INSTAGRAM`, puis s'arrete avant publication.

L'installation du declencheur automatique est protegee par une propriete supplementaire :

```text
AUTONOMOUS_TRIGGER_INSTALL_ALLOWED = YES
```

Sans cette propriete, `installAutonomousPipelineTrigger` refuse d'installer le declencheur.

Diagnostic sans effet de bord :

```text
QOORYA Image Lab > Diagnostiquer securite beta
```

Ce diagnostic affiche l'etat de `AUTONOMOUS_PUBLISHING_ENABLED`, l'autorisation d'installation du declencheur, et le nombre de declencheurs `runNextAutonomousPipelineStep` installes.

## Automatisation par date

Le declencheur automatique ne doit pas publier toutes les lignes disponibles.

Regle appliquee :

- avant chaque recherche de ligne a publier, le script normalise les statuts depuis la ligne 7 jusqu'a la derniere ligne utilisee ;
- une ligne est candidate si son statut est `DONE Post simple`, `DONE carrousel`, `DONE_CAROUSEL`, `READY TO PUBLISH` ou `READY FOR INSTAGRAM` ;
- la colonne `Date` doit etre aujourd'hui ou deja passee ;
- les dates futures sont ignorees ;

## Programmation trimestrielle

Workflow recommande tous les trois mois :

1. Produire ou faire produire par ChatGPT un tableau de 24 publications.
2. Coller le tableau dans l'onglet `Programmation trimestre`, a partir de la ligne 2.
3. Relire et valider les sujets, dates, types et mises en scene.
4. Lancer `QOORYA Image Lab > Importer programmation trimestre`.
5. Verifier les nouvelles lignes ajoutees dans `Image Lab`.
6. Laisser le pipeline generer les visuels, captions, hashtags, Cloudinary, puis publier selon la colonne `Date`.

Colonnes attendues dans `Programmation trimestre` :

```text
Date de publication | Sujet | Angle editorial | Type de publication | Mise en scene des visuels | Direction visuelle | Nb slides | Intention de legende | Notes / contraintes
```

L'import est volontairement conservateur : il ecrit seulement les valeurs dans `Image Lab`, apres la derniere ligne utile, et conserve la structure de la feuille principale.

### Import automatique depuis l'onglet trimestre

Le menu `QOORYA Image Lab > Installer declencheur import trimestre` installe un scan quotidien de l'onglet `Programmation trimestre`.

Regle appliquee :

- une ligne deja marquee `IMPORTED` ou avec une `Ligne Image Lab` est ignoree ;
- une ligne non importee est chargee dans `Image Lab` si sa date est au plus tard dans la fenetre d'anticipation ;
- la fenetre d'anticipation par defaut est de 14 jours ;
- les lignes importees sont marquees avec `Statut import`, `Ligne Image Lab` et `Date import` ;
- l'import automatique n'ecrit que les valeurs et ne modifie pas la mise en forme conditionnelle.

Proprietes optionnelles :

```text
QUARTERLY_IMPORT_LEAD_DAYS = 14
QUARTERLY_IMPORT_TRIGGER_HOUR = 8
```
- une seule ligne est traitee par execution.

Proprietes utiles :

```text
AUTONOMOUS_PUBLISHING_ENABLED = YES
AUTONOMOUS_TRIGGER_INSTALL_ALLOWED = YES
AUTONOMOUS_TRIGGER_HOUR = 9
```

`AUTONOMOUS_TRIGGER_HOUR` est optionnel. Sans valeur, le declencheur quotidien est installe vers 9h, timezone du script.

## Rythme beta recommande

Ne pas installer de declencheur tant que le rythme editorial n'est pas valide.

Cadence proposee pour la beta :

- 2 publications par semaine ;
- controle humain des lignes candidates avant publication ;
- lancement manuel par numero de ligne pendant la premiere semaine ;
- declencheur seulement apres validation du rythme et des lignes eligibles.

Si un declencheur est active plus tard, garder une cadence technique prudente : une execution toutes les 15 minutes, avec peu de lignes eligibles dans la Sheet, afin d'eviter une publication en rafale.

## Journal - fin de session 2026-05-30

Le pipeline de publication autonome QOORYA_IMAGE_LAB est valide en beta :

`image V1` -> `caption + hashtags` -> `Cloudinary` -> `Instagram Graph API` -> `PUBLISHED`

Un nouveau depot GitHub separe a ete cree et pousse pour preparer la V3 sans toucher a l'ancien projet fonctionnel :

```text
https://github.com/qooryacontact-cloud/qoorya-image-lab-autopublisher
```

Depot local :

```text
C:\Users\Pierre\Documents\qoorya-image-lab-autopublisher
```

Commit pousse :

```text
c8e75ca init: scaffold qoorya image lab autopublisher
```

Le code Apps Script complet actuel a ete importe dans le nouveau depot via `clasp.cmd pull`. `.clasp.json` reste local et ignore par Git.

L'ancien depot `autoInstaPublication` ne doit pas etre modifie pour cette V3.
