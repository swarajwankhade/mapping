var ge;
var topdiff = null;
var leftdiff = null;
var blnFrame = false;
var blnPath = false;
var blnPolygon = false;
var dragInfo = null;
var arrPaths = new Array();

google.load("earth", "1.x", { "other_params": "sensor=false" });

function init() 
{
    google.earth.createInstance('map3d', initCB, failureCB);
}

function initCB(instance) 
{
    ge = instance;
    ge.getWindow().setVisibility(true);
    ge.getOptions().setAtmosphereVisibility(false);
	ge.getNavigationControl().setVisibility(ge.VISIBILITY_SHOW);
	ge.getOptions().setGridVisibility(true);
}

function failureCB(errorCode) 
{
}

function showPanel(option)
{
	document.getElementById('Panel1').style.display = "none";
	document.getElementById('Panel2').style.display = "none";
	document.getElementById('Panel3').style.display = "none";
	document.getElementById('Panel4').style.display = "none";
	document.getElementById('Panel5').style.display = "none";
	
	document.getElementById('Panel' + option).style.display = "block";
}

function changeOptions(e,input)
{
	var ctlcheckbox = document.getElementById(e.currentTarget.id);
	switch(input)
	{
		case 1:
			ge.getNavigationControl().setVisibility(ctlcheckbox.checked);
			break;
		case 2:
			ge.getLayerRoot().enableLayerById(ge.LAYER_BORDERS, ctlcheckbox.checked);
			break;
		case 3:
			ge.getLayerRoot().enableLayerById(ge.LAYER_ROADS, ctlcheckbox.checked);
			break;
		case 4:
			ge.getLayerRoot().enableLayerById(ge.LAYER_TERRAIN, ctlcheckbox.checked);
			break;
		case 5:
			ge.getLayerRoot().enableLayerById(ge.LAYER_BUILDINGS, ctlcheckbox.checked);
			break;
		case 6:
			ge.getOptions().setGridVisibility(ctlcheckbox.checked);
			break;
		case 7:
			ge.getOptions().setStatusBarVisibility(ctlcheckbox.checked);
			break;
		case 8:
			ge.getOptions().setScaleLegendVisibility(ctlcheckbox.checked);
			break;
		case 9:
			ge.getOptions().setAtmosphereVisibility(ctlcheckbox.checked);
			break;
		case 10:
			ge.getOptions().setOverviewMapVisibility(ctlcheckbox.checked);
			break;
	}
}

function validateInput()
{
	var valid = true;
	var north = document.getElementById("North").value;
	var south = document.getElementById("South").value;
	var east = document.getElementById("East").value;
	var west = document.getElementById("West").value;	
		
	if(!isNumber(north) || Number(north) > 90 || Number(north) < -90)
	{
		valid = false;
		alert('Enter a valid north latitude');
	}
	else if(!isNumber(south) || Number(south) > 90 || Number(south) < -90)
	{
		valid = false;	
		alert('Enter a valid south latitude');
	}
	else if(!isNumber(east) || Number(east) > 180 || Number(east) < -180)
	{
		valid = false;	
		alert('Enter a valid east latitude');
	}
	else if(!isNumber(west) || Number(west) > 180 || Number(west) < -180)
	{
		valid = false;	
		alert('Enter a valid west latitude');
	}
	else if(ge.getElementById('Border') != null)
	{
		valid = false;	
		alert('Frame has been already created.');
	}
	
	return valid;
}

