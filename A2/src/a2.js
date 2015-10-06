'use strict';

var module = angular.module('app', []);
module.controller('container', function($scope) {
  $scope.params = {
    gridLength: {
      value: 10,
      min: 20,
      max: 200,
    },
    redrawInterval: {
      value: 0,
      min: 0,
      max: 1000,
    },
    radiu: {
      value: 2,
      min: 1,
      max: 10,
    },
    lonliness: {
      value: 0,
      min: 0,
      max: 10,
    },
    overpolulation: {
      value: 7,
      min: 0,
      max: 10,
    },
    gmin: {
      value: 2,
      min: 0,
      max: 10,
    },
    gmax: {
      value: 3,
      min: 0,
      max: 10,
    },
  };
  $scope.range = function(num) {
    var foo = [];
    for (var i = 1; i <= num; i++) {
        foo.push(i);
    }
    return foo;
  };

});

module.directive('displayTable', function($window) {
  return {

  }
}







// alert('sdflk');


$(document).ready(function(){
  console.log('It works...');
  var viewPort = $('.display');
  var viewPortHeight = viewPort.height();
  var viewPortWidth = viewPort.width();
  var viewPortSize = Math.min(viewPortHeight, viewPortWidth);
  var tableSize = viewPortSize*0.9;
  // var cellSize =

  // Center the table
  var tableMarginTop = Math.round( (viewPortHeight - tableSize) / 2 );
  $('.display table').css('margin-top', tableMarginTop);

  // Adjust cell size
  $('.display tr')


});

