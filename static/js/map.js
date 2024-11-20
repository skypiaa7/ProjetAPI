// static/js/map.js

// Initialiser la carte avec un centre et un niveau de zoom
var map = L.map('map').setView([48.8566, 2.3522], 6); // Vue centrée sur la France

// Ajouter une couche de tuiles à la carte
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Variables pour les marqueurs
var startMarker = null;
var endMarker = null;
var routeLine = null;  // Variable pour stocker la ligne de route

// Fonction pour obtenir un trajet via le backend Flask
function getRoute(startCoords, endCoords) {
    var url = '/get-route';
    var payload = {
        start: startCoords,
        end: endCoords
    };
    
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
            return;
        }

        if (data && data.routes && data.routes.length > 0) {
            var route = data.routes[0];
            var geometry = route.geometry;

            if (typeof geometry === "string") {
                // Décoder la polyline encodée
                var decoded = polyline.decode(geometry);

                // Convertir en format [lat, lon]
                var routeCoords = decoded.map(function(coord) {
                    return [coord[0], coord[1]];
                });

                // Si une ligne existe déjà, la retirer
                if (routeLine) {
                    map.removeLayer(routeLine); // Supprimer l'itinéraire précédent
                }

                // Ajouter une polyline sur la carte
                routeLine = L.polyline(routeCoords, { color: 'blue' }).addTo(map);
                map.fitBounds(routeLine.getBounds());
            } else if (geometry.type === "LineString" && geometry.coordinates) {
                var routeCoords = geometry.coordinates.map(function(coord) {
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
                alert("Format de géométrie non supporté.");
            }
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

// Fonction pour obtenir les coordonnées de la ville via le backend
function geocodeCity(city, callback) {
    var url = `/geocode?q=${encodeURIComponent(city)}`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert("Aucune ville correspondante trouvée.");
            } else {
                callback({ lat: data.lat, lon: data.lon });
            }
        })
        .catch(error => console.error('Erreur lors du géocodage :', error));
}

// Initialiser Awesomplete pour les champs de saisie des villes
document.addEventListener('DOMContentLoaded', function () {
    const startCityInput = document.getElementById('startCity');
    const endCityInput = document.getElementById('endCity');

    const startAwesomplete = new Awesomplete(startCityInput, {
        minChars: 2,
        maxItems: 5,
        autoFirst: true,
        list: []
    });

    const endAwesomplete = new Awesomplete(endCityInput, {
        minChars: 2,
        maxItems: 5,
        autoFirst: true,
        list: []
    });

    // Fonction pour mettre à jour les suggestions
    function updateSuggestions(inputElement, awesompleteInstance) {
        const query = inputElement.value;
        if (query.length < 2) {
            awesompleteInstance.list = [];
            return;
        }

        fetch(`/autocomplete?q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                awesompleteInstance.list = data.map(item => item.label);
            })
            .catch(error => console.error('Erreur lors de l\'autocomplétion :', error));
    }

    // Ajouter des événements pour mettre à jour les suggestions
    startCityInput.addEventListener('input', function () {
        updateSuggestions(startCityInput, startAwesomplete);
    });

    endCityInput.addEventListener('input', function () {
        updateSuggestions(endCityInput, endAwesomplete);
    });

    // Supprimer l'indicateur de chargement une fois la carte initialisée
    var loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
    }

    // Appeler la fonction pour récupérer les véhicules
    fetchVehicles();
});

// Fonction pour récupérer la liste des véhicules depuis le backend Flask via REST
function fetchVehicles() {
    fetch('/vehicles', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(vehicles => {
        if (vehicles && Array.isArray(vehicles)) {
            const vehicleList = document.getElementById('vehicle-list');
            vehicleList.innerHTML = '<option value="">Sélectionner un véhicule</option>'; // Réinitialiser la liste

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
                } else {
                    document.getElementById('vehicle-details').innerHTML = '';
                }
            });
        } else {
            alert("Aucune donnée de véhicule trouvée.");
        }
    })
    .catch(error => console.error('Erreur lors du chargement des véhicules :', error));
}