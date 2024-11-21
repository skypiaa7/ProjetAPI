# ProjetAPI

Ce projet est une application qui permet de gérer et consulter des informations sur les voitures via une API. L'objectif est de fournir une interface simple et performante pour interagir avec une base de données, en réalisant des opérations comme l'ajout, la modification, la suppression ou la consultation des données.

## Fonctionnalités

- **Ajout de véhicules** : Inscrire de nouveaux véhicules dans la base de données.
- **Modification de véhicules** : Mettre à jour les informations existantes.
- **Suppression de véhicules** : Supprimer un véhicule de la base.
- **Consultation de véhicules** : Voir les détails des véhicules enregistrés.
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
- Docker (optionnel, pour conteneurisation)
- MySQL ou SQLite (selon votre choix pour la base de données)

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

