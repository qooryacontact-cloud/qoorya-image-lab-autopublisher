# Handoff de fin de session - QOORYA_IMAGE_LAB - 2026-05-30

## Etat general

Le projet a franchi une etape importante : le labo image est devenu un debut de systeme autonome de publication Instagram.

La production image V1 avait deja ete validee. Pendant cette session, nous avons ajoute et teste les briques suivantes :

- validation humaine `READY TO PUBLISH` ;
- colonne `Liens Cloudinary` ;
- upload Cloudinary depuis les liens Drive ;
- colonne `Lien Instagram` ;
- publication via Instagram Graph API ;
- pipeline autonome qui enchaine caption, hashtags, Cloudinary et publication Instagram.

Le moteur image n'a pas ete durci. La creativite Image 2 reste preservee.

## Sheet de reference

Google Sheet :

```text
QOORYA_IMAGE_LAB
https://docs.google.com/spreadsheets/d/1HVHy_RwMUAEzEBUrp4Yf9SzrpXxowRXPOgurQr9bmcA/edit
```

Onglet :

```text
Image Lab
```

Colonnes importantes :

- `J` : Liens visuels Drive
- `K` : Statut
- `M` : Liens Cloudinary
- `N` : Lien Instagram

## Statuts actuels

Le statut `K` doit accepter notamment :

```text
TODO
GENERATING Post simple
GENERATING carrousel
DONE Post simple
DONE carrousel
READY TO PUBLISH
UPLOADING Cloudinary
READY FOR INSTAGRAM
PUBLISHING Instagram
PUBLISHED
ERROR publication
ERROR
```

Attention : certaines anciennes lignes peuvent encore contenir `DONE_CAROUSEL`. Le pipeline a ete rendu tolerant, mais il vaut mieux normaliser manuellement ces cellules en `DONE carrousel`.

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

Optionnel :

```text
CLOUDINARY_FOLDER
```

Instagram / Meta :

```text
ACCESS_TOKEN
IG_USER_ID
GRAPH_VERSION
```

`IG_USER_ID` valide pour le compte actuel :

```text
17841437397144826
```

`GRAPH_VERSION` peut etre absent car le script utilise `v24.0` par defaut, mais il est preferable de le renseigner explicitement.

Activation publication autonome :

```text
AUTONOMOUS_PUBLISHING_ENABLED = YES
```

Si cette propriete n'est pas `YES`, le pipeline s'arrete a `READY FOR INSTAGRAM` et ne publie pas.

## Workflow valide

Workflow complet valide :

```text
DONE Post simple / DONE carrousel
-> caption + hashtags si manquants
-> READY TO PUBLISH
-> upload Cloudinary si manquant
-> READY FOR INSTAGRAM
-> publication Instagram
-> PUBLISHED
```

Le pipeline fonctionne pour :

- post simple ;
- carrousel 3 slides.

Un carrousel de 3 images a ete publie avec succes. Le test sur carrousel 5 images reste a faire si necessaire, mais la logique Instagram gere deja de 2 a 10 images.

## Fonctions ajoutees ou utilisees

Publication readiness :

- `markActiveRowReadyToPublish`
- `markRowReadyToPublishByNumber`
- `diagnosePublicationReadinessByNumber`
- `markRowReadyToPublish_`
- `validatePublicationReadiness_`
- `getQOORYAPublishingColumns_`
- `getQOORYAStatus_`

Cloudinary :

- `uploadActiveRowVisualsToCloudinary`
- `uploadRowVisualsToCloudinaryByNumber`
- `uploadRowVisualsToCloudinary_`
- `uploadDriveImageUrlToCloudinary_`
- `uploadBase64ToCloudinary_`
- `splitMultilineLinks_`
- `extractDriveFileId_`
- `buildCloudinaryPublicId_`
- `signCloudinaryParams_`
- `getRequiredScriptProperty_`
- `getOptionalScriptProperty_`
- `getCloudinaryApiSecret_`

Instagram Graph API :

- `publishActiveRowToInstagram`
- `publishRowToInstagramByNumber`
- `publishRowToInstagram_`
- `publishCloudinaryUrlsToInstagram_`
- `createInstagramImageContainer_`
- `createInstagramCarouselContainer_`
- `publishInstagramContainer_`
- `getInstagramPermalink_`
- `buildInstagramCaptionFromRow_`
- `callInstagramGraphPost_`
- `callInstagramGraphGet_`
- `parseInstagramGraphResponse_`
- `getInstagramGraphBaseUrl_`

Pipeline autonome :

- `runAutonomousPipelineByNumber`
- `runNextAutonomousPipelineStep`
- `runAutonomousPipelineForRow_`
- `markRowReadyToPublishNoUi_`
- `uploadRowVisualsToCloudinaryNoUi_`
- `publishRowToInstagramNoUi_`
- `findNextAutonomousPipelineRow_`
- `isDoneCreativeStatus_`
- `normalizeWorkflowStatus_`
- `installAutonomousPipelineTrigger`
- `stopAutonomousPipelineTrigger`

## Tests valides aujourd'hui

1. Colonne `M = Liens Cloudinary` creee.
2. Upload Cloudinary teste : 5 visuels uploades, statut passe a `READY FOR INSTAGRAM`.
3. Colonne `N = Lien Instagram` creee.
4. Publication Instagram d'un post simple reussie avec image, caption et hashtags.
5. Publication Instagram d'un carrousel 3 slides reussie.
6. Pipeline autonome teste jusqu'a publication.
7. Correction appliquee : le pipeline genere caption + hashtags avant publication si ces champs sont manquants.
8. Correction appliquee : le pipeline accepte les statuts normalises et certains anciens statuts techniques comme `DONE_CAROUSEL`.

## Archivage GitHub de fin de session

Un nouveau depot GitHub separe a ete cree pour ne pas modifier le projet existant qui fonctionne deja.

Depot GitHub :

```text
https://github.com/qooryacontact-cloud/qoorya-image-lab-autopublisher
```

Depot local :

```text
C:\Users\Pierre\Documents\qoorya-image-lab-autopublisher
```

Etat Git :

```text
commit c8e75ca init: scaffold qoorya image lab autopublisher
remote origin https://github.com/qooryacontact-cloud/qoorya-image-lab-autopublisher.git
branche master poussee sur origin/master
```

Contenu pousse :

- README du nouveau projet ;
- `.gitignore` ;
- `appsscript.json` ;
- `.clasp.example.json` ;
- docs de handoff et workflow.

Important : le nouveau depot ne contient pas encore le code Apps Script complet actuel. Il contient le scaffold et les documents de reprise. Pour importer le vrai script, il faudra recuperer l'ID du projet Apps Script QOORYA_IMAGE_LAB, creer le fichier `.clasp.json`, puis lancer `clasp.cmd pull` dans le nouveau depot.

Ne pas pousser ni modifier l'ancien depot :

```text
C:\Users\Pierre\Documents\mon-script-sheets
https://github.com/qooryacontact-cloud/autoInstaPublication.git
```

## Point de vigilance

Ne pas installer le declencheur autonome tant que le rythme de publication n'est pas decide.

Le systeme peut publier automatiquement si :

```text
AUTONOMOUS_PUBLISHING_ENABLED = YES
```

et si le declencheur `runNextAutonomousPipelineStep` est installe.

Pour eviter une publication en rafale :

- garder le declencheur desactive pour l'instant ;
- utiliser le pipeline par numero de ligne pendant la phase beta ;
- installer le declencheur seulement quand le calendrier est clair.

## Prochaine etape conseillee

Decider le mode beta de publication :

1. publication manuelle par numero de ligne ;
2. ou declencheur toutes les 15 minutes mais avec seulement quelques lignes eligibles ;
3. definir le rythme editorial, par exemple 2 ou 3 publications par semaine ;
4. choisir si la date de publication doit etre ajoutee comme colonne avant d'activer l'autonomie continue.
5. importer le code Apps Script actuel dans le nouveau depot GitHub separe quand le `scriptId` QOORYA_IMAGE_LAB est disponible.

## Phrase de reprise conseillee

```text
Reprends QOORYA_IMAGE_LAB depuis le handoff local du 2026-05-30. Le pipeline image -> caption/hashtags -> Cloudinary -> Instagram est valide pour post simple et carrousel 3 slides. Ne touche pas au moteur image. Un nouveau repo separe existe : https://github.com/qooryacontact-cloud/qoorya-image-lab-autopublisher. Priorite : importer proprement le code Apps Script actuel dans ce repo, securiser le mode beta de publication autonome, definir le rythme, puis decider si on installe le declencheur.
```
