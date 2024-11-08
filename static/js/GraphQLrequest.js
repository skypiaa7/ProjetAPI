// Point d'entrée de l'API GraphQL
const API_URL = 'https://api.chargetrip.io/graphql';

// En-têtes avec l'ID client et l'ID d'application pour l'autorisation
const headers = {
  'Content-Type': 'application/json',
  'x-client-id': '672b24c680a6ff9bad08d9d4',
  'x-app-id': '672b24c680a6ff9bad08d9d6'
};

// Requête GraphQL pour obtenir la liste des véhicules
const vehicleListQuery = `
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
`;

const fs = require('fs');

// Fonction pour exécuter la requête GraphQL
async function fetchVehicles(page = 0, size = 10, search = '') {
  const body = JSON.stringify({
    query: vehicleListQuery,
    variables: { page, size, search }
  });

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body
    });
    const result = await response.json();

    // Vérifie et affiche le résultat
    if (result.data && result.data.vehicleList) {
      fs.writeFileSync('vehicleData.json', JSON.stringify(result.data.vehicleList, null, 2));
      console.log("Données des véhicules :", result.data.vehicleList);
    } else {
      console.error("Erreur : vehicleList non récupéré ou vide :", result);
    }
  } catch (error) {
    console.error("Erreur lors de la requête vers l'API :", error);
  }
}

// Appel de la fonction pour tester
fetchVehicles();
