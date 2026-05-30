const QOORYA_CONFIG = {
  SHEET_NAME: 'Image Lab',
  OPENAI_API_KEY_PROPERTY: 'OPENAI_API_KEY',
  IMAGE_MODEL: 'gpt-image-2',
  IMAGE_SIZE: '1088x1360',
  IMAGE_QUALITY: 'medium',
  OUTPUT_FOLDER_ID: '1sVaOV_6pUugkk97kd8CZ0PgVkIcx6EwT',
    COLUMNS: {
    DATE: 1,
    TYPE_PUBLICATION: 2,
    DIRECTION_VISUELLE: 3,
    SUJET: 4,
    ANGLE_EDITORIAL: 5,
    MISE_EN_SCENE: 6,
    NB_SLIDES: 7,
    LEGENDE: 8,
    HASHTAGS: 9,
    LIENS_VISUELS_DRIVE: 10,
    STATUT: 11,
    NOTES: 12,
  },
};

const QOORYA_VISUAL_DIRECTIONS = {
  Libre:
    'Free visual direction. Choose the strongest visual format, composition, objects, framing, and text placement for the subject.',
  Documentaire_reel:
    'Real documentary direction. Make the image feel observed, tangible, specific, and grounded in a real working situation.',
  Objet_dossier_papier:
    'Object, folder, and paper direction. Build the composition around physical documents, notes, folders, printed systems, annotations, tabs, and working tools.',
  Atelier_decision:
    'Decision workshop direction. Show cards, notes, sorting, grouping, traces of arbitration, and a visible decision process.',
  Avant_apres:
    'Before-and-after direction. Show a visible transformation or contrast without becoming a clean infographic.',
  Scene_metier_personnage:
    'Professional scene with character direction. Include a credible non-posed person in a real work environment, integrated naturally into the scene.',
  Preuve_terrain:
    'Field proof direction. Make the result feel like an anonymized real case, artifact, deliverable, or measurable field evidence.',
  Systeme_imprime:
    'Printed system direction. Show a grid, protocol, matrix, map, or structured working document, realistic and imperfect.',
  Contraste_visuel_fort:
    'Strong visual contrast direction. Use a bold opposition in framing, material, gesture, scale, or light to stop the scroll.',
  Image_metaphorique_realiste:
    'Realistic metaphor direction. Use a concrete real-world metaphor, not fantasy, to make the idea immediately graspable.',
};

const QOORYA_PALETTES = [
  'off-white paper, graphite pencil, red stamp ink, muted steel grey',
  'workshop grey, deep ink blue, pale yellow paper, black marker',
  'cool white paper, soft black, signal green, neutral desk texture',
  'light kraft paper, black marker, discreet orange tabs, worn white labels',
  'recycled paper, midnight blue ink, pink highlighter, matte grey surface',
  'concrete grey, white paper, red correction marks, dark binder clips',
];

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('QOORYA Image Lab')
    .addItem('Generer par numero de ligne', 'generateRowByNumber')
    .addItem('Generer la ligne active', 'generateActiveImageRow')
    .addSeparator()
    .addItem('Generer carrousel ligne active', 'generateActiveCarouselRow')
    .addItem('Generer carrousel par numero de ligne', 'generateCarouselRowByNumber')
    .addItem('Generer prochaine slide carrousel', 'generateNextCarouselSlideByNumber')
    .addItem('Regenerer une slide precise', 'regenerateCarouselSlideByNumber')
    .addItem('Automatiser carrousel par numero de ligne', 'startAutomatedCarouselByNumber')
    .addItem('Voir etat automatisation', 'showAutomatedCarouselStatus')
    .addItem('Arreter automatisation carrousel', 'stopAutomatedCarouselGeneration')
    .addSeparator()
    .addItem('Diagnostiquer une ligne', 'diagnoseRowByNumber')
    .addItem('Generer les lignes TODO', 'generateTodoImageRows')
    .addSeparator()
    .addItem('Rediger caption ligne active', 'generateCaptionForActiveRow')
    .addItem('Rediger caption par numero de ligne', 'generateCaptionForRowPrompt')
    .addSeparator()
    .addItem('Marquer pret a publier ligne active', 'markActiveRowReadyToPublish')
    .addItem('Marquer pret a publier par numero de ligne', 'markRowReadyToPublishByNumber')
    .addItem('Diagnostiquer publication par numero de ligne', 'diagnosePublicationReadinessByNumber')
    .addSeparator()
    .addItem('Uploader Cloudinary ligne active', 'uploadActiveRowVisualsToCloudinary')
    .addItem('Uploader Cloudinary par numero de ligne', 'uploadRowVisualsToCloudinaryByNumber')
    .addSeparator()
    .addItem('Publier Instagram ligne active', 'publishActiveRowToInstagram')
    .addItem('Publier Instagram par numero de ligne', 'publishRowToInstagramByNumber')
    .addSeparator()
    .addItem('Pipeline autonome par numero de ligne', 'runAutonomousPipelineByNumber')
    .addItem('Executer prochaine ligne autonome', 'runNextAutonomousPipelineStep')
    .addItem('Installer declencheur pipeline autonome', 'installAutonomousPipelineTrigger')
    .addItem('Arreter declencheur pipeline autonome', 'stopAutonomousPipelineTrigger')
    .addToUi();
}

function generateActiveImageRow() {
  const sheet = getImageLabSheet_();
  const row = getActiveRowInSheet_(sheet);

  if (!row) {
    SpreadsheetApp.getUi().alert('Selectionne une cellule dans l onglet Image Lab.');
    return;
  }

  processImageRow_(sheet, row);
}

function generateRowByNumber() {
  const row = promptForRowNumber_('Numero de ligne a generer ?');
  if (!row) return;

  processImageRow_(getImageLabSheet_(), row);
}

function generateActiveCarouselRow() {
  const sheet = getImageLabSheet_();
  const row = getActiveRowInSheet_(sheet);

  if (!row) {
    SpreadsheetApp.getUi().alert('Selectionne une cellule dans l onglet Image Lab.');
    return;
  }

  processCarouselRow_(sheet, row);
}

function generateCarouselRowByNumber() {
  const row = promptForRowNumber_('Numero de ligne du carrousel a generer ?');
  if (!row) return;

  processCarouselRow_(getImageLabSheet_(), row);
}

function generateTodoImageRows() {
  const sheet = getImageLabSheet_();
  const lastRow = sheet.getLastRow();
  let generated = 0;

  for (let row = 2; row <= lastRow; row += 1) {
    const status = String(
      sheet.getRange(row, QOORYA_CONFIG.COLUMNS.STATUT).getValue() || ''
    ).trim();

    if (status === 'TODO') {
      processImageRow_(sheet, row);
      generated += 1;
      Utilities.sleep(800);
    }
  }

  SpreadsheetApp.getUi().alert(`${generated} ligne(s) generee(s).`);
}

function processImageRow_(sheet, row) {
  const data = readRowData_(sheet, row);

  if (!data.typePublication || !data.directionVisuelle || !data.sujet || !data.miseEnScene) {
    setRowResult_(sheet, row, 'ERROR', '', 'Type, Direction visuelle, Sujet ou Mise en scene manquant.');
    return;
  }

  sheet.getRange(row, QOORYA_CONFIG.COLUMNS.STATUT).setValue(QOORYA_STATUS.GENERATING_POST);
  SpreadsheetApp.flush();

  try {
    console.log('===== QOORYA IMAGE LAB - GENERATION START =====');
    console.log(`Row: ${row}`);
    console.log(`Type publication: ${data.typePublication}`);
    console.log(`Direction visuelle: ${data.directionVisuelle}`);
    console.log(`Angle editorial: ${data.angleEditorial}`);
    console.log(`Sujet: ${data.sujet}`);
    console.log(`Mise en scene: ${data.miseEnScene}`);

    const prompt = buildQOORYAImagePrompt_(
    data.typePublication,
    data.directionVisuelle,
    data.angleEditorial,
    data.sujet,
    data.miseEnScene
  );
    console.log(prompt);

    const imageBlob = generateOpenAIImageBlob_(prompt, buildImageFileName_(row, data.directionVisuelle));
    const file = saveImageBlobToDrive_(imageBlob);

    setRowResult_(sheet, row, QOORYA_STATUS.DONE_POST, file.getUrl(), prompt);
  } catch (error) {
    setRowResult_(sheet, row, QOORYA_STATUS.ERROR, '', String(error && error.message ? error.message : error));
    throw error;
  }
}

function processCarouselRow_(sheet, row) {
  const data = readRowData_(sheet, row);
  const slideCount = Number(data.nbSlides || 0);

  if (!data.typePublication || !data.directionVisuelle || !data.sujet || !data.miseEnScene) {
    setRowResult_(sheet, row, 'ERROR', '', 'Type, Direction visuelle, Sujet ou Mise en scene manquant.');
    return;
  }

  if (!slideCount || slideCount < 3 || slideCount > 8) {
    setRowResult_(sheet, row, 'ERROR', '', 'Nb slides doit etre compris entre 3 et 8.');
    return;
  }

  sheet.getRange(row, QOORYA_CONFIG.COLUMNS.STATUT).setValue(QOORYA_STATUS.GENERATING_CAROUSEL);
  SpreadsheetApp.flush();

  const palette = pickPalette_(
  `${data.typePublication} ${data.directionVisuelle} ${data.angleEditorial} carousel`,
  `${data.sujet} ${data.miseEnScene}`
  );
  const direction = buildCarouselCreativeDirection_(data, slideCount, palette);
  const links = [];
  const prompts = [];

  try {
    for (let slide = 1; slide <= slideCount; slide += 1) {
      const prompt = buildQOORYACarouselSlidePrompt_(data, slide, slideCount, direction);
      const imageBlob = generateOpenAIImageBlob_(
        prompt,
        buildCarouselFileName_(row, slide, slideCount, data.directionVisuelle)
      );
      const file = saveImageBlobToDrive_(imageBlob);

      links.push(`Slide ${slide}/${slideCount}: ${file.getUrl()}`);
      prompts.push(`--- Slide ${slide}/${slideCount} ---\n${prompt}`);

      sheet
        .getRange(row, QOORYA_CONFIG.COLUMNS.LIENS_VISUELS_DRIVE)
        .setValue(links.join('\n'));
      sheet.getRange(row, QOORYA_CONFIG.COLUMNS.NOTES).setValue(prompts.join('\n\n'));
      SpreadsheetApp.flush();
      Utilities.sleep(800);
    }

      sheet.getRange(row, QOORYA_CONFIG.COLUMNS.STATUT).setValue(QOORYA_STATUS.DONE_CAROUSEL);
  } catch (error) {
    sheet.getRange(row, QOORYA_CONFIG.COLUMNS.STATUT).setValue(QOORYA_STATUS.ERROR);
    sheet
      .getRange(row, QOORYA_CONFIG.COLUMNS.NOTES)
      .setValue(`${prompts.join('\n\n')}\n\nERROR: ${String(error && error.message ? error.message : error)}`);
    throw error;
  }
}

