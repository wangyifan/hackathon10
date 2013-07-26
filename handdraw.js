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
var geocoder;
var all_markers = new Array();
var polylines_drawn_by_map;

/*
var auth = { 
  //
  // Update with your auth tokens.
  //
  consumerKey: "1SO7ZFtiYTrBokcBStrFcA", 
  consumerSecret: "DyMvVB3U0mSBY3sPmStpa-kg4_Y",
  accessToken: "TU6dLFH_tjp8jRaG2cG9q7ydS2v1yHzQ",
  // This example is a proof of concept, for how to use the Yelp v2 API with javascript.
  // You wouldn't actually want to expose your access token secret like this in a real application.
  accessTokenSecret: "gb9g6oOyEUkSkahi8DjVFUDOsPE",
  serviceProvider: { 
    signatureMethod: "HMAC-SHA1"
  }
};
*/

function supports_html5_storage() {
    try {
	return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
	return false;
    }
}

function is_segment_crossing(segment1, segment2){
    s1 = [segment2[0].lat() - segment1[0][0], segment2[0].lng() - segment1[0][1]];
    s2 = [segment2[1].lat() - segment1[0][0], segment2[1].lng() - segment1[0][1]];
    s3 = [segment2[0].lat() - segment1[1][0], segment2[0].lng() - segment1[1][1]];
    s4 = [segment2[1].lat() - segment1[1][0], segment2[1].lng() - segment1[1][1]];

    area_s1_s2 = s1[0] * s2[1] - s1[1] * s2[0];
    area_s3_s4 = s3[0] * s4[1] - s3[1] * s4[0];

    alert([area_s1_s2, area_s3_s4]);
    return area_s1_s2 * area_s3_s4 < 0.0
}

function is_location_in_polygon(location, list_of_points_of_polygon){
    var point_infinate = [1000000, location[1]];
    var count = 0;
    for(var i=0;i<list_of_points_of_polygon.length;i++)
    {
	if(is_segment_crossing([location, point_infinate], [list_of_points_of_polygon[i], list_of_points_of_polygon[(i+1)%list_of_points_of_polygon.length]]))
	{
	    count = count + 1;
	    alert([location, point_infinate]);
	    alert([list_of_points_of_polygon[i], list_of_points_of_polygon[(i+1)%list_of_points_of_polygon.length]]);
	}
    }
    return count%2==1
}

var auth = { 
  //
  // Update with your auth tokens.
  //
  consumerKey: "HVi5KiA6t048A827yy9d6g", 
  consumerSecret: "yiAfOUyy5o_vwjMhjM3funghSaE",
  accessToken: "rprHX0Tob6pXBQXhu8JBXWxgy5hj2NlR",
  // This example is a proof of concept, for how to use the Yelp v2 API with javascript.
  // You wouldn't actually want to expose your access token secret like this in a real application.
  accessTokenSecret: "6M4h-5xOPsS1AR_h7c3HHWbbxRw",
  serviceProvider: { 
    signatureMethod: "HMAC-SHA1"
  }
};

