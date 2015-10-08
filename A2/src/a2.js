'use strict';

$(document).ready(function(){

  gameEngine = initGameEngine(controlParameters.gridLength.defaultValue);
  renderDefaultControlAndGrid();

  // debug - running
  // fillGridWithRandomValue();
  // gameEngine.isRunning = true;
  // startAutoStep();

  // debug - one step
  fillGridWithRandomValue();
  oneStep();

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
    if (param.type=='range') {
      html += '<td><input type="range" name="'+param.name+'" min="'+param.min+'" max="'+param.max+'" value="'+paramValue+'"></td>';
    } else if (param.type=='dropdown') {
      html += '<td><select name="'+param.name+'">';
      for (var optionKey in param.options) {
        html += '<option>'+param.options[optionKey]+'</option>';
      }
      html += '</select></td>';
    }
    html += '<td>'+paramValue+'</td>';
    html += '<tr>';
    control.append(html);
  });

  $('.control').on('input change', function(event) {
    // console.log($(this));
    // console.log(event.target.nodeName);
    handlerForControl(event.target);
  });
  $('.control button').click(function(event) {
    // console.log($(this));
    // console.log(event.target.nodeName);
    handlerForControl(event.target);
  });

};

var handlerForControl = function(target) {
  console.log(target);
  if (target.nodeName=='INPUT') {
    updateControlParameters(target);
  } else if (target.nodeName=='SELECT') {
    updateControlParameters(target);
  } else if (target.nodeName=='BUTTON') {
    updateGameEngine($(target).attr('name'), 1);
  }
};

var updateControlParameters = function(target) {
  $(target).parent().next().html($(target).val());

  // Update controlParameters
  var newValue = (target.nodeName=='INPUT') ? parseInt($(target).val(), 10) : $(target).val();
  var updatedParam = $(target).attr('name');
  controlParameters[updatedParam].currentValue = newValue;
  // Update Game engine if parameters are valid
  if (isValidControlParameter()) {
    updateGameEngine(updatedParam, newValue);
  }
};

var isValidControlParameter = function() {
  return true;
};

var updateGameEngine = function(updatedParam, newValue) {
  // Stop if needed
  if (gameEngine.isRunning) {
    console.log('pause before updateGameEngine');
    stopRunning();
  }

  // Update value
  // Need to stop everything and re-render grid if the gridLength is changed
  console.log('updatedParam: '+updatedParam+'; newValue: '+newValue);
  switch(updatedParam) {
    case 'gridLength':
      renderGrid(newValue, true);
      console.log('finished render');
      break;
    case 'renderInterval':
    case 'radius':
    case 'lonliness':
    case 'overpolulation':
    case 'gmin':
    case 'gmax':
      controlParameters[updatedParam].currentValue = newValue;
      break;
    case 'edgeNeighbor':
      fillEdgesOfBuffer(gameEngine.gridBuffer.cur);
      break;
    case 'start':
      startAutoStep();
      break;
    case 'stop':
      gameEngine.isRunning = false;
      stopRunning();
      break;
    case 'step':
      oneStep();
      break;
    // case 'reset':
    //   resetAll();
    //   break;
    case 'random':
      fillGridWithRandomValue();
      break;
    default:
      console.log('Unrecognized updatedParam!!');
  }

  // Re-start if needed
  if (gameEngine.isRunning) {
    console.log('restart after updateGameEngine');
    startAutoStep();
  }
};