function buildQOORYAImagePrompt_(typePublication, directionVisuelle, angleEditorial, sujet, miseEnScene) {
  const normalizedTypePublication = String(typePublication || '').trim() || 'post simple';
  const normalizedDirection = normalizeVisualDirection_(directionVisuelle);
  const normalizedAngle = normalizeEditorialAngle_(angleEditorial);
  const visualInstruction = getVisualDirectionInstruction_(normalizedDirection);
  const palette = pickPalette_(
    `${normalizedTypePublication} ${normalizedDirection} ${normalizedAngle}`,
    `${sujet} ${miseEnScene}`
  );

  return [
    'Create a vertical 4:5 Instagram editorial image for QOORYA.',
    `Editorial subject: ${sujet}.`,
    `Visual scene to depict: ${miseEnScene}.`,
    `Publication type: ${normalizedTypePublication}.`,
    `Visual direction: ${normalizedDirection}.`,
    `Editorial angle: ${normalizedAngle}.`,
    visualInstruction,
    'Use the visual direction as a creative guide, not as a rigid template. You may choose the best visual format, composition, objects, framing, and text placement.',
    getEditorialAngleInstruction_(normalizedAngle),
    'QOORYA BRAND SYSTEM: Use Plus Jakarta Sans Bold or SemiBold for headlines, hooks and subheadings. Use Plus Jakarta Sans Regular or Medium for supporting text and CTA.',
    'If the QOORYA brand signature appears, render it as a sober horizontal wordmark: a minimal dark plum Q symbol with one small warm orange accent, followed by the uppercase word "QOORYA" in spaced dark plum lettering.',
    'Keep the brand signature small and elegant. Do not invent another logo, decorative lettering, metallic 3D branding or a different wordmark.',
    'BRAND FACTS ARE FIXED: If an email address is displayed, use exactly "qoorya.contact@gmail.com". Never invent another email address, website, phone number or social media handle.',
    'Invent the French text yourself: a strong short hook, a very short supporting line, and, if useful, a discreet CTA.',
    'Keep the total visible text short, around 10 to 22 French words. Use strong editorial judgment for wording, hierarchy, and placement.',
    `Palette: ${palette}. Do not let beige or linen dominate.`,
    'Respect the requested cast: if the scene specifies no person, include no visible person, face, silhouette, hand or human body part.',
    'Make it feel tangible, specific, imperfect, and documentary: real objects, visible work traces, controlled mess, strong composition.',
    'The French text must be readable, correctly spelled, intentionally placed, and integrated into the scene or editorial layout.',
    'Any visible French micro-text on notes, labels, folders, post-its, documents, captions or CTA must be grammatically correct, meaningful, natural, and idiomatic. Do not invent awkward, broken, incomplete, or nonsensical French phrases.',
    'No fake words, no garbled typography, no extra invented text.',
    'No generic quote card, no Canva template, no corporate LinkedIn visual, no futuristic dashboard.',
    'Avoid corporate stock photo, smiling team, robot, AI brain, hologram, neon, flat vector illustration, clean beige branding.',
  ].join('\n');
}

function buildCarouselCreativeDirection_(data, slideCount, palette) {
  const typePublication = String(data.typePublication || '').trim() || 'carrousel';
  const directionVisuelle = normalizeVisualDirection_(data.directionVisuelle);
  const angle = normalizeEditorialAngle_(data.angleEditorial);
  const visualInstruction = getVisualDirectionInstruction_(directionVisuelle);

  return [
    `Carousel length: ${slideCount} slides.`,
    `Editorial subject: ${data.sujet}.`,
    `Visual scene to depict: ${data.miseEnScene}.`,
    `Publication type: ${typePublication}.`,
    `Visual direction: ${directionVisuelle}.`,
    `Editorial angle: ${angle}.`,
    visualInstruction,
    'Use the visual direction as a creative guide for the full carousel, while choosing the strongest format and framing for each slide.',
    getEditorialAngleInstruction_(angle),
    `Shared palette for every slide: ${palette}.`,
    'Keep the whole carousel visually coherent: same editorial universe, same typographic personality, same color logic, same photographic/documentary material language.',
    'Respect the subject cast exactly: if the scene requests no person, include no visible person, face, silhouette, hand or human body part on any slide.',
    'If the scene describes one or more people, establish that cast from the subject and preserve the same identities throughout the carousel.',
    'CHARACTER CONTINUITY IS MANDATORY: establish a stable cast of characters from the subject and preserve that same cast throughout the carousel.',
    'For every recurring character, keep the same face, apparent age, skin tone, hairstyle, hair color, body shape, clothing, accessories, and professional role across all slides.',
    'If two or more characters are present, do not swap their identities, clothes, positions in the story, or physical traits from one slide to another.',
    'A character may be absent from a slide only when the narrative does not require that person to be visible; when they return, they must remain clearly recognizable.',
    'Characters may change pose, expression, action, or position depending on the slide narrative, but their identity and outfit must remain stable.',
    'Each slide must still be visually different: change framing, object focus, layout rhythm, and narrative beat while preserving cast continuity.',
  ].join('\n');
}

function buildQOORYACarouselSlidePrompt_(data, slide, slideCount, direction) {
  const role = getCarouselSlideRole_(slide, slideCount);

  return [
    'Create one vertical 4:5 Instagram carousel slide for QOORYA.',
    direction,
    `Current slide: ${slide}/${slideCount}.`,
    `Slide role: ${role}.`,
    'Respect the requested cast: do not introduce any person, face, silhouette or hand when the subject specifies that no person is visible.',
    'When recurring characters are requested, preserve their established identity and outfit across slides.',
    'QOORYA BRAND SYSTEM: Use Plus Jakarta Sans Bold or SemiBold for headlines, hooks and subheadings. Use Plus Jakarta Sans Regular or Medium for supporting text and CTA.',
    'Use the sober QOORYA horizontal wordmark only when relevant: it should appear discreetly on the first slide and the final slide, and may be absent on intermediate slides.',
    'When shown, render the wordmark as a minimal dark plum Q symbol with one small warm orange accent, followed by the uppercase word "QOORYA" in spaced dark plum lettering.',
    'Do not invent another logo, decorative lettering, metallic 3D branding or a different wordmark.',
    'BRAND FACTS ARE FIXED: If an email address is displayed, use exactly "qoorya.contact@gmail.com". Never invent another email address, website, phone number or social media handle.',
    'Preserve the established cast continuity for this carousel.',
    'For each character shown in this slide, keep exactly the same face, apparent age, skin tone, hairstyle, hair color, body shape, clothing, accessories, and role as in the other slides.',
    'If multiple characters appear, keep them visually distinct and never swap or blend their identities.',
    'Only pose, action, camera angle, framing, and expression may evolve from one slide to another.',
    'Invent the French text yourself for this specific slide. Make it readable, correctly spelled, concise, and editorially sharp.',
    'Any visible French micro-text on notes, labels, folders, post-its, documents, captions or CTA must be grammatically correct, meaningful, natural, and idiomatic. Do not invent awkward, broken, incomplete, or nonsensical French phrases.',
    'Keep visible text short. Use a clear hierarchy: one main idea per slide, no dense paragraphs.',
    'Do not repeat the exact same hook across slides. Build a coherent narrative progression.',
    'No fake words, no garbled typography, no extra decorative nonsense text.',
    'No Canva template, no generic quote card, no corporate LinkedIn visual, no futuristic dashboard.',
    'Avoid robot, AI brain, hologram, neon, smiling stock team, flat vector illustration, and clean beige branding.',
  ].join('\n');
}

function getCarouselSlideRole_(slide, slideCount) {
  const rolesByCount = {
    3: [
      'Cover: scroll-stopping hook and strong scene.',
      'Core idea: explain the tension, diagnostic, or method.',
      'Resolution: clear takeaway and discreet CTA.',
    ],
    4: [
      'Cover: scroll-stopping hook and strong scene.',
      'Problem: name the hidden cost or tension.',
      'Method or decision: show the useful frame.',
      'Takeaway: conclusion and discreet CTA.',
    ],
    5: [
      'Cover: scroll-stopping hook and strong scene.',
      'Problem: name the tension.',
      'Diagnostic: reveal the underlying cause.',
      'Method: show the practical frame.',
      'Takeaway: concise conclusion and discreet CTA.',
    ],
    6: [
      'Cover: scroll-stopping hook and strong scene.',
      'Context: make the situation recognizable.',
      'Problem: reveal the hidden cost.',
      'Shift: introduce the better frame.',
      'Method: show the sequence or decision logic.',
      'Takeaway: conclusion and discreet CTA.',
    ],
    7: [
      'Cover: scroll-stopping hook and strong scene.',
      'Context: make the situation recognizable.',
      'Problem: reveal the hidden cost.',
      'Diagnostic: name the underlying pattern.',
      'Shift: challenge the default belief.',
      'Method: show the useful frame.',
      'Takeaway: conclusion and discreet CTA.',
    ],
    8: [
      'Cover: scroll-stopping hook and strong scene.',
      'Context: make the situation recognizable.',
      'Symptom: show what people usually notice.',
      'Hidden cost: show what it really costs.',
      'Diagnostic: name the underlying pattern.',
      'Shift: challenge the default belief.',
      'Method: show the useful frame.',
      'Takeaway: conclusion and discreet CTA.',
    ],
  };

  return rolesByCount[slideCount][slide - 1];
}

