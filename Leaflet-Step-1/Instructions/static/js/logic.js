// Store our API endpoint inside queryUrl
// All earthquakes - Past 7 Days
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

//uncomment to see Significant earthquakes - Past Day
//var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function (data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
    console.log(data.features)
});

function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place + 
            "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    //By default simple markers are drawn for GeoJSON Points. We can alter this by 
    //passing a pointToLayer function in a GeoJSON options object when creating the GeoJSON layer. 
    //This function is passed a LatLng.
    //The onEachFeature option is a function that gets called on each feature before adding
    // it to a GeoJSON layer. A common reason to use this option is to attach a popup to 
    //features when they are clicked.
    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function (earthquakeData, latlng) {
            return L.circle(latlng, {
                color: circleColor(earthquakeData.properties.mag),
                radius: markerSize(earthquakeData.properties.mag),
                fillOpacity: .75
            });
        },
        onEachFeature: onEachFeature
    });


// Sending our earthquakes layer to the createMap function
createMap(earthquakes);
}

// Conditionals for earthquakes based on its magnitude

function circleColor(magnitude) {
    if (magnitude < 1) {
        return "#68FF33"
    }
    else if (magnitude < 2) {
        return "#CEFF33"
    }
    else if (magnitude < 3) {
        return "#FFF633"
    }
    else if (magnitude < 4) {
        return "#FFBB33"
    }
    else if (magnitude < 5) {
        return "#FF8633"
    }
    else {
        return "#FF4933"
    }
}

// Define a radius based on magnitude
function markerSize(magnitude) {
    return magnitude * 10000; // 40000 is arbitrary
}

function createMap(earthquakes) {

    // Create the tile layer that will be the background of our map
    var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 12,
        id: "mapbox.light",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold the lightmap layer
    var baseMaps = {
        "Light Map": lightmap,
    };

    // Create overlay object to hold the earthquake layer
    var overlayMaps = {
        "Earthquakes": earthquakes
    };

    // Create our map object with options
    var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 4.4,
        layers: [lightmap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps. Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);


// create custom legend control - leafletjs.com

// add legend to map
var legend = L.control({position: 'bottomright'});

legend.onAdd = function () {

    var div = L.DomUtil.create('div', 'info legend'),
        mag = [0, 1, 2, 3, 4, 5];
        
    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < mag.length; i++) {
        div.innerHTML +=
            '<i style="background:' + circleColor(mag[i]) + '"> &nbsp;&nbsp </i> ' +
            mag[i] + (mag[i + 1] ? '&ndash;' + mag[i + 1] + '<br>' : '+');
    }
    return div;
};

legend.addTo(myMap);
}









