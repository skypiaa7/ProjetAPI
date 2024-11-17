# app.py
from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

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

if __name__ == '__main__':
    app.run(debug=True, port=5001)
