const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'Code.js'), 'utf8');
const context = vm.createContext({
  console,
  Logger: { log() {} },
});

vm.runInContext(source, context, { filename: 'Code.js' });

function runInContext(code) {
  return vm.runInContext(code, context);
}

assert.equal(runInContext("isPostPublicationType_('Post simple')"), true);
assert.equal(runInContext("isCarouselPublicationType_('Carrousel')"), true);
assert.equal(runInContext("isCarouselPublicationType_('Carousel 5 slides')"), true);
assert.equal(runInContext("isAutomaticallyGeneratedPublicationType_('Reel')"), false);

assert.equal(
  runInContext("isAutonomousPipelineCandidateStatus_('TODO', 'Post simple')"),
  true
);
assert.equal(
  runInContext("isAutonomousPipelineCandidateStatus_('TODO', 'Carrousel')"),
  true
);
assert.equal(
  runInContext("isAutonomousPipelineCandidateStatus_('TODO', 'Reel')"),
  false
);

runInContext(`
  var __dispatchCalls = [];
  readRowData_ = function() {
    return { typePublication: 'Carrousel' };
  };
  processCarouselRow_ = function(sheet, row) {
    __dispatchCalls.push('carousel:' + row);
    sheet.getRange(row, QOORYA_CONFIG.COLUMNS.STATUT).setValue('DONE carrousel');
  };
  processImageRow_ = function() {
    __dispatchCalls.push('post');
  };
`);

const dispatchValues = { 11: 'TODO' };
context.__dispatchSheet = {
  getRange(row, column) {
    return {
      getValue() {
        return dispatchValues[column] || '';
      },
      setValue(value) {
        dispatchValues[column] = value;
      },
    };
  },
};

runInContext('processCreativeRowForType_(__dispatchSheet, 12)');
assert.deepEqual(Array.from(context.__dispatchCalls), ['carousel:12']);

function createPipelineSheet(initialValues) {
  const values = { ...initialValues };

  return {
    values,
    getRange(row, column) {
      return {
        getValue() {
          return values[column] || '';
        },
        setValue(value) {
          values[column] = value;
        },
      };
    },
  };
}

runInContext(`
  var __pipelineCalls = [];
  processCreativeRowForType_ = function(sheet, row) {
    __pipelineCalls.push('creative');
    sheet.getRange(row, 11).setValue('DONE Post simple');
  };
  processCaptionRow_ = function(sheet, row, options) {
    if (!options || !options.preserveExisting) {
      throw new Error('Le pipeline doit utiliser le mode sans confirmation.');
    }
    __pipelineCalls.push('caption');
    sheet.getRange(row, 8).setValue('Legende generee');
    sheet.getRange(row, 9).setValue('#qoorya');
  };
  markRowReadyToPublishNoUi_ = function(sheet, row) {
    __pipelineCalls.push('ready');
    sheet.getRange(row, 11).setValue('READY TO PUBLISH');
  };
  uploadRowVisualsToCloudinaryNoUi_ = function(sheet, row) {
    __pipelineCalls.push('cloudinary');
    sheet.getRange(row, 13).setValue('https://cloudinary.example/image.png');
    sheet.getRange(row, 11).setValue('READY FOR INSTAGRAM');
  };
  publishRowToInstagramNoUi_ = function(sheet, row) {
    __pipelineCalls.push('instagram');
    sheet.getRange(row, 14).setValue('https://instagram.example/post');
    sheet.getRange(row, 11).setValue('PUBLISHED');
  };
`);

context.__publishSheet = createPipelineSheet({ 11: 'TODO' });
const publishedResult = runInContext(
  'runAutonomousPipelineForRow_(__publishSheet, 7, true)'
);

assert.equal(publishedResult, 'Ligne 7 publiee.');
assert.equal(context.__publishSheet.values[11], 'PUBLISHED');
assert.deepEqual(Array.from(context.__pipelineCalls), [
  'creative',
  'caption',
  'ready',
  'cloudinary',
  'instagram',
]);

runInContext('__pipelineCalls.length = 0');
context.__prepareSheet = createPipelineSheet({ 11: 'TODO' });
const preparedResult = runInContext(
  'runAutonomousPipelineForRow_(__prepareSheet, 8, false)'
);

assert.equal(
  preparedResult,
  'Ligne 8 prete Instagram. Publication autonome desactivee.'
);
assert.equal(context.__prepareSheet.values[11], 'READY FOR INSTAGRAM');
assert.deepEqual(Array.from(context.__pipelineCalls), [
  'creative',
  'caption',
  'ready',
  'cloudinary',
]);

runInContext(`
  var __instagramCaptionCalls = [];
  processCaptionRow_ = function(sheet, row, options) {
    if (!options || !options.preserveExisting) {
      throw new Error('La preparation Instagram doit conserver les champs existants.');
    }
    __instagramCaptionCalls.push(row);
    var captionRange = sheet.getRange(row, 8);
    var hashtagsRange = sheet.getRange(row, 9);
    if (!captionRange.getValue()) captionRange.setValue('Legende Reel generee');
    if (!hashtagsRange.getValue()) hashtagsRange.setValue('#qoorya #reel');
  };
`);

context.__emptyReelCaptionSheet = createPipelineSheet({
  2: 'Reel',
  8: '',
  9: '',
  11: 'READY FOR INSTAGRAM',
  13: 'https://cloudinary.example/reel.mp4',
});
runInContext(
  'ensureInstagramCaptionAndHashtags_(__emptyReelCaptionSheet, 25, getQOORYAPublishingColumns_())'
);
assert.equal(context.__emptyReelCaptionSheet.values[8], 'Legende Reel generee');
assert.equal(context.__emptyReelCaptionSheet.values[9], '#qoorya #reel');
assert.deepEqual(Array.from(context.__instagramCaptionCalls), [25]);

runInContext('__instagramCaptionCalls.length = 0');
context.__partialReelCaptionSheet = createPipelineSheet({
  2: 'Reel',
  8: 'Legende conservee',
  9: '',
  11: 'READY FOR INSTAGRAM',
  13: 'https://cloudinary.example/reel.mp4',
});
runInContext(
  'ensureInstagramCaptionAndHashtags_(__partialReelCaptionSheet, 30, getQOORYAPublishingColumns_())'
);
assert.equal(context.__partialReelCaptionSheet.values[8], 'Legende conservee');
assert.equal(context.__partialReelCaptionSheet.values[9], '#qoorya #reel');
assert.deepEqual(Array.from(context.__instagramCaptionCalls), [30]);

runInContext('__instagramCaptionCalls.length = 0');
context.__completeReelCaptionSheet = createPipelineSheet({
  2: 'Reel',
  8: 'Legende existante',
  9: '#existant',
  11: 'READY FOR INSTAGRAM',
  13: 'https://cloudinary.example/reel.mp4',
});
runInContext(
  'ensureInstagramCaptionAndHashtags_(__completeReelCaptionSheet, 31, getQOORYAPublishingColumns_())'
);
assert.deepEqual(Array.from(context.__instagramCaptionCalls), []);

context.__missingHashtagsSheet = createPipelineSheet({ 8: 'Legende seule', 9: '' });
assert.throws(
  () => runInContext(
    'buildInstagramCaptionFromRow_(__missingHashtagsSheet, 32, getQOORYAPublishingColumns_())'
  ),
  /hashtags/
);

console.log('TODO pipeline tests: OK');
