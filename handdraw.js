/**
TOUCH CANVAS DRAWING DEMO BY JØRN KINDERÅS 19.03.2011

This demo shows how to use touch events to draw lines
in an HTML 5 canvas element.
**/

// When the DOM is ready
document.addEventListener("DOMContentLoaded", init, false);

var ctx; // Our canvas context
var total_stroke = 0;
var map;
var projection;
var overlay;

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

        //setup projection
        google.maps.event.addListener(map, 'projection_changed', function() {
            overlay = new google.maps.OverlayView();
            overlay.draw = function() {};
            overlay.setMap(map);
            projection = overlay.getProjection()


            //.fromDivPixelToLatLng(latLng); 


            alert(projection);
            point = new google.maps.Point(0,0)
            lat_lng = projection.fromPointToLatLng(point);
            alert(lat_lng)
        });
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

function touchstartHandler(event)
{
	// If the help text exists, remove it
	if(document.getElementsByTagName('section')[0]){
		document.body.removeChild(document.getElementsByTagName('section')[0]);
	}
	// Move the drawing pointer to where the finger is placed
    ctx.moveTo(event.touches[0].pageX, event.touches[0].pageY);
}

function touchmoveHandler(event)
{
	// Draw a line from the last position to where the finger is now
    ctx.lineTo(event.touches[0].pageX, event.touches[0].pageY);
    // Render the stroke
    ctx.stroke();
    total_stroke = total_stroke + 1
}

function touchendHandler(event)
{
   alert(total_stroke)
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


