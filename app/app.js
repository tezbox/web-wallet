"use strict";
var app = angular.module('popup', [
  'ngRoute',
  'angular-blockies',
  'monospaced.qrcode',
])

app.config(function($routeProvider) {
    $routeProvider
    .when("/create", {
        templateUrl : "app/views/create.html",
        controller : "CreateController",
    })
    .when("/unlock", {
        templateUrl : "app/views/unlock.html",
        controller : "UnlockController",
    })
    .when("/new", {
        templateUrl : "app/views/new.html",
        controller : "NewController",
    })
    .when("/restore", {
        templateUrl : "app/views/restore.html",
        controller : "RestoreController",
    })
    .when("/main", {
        templateUrl : "app/views/main.html",
        controller : "MainController",
    })
    .when("/send", {
        templateUrl : "app/views/send.html",
        controller : "SendController",
    })
    .when("/setting", {
        templateUrl : "app/views/setting.html",
        controller : "SettingController",
    })
    .when("/delegate", {
        templateUrl : "app/views/delegate.html",
        controller : "DelegateController",
    })
    .when("/qr", {
        templateUrl : "app/views/qr.html",
        controller : "QrController",
    })
    .when("/encrypt", {
        templateUrl : "app/views/encrypt.html",
        controller : "EncryptController",
    })
    .when("/validate", {
        templateUrl : "app/views/validate.html",
        controller : "ValidateController",
    })
    .otherwise({
        redirectTo: '/new'
    });
});