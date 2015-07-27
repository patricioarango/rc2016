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

monthNames = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
    "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

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
        $(".button-collapse").sideNav({menuWidth: 240, activationWidth: 70});
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
    function onSuccess(position) {
        localStorage.setItem("rc2016_lat", position.coords.latitude);
        localStorage.setItem("rc2016_lon", position.coords.longitude);
        console.log("latitude: " + position.coords.latitude);
        console.log("longitude: " + position.coords.longitude);
        generar_contenido();    
    }

    function onError(error) {
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
        if (window.localStorage.getItem("rc2016_conexion") == "0") {
            alert("we need conection for the first use");
        } else {
            console.log("creando tablasparapato");
            crear_tablas();
        }
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
    var per = get_dias_periodo();
    console.log("fechas query" + per.fecha_inicial + per.fecha_final);
    console.log("seleccionamos from db");
    db.transaction(function(tx) {
    tx.executeSql("SELECT * FROM carreras where fecha > '2015-02-01'", [],get_contenido_db,funcionvacia(),transaction_error);
  });
}
function get_contenido_db(tx, result) {
    var eventos = $('#eventos').empty();
    //var row = result.rows.item;
if (result.rows.length == 0) {
        eventos.append('<div class="row">' +
                  '<div class="col s12 m12">' +
                    '<div class="card">' +
                      '<div class="card-content no_eventos">' +
                          '<i class="mdi-alert-warning"></i> No events this week.' +
                      '</div>' +
                    '</div>' +
                  '</div>' +
                '</div>');        
    } else {
        for (var i = 0; i < result.rows.length; i++) {
            var row = result.rows.item(i);
            console.log(row);
            //nombre corto para categoria si el nombre es largo
            if (row.categoria.length > 15) {
                var categoria = row.categoria_short;
            }
            else {
                var categoria = row.categoria;
            }
            //destacados
            if (row.destacado == "1") {
                 destacado = '<i class="medium mdi-action-stars right blue-text  text-accent-3"></i>' ;
            }
            else {
                 destacado = "";
            }                        
            eventos.append('<div class="row">' +
                          '<div class="col s12 m12">' +
                            '<div class="card flow-text" data-id_categoria="' + row.id_categoria + '">' +
                              '<div class="card-image">' +
                                '<img src="racing_calendar_pics/cat_id_1/f1-9.jpg">' +
                                '<span class="card-title"><strong>' + categoria + ':</strong> ' + row.carrera + '</span>' +
                              '</div>' +
                              '<div class="card-content">' +
                                '<div class="col s10">' +
                                  '<p><i class="mdi-action-today"></i><strong> fecha</strong> nro_fecha</p>' +
                                  '<p>distancia</p>' +
                                  '<p>' + row.circuito + '</p>' +
                                '</div>'  +
                                '<div class="col s2 destacado">' +
                                    destacado +
                                '</div>'  +
                              '</div>' +
                            '</div>' +
                          '</div>' +
                        '</div>');            
        }    
    }
    sync_process();
}
function sync_process(){
    var con = window.localStorage.getItem("rc2016_conexion");
    console.log("proceso sync starts");
    if (con == 1) {
        var url = "http://autowikipedia.es/phonegap/racing_calendar_eventos_sync.php?fecha_actualizacion=" + a;
        $.post(url, function(data) {
            console.log("results for sync: " + data.length);
            if (data[0].resultados == 0) {
                console.log("no new data");
            } else {
                $.each(data, function(i, item) {
                    insertar_contenido_sync(item, data.length);
                });
            }
        },"json");
    } else {
        console.log("no conection for sync, maybe later");
    }

}
numero_insert_sync = 1;
function insertar_contenido_sync(item,total) {
    var a = Math.floor(Date.now() / 1000);
    db.transaction(function(tx) {
    tx.executeSql(item.sentencia, [item.id_carrera,item.carrera,item.nro_fecha,item.nro_fecha,item.fecha,item.categoria,item.categoria_id,item.categoria_short,item.destacado,item.latitud,item.longitud,item.circuito_id,item.circuito,item.extension,item.imagen], function(tx, results){ //funcion para mensaje
            console.log("insert nro: " + numero_insert_sync);
            console.log("insert data: " + item.id_carrera+ " " +item.carrera+ " " +item.nro_fecha+ " " +item.nro_fecha+ " " +item.fecha+ " " +item.categoria+ " " +item.categoria_id+ " " +item.categoria_short+ " " +item.destacado+ " " +item.latitud+ " " +item.longitud+ " " +item.circuito_id+ " " +item.circuito+ " " +item.extension+ " " +item.imagen);
            //muestro el html cuando se insertar el ultimo 
            if (total == numero_insert_sync) {
                mostrar_contenido();
                //ultima actualizacion
                window.localStorage.setItem("rc2016_last_act", a);
            }
            ++numero_insert_sync;
        },transaction_error);
    });
}
$("#rango_fechas").on('click',".anterior_se",function(e) {
    e.preventDefault();
    var posicion_inicial = $("#rango_fechas").data("posicion");
    var posicion_se = posicion_inicial - 1;
    $("#rango_fechas").data("posicion", posicion_se);
    mostrar_contenido();
    
});
$("#rango_fechas").on('click',".siguiente_se",function(e) {
    e.preventDefault();
    var posicion_inicial = $("#rango_fechas").data("posicion");
    var posicion_se = posicion_inicial + 1;
    $("#rango_fechas").data("posicion", posicion_se);
    mostrar_contenido();   
});

function get_dias_periodo() {
    var $rango_fechas = $("#rango_fechas");
    var semana = $("#rango_fechas").data("posicion");
    var now = new Date();
    var lunes; var domingo;
    if (semana < 0) {
      lunes = new Date(now.setDate(now.getDate() - now.getDay() + 1 + (semana * 7)));
    } else {
      lunes = new Date(now.setDate(now.getDate() - now.getDay() + (1 + (semana * 7))));
    }
    //el domingo siempre son 7 dias a partir del lunes establecido
    domingo = new Date(now.setDate(now.getDate() - now.getDay() + 7));

    $rango_fechas.empty();
    $rango_fechas.append('<span class="flow-text" style="font-size:1.9em;"><i class="mdi-hardware-keyboard-arrow-left anterior_se"></i><strong>' + monthNames[lunes.getMonth()] + '</strong>' + lunes.getDate() + '<strong>/' + monthNames[domingo.getMonth()] + '</strong>' + domingo.getDate() + ' <i class="mdi-hardware-keyboard-arrow-right siguiente_se"></i></span>');

    return {
        "fecha_inicial": lunes.yyyymmdd(),
        "fecha_final": domingo.yyyymmdd()
    }; 
}

Date.prototype.yyyymmdd = function() {
  var yyyy = this.getFullYear().toString();
  var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
  var dd  = this.getDate().toString();
  return yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]); // padding
};