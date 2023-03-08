// Vizchange map start point



// Initialize leaflet.js
let L = require('leaflet');

// Initialize the map
let map = L.map('map', {
   dragging: false,
    minZoom: 5,
    maxZoom: 10,
    scrollWheelZoom: false,
});

let kommuner = require('./geojson/kommuner.geo.json');
let landskap = require('./geojson/lan.json')

//layerControl = L.control.layers({}, null, { collapsed: false }).addTo(map);

//layerControl.hide
// Set the position and zoom level of the map
map.setView([63, 16], 5);

let size = 2
let greenIcon = L.icon({
    iconUrl: 'resources/leaf-green.png',
    /*
    shadowUrl: 'resources/leaf-shadow.png',

     */

    iconSize:     [38/size, 95/size], // size of the icon
    shadowSize:   [50/size, 64/size], // size of the shadow
    iconAnchor:   [22/size, 94/size], // point of the icon which will correspond to marker's location
    shadowAnchor: [4/size, 62/size],  // the same for the shadow
    popupAnchor:  [-3/size, -76/size] // point from which the popup should open relative to the iconAnchor
});


// Zoom feature
function zoomToFeature(e) {
    let bounds = e.target.getBounds();
    map.fitBounds(bounds);
}
function onEachFeature(feature, layer) {
    layer.on({
        click: (e) => {
            let kod = feature.properties.LnKod
            addKommuns(Number(feature.properties.LnKod))
            return zoomToFeature(e)
        },
        dblclick: (e) => {
            /*
            console.log('double click', e)
            addKommuns(300)
            map.setZoom(1)
             */
        }
    });
}


let kommun_layer = undefined
function addKommuns(currentLan) {
    if(kommun_layer !== undefined && currentLan){
        kommun_layer.clearLayers();
    }
    kommun_layer = L.geoJSON(kommuner, {
        onEachFeature: onEachFeature,
        style: (feature) => {
            let kod = feature.properties.KnKod;
            return {
                className: `kommun ${kod}`,
            };
        },
        zoom: 1,
        filter: (feature) => {
            let code = Math.floor(feature.properties.KnKod/100);
            return code === currentLan
        }
    })
    kommun_layer.addTo(map);
}

let land_layer = L.geoJSON(landskap, {
    onEachFeature: onEachFeature,
    style: (feature) => {
        return {
            className: 'landskap ' + feature.properties.LnKod
        };
    }
})
land_layer.addTo(map);

map.setMaxBounds(land_layer.getBounds());

map.fitBounds(land_layer.getBounds(), {
    duration: 0,
    animation: false
});


let {stations} = require('vizchange-smhi');
stations = stations.getStations();
stations.then(result => {
    result.forEach((points) => {
        console.log(points)
        let icon = L.divIcon({className: 'icon'});
        let latLng = L.latLng(points.latitude, points.longitude)
        let marker = L.marker(latLng, {
            icon: icon,
        })
        marker.bindPopup(`<b>${points.formatedName}</b><br>${points.params}`)
        marker.addTo(map);
    })
})





