// Vizchange map start point



let lib = require('vizchange-plot-builder')

// Initialize leaflet.js
let L = require('leaflet');

// Initialize the map
let map = L.map('map', {
   dragging: false,
    maxZoom: 10,
    scrollWheelZoom: false,
});

let kommuner = require('./geojson/kommuner.geo.json');
let landskap = require('./geojson/lan.json')

//layerControl = L.control.layers({}, null, { collapsed: false }).addTo(map);


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
function zoomToFeature(e, zoom) {
    let bounds = e.target.getBounds();
    $(`.plotArea`).removeClass('active')
    $(`#plotField`).removeClass('show')
    map.fitBounds(bounds);
    /*
    if(zoom){
        zoomLevel = map.getZoom()
    }else{
        zoomLevel = 10
    }
     */
}
function onEachFeature(feature, layer) {
    layer.on({
        click: (e) => {
            let kod = feature.properties.LnKod
            zoomToFeature(e, isNaN(Number(feature.properties.LnKod)))
            addKommuns(Number(feature.properties.LnKod));
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
let markers = new L.FeatureGroup();
stations.then(result => {
    result.filter(each => each.formatedName === "Falsterbo").forEach((points) => {
        let icon = L.divIcon({
            html: `<a class="icon" id="${points.id}">
<div class="icon-content"></div><options id="station-${points.id}"
data-longitude=${points.longitude} 
data-latitude=${points.latitude} 
data-station="${points.id}" 
data-name="${points.formatedName}"
data-set="annualTemperatures" 
<!-- data-hosturl="https://acp.k8s.glimworks.se" -->
data-hosturl="http://vizchange.hopto.org">

</options><a>`,
            className: 'icon-container',
            childId: points.id,
            configId: `#station-${points.id}`
        });
        let latLng = L.latLng(points.latitude, points.longitude)
        let marker = L.marker(latLng, {
            icon: icon,
        })

        marker.on('click', (event) => {
            $(`.plotArea`).removeClass('active')
            map.flyTo(event.target['_latlng'])
            $(`.plotArea`).toggleClass('active')

            $(`#plotField`).removeClass('show')
            $(`#plotField`).toggleClass('show')

            $('#plotConfig').attr('data-longitude', points.longitude)
            $('#plotConfig').attr('data-latitude', points.latitude)

            console.log(event.target.options.icon.options)
            let configId = event.target.options.icon.options.configId;
            lib.renderFromData("mark", configId)
        })
        marker.bindPopup(`<b>${points.formatedName}</b><br>${points.params}`)
        marker.on('mouseover', function (e) {
            this.openPopup();
        });
        marker.on('mouseout', function (e) {
            this.closePopup();
        });
        /*
        marker.bindTooltip(`${points.formatedName}`, {permanent: true, className: "label"})
         */
        markers.addLayer(marker)
    })
})
map.addLayer(markers)
let zoomLevel = 10
/*
map.on('zoomend', function() {

    if (map.getZoom() <= zoomLevel) {
        map.removeLayer(markers);
        zoomLevel = 10;
    } else {
        map.addLayer(markers);
    }
});

 */





