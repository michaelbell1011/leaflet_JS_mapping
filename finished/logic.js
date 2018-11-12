// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});


// function which defines the marker color in hex format based earthquake magnitude 
// copying dopplar radar scale
//
// 5+ magnitude, will dark red #990000
// 4-5 magnitude will be light red #ff3300 
// 3-4 magnitude will be orange #ff751a 
// 2-3 magnitude will be yellow #ffff4d 
// 1-2 magnitude will be light green #99ff33 
// 0-1 magnitude will be light blue #66ccff
function getColor(d) {
  return d > 5 ? '#990000' :
         d > 4 ? '#ff3300' :
         d > 3 ? '#ff751a' :
         d > 2 ? '#ffff4d' :
         d > 1 ? '#99ff33' :
                  '#66ccff';
}

//  function which defines marker radius in pixels based on earthquake magnitude 
// 5+ magnitude will have radius of 40
// 4-5 magnitude will have radius of 30
// 3-4 magnitude will have radius of 20
// 2-3 magnitude will have radius of 15
// 1-2 magnitude will have radius of 10
// 0-1 magnitude will have radius of 5
function getRadius(d) {
  return d > 5 ? 40 :
         d > 4 ? 30 :
         d > 3 ? 20 :
         d > 2 ? 15 :
         d > 1 ? 10 :
                  5;
  }
  

// Define a function we want to run once for each feature in the features array
function createFeatures(earthquakeData) {

  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" +
      "<p>Earthquake Magnitude: " + feature.properties.mag + "</p>" + 
      `<p>More info about this event: <a href="` + feature.properties.url + `">link</a></p>`);
  }

  // Use the pointToLayer function to create a circleMarker instead of the standard marker
  // radius of each circle marker will be output of the getRadius function passing in the magnitude value
  function pointToLayer(feature, latlng) {
    var geojsonMarkerOptions = {
      radius: getRadius(feature.properties.mag),
    };
    return L.circleMarker(latlng, geojsonMarkerOptions);
  }

  // Use the style function to style each circle marker
  // the fillcolor will be output of getColor function passing in the magnitude value
  function style(feature) {
    return {
      fillColor: getColor(feature.properties.mag),
      weight: 1,
      opacity: 1,
      color: 'grey',
      fillOpacity: 0.75
    };
  }


  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: pointToLayer,
    style: style
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Create the tile layer that will be the background of our map
  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // Create a baseMaps object to hold the lightmap layer
  var baseMaps = {
    "Light Map": lightmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      30, 5
    ],
    zoom: 2,
    layers: [lightmap, earthquakes]
  });


  // Set up the legend in the bottom right position
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function () {
    // create 'legend' div element
    var div = L.DomUtil.create('div', 'legend'),
    // set up the legend intervals by magnitudes (0-1, 1-2, 2-3, 4-5, 5+)
    magnitudes = [0, 1, 2, 3, 4, 5],
    // create array called labels and start with text 'Magnitudes:'
    labels = ['Magnitudes:'];

    // loop through magnitudes intervals and generate a label with a colored square for each interval
    for (var i = 0; i < magnitudes.length; i++) {
        div.innerHTML +=
            labels.push(
              '<li style="background:' + getColor(magnitudes[i] + 1) + '"></li> ' +
            magnitudes[i] + (magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '<br>' : '+'));
    }
    div.innerHTML = labels.join('<br>');
    return div;
  };
  legend.addTo(myMap);  

  // Create a layer control
  // Pass in our baseMap and overlayMaps
  // Not adding this control layer to the map for this exercise
  // L.control.layers(baseMaps, overlayMaps, {
  //   collapsed: true
  // }).addTo(myMap);

}