function getEditorialAngleInstruction_(angleEditorial) {
  const instructions = {
    Alerte:
      'Editorial angle: diagnostic alert. Name a widespread behavior and reveal its hidden cost without sounding anxious or sensationalist.',
    Methode:
      'Editorial angle: method. Show a clear frame, sequence, or protocol the reader can apply.',
    Contre_intuitif:
      'Editorial angle: counter-intuitive. Challenge a dominant belief with positive friction and a scroll-stopping point of view.',
    Demystification:
      'Editorial angle: demystification. Undo a common misconception in a pedagogical, clear, non-aggressive way.',
    Preuve:
      'Editorial angle: proof. Make the method tangible through a concrete case, anonymized deliverable, or measurable result.',
    Decision:
      'Editorial angle: decision. Help a pressured leader choose between two paths and clarify what should be automated, delegated, or kept human.',
    Diagnostic:
      'Editorial angle: diagnostic. Offer a reading grid that creates self-reflection and helps the reader identify their situation.',
    Permission:
      'Editorial angle: permission. Give the reader permission to do less, stop a practice, simplify, or remove unnecessary complexity.',
    Comparaison:
      'Editorial angle: comparison. Show before/after, with/without method, or unclear/structured without moral judgment.',
    Serie:
      'Editorial angle: series. Make the image feel like one episode in a recurring editorial thread with a clear thematic authority.',
  };

  const key = normalizeEditorialAngle_(angleEditorial);
  return instructions[key] || instructions.Methode;
}

function generateOpenAIImageBlob_(prompt, fileName) {
  const apiKey = getOpenAiApiKey_();
  const payload = {
    model: QOORYA_CONFIG.IMAGE_MODEL,
    prompt,
    size: QOORYA_CONFIG.IMAGE_SIZE,
    quality: QOORYA_CONFIG.IMAGE_QUALITY,
    n: 1,
  };

  const response = UrlFetchApp.fetch('https://api.openai.com/v1/images/generations', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });

  const status = response.getResponseCode();
  const body = response.getContentText();

  if (status < 200 || status >= 300) {
    throw new Error(`OpenAI image error ${status}: ${body}`);
  }

  const json = JSON.parse(body);
  const b64 = json && json.data && json.data[0] && json.data[0].b64_json;

  if (!b64) {
    throw new Error(`OpenAI response without b64_json: ${body}`);
  }

  const bytes = Utilities.base64Decode(b64);
  return Utilities.newBlob(bytes, 'image/png', fileName || 'qoorya-image-lab.png');
}

function readRowData_(sheet, row) {
  const columns = QOORYA_CONFIG.COLUMNS;

  return {
    typePublication: String(
      sheet.getRange(row, columns.TYPE_PUBLICATION).getValue() || ''
    ).trim(),

    directionVisuelle: String(
      sheet.getRange(row, columns.DIRECTION_VISUELLE).getValue() || ''
    ).trim(),

    sujet: String(
      sheet.getRange(row, columns.SUJET).getValue() || ''
    ).trim(),

    angleEditorial: String(
      sheet.getRange(row, columns.ANGLE_EDITORIAL).getValue() || ''
    ).trim(),

    miseEnScene: String(
      sheet.getRange(row, columns.MISE_EN_SCENE).getValue() || ''
    ).trim(),

    nbSlides: sheet.getRange(row, columns.NB_SLIDES).getValue(),
  };
}

function setRowResult_(sheet, row, status, imageUrl, notes) {
  const columns = QOORYA_CONFIG.COLUMNS;
  sheet.getRange(row, columns.STATUT).setValue(status);

  if (imageUrl !== '') {
    sheet.getRange(row, columns.LIENS_VISUELS_DRIVE).setValue(imageUrl);
  }

  if (notes !== '') {
    sheet.getRange(row, columns.NOTES).setValue(notes);
  }
}

function getOpenAiApiKey_() {
  const key = PropertiesService.getScriptProperties().getProperty(
    QOORYA_CONFIG.OPENAI_API_KEY_PROPERTY
  );

  if (!key) {
    throw new Error(
      'Cle API manquante. Ajoute OPENAI_API_KEY dans Parametres du projet > Proprietes du script.'
    );
  }

  return key;
}

function getImageLabSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return spreadsheet.getSheetByName(QOORYA_CONFIG.SHEET_NAME) || spreadsheet.getActiveSheet();
}

function getActiveRowInSheet_(sheet) {
  const range = SpreadsheetApp.getActiveSpreadsheet().getActiveRange();

  if (!range || range.getSheet().getSheetId() !== sheet.getSheetId()) {
    return null;
  }

  const row = range.getRow();
  return row > 1 ? row : null;
}

function promptForRowNumber_(message) {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('QOORYA Image Lab', message, ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) {
    return null;
  }

  const row = Number(response.getResponseText());

  if (!row || row <= 1) {
    ui.alert('Entre un numero de ligne valide, par exemple 2.');
    return null;
  }

  return row;
}

function saveImageBlobToDrive_(blob) {
  const folder = DriveApp.getFolderById(QOORYA_CONFIG.OUTPUT_FOLDER_ID);
  return folder.createFile(blob);
}

function buildImageFileName_(row, type) {
  const safeType = String(type || 'image').replace(/[^a-zA-Z0-9_-]/g, '_');
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
  return `qoorya-image-lab-row-${row}-${safeType}-${stamp}.png`;
}

function buildCarouselFileName_(row, slide, slideCount, type) {
  const safeType = String(type || 'carousel').replace(/[^a-zA-Z0-9_-]/g, '_');
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
  return `qoorya-carousel-row-${row}-slide-${slide}-of-${slideCount}-${safeType}-${stamp}.png`;
}

function pickPalette_(type, sujet) {
  const seed = `${type} ${sujet}`;
  let total = 0;

  for (let i = 0; i < seed.length; i += 1) {
    total += seed.charCodeAt(i);
  }

  return QOORYA_PALETTES[total % QOORYA_PALETTES.length];
}

function normalizeEditorialAngle_(value) {
  const raw = String(value || '').trim();
  const ascii = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  if (ascii === 'alerte') return 'Alerte';
  if (ascii === 'methode') return 'Methode';
  if (ascii === 'contre-intuitif') return 'Contre_intuitif';
  if (ascii === 'demystification') return 'Demystification';
  if (ascii === 'preuve') return 'Preuve';
  if (ascii === 'decision') return 'Decision';
  if (ascii === 'diagnostic') return 'Diagnostic';
  if (ascii === 'permission') return 'Permission';
  if (ascii === 'comparaison') return 'Comparaison';
  if (ascii === 'serie') return 'Serie';

  return 'Methode';
}

function normalizeVisualDirection_(value) {
  const raw = String(value || '').trim();
  const ascii = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  if (ascii === 'libre') return 'Libre';
  if (ascii === 'documentaire reel') return 'Documentaire_reel';
  if (ascii === 'objet / dossier / papier' || ascii === 'objet dossier papier') {
    return 'Objet_dossier_papier';
  }
  if (ascii === 'atelier de decision') return 'Atelier_decision';
  if (ascii === 'avant-apres' || ascii === 'avant apres') return 'Avant_apres';
  if (ascii === 'scene metier avec personnage') return 'Scene_metier_personnage';
  if (ascii === 'preuve terrain') return 'Preuve_terrain';
  if (ascii === 'systeme imprime') return 'Systeme_imprime';
  if (ascii === 'contraste visuel fort') return 'Contraste_visuel_fort';
  if (ascii === 'image metaphorique realiste') return 'Image_metaphorique_realiste';

  return 'Documentaire_reel';
}

function getVisualDirectionInstruction_(directionVisuelle) {
  return QOORYA_VISUAL_DIRECTIONS[directionVisuelle] || QOORYA_VISUAL_DIRECTIONS.Documentaire_reel;
}
function generateNextCarouselSlideByNumber() {
  const row = promptForRowNumber_('Numero de ligne du carrousel a poursuivre ?');
  if (!row) return;

  processNextCarouselSlide_(getImageLabSheet_(), row);
}

