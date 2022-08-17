var map;
var timeout;

function getPolygon() {
    bounds = map.getBounds();
    return "[[" + 
	"[" + bounds.getNorthEast().lng() + "," + bounds.getSouthWest().lat() + "]," +
	"[" + bounds.getSouthWest().lng() + "," + bounds.getSouthWest().lat() + "]," +
	"[" + bounds.getSouthWest().lng() + "," + bounds.getNorthEast().lat() + "]," +
	"[" + bounds.getNorthEast().lng() + "," + bounds.getNorthEast().lat() + "]," +
	"[" + bounds.getNorthEast().lng() + "," + bounds.getSouthWest().lat() + "]" +
	"]]";   
}
    
function updateMap() {
    map.data.forEach(function (feature) {
	map.data.remove(feature);
    });
    polygon = getPolygon();
    
    if (map.getZoom() > 13) {
	map.data.loadGeoJson("https://dawa.aws.dk/jordstykker?polygon=" + polygon + "&format=geojson&per_side=10000");
	google.maps.event.addListenerOnce(map, 'idle', function () {
	    countFeatures();
	});
    }
}

function countFeatures() {
    var count = 0;
    map.data.forEach(function (feature) {
	count++;
    });
    if (count => 10000) {
	map.data.forEach(function (feature) {
	    map.data.remove(feature);
	});
	//alert("Too detailed area - we've limited the data - please zoom in");
    }
    console.log("features: " + count);
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'));

    navigator.geolocation.getCurrentPosition(function(position) {
	var initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	map.setCenter(initialLocation);
	map.setZoom(14);
    }, function(positionError) {
	map.setCenter(new google.maps.LatLng(57, 10)); // Aalborg (area) is default
	map.setZoom(5);
    });
    
    map.setMapTypeId('terrain');
    map.setMapTypeId('satellite');
    
    map.data.setStyle(function(feature) {
	var ejendomsnummer = feature.getProperty('esrejendomsnr');
	var udvidet_esrejendomsnr = feature.getProperty('udvidet_esrejendomsnr');
	if (udvidet_esrejendomsnr == null) {
        color = 'purple';
	} else if (stat.includes(parseInt(ejendomsnummer,10))) {
	    color = 'red';
	} else if (stat.includes(parseInt(udvidet_esrejendomsnr,10))) {
	    color = 'red';
	} else if (kommune.includes(parseInt(ejendomsnummer,10))) {
	    color = 'green';
	} else if (kommune.includes(parseInt(udvidet_esrejendomsnr,10))) {
	    color = 'green';
	} else {
	    color = 'grey';
	}
	    
	return {
	    fillColor: color,
	    strokeWeight: 1,
	}
    });

    google.maps.event.addListener(map, 'bounds_changed', (function () {
	var timer;
	return function() {
	    clearTimeout(timer);
	    timer = setTimeout(function() {
		updateMap();
	    }, 500);
	}
    }()));

    var infowindow = new google.maps.InfoWindow({
	content: "hello"
    });
    map.data.addListener('click', function(event) {

        if (!event.feature.hasOwnProperty('j')) {
            console.log(event.feature);
        }

        const url = "https://boligejer.dk/ejendomsdata?knr=" + event.feature.j.udvidet_esrejendomsnr.substring(0, 3).padStart(4, '0') + "&enr=" + event.feature.j.esrejendomsnr;

	infowindow.setContent("<a href='" + url + "' target='_blank'>link</a> - " + event.feature.j.udvidet_esrejendomsnr); // show the html variable in the infowindow
	infowindow.setPosition(event.latLng);
	infowindow.setOptions({
	    pixelOffset: new google.maps.Size(0, 0)
	}); // move the infowindow up slightly to the top of the marker icon
	infowindow.open(map);
    });
}			  
