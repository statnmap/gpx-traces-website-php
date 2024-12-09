# GPX Traces Map

This repository contains the necessary files and code to use GPX files stored in the repository as input and show the GPX traces on an interactive map.

## Directory Structure

- `gpx-files/`: Directory to store the GPX files.
- `data/`: Directory to store processed data.
- `scripts/`: Directory to store scripts.
- `.github/workflows/`: Directory to store GitHub Actions workflows.

## Adding a New GPX File

To add a new GPX file, follow these steps:

1. Place the new GPX file in the `gpx-files/` directory.
2. Ensure the GPX file name includes the category ("sec", "humide", "boueux") to map it to the correct category.
3. Run the pre-build script to process the GPX files and update the JSON file:
   ```sh
   node scripts/process-gpx.js
   ```

## Categories

The GPX traces are categorized into three categories:

- `sec`: Dry traces
- `humide`: Humid traces
- `boueux`: Muddy traces

The category is determined based on the GPX file name. Ensure the file name includes the category to map it correctly.

## GitHub Actions

The repository is configured to use GitHub Actions to build and deploy the website. The pre-build script is included in the build process to process the GPX files and update the JSON file whenever new GPX files are added or existing ones are modified.

## Deployment

The static website is hosted on GitHub Pages. The repository is configured to automatically build and deploy the website using GitHub Actions whenever changes are made to the GPX files or the codebase.