function processNextCarouselSlide_(sheet, row) {
  const data = readRowData_(sheet, row);
  const slideCount = Number(data.nbSlides || 0);
  const columns = QOORYA_CONFIG.COLUMNS;

  if (!data.typePublication || !data.directionVisuelle || !data.sujet || !data.miseEnScene) {
    setRowResult_(sheet, row, 'ERROR', '', 'Type, Direction visuelle, Sujet ou Mise en scene manquant.');
    return;
  }

  if (!slideCount || slideCount < 3 || slideCount > 8) {
    setRowResult_(sheet, row, 'ERROR', '', 'Nb slides doit etre compris entre 3 et 8.');
    return;
  }

  const existingLinks = String(
    sheet.getRange(row, columns.LIENS_VISUELS_DRIVE).getValue() || ''
  ).trim();

  const matches = [...existingLinks.matchAll(/Slide\s+(\d+)\/(\d+):/g)];
  const completedSlides = matches.length
    ? Math.max(...matches.map(match => Number(match[1])))
    : 0;

  if (completedSlides >= slideCount) {
    sheet.getRange(row, columns.STATUT).setValue('DONE carrousel');
    SpreadsheetApp.getUi().alert('Ce carrousel est deja complet.');
    return;
  }

  const nextSlide = completedSlides + 1;
  const palette = pickPalette_(
  `${data.typePublication} ${data.directionVisuelle} ${data.angleEditorial} carousel`,
  `${data.sujet} ${data.miseEnScene}`
  );
  const direction = buildCarouselCreativeDirection_(data, slideCount, palette);
  const prompt = buildQOORYACarouselSlidePrompt_(data, nextSlide, slideCount, direction);

  sheet
    .getRange(row, columns.STATUT)
    .setValue(`GENERATING_SLIDE_${nextSlide}_OF_${slideCount}`);
  SpreadsheetApp.flush();

  try {
    const imageBlob = generateOpenAIImageBlob_(
      prompt,
      buildCarouselFileName_(row, nextSlide, slideCount, data.directionVisuelle)
    );
    const file = saveImageBlobToDrive_(imageBlob);
    const newLink = `Slide ${nextSlide}/${slideCount}: ${file.getUrl()}`;
    const updatedLinks = existingLinks
      ? `${existingLinks}\n${newLink}`
      : newLink;

    const existingNotes = String(
      sheet.getRange(row, columns.NOTES).getValue() || ''
    ).trim();
    const newNote = `--- Slide ${nextSlide}/${slideCount} ---\n${prompt}`;
    const updatedNotes = existingNotes
      ? `${existingNotes}\n\n${newNote}`
      : newNote;

    sheet.getRange(row, columns.LIENS_VISUELS_DRIVE).setValue(updatedLinks);
    sheet.getRange(row, columns.NOTES).setValue(updatedNotes);
    sheet
      .getRange(row, columns.STATUT)
      .setValue(nextSlide === slideCount ? 'DONE carrousel' : `PARTIAL_CAROUSEL_${nextSlide}_OF_${slideCount}`);

    SpreadsheetApp.getUi().alert(
      nextSlide === slideCount
        ? 'Carrousel termine.'
        : `Slide ${nextSlide}/${slideCount} generee. Relance pour la suivante.`
    );
    } catch (error) {
    sheet.getRange(row, columns.STATUT).setValue(QOORYA_STATUS.ERROR);
    appendRowNote_(
      sheet,
      row,
      `Erreur slide ${nextSlide}/${slideCount}: ${String(error && error.message ? error.message : error)}`
    );
    throw error;
  }
}
function regenerateCarouselSlideByNumber() {
  const row = promptForRowNumber_('Numero de ligne du carrousel a corriger ?');
  if (!row) return;

  const sheet = getImageLabSheet_();
  const data = readRowData_(sheet, row);
  const slideCount = Number(data.nbSlides || 0);

  if (!slideCount || slideCount < 3 || slideCount > 8) {
    SpreadsheetApp.getUi().alert('La ligne choisie ne contient pas un carrousel valide.');
    return;
  }

  const slide = promptForSlideNumber_(slideCount);
  if (!slide) return;

  regenerateCarouselSlide_(sheet, row, slide);
}

function promptForSlideNumber_(slideCount) {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'QOORYA Image Lab',
    `Numero de slide a regenerer, entre 1 et ${slideCount} ?`,
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) {
    return null;
  }

  const slide = Number(response.getResponseText());

  if (!slide || slide < 1 || slide > slideCount) {
    ui.alert(`Entre un numero de slide valide, entre 1 et ${slideCount}.`);
    return null;
  }

  return slide;
}

function regenerateCarouselSlide_(sheet, row, slide) {
  const data = readRowData_(sheet, row);
  const slideCount = Number(data.nbSlides || 0);
  const columns = QOORYA_CONFIG.COLUMNS;

  if (!data.typePublication || !data.directionVisuelle || !data.sujet || !data.miseEnScene) {
    SpreadsheetApp.getUi().alert(
      'Type, Direction visuelle, Sujet ou Mise en scene manquant.'
    );
    return;
  }

  if (!slideCount || slideCount < 3 || slideCount > 8) {
    SpreadsheetApp.getUi().alert('Nb slides doit etre compris entre 3 et 8.');
    return;
  }

  const existingLinks = String(
    sheet.getRange(row, columns.LIENS_VISUELS_DRIVE).getValue() || ''
  ).trim();

  const linkPattern = new RegExp(
    `(^|\\n)Slide\\s+${slide}\\/${slideCount}:\\s*[^\\n]*(?=\\n|$)`
  );

  if (!linkPattern.test(existingLinks)) {
    SpreadsheetApp.getUi().alert(
      `La slide ${slide}/${slideCount} n existe pas encore dans cette ligne.`
    );
    return;
  }

  const palette = pickPalette_(
    `${data.typePublication} ${data.directionVisuelle} ${data.angleEditorial} carousel`,
    `${data.sujet} ${data.miseEnScene}`
  );

  const direction = buildCarouselCreativeDirection_(data, slideCount, palette);
  const prompt = buildQOORYACarouselSlidePrompt_(
    data,
    slide,
    slideCount,
    direction
  );

  const previousStatus = String(
    sheet.getRange(row, columns.STATUT).getValue() || ''
  ).trim();

  sheet
    .getRange(row, columns.STATUT)
    .setValue(`REGENERATING_SLIDE_${slide}_OF_${slideCount}`);
  SpreadsheetApp.flush();

  try {
    const imageBlob = generateOpenAIImageBlob_(
      prompt,
      buildCarouselFileName_(row, slide, slideCount, data.directionVisuelle)
    );

    const file = saveImageBlobToDrive_(imageBlob);
    const newLink = `Slide ${slide}/${slideCount}: ${file.getUrl()}`;

    const updatedLinks = existingLinks.replace(
      linkPattern,
      function(match, prefix) {
        return `${prefix}${newLink}`;
      }
    );

    const existingNotes = String(
      sheet.getRange(row, columns.NOTES).getValue() || ''
    ).trim();

    const newNote = `--- Slide ${slide}/${slideCount} ---\n${prompt}`;

    const notePattern = new RegExp(
      `(^|\\n\\n)--- Slide ${slide}\\/${slideCount} ---\\n[\\s\\S]*?(?=\\n\\n--- Slide \\d+\\/${slideCount} ---|$)`
    );

    const updatedNotes = notePattern.test(existingNotes)
      ? existingNotes.replace(notePattern, function(match, prefix) {
          return `${prefix}${newNote}`;
        })
      : `${existingNotes}\n\n${newNote}`.trim();

    sheet
      .getRange(row, columns.LIENS_VISUELS_DRIVE)
      .setValue(updatedLinks);

    sheet
      .getRange(row, columns.NOTES)
      .setValue(updatedNotes);

    sheet
      .getRange(row, columns.STATUT)
      .setValue('DONE carrousel');

    SpreadsheetApp.getUi().alert(
      `Slide ${slide}/${slideCount} regeneree avec succes.`
    );
  } catch (error) {
    sheet
      .getRange(row, columns.STATUT)
      .setValue(previousStatus || 'ERROR');

    SpreadsheetApp.getUi().alert(
      `Erreur pendant la regeneration de la slide ${slide}/${slideCount}.`
    );

    throw error;
  }
}
const QOORYA_AUTOMATION = {
  ROW_PROPERTY: 'QOORYA_AUTOMATED_CAROUSEL_ROW',
  HANDLER: 'continueAutomatedCarouselGeneration_',
  DELAY_MS: 60 * 1000,
};

function startAutomatedCarouselByNumber() {
  const row = promptForRowNumber_('Numero de ligne du carrousel a automatiser ?');
  if (!row) return;

  const sheet = getImageLabSheet_();
  const data = readRowData_(sheet, row);
  const slideCount = Number(data.nbSlides || 0);
    const existingLinks = String(
    sheet.getRange(row, QOORYA_CONFIG.COLUMNS.LIENS_VISUELS_DRIVE).getValue() || ''
  ).trim();

  const matches = [...existingLinks.matchAll(/Slide\s+(\d+)\/(\d+):/g)];
  const completedSlides = matches.length
    ? Math.max(...matches.map(match => Number(match[1])))
    : 0;

  if (completedSlides >= slideCount && slideCount > 0) {
    SpreadsheetApp.getUi().alert(
      `Ce carrousel semble deja complet: ${completedSlides}/${slideCount} slides. Utilise "Regenerer une slide precise" si tu veux corriger une slide.`
    );
    return;
  }

  if (!data.typePublication || !data.directionVisuelle || !data.sujet || !data.miseEnScene) {
    SpreadsheetApp.getUi().alert('Type, Direction visuelle, Sujet ou Mise en scene manquant.');
    return;
  }

  if (!slideCount || slideCount < 3 || slideCount > 8) {
    SpreadsheetApp.getUi().alert('Nb slides doit etre compris entre 3 et 8.');
    return;
  }

  PropertiesService
    .getScriptProperties()
    .setProperty(QOORYA_AUTOMATION.ROW_PROPERTY, String(row));

  deleteAutomatedCarouselTriggers_();

  SpreadsheetApp.getUi().alert(
    `Automatisation lancee pour la ligne ${row}. Une slide va etre generee maintenant, puis les suivantes automatiquement.`
  );

  continueAutomatedCarouselGeneration_();
}

function stopAutomatedCarouselGeneration() {
  deleteAutomatedCarouselTriggers_();

  PropertiesService
    .getScriptProperties()
    .deleteProperty(QOORYA_AUTOMATION.ROW_PROPERTY);

  SpreadsheetApp.getUi().alert('Automatisation carrousel arretee.');
}

function continueAutomatedCarouselGeneration_() {
  const lock = LockService.getScriptLock();

  if (!lock.tryLock(5000)) {
    scheduleNextAutomatedCarouselRun_();
    return;
  }

  try {
    const props = PropertiesService.getScriptProperties();
    const row = Number(props.getProperty(QOORYA_AUTOMATION.ROW_PROPERTY));

    if (!row) {
      deleteAutomatedCarouselTriggers_();
      return;
    }

    const sheet = getImageLabSheet_();
    const result = generateNextCarouselSlideWithoutUi_(sheet, row);

    if (result.done) {
      props.deleteProperty(QOORYA_AUTOMATION.ROW_PROPERTY);
      deleteAutomatedCarouselTriggers_();
      return;
    }

    scheduleNextAutomatedCarouselRun_();
  } finally {
    lock.releaseLock();
  }
}

