import _ from 'lodash';
import * as moment from 'moment';
var Chart = require('chart.js');

Chart.defaults.global.defaultFontFamily = 'Roboto';

jQuery.ajaxPrefilter(function(options) {
  if (options.crossDomain && jQuery.support.cors) {
      options.url = 'https://cors-anywhere.herokuapp.com/' + options.url;
  }
});

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

const urlParams = new URLSearchParams(window.location.search);
const myParam = urlParams.get('state');

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

function fillTable(cases, deaths, tested) {
  for(let i=cases.length-1; i>=0; i--) {
    $("#data-body").html($("#data-body").html() + "<tr><td>" + cases[i].x + "</td><td>" + cases[i].y + "</td><td>" + tested[i].y + "</td><td>" + deaths[i].y + "</td></tr>");
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

$.ajax({
  url: "https://pomber.github.io/covid19/timeseries.json", 
  success: function(result){
    alert(result['Canada'][0].date);
  }
});