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

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
        chequearconexion();
        generar_contenido();
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
}

function generar_contenido() {
    if (localStorage.getItem("rc2016_firstime") === null || localStorage.getItem("rc2016_notfirstime") <> "1") {
        crear_tablas();
    } else {
        obtener_contenido();
    }
}

function crear_tablas(){
    console.log("creando tablas");
    var db = window.openDatabase(shortName, version, displayName, maxSize);
    db.transaction(creacionDB, nullHandler, errorHandler);
}
function creacionDB(tx) {
    var sql3 = "CREATE TABLE IF NOT EXISTS carreras (id_carrera INTEGER PRIMARY KEY,carrera,nro_carrera,carreras_totales,fecha,categoria,id_categoria,categoria_short, destacado,latitud,longitud,id_circuito,circuito,extension,imagen)";
    tx.executeSql(sql3);
}
function nullHandler(testo){
  console.log("null handler");
}
function successHandler(){
  console.log("tabla creada con exito");
}
function errorHandler(tx,error) {
   console.log('Mensaje: ' + error.message + ' code: ' + error.code);
}

function obtener_contenido(){
    db = window.openDatabase(shortName, version, displayName, maxSize);
    console.log("database opened");
    db.transaction(getCarreras, transaction_error);
}

function getCarreras(){
    var sql = "SELECT id_serie,max(modificado) FROM series_se GROUP BY id_serie ORDER BY max(modificado) DESC";
    tx.executeSql(sql, [], getSerieExito);
}

function transaction_error(tx, error) {
    console.log(tx);
}
function getSerieExito(tx, result) {
    if (result.rows.length > 0) {
        for (var i = 0; i < result.rows.length; i++) {
            var row = result.rows.item(i);
            console.log(row);
            var howmany = true;
            pegar_capitulo_vista(row,howmany);
        }
    } else {
        var howmany = false;
        var row = ["No hay carreras este fin de semana."]
        pegar_capitulo_vista(row,howmany);
    }
}

function pegar_capitulo_vista(res,howmany) {
   /* //header rango fecha
    $("#rango_fechas").append('<a href="#" class="brand-logo"><i class="mdi-hardware-keyboard-arrow-left left anterior_se"></i><span class="ultra-bold">' + monthNames[cortar_fecha(data[0].desde.substr(4, 2))] + '</span><span>' + cortar_fecha(data[0].desde.substr(6, 2)) + ' / <span class="ultra-bold">' + monthNames[cortar_fecha(data[0].hasta.substr(4, 2))] + '</span><span>' + cortar_fecha(data[0].hasta.substr(6, 2))  + '<i class="mdi-hardware-keyboard-arrow-right right siguiente_se"></i></a>' );    */
    if (howmany == true) {
        console.log("generamos contenido para mostrar mostrar");
    } else {
        console.log("no resultados en db para mostrar");
    }
}