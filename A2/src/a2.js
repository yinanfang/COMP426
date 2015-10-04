var module = angular.module('app', []);

module.controller('container', function($scope) {
  $scope.params = {
    gridLength: {
      value: 80,
      min: 20,
      max: 200,
    },
  };
});









// alert('sdflk');


$(document).ready(function(){
  console.log('It works...');
  // alert('test');
  // document.write("Hello, Worlddddsss!");
});

