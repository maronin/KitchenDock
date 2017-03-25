import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Weather } from './weather.js';

var wunderWeatherApiKey = '6bfc01c61a565108';
var darkSkyApiKey = '30b0e2c6facd1fc0fc7f388ef4f861bb';

var apiCall = function (apiUrl, callback) {
  try {
    var response = HTTP.get(apiUrl).data;
    callback(null, response);
  } catch (error) {
    // If the API responded with an error message and a payload 
    if (error.response) {
      console.log(error);
      var errorCode = error.response.data.code;
      var errorMessage = error.response.data.message;
    // Otherwise use a generic error message
    } else {
      var errorCode = 500;
      var errorMessage = 'Cannot access the API';
    }
    // Create an Error object and return it via callback
    var myError = new Meteor.Error(errorCode, errorMessage);
    callback(myError, null);
  }
}

var buildStringAPI = function(string, long, lat, darksky) {
	apiUrl = "";
	if (darksky) {
		apiUrl = "https://api.darksky.net/forecast/" + darkSkyApiKey + "/" + long + "," + lat + "?units=si";
	} else {
		apiUrl = "http://api.wunderground.com/api/" + wunderWeatherApiKey + "/" + string + "/q/" + long + "," + lat + ".json";											
	}

	// query the API
	var response = Meteor.wrapAsync(apiCall)(apiUrl);
	return response;
}


/**
 * Check if its day time.
 */

export const WeatherAPI = { 
	isDayTime: function(sunrise, sunset, currentDate=null) {
		
		if (currentDate == null) {
			currentDate = new Date();
		}

		startDate = new Date(currentDate.getTime());
		startDate.setHours(sunrise.split(":")[0]);
		startDate.setMinutes(sunrise.split(":")[1]);

		endDate = new Date(currentDate.getTime());
		endDate.setHours(sunset.split(":")[0]);
		endDate.setMinutes(sunset.split(":")[1]);	
		
		return startDate < currentDate && endDate > currentDate;

	}, 
  	updateWeatherConditions: function (long, lat) {
  	   
	    console.log('getting current weather conditions for coordinates', long, lat);

	    //wunder weather & dark sky api
	    wwConditions = buildStringAPI("conditions", long, lat);
	    wwForecast = buildStringAPI("forecast", long, lat);

	    dsResponse = buildStringAPI("", long, lat, true);

	    var temp 		= Math.round(wwConditions.current_observation.temp_c);
	    var temp_feels  = Math.round(wwConditions.current_observation.feelslike_c) + "°";
	    var humidity    = wwConditions.current_observation.relative_humidity;
	    var pressure    = (wwConditions.current_observation.pressure_mb / 10) + "kPa";
	    var wind        = wwConditions.current_observation.wind_kph + "km/h";
	    var isWindy     = (dsResponse.currently.icon === "wind" ? true : false);
	    var chance_rain = wwForecast.forecast.txt_forecast.forecastday[0].pop + "%";
	    var visibility  = wwConditions.current_observation.visibility_km + " km";
	    var uv 			= wwConditions.current_observation.UV;
	    var icon        = wwConditions.current_observation.icon;

	    Weather.update("Condition", {
	    	$set: {
	    		"Temperature" 	 : temp,
	    		"Feels like"  	 : temp_feels,
	    		"Humidity"	  	 : humidity,
	    		"Pressure"	  	 : pressure,
	    		"Wind"		  	 : wind,
	    		"isWindy" 	  	 : isWindy,
	    		"Visibility"  	 : visibility,
	    		"Chance of rain" : chance_rain,
	    		"icon"			 : icon,
	    		"UV" 			 : uv
	    	}
	    });
	    
  	  	//this.unblock(); //might need this when I run multiple requests for the API?
  	  	//https://docs.meteor.com/api/methods.html#DDPCommon-MethodInvocation-unblock    

	  },

	  weatherHourly: function(long, lat) {
	    console.log('getting weather hourly forcast for coordinates', long, lat);
	    	
	    return buildStringAPI("hourly", long, lat);
	  },

	  //Current sun and moon information (sunset, sunrise, moon phase, moon rise, moon set)
	  updateAstronomyConditions: function(long, lat) {
	    console.log('getting sun and moon stats for coordinates', long, lat);
	    wwAstronomy = buildStringAPI("astronomy", long, lat);

	    var sunrise     = wwAstronomy.sun_phase.sunrise.hour + ":" + wwAstronomy.sun_phase.sunrise.minute; 
	    var sunset      = wwAstronomy.sun_phase.sunset.hour + ":" + wwAstronomy.sun_phase.sunset.minute;
	    var moonrise    = wwAstronomy.moon_phase.moonrise.hour + ":" + wwAstronomy.moon_phase.moonrise.minute; 
	    var moonset     = wwAstronomy.moon_phase.moonset.hour + ":" + wwAstronomy.moon_phase.moonset.minute; 
	    var ageOfMoon   = wwAstronomy.moon_phase.ageOfMoon;
	    var phaseOfMoon = wwAstronomy.moon_phase.percentIlluminated;

	    Weather.update("Condition", {
	    	$set: {
	    		"Sunrise" 	  : sunrise,
	    		"Sunset" 	  : sunset,
	    		"isDayTime"   : this.isDayTime(sunrise, sunset),
	    		"Moonrise" 	  : moonrise,
	    		"Moonset" 	  : moonset,
	    		"ageOfMoon"   : ageOfMoon,
	    		"phaseOfMoon" : phaseOfMoon + "%"
	    	}
	    });

	  },
	  updateHourlyForecastConditions: function (long, lat) {
		
	  	wwForecatHourly = buildStringAPI("hourly", long, lat);

  	    Weather.update("Forecast", {
  	    	$set: {
  				"forecastHourly": wwForecatHourly.hourly_forecast.slice(0, 8),
  	    	}
  	    })


	  },
	  //Forcast for the next 3 days
	  updateWeeklyForecastConditions: function (long, lat) {
	    console.log('getting weather forcast for the next 7 days');
	    
	    wwForecast10Days = buildStringAPI("forecast10day", long, lat);

	    Weather.update("Forecast", {
	    	$set: {
				"forecast7Days": wwForecast10Days.forecast.simpleforecast.forecastday.slice(0, 8),
	    	}

	    })

	  },
}