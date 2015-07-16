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

rc2016_conexion es la variable localstorage para ver si hay conexion
rc2016_notfirstime es la variable localstorage para ver si es el primer ingreso
 */
 //variables globales de DDBB
 var db;
var shortName = 'rc2016';
var version = '1.0';
var displayName = 'rc2016';
var maxSize = 65535;
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
        app.receivedEvent('deviceready');
        chequearconexion();
        
        
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    }
};

function chequearconexion(){
    var networkState = navigator.connection.type;
    var conexion;
    var states = {};
    states[Connection.UNKNOWN]  = '1';
    states[Connection.ETHERNET] = '2';
    states[Connection.WIFI]     = '3';
    states[Connection.CELL_2G]  = '4';
    states[Connection.CELL_3G]  = '5';
    states[Connection.CELL_4G]  = '6';
    states[Connection.CELL]     = '7';
    states[Connection.NONE]     = '8';
    console.log('Connection type: ' + states[networkState]);
    if (states[networkState] == 8) { 
        conexion = window.localStorage.setItem("rc2016_conexion", "0");
        console.log("no hay conexion");
    } else {
        conexion = window.localStorage.setItem("rc2016_conexion", "1");
        console.log("hay conexion de algun tipo");
    }
    geolocalizar();
}

function geolocalizar(){
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
}
    // onSuccess Geolocation
    function onSuccess(position,generar_contenido) {
        localStorage.setItem("rc2016_lat", position.coords.latitude);
        localStorage.setItem("rc2016_lon", position.coords.longitude);
        console.log("latitude: " + position.coords.latitude);
        console.log("longitude: " + position.coords.longitude);
        generar_contenido();        
    }

    function onError(error,generar_contenido) {
        //por default location at congreso, kilómetros cero
        localStorage.setItem("rc2016_lat", "-34.609772");
        localStorage.setItem("rc2016_lon", "-58.392363");
        console.log("latitude def: -34.609772");
        console.log("longitude def: -58.392363");
        generar_contenido();
    }

function generar_contenido() {
    console.log("open database: " + shortName + " version: " + version + "dis name: " + displayName + "size: " + maxSize);
    db = openDatabase(shortName, version, displayName, maxSize);    
    if (localStorage.getItem("rc2016_firstime") === null || localStorage.getItem("rc2016_firstime") == 0) {
        console.log("creando tablasparapato");
        crear_tablas();
    } else {
        console.log("obtener_contenido from db");
        mostrar_contenido();
    }
}

function crear_tablas(){
    db.transaction(function(tx){
        console.log("creacionDB");
        var sql3 = "CREATE TABLE IF NOT EXISTS carreras (id_carrera INTEGER PRIMARY KEY,carrera TEXT,nro_carrera INTEGER,carreras_totales INTEGER,fecha TEXT,categoria TEXT,id_categoria INTEGER,categoria_short TEXT,destacado INTEGER,latitud TEXT,longitud TEXT,id_circuito INTEGER,circuito TEXT,extension DECIMAL,imagen TEXT)";
        tx.executeSql(sql3);
    },funcionvacia,traer_contenido,transaction_error);

}

function funcionvacia(){
    console.log("nada");
}

function transaction_error(tx, error) {
    console.log('OKA: ' + error.message + ' code: ' + error.code);
}

function traer_contenido(){
    console.log("traemos el json");
    $.post("http://autowikipedia.es/phonegap/racing_calendar_eventos_anual.php", function(data) {
        console.log("cantidad resultados a insertar: " + data.length);
        $.each(data, function(i, item) {
            insertar_contenido(item, data.length);
        });
    },"json");
}
numero_insert = 1;
function insertar_contenido(item,total) {
    db.transaction(function(tx) {
    tx.executeSql('INSERT INTO carreras (id_carrera,carrera,nro_carrera,carreras_totales,fecha,categoria,id_categoria,categoria_short,destacado,latitud,longitud,id_circuito,circuito,extension,imagen) Values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [item.id_carrera,item.carrera,item.nro_fecha,item.nro_fecha,item.fecha,item.categoria,item.categoria_id,item.categoria_short,item.destacado,item.latitud,item.longitud,item.circuito_id,item.circuito,item.extension,item.imagen], function(tx, results){ //funcion para mensaje
            console.log("insert nro: " + numero_insert);
            console.log("insert data: " + item.id_carrera+ " " +item.carrera+ " " +item.nro_fecha+ " " +item.nro_fecha+ " " +item.fecha+ " " +item.categoria+ " " +item.categoria_id+ " " +item.categoria_short+ " " +item.destacado+ " " +item.latitud+ " " +item.longitud+ " " +item.circuito_id+ " " +item.circuito+ " " +item.extension+ " " +item.imagen);
            //muestro el html cuando se insertar el ultimo 
            if (total == numero_insert) {
                mostrar_contenido();
                localStorage.setItem("rc2016_firstime","1");
            }
            ++numero_insert;
        },transaction_error);
    });
}
/*
function traer_capitulo(id_serie) {
  db.transaction(function(tx) {
    tx.executeSql('SELECT * FROM series_se WHERE id_serie=? AND visto=1 ORDER BY modificado DESC LIMIT 1', [id_serie],mostrar_capitulos,nullHandler("tx datos capitulo"),transaction_error);
  });
}
*/
function mostrar_contenido(){
    //strftime('%m', fecha) as mes 
    console.log("seleccionamos from db");
    db.transaction(function(tx) {
    tx.executeSql("SELECT * FROM carreras where fecha > '2015-02-01'", [],get_contenido_db,funcionvacia(),transaction_error);
  });
}
function get_contenido_db(tx, result) {
  var row = result.rows.item;
  for (var i = 0; i < result.rows.length; i++) {
    var row = result.rows.item(i);
    console.log(row);
  }
}