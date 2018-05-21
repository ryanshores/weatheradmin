/* global google, json */

var map;
let parsedJSON = JSON.parse(json);
let parsedPoints = [
        		{
        			geometry: [-90, 25]
        		},
        		{
        			geometry: [-90.5, 25]
        		},
        		{
        			geometry: [-91, 25]
        		}
        	];

function initMap() {
map = new google.maps.Map(document.getElementById('map'), {
  center: {lat: 25, lng: -90},
  zoom: 4
});
addFeatures();
}

function addFeatures(){
	addJSON();
	// addPoints();
}

function addJSON() {
	if(parsedJSON.type == "FeatureCollection"){
		map.data.addGeoJson(parsedJSON);
		
		map.data.setStyle(function(feature) {
		    return {
		      fillColor: feature.getProperty('fill'),
		      fillOpacity: feature.getProperty('fill-opacity'),
		      strokeColor: feature.getProperty('stroke'),
		      //strokeOpacity: feature.getProperty('stroke-opacity'),
		      strokeWeight: 1
		    };
		});	
	}
}

function addPoints(){
	parsedPoints.forEach(function(pt){
		var contentWindow = pt.properties.color;
		var infoWindow = new google.maps.InfoWindow({
			content: contentWindow
		});
		var icon;
		circle(pt.properties.color, function(result){
			icon = result;
		});
		
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(pt.geometry[1], pt.geometry[0]),
			map: map,
			icon: icon
		});
		
		marker.addListener("click", function(){
			infoWindow.open(map, marker);
		});
		google.maps.event.addListener(map, "click", function(event) {
			infoWindow.close();
			
		});
	});
}

function circle(color, callback){
	var circle = {
	    path: google.maps.SymbolPath.CIRCLE,
	    fillColor: color,
	    fillOpacity: .4,
	    scale: 4.5,
	    strokeColor: color,
	    strokeOpacity: 0.8,
	    strokeWeight: 1	
	};
	callback(circle);
}