function isNumber(n) 
{
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function createFrame()
{
	if(validateInput())
	{
		//Creating the bounding box
		var north = Number(document.getElementById("North").value);
		var south = Number(document.getElementById("South").value);
		var east = Number(document.getElementById("East").value);
		var west = Number(document.getElementById("West").value);	

		var groundOverlay = ge.createGroundOverlay('Border');
		groundOverlay.setIcon(ge.createIcon(''));
		groundOverlay.getIcon().setHref("http://webspace.cs.odu.edu/~schouti/structural%20mapping/border.png");
		groundOverlay.setLatLonBox(ge.createLatLonBox(''));
		
		var latLonBox = groundOverlay.getLatLonBox();
		latLonBox.setBox(north, south, east, west, 0); 
		ge.getFeatures().appendChild(groundOverlay);
		
		//Creating polygon for event handling
		var placemark = ge.createPlacemark('OverlayPolygon');
		polygon = ge.createPolygon('');
		outer = ge.createLinearRing('');
		coords = outer.getCoordinates();
		placemark.setGeometry(polygon);
		placemark.setOpacity(0.1); // 0 can cause issues
		polygon.setOuterBoundary(outer);
		coords.pushLatLngAlt(south, west, 0);
		coords.pushLatLngAlt(south, east, 0);
		coords.pushLatLngAlt(north, east, 0);
		coords.pushLatLngAlt(north, west, 0);
		ge.getFeatures().appendChild(placemark);
		
		// Set the position values.
		var lookAt = ge.createLookAt('');
		lookAt.setLatitude((north + south)/2);
		lookAt.setLongitude((east + west)/2);
		lookAt.setRange(100000);
		ge.getView().setAbstractView(lookAt);
		
		
		google.earth.addEventListener(placemark, 'click', function(event) {
			if(blnPath)
			{
				event.preventDefault();
				addPath(event.getLatitude(), event.getLongitude());
			}
			if(blnPolygon)
			{
				event.preventDefault();
				addPolygon(event.getLatitude(), event.getLongitude());
			}
		});
		
		createFrameIcons();
	}
}

function createFrameIcons()
{
	var north = Number(document.getElementById("North").value);
	var south = Number(document.getElementById("South").value);
	var east = Number(document.getElementById("East").value);
	var west = Number(document.getElementById("West").value);

	//Create the center icon for moving
	var clat = (north + south)/2;
	var clon = (east + west)/2;
	
	//Create the icon style
	var icon = ge.createIcon('');
	icon.setHref("http://maps.google.com/mapfiles/kml/shapes/cross-hairs_highlight.png");
	var style = ge.createStyle('');
	style.getIconStyle().setIcon(icon);
	var colorMode = style.getIconStyle().getColor();
	colorMode.set("ff0000ff");
	
	var center = ge.createPlacemark('FrameCenter');
	var top = ge.createPlacemark('FrameTop');
	var bottom = ge.createPlacemark('FrameBottom');
	var left = ge.createPlacemark('FrameLeft');
	var right = ge.createPlacemark('FrameRight');
	
	ge.getFeatures().appendChild(center);
	ge.getFeatures().appendChild(top);
	ge.getFeatures().appendChild(bottom);
	ge.getFeatures().appendChild(left);
	ge.getFeatures().appendChild(right);
	
	center.setStyleSelector(style);
	top.setStyleSelector(style);
	bottom.setStyleSelector(style);
	left.setStyleSelector(style);
	right.setStyleSelector(style);
	
	center.setVisibility(false);
	top.setVisibility(false);
	bottom.setVisibility(false);
	left.setVisibility(false);
	right.setVisibility(false);

	var cpoint = ge.createPoint('');
	cpoint.setLatitude(clat);
	cpoint.setLongitude(clon);
	center.setGeometry(cpoint);
	
	var tpoint = ge.createPoint('');
	tpoint.setLatitude(north);
	tpoint.setLongitude(clon);
	top.setGeometry(tpoint);
	
	var bpoint = ge.createPoint('');
	bpoint.setLatitude(south);
	bpoint.setLongitude(clon);
	bottom.setGeometry(bpoint);
	
	var lpoint = ge.createPoint('');
	lpoint.setLatitude(clat);
	lpoint.setLongitude(west);
	left.setGeometry(lpoint);
	
	var rpoint = ge.createPoint('');
	rpoint.setLatitude(clat);
	rpoint.setLongitude(east);
	right.setGeometry(rpoint);
	
	// listen for mousedown on center mark 
	google.earth.addEventListener(center, 'mousedown', function(event) {			
			dragInfo = {mark: event.getTarget(), dragged: false};
			
			var overlay = ge.getElementById('Border');
			var latLonBox = overlay.getLatLonBox();
			
			topdiff = latLonBox.getNorth() - event.getTarget().getGeometry().getLatitude();
			leftdiff = latLonBox.getWest() - event.getTarget().getGeometry().getLongitude();		
	});

	// listen for mousemove on center mark 
	google.earth.addEventListener(center, 'mousemove', function(event) {
		if (dragInfo) {
			event.preventDefault();
			reorderFrame(event.getLatitude() + topdiff, event.getLatitude() - topdiff, event.getLongitude() + leftdiff, event.getLongitude() - leftdiff);
		}
	});

	// listen for mouseup on center mark 
	google.earth.addEventListener(center, 'mouseup', function(event) {
		if (dragInfo) 
		{
			if (dragInfo.dragged) 
				event.preventDefault();	
			topdiff = null;
			leftdiff = null;
		}
		dragInfo = null;
	});

	
	// listen for mousedown on top mark 
	google.earth.addEventListener(top, 'mousedown', function(event) {			
			dragInfo = {mark: event.getTarget(), dragged: false};
	});

	// listen for mousemove on top mark 
	google.earth.addEventListener(top, 'mousemove', function(event) {
		if (dragInfo) {
			event.preventDefault();
			
			var latLonBox = ge.getElementById('Border').getLatLonBox();
			if(event.getLatitude() > latLonBox.getSouth())
				reorderFrame(event.getLatitude(), latLonBox.getSouth(), latLonBox.getEast(), latLonBox.getWest());
		}
	});

	// listen for mouseup on top mark 
	google.earth.addEventListener(top, 'mouseup', function(event) {
		if (dragInfo) 
		{
			if (dragInfo.dragged) 
				event.preventDefault();	
		}
		dragInfo = null;
	});
	
	
	// listen for mousedown on bottom mark 
	google.earth.addEventListener(bottom, 'mousedown', function(event) {			
			dragInfo = {mark: event.getTarget(), dragged: false};
	});

	// listen for mousemove on bottom mark 
	google.earth.addEventListener(bottom, 'mousemove', function(event) {
		if (dragInfo) {
			event.preventDefault();
			
			var latLonBox = ge.getElementById('Border').getLatLonBox();
			if(event.getLatitude() < latLonBox.getNorth())
				reorderFrame(latLonBox.getNorth(), event.getLatitude(), latLonBox.getEast(), latLonBox.getWest());
		}
	});

	// listen for mouseup on bottom mark 
	google.earth.addEventListener(bottom, 'mouseup', function(event) {
		if (dragInfo) 
		{
			if (dragInfo.dragged) 
				event.preventDefault();	
		}
		dragInfo = null;
	});

	
	// listen for mousedown on left mark 
	google.earth.addEventListener(left, 'mousedown', function(event) {			
			dragInfo = {mark: event.getTarget(), dragged: false};
	});

	// listen for mousemove on left mark 
	google.earth.addEventListener(left, 'mousemove', function(event) {
		if (dragInfo) {
			event.preventDefault();
			
			var latLonBox = ge.getElementById('Border').getLatLonBox();
			if(event.getLongitude() < latLonBox.getEast())
				reorderFrame(latLonBox.getNorth(), latLonBox.getSouth(), latLonBox.getEast(), event.getLongitude());
		}
	});

	// listen for mouseup on left mark 
	google.earth.addEventListener(left, 'mouseup', function(event) {
		if (dragInfo) 
		{
			if (dragInfo.dragged) 
				event.preventDefault();	
		}
		dragInfo = null;
	});

	
	// listen for mousedown on right mark 
	google.earth.addEventListener(right, 'mousedown', function(event) {			
			dragInfo = {mark: event.getTarget(), dragged: false};
	});

	// listen for mousemove on right mark 
	google.earth.addEventListener(right, 'mousemove', function(event) {
		if (dragInfo) {
			event.preventDefault();
			
			var latLonBox = ge.getElementById('Border').getLatLonBox();
			if(event.getLongitude() > latLonBox.getWest())
				reorderFrame(latLonBox.getNorth(), latLonBox.getSouth(), event.getLongitude(), latLonBox.getWest());
		}
	});

	// listen for mouseup on right mark 
	google.earth.addEventListener(right, 'mouseup', function(event) {
		if (dragInfo) 
		{
			if (dragInfo.dragged) 
				event.preventDefault();	
		}
		dragInfo = null;
	});
}

function reorderFrame(north, south, east, west)
{	
	document.getElementById("North").value = north;
	document.getElementById("South").value = south;
	document.getElementById("East").value = east;
	document.getElementById("West").value = west;
	
	cLat = (north + south)/2;
	cLon = (east + west)/2;
	
	//move center mark
	var center = ge.getElementById('FrameCenter');
	var cpoint = center.getGeometry();
	cpoint.setLatitude(cLat);
	cpoint.setLongitude(cLon);

	//move frame
	var latLonBox = ge.getElementById('Border').getLatLonBox();
	latLonBox.setBox(north, south, east, west, 0); 	
	
	//move polygon
	var polygonPlacemark = ge.getElementById('OverlayPolygon');
	var polygon = polygonPlacemark.getGeometry();
	var coords = polygon.getOuterBoundary().getCoordinates();
	var coord = null;
	
	coord = coords.get(0);
	coord.setLatitude(south);
	coord.setLongitude(west);
	coords.set(0, coord);
	
	coord = coords.get(1);
	coord.setLatitude(south);
	coord.setLongitude(east);
	coords.set(1, coord);
	
	coord = coords.get(2);
	coord.setLatitude(north);
	coord.setLongitude(east);
	coords.set(2, coord);
	
	coord = coords.get(3);
	coord.setLatitude(north);
	coord.setLongitude(west);
	coords.set(3, coord);
	
	//Frame markers
	var top = ge.getElementById('FrameTop');
	var bottom = ge.getElementById('FrameBottom');
	var left = ge.getElementById('FrameLeft');
	var right = ge.getElementById('FrameRight');
	
	var tpoint = top.getGeometry();;
	tpoint.setLatitude(north);
	tpoint.setLongitude(cLon);
	top.setGeometry(tpoint);
	
	var bpoint = bottom.getGeometry();
	bpoint.setLatitude(south);
	bpoint.setLongitude(cLon);
	bottom.setGeometry(bpoint);
	
	var lpoint = left.getGeometry();
	lpoint.setLatitude(cLat);
	lpoint.setLongitude(west);
	left.setGeometry(lpoint);
	
	var rpoint = right.getGeometry();
	rpoint.setLatitude(cLat);
	rpoint.setLongitude(east);
	right.setGeometry(rpoint);

	dragInfo.dragged = true;
}

function dragFrame()
{	
	if(ge.getElementById('Border') == null)
		alert('Need to create a frame first.');
	else
	{
		if(ge.getElementById('FrameCenter').getVisibility())
			ge.getElementById('FrameCenter').setVisibility(false);
		else
			ge.getElementById('FrameCenter').setVisibility(true);
		
		ge.getElementById('FrameTop').setVisibility(false);
		ge.getElementById('FrameBottom').setVisibility(false);
		ge.getElementById('FrameLeft').setVisibility(false);
		ge.getElementById('FrameRight').setVisibility(false);
	}
}

function resizeFrame()
{
	if(ge.getElementById('Border') == null)
		alert('Need to create a frame first.');
	else
	{
		var blnShow = ge.getElementById('FrameTop').getVisibility();
		
		ge.getElementById('FrameTop').setVisibility(!blnShow);
		ge.getElementById('FrameBottom').setVisibility(!blnShow);
		ge.getElementById('FrameLeft').setVisibility(!blnShow);
		ge.getElementById('FrameRight').setVisibility(!blnShow);
		
		ge.getElementById('FrameCenter').setVisibility(false);
	}
}

function submitFrame()
{
	if(ge.getElementById('Border') == null)
		alert('Need to create a frame first.');
	else
	{
		blnFrame = true;
		
		ge.getElementById('FrameCenter').setVisibility(false);
		ge.getElementById('FrameTop').setVisibility(false);
		ge.getElementById('FrameBottom').setVisibility(false);
		ge.getElementById('FrameLeft').setVisibility(false);
		ge.getElementById('FrameRight').setVisibility(false);
		
		document.getElementById("btnCreateFrame").disabled=true;
		document.getElementById("btnDragFrame").disabled=true;
		document.getElementById("btnResizeFrame").disabled=true;
		document.getElementById("btnSubmitFrame").disabled=true;
		
		document.getElementById("North").disabled=true;
		document.getElementById("South").disabled=true;
		document.getElementById("East").disabled=true;
		document.getElementById("West").disabled=true;
	}
}

function createPath()
{
	if(ValidatePathName())
	{
		var name = document.getElementById("txtPathName").value;
		var list = document.getElementById("lstPaths");
		var option = document.createElement("option");
		option.text = name;
		list.add(option);
		
		var lstWidth = document.getElementById("lstPathWidth");
		var txtWidth = lstWidth.options[lstWidth.selectedIndex].text;
		var lstColor = document.getElementById("lstPathColor");
		var txtColor = lstColor.options[lstColor.selectedIndex].text;
		
		//Creating line string placemark
		var lineStringPlacemark = ge.createPlacemark(name);
		var lineString = ge.createLineString('');
		lineStringPlacemark.setGeometry(lineString);
		lineString.setTessellate(true);
		
		lineStringPlacemark.setStyleSelector(ge.createStyle(''));
		var lineStyle = lineStringPlacemark.getStyleSelector().getLineStyle();
		lineStyle.setWidth(Number(txtWidth));
		lineStyle.getColor().set(txtColor);
		
		ge.getFeatures().appendChild(lineStringPlacemark);
		document.getElementById("txtPathName").value = "";
	}
}

function addPath(lat, lon) 
{
	var index = document.getElementById("lstPaths").selectedIndex;
	var options = document.getElementById("lstPaths").options;
	var name = options[index].text;	

	var lineStringPlacemark = ge.getElementById(name);
	var lineString = lineStringPlacemark.getGeometry();
	lineString.getCoordinates().pushLatLngAlt(lat, lon, 0);
	
	var coordindex = lineString.getCoordinates().getLength() - 1;
	var markName = 'PDM_' + name + '_' + coordindex;

	var placemark = ge.createPlacemark(markName);
	ge.getFeatures().appendChild(placemark);

	// Create style map for placemark
	var icon = ge.createIcon('');
	icon.setHref('http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png');
	var style = ge.createStyle('');
	style.getIconStyle().setIcon(icon);
	placemark.setStyleSelector(style);

	// Create point
	var point = ge.createPoint('');
	point.setLatitude(lat);
	point.setLongitude(lon);
	placemark.setGeometry(point);
	
	var dragMark = new Object();
	dragMark.pathName = name;
	dragMark.pathMarkName = markName;
	dragMark.pathMark = placemark;
	dragMark.index = coordindex; 
	arrPaths.push(dragMark);
	
	// listen for mousedown on the placemark
	google.earth.addEventListener(placemark, 'mousedown', function(event) {
		dragInfo = {mark: event.getTarget(),dragged: false, pathId: name, markId: markName};
	});

	// listen for mousemove on the placemark
	google.earth.addEventListener(placemark, 'mousemove', function(event) {
		if (dragInfo) 
		{			
			event.preventDefault();
			var point1 = dragInfo.mark.getGeometry();
			var dLat = event.getLatitude();
			var dLon = event.getLongitude();
			if(
				(dLat >= Number(document.getElementById("South").value)) &&
				(dLat <= Number(document.getElementById("North").value)) &&
				(dLon >= Number(document.getElementById("West").value)) &&
				(dLon <= Number(document.getElementById("East").value))
			  )
			 {
				point1.setLatitude(event.getLatitude());
				point1.setLongitude(event.getLongitude());				
				dragInfo.dragged = true;
			 }
		}
	});
	
	// listen for mouseup on the placemark
	google.earth.addEventListener(placemark, 'mouseup', function(event) {
		if (dragInfo) 
		{
			if (dragInfo.dragged) 
			{
				event.preventDefault();
				changePath(event.getLatitude(),event.getLongitude());
			}
			dragInfo = null;
		}
	});
  
}

function changePath(newLat, newLon)
{
	var lineStringPlacemark = ge.getElementById(dragInfo.pathId);
	var lineString = lineStringPlacemark.getGeometry();
	
	var coordIndex = -1;
	for (i=0;i<=arrPaths.length;i++)
		if(arrPaths[i].pathMarkName == dragInfo.markId)
		{
			coordIndex = i;
			break;
		}

	var coords = lineString.getCoordinates();
	if (coords.getLength() > 0) 
	{
		var coord = coords.get(coordIndex);
		coord.setLatitude(newLat);
		coord.setLongitude(newLon);
		coords.set(coordIndex, coord);
	}
}

function deletePath()
{
	var lst = document.getElementById("lstPaths");
	if(lst.selectedIndex >= 0)
	{	
		var arrTemp = new Array();
		var options = lst.options;
		var name = options[lst.selectedIndex].text;		
		lst.remove(lst.selectedIndex);

		ge.getFeatures().removeChild(ge.getElementById(name));
		for (i=0;i<=arrPaths.length;i++)
		{
			if(arrPaths[i].pathName == name)
				ge.getFeatures().removeChild(ge.getElementById(arrPaths[i].pathMarkName));
			else
				arrTemp.push(arrPaths[i]);
		}
		arrPaths = arrTemp;
		stopPath();
	}
	else
	{
		alert('Select a path name to delete.');
	}
}

function startPath()
{
	var index = document.getElementById("lstPaths").selectedIndex;
	if(index >= 0)
	{
		blnPath = true;
	}
	else
	{
		alert('Select a path name to start drawing.');
		blnPath = false;
	}
	
}

function stopPath()
{
	blnPath = false;
	document.getElementById("lstPaths").selectedIndex = -1;
}

function ValidatePathName()
{
	var valid = true;
	var txt =  document.getElementById("txtPathName").value;
	if (txt==null || txt=="")
	{
		valid = false;
		alert("Enter a valid path name.");
	}
	else if(ge.getElementById(txt) != null)
	{
		valid = false;
		alert("Name already exists.");
	}
	else if(ge.getElementById('Border') == null)
	{	
		valid = false;
		alert("Need to create frame first.");
	}
	else if(!blnFrame)
	{	
		valid = false;
		alert("Frame needs to be submitted.");
	}
	else if(blnPath)
	{	
		valid = false;
		alert("Stop the path creation of previous one.");
	}
	
	return valid;
}

function createPolygon()
{
	if(ValidatePolygonName())
	{
		var name = document.getElementById("txtPolygonName").value;
		var list = document.getElementById("lstPolygons");
		var option = document.createElement("option");
		option.text = name;
		list.add(option);
		
		var lstColor = document.getElementById("lstPolygonColor");
		var txtColor = lstColor.options[lstColor.selectedIndex].text;
		
		//Creating polygon placemark
		polygonPlacemark = ge.createPlacemark(name);
		var polygon = ge.createPolygon('');
		polygonPlacemark.setGeometry(polygon);		
		var outer = ge.createLinearRing('');
		polygon.setOuterBoundary(outer);
  
		polygonPlacemark.setStyleSelector(ge.createStyle(''));
		var polyStyle = polygonPlacemark.getStyleSelector().getPolyStyle();
		polyStyle.getColor().set(txtColor);
		
		ge.getFeatures().appendChild(polygonPlacemark);
		document.getElementById("txtPolygonName").value = "";
	}
}

function addPolygon(lat, lon) 
{
	var index = document.getElementById("lstPolygons").selectedIndex;
	var options = document.getElementById("lstPolygons").options;
	var name = options[index].text;	

	var polygonPlacemark = ge.getElementById(name);
	var polygon = polygonPlacemark.getGeometry();
	polygon.getOuterBoundary().getCoordinates().pushLatLngAlt(lat, lon, 0);
}

function ValidatePolygonName()
{
	var valid = true;
	var txt =  document.getElementById("txtPolygonName").value;
	if (txt==null || txt=="")
	{
		valid = false;
		alert("Enter a valid polygon name.");
	}
	else if(ge.getElementById(txt) != null)
	{
		valid = false;
		alert("Name already exists.");
	}
	else if(ge.getElementById('Border') == null)
	{	
		valid = false;
		alert("Need to create frame first.");
	}
	else if(!blnFrame)
	{	
		valid = false;
		alert("Frame needs to be submitted.");
	}
	else if(blnPolygon)
	{	
		valid = false;
		alert("Stop the polygon creation of previous one.");
	}
	
	return valid;
}

function startPolygon()
{
	var index = document.getElementById("lstPolygons").selectedIndex;
	if(index >= 0)
	{
		blnPolygon = true;
	}
	else
	{
		alert('Select a polygon name to start drawing.');
		blnPolygon = false;
	}
	
}

function stopPolygon()
{
	blnPolygon = false;
	document.getElementById("lstPolygons").selectedIndex = -1;
}

function deletePolygon()
{
	var lst = document.getElementById("lstPolygons");
	if(lst.selectedIndex >= 0)
	{	
		var options = lst.options;
		var name = options[lst.selectedIndex].text;		
		lst.remove(lst.selectedIndex);

		ge.getFeatures().removeChild(ge.getElementById(name));
		stopPolygon();
	}
	else
	{
		alert('Select a path name to delete.');
	}
}


google.setOnLoadCallback(init);