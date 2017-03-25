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
		this.helpers({
			days() {
				var events = Events.find({}).fetch();
				if (events) {
					days = getDaysInMonth(month);
					
					for (i in days) {
						day = days[i];
						for (j in events) {
							event = events[j];
							
							if (event.start.day == day.day && !event.allDay) {
								days[i].hasEvent = true;
								days[i].event.push(event.name);
								days[i].member.push(event.member);
								days[i].allDay = event.allDay;
								days[i].hour = event.start.hour;
								days[i].minute = event.start.minute;
							}

							if (event.start.day == day.day && event.allDay) {
								days[i].hasEvent = true;
								days[i].allDay = event.allDay;
								days[i].event.push(event.name);
								days[i].member.push(event.member);
							}

						}
					}

					return days;
				}
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
	
	filteredDays(days, view, limit) {
		filteredDays = [];
		var month;
		for (i = 0; i < days.length && filteredDays.length < limit; i++) {
			day = days[i];
			day.firstEventOfTheMonth = false;
			if (day.event[day.member.indexOf(view)]) {

				if (!month) {
					month = day.month;
				}
				if (day.month != month) {
					month = day.month;
					day.firstEventOfTheMonth = true;
				}
				filteredDays.push(day);
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

function getDaysInMonth(month) {
	 var today = new Date();
	 var sundayOfWeek = new Date(today.getFullYear(), today.getMonth(), (today.getDate() - today.getDay()));
     var date = sundayOfWeek 
     var rows = 5;
     var days = [];

     var counter = 0;

     while (rows > 0) {
 
     	dateOfMonth = new Date(date).getDate();
     	     	
     	if ((counter % 7) == new Date(date).getDay()) {
     		days.push({
     			hour: 0,
     			minute: 0,
     			day: 		 dateOfMonth,
     			month: 		 date.getMonth() + 1,
     			event: 		 [],
     			isToday: 	 dateOfMonth == today.getDate() && month == date.getMonth(),
     			isNextMonth: month != date.getMonth(),
     			member : 	 []
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