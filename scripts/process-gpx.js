const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

const gpxDir = path.join(__dirname, '../gpx-files');
const outputFilePath = path.join(__dirname, '../data/traces.json');

const categories = ['sec', 'humide', 'boueux'];

function processGpxFiles() {
  const traces = [];

  fs.readdir(gpxDir, (err, files) => {
    if (err) {
      console.error('Error reading GPX directory:', err);
      return;
    }

    files.forEach((file) => {
      if (path.extname(file) === '.gpx') {
        const filePath = path.join(gpxDir, file);
        const gpxData = fs.readFileSync(filePath, 'utf8');

        xml2js.parseString(gpxData, (err, result) => {
          if (err) {
            console.error('Error parsing GPX file:', err);
            return;
          }

          const trace = {
            name: result.gpx.trk[0].name[0],
            category: getCategory(result.gpx.trk[0].name[0]),
            coordinates: getCoordinates(result.gpx.trk[0].trkseg[0].trkpt)
          };

          traces.push(trace);

          fs.writeFileSync(outputFilePath, JSON.stringify({ traces }, null, 2));
        });
      }
    });
  });
}

function getCategory(name) {
  for (const category of categories) {
    if (name.toLowerCase().includes(category)) {
      return category;
    }
  }
  return 'unknown';
}

function getCoordinates(trkpts) {
  return trkpts.map((trkpt) => ({
    lat: parseFloat(trkpt.$.lat),
    lon: parseFloat(trkpt.$.lon)
  }));
}

processGpxFiles();
