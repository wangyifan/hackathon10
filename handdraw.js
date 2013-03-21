/**
TOUCH CANVAS DRAWING DEMO BY JØRN KINDERÅS 19.03.2011

This demo shows how to use touch events to draw lines
in an HTML 5 canvas element.
**/

// When the DOM is ready
document.addEventListener("DOMContentLoaded", init, false);

var ctx; // Our canvas context
var total_stroke_count = 0;
var total_stroke_list = new Array();
var map;
var all_markers = new Array();

function init()
{

    function initialize() {
        var mapOptions = {
            zoom: 15,
            center: new google.maps.LatLng(37.775, -122.4183),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById('map_canvas'),
            mapOptions);

    }

    google.maps.event.addDomListener(window, 'load', initialize);
    
    /*
	// Check if we're on a touch device
    if('ontouchstart' in window == false){
        alert('Sorry, you need a touch enabled device to use this demo');
        return;
    }*/
    
    //Prevent the page itself from scrolling
    document.addEventListener('touchmove', preventScrollingHandler, false);
    
    //Create a canvas element to draw into
    //var canvas = document.getElementById('touch_canvas');
    var canvas = document.getElementById('touch_canvas');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    
    // Set the canvas context
    ctx             = canvas.getContext('2d');
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = "rgba(255,0,0,1)"; //The stroke color
    ctx.fillStyle   = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth   = 15; //The thickens of the line
    ctx.lineCap     = 'round'; //How the "edge" of the line is finished
    
    // A finger is down on the canvas
    canvas.addEventListener("touchstart",touchstartHandler,false);
    // The finger is moving on the canvas
    canvas.addEventListener("touchmove", touchmoveHandler,false);
    // Something unexpected happened, maybe you got a call?
    canvas.addEventListener("touchcancel", touchcancelHandler,false);

    // when finger release
    canvas.addEventListener("touchend", touchendHandler,false);

}

function getDivPixelFromLatLng(latLng_position)
{
    var scale = Math.pow(2, map.getZoom());
    var nw = new google.maps.LatLng(map.getBounds().getNorthEast().lat(),map.getBounds().getSouthWest().lng());
    var worldCoordinateNW = map.getProjection().fromLatLngToPoint(nw);

    var worldCoordinate = map.getProjection().fromLatLngToPoint(latLng_position);
    var pixelOffset = new google.maps.Point(
        Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale),
        Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale)
        );
    return pixelOffset;
}

// a div_pixel is like [222,333]
function getLatLngFromDivPixel(div_pixel)
{
    var scale = Math.pow(2, map.getZoom());
    var nw = new google.maps.LatLng(map.getBounds().getNorthEast().lat(),map.getBounds().getSouthWest().lng());
    var worldCoordinateNW = map.getProjection().fromLatLngToPoint(nw);

    var worldCoordinate = new google.maps.Point(
            div_pixel[0]/scale + worldCoordinateNW.x,
            div_pixel[1]/scale + worldCoordinateNW.y
        )

    var lat_lng = map.getProjection().fromPointToLatLng(worldCoordinate);
    return lat_lng;
}

function touchstartHandler(event)
{
	// If the help text exists, remove it
	if(document.getElementsByTagName('section')[0]){
		document.body.removeChild(document.getElementsByTagName('section')[0]);
	}
	// Move the drawing pointer to where the finger is placed
    ctx.moveTo(event.changedTouches[0].pageX, event.changedTouches[0].pageY);
    var div_pixel_point = [event.touches[0].pageX, event.changedTouches[0].pageY];
    total_stroke_list.push(div_pixel_point);
}

function touchmoveHandler(event)
{
	// Draw a line from the last position to where the finger is now
    ctx.lineTo(event.changedTouches[0].pageX, event.changedTouches[0].pageY);
    var div_pixel_point = [event.changedTouches[0].pageX, event.changedTouches[0].pageY];
    total_stroke_list.push(div_pixel_point);
    // Render the stroke
    ctx.stroke();
    total_stroke_count = total_stroke_count + 1
}

function touchendHandler(event)
{
    lat_lng_list = new Array()
    for(var i=0;i<total_stroke_list.length;i++)
    {
        point = total_stroke_list[i];
        lat_lng = getLatLngFromDivPixel(point);
        lat_lng_list.push(lat_lng)
    }

    for(var i=0;i<lat_lng_list.length;i++)
    {
        lat_lng_point = lat_lng_list[i]
        drawMarker(lat_lng_point);
    }
    
}

function drawMarker(marker_lat_lng)
{
    marker = new google.maps.Marker({
        map:map,
        draggable:false,
        animation: google.maps.Animation.DROP,
        position: marker_lat_lng
    });

    all_markers.push(marker);
}

function touchcancelHandler(event)
{
	alert('The application has paused, click to continue');
	//Smart place to save any work
}

function preventScrollingHandler(event)
{
	/* Flags this event as handled. Prevents the UA from handling it at window level */
    event.preventDefault();
}

function switchToMoveMode()
{
    //show map, hide touch canvas
    /*var touch_canvas = document.getElementById("touch_canvas");
    touch_canvas.style.zIndex = 0;
    var map_canvas = document.getElementById("map_canvas")
    map_canvas.style.zIndex = 10;
*/
    clearTheMap();
}

function switchToDrawMode()
{
    var touch_canvas = document.getElementById("touch_canvas");
    var map_canvas = document.getElementById("map_canvas")

    //clear canvas and stroke
    ctx.clearRect(0, 0, touch_canvas.width, touch_canvas.height);
    total_stroke_list = new Array();

    //show touch, hide map canvas
    touch_canvas.style.zIndex = 10;
    map_canvas.style.zIndex = 0;
}

function clearTheMap()
{
    var touch_canvas = document.getElementById("touch_canvas");
    ctx.clearRect(0, 0, touch_canvas.width, touch_canvas.height);

    for(var i=0;i<all_markers.length;i++)
    {
        all_markers[i].setMap(null);
    }

    all_markers = new Array();
}

function draw_or_move()
{
    button = document.getElementById("draw_or_move");
    current_status = button.textContent;
    if(current_status == "Move")
    {
        switchToMoveMode();
        button.textContent = "Draw";
    }
    else
    {
        switchToDrawMode();
        button.textContent = "Move";
    }
}


