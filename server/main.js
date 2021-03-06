import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import '../imports/weather.js';
import '../imports/currentViews.js';
import '../imports/events.js';
import { WeatherAPI} from '../imports/weatherAPI.js';
import { Events } from '../imports/events.js';
import { Weather } from '../imports/weather.js';
import { CurrentViews } from '../imports/currentViews.js';

Meteor.startup(() => {
  	// code to run on server at startup

  	updateWeatherBackgroundFromBing(); 
  	Meteor.setInterval(updateWeatherBackground, 43200000 ); // every 12 hours

  	// updateWeatherBackground();
  	// Meteor.setInterval(updateWeatherBackground, 300000);

  	Meteor.methods({
  		removeAllEvents: function() {
  			return Events.remove({});
  		},
  		updateEvents: function() {
  			
  			const users = Meteor.users.find({});
  			Events.remove({});
			users.forEach(function(user) {
				if (user) {

					const accessToken = user.services.google.accessToken;
					const calendarID = user.sharedCalendar;
					if (calendarID == undefined) {
						return;
					}

					var apiUrl = "/calendar/v3/calendars/" + calendarID +"/events?access_token=" + accessToken;
					var today = new Date();
					var endDate = new Date(today);

					endDate.setDate(today.getDate() + 5 * 7);

					options = {
						'params' : {
							'timeMin': (today).toISOString(),
							'timeMax': (endDate).toISOString(),
							'showDeleted': false,
							'singleEvents': true,
							'maxResults': 200,
							'orderBy': 'startTime'
						},
						'user': user
					}

					GoogleApi.get(apiUrl, options, function(error, data) {
						if (data) {
							var events = data.items;
													
							for (i in events) {
								event = events[i];
								var start;
								var end;
								var allDay;
								var multiDay = false;
								var date_created;
								var today = new Date();
								if (event.start.date) {
									start = { 
										"month" : parseInt(event.start.date.split("-")[1]), 
										"day" : parseInt(event.start.date.split("-")[2])
									}
									end = {
										"month" : parseInt(event.end.date.split("-")[1]), 
										"day" : parseInt(event.end.date.split("-")[2])
									}
									allDay = true;
									if (start.day < end.day && start.month <= end.month) {
										multiDay = true;
									}
									date_created = new Date(today.getYear(), start.month, start.day, 0, 0, 0, 0);
								} else {
									start = {
										"month" : parseInt(event.start.dateTime.split("-")[1]),
										"day" : parseInt(event.start.dateTime.split("-")[2].substring(0, 2)),
										"hour": parseInt(event.start.dateTime.substring(11, 13)),
										"minute": parseInt(event.start.dateTime.substring(14, 16))
									}
									end = {
										"month" : parseInt(event.end.dateTime.split("-")[1]),
										"day" : parseInt(event.end.dateTime.split("-")[2].substring(0, 2)),
										"hour": parseInt(event.end.dateTime.substring(11, 13)),
										"minute": parseInt(event.end.dateTime.substring(14, 16))
									}
									date_created = new Date(today.getYear(), start.month, start.day, start.hour, start.minute, 0, 0);
									allDay = false;
								}

								Events.upsert(event.id, {
										$set: {"name": event.summary,
										"start": start,
										"end": end,
										"allDay" : allDay,
										"multiDay": multiDay,
										"member": event.creator.email,
										"date_created": date_created
									}
								})
							}
						} else {
							console.log(error);
						}
					});
				}
			});


  		}
  	})

  	console.log("started server");
  	setUpGoogleService();
	Meteor.call('updateEvents');
  	Meteor.setInterval(function() {
  		Meteor.call('updateEvents');
  	}, 300000); //Every 5 minutes
 
 	Meteor.setInterval(function() {
 		timeOut = CurrentViews.find({_id: "calendarView"}, {fields: {timeOut: 1}}).fetch()[0].timeOut;
 		now = new Date();
 		now.setSeconds(now.getSeconds() - 5);
 		

 		if (timeOut < now) {
	 		CurrentViews.update("calendarView", {
	 			$set: {
	 				"currentView" : "calendar"
	 			}
	 		})
		}
 	}, 2000);

  	updateHourlyForecastConditions();
  	Meteor.setInterval(updateHourlyForecastConditions, 300000); //every 5 minutes
  	updateWeeklyForecastConditions();
  	Meteor.setInterval(updateWeeklyForecastConditions, 300000); //every 5 minutes
	updateWeatherConditions();
	Meteor.setInterval(updateWeatherConditions, 300000); //every 5 minutes
	updateAstronomyConditions();
	Meteor.setInterval(updateAstronomyConditions, 3600000); //update every 6 hours
	

});
var updateWeatherBackgroundFromBing = function() {

	HTTP.get("http://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US", {}, function(error, response) {
		
		var file = "http://www.bing.com" + response.data.images[0].url;
		Weather.update("Background", {
			$set: {
				"fileName" : file,
				"bingBackground": true,
				"backgroundDescription": response.data.images[0].copyright
			}
		}); 
	})	
}
var updateWeatherBackground = function() {
	var fs = Npm.require('fs');
	var files = fs.readdirSync('../../../../../public/resources/images/weather/');

	files.splice(files.indexOf("Thumbs.db"), 1);

	r = Math.floor(Math.random() * (files.length - 1));
	file = files[r];
	Weather.update("Background", {
		$set: {
			"fileName" : file,
			"bingBackground": false
		}
	}); 
}

function setUpGoogleService() {
	Accounts.loginServiceConfiguration.remove({
	  service: "google"
	}); 
	Accounts.loginServiceConfiguration.insert({
	  service: "google",
	  clientId: "673231814120-rn4idbahgh7r3lgidd89t6885vssk6tb.apps.googleusercontent.com",
	  secret: "hIvM3YXEpCijt2OFIRhGW-qa"
	});
}

var updateWeatherConditions = function() {
	WeatherAPI.updateWeatherConditions(44.1360760, -79.3083390);
}

var updateAstronomyConditions = function() {
	WeatherAPI.updateAstronomyConditions(44.1360760, -79.3083390);	
}

var updateWeeklyForecastConditions = function() {
	WeatherAPI.updateWeeklyForecastConditions(44.1360760, -79.3083390);		
}

var updateHourlyForecastConditions = function() {
	WeatherAPI.updateHourlyForecastConditions(44.1360760, -79.3083390);			
}