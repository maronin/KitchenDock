import angular 			from 'angular';
import angularMeteor 	from 'angular-meteor';
import template 		from './calendar.html';
import { Meteor } 		from 'meteor/meteor';
import { Events } 		from '../../../../imports/events.js';
import { CurrentViews } from '../../../../imports/currentViews.js';

var emailNameMap = {
	"inna2128506@gmail.com" : "Inna",
	"alek.aronin@gmail.com" : "Alek",
	"steroidcat@gmail.com" : "Mark"
}

class calendarCtrl {

	constructor($scope) {

		$scope.viewModel(this);
		setupCalendar();
		$scope.moment = new moment();
		$scope.nextMonth = new moment();
		$scope.today = new moment();

		this.helpers({
			days() {
				var events = Events.find({}).fetch();

				if (events) {	
					var days = getDaysInMonth(month);
					for (i = 0; i < days.length; i++) {
						var day = days[i];
						for (j in events) {
							var event = events[j];

							if (event.start.day == day.day && event.start.month == day.month) {
								day.hasEvent = true;
								// day.isMultiDay = event.multiDay;
								day.events.push(event);
								day.member.push(event.member);
							}
							else if ((event.start.day < day.day && event.start.month == day.month) && 
								(event.end.day > day.day && event.end.month == day.month)) {
								day.hasEvent = true;
								day.events.push(event);
								day.member.push(event.member);	
								// day.isMultiDay = event.multiDay; 
							}


						}
					}
					return days;
				}
			},
			events() {
				var events = Events.find({}, {sort: {date_created: -1}}).fetch().reverse();
				
				return events.slice(0,9);
			},
			calendarView() {
				data = CurrentViews.find({_id: "calendarView"}, {fields: {currentView: 1}}).fetch()[0]
				if (data) {
					return data.currentView;
				}
			},
			calendarOwner() {
				currentView = CurrentViews.find({_id: "calendarView"}, {fields: {currentView: 1}}).fetch()[0];

				if (currentView) {
					return emailNameMap[currentView.currentView];
				}
			},
			calendarOwnerColor() {
				currentView = CurrentViews.find({_id: "calendarView"}, {fields: {currentView: 1}}).fetch()[0];

				if (currentView) {
					switch (currentView.currentView) {
						case "inna2128506@gmail.com":
						return "calendar-inna";
						case "alek.aronin@gmail.com":
						return "calendar-alek";
						case "steroidcat@gmail.com":
						return "calendar-mark";
						default:
						return "";
					}

				}
			}

		});

		function setupCalendar() {
			date = new Date();
			month = date.getMonth();		
			$scope.days = getDaysInMonth(month);
			$scope.daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];
		}



	}
	whatEventColor(member) {
		console.log(member);
		if (member == 'alek.aronin@gmail.com')
			return 'calendar-alek';
		if (member == 'inna2128506@gmail.com')
			return 'calendar-inna';
		else
			return 'calendar-mark';
	}

	filteredDays(days, view, limit) {
		filteredDays = [];
		var month;

		for (i = 0; i < days.length && filteredDays.length < limit; i++) {
			day = days[i];
			for (j = 0; j < day.events.length; j++) {
				if (day.events[j].member == view) {
					day.firstEventOfTheMonth = false;
					if (!month) { 
						month = day.month;
					} 
					if (day.month != month) {
						month = day.month;
						day.firstEventOfTheMonth = true;
					}	
					day.events = filterEvents(day, view);
					filteredDays.push(day);
				}
			}		
		}

		return filteredDays;
	}

	signInButton() {
		Meteor.loginWithGoogle({
			requestOfflineToken: {google: true},
			requestPermissions: ["https://www.googleapis.com/auth/calendar.readonly"],
			forceApprovalPrompt: true
		});
	}

	
}
function filterEvents(day, view) {
		
	var filteredEvents = [];

	for (j = 0; j < day.events.length; j++) {
		if (day.events[j].member == view) {
			filteredEvents.push(day.events[j]);
		}
	}
	return filteredEvents
	
}
function getDaysInMonth(month) {
	 var today = new Date();
	 var sundayOfWeek = new Date(today.getFullYear(), today.getMonth(), (today.getDate() - today.getDay()));
     var date = sundayOfWeek 
     var rows = 2;
     var days = new Array();

     var counter = 0;

     while (rows > 0) {
 
     	dateOfMonth = new Date(date).getDate();
     	     	
     	if ((counter % 7) == new Date(date).getDay()) {
     		days.push({
     			hour: 0,
     			minute: 0,
     			day: 		 dateOfMonth,
     			month: 		 date.getMonth() + 1,
     			events:      [], 
     			isToday: 	 dateOfMonth == today.getDate() && month == date.getMonth(),
     			isNextMonth: month != date.getMonth(),
     			member : 	 new Array()
     		});
     		date.setDate(date.getDate() + 1);
     	}
     	
     	counter++;
        if (counter % 7 == 0) {
        	rows--;
        }

     }

     return days;
}





export default angular.module('calendar', [
  angularMeteor
])
  .component('calendar', {
    templateUrl: template,
    controller: ['$scope', calendarCtrl]
  });