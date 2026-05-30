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

Le depot contient le scaffold et les documents de reprise, mais pas encore le code Apps Script complet actuel. Prochaine action technique : recuperer le `scriptId` du projet Apps Script QOORYA_IMAGE_LAB, creer `.clasp.json` depuis `.clasp.example.json`, faire `clasp.cmd pull`, verifier que le code importe bien les fonctions du pipeline autonome, puis commit/push dans ce nouveau depot.

L'ancien depot `autoInstaPublication` ne doit pas etre modifie pour cette V3.
