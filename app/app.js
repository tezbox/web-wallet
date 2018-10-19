"use strict";
var app = angular.module('popup', [
  'ngRoute',
  'angular-blockies',
  'monospaced.qrcode',
  'oitozero.ngSweetAlert'
])

app.config(function($routeProvider) {
    $routeProvider
    .when("/new", {
        templateUrl : "app/views/new.html",
        controller : "NewController",
    })
    .when("/create", {
        templateUrl : "app/views/create.html",
        controller : "CreateController",
    })
    .when("/restore", {
        templateUrl : "app/views/restore.html",
        controller : "RestoreController",
    })
    .when("/link", {
        templateUrl : "app/views/link.html",
        controller : "LinkController",
    })
    .when("/validate", {
        templateUrl : "app/views/validate.html",
        controller : "ValidateController",
    })
    .when("/encrypt", {
        templateUrl : "app/views/encrypt.html",
        controller : "EncryptController",
    })
    .when("/main", {
        templateUrl : "app/views/main.html",
        controller : "MainController",
    })
    .when("/unlock", {
        templateUrl : "app/views/unlock.html",
        controller : "UnlockController",
    })
    .when("/setting", {
        templateUrl : "app/views/setting.html",
        controller : "SettingController",
    })
    .otherwise({
        redirectTo: '/new'
    });
});