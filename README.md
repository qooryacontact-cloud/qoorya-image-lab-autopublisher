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

Rythme beta recommande avant declencheur : 2 publications par semaine, avec selection humaine des lignes eligibles et controle manuel de la Sheet avant activation.
