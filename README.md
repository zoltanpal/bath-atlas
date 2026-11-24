# BathAtlas

**BathAtlas** is an interactive 3D bathymetry viewer for exploring underwater terrain and coastal elevation data in the browser.

It turns scientific elevation datasets into navigable 3D surfaces, with controls for viewing terrain structure, depth contours, and geographic context.

## Features

- **Interactive 3D terrain** — rotate, pan, and zoom to explore underwater landscapes.
- **Vertical exaggeration** — adjust the display scale to make subtle elevation differences easier to see.
- **Depth contours** — display contour lines alongside the 3D terrain.
- **Wireframe view** — inspect the underlying terrain mesh.
- **Map overlay** — add OpenStreetMap imagery with adjustable opacity.
- **Geographic context** — inspect the selected area's coordinates and open its location in Google Maps.
- **Dataset selection** — switch between available bathymetric regions.
- **Responsive interface** — a dark-themed viewer with collapsible controls on smaller screens.
- **Loading feedback** — display progress feedback while larger datasets load.

## Example datasets

| Area | Description |
| --- | --- |
| Monterey Bay, California | Coastal and submarine terrain off California, USA |
| Kāneʻohe Bay, Hawaii | Bathymetry of a coastal bay in Hawaii, USA |
| Mariana Trench | Deep-ocean terrain in the western Pacific |
| Bermuda | Bathymetric and topographic elevation around Bermuda |

Dataset files are derived from scientific elevation models, primarily provided by [NOAA's National Centers for Environmental Information (NCEI)](https://www.ncei.noaa.gov/).

## Technology

**Frontend**
- React and TypeScript
- Vite
- Three.js, React Three Fiber, and Drei
- Tailwind CSS and shadcn/ui
- GeoTIFF parsing in the browser
- D3 contour generation

**Data**
- netCDF and GeoTIFF elevation datasets
- GDAL for downloading, cleaning, and preparing raster data
- An API-backed dataset catalog for metadata such as names, raster paths, and source links

## Getting started

### Prerequisites

- Node.js and npm
- Access to the configured dataset API and GeoTIFF assets

GDAL is only needed if you want to prepare additional elevation datasets.

### Run the frontend

From the frontend project directory:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

The dataset catalog API must be running and configured as expected by your frontend. Refer to the application's API configuration for its base URL. GeoTIFF files referenced by the catalog must also be accessible.

### Build for production

```bash
npm run build
npm run preview
```

## Preparing new datasets

BathAtlas works with elevation rasters prepared for browser-based rendering. Source data may be considerably larger than the versions used by the viewer.

The `prepare-bathymetry.sh` script downloads a NOAA regional netCDF dataset, handles invalid elevation values, and creates a compressed, downsampled GeoTIFF.

You will need `curl`, `gdalinfo`, `gdal_translate`, and `gdal_calc.py` (or `gdal_calc`) installed.

Run the script from the project root:

```bash
./prepare-bathymetry.sh monterey_bay_P080_2018
```

By default, the script creates:

```text
data/raw/<dataset>.nc          # Original netCDF download
public/data/<dataset-slug>.tif # Browser-ready GeoTIFF
```

The output width defaults to 320 pixels and can be changed:

```bash
BATHYMETRY_WIDTH=512 ./prepare-bathymetry.sh bermuda_1_msl_2013
```

The script also prints a suggested SQL `INSERT` statement for the `datasets` table, including the raster path and source URL. Register the new dataset in the catalog before selecting it in the application.

For supported script options:

```bash
./prepare-bathymetry.sh --help
```

## How rendering works

1. Bathymetric elevations are loaded from a GeoTIFF.
2. Raster samples are transformed into a 3D terrain mesh.
3. Camera controls allow inspection of the terrain from different angles.
4. Optional contour lines, wireframe rendering, and map imagery provide additional context.
5. Vertical exaggeration changes the *displayed* relief without modifying the underlying source elevations.

Because raster resolution, vertical reference systems, and data coverage differ by source, visual comparisons between datasets should be treated with care.

## Data sources and attribution

BathAtlas uses elevation datasets from [NOAA NCEI](https://www.ncei.noaa.gov/) and map imagery from [OpenStreetMap](https://www.openstreetmap.org/).

**© OpenStreetMap contributors** — [copyright and attribution](https://www.openstreetmap.org/copyright).

Individual datasets may have different source metadata, resolutions, vertical datums, and usage conditions. Consult the original dataset source for details.

BathAtlas is a visualization and exploration project, **not a nautical navigation tool**. Do not use its rendered depths for navigation or safety-critical decisions.
