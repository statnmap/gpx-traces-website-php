const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const { google } = require('googleapis');
const { sanitizeFileName } = require('./sanitize-gpx');

const outputFilePath = path.join(__dirname, '../data/traces.json');
const gpxFilesDir = path.join(__dirname, '../gpx-files');

const categories = ['parcours', 'chemin_boueux', 'chemin_inondable', 'danger'];

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
    q: `'${folderId}' in parents and name contains '.gpx'`,
    fields: 'files(id, name)'
  });
  console.log('All files found:', res.data.files);
  return res.data.files;
}

async function downloadGpxFile(fileId, fileName) {
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
      const sanitizedFileName = sanitizeFileName(path.basename(fileName, '.gpx')) + '.gpx';
      const filePath = path.join(gpxFilesDir, sanitizedFileName);
      ensureGpxFilesDirectoryExists();
      fs.writeFileSync(filePath, data);
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

  // Clean content of gpx-files directory before downloading
  cleanGpxFilesDirectory();

  // Delete the existing traces.json file if it exists
  if (fs.existsSync(outputFilePath)) {
    fs.unlinkSync(outputFilePath);
    console.log('Deleted existing traces.json file');
  }

  for (const file of files) {
    const gpxData = await downloadGpxFile(file.id, file.name);
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

      ensureDataDirectoryExists();

      fs.writeFile(outputFilePath, JSON.stringify({ traces }, null, 2), (err) => {
        if (err) {
          console.error('Error writing output file:', err);
          process.exit(1);
        }
        console.log(`Successfully processed and saved trace: ${trace.name}`);
      });
    });
  }

  // Check if all trace files exist in the gpx-files directory
  traces.forEach(trace => {
    const filePath = path.join(gpxFilesDir, `${trace.sanitizedName}.gpx`);
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }
  });
}

function getCategory(name) {
  if (name.startsWith("Parcours")) {
    return 'parcours';
  } else if (name.includes("chemin") && name.includes("boueux")) {
    return 'chemin_boueux';
  } else if (name.includes("chemin") && name.includes("inondable")) {
    return 'chemin_inondable';
  } else if (name.includes("danger")) {
    return 'danger';
  } else {
    for (const category of categories) {
      if (name.toLowerCase().includes(category)) {
        return category;
      }
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

function ensureDataDirectoryExists() {
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }
}

function ensureGpxFilesDirectoryExists() {
  if (!fs.existsSync(gpxFilesDir)) {
    fs.mkdirSync(gpxFilesDir);
  }
}

function cleanGpxFilesDirectory() {
  if (fs.existsSync(gpxFilesDir)) {
    fs.readdirSync(gpxFilesDir).forEach((file) => {
      const filePath = path.join(gpxFilesDir, file);
      fs.unlinkSync(filePath);
    });
  }
}

processGpxFiles();
