#!/usr/bin/env bash

set -Eeuo pipefail

readonly DEFAULT_NOAA_BASE_URL="https://www.ngdc.noaa.gov/thredds/fileServer/regional"
readonly DEFAULT_OUTPUT_WIDTH="320"
readonly OUTPUT_NODATA="-9999"

usage() {
  cat <<'EOF'
Download a NOAA regional DEM and prepare it for the BathAtlas frontend.

Usage:
  ./prepare-bathymetry.sh DATASET_NAME

Examples:
  ./prepare-bathymetry.sh kaneohe_13_mhw_2016
  ./prepare-bathymetry.sh bermuda_1_msl_2013.nc
  ./prepare-bathymetry.sh monterey_bay_P080_2018

The script writes:
  data/raw/<dataset>.nc
  public/data/<derived-slug>.tif

Optional environment variables:
  BATHYMETRY_PROJECT_ROOT  Project root; defaults to the current directory.
  BATHYMETRY_WIDTH         Output width in pixels; defaults to 320.
  BATHYMETRY_SLUG          Override the automatically derived output slug.
  BATHYMETRY_NAME          Override the name used in the generated SQL.
  BATHYMETRY_DESCRIPTION   Override the description used in the generated SQL.
  NOAA_DEM_BASE_URL        Override the NOAA regional download base URL.
EOF
}

fail() {
  printf 'Error: %s\n' "$*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 ||
    fail "Required command '$1' was not found."
}

derive_slug() {
  local dataset_name="$1"
  local friendly_name

  friendly_name="$dataset_name"
  friendly_name="$(
    printf '%s\n' "$friendly_name" |
      sed -E \
        -e 's/_[0-9]+_(mhw|mhhw|navd88|msl|isl|mllw)_[0-9]{4}$//' \
        -e 's/_[A-Za-z][0-9]+_[0-9]{4}$//' \
        -e 's/_[0-9]+_[0-9]{4}$//'
  )"

  printf '%s' "${friendly_name//_/-}"
}

derive_display_name() {
  local slug="$1"

  printf '%s\n' "${slug//-/ }" |
    awk '{
      for (i = 1; i <= NF; i += 1) {
        $i = toupper(substr($i, 1, 1)) substr($i, 2)
      }
      print
    }'
}

sql_literal() {
  printf "'"
  printf '%s' "$1" | sed "s/'/''/g"
  printf "'"
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

[[ $# -eq 1 ]] || {
  usage >&2
  exit 2
}

dataset_name="${1%.nc}"

[[ "$dataset_name" =~ ^[A-Za-z0-9._-]+$ ]] ||
  fail "Dataset name may contain only letters, numbers, dots, underscores and hyphens."

project_root="${BATHYMETRY_PROJECT_ROOT:-$(pwd)}"
output_width="${BATHYMETRY_WIDTH:-$DEFAULT_OUTPUT_WIDTH}"
noaa_base_url="${NOAA_DEM_BASE_URL:-$DEFAULT_NOAA_BASE_URL}"
output_slug="${BATHYMETRY_SLUG:-$(derive_slug "$dataset_name")}"
dataset_display_name="${BATHYMETRY_NAME:-$(derive_display_name "$output_slug")}"
dataset_description="${BATHYMETRY_DESCRIPTION:-Bathymetric and topographic elevation model for $dataset_display_name.}"

[[ "$output_width" =~ ^[0-9]+$ ]] ||
  fail "BATHYMETRY_WIDTH must be a positive integer."
(( output_width > 0 )) || fail "BATHYMETRY_WIDTH must be greater than zero."

[[ "$output_slug" =~ ^[A-Za-z0-9._-]+$ ]] ||
  fail "The output slug contains unsupported characters."

require_command curl
require_command gdalinfo
require_command gdal_translate

if command -v gdal_calc.py >/dev/null 2>&1; then
  gdal_calc_command="$(command -v gdal_calc.py)"
elif command -v gdal_calc >/dev/null 2>&1; then
  gdal_calc_command="$(command -v gdal_calc)"
else
  fail "Neither 'gdal_calc.py' nor 'gdal_calc' was found. Install the GDAL Python utilities."
fi

raw_directory="$project_root/data/raw"
output_directory="$project_root/public/data"
raw_file="$raw_directory/$dataset_name.nc"
download_part="$raw_directory/.$dataset_name.nc.part"
clean_file="$raw_directory/.$dataset_name-clean-$$.tif"
output_file="$output_directory/$output_slug.tif"
output_temporary="$output_directory/.$output_slug-$$.tif"
download_url="${noaa_base_url%/}/$dataset_name.nc"

mkdir -p -- "$raw_directory" "$output_directory"

cleanup() {
  rm -f -- "$download_part" "$clean_file" "$output_temporary"
}

trap cleanup EXIT

printf 'Dataset: %s\n' "$dataset_name"
printf 'Output slug: %s\n' "$output_slug"

if [[ -s "$raw_file" ]]; then
  printf 'Using existing download: %s\n' "$raw_file"
else
  printf 'Downloading: %s\n' "$download_url"
  curl \
    --fail \
    --location \
    --retry 3 \
    --retry-delay 2 \
    --output "$download_part" \
    "$download_url"
  mv -- "$download_part" "$raw_file"
fi

printf 'Checking the NetCDF file...\n'
gdalinfo "$raw_file" >/dev/null ||
  fail "GDAL could not open the downloaded NetCDF file."

printf 'Cleaning invalid elevation values...\n'
"$gdal_calc_command" \
  -A "$raw_file" \
  --outfile="$clean_file" \
  --calc="numpy.where(numpy.logical_or(A < -100000, A > 100000), $OUTPUT_NODATA, A)" \
  --NoDataValue="$OUTPUT_NODATA" \
  --type=Float32 \
  --hideNoData \
  --co=TILED=YES \
  --co=COMPRESS=DEFLATE \
  --co=PREDICTOR=3 \
  --overwrite

printf 'Creating the browser GeoTIFF (%s px wide)...\n' "$output_width"
gdal_translate \
  -of GTiff \
  -ot Float32 \
  -r average \
  -outsize "$output_width" 0 \
  -a_nodata "$OUTPUT_NODATA" \
  -co TILED=YES \
  -co COMPRESS=DEFLATE \
  -co PREDICTOR=3 \
  -co BIGTIFF=IF_SAFER \
  "$clean_file" \
  "$output_temporary"

mv -f -- "$output_temporary" "$output_file"
rm -f -- "$raw_file"

printf '\nCreated: %s\n' "$output_file"
printf 'Frontend path: /data/%s.tif\n\n' "$output_slug"

gdalinfo -mm "$output_file" |
  awk '/Size is|Computed Min\/Max|NoData Value/'

printf '\nSuggested database insert:\n\n'
printf 'INSERT INTO datasets (\n'
printf '    slug,\n'
printf '    name,\n'
printf '    description,\n'
printf '    raster_path,\n'
printf '    thumbnail_path,\n'
printf '    source_url\n'
printf ')\n'
printf 'VALUES (\n'
printf '    %s,\n' "$(sql_literal "$output_slug")"
printf '    %s,\n' "$(sql_literal "$dataset_display_name")"
printf '    %s,\n' "$(sql_literal "$dataset_description")"
printf '    %s,\n' "$(sql_literal "/data/$output_slug.tif")"
printf '    NULL,\n'
printf '    %s\n' "$(sql_literal "$download_url")"
printf ');\n'

