const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const { google } = require('googleapis');
const { sanitizeFileName } = require('./sanitize-gpx');

const outputFilePath = path.join(__dirname, '../data/traces.json');

const categories = ['sec', 'inonde', 'boueux'];

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '../credentials.json'),
  scopes: ['https://www.googleapis.com/auth/drive.readonly']
});

const drive = google.drive({
  version: 'v3',
  auth: auth
});

async function listGpxFiles() {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const res = await drive.files.list({
    q: `'${folderId}' in parents and mimeType='application/gpx+xml'`,
    fields: 'files(id, name)'
  });
  console.log('All files found:', res.data.files);
  return res.data.files;
}

async function downloadGpxFile(fileId) {
  const res = await drive.files.get({
    fileId: fileId,
    alt: 'media'
  }, { responseType: 'stream' });

  return new Promise((resolve, reject) => {
    let data = '';
    res.data.on('data', chunk => {
      data += chunk;
    });
    res.data.on('end', () => {
      resolve(data);
    });
    res.data.on('error', err => {
      reject(err);
    });
  });
}

async function processGpxFiles() {
  const traces = [];
  const files = await listGpxFiles();

  for (const file of files) {
    const gpxData = await downloadGpxFile(file.id);
    const sanitizedFileName = sanitizeFileName(path.basename(file.name, '.gpx')) + '.gpx';

    xml2js.parseString(gpxData, (err, result) => {
      if (err) {
        console.error('Error parsing GPX file:', err);
        process.exit(1);
      }

      const trace = {
        name: path.basename(file.name, '.gpx'),
        sanitizedName: sanitizeFileName(path.basename(file.name, '.gpx')),
        category: getCategory(path.basename(file.name, '.gpx')),
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
  }
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

processGpxFiles();
