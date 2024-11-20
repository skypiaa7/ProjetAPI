# app.py
from flask import Flask, render_template, request, jsonify
import requests
import os
import json
from dotenv import load_dotenv

# Charger les variables d'environnement depuis le fichier .env
load_dotenv()

# Récupérer la clé API OpenRouteService depuis les variables d'environnement
OPENROUTESERVICE_API_KEY = os.getenv('OPENROUTESERVICE_API_KEY')

# Initialiser l'application Flask
app = Flask(__name__)

@app.route('/')
def index():
    """
    Route pour la page d'accueil.
    Rendu du template 'index.html'.
    """
    return render_template('index.html')

@app.route('/autocomplete', methods=['GET'])
def autocomplete():
    """
    Route pour l'autocomplétion des villes.
    Prend un paramètre 'q' en query string et retourne des suggestions de villes en France.
    """
    city_query = request.args.get('q')  # Récupérer le paramètre de recherche 'q'
    if city_query:
        # Construire l'URL de la requête à l'API Nominatim d'OpenStreetMap
        url = f"https://nominatim.openstreetmap.org/search?q={city_query}&format=json&limit=5&addressdetails=1&countrycodes=fr"
        headers = {'User-Agent': 'VotreNomDApplication'}  # Définir l'agent utilisateur
        response = requests.get(url, headers=headers)  # Faire la requête GET à l'API
        if response.status_code == 200:
            data = response.json()  # Parser la réponse JSON
            suggestions = []
            for item in data:
                address = item.get('address', {})
                # Extraire le nom de la ville en fonction des différentes clés possibles
                city = address.get('city') or address.get('town') or address.get('village') or address.get('hamlet')
                country = address.get('country')
                if city and country:
                    label = f"{city}, {country}"  # Format de l'étiquette pour l'autocomplétion
                    value = f"{city}, {country}"  # Valeur retournée
                    suggestions.append({"label": label, "value": value})
            return jsonify(suggestions)  # Retourner les suggestions au format JSON
    return jsonify([])  # Retourner une liste vide si aucune suggestion n'est trouvée

@app.route('/get-route', methods=['POST'])
def get_route():
    """
    Route pour obtenir l'itinéraire entre deux points.
    Attend un JSON contenant 'start' et 'end' avec les coordonnées géographiques.
    """
    data = request.get_json()  # Récupérer les données JSON de la requête
    start = data.get('start')  # Coordonnées de départ
    end = data.get('end')      # Coordonnées d'arrivée
    
    if not start or not end:
        # Retourner une erreur si les coordonnées sont manquantes
        return jsonify({"error": "Coordonnées de départ et d'arrivée requises"}), 400

    # URL de l'API OpenRouteService pour les directions en voiture
    url = 'https://api.openrouteservice.org/v2/directions/driving-car'
    headers = {
        'Authorization': OPENROUTESERVICE_API_KEY,  # Clé API pour l'authentification
        'Content-Type': 'application/json'           # Type de contenu de la requête
    }
    body = {
        "coordinates": [
            [start['lon'], start['lat']],  # Coordonnées de départ [longitude, latitude]
            [end['lon'], end['lat']]       # Coordonnées d'arrivée [longitude, latitude]
        ],
        "format": "geojson"  # Format de la réponse géométrique
    }

    response = requests.post(url, json=body, headers=headers)  # Faire la requête POST à l'API
    if response.status_code == 200:
        return jsonify(response.json())  # Retourner la réponse de l'API au format JSON
    else:
        # Retourner une erreur personnalisée en cas d'échec de la requête
        return jsonify({"error": "Erreur lors de la récupération de l'itinéraire"}), response.status_code

@app.route('/geocode', methods=['GET'])
def geocode():
    """
    Route pour géocoder une ville et retourner ses coordonnées.
    Prend un paramètre 'q' en query string et retourne les coordonnées géographiques.
    """
    city_query = request.args.get('q')
    if city_query:
        url = f"https://nominatim.openstreetmap.org/search?q={city_query}&format=json&limit=1&countrycodes=fr"
        headers = {'User-Agent': 'VotreNomDApplication'}
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data:
                return jsonify({
                    'lat': float(data[0]['lat']),
                    'lon': float(data[0]['lon'])
                })
    return jsonify({"error": "Coordonnées non trouvées"}), 404

@app.route('/vehicles', methods=['GET'])
def get_vehicles():
    """
    Route pour obtenir les données des véhicules.
    Lit le fichier 'vehicleData.json' depuis le dossier 'static/json' et le retourne au format JSON.
    """
    try:
        # Chemin vers le fichier vehicleData.json
        vehicle_file_path = os.path.join(app.static_folder, 'json', 'vehicleData.json')
        with open(vehicle_file_path, 'r', encoding='utf-8') as f:
            vehicles = json.load(f)  # Charger les données JSON du fichier
        return jsonify(vehicles)  # Retourner les données des véhicules au format JSON
    except Exception as e:
        # Loguer l'erreur et retourner une réponse d'erreur
        print(f"Erreur lors du chargement des véhicules : {e}")
        return jsonify({"error": "Impossible de charger les données des véhicules."}), 500

if __name__ == '__main__':
    # Démarrer l'application Flask en mode debug sur le port 5001
    app.run(debug=True, port=5001)