function generateNextCarouselSlideWithoutUi_(sheet, row) {
  const data = readRowData_(sheet, row);
  const slideCount = Number(data.nbSlides || 0);
  const columns = QOORYA_CONFIG.COLUMNS;

  if (!data.typePublication || !data.directionVisuelle || !data.sujet || !data.miseEnScene) {
    setRowResult_(sheet, row, 'ERROR', '', 'Type, Direction visuelle, Sujet ou Mise en scene manquant.');
    return { done: true };
  }

  if (!slideCount || slideCount < 3 || slideCount > 8) {
    setRowResult_(sheet, row, 'ERROR', '', 'Nb slides doit etre compris entre 3 et 8.');
    return { done: true };
  }

  const existingLinks = String(
    sheet.getRange(row, columns.LIENS_VISUELS_DRIVE).getValue() || ''
  ).trim();

  const matches = [...existingLinks.matchAll(/Slide\s+(\d+)\/(\d+):/g)];
  const completedSlides = matches.length
    ? Math.max(...matches.map(match => Number(match[1])))
    : 0;

  if (completedSlides >= slideCount) {
    sheet.getRange(row, columns.STATUT).setValue(QOORYA_STATUS.DONE_CAROUSEL);
    appendRowNote_(
      sheet,
      row,
      `Automatisation terminee: ${completedSlides}/${slideCount} slides deja presentes.`
    );
    return { done: true };
  }

  const nextSlide = completedSlides + 1;

  const palette = pickPalette_(
    `${data.typePublication} ${data.directionVisuelle} ${data.angleEditorial} carousel`,
    `${data.sujet} ${data.miseEnScene}`
  );

  const direction = buildCarouselCreativeDirection_(data, slideCount, palette);
  const prompt = buildQOORYACarouselSlidePrompt_(data, nextSlide, slideCount, direction);

  sheet
    .getRange(row, columns.STATUT)
    .setValue(`AUTO_GENERATING_SLIDE_${nextSlide}_OF_${slideCount}`);
  SpreadsheetApp.flush();

  try {
    const imageBlob = generateOpenAIImageBlob_(
      prompt,
      buildCarouselFileName_(row, nextSlide, slideCount, data.directionVisuelle)
    );

    const file = saveImageBlobToDrive_(imageBlob);
    const newLink = `Slide ${nextSlide}/${slideCount}: ${file.getUrl()}`;

    const updatedLinks = existingLinks
      ? `${existingLinks}\n${newLink}`
      : newLink;

    const existingNotes = String(
      sheet.getRange(row, columns.NOTES).getValue() || ''
    ).trim();

    const newNote = `--- Slide ${nextSlide}/${slideCount} ---\n${prompt}`;

    const updatedNotes = existingNotes
      ? `${existingNotes}\n\n${newNote}`
      : newNote;

    sheet.getRange(row, columns.LIENS_VISUELS_DRIVE).setValue(updatedLinks);
    sheet.getRange(row, columns.NOTES).setValue(updatedNotes);

    const done = nextSlide >= slideCount;

    sheet
      .getRange(row, columns.STATUT)
      .setValue(done ? QOORYA_STATUS.DONE_CAROUSEL : `AUTO_PARTIAL_CAROUSEL_${nextSlide}_OF_${slideCount}`);

    return { done };
  } catch (error) {
    const existingNotes = String(
      sheet.getRange(row, columns.NOTES).getValue() || ''
    ).trim();

    const errorNote = `ERROR slide ${nextSlide}/${slideCount}: ${String(error && error.message ? error.message : error)}`;

    sheet.getRange(row, columns.STATUT).setValue(QOORYA_STATUS.ERROR);
    sheet
      .getRange(row, columns.NOTES)
      .setValue(existingNotes ? `${existingNotes}\n\n${errorNote}` : errorNote);

    return { done: true };
  }
}

function scheduleNextAutomatedCarouselRun_() {
  deleteAutomatedCarouselTriggers_();

  Utilities.sleep(300);

  ScriptApp
    .newTrigger(QOORYA_AUTOMATION.HANDLER)
    .timeBased()
    .after(QOORYA_AUTOMATION.DELAY_MS)
    .create();
}

function deleteAutomatedCarouselTriggers_() {
  const triggers = ScriptApp.getProjectTriggers();

  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === QOORYA_AUTOMATION.HANDLER) {
      ScriptApp.deleteTrigger(trigger);
    }
  });
}
function diagnoseRowByNumber() {
  const row = promptForRowNumber_('Numero de ligne a diagnostiquer ?');
  if (!row) return;

  const sheet = getImageLabSheet_();
  const data = readRowData_(sheet, row);
  const columns = QOORYA_CONFIG.COLUMNS;
  const issues = [];

  if (!data.typePublication) issues.push('Type de publication manquant.');
  if (!data.directionVisuelle) issues.push('Direction visuelle manquante.');
  if (!data.sujet) issues.push('Sujet manquant.');
  if (!data.angleEditorial) issues.push('Angle editorial manquant.');
  if (!data.miseEnScene) issues.push('Mise en scene des visuels manquante.');

  const normalizedType = String(data.typePublication || '').trim().toLowerCase();
  const slideCount = Number(data.nbSlides || 0);

  if (normalizedType === 'carrousel') {
    if (!slideCount || slideCount < 3 || slideCount > 8) {
      issues.push('Nb slides doit etre compris entre 3 et 8 pour un carrousel.');
    }
  }

  const links = String(
    sheet.getRange(row, columns.LIENS_VISUELS_DRIVE).getValue() || ''
  ).trim();

  const status = String(
    sheet.getRange(row, columns.STATUT).getValue() || ''
  ).trim();

  const message = issues.length
    ? `Diagnostic ligne ${row}:\n\n${issues.join('\n')}`
    : `Diagnostic ligne ${row}: OK.\n\nStatut actuel: ${status || '(vide)'}\nLiens visuels: ${links ? 'presents' : 'absents'}`;

  SpreadsheetApp.getUi().alert(message);
}

function appendRowNote_(sheet, row, note) {
  const columns = QOORYA_CONFIG.COLUMNS;
  const existingNotes = String(
    sheet.getRange(row, columns.NOTES).getValue() || ''
  ).trim();

  const stamp = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    'yyyy-MM-dd HH:mm:ss'
  );

  const entry = `[${stamp}] ${note}`;

  sheet
    .getRange(row, columns.NOTES)
    .setValue(existingNotes ? `${existingNotes}\n\n${entry}` : entry);
}
const QOORYA_STATUS = {
  TODO: 'TODO',
  GENERATING_POST: 'GENERATING Post simple',
  GENERATING_CAROUSEL: 'GENERATING carrousel',
  DONE_POST: 'DONE Post simple',
  DONE_CAROUSEL: 'DONE carrousel',
  READY_TO_PUBLISH: 'READY TO PUBLISH',
  UPLOADING_CLOUDINARY: 'UPLOADING Cloudinary',
  READY_FOR_INSTAGRAM: 'READY FOR INSTAGRAM',
  PUBLISHING_INSTAGRAM: 'PUBLISHING Instagram',
  PUBLISHED: 'PUBLISHED',
  ERROR_PUBLICATION: 'ERROR publication',
  ERROR: 'ERROR',
};
function showAutomatedCarouselStatus() {
  const props = PropertiesService.getScriptProperties();
  const row = props.getProperty(QOORYA_AUTOMATION.ROW_PROPERTY);
  const triggers = ScriptApp.getProjectTriggers().filter(trigger =>
    trigger.getHandlerFunction() === QOORYA_AUTOMATION.HANDLER
  );

  const message = [
    'Etat automatisation carrousel:',
    '',
    `Ligne active: ${row || '(aucune)'}`,
    `Declencheur programme: ${triggers.length ? 'oui' : 'non'}`,
    `Nombre de declencheurs: ${triggers.length}`,
  ].join('\n');

  SpreadsheetApp.getUi().alert(message);
}
function generateCaptionForActiveRow() {
  const sheet = getImageLabSheet_();
  const row = sheet.getActiveRange().getRow();

  if (row <= 1) {
    throw new Error('Selectionne une ligne de contenu, pas la ligne d en-tete.');
  }

  processCaptionRow_(sheet, row);
}

function generateCaptionForRowPrompt() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'Rediger caption',
    'Numero de ligne a traiter :',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const row = Number(response.getResponseText());
  if (!row || row <= 1) {
    ui.alert('Numero de ligne invalide.');
    return;
  }

  processCaptionRow_(getImageLabSheet_(), row);
}

function processCaptionRow_(sheet, row) {
  const c = getQOORYACaptionColumns_();
  const values = sheet.getRange(row, 1, 1, 12).getValues()[0];

  const rowData = {
    type: values[c.TYPE - 1],
    directionVisuelle: values[c.DIRECTION_VISUELLE - 1],
    sujet: values[c.SUJET - 1],
    angleEditorial: values[c.ANGLE_EDITORIAL - 1],
    miseEnScene: values[c.MISE_EN_SCENE - 1],
    nbSlides: values[c.NB_SLIDES - 1],
    liensVisuels: values[c.LIENS_VISUELS_DRIVE - 1],
  };

  if (!rowData.sujet || !rowData.angleEditorial || !rowData.miseEnScene) {
    throw new Error('Sujet, angle editorial ou mise en scene manquant.');
  }

  const existingCaption = String(sheet.getRange(row, c.LEGENDE).getValue() || '').trim();
  const existingHashtags = String(sheet.getRange(row, c.HASHTAGS).getValue() || '').trim();

  if (existingCaption || existingHashtags) {
    const ui = SpreadsheetApp.getUi();
    const confirm = ui.alert(
      'Caption deja presente',
      'Remplacer la legende et les hashtags existants ?',
      ui.ButtonSet.YES_NO
    );
    if (confirm !== ui.Button.YES) return;
  }

  const prompt = buildQOORYACaptionPrompt_(rowData);
  const result = generateQOORYACaptionJson_(prompt);

  sheet.getRange(row, c.LEGENDE).setValue(result.caption);
  sheet.getRange(row, c.HASHTAGS).setValue(result.hashtags.join(' '));
}

function buildQOORYACaptionPrompt_(rowData) {
  return [
    'Redige une legende Instagram finale pour QOORYA.',
    '',
    'Contexte de la publication :',
    `Type : ${rowData.type}`,
    `Direction visuelle : ${rowData.directionVisuelle}`,
    `Sujet : ${rowData.sujet}`,
    `Angle editorial : ${rowData.angleEditorial}`,
    `Mise en scene : ${rowData.miseEnScene}`,
    `Nombre de slides : ${rowData.nbSlides}`,
    '',
    'Contraintes editoriales :',
    '- Ton clair, sobre, utile, non corporate.',
    '- Ne pas decrire platement le visuel.',
    '- Prolonger l idee du carrousel.',
    '- Ne pas faire de promesse magique sur l IA.',
    '- Pas de survente, pas de jargon.',
    '- Finir par un CTA naturel et discret.',
    '- Texte en francais naturel.',
    '',
    'Format attendu :',
    '- Une caption Instagram prete a publier.',
    '- 6 a 8 hashtags maximum, pertinents, sobres, sans inflation.',
    '- Eviter les hashtags trop generiques ou opportunistes.',
  ].join('\n');
}

