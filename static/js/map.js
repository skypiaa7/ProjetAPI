// Initialiser la carte avec un centre et un niveau de zoom
var map = L.map('map').setView([48.8566, 2.3522], 6); // Vue centrée sur la France

// Ajouter une couche de tuiles à la carte
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Variables pour les marqueurs
var startMarker = null;
var endMarker = null;
var routeLine = null;  // Nouvelle variable pour stocker la ligne de route

// Fonction pour obtenir un trajet via OpenRouteService
function getRoute(startCoords, endCoords) {
    var url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf6248d96076cf98fd4e48aa2854bd1275baf1&start=${startCoords.lon},${startCoords.lat}&end=${endCoords.lon},${endCoords.lat}`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data && data.features && data.features.length > 0) {
                var coordinates = data.features[0].geometry.coordinates;
                var routeCoords = coordinates.map(function(coord) {
                    return [coord[1], coord[0]]; // Inverser lat et lon
                });

                // Si une ligne existe déjà, la retirer
                if (routeLine) {
                    map.removeLayer(routeLine); // Supprimer l'itinéraire précédent
                }

                // Ajouter une polyline sur la carte
                routeLine = L.polyline(routeCoords, { color: 'blue' }).addTo(map);
                map.fitBounds(routeLine.getBounds());
            } else {
                alert("Impossible de récupérer un trajet.");
            }
        })
        .catch(error => console.error('Erreur lors de la récupération de l\'itinéraire :', error));
}

// Fonction pour ajouter un marqueur
function addMarkers() {
    var startCity = document.getElementById('startCity').value;
    var endCity = document.getElementById('endCity').value;

    if (!startCity || !endCity) {
        alert("Veuillez entrer des villes valides.");
        return;
    }

    geocodeCity(startCity, function(startCoords) {
        if (startMarker) {
            map.removeLayer(startMarker);
        }
        startMarker = L.marker([startCoords.lat, startCoords.lon]).addTo(map)
            .bindPopup("Ville de départ : " + startCity).openPopup();

        geocodeCity(endCity, function(endCoords) {
            if (endMarker) {
                map.removeLayer(endMarker);
            }
            endMarker = L.marker([endCoords.lat, endCoords.lon]).addTo(map)
                .bindPopup("Ville d'arrivée : " + endCity).openPopup();

            // Appeler la fonction pour tracer le trajet
            getRoute(startCoords, endCoords);
        });
    });
}

// Fonction pour obtenir les coordonnées de la ville
function geocodeCity(city, callback) {
    var url = `https://nominatim.openstreetmap.org/search?q=${city}&format=json&limit=1`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                var lat = data[0].lat;
                var lon = data[0].lon;
                callback({ lat: lat, lon: lon });
            } else {
                alert("Aucune ville trouvée.");
            }
        })
        .catch(error => console.error('Erreur lors de la récupération des données :', error));
}

// Fonction pour récupérer la liste des véhicules depuis le fichier JSON
function fetchVehicles() {
    fetch('/static/js/vehicleData.json')  // URL relative vers le fichier JSON
        .then(response => response.json())  // Parser le fichier JSON
        .then(vehicles => {
            const vehicleList = document.getElementById('vehicle-list');
            
            // Remplir la liste déroulante avec les véhicules
            vehicles.forEach(vehicle => {
                const option = document.createElement('option');
                option.value = vehicle.id;
                option.textContent = `${vehicle.naming.make} ${vehicle.naming.model}`;
                vehicleList.appendChild(option);
            });

            // Écouter la sélection d'un véhicule
            vehicleList.addEventListener('change', function () {
                const selectedVehicle = vehicles.find(vehicle => vehicle.id === vehicleList.value);
                if (selectedVehicle) {
                    document.getElementById('vehicle-details').innerHTML = `
                        <strong>Modèle:</strong> ${selectedVehicle.naming.make} ${selectedVehicle.naming.model} <br>
                        <strong>Version:</strong> ${selectedVehicle.naming.chargetrip_version} <br>
                        <strong>Autonomie:</strong> ${selectedVehicle.range.chargetrip_range.best} km (meilleure) - ${selectedVehicle.range.chargetrip_range.worst} km (pire) <br>
                        <img src="${selectedVehicle.media.image.thumbnail_url}" alt="${selectedVehicle.naming.make} ${selectedVehicle.naming.model}" style="width: 200px;">
                    `;
                }
            });
        })
        .catch(error => console.error('Erreur lors du chargement des véhicules :', error));
}


// Appeler la fonction pour récupérer les véhicules au chargement de la page
window.onload = function () {
    fetchVehicles();
};
