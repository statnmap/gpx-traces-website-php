import L from 'leaflet';
import xml2js from 'xml2js';
import { getColor, getWeight } from './map-utils';

/**
 * The path to the output dir where the processed gpx files were saved.
 * @type {string}
 */
const gpxFilesDir = process.env.GPX_FILES_DIR || 'gpx-files-real-data';
const tracesFilePath = process.env.TRACES_FILE_PATH || 'traces-real/traces.json';

let gpsMarker = null;

/**
 * Initializes the map and sets up event listeners.
 */
function initializeMap() {
  const map = L.map('map').setView([47.325, -1.736], 11);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  fetch(tracesFilePath)
    .then(response => response.json())
    .then(data => {
      const traces = data.traces;
      const traceLayers = {};

      traces.forEach(trace => {
        const coordinates = trace.coordinates.map(coord => [coord.lat, coord.lon]);
        const polyline = L.polyline(coordinates, { color: getColor(trace.category), weight: getWeight(trace.category) }).addTo(map);

        polyline.on('click', (e) => {
          const popupContent = `
            <div>
              <strong>${trace.name}</strong><br>
              <a href="${gpxFilesDir}/${trace.sanitizedName}.gpx" download>Download GPX</a>
            </div>
          `;
          const popup = L.popup()
            .setLatLng(e.latlng)
            .setContent(popupContent)
            .openOn(map);
          polyline.bindPopup(popup);
        });

        polyline.on('mouseover', (e) => {
          const tooltipContent = `<strong>${trace.name}</strong>`;
          const tooltip = L.tooltip()
            .setLatLng(e.latlng)
            .setContent(tooltipContent)
            .openOn(map);
          polyline.bindTooltip(tooltip);
          polyline.setStyle({ color: 'red', weight: 12 });
        });

        polyline.on('mouseout', () => {
          polyline.setStyle({ color: getColor(trace.category), weight: getWeight(trace.category) });
        });

        polyline.on('touchstart', (e) => {
          const popupContent = `
            <div>
              <strong>${trace.name}</strong><br>
              <a href="${gpxFilesDir}/${trace.sanitizedName}.gpx" download>Download GPX</a>
            </div>
          `;
          const popup = L.popup()
            .setLatLng(e.latlng)
            .setContent(popupContent)
            .openOn(map);
          polyline.bindPopup(popup);
        });

        if (!traceLayers[trace.category]) {
          traceLayers[trace.category] = [];
        }
        traceLayers[trace.category].push(polyline);
      });

      const checkboxes = document.querySelectorAll('input[name="category"]');
      checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
          const category = checkbox.value;
          if (checkbox.checked) {
            traceLayers[category].forEach(layer => map.addLayer(layer));
          } else {
            traceLayers[category].forEach(layer => map.removeLayer(layer));
          }
        });
      });
    });

  return map;
}

/**
 * Adds the current GPS position to the map.
 * @param {Object} position - The position object containing latitude and longitude.
 */
function addCurrentPositionToMap(position) {
  const { latitude, longitude } = position.coords;
  gpsMarker = L.marker([latitude, longitude]).addTo(map);
  gpsMarker.bindPopup('Vous êtes ici').openPopup();
}

/**
 * Removes the current GPS position marker from the map.
 */
function removeCurrentPositionFromMap() {
  if (gpsMarker) {
    map.removeLayer(gpsMarker);
    gpsMarker = null;
  }
}

/**
 * Handles errors when getting the current position.
 * @param {Object} error - The error object.
 */
function handleError(error) {
  console.error('Error getting current position:', error);
}

document.addEventListener('DOMContentLoaded', () => {
  const map = initializeMap();

  document.getElementById('add-gps-position').addEventListener('click', (event) => {
    if (gpsMarker) {
      removeCurrentPositionFromMap();
      event.target.textContent = 'Afficher ma position GPS';
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          addCurrentPositionToMap(position);
          event.target.textContent = 'Masquer ma position GPS';
        }, handleError);
      } else {
        alert('Geolocation is not supported by this browser.');
      }
    }
  });
});
