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
    window.casesChart = createGraph(casesctx, casesData);
    window.casesChart = createGraph(deathsctx, deathsData);
    window.casesChart = createGraph(testedctx, testedData);
  }
});

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

function createGraph(canvas, graphData) {
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
        label: 'Cases',
        backgroundColor: color("#ff9498").alpha(0.5).rgbString(),
        borderColor: "#ff9498",
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
            labelString: 'Number of Cases',
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

function randomScalingFactor() {
  return Math.floor(Math.random() * 30);
}