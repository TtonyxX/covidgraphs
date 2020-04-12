import _ from 'lodash';
import * as moment from 'moment';
var Chart = require('chart.js');

Chart.defaults.global.defaultFontFamily = 'Roboto';

jQuery.ajaxPrefilter(function(options) {
  if (options.crossDomain && jQuery.support.cors) {
      options.url = 'https://cors-anywhere.herokuapp.com/' + options.url;
  }
});

// search.js

let states = ["Alaska",
"Alabama",
"Arkansas",
"American Samoa",
"Arizona",
"California",
"Colorado",
"Connecticut",
"District of Columbia",
"Delaware",
"Florida",
"Georgia",
"Guam",
"Hawaii",
"Iowa",
"Idaho",
"Illinois",
"Indiana",
"Kansas",
"Kentucky",
"Louisiana",
"Massachusetts",
"Maryland",
"Maine",
"Michigan",
"Minnesota",
"Missouri",
"Mississippi",
"Montana",
"North Carolina",
"North Dakota",
"Nebraska",
"New Hampshire",
"New Jersey",
"New Mexico",
"Nevada",
"New York",
"Ohio",
"Oklahoma",
"Oregon",
"Pennsylvania",
"Puerto Rico",
"Rhode Island",
"South Carolina",
"South Dakota",
"Tennessee",
"Texas",
"Utah",
"Virginia",
"Virgin Islands",
"Vermont",
"Washington",
"Wisconsin",
"West Virginia",
"Wyoming"]

let statesLower = [];
for(let i=0; i<states.length; i++) {
    statesLower.push(states[i].toLowerCase());
}

let statesAb = [ "AK",
                    "AL",
                    "AR",
                    "AS",
                    "AZ",
                    "CA",
                    "CO",
                    "CT",
                    "DC",
                    "DE",
                    "FL",
                    "GA",
                    "GU",
                    "HI",
                    "IA",
                    "ID",
                    "IL",
                    "IN",
                    "KS",
                    "KY",
                    "LA",
                    "MA",
                    "MD",
                    "ME",
                    "MI",
                    "MN",
                    "MO",
                    "MS",
                    "MT",
                    "NC",
                    "ND",
                    "NE",
                    "NH",
                    "NJ",
                    "NM",
                    "NV",
                    "NY",
                    "OH",
                    "OK",
                    "OR",
                    "PA",
                    "PR",
                    "RI",
                    "SC",
                    "SD",
                    "TN",
                    "TX",
                    "UT",
                    "VA",
                    "VI",
                    "VT",
                    "WA",
                    "WI",
                    "WV",
                    "WY"]

function getVal(search) {
  if(isState(search)) {
    return statesAb[statesLower.indexOf(search.toLowerCase())];
  } else if(countries.indexOf(search) >= 0) {
    return search;
  } else {
    return "invalid";
  }
}

function isState(state) {
  if(statesLower.indexOf(state.toLowerCase()) >= 0 || statesAb.indexOf(state) >= 0) {
    return true;
  } else {
    return false;
  }
}

var countries = [];

$.ajax({
  url: "https://pomber.github.io/covid19/timeseries.json", 
  success: function(result){
    countries = Object.keys(result);
  }
});

// Main App

var casesctx = document.getElementById('casesChart').getContext('2d');
var deathsctx = document.getElementById('deathsChart').getContext('2d');
var testedctx = document.getElementById('testedChart').getContext('2d');
var casesData, deathsData, testedData;
var timeFormat = 'MM/DD/YYYY';

function newDate(days) {
  return moment().subtract(days, 'd').toDate();
}

function newDateString(sec) {
  return moment().subtract(sec, 's').format(timeFormat);
}

var yType = 'linear';
var invalidPage = false;

loadPage(true);

function loadPage(linear) {
  yType = linear ? 'linear' : 'logarithmic';
  const urlParams = new URLSearchParams(window.location.search);
  const myParam = urlParams.get('search');
  if(getVal(myParam) == 'invalid') {
    invalidPage = true;
    return;
  }
  if(isState(myParam)) {
    $.ajax({
      url: "http://coronavirusapi.com/getTimeSeries/" + myParam, 
      success: function(result){
        casesData = parseData(result, 2);
        deathsData = parseData(result, 3);
        testedData = parseData(result, 1);
        window.casesChart = createGraph(casesctx, casesData, "Cases", "#ff9498");
        window.deathsChart = createGraph(deathsctx, deathsData, "Deaths", "#bdbdbd");
        window.testedChart = createGraph(testedctx, testedData, "Tested", "#4fc3f7");
        fillTable(casesData, deathsData, testedData);
        $("#display-items").fadeIn();
      }
    });
  } else {
    $.ajax({
      url: "https://pomber.github.io/covid19/timeseries.json", 
      success: function(result){
        countries = Object.keys(result);
        casesData = parseDataCountry(result[myParam], "confirmed");
        deathsData = parseDataCountry(result[myParam], "deaths");
        testedData = parseDataCountry(result[myParam], "recovered");
        window.casesChart = createGraph(casesctx, casesData, "Cases", "#ff9498");
        window.deathsChart = createGraph(deathsctx, deathsData, "Deaths", "#bdbdbd");
        window.recoveredChart = createGraph(testedctx, testedData, "Recovered", "#4caf50");
        fillTable(deathsData, testedData, casesData);
        $("#display-items").fadeIn();
      }
    });
  }
}


