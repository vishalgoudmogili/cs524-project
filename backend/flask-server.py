from flask import Flask, jsonify
import geopandas as gpd
import pandas as pd
from shapely.geometry import mapping
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load the processed GeoJSON files
street_geojson_path = "street_lvi.geojson"
boundary_geojson_path = "chicago_boundaries.geojson"

# Load data
street_data = gpd.read_file(street_geojson_path)
boundary_data = gpd.read_file(boundary_geojson_path)

# Preprocess GeoDataFrame for JSON compatibility
def preprocess_geodataframe(gdf):
    # Replace NaN with JSON-compatible values
    gdf = gdf.fillna({
        'Crime_Count': 0,
        'LVI': 0,
        'LPI': 0,
        'Street_Light_Outage': 0,
        'Top_Crime': 'Unknown',
        'Frequent_Time': 'Unknown'
    })

    # Ensure all numeric fields are cast to appropriate types
    for col in gdf.select_dtypes(['float', 'int']).columns:
        gdf[col] = gdf[col].fillna(0).astype(float)

    # Convert GeoDataFrame to GeoJSON-compatible format
    geojson_features = []
    for _, row in gdf.iterrows():
        feature = {
            "type": "Feature",
            "geometry": mapping(row.geometry),
            "properties": {col: row[col] for col in gdf.columns if col != 'geometry'}
        }
        geojson_features.append(feature)

    geojson = {
        "type": "FeatureCollection",
        "features": geojson_features
    }
    return geojson

# Process street data
filtered_streets = street_data[
    street_data['cleaned_block'].str.contains(
        '|'.join([
            'Halsted', 'Ashland', 'State', 'Roosevelt', 'Taylor',
            'Pulaski', 'S HALSTED ST', 'W 35TH ST', 'W NORTH AVE',
            'S LAKE SHORE DR', 'W FULLERTON AVE', 'W BELMONT AVE'
        ]),
        na=False, case=False
    )
]
processed_street_data = preprocess_geodataframe(filtered_streets)

# Process boundary data
processed_boundary_data = preprocess_geodataframe(boundary_data)

@app.route('/api/streets', methods=['GET'])
def get_street_data():
    return jsonify(processed_street_data)

@app.route('/api/boundaries', methods=['GET'])
def get_boundary_data():
    return jsonify(processed_boundary_data)

if __name__ == '__main__':
    app.run(debug=True)
