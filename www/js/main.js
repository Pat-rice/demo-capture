/* Web socket */
var stompClient;
var virtualObject = {};
var headers = {
    'content-type' : 'text/plain'
}

/* Simple logging */
var LOG = function(msg) {
    document.getElementById('log').innerHTML = msg;
}

/* Initialize web socket connection */
var initWS = function() {

    var host = document.getElementById('endpoint').value;
    var socket = new SockJS(host);
    stompClient = Stomp.over(socket);
    stompClient.debug = function(str) {
//        console.debug(str);
    };

    stompClient.connect({}, function(frame) {

        stompClient.subscribe('/topic/confirm', function(msg) {
            if(msg.body == 'true') {
                LOG('The virtual object has been successfully added');
            } else {
                LOG('A problem has occurred');
            }

        });

        LOG('connected to server');

    }, function(err) {
        //connection error
        LOG(err);
        setTimeout(initWS, 4000);
    });
}

var captureError = function(e) {
    LOG(e.message);
}

/* Send the data to server with web socket */
var sendVirtualObject = function() {
//    console.log(JSON.stringify(virtualObject));
    stompClient.send('/app/image', headers, JSON.stringify(virtualObject) );
    LOG('data sent');
}

/* Get location callback */
var geolocationSuccess = function(position) {
//    console.log(JSON.stringify(position));
    virtualObject.longitude = position.coords.longitude;
    virtualObject.latitude = position.coords.latitude;
    LOG('Successfully located device');
}

/* Callback capture image */
var captureSuccess = function(img) {
    virtualObject.imgBase64 = img;
    sendVirtualObject();
}

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        navigator.geolocation.getCurrentPosition(geolocationSuccess, captureError, {timeout: 30000, enableHighAccuracy: true});
    },
    // Bind Event Listeners
    bindEvents: function() {
        document.getElementById('captureImage').addEventListener('click', function() {
            var optionsCapture = {  quality : 70,
                destinationType: navigator.camera.DestinationType.DATA_URL
            };
            navigator.camera.getPicture( captureSuccess, captureError, optionsCapture );
        });
        document.getElementById('connect').addEventListener('click', function() {
            initWS();
        });
    }
};




