import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from './timeLocationHeader.html';
import moment from 'moment-timezone';
import { Meteor } from 'meteor/meteor';

class timeLocationHeaderCtrl {

	constructor($scope) {
		
		$scope.viewModel(this);
		$scope.currentLocation = "Mount Albert, Ontario, Canada";
		Meteor.setInterval(updateTime, 1000);

		//Update the current time
		function updateTime() {

			//Set the time & date for the current timezone
			$scope.currentTime = moment().format('HH:mm');
			$scope.date = moment().format("DD");
			$scope.month = moment().format("MMMM");
			$scope.day = moment().format("dddd");
 
			//Set the time for the different timezones
			$scope.AlekTime = moment().tz('Europe/Berlin').format('HH:mm');
			$scope.RussiaTime = moment().tz('Europe/Moscow').format('HH:mm');
			$scope.TokyoTime = moment().tz('Asia/Tokyo').format('HH:mm');
			$scope.$apply();
		}

	}

}

export default angular.module('timeLocationHeader', [
	angularMeteor
])
  .component('timeLocationHeader', {
    templateUrl: template,
    controller: ['$scope', timeLocationHeaderCtrl]
  });