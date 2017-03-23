import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from './weatherBar.html';
import { Meteor } from 'meteor/meteor';
import { Weather } from '../../../../imports/weather.js';
import { WeatherAPI } from '../../../../imports/weatherAPI.js';
import { CurrentViews } from '../../../../imports/currentViews.js';

import skycons from 'skycons';
Skycons = skycons(window);

class weatherBarCtrl { 

	constructor($scope) { 
		$scope.viewModel(this);
		var ctrl = this;

		this.helpers({
			weekView() {
				data = CurrentViews.find({_id: "weatherView"}, {fields: {weekView: 1}}).fetch()[0];
				if (data){
					return data.weekView; 
				}
			},
			forecast7Days() {

				data = Weather.find({_id: "Forecast"}, {fields: {forecast7Days: 1}}).fetch()[0];
				if (data) {
					return data.forecast7Days;
				}
			},
			forecastHourly() {
				data = Weather.find({_id: "Forecast"}, {fields: {forecastHourly: 1}}).fetch()[0];
				if (data) {
					return data.forecastHourly;
				}
			},
			moon() {
				var data = Weather.find({_id: "Condition"}, {fields: {ageOfMoon: 1, phaseOfMoon: 1 }}).fetch()[0];
				if (data) {
					return data;
				}
			}
		})


		$scope.$on('ngRepeatFinished', function() {
		
			if (ctrl.weekView) {
				setUpIcons(true, ctrl.forecast7Days);
				ctrl.forecast7Days[0].date.weekday_short = "TODAY";
			} else {
				setUpIcons(false, ctrl.forecastHourly);
			}
	
		});

		var isDayTime = function(time) {
			var data = Weather.find({_id: "Condition"}, {fields: {Sunrise: 1, Sunset: 1 }}).fetch()[0];
			if (data) {
				currentTime = new Date();
				currentTime.setHours(time);
				return WeatherAPI.isDayTime(data.Sunrise, data.Sunset, currentTime);					
			}
		}

		var setUpIcons = function(weekView, list) {
			for (key in list) {
				data = list[key];

				weatherIcon = new Skycons({"color":"white"});
				var iconName = "";
				var dayTime = true;

				if (weekView) {
					iconName = "icon-" + data.date.weekday_short + "-" + data.date.day;
				}
				else {
					iconName = "icon-" + data.FCTTIME.hour;	
					dayTime = isDayTime(data.FCTTIME.hour);
				}

				weatherIcon.add(iconName);
				weatherIcon.play();
				weatherIcon.set(iconName, Skycons.getSkycon(data.icon, dayTime));	
			}
		}
	}
	changeForecast(weekView) {
		CurrentViews.update("weatherView", {
			$set: {
				"weekView" : weekView
			}
		})

	}
}


export default angular.module('weatherBar', [
	angularMeteor
])
  .component('weatherBar', {
    templateUrl: template,
    controller: ['$scope', weatherBarCtrl]
  });