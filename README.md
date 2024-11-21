# ProjetAPI

Ce projet est une application qui permet de tracer un route d'un point A à un point B en fonction de son vehicule électique.

## Fonctionnalités

- **Consultation de véhicules** : Voir les détails des véhicules enregistrés.
- **Consultation de véhicules** : Tracer un trajet d'un point A à un point B
- **API REST** : Interface permettant une intégration avec des outils ou applications tierces.

## Technologies utilisées

- **Backend** : Flask (Python)
- **Base de données** : MySQL ou SQLite
- **Frontend** : HTML, CSS, JavaScript
- **Conteneurisation** : Docker (si applicable)
- **Outils supplémentaires** : API REST, outils de test (Unittest ou Pytest)

## Prérequis

Avant de commencer, vous aurez besoin de :

- Python 3.8 ou version supérieure
- pip (Gestionnaire de paquets Python)

## Installation

1. **Cloner le dépôt** :  
   ```bash
   git clone https://github.com/skypiaa7/ProjetAPI.git
2. **Start venv** :  
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt

3. **configurer les variables d'environnement dans .env** :
   ```bash
   # Clés API GraphQL
   CLIENT_ID=
   APP_ID=
   API_URL=https://api.chargetrip.io/graphql

   # Clés API OpenRouteService 
   OPENROUTESERVICE_API_KEY=
   
4. **Démarer l'application** :
   ```bash
   python3 app.py

