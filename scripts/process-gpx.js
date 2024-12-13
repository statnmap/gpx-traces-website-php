const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const { sanitizeGpxFileNames, sanitizeFileName } = require('./sanitize-gpx');

const gpxDir = path.join(__dirname, '../gpx-files');
const outputFilePath = path.join(__dirname, '../data/traces.json');

const categories = ['sec', 'humide', 'boueux'];

function processGpxFiles() {
  const traces = [];

  fs.readdir(gpxDir, (err, files) => {
    if (err) {
      console.error('Error reading GPX directory:', err);
      process.exit(1);
    }

    files.forEach((file) => {
      if (path.extname(file) === '.gpx') {
        const sanitizedFileName = sanitizeFileName(path.basename(file, '.gpx')) + '.gpx';
        const filePath = path.join(gpxDir, sanitizedFileName);
        fs.readFile(filePath, 'utf8', (err, gpxData) => {
          if (err) {
            console.error('Error reading GPX file:', err);
            process.exit(1);
          }

          xml2js.parseString(gpxData, (err, result) => {
            if (err) {
              console.error('Error parsing GPX file:', err);
              process.exit(1);
            }

            const trace = {
              name: path.basename(file, '.gpx'),
              sanitizedName: sanitizeFileName(path.basename(file, '.gpx')),
              category: getCategory(path.basename(file, '.gpx')),
              coordinates: getCoordinates(result.gpx.trk[0].trkseg[0].trkpt)
            };

            traces.push(trace);

            fs.writeFile(outputFilePath, JSON.stringify({ traces }, null, 2), (err) => {
              if (err) {
                console.error('Error writing output file:', err);
                process.exit(1);
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
  return 'autres';
}

function getCoordinates(trkpts) {
  return trkpts.map((trkpt) => ({
    lat: parseFloat(trkpt.$.lat),
    lon: parseFloat(trkpt.$.lon)
  }));
}

sanitizeGpxFileNames();
processGpxFiles();
