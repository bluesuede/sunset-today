(function() {
  
  var today = new Date(),
      sun = document.getElementById("circle");
  
  /**
   * Callback function if getting the location was successful
   *
   * @param position object
   *
   */
  function successPosition(pos) {
    var crd = pos.coords,
    apiAnswer,
    timeInMinutes,
    amOrPm,
    timezoneOffset = today.getTimezoneOffset(),
    timezoneAsString,
    hours,
    minutes,
    timeForOutput,
    request = new XMLHttpRequest(),
    requestGoogle = new XMLHttpRequest,
    googleApiAnswer;
    
    // Do GET request towards API
    request.open("GET", "http://api.sunrise-sunset.org/json?lat=" + crd.latitude + "&lng=" + crd.longitude + "&date=today", false);
    request.send();
    
    // Make answer from API in to JSON object
    apiAnswer = JSON.parse(request.responseText);
    
    // Do GET request towards google for city and country name
    requestGoogle.open("GET", "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + crd.latitude + "," + crd.longitude + "&sensor=true", false);
    requestGoogle.send();
    
    // Make answer from API to JSON obj, then take out string with format "City, Country"
    googleApiAnswer = JSON.parse(requestGoogle.responseText);
    
    googleApiAnswer = googleApiAnswer.results[2].formatted_address;
    
    // Get when sunset is in format 00:00:00 AM/PM
    apiAnswer = apiAnswer.results.sunset;
    
    // Save either string "AM" or "PM" from api answer
    amOrPm = apiAnswer.substr(apiAnswer.length -2);
    
    // Remove last three characters of api answer
    apiAnswer = apiAnswer.substring(0, apiAnswer.length - 3);
    
    // Make api answer in to array and add the hours and minutes together in form of minutes
    apiAnswer = apiAnswer.split(":");
    
    // If the seconds are greater than 30, round up an extra minute
    if(parseInt(apiAnswer[2]) > 29) {
      apiAnswer[1] = parseInt(apiAnswer[1]) + 1;
    }
    
    // Get the total amount of minutes of time given from API
    timeInMinutes = parseInt(apiAnswer[0] * 60) + parseInt(apiAnswer[1]);
    
    // If api answer was PM, add 720 minutes (12 hours) to timeInMinutes
    if(amOrPm === "PM") {
      timeInMinutes = timeInMinutes + 720;
    }    
    
    // Adjust time in minutes with timezone
    if(timezoneOffset > 0) {
      // Subtract the negative timezone offset
      timeInMinutes -= timezoneOffset;
    }
    else {
      // Timezone ahead of UTC is given as a negative int
      // First make it in to string, then remove subtraction char, then make it back to int
      timezoneAsString = String(timezoneOffset);
      timezoneAsString = timezoneAsString.substring(1, timezoneAsString.length);
      timezoneOffset = parseInt(timezoneAsString);
      
      // Add the positive timezone offset to the time in minutes
      timeInMinutes += timezoneOffset;
    }
    
    // Convert timeInMinutes back to 12 hour clock
    hours = parseInt(timeInMinutes / 60);
    minutes = timeInMinutes - (hours * 60);
    
    // Adjust to 12 hour clock, make it in to string for output
    if(hours > 12) {
      hours = hours - 12;
      
      // To make sure minutes are always displayed as two characters :00-style
      if(minutes < 10) {
        minutes = "0" + String(minutes);
      }
      
      timeForOutput = hours + ":" + minutes + " PM";
    }
    else {
      timeForOutput = hours + ":" + minutes + " AM";
    }
    
    displaySunsetTimeLocation(timeForOutput, googleApiAnswer);
    
  };
  
  errorPosition = function(error) {
    alert("You have to give permission to access your location if you want this website to work.");
  };
  
  displaySunsetTimeLocation = function(time, location) {
    var timeParagraph      = document.getElementById("loader-and-result"),
        locationParagraph  = document.getElementById("city-country");
        
    timeParagraph.textContent      = time;
    locationParagraph.textContent  = location;
  };

  navigator.geolocation.getCurrentPosition(successPosition, errorPosition);
  
  console.log(navigator.geolocation);
  
  sun.className = "do-move-down";
  
})();