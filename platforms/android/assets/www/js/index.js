/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
*/

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
       var pushNotification = window.plugins.pushNotification;
pushNotification.register(app.successHandler, app.errorHandler,{"senderID":"391779146922","ecb":"app.onNotificationGCM"});
//id puede ser 391779146922 AIzaSyA5npvw51quTUQduYE44hAyaWG0Lz0ZbXA
    },
    // result contains any message sent from the plugin call
successHandler: function(result) {
    console.log('Callback Success! Result = '+result);
},
errorHandler:function(error) {
    console.log(error);
},
onNotificationGCM: function(e) {
        switch( e.event )
        {
            case 'registered':
                if ( e.regid.length > 0 )
                {
                    var url = 'http://autowikipedia.es/phonegap/racing_calendar_insert_registerid.php?register_id=' + e.regid;
                    insertar_id(url);
                    $("#eventos").append(url);
                    //hago un post, mando el token, recibo el id de mi base y lo guardo con localstorage. Pongo una variable registrado 1 para no volver a hacer el proceso.
                    console.log("Regid " + e.regid);
                    $("#eventos").text("el e.regid es " + e.regid);
                    //alert('registration id = '+e.regid);
                }
            break;
 
            case 'message':
              // this is the actual push notification. its format depends on the data model from the push server
              alert('message = '+e.message+' msgcnt = '+e.msgcnt);
            break;
 
            case 'error':
              alert('GCM error = '+e.msg);
            break;
 
            default:
              alert('An unknown GCM event has occurred');
              break;
        }
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    }
};

function insertar_id(url){
    console.log("estoy adentro de insertar_id");
    $.post(url, function(data) {
        $("#eventos").append("<br>el id insertado es " + data);
    });

}