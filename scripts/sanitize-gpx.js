const fs = require('fs');
const path = require('path');
const diacritics = require('diacritics'); // Import the diacritics library

const gpxDir = path.join(__dirname, '../gpx-files');

function sanitizeFileName(fileName) {
  return diacritics.remove(fileName) // Use diacritics library to remove accents
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase();
}

module.exports = { sanitizeFileName };
