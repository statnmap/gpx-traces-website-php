const { processGpxFiles } = require('../scripts/process-gpx');
const { sanitizeGpxFileNames } = require('../scripts/sanitize-gpx');
const fs = require('fs');
const path = require('path');

describe('End-to-end filename processing', () => {
  const gpxFilesDir = path.join(__dirname, '../gpx-files');
  const outputFilePath = path.join(__dirname, '../data/traces.json');

  beforeAll(() => {
    // Ensure the gpx-files directory exists
    if (!fs.existsSync(gpxFilesDir)) {
      fs.mkdirSync(gpxFilesDir);
    }

    // Create sample GPX files for testing
    const sampleGpxContent1 = `
      <gpx>
        <trk>
          <name>Sample Track</name>
          <trkseg>
            <trkpt lat="47.325" lon="-1.736"></trkpt>
            <trkpt lat="47.326" lon="-1.737"></trkpt>
          </trkseg>
        </trk>
      </gpx>
    `;
    fs.writeFileSync(path.join(gpxFilesDir, 'Sample Track.gpx'), sampleGpxContent1);

    const sampleGpxContent2 = `
      <gpx>
        <trk>
          <name>Chemin boueux - La valinière</name>
          <trkseg>
            <trkpt lat="47.325" lon="-1.736"></trkpt>
            <trkpt lat="47.326" lon="-1.737"></trkpt>
          </trkseg>
        </trk>
      </gpx>
    `;
    fs.writeFileSync(path.join(gpxFilesDir, 'Chemin boueux - La valinière.gpx'), sampleGpxContent2);
  });

  afterAll(() => {
    // Clean up the gpx-files directory and traces.json file
    fs.readdirSync(gpxFilesDir).forEach((file) => {
      fs.unlinkSync(path.join(gpxFilesDir, file));
    });
    if (fs.existsSync(outputFilePath)) {
      fs.unlinkSync(outputFilePath);
    }
  });

  test('sanitizes, categorizes, processes, and displays the filename correctly', async () => {
    // Sanitize GPX file names
    sanitizeGpxFileNames();

    // Process GPX files
    await processGpxFiles();

    // Check the sanitized file names
    const sanitizedFileName1 = 'sample_track.gpx';
    const sanitizedFileName2 = 'chemin_boueux___la_valiniere.gpx';
    expect(fs.existsSync(path.join(gpxFilesDir, sanitizedFileName1))).toBe(true);
    expect(fs.existsSync(path.join(gpxFilesDir, sanitizedFileName2))).toBe(true);

    // Check the traces.json file
    const tracesJson = JSON.parse(fs.readFileSync(outputFilePath, 'utf8'));
    expect(tracesJson.traces).toHaveLength(2);

    // Check the first trace
    expect(tracesJson.traces[0].name).toBe('Sample Track');
    expect(tracesJson.traces[0].sanitizedName).toBe('sample_track');
    expect(tracesJson.traces[0].category).toBe('autres');
    expect(tracesJson.traces[0].coordinates).toEqual([
      { lat: 47.325, lon: -1.736 },
      { lat: 47.326, lon: -1.737 }
    ]);

    // Check the second trace
    expect(tracesJson.traces[1].name).toBe('Chemin boueux - La valinière');
    expect(tracesJson.traces[1].sanitizedName).toBe('chemin_boueux___la_valiniere');
    expect(tracesJson.traces[1].category).toBe('chemin_boueux');
    expect(tracesJson.traces[1].coordinates).toEqual([
      { lat: 47.325, lon: -1.736 },
      { lat: 47.326, lon: -1.737 }
    ]);
  });
});
