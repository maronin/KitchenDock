import { mainCtrl} from "./main.js";
import { controlPanelCtrl } from "./js/components/controlPanel/controlPanel.js";

angular.module('weather-app').config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
    function ($stateProvider, $urlRouterProvider, $locationProvider) {
        
        $locationProvider.html5Mode(true);
        $stateProvider
            .state('home', {
                url: "/",
                templateUrl: 'client/main.html',
                controller: "mainCtrl",
                controllerAs: "$ctrl"
            })
            .state('settings', {
                url: "/controlpanel",
                templateUrl: 'client/js/components/controlPanel/controlPanel.html',
                controller: "controlPanelCtrl",
                controllerAs: "$ctrl"
            });
        $urlRouterProvider.otherwise('/');
    }
])
.controller('mainCtrl', mainCtrl)
.controller('controlPanelCtrl', controlPanelCtrl);