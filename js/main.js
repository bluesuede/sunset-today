(function () {

    var today = new Date(),
        sun = document.getElementById("circle"),
        htmlElement = document.getElementById("html-element"),
        apiAnswer,
        presentationText = '',
        googleApiAnswer,
        coordinates;

    // Initializes the application
    function init() {

        // Prompt user for location service.
        navigator.geolocation.getCurrentPosition( geolocationSuccess, geolocationError );

    }

    /**
     * Callback function if getting the location was successful
     *
     * @param object position
     *
     */
    function geolocationSuccess( pos ) {

        coordinates = pos.coords;
        callSunriseSunsetAPI();
    }

    /**
     * Callback function for when getting the location was not successful
     *
     */
    function geolocationError() {
        alert("You have to give permission to access your location if you want this website to work.");
    }
    
    /**
     * Do GET request to API for sunrise and sunset
     *
     * @params string, will do GET request today if string is "today" and tomorrow if string is "tomorrow"
     *
     */
    function callSunriseSunsetAPI(todayOrTomorrow) {
      
      var date;
      
      // If function is called with param string "tomorrow", variable date will be the date of tomorrow
      if(todayOrTomorrow === "tomorrow") {
        date = (today.getDate() + 1);
      }
      else {
        date = today.getDate();
      }
      
      var request = new XMLHttpRequest(),
          formattedDate = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + date;
      
      // Do GET request towards sunset API, call function sunsetListener when data is loaded
      // This GET request is to get time of sunrise and sunset
      if(todayOrTomorrow) {
        request.addEventListener("load", sunriseListener);
      }
      else {
        request.addEventListener("load", sunriseSunsetListener);
      }
      request.open("GET", "http://api.sunrise-sunset.org/json?lat=" + coordinates.latitude + "&lng=" + coordinates.longitude + "&date=" + formattedDate + "");
      request.send();
    }
    
    function sunriseListener() {      
      
        // Parse response data from sunrise-sunset to JSON object
        apiAnswer = JSON.parse(this.responseText);
        
        var timeForSunrise = formatOutputStrings("sunrise");
        
        sunriseAnimations();
        displayInfoToUser(timeForSunrise);
    }

    /**
     * Callback function when data from sunrise-sunset API is loaded
     *
     * this = response from get request in callSunriseSunsetAPI()
     *
     */
    function sunriseSunsetListener() {

        var requestGoogle = new XMLHttpRequest; // Used to call GET from Google

        // Parse response data from sunrise-sunset to JSON object
        apiAnswer = JSON.parse(this.responseText);

        // Do GET request towards Google API, call function googleListener when data is loaded
        // This GET request is to get address/specified location of user
        requestGoogle.addEventListener("load", googleListener);
        requestGoogle.open("GET", "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + coordinates.latitude + "," + coordinates.longitude + "&sensor=true");
        requestGoogle.send();

    }

    /**
     * Callback function when data from Google API is loaded
     *
     */
    function googleListener() {

        // Parse response data from Google to JSON Object
        googleApiAnswer = JSON.parse(this.responseText);

        // Both API results are in global variables, call the outputting function
        outputToUser();
    };
    
    /**
     * Displays sunset time and does animations if sunset hasnt happened yet
     * If time is after time of sunset, calls function callSunriseSunsetAPI() to find sunrise time of tomorrow
     *
     */
    function outputToUser() {
      var timeForSunset,
          timeForSunsetFour,
          timeForSunrise,
          timeForSunriseFour,
          nowString,
          nowFour,
          todayOrTomorrow;
        
      // Get formatted adress in response from Google
      googleApiAnswer = googleApiAnswer.results[2].formatted_address;
      
      // Get time of sunset and sunrise for today in format "00:00:00 AM/PM"
      timeForSunrise  = formatOutputStrings("sunrise");
      timeForSunset   = formatOutputStrings("sunset");
      
      // Make sure nowString has four digits
      nowString = today.getHours() + ':';
      if(today.getMinutes() < 10) {
        nowString += "0" + today.getMinutes();
      }
      else {
        nowString += today.getMinutes();
      }
      
      ///////////////////////////////////////
      // CAN BE USED FOR TESTING WHEN USER IS ON SITE
      //nowString = "05:00";
      ///////////////////////////////////////
      
      // Make all times in to string format "0000"
      sunriseFour = convertTimeToFourDigitString(timeForSunrise);
      sunsetFour  = convertTimeToFourDigitString(timeForSunset);
      nowFour     = convertTimeToFourDigitString(nowString);
      
      // If time is between sunset and midnight
      if(nowFour > sunsetFour) {
        todayOrTomorrow = "tomorrow";
        callSunriseSunsetAPI(todayOrTomorrow);
      }
      // If time is between midnight and sunrise
      else if(nowFour < sunriseFour) {
        sunriseAnimations();
        displayInfoToUser(timeForSunrise);
      }
      // If time is between sunrise and sunset
      else {
        // Add classes to elements to do css animations
        sun.className = "do-move-down";
        htmlElement.className = "do-sunset-color-fade";
        presentationText = "The sun will set ";
        displayInfoToUser(timeForSunset); // Changes text in elements
      }
      
    }

    /**
     * Format the API results in to strings to be displayed for user
     * Using global variable apiAnswer
     *
     * @param string, "sunrise" if you want sunset results and "sunset" if you want sunset
     *
     * @return string, containing time in format "00:00 AM/PM"
     *
     */
    function formatOutputStrings(string) {
        var timeInMinutes,
            amOrPm,
            timezoneOffset = today.getTimezoneOffset(),
            timezoneAsString,
            hours,
            minutes,
            timeForOutput,
            timeToWorkWith;
        
        if(string === "sunset") {
          timeToWorkWith = apiAnswer.results.sunset; // Time of sunset, format 00:00:00 AM/PM
        }
        else if(string === "sunrise") {
          timeToWorkWith = apiAnswer.results.sunrise; // Time of sunrise, format 00:00:00 AM/PM
        }

        // Save either string "AM" or "PM" from api answer
        amOrPm = timeToWorkWith.substr(timeToWorkWith.length - 2);

        // Remove last three characters (space and AM or PM)
        timeToWorkWith = timeToWorkWith.substring(0, timeToWorkWith.length - 3);

        // Make api answer in to array and add the hours and minutes together in form of minutes
        timeToWorkWith = timeToWorkWith.split(":");

        // If the seconds are greater than 30, round up an extra minute
        if (parseInt(timeToWorkWith[2]) > 29) {
            timeToWorkWith[1] = parseInt(timeToWorkWith[1]) + 1;
        }

        // Get the total amount of minutes of time given from API
        timeInMinutes = parseInt(timeToWorkWith[0] * 60) + parseInt(timeToWorkWith[1]);

        // If api answer was PM, add 720 minutes (12 hours) to timeInMinutes
        if (amOrPm === "PM") {
            timeInMinutes = timeInMinutes + 720;
        }

        // Adjust time in minutes with timezone
        if (timezoneOffset > 0) {
            // Subtract the negative timezone offset
            timeInMinutes -= timezoneOffset;
        }
        else if (timezoneOffset < 0) {
            // Timezone ahead of UTC is given as a negative int
            // First make it in to string, then remove subtraction char, then make it back to int
            timezoneAsString = String(timezoneOffset);
            timezoneAsString = timezoneAsString.substring(1, timezoneAsString.length);
            timezoneOffset = parseInt(timezoneAsString);

            // Add the positive timezone offset to the time in minutes
            timeInMinutes += timezoneOffset;
        }
        
        // If timeInMinutes is more than 24 hrs, remove 24 hrs of time in minutes
        if(timeInMinutes > 1440) {
          timeInMinutes = (timeInMinutes - 1440);
        }

        // Convert timeInMinutes back to 12 hour clock
        hours = parseInt(timeInMinutes / 60);
        minutes = timeInMinutes - (hours * 60);

        // To make sure minutes are always displayed as two characters :00-style
        if (minutes < 10) {
            minutes = "0" + String(minutes);
        }

        // Adjust to 12 hour clock, make it in to string for output
        if (hours > 12) {
            hours = hours - 12;

            timeForOutput = hours + ":" + minutes + " PM";
        }
        else {
            timeForOutput = hours + ":" + minutes + " AM";
        }

        return timeForOutput;
    };
    
    /**
     * Does animations for sunrise and changes text
     *
     */
    function sunriseAnimations() {
      // Add classes to elements to do css animations
      sun.className = "do-move-up";
      htmlElement.className = "do-sunrise-color-fade";
      presentationText = "The sun will rise";
    }

    /**
     * Change elements to display the time and location in the proper formats
     *
     * @param string
     *
     */
    function displayInfoToUser(time) {
      var textContainer = document.getElementById("text-in-box"),
          timeParagraph = document.getElementById("loader-and-result"),
          locationParagraph = document.getElementById("city-country");

      textContainer.textContent = presentationText;
      timeParagraph.textContent = time;
      locationParagraph.textContent = googleApiAnswer;
    };
    
    /**
     * Converts a string with time info in to a four digit string
     *
     * @params string, formats "00:00" and "00:00 AM/PM" tested
     *
     * @return string, format "0000"
     *
     */
    function convertTimeToFourDigitString(time) {
      var amOrPm,
          hours,
          minutes;
      
      if(time.length > 5) {
        // Set variable to either AM or PM depending on last two characters of string
        amOrPm = time.substr(time.length - 2);
        
        // Remove last three characters (space and AM or PM)
        time = time.substring(0, time.length - 3);
      }
      
      // Make in to array with hours and minutes being one value each
      time = time.split(":");
      
      hours = parseInt(time[0]);
      
      if(amOrPm === "PM") {
        hours = hours + 12;
      }
      
      hours = addAZeroIfLessThanTen(hours);
      
      minutes = parseInt(time[1]);
      minutes = addAZeroIfLessThanTen(minutes);
      
      time = hours + "" + minutes;
      
      return time;
      
    }
    
    /**
     * Takes an integer or string and checks it is less than ten, concatenates number to a "0" if true
     *
     * @params string/integer
     *
     * @return string/integer
     *
     */
    function addAZeroIfLessThanTen(number) {
      number = parseInt(number);
      if(number < 10) {
        return "0" + number;
      }
      else {
        return number;
      }
    }

    init();

})();