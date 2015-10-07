'use strict';

$(document).ready(function(){

  renderDefaultControlAndGrid();

});

var renderDefaultControlAndGrid = function() {
  // Initial rendering for control and grid
  var shouldRenderDefaultView = true;
  renderControl(controlParameters, shouldRenderDefaultView);
  renderGrid(controlParameters.gridLength.defaultValue, shouldRenderDefaultView);

  // Re-position and align the table
  var gridViewPort = $('.grid');
  var gridViewPortHeight = gridViewPort.height();
  var gridViewPortWidth = gridViewPort.width();
  var gridViewPortSize = Math.min(gridViewPortHeight, gridViewPortWidth);
  var tableSize = gridViewPortSize*0.9;
  var tableMarginTop = Math.round((gridViewPortHeight - tableSize)/2);
  $('.grid table').css('height', tableSize);
  $('.grid table').css('width', tableSize);
  $('.grid table').css('margin-top', tableMarginTop);

};

var renderControl = function(controlParameters, isDefault) {
  var control = $('.control tbody');
  $.each(controlParameters, function(key1, param) {
    var paramValue = isDefault ? param.defaultValue : param.currentValue;
    var html;
    html += '<tr>';
    html += '<td>'+param.nameDisplay+':</td>';
    html += '<td></td>';
    html += '</tr>';
    html += '<tr>';
    html += '<td><input type="range" name="'+param.name+'" min="'+param.min+'" max="'+param.max+'" value="'+paramValue+'"></td>';
    html += '<td>'+paramValue+'</td>';
    html += '<tr>';
    control.append(html);
  });

  // Add general onClick listeners to control pannel
  $('.control input').on('mousemove mouseup click', function(event) {
    $(this).parent().next().html($(this).val());

    // Update controlParameters
    var newValue = parseInt($(this).val(), 10);
    var param = $(this).attr('name');
    controlParameters[param].currentValue = newValue;

    // Need to stop everything and re-render grid if the gridLength is changed
    if (param=='gridLength') {
      stopRunning();
      removeGrid();
      renderGrid(newValue, true);
      console.log('finished render');
      return;
    }

    //
    if (stateMachine.isRunning) {
      // Stop Running

      // Update value

      // Start running

    } else if (!stateMachine.isRunning) {
      // Update value

    }
  });
};

var handlerForControl = function() {

};

var updateControlParameters = function(key, value) {

};

var stopRunning = function() {

};

var autoStep = function() {

};

var oneStep = function() {

};

var removeGrid = function() {
};

var renderGrid = function(gridLength, isDefault) {
  $('.grid tbody').empty();
  var grid = $('.grid tbody');
  var html;
  for (var i = 1; i < gridLength+1; i++) {
    html += '<tr>';
    for (var j = 1; j < gridLength+1; j++) {
      // check isDefault -> class never, on?
      html += '<td class="never" row="'+i+'" col="'+j+'"></td>';
    }
    html += '</tr>';
  }
  grid.append(html);
};


//////////////////////////////////////////////////////////////////////////////////////////////////////////
// Data
//////////////////////////////////////////////////////////////////////////////////////////////////////////

var controlButtons;

var stateMachine = {
  isRunning: true,
};

var gridParameters;

var controlParameters = {
  gridLength: {
    name: 'gridLength',
    nameDisplay: 'Grid Length',
    defaultValue: 20,
    currentValue: 20,
    min: 20,
    max: 200,
  },
  renderInterval: {
    name: 'renderInterval',
    nameDisplay: 'Render Speed',
    defaultValue: 10,
    currentValue: 10,
    min: 0,
    max: 1000,
  },
  radius: {
    name: 'radius',
    nameDisplay: 'Neighbor Radius',
    defaultValue: 2,
    currentValue: 2,
    min: 1,
    max: 10,
  },
  lonliness: {
    name: 'lonliness',
    nameDisplay: 'Cell Lonliness',
    defaultValue: 0,
    currentValue: 0,
    min: 0,
    max: 10,
  },
  overpolulation: {
    name: 'overpolulation',
    nameDisplay: 'Overpopulation Threshhold',
    defaultValue: 7,
    currentValue: 7,
    min: 0,
    max: 10,
  },
  gmin: {
    name: 'gmin',
    nameDisplay: 'Gmin',
    defaultValue: 2,
    currentValue: 2,
    min: 0,
    max: 10,
  },
  gmax: {
    name: 'gmax',
    nameDisplay: 'Gmax',
    defaultValue: 3,
    currentValue: 3,
    min: 0,
    max: 10,
  },
};





