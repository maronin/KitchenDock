import timeLocationHeader 		from './components/timeLocationHeader/timeLocationHeader.js';
import weatherBar 				from './components/weatherBar/weatherBar.js';
import currentWeatherConditions from './components/currentWeatherConditions/currentWeatherConditions.js';
import calendar 				from './components/calendar/calendar.js';
import uiRouter 				from "angular-ui-router";
import angular 					from 'angular';
import angularMeteor 			from 'angular-meteor';
import ngRepeatFinished 		from './directives/ngRepeatFinishedDirective.js';
import ngAnimate 				from 'angular-animate';

angular.module('weather-app', [ 
	timeLocationHeader.name,
	weatherBar.name,
	currentWeatherConditions.name,
	ngRepeatFinished.name,
	calendar.name,
	uiRouter,
	ngAnimate
]);