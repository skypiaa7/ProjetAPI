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
        url = f"https://nominatim.openstreetmap.org/search?q={city_query}&format=json&limit=5"
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            suggestions = [{"label": item['display_name'], "value": item['display_name']} for item in data]
            return jsonify(suggestions)
    return jsonify([])

if __name__ == '__main__':
    app.run(debug=True, port=5001)

