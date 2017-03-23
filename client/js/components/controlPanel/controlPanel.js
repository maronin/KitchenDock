import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { CurrentViews } from '../../../../imports/currentViews.js';
var calendarTimerID;

class controlPanelCtrl { 

	constructor($scope) { 
		$scope.viewModel(this);
		this.helpers({
			controlPanelView() {
				var data = CurrentViews.find({_id: "controlPanelView"}, {fields: {currentView: 1}}).fetch()[0]
				if (data) {
					return data.currentView;
				}
			}
		})

	}
	changeForecast(weekView) {
		CurrentViews.update("weatherView", {
			$set: {
				"weekView" : weekView
			}
		})

	}
	changeView(view) {
		CurrentViews.update("controlPanelView", {
			$set: {
				"currentView" : view
			}
		})
		if (view == "calendar") {
			Meteor.clearInterval(calendarTimerID);
			CurrentViews.update("calendarView", {
				$set: {
					"currentView" : view
				}
			})	
		}
	}

	changeCalendarView(view) {
		Meteor.clearInterval(calendarTimerID);
		CurrentViews.update("calendarView", {
			$set: {
				"currentView" : view,
				"timeOut" : new Date()
			}
		})	
		calendarTimerID = startTimer(view);
		

	}


}
function startTimer(view) {
	return Meteor.setInterval(function() {
		console.log(new Date());
		CurrentViews.update("calendarView", {
			$set: {
				"currentView" : view,
				"timeOut" : new Date()
			}
		})	
	}, 1000)
} 

/*window.onunload = window.onbeforeunload = (function(){
	alert('yo')
	CurrentViews.update("calendarView", {
		$set: {
			"currentView" : 'calendar'
		}
	})	
});*/

export { controlPanelCtrl };