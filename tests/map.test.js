process.env.NODE_ENV = 'test';

const { getColor, getWeight } = require('../scripts/map');
const { processGpxFiles } = require('../scripts/process-gpx');
const fs = require('fs');
const path = require('path');

describe('getColor', () => {
  test('returns correct color for parcours category', () => {
    expect(getColor('parcours')).toBe('#35978f');
  });

  test('returns correct color for chemin_boueux category', () => {
    expect(getColor('chemin_boueux')).toBe('#542788');
  });

  test('returns correct color for chemin_inondable category', () => {
    expect(getColor('chemin_inondable')).toBe('#fdb863');
  });

  test('returns correct color for danger category', () => {
    expect(getColor('danger')).toBe('#b30000');
  });

  test('returns correct color for autres category', () => {
    expect(getColor('autres')).toBe('pink');
  });
});

describe('getWeight', () => {
  test('returns correct weight for parcours category', () => {
    expect(getWeight('parcours')).toBe(8);
  });

  test('returns correct weight for chemin_boueux category', () => {
    expect(getWeight('chemin_boueux')).toBe(10);
  });

  test('returns correct weight for chemin_inondable category', () => {
    expect(getWeight('chemin_inondable')).toBe(10);
  });

  test('returns correct weight for danger category', () => {
    expect(getWeight('danger')).toBe(11);
  });

  test('returns correct weight for autres category', () => {
    expect(getWeight('autres')).toBe(8);
  });
});

describe('processGpxFiles', () => {
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

  test('processes GPX files and creates traces.json', async () => {
    await processGpxFiles();

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
