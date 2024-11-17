# app.py
from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

# Clé API OpenRouteService en clair
OPENROUTESERVICE_API_KEY = '5b3ce3597851110001cf6248d96076cf98fd4e48aa2854bd1275baf1'  # Remplacez par votre clé API

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/autocomplete', methods=['GET'])
def autocomplete():
    city_query = request.args.get('q')
    if city_query:
        # Inclure countrycodes=fr pour prioriser les villes de France
        url = f"https://nominatim.openstreetmap.org/search?q={city_query}&format=json&limit=5&addressdetails=1&countrycodes=fr"
        headers = {'User-Agent': 'VotreNomDApplication'}  # Remplacez par le nom de votre application
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            suggestions = []
            for item in data:
                address = item.get('address', {})
                # Nominatim peut utiliser 'city', 'town', 'village' ou 'hamlet' pour la localité
                city = address.get('city') or address.get('town') or address.get('village') or address.get('hamlet')
                country = address.get('country')
                if city and country:
                    label = f"{city}, {country}"
                    value = f"{city}, {country}"
                    suggestions.append({"label": label, "value": value})
            return jsonify(suggestions)
    return jsonify([])

@app.route('/get-route', methods=['POST'])
def get_route():
    data = request.get_json()
    start = data.get('start')
    end = data.get('end')
    
    if not start or not end:
        return jsonify({"error": "Coordonnées de départ et d'arrivée requises"}), 400

    # Préparer l'appel à l'API OpenRouteService
    url = 'https://api.openrouteservice.org/v2/directions/driving-car'
    headers = {
        'Authorization': OPENROUTESERVICE_API_KEY,
        'Content-Type': 'application/json'
    }
    body = {
        "coordinates": [
            [start['lon'], start['lat']],
            [end['lon'], end['lat']]
        ]
    }

    response = requests.post(url, json=body, headers=headers)
    if response.status_code == 200:
        return jsonify(response.json())
    else:
        # Vous pouvez personnaliser le message d'erreur selon le besoin
        return jsonify({"error": "Erreur lors de la récupération de l'itinéraire"}), response.status_code

if __name__ == '__main__':
    app.run(debug=True, port=5001)
