# generate_vehicle_data.py

import os
import json
import requests
from dotenv import load_dotenv

def load_environment():
    """
    Charge les variables d'environnement depuis le fichier .env
    """
    load_dotenv()
    api_url = os.getenv('API_URL')
    client_id = os.getenv('CLIENT_ID')
    app_id = os.getenv('APP_ID')

    if not all([api_url, client_id, app_id]):
        raise ValueError("Les variables d'environnement API_URL, CLIENT_ID et APP_ID doivent être définies dans le fichier .env")

    return api_url, client_id, app_id

def get_vehicle_list_query():
    """
    Retourne la requête GraphQL pour obtenir la liste des véhicules
    """
    return """
    query vehicleList($page: Int, $size: Int, $search: String) {
      vehicleList(page: $page, size: $size, search: $search) {
        id
        naming {
          make
          model
          chargetrip_version
        }
        range {
          chargetrip_range {
            best
            worst
          }
        }
        media {
          image {
            thumbnail_url
          }
        }
      }
    }
    """

def fetch_vehicles(api_url, headers, page=0, size=10, search=''):
    """
    Exécute la requête GraphQL pour récupérer la liste des véhicules
    """
    query = get_vehicle_list_query()
    payload = {
        "query": query,
        "variables": {
            "page": page,
            "size": size,
            "search": search
        }
    }

    try:
        response = requests.post(api_url, json=payload, headers=headers)
        response.raise_for_status()  # Lève une exception pour les codes de statut HTTP 4xx/5xx

        result = response.json()

        if 'data' in result and 'vehicleList' in result['data']:
            return result['data']['vehicleList']
        else:
            print("Erreur : 'vehicleList' non récupéré ou vide :", result)
            return None

    except requests.exceptions.RequestException as e:
        print("Erreur lors de la requête vers l'API :", e)
        return None

def save_to_json(data, output_path):
    """
    Enregistre les données dans un fichier JSON
    """
    try:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)  # Crée le dossier s'il n'existe pas
        with open(output_path, 'w', encoding='utf-8') as json_file:
            json.dump(data, json_file, ensure_ascii=False, indent=2)
        print(f"Fichier JSON généré avec succès à {output_path}")
    except IOError as e:
        print(f"Erreur lors de l'écriture du fichier JSON : {e}")

def main():
    api_url, client_id, app_id = load_environment()

    headers = {
        'Content-Type': 'application/json',
        'x-client-id': client_id,
        'x-app-id': app_id
    }

    # Paramètres de la requête
    page = 0
    size = 10
    search = ''

    # Récupérer les données des véhicules
    vehicle_data = fetch_vehicles(api_url, headers, page, size, search)

    if vehicle_data:
        # Définir le chemin de sortie
        output_path = os.path.join('static', 'json', 'vehicleData.json')
        save_to_json(vehicle_data, output_path)

if __name__ == "__main__":
    main()