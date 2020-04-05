import _ from 'lodash';
import * as moment from 'moment';
var Chart = require('chart.js');

jQuery.ajaxPrefilter(function(options) {
  if (options.crossDomain && jQuery.support.cors) {
      options.url = 'https://cors-anywhere.herokuapp.com/' + options.url;
  }
});

var ctx = document.getElementById('myChart').getContext('2d');
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
    createGraph(parseData(result));
  }
});

function parseData(result) {
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
      y: data[i][2]
    }
    prevDate = data[i].x;
  }
  data.shift()
  return data;
}

function createGraph(graphData) {
  var color = Chart.helpers.color;
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
        label: 'Dataset with point data',
        backgroundColor: color("green").alpha(0.5).rgbString(),
        borderColor: "green",
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
            labelString: 'Date'
          }
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Number of cases'
          }
        }]
      },
      legend: {
        display: false
      }
    }
  };
  window.myLine = new Chart(ctx, config);
}

function randomScalingFactor() {
  return Math.floor(Math.random() * 100)
}
    
function component() {
    const element = document.createElement('div');

    element.innerHTML = _.join(['Hello', 'webpack'], ' ');

    return element;
}

$(document).ready(function(){
  $('.tabs').tabs();
});

document.body.appendChild(component());