function init()
{

    function initialize() {
	if (!supports_html5_storage())
	{
	    alert("not support html5 storage");
	}

        var mapOptions = {
            zoom: 15,
            center: new google.maps.LatLng(37.775, -122.4183),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById('map_canvas'),
            mapOptions);
	geocoder = new google.maps.Geocoder();

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

function on_search(lat_lng_list)
{
    var search_query = $("#search_box").val();
    if (!(search_query && search_query.length>0))
    {
        alert("No search query found.")
        clearTheMap();
        return;
    }

    var sw;
    var ne;
    var str_lat_lng_list;
    if(lat_lng_list && lat_lng_list.length>0)
    {
        var n=-1000;
        var s=1000;
        var e=-1000;
        var w=1000;
        for(var i=0;i<lat_lng_list.length;i++)
        {
            if(lat_lng_list[i].lat() > n)
            {
                n=lat_lng_list[i].lat();
            }

            if(lat_lng_list[i].lat() < s)
            {
                s=lat_lng_list[i].lat();
            }

            if(lat_lng_list[i].lng() > e)
            {
                e=lat_lng_list[i].lng();
            }

            if(lat_lng_list[i].lng() < w)
            {
                w=lat_lng_list[i].lng();
            }
        }

        sw = new google.maps.LatLng(s, w);
        ne = new google.maps.LatLng(n, e);
        str_lat_lng_list = "["+String(lat_lng_list)+"]";
    }
    else
    {
        map_bounds = map.getBounds();
        sw = map_bounds.getSouthWest(); 
        ne = map_bounds.getNorthEast();
        str_lat_lng_list = "[]";
    }
    //alert(lat_lng_list.length)
    clearTheMap();

    //str_bounds = String(sw.lat())+','+String(sw.lng())+'|'+String(ne.lat())+','+String(ne.lng());
    //str_bounds ="&tl_long="+String(sw.lng())+"&tl_lat="+String(ne.lat());
    //str_bounds+="&br_long="+String(ne.lng())+"&br_lat="+String(sw.lat());

    //sw_latitude,sw_longitude|ne_latitude,ne_longitude, v2 search
    str_bounds = String(sw.lat()) + ',' + String(sw.lng()) + '|' + String(ne.lat()) + ',' + String(ne.lng());

    //alert(lat_lng_list);
    if(lat_lng_list)
    {
	drawMapPolyline(lat_lng_list);
    }
    search_polygon(search_query, str_bounds, lat_lng_list);
}

function search_polygon(terms, bounds, polygon)
{
    var accessor = {
        consumerSecret: auth.consumerSecret,
        tokenSecret: auth.accessTokenSecret
        };

    parameters = [];
    parameters.push(['term', terms]);
    parameters.push(['bounds', bounds]);
    parameters.push(['callback', 'cb']);
    parameters.push(['oauth_consumer_key', auth.consumerKey]);
    parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
    parameters.push(['oauth_token', auth.accessToken]);
    parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

    var message = { 
	'action': 'http://api.yelp.com/v2/search',
	'method': 'GET',
	'parameters': parameters 
    };

    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);

    var parameterMap = OAuth.getParameterMap(message.parameters);
    parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature);

    //url = 'http://api.yelp.com/v2/search?terms='+terms;
    //url+=bounds;
    //url = encodeURI(url)

    $('#loadingDiv').show();
    $.ajax({
        'url':message.action,
	'data': parameterMap,
	'cache': true,
        'dataType': 'jsonp',
	'jsonpCallback': 'cb',
        success: function(data, status, request) {
            $('#loadingDiv').hide();
            biz_lat_lng_list = new Array();
	    alert(data.businesses.length);
	    var location_available = 0
            for(var i=0;i<data.businesses.length;i++)
            {
                biz = data.businesses[i];
		var address_key = biz.location.display_address.join() + ' location';
		if(localStorage[address_key])
		{
		    var location = localStorage[address_key].replace('(', '[').replace(')', ']');
		    location = eval(location);
		    var glocation = new google.maps.LatLng(location[0], location[1]);
		    var location_point = [glocation.lat(), glocation.lng()];
		    if(is_location_in_polygon(location_point, polygon) && true)
		    {
			drawMarker(glocation);
			biz_lat_lng_list.push(glocation);
		    }
		}
		else
		{
		    var get_geocode_func = function(address_key){
			geocoder.geocode( { 'address': biz.location.display_address.join()}, function(results, status){
				if (status == google.maps.GeocoderStatus.OK) {
				    localStorage[address_key] = results[0].geometry.location;
				    var location_point = [results[0].geometry.location.lat(), results[0].geometry.location.lng()];
				    if(is_location_in_polygon(location_point, polygon) && true)
				    {
					drawMarker(results[0].geometry.location);
					biz_lat_lng_list.push(results[0].geometry.location);
				    }
				    
				} else {
				    alert("Geocode was not successful for the following reason: " + status);
				}
			    });
		    }
		    get_geocode_func(address_key);
		}
	    }
	},
        error: function (xhr, ajaxOptions, thrownError) {
            $('#loadingDiv').hide();
            alert("Oops...can't get any result:"+ String(xhr.status));
      }
    }
    );
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
    total_stroke_list = new Array();
    ctx.beginPath();
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

    on_search(lat_lng_list);
}

function clearTheMap()
{
    var touch_canvas = document.getElementById("touch_canvas");
    ctx.clearRect(0, 0, touch_canvas.width, touch_canvas.height);
    ctx.restore();

    for(var i=0;i<all_markers.length;i++)
    {
        all_markers[i].setMap(null);
    }

    all_markers = new Array();

    if(polylines_drawn_by_map)
    {
        polylines_drawn_by_map.setPath(new Array());
    }
}

function drawMarker(marker_lat_lng)
{
    //alert(marker_lat_lng);
    marker = new google.maps.Marker({
        map:map,
        draggable:false,
        animation: google.maps.Animation.DROP,
        position: marker_lat_lng,
    });

    all_markers.push(marker);
}

function drawMapPolyline(lat_lng_list)
{
    var lineSymbol = {
    path: 'M 0,-1 0,1',
    strokeOpacity: 1,
    scale: 4
    };
    //alert(lat_lng_list);
    polylines_drawn_by_map = new google.maps.Polyline({
            path: lat_lng_list,
            strokeOpacity: 0,
            icons: [{
                icon: lineSymbol,
                offset: '0',
                repeat: '20px'
            }],
            map: map
        });

    polylines_drawn_by_map.setMap(map);
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
    var touch_canvas = document.getElementById("touch_canvas");
    touch_canvas.style.zIndex = 0;
    var map_canvas = document.getElementById("map_canvas")
    map_canvas.style.zIndex = 10;
    
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