function fillTable(cases, deaths, tested) {
  for(let i=cases.length-1; i>=0; i--) {
    $("#data-body").html($("#data-body").html() + "<tr><td>" + cases[i].x + "</td><td>" + tested[i].y + "</td><td>" + cases[i].y + "</td><td>" + deaths[i].y + "</td></tr>");
  }
}

function parseData(result, index) {
  const data = result.split("\n");
  var prevDate = newDateString(0);
  let i;
  for(i=1; i<data.length; i++) {
    data[i] = data[i].split(",");
    var beforetime = Math.round(Date.now() / 1000) - parseInt(data[i][0]);
    data[i][0] = newDateString(beforetime);
    if(prevDate == data[i][0]) {
      data.splice(i-1, 1);
      i--;
    }
    data[i] = {
      x: data[i][0],
      y: data[i][index]
    }
    prevDate = data[i].x;
  }
  data.shift()
  return data;
}

function parseDataCountry(result, prop) {
  var data = [];
  for(let i=0; i<result.length; i++) {
    var dateArray = result[i].date.split("-");
    var date = new Date(parseInt(dateArray[0]), parseInt(dateArray[1])-1, parseInt(dateArray[2]));
    data.push({
      x: date.toLocaleDateString(),
      y: result[i][prop]
    });
  }
  return data;
}

function createGraph(canvas, graphData, name, linecolor) {
  var color = Chart.helpers.color;
  var colorFont = "#adadad";
  var config = {
    type: 'line',
    data: {
      labels: [ 
        newDate(6),
        newDate(5),
        newDate(4),
        newDate(3),
        newDate(2),
        newDate(1),
        newDate(0)
      ],
      datasets: [{
        label: name,
        backgroundColor: color(linecolor).alpha(0.5).rgbString(),
        borderColor: linecolor,
        fill: false,
        data: graphData,
      }]
    },
    options: {
      title: {
        text: 'COVID-19'
      },
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            unit: 'day',
            parser: timeFormat,
            tooltipFormat: 'll'
          },
          scaleLabel: {
            display: true,
            labelString: 'Date',
            fontColor: colorFont
          },
          gridLines: {
            display: true
          },
          ticks: {
            fontColor: colorFont
          }
        }],
        yAxes: [{
					type: yType,
          scaleLabel: {
            display: true,
            labelString: 'Number of ' + name,
            fontColor: colorFont
          },
          gridLines: {
            display: true
          },
          ticks: {
            fontColor: colorFont
          }
        }]
      },
      legend: {
        display: false
      },
      hover: {
        mode: 'nearest',
        intersect: true
      },
    }
  };
  return new Chart(canvas, config);
}

// Inside page js

if(window.location.pathname.includes("chart")) {
  const urlParams = new URLSearchParams(window.location.search);
  const myParam = urlParams.get('search');
  if(isState(myParam)) {
    $("#title").html("<strong>" + states[statesAb.indexOf(myParam.toUpperCase())] + "</strong>");
  } else if(invalidPage) {
    $("#title").html("<strong>" + myParam + "</strong> <span style='color: #ff5252;'>is not a valid query</span>");
    $("#log-btn").hide();
  } else {
    $("#title").html("<strong>" + myParam + "</strong>");
    $("#title-tested").html("Recovered Over Time");
    $("#tested-table").html("Positive");
    $("#positive-table").html("Deaths");
    $("#deaths-table").html("Recovered");
  }
  
  $("#share-btn").click(() => {
    $("#share-btn").fadeOut(function() {
      $("#share-options").fadeIn().css("display", "inline-block");
    });
  })

  $("#back-btn").click(() => {
    if(window.location.hostname == "localhost") {
      window.location.href = "http://localhost:8080";
    } else if(window.location.hostname == "covidgraphs-b7c17.firebaseapp.com") {
      window.location.href = "https://covidgraphs-b7c17.firebaseapp.com";
    } else {
      window.location.href = "http://covidgraphs.ga";
    }
  });

  $("#log-btn").click(() => {
    if(yType=='linear') {
      loadPage(false);
      $("#log-btn").html('Logarithmic');
    } else {
      loadPage(true);
      $("#log-btn").html('Linear');
    }
  });
} 