function generateQOORYACaptionJson_(prompt) {
  const apiKey = getOpenAiApiKey_();

  const payload = {
    model: 'gpt-4.1-mini',
    input: prompt,
    text: {
      format: {
        type: 'json_schema',
        name: 'qoorya_caption',
        strict: true,
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            caption: { type: 'string' },
            hashtags: {
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ['caption', 'hashtags']
        }
      }
    }
  };

  const response = UrlFetchApp.fetch('https://api.openai.com/v1/responses', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });

  const status = response.getResponseCode();
  const body = response.getContentText();

  if (status < 200 || status >= 300) {
    throw new Error(`OpenAI caption error ${status}: ${body}`);
  }

  const json = JSON.parse(body);
  const text = extractOpenAIResponseText_(json);
  return JSON.parse(text);
}

function extractOpenAIResponseText_(json) {
  if (json.output_text) return json.output_text;

  const output = json.output || [];
  for (let i = 0; i < output.length; i += 1) {
    const content = output[i].content || [];
    for (let j = 0; j < content.length; j += 1) {
      if (content[j].text) return content[j].text;
    }
  }

  throw new Error('Reponse OpenAI sans texte exploitable.');
}

function getQOORYACaptionColumns_() {
  const cols = QOORYA_CONFIG.COLUMNS || {};

  return {
    TYPE: cols.TYPE || 2,
    DIRECTION_VISUELLE: cols.DIRECTION_VISUELLE || cols.DIRECTION_VISUELLE || 3,
    SUJET: cols.SUJET || 4,
    ANGLE_EDITORIAL: cols.ANGLE_EDITORIAL || 5,
    MISE_EN_SCENE: cols.MISE_EN_SCENE_VISUELS || cols.MISE_EN_SCENE || 6,
    NB_SLIDES: cols.NB_SLIDES || 7,
    LEGENDE: cols.LEGENDE || 8,
    HASHTAGS: cols.HASHTAGS || 9,
    LIENS_VISUELS_DRIVE: cols.LIENS_VISUELS_DRIVE || cols.LIEN_VISUEL_DRIVE || 10,
  };
}
function markActiveRowReadyToPublish() {
  const sheet = getImageLabSheet_();
  const row = sheet.getActiveRange().getRow();

  if (row <= 1) {
    throw new Error('Selectionne une ligne de contenu, pas la ligne d en-tete.');
  }

  markRowReadyToPublish_(sheet, row);
}

function markRowReadyToPublishByNumber() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'Marquer pret a publier',
    'Numero de ligne a valider :',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const row = Number(response.getResponseText());
  if (!row || row <= 1) {
    ui.alert('Numero de ligne invalide.');
    return;
  }

  markRowReadyToPublish_(getImageLabSheet_(), row);
}

function diagnosePublicationReadinessByNumber() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'Diagnostic publication',
    'Numero de ligne a diagnostiquer :',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const row = Number(response.getResponseText());
  if (!row || row <= 1) {
    ui.alert('Numero de ligne invalide.');
    return;
  }

  const sheet = getImageLabSheet_();
  const result = validatePublicationReadiness_(sheet, row);

  if (result.errors.length) {
    ui.alert('Pas pret a publier', result.errors.join('\n'), ui.ButtonSet.OK);
    return;
  }

  ui.alert('Pret a publier', 'La ligne est complete : visuel, legende et hashtags sont presents.', ui.ButtonSet.OK);
}

function markRowReadyToPublish_(sheet, row) {
  const ui = SpreadsheetApp.getUi();
  const c = getQOORYAPublishingColumns_();
  const result = validatePublicationReadiness_(sheet, row);

  if (result.errors.length) {
    ui.alert('Pas pret a publier', result.errors.join('\n'), ui.ButtonSet.OK);
    return;
  }

  const status = String(sheet.getRange(row, c.STATUT).getValue() || '').trim();

  if (status === getQOORYAStatus_('PUBLISHED', 'PUBLISHED')) {
    ui.alert('Ligne deja publiee', 'Cette ligne est deja marquee comme publiee.', ui.ButtonSet.OK);
    return;
  }

  sheet.getRange(row, c.STATUT).setValue(getQOORYAStatus_('READY_TO_PUBLISH', 'READY TO PUBLISH'));

  if (typeof appendRowNote_ === 'function') {
    appendRowNote_(sheet, row, 'Validation publication : ligne marquee READY TO PUBLISH.');
  }

  ui.alert('Pret a publier', `Ligne ${row} marquee READY TO PUBLISH.`, ui.ButtonSet.OK);
}

function validatePublicationReadiness_(sheet, row) {
  const c = getQOORYAPublishingColumns_();
  const values = sheet.getRange(row, 1, 1, 12).getValues()[0];

  const type = String(values[c.TYPE - 1] || '').trim();
  const sujet = String(values[c.SUJET - 1] || '').trim();
  const legende = String(values[c.LEGENDE - 1] || '').trim();
  const hashtags = String(values[c.HASHTAGS - 1] || '').trim();
  const liens = String(values[c.LIENS_VISUELS_DRIVE - 1] || '').trim();
  const statut = String(values[c.STATUT - 1] || '').trim();

  const errors = [];

  if (!type) errors.push('- Type de publication manquant.');
  if (!sujet) errors.push('- Sujet manquant.');
  if (!liens) errors.push('- Aucun lien visuel Drive.');
  if (!legende) errors.push('- Legende manquante.');
  if (!hashtags) errors.push('- Hashtags manquants.');

  const validDoneStatuses = [
    getQOORYAStatus_('DONE_CAROUSEL', 'DONE carrousel'),
    getQOORYAStatus_('DONE_POST', 'DONE Post simple'),
    getQOORYAStatus_('READY_TO_PUBLISH', 'READY TO PUBLISH'),
  ];

    if (
    statut &&
    validDoneStatuses.indexOf(statut) === -1 &&
    !isDoneCreativeStatus_(statut)
  ) {
    errors.push(`- Statut actuel non publiable : ${statut}.`);
  }

  return { errors };
}

function getQOORYAPublishingColumns_() {
  const cols = QOORYA_CONFIG.COLUMNS || {};

  return {
    TYPE: cols.TYPE || 2,
    SUJET: cols.SUJET || 4,
    LEGENDE: cols.LEGENDE || 8,
    HASHTAGS: cols.HASHTAGS || 9,
    LIENS_VISUELS_DRIVE: cols.LIENS_VISUELS_DRIVE || cols.LIEN_VISUEL_DRIVE || 10,
    STATUT: cols.STATUT || 11,
    NOTES: cols.NOTES || 12,
    CLOUDINARY_URLS: cols.CLOUDINARY_URLS || 13,
    INSTAGRAM_URL: cols.INSTAGRAM_URL || 14,
  };
}

function getQOORYAStatus_(key, fallback) {
  if (typeof QOORYA_STATUS !== 'undefined' && QOORYA_STATUS && QOORYA_STATUS[key]) {
    return QOORYA_STATUS[key];
  }

  return fallback;
}
function uploadActiveRowVisualsToCloudinary() {
  const sheet = getImageLabSheet_();
  const row = sheet.getActiveRange().getRow();

  if (row <= 1) {
    throw new Error('Selectionne une ligne de contenu, pas la ligne d en-tete.');
  }

  uploadRowVisualsToCloudinary_(sheet, row);
}

function uploadRowVisualsToCloudinaryByNumber() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'Upload Cloudinary',
    'Numero de ligne a traiter :',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const row = Number(response.getResponseText());
  if (!row || row <= 1) {
    ui.alert('Numero de ligne invalide.');
    return;
  }

  uploadRowVisualsToCloudinary_(getImageLabSheet_(), row);
}

function uploadRowVisualsToCloudinary_(sheet, row) {
  const ui = SpreadsheetApp.getUi();
  const c = getQOORYAPublishingColumns_();

  const status = String(sheet.getRange(row, c.STATUT).getValue() || '').trim();
  if (status !== getQOORYAStatus_('READY_TO_PUBLISH', 'READY TO PUBLISH')) {
    ui.alert(
      'Statut non valide',
      'La ligne doit etre en READY TO PUBLISH avant upload Cloudinary.',
      ui.ButtonSet.OK
    );
    return;
  }

  const existingCloudinaryUrls = String(sheet.getRange(row, c.CLOUDINARY_URLS).getValue() || '').trim();
  if (existingCloudinaryUrls) {
    const confirm = ui.alert(
      'Liens Cloudinary deja presents',
      'Remplacer les liens Cloudinary existants ?',
      ui.ButtonSet.YES_NO
    );
    if (confirm !== ui.Button.YES) return;
  }

  const driveLinks = String(sheet.getRange(row, c.LIENS_VISUELS_DRIVE).getValue() || '').trim();
  const urls = splitMultilineLinks_(driveLinks);

  if (!urls.length) {
    ui.alert('Aucun lien Drive', 'La colonne Liens visuels Drive est vide.', ui.ButtonSet.OK);
    return;
  }

  sheet.getRange(row, c.STATUT).setValue(getQOORYAStatus_('UPLOADING_CLOUDINARY', 'UPLOADING Cloudinary'));
  SpreadsheetApp.flush();

  try {
    const cloudinaryUrls = urls.map(function(url, index) {
      return uploadDriveImageUrlToCloudinary_(url, row, index + 1);
    });

    sheet.getRange(row, c.CLOUDINARY_URLS).setValue(cloudinaryUrls.join('\n'));
    sheet.getRange(row, c.STATUT).setValue(getQOORYAStatus_('READY_FOR_INSTAGRAM', 'READY FOR INSTAGRAM'));

    if (typeof appendRowNote_ === 'function') {
      appendRowNote_(sheet, row, 'Cloudinary : ' + cloudinaryUrls.length + ' visuel(s) uploade(s).');
    }

    ui.alert('Cloudinary OK', cloudinaryUrls.length + ' visuel(s) uploade(s).', ui.ButtonSet.OK);
  } catch (error) {
    sheet.getRange(row, c.STATUT).setValue(getQOORYAStatus_('ERROR_PUBLICATION', 'ERROR publication'));

    if (typeof appendRowNote_ === 'function') {
      appendRowNote_(sheet, row, 'Erreur Cloudinary : ' + String(error && error.message ? error.message : error));
    }

    throw error;
  }
}

function uploadDriveImageUrlToCloudinary_(driveUrl, row, slideNumber) {
  const fileId = extractDriveFileId_(driveUrl);
  if (!fileId) {
    throw new Error('Impossible de lire l ID Drive depuis : ' + driveUrl);
  }

  const file = DriveApp.getFileById(fileId);
  const blob = file.getBlob();
  const contentType = blob.getContentType() || 'image/png';
  const base64 = Utilities.base64Encode(blob.getBytes());

  return uploadBase64ToCloudinary_(
    'data:' + contentType + ';base64,' + base64,
    buildCloudinaryPublicId_(row, slideNumber)
  );
}

function uploadBase64ToCloudinary_(dataUri, publicId) {
  const cloudName = getRequiredScriptProperty_('CLOUDINARY_CLOUD_NAME');
  const apiKey = getRequiredScriptProperty_('CLOUDINARY_API_KEY');
  const apiSecret = getCloudinaryApiSecret_();

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = getOptionalScriptProperty_('CLOUDINARY_FOLDER') || 'qoorya/image-lab';

  const paramsToSign = {
    folder: folder,
    public_id: publicId,
    timestamp: timestamp,
  };

  const signature = signCloudinaryParams_(paramsToSign, apiSecret);

  const response = UrlFetchApp.fetch(
    'https://api.cloudinary.com/v1_1/' + cloudName + '/image/upload',
    {
      method: 'post',
      payload: {
        file: dataUri,
        api_key: apiKey,
        timestamp: String(timestamp),
        folder: folder,
        public_id: publicId,
        signature: signature,
      },
      muteHttpExceptions: true,
    }
  );

  const status = response.getResponseCode();
  const body = response.getContentText();

  if (status < 200 || status >= 300) {
    throw new Error('Cloudinary HTTP ' + status + ' : ' + body);
  }

  const json = JSON.parse(body);

  if (!json.secure_url) {
    throw new Error('Cloudinary : secure_url absent dans la reponse : ' + body);
  }

  return json.secure_url;
}

function splitMultilineLinks_(value) {
  return String(value || '')
    .split(/\n|\r|\|/)
    .map(function(item) {
      return item.trim();
    })
    .filter(Boolean);
}

function extractDriveFileId_(url) {
  const value = String(url || '').trim();

  let match = value.match(/\/file\/d\/([^/]+)/);
  if (match && match[1]) return match[1];

  match = value.match(/[?&]id=([^&]+)/);
  if (match && match[1]) return match[1];

  if (/^[a-zA-Z0-9_-]{20,}$/.test(value)) return value;

  return '';
}

function buildCloudinaryPublicId_(row, slideNumber) {
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
  return 'qoorya_image_lab_row_' + row + '_slide_' + slideNumber + '_' + stamp;
}

function signCloudinaryParams_(params, apiSecret) {
  const signatureBase = Object.keys(params)
    .sort()
    .map(function(key) {
      return key + '=' + params[key];
    })
    .join('&') + apiSecret;

  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_1,
    signatureBase,
    Utilities.Charset.UTF_8
  );

  return digest
    .map(function(byte) {
      const value = byte < 0 ? byte + 256 : byte;
      return ('0' + value.toString(16)).slice(-2);
    })
    .join('');
}

function getRequiredScriptProperty_(name) {
  const value = PropertiesService.getScriptProperties().getProperty(name);
  if (!value) {
    throw new Error('Script Property manquante : ' + name);
  }
  return value.trim();
}

function getOptionalScriptProperty_(name) {
  const value = PropertiesService.getScriptProperties().getProperty(name);
  return value ? value.trim() : '';
}

function getCloudinaryApiSecret_() {
  const value =
    PropertiesService.getScriptProperties().getProperty('CLOUDINARY_API_SECRET') ||
    PropertiesService.getScriptProperties().getProperty('CLOUDINARY_SECRET');

  if (!value) {
    throw new Error('Script Property manquante : CLOUDINARY_API_SECRET');
  }

  return value.trim();
}
function publishActiveRowToInstagram() {
  const sheet = getImageLabSheet_();
  const row = sheet.getActiveRange().getRow();

  if (row <= 1) {
    throw new Error('Selectionne une ligne de contenu, pas la ligne d en-tete.');
  }

  publishRowToInstagram_(sheet, row);
}

function publishRowToInstagramByNumber() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'Publication Instagram',
    'Numero de ligne a publier :',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const row = Number(response.getResponseText());
  if (!row || row <= 1) {
    ui.alert('Numero de ligne invalide.');
    return;
  }

  publishRowToInstagram_(getImageLabSheet_(), row);
}

function publishRowToInstagram_(sheet, row) {
  const ui = SpreadsheetApp.getUi();
  const c = getQOORYAPublishingColumns_();

  const status = String(sheet.getRange(row, c.STATUT).getValue() || '').trim();
  if (status !== getQOORYAStatus_('READY_FOR_INSTAGRAM', 'READY FOR INSTAGRAM')) {
    ui.alert(
      'Statut non valide',
      'La ligne doit etre en READY FOR INSTAGRAM avant publication.',
      ui.ButtonSet.OK
    );
    return;
  }

  const instagramUrl = String(sheet.getRange(row, c.INSTAGRAM_URL).getValue() || '').trim();
  if (instagramUrl) {
    ui.alert('Deja publie', 'Un lien Instagram est deja present pour cette ligne.', ui.ButtonSet.OK);
    return;
  }

  const cloudinaryUrls = splitMultilineLinks_(
    sheet.getRange(row, c.CLOUDINARY_URLS).getValue()
  );

  if (!cloudinaryUrls.length) {
    ui.alert('Liens Cloudinary manquants', 'La colonne Liens Cloudinary est vide.', ui.ButtonSet.OK);
    return;
  }

  const caption = buildInstagramCaptionFromRow_(sheet, row, c);

  sheet.getRange(row, c.STATUT).setValue(getQOORYAStatus_('PUBLISHING_INSTAGRAM', 'PUBLISHING Instagram'));
  SpreadsheetApp.flush();

  try {
    const mediaId = publishCloudinaryUrlsToInstagram_(cloudinaryUrls, caption);
    const permalink = getInstagramPermalink_(mediaId);

    sheet.getRange(row, c.INSTAGRAM_URL).setValue(permalink || mediaId);
    sheet.getRange(row, c.STATUT).setValue(getQOORYAStatus_('PUBLISHED', 'PUBLISHED'));

    if (typeof appendRowNote_ === 'function') {
      appendRowNote_(sheet, row, 'Instagram : publication OK. Media ID : ' + mediaId);
    }

    ui.alert('Publication OK', 'Publication Instagram effectuee.', ui.ButtonSet.OK);
  } catch (error) {
    sheet.getRange(row, c.STATUT).setValue(getQOORYAStatus_('ERROR_PUBLICATION', 'ERROR publication'));

    if (typeof appendRowNote_ === 'function') {
      appendRowNote_(sheet, row, 'Erreur Instagram : ' + String(error && error.message ? error.message : error));
    }

    throw error;
  }
}

function publishCloudinaryUrlsToInstagram_(urls, caption) {
  if (urls.length === 1) {
    const container = createInstagramImageContainer_(urls[0], caption, false);
    Utilities.sleep(5000);
    return publishInstagramContainer_(container.id);
  }

  if (urls.length < 2 || urls.length > 10) {
    throw new Error('Un carrousel Instagram doit contenir entre 2 et 10 visuels.');
  }

  const childIds = urls.map(function(url) {
    const child = createInstagramImageContainer_(url, '', true);
    Utilities.sleep(1200);
    return child.id;
  });

  const parent = createInstagramCarouselContainer_(childIds, caption);
  Utilities.sleep(5000);

  return publishInstagramContainer_(parent.id);
}

function createInstagramImageContainer_(imageUrl, caption, isCarouselItem) {
  const igUserId = getRequiredScriptProperty_('IG_USER_ID');

  const payload = {
    image_url: imageUrl,
    access_token: getRequiredScriptProperty_('ACCESS_TOKEN'),
  };

  if (caption) payload.caption = caption;
  if (isCarouselItem) payload.is_carousel_item = 'true';

  return callInstagramGraphPost_(igUserId + '/media', payload);
}

function createInstagramCarouselContainer_(childIds, caption) {
  const igUserId = getRequiredScriptProperty_('IG_USER_ID');

  return callInstagramGraphPost_(igUserId + '/media', {
    media_type: 'CAROUSEL',
    children: childIds.join(','),
    caption: caption,
    access_token: getRequiredScriptProperty_('ACCESS_TOKEN'),
  });
}

function publishInstagramContainer_(creationId) {
  const igUserId = getRequiredScriptProperty_('IG_USER_ID');

  const result = callInstagramGraphPost_(igUserId + '/media_publish', {
    creation_id: creationId,
    access_token: getRequiredScriptProperty_('ACCESS_TOKEN'),
  });

  if (!result.id) {
    throw new Error('Instagram : reponse de publication sans id.');
  }

  return result.id;
}

function getInstagramPermalink_(mediaId) {
  try {
    const result = callInstagramGraphGet_(mediaId, {
      fields: 'permalink',
      access_token: getRequiredScriptProperty_('ACCESS_TOKEN'),
    });

    return result.permalink || '';
  } catch (error) {
    Logger.log('Permalink Instagram indisponible : ' + String(error && error.message ? error.message : error));
    return '';
  }
}

function buildInstagramCaptionFromRow_(sheet, row, c) {
  const legende = String(sheet.getRange(row, c.LEGENDE).getValue() || '').trim();
  const hashtags = String(sheet.getRange(row, c.HASHTAGS).getValue() || '').trim();

  const caption = [legende, hashtags].filter(Boolean).join('\n\n').trim();

  if (!caption) {
    throw new Error('Legende et hashtags manquants.');
  }

  if (caption.length > 2200) {
    throw new Error('Caption trop longue pour Instagram : ' + caption.length + ' caracteres.');
  }

  return caption;
}

function callInstagramGraphPost_(path, payload) {
  const url = getInstagramGraphBaseUrl_() + '/' + path;

  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    payload: payload,
    muteHttpExceptions: true,
  });

  return parseInstagramGraphResponse_(response, 'POST ' + path);
}

function callInstagramGraphGet_(path, params) {
  const query = Object.keys(params)
    .map(function(key) {
      return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
    })
    .join('&');

  const url = getInstagramGraphBaseUrl_() + '/' + path + '?' + query;

  const response = UrlFetchApp.fetch(url, {
    method: 'get',
    muteHttpExceptions: true,
  });

  return parseInstagramGraphResponse_(response, 'GET ' + path);
}

function parseInstagramGraphResponse_(response, label) {
  const status = response.getResponseCode();
  const body = response.getContentText();

  let json;
  try {
    json = JSON.parse(body);
  } catch (error) {
    throw new Error(label + ' : reponse non JSON HTTP ' + status + ' : ' + body);
  }

  if (status < 200 || status >= 300 || json.error) {
    const message = json.error && json.error.message ? json.error.message : body;
    throw new Error(label + ' : Instagram HTTP ' + status + ' : ' + message);
  }

  return json;
}

function getInstagramGraphBaseUrl_() {
  const version = getOptionalScriptProperty_('GRAPH_VERSION') || 'v24.0';
  return 'https://graph.facebook.com/' + version;
}
function runAutonomousPipelineByNumber() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'Pipeline autonome',
    'Numero de ligne a traiter :',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const row = Number(response.getResponseText());
  if (!row || row <= 1) {
    ui.alert('Numero de ligne invalide.');
    return;
  }

  const allowPublish = getOptionalScriptProperty_('AUTONOMOUS_PUBLISHING_ENABLED') === 'YES';
  const result = runAutonomousPipelineForRow_(getImageLabSheet_(), row, allowPublish);
  ui.alert('Pipeline termine', result, ui.ButtonSet.OK);
}

function runNextAutonomousPipelineStep() {
  const sheet = getImageLabSheet_();
  const row = findNextAutonomousPipelineRow_(sheet);

  if (!row) {
    Logger.log('Aucune ligne eligible pour le pipeline autonome.');
    return;
  }

  const allowPublish = getOptionalScriptProperty_('AUTONOMOUS_PUBLISHING_ENABLED') === 'YES';
  Logger.log(runAutonomousPipelineForRow_(sheet, row, allowPublish));
}

function runAutonomousPipelineForRow_(sheet, row, allowPublish) {
  const c = getQOORYAPublishingColumns_();

  for (let step = 0; step < 6; step += 1) {
    const status = String(sheet.getRange(row, c.STATUT).getValue() || '').trim();
    const caption = String(sheet.getRange(row, c.LEGENDE).getValue() || '').trim();
    const hashtags = String(sheet.getRange(row, c.HASHTAGS).getValue() || '').trim();

    if (!caption || !hashtags) {
      processCaptionRow_(sheet, row);
      continue;
    }

    if (isDoneCreativeStatus_(status)) {
      markRowReadyToPublishNoUi_(sheet, row);
      continue;
    }

    if (status === getQOORYAStatus_('READY_TO_PUBLISH', 'READY TO PUBLISH')) {
      uploadRowVisualsToCloudinaryNoUi_(sheet, row);
      continue;
    }

    if (status === getQOORYAStatus_('READY_FOR_INSTAGRAM', 'READY FOR INSTAGRAM')) {
      if (!allowPublish) {
        return 'Ligne ' + row + ' prete Instagram. Publication autonome desactivee.';
      }

      publishRowToInstagramNoUi_(sheet, row);
      continue;
    }

    if (status === getQOORYAStatus_('PUBLISHED', 'PUBLISHED')) {
      return 'Ligne ' + row + ' publiee.';
    }

    return 'Pipeline arrete ligne ' + row + ' au statut : ' + status;
  }

  return 'Pipeline termine ligne ' + row + '.';
}

function markRowReadyToPublishNoUi_(sheet, row) {
  const c = getQOORYAPublishingColumns_();
  const result = validatePublicationReadiness_(sheet, row);

  if (result.errors.length) {
    throw new Error('Ligne non prete a publier : ' + result.errors.join(' '));
  }

  sheet.getRange(row, c.STATUT).setValue(getQOORYAStatus_('READY_TO_PUBLISH', 'READY TO PUBLISH'));

  if (typeof appendRowNote_ === 'function') {
    appendRowNote_(sheet, row, 'Pipeline autonome : READY TO PUBLISH.');
  }
}

function uploadRowVisualsToCloudinaryNoUi_(sheet, row) {
  const c = getQOORYAPublishingColumns_();

  const existingCloudinaryUrls = String(sheet.getRange(row, c.CLOUDINARY_URLS).getValue() || '').trim();
  if (existingCloudinaryUrls) {
    sheet.getRange(row, c.STATUT).setValue(getQOORYAStatus_('READY_FOR_INSTAGRAM', 'READY FOR INSTAGRAM'));
    return;
  }

  const driveLinks = String(sheet.getRange(row, c.LIENS_VISUELS_DRIVE).getValue() || '').trim();
  const urls = splitMultilineLinks_(driveLinks);

  if (!urls.length) {
    throw new Error('Aucun lien Drive pour upload Cloudinary.');
  }

  sheet.getRange(row, c.STATUT).setValue(getQOORYAStatus_('UPLOADING_CLOUDINARY', 'UPLOADING Cloudinary'));
  SpreadsheetApp.flush();

  const cloudinaryUrls = urls.map(function(url, index) {
    return uploadDriveImageUrlToCloudinary_(url, row, index + 1);
  });

  sheet.getRange(row, c.CLOUDINARY_URLS).setValue(cloudinaryUrls.join('\n'));
  sheet.getRange(row, c.STATUT).setValue(getQOORYAStatus_('READY_FOR_INSTAGRAM', 'READY FOR INSTAGRAM'));

  if (typeof appendRowNote_ === 'function') {
    appendRowNote_(sheet, row, 'Pipeline autonome : Cloudinary OK.');
  }
}

function publishRowToInstagramNoUi_(sheet, row) {
  const c = getQOORYAPublishingColumns_();

  const existingInstagramUrl = String(sheet.getRange(row, c.INSTAGRAM_URL).getValue() || '').trim();
  if (existingInstagramUrl) {
    sheet.getRange(row, c.STATUT).setValue(getQOORYAStatus_('PUBLISHED', 'PUBLISHED'));
    return;
  }

  const cloudinaryUrls = splitMultilineLinks_(sheet.getRange(row, c.CLOUDINARY_URLS).getValue());
  if (!cloudinaryUrls.length) {
    throw new Error('Liens Cloudinary manquants.');
  }

  const caption = buildInstagramCaptionFromRow_(sheet, row, c);

  sheet.getRange(row, c.STATUT).setValue(getQOORYAStatus_('PUBLISHING_INSTAGRAM', 'PUBLISHING Instagram'));
  SpreadsheetApp.flush();

  const mediaId = publishCloudinaryUrlsToInstagram_(cloudinaryUrls, caption);
  const permalink = getInstagramPermalink_(mediaId);

  sheet.getRange(row, c.INSTAGRAM_URL).setValue(permalink || mediaId);
  sheet.getRange(row, c.STATUT).setValue(getQOORYAStatus_('PUBLISHED', 'PUBLISHED'));

  if (typeof appendRowNote_ === 'function') {
    appendRowNote_(sheet, row, 'Pipeline autonome : Instagram publie. Media ID : ' + mediaId);
  }
}

function findNextAutonomousPipelineRow_(sheet) {
  const c = getQOORYAPublishingColumns_();
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) return null;

  const statuses = sheet.getRange(2, c.STATUT, lastRow - 1, 1).getValues();

  for (let i = 0; i < statuses.length; i += 1) {
    const status = String(statuses[i][0] || '').trim();

    if (
      isDoneCreativeStatus_(status) ||
      status === getQOORYAStatus_('READY_TO_PUBLISH', 'READY TO PUBLISH') ||
      status === getQOORYAStatus_('READY_FOR_INSTAGRAM', 'READY FOR INSTAGRAM')
    ) {
      return i + 2;
    }
  }

  return null;
}

function isDoneCreativeStatus_(status) {
  const normalized = normalizeWorkflowStatus_(status);

  return (
    normalized === 'done carrousel' ||
    normalized === 'done caroussel' ||
    normalized === 'done post simple' ||
    normalized === 'done_carousel' ||
    normalized === 'done_post'
  );
}

function normalizeWorkflowStatus_(status) {
  return String(status || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function installAutonomousPipelineTrigger() {
  const ui = SpreadsheetApp.getUi();
  const triggerInstallAllowed = getOptionalScriptProperty_('AUTONOMOUS_TRIGGER_INSTALL_ALLOWED') === 'YES';

  if (!triggerInstallAllowed) {
    ui.alert(
      'Declencheur non installe',
      'Definir AUTONOMOUS_TRIGGER_INSTALL_ALLOWED=YES apres validation du rythme de publication beta.',
      ui.ButtonSet.OK
    );
    return;
  }

  stopAutonomousPipelineTrigger();

  ScriptApp.newTrigger('runNextAutonomousPipelineStep')
    .timeBased()
    .everyMinutes(15)
    .create();

  ui.alert('Declencheur installe : pipeline autonome toutes les 15 minutes.');
}

function stopAutonomousPipelineTrigger() {
  const triggers = ScriptApp.getProjectTriggers();

  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'runNextAutonomousPipelineStep') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
}
