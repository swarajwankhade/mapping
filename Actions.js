var ge;
var dragInfo = null;

google.load("earth", "1.x", { "other_params": "sensor=false" });

function init() {
    google.earth.createInstance('map3d', initCB, failureCB);
}

function initCB(instance) {
    ge = instance;
    ge.getWindow().setVisibility(true);
    ge.getOptions().setAtmosphereVisibility(false);
	// add a navigation control
      ge.getNavigationControl().setVisibility(ge.VISIBILITY_AUTO);
    
      // add some layers
      //ge.getLayerRoot().enableLayerById(ge.LAYER_BORDERS, true);
      ge.getLayerRoot().enableLayerById(ge.LAYER_ROADS, true);
	  ge.getLayerRoot().enableLayerById(ge.LAYER_BUILDINGS, true);
	  ge.getLayerRoot().enableLayerById(ge.LAYER_TERRAIN, true);
	  ge.getOptions().setScaleLegendVisibility(true);
	  ge.getOptions().setOverviewMapVisibility(true);
	  ge.getOptions().setStatusBarVisibility(true);
	  
	  
	  
	// listen for mousedown on the window (look specifically for point placemarks)
	google.earth.addEventListener(ge.getWindow(), 'mousedown', function(event) {
		if (event.getTarget().getType() == 'KmlPlacemark' &&event.getTarget().getGeometry().getType() == 'KmlPoint') {
			var placemark = event.getTarget();

			dragInfo = {
			placemark: event.getTarget(),
			dragged: false
			};
		}
	});

	// listen for mousemove on the globe
	google.earth.addEventListener(ge.getGlobe(), 'mousemove', function(event) {
		if (dragInfo) {
			event.preventDefault();
			var point = dragInfo.placemark.getGeometry();
			point.setLatitude(event.getLatitude());
			point.setLongitude(event.getLongitude());
			
			var planemark = ge.getElementById('Plane');
			var model = planemark.getGeometry();
			var loc = model.getLocation();
			loc.setLatitude(event.getLatitude());
			loc.setLongitude(event.getLongitude());
			model.setLocation(loc);
			planemark.setGeometry(model);
			
			dragInfo.dragged = true;
		}
	});

	// listen for mouseup on the window
	google.earth.addEventListener(ge.getWindow(), 'mouseup', function(event) {
		if (dragInfo) {
			if (dragInfo.dragged) {
			// if the placemark was dragged, prevent balloons from popping up
			event.preventDefault();
			}

		dragInfo = null;
		}
	});

}

function failureCB(errorCode) {
}

function createModel() {

	var planemark = ge.createPlacemark('Plane');
	
	var model = ge.createModel('');
	ge.getFeatures().appendChild(planemark);
	
	var link = ge.createLink('');
	link.setHref('http://webspace.cs.odu.edu/~schouti/structural%20mapping/1km%20plane.dae');
	model.setLink(link);
	model.setAltitudeMode(ge.ALTITUDE_RELATIVE_TO_GROUND)

	var loc = ge.createLocation('');
	var la = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);
	loc.setLatitude(la.getLatitude());
	loc.setLongitude(la.getLongitude());
	loc.setAltitude(0);
	model.setLocation(loc);

	planemark.setGeometry(model);
	la.setRange(5000);
	la.setTilt(45);
	ge.getView().setAbstractView(la);
	
	var anchormark = ge.createPlacemark('Anchor');
	ge.getFeatures().appendChild(anchormark);

	// Create point
	var point = ge.createPoint('');
	point.setLatLngAlt(la.getLatitude(),la.getLongitude(),0);
	anchormark.setGeometry(point);
	
}



function changeHeading(slideAmount) 
{
	var sliderDiv = document.getElementById("lblHeading");
    sliderDiv.innerHTML = slideAmount;

	var planemark = ge.getElementById('Plane');
	var model = planemark.getGeometry();
	var orient = ge.createOrientation('');
    orient.setHeading(parseInt(slideAmount));
	model.setOrientation(orient);
	planemark.setGeometry(model);
}

function changeTilt(slideAmount) 
{
	var sliderDiv = document.getElementById("lblTilt");
    sliderDiv.innerHTML = slideAmount;

	var planemark = ge.getElementById('Plane');
	var model = planemark.getGeometry();
	var orient = ge.createOrientation('');
    orient.setTilt(parseInt(slideAmount));
	model.setOrientation(orient);
	planemark.setGeometry(model);
}

function changeRoll(slideAmount) 
{
	var sliderDiv = document.getElementById("lblRoll");
    sliderDiv.innerHTML = slideAmount;

	var planemark = ge.getElementById('Plane');
	var model = planemark.getGeometry();
	var orient = ge.createOrientation('');
    orient.setRoll(parseInt(slideAmount));
	model.setOrientation(orient);
	planemark.setGeometry(model);
}

function changeScale(slideAmount) 
{
	var sliderDiv = document.getElementById("lblScale");
    sliderDiv.innerHTML = slideAmount;

	var planemark = ge.getElementById('Plane');
	var model = planemark.getGeometry();
	model.getScale().setX(parseInt(slideAmount));
	model.getScale().setY(parseInt(slideAmount));
	model.getScale().setZ(parseInt(slideAmount));
	planemark.setGeometry(model);
}

function changeAltitude(slideAmount) 
{
	var sliderDiv = document.getElementById("lblAltitude");
    sliderDiv.innerHTML = slideAmount;

	var planemark = ge.getElementById('Plane');
	var model = planemark.getGeometry();
	var loc = model.getLocation();
	loc.setAltitude(parseInt(slideAmount));
	model.setLocation(loc);
	planemark.setGeometry(model);
}

function navigate() {
			var lng = document.getElementById("lng").value;
			var lat = document.getElementById("lat").value;
			var kmlString = ''
			              + '<?xml version="1.0" encoding="UTF-8"?>'
			              + '<kml xmlns="http://www.opengis.net/kml/2.2">'
			
			              + '<Document>'
			              + '  <Camera>'
			              + '    <longitude>'
			              + lng
			              + '    </longitude>'
			              + '    <latitude>'
			              + lat
			              + '    </latitude>'
			              + '    <altitude>7000</altitude>'
			              + '  </Camera>'			
			              + '</Document>'
			              + '</kml>';
			
			var kmlObject = ge.parseKml(kmlString);
			ge.getFeatures().appendChild(kmlObject);
			ge.getView().setAbstractView(kmlObject.getAbstractView());
		}


google.setOnLoadCallback(init);