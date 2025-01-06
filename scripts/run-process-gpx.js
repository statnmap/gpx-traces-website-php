const { processGpxFiles } = require('./process-gpx');

processGpxFiles().catch(err => {
  console.error('Error processing GPX files:', err);
  process.exit(1);
});