import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Weather } from '../imports/weather.js';

class mainCtrl {

	constructor($scope) {
		$scope.viewModel(this); 
		this.helpers({
			background() {
				var file = Weather.find({_id: "Background"}, {fields: {fileName: 1}}).fetch()[0];
				if (file) {
					return {'background-image': 'url("resources/images/weather/' + file.fileName + '")'}		
				}
			}
		});		
	}
}



export {mainCtrl};