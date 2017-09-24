import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from './currentWeatherConditions.html';
import { Meteor } from 'meteor/meteor';
import { Weather} from '../../../../imports/weather.js';
import skycons from 'skycons';
Skycons = skycons(window);

var isDayTime = function() {
	var data = Weather.find({_id: "Condition"}, {fields: {isDayTime: 1}}).fetch()[0];
	if (data) {
		return data.isDayTime;	
	}	
}

class currentWeatherConditionsCtrl {

	constructor($scope) {
		
		$scope.viewModel(this);
		
		weatherIcon = new Skycons({"color":"white"});
		weatherIcon.add("currentWeatherIcon");
		weatherIcon.play();

		windyIcon = new Skycons({"color" : "white"});
		windyIcon.add("windyIcon");
		windyIcon.play();
		

		this.helpers({
			conditions() {

				var data = Weather.find({_id: "Condition"}).fetch()[0];
				
				if (data) {
					weatherIcon.set("currentWeatherIcon", Skycons.getSkycon(data.icon, isDayTime()));
					if (data.isWindy) {
						windyIcon.set("windyIcon", Skycons.WIND);
					} else {
						windyIcon.remove("windyIcon");
					}

					delete data._id; 
					delete data.icon; 
					delete data.isDayTime; 
					delete data.isWindy;
					delete data.ageOfMoon;
					delete data.phaseOfMoon;
					delete data.Pressure;
					delete data.Wind;
					delete data.Moonset;
					delete data.Moonrise;
					return data;
				}

			},
			backgroundDescription() {
			var description = Weather.find({_id: "Background"}).fetch()[0];
			if (description) {
					return description.backgroundDescription;
				}
			}
		})
	}

}


export default angular.module('currentWeatherConditions', [
  angularMeteor
])
  .component('currentWeatherConditions', {
    templateUrl: template,
    controller: ['$scope', currentWeatherConditionsCtrl]
  });