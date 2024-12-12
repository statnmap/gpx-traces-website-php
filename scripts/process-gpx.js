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
        fs.readFile(filePath, 'utf8', (err, gpxData) => {
          if (err) {
            console.error('Error reading GPX file:', err);
            return;
          }

          xml2js.parseString(gpxData, (err, result) => {
            if (err) {
              console.error('Error parsing GPX file:', err);
              return;
            }

            const trace = {
              name: sanitizeFileName(result.gpx.trk[0].name[0]),
              category: getCategory(result.gpx.trk[0].name[0]),
              coordinates: getCoordinates(result.gpx.trk[0].trkseg[0].trkpt)
            };

            traces.push(trace);

            fs.writeFile(outputFilePath, JSON.stringify({ traces }, null, 2), (err) => {
              if (err) {
                console.error('Error writing output file:', err);
                return;
              }
              console.log(`Successfully processed and saved trace: ${trace.name}`);
            });
          });
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

function sanitizeFileName(fileName) {
  return fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

processGpxFiles();
