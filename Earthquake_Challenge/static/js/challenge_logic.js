// Add console.log to check to see if our code is working.
console.log("working");

// We create the tile layer that will be the background of our map.
let streets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	accessToken: API_KEY
});

// We create the second tile layer that will be the background of our map.
let satelliteStreets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	accessToken: API_KEY
});

let dark = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token={accessToken}', {
attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    accessToken:API_KEY
});

// Create the map object with center, zoom level and default layer.
let map = L.map('mapid', {
	center: [40.7, -94.5],
	zoom: 3,
	layers: [streets]
});

// Create a base layer that holds both maps.
let baseMaps = {
	"Streets": streets,
	"Satellite": satelliteStreets,
  "Dark": dark,
};

// Create the earthquake layer for the map.
let earthquakes = new L.LayerGroup();

// Create the earthquake layer for the map.
let tectonic_plates = new L.LayerGroup();

// 1. Add a 3rd layer group for the major earthquake data.
let majorEarthquakes = new L.LayerGroup();

// Define an object that contains the overlays.
// This overlay will be visible all the time.
let overlays = {
  "Earthquakes": earthquakes,
  "Tectonic Plates": tectonic_plates,
  "Major Earthquakes" : majorEarthquakes
};

// Pass map layers into layers control and add the layers control to the map.
// Add a control to the map to allow user to change which layers are visible
L.control.layers(baseMaps, overlays).addTo(map);

// Retrieve the earthquake GeoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(data) {
	
	// This function returns the style data for each of the earthquakes plotted on
	// the map. Then pass the magnitude of the earthquake into two separate functions
	// to calculate the color and radius.
	function styleInfo(feature) {
	  return {
	    opacity: 1,
	    fillOpacity: 1,
	    fillColor: getColor(feature.properties.mag),
	    color: "#000000",
	    radius: getRadius(feature.properties.mag),
	    stroke: true,
	    weight: 0.5
	  };
	}
	// This function determines the color of the circle based on the magnitude of the earthquake.
	function getColor(magnitude) {
	  if (magnitude > 5) {
	    return "#ea2c2c";
	  }
	  if (magnitude > 4) {
	    return "#ea822c";
	  }
	  if (magnitude > 3) {
	    return "#ee9c00";
	  }
	  if (magnitude > 2) {
	    return "#eecc00";
	  }
	  if (magnitude > 1) {
	    return "#d4ee00";
	  }
	  return "#98ee00";
	}
	// This function determines the radius of the earthquake marker based on its magnitude.
	// Earthquakes with a magnitude of 0 will be plotted with a radius of 1.
	function getRadius(magnitude) {
		if (magnitude === 0) {
			return 1;
		}
		return magnitude * 4;
	}
	// Creating a GeoJSON layer with the retrieved data.
	L.geoJson(data, {
		// Turn each feature into a circleMarker on the map.
		pointToLayer: function(feature, latlng) {
			return L.circleMarker(latlng);
		},
		// Set the style for each circleMarker using styleInfo function.
		style: styleInfo,
		// Create a popup for each circleMarker to display the magnitude and
	    // location of the earthquake after the marker has been created and styled.
		onEachFeature: function(feature, layer) {
			layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
		}
	}).addTo(earthquakes);

	// Add earthquake layer to map
	earthquakes.addTo(map);

// 3. Retrieve the major earthquake GeoJSON data >4.5 mag for the week.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson").then(function(data) {

// 4. Use the same style as the earthquake data.
function styleInfo2(feature) {
  return {
    opacity: 1,
    fillOpacity: 1,
    fillColor: getColor2(feature.properties.mag),
    color: "#000000",
    radius: getRadius2(feature.properties.mag),
    stroke: true,
    weight: 0.5
  };
}

 // 5. Change the color function to use three colors for the major earthquakes based on the magnitude of the earthquake.
 function getColor2(magnitude) {
  if (magnitude > 5) {
    return "#ea2c2c";
  }
  if (magnitude > 4) {
    return "#ea822c";
  }
  return "#98ee00";
}

// 6. Use the function that determines the radius of the earthquake marker based on its magnitude.
function getRadius2(magnitude) {
  if (magnitude === 0) {
    return 1;
  }
  return magnitude * 4;
}

// 7. Creating a GeoJSON layer with the retrieved data that adds a circle to the map 
// sets the style of the circle, and displays the magnitude and location of the earthquake
//  after the marker has been created and styled.
L.geoJson(data, {
  pointToLayer: function(feature, latlng) {
    console.log(data);
    return L.circleMarker(latlng);
  },
  style: styleInfo2,
  onEachFeature: function(feature, layer) {
    layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
  }

  // 8. Add the major earthquakes layer to the map.
}).addTo(majorEarthquakes);

// 9. Close the braces and parentheses for the major earthquake data.
  
majorEarthquakes.addTo(map);
});


// Create a legend control object.
let legend = L.control({
	position: "bottomright"
});

// Then add all the details for the legend.
legend.onAdd = function() {
	let div = L.DomUtil.create("div", "info legend");
	const magnitudes = [0, 1, 2, 3, 4, 5];
	const colors = [
		"#98ee00",
		"#d4ee00",
		"#eecc00",
		"#ee9c00",
		"#ea822c",
		"#ea2c2c"
	];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < magnitudes.length; i++) {
        div.innerHTML +=
            '<i style="background:' + colors[i] + '"></i> ' +
            magnitudes[i] + (magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '<br>' : '+');
    }

    return div;
};

// Add legend to map
legend.addTo(map);

// Fault line data found on github
let faultLineData = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

let lineStyle = {
	color: "#ff7438",
	weight: 2
};

// Grab tectonic plate boundary GeoJSON data
d3.json(faultLineData).then(function(data) {
	console.log(data);

	// Create a GeoJSON layer with the retrieved data
	L.geoJson(data, {
		style: lineStyle
	}).addTo(tectonic_plates);

	// Add tectnoic plates layer to map
	tectonic_plates.addTo(map);
  });
});