var renderGrid = function(gridLength, isDefault) {
  // Update gameEngine variable;
  console.log(gameEngine);

  // Update UI
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

var fillGridWithRandomValue = function() {
  for (var i = 1; i <= controlParameters.gridLength.currentValue; i++) {
    for (var j = 1; j <= controlParameters.gridLength.currentValue; j++) {
      gameEngine.gridBuffer.cur[i][j] = randomNumberFor1Or0();
    }
  }
};

var randomNumberFor1Or0 = function() {
  return Math.round(Math.random());
};

var startAutoStep = function() {
  stopRunning();
  console.log('startAutoStep with controlParameters: ');
  console.log(controlParameters);
  gameEngine.autoStep =  setInterval(function() {
    oneStep();
  }, controlParameters.renderInterval.currentValue);
};

var oneStep = function() {
  // console.log(JSON.stringify(gameEngine.gridBuffer.cur));
  if (controlParameters.edgeNeighbor.currentValue=='toroidal') {
    fillEdgesOfBuffer(gameEngine.gridBuffer.cur);
  }
  gameEngine.gridBuffer.prev = $.extend(true, [], gameEngine.gridBuffer.cur);
  console.log(JSON.stringify(gameEngine.gridBuffer.prev));


};

var fillEdgesOfBuffer = function(buffer) {
  var edgeType = controlParameters.edgeNeighbor.currentValue;
  var matrixEnd = controlParameters.gridLength.currentValue+1;
  if (edgeType=='live') {
    fillBufferEdgeWithValue(buffer, 1);
  } else if (edgeType=='dead') {
    fillBufferEdgeWithValue(buffer, 0);
  } else if (edgeType=='toroidal') {

  }
};

var fillBufferEdgeWithValue = function(buffer, value) {
  var matrixEnd = controlParameters.gridLength.currentValue+1;
  // Fill left and right
  for (var i = 0; i <= matrixEnd; i++) {
    buffer[i][0] = value;
    buffer[i][matrixEnd] = value;
  }
  // Fill top and bottom
  for (var j = 1; j <= matrixEnd-1; j++) {
    buffer[0][j] = value;
    buffer[matrixEnd][j] = value;
  }
};

var stopRunning = function() {
  clearInterval(gameEngine.autoStep);
};




//////////////////////////////////////////////////////////////////////////////////////////////////////////
// Data functions
//////////////////////////////////////////////////////////////////////////////////////////////////////////

var initGameEngine = function(size) {
  var engine = {
    isRunning: false,
    autoStep: null,
    gridBuffer: {
      prev: matrixWithSize(size+2),
      cur: matrixWithSize(size+2),
    },
  };
  fillEdgesOfBuffer(engine.gridBuffer.cur);
  return engine;
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////
// Data
//////////////////////////////////////////////////////////////////////////////////////////////////////////

var gameEngine;

var controlParameters = {
  gridLength: {
    name: 'gridLength',
    nameDisplay: 'Grid Length',
    type: 'range',
    defaultValue: 20,
    currentValue: 20,
    min: 20,
    max: 200,
  },
  renderInterval: {
    name: 'renderInterval',
    nameDisplay: 'Render Speed',
    type: 'range',
    defaultValue: 800,
    currentValue: 800,
    min: 0,
    max: 1000,
  },
  radius: {
    name: 'radius',
    nameDisplay: 'Neighbor Radius',
    type: 'range',
    defaultValue: 2,
    currentValue: 2,
    min: 1,
    max: 10,
  },
  lonliness: {
    name: 'lonliness',
    nameDisplay: 'Cell Lonliness',
    type: 'range',
    defaultValue: 0,
    currentValue: 0,
    min: 0,
    max: 10,
  },
  overpolulation: {
    name: 'overpolulation',
    nameDisplay: 'Overpopulation Threshhold',
    type: 'range',
    defaultValue: 7,
    currentValue: 7,
    min: 0,
    max: 10,
  },
  gmin: {
    name: 'gmin',
    nameDisplay: 'Gmin',
    type: 'range',
    defaultValue: 2,
    currentValue: 2,
    min: 0,
    max: 10,
  },
  gmax: {
    name: 'gmax',
    nameDisplay: 'Gmax',
    type: 'range',
    defaultValue: 3,
    currentValue: 3,
    min: 0,
    max: 10,
  },
  edgeNeighbor: {
    name: 'edgeNeighbor',
    nameDisplay: 'Edge Neighbor',
    type: 'dropdown',
    defaultValue: 'live',
    currentValue: 'live',
    options: {
      1: 'live',
      2: 'dead',
      3: 'toroidal',
    },
  },
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////
// Helper Functions
//////////////////////////////////////////////////////////////////////////////////////////////////////////

var matrixWithSize = function(size) {
  var arr = new Array(size);
  for (var i = 0; i < size; i++) {
    arr[i] = Array.apply(null, Array(size)).map(Number.prototype.valueOf,0);
  }
  return arr;
};


