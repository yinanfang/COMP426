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
  renderGrid(controlParameters.gridLength.defaultValue);
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
    handlerForControlUpdate(event.target);
  });
  $('.control button').click(function(event) {
    // console.log($(this));
    // console.log(event.target.nodeName);
    handlerForControlUpdate(event.target);
  });

};

var handlerForControlUpdate = function(target) {
  console.log(target);
  if (target.nodeName=='INPUT'||target.nodeName=='SELECT') {
    // Update Game engine if parameters are valid
    if (isValidControlParameter()) {
      $(target).parent().next().html($(target).val());
      // Update controlParameters
      var newValue = (target.nodeName=='INPUT') ? parseInt($(target).val(), 10) : $(target).val();
      var updatedParam = $(target).attr('name');
      controlParameters[updatedParam].currentValue = newValue;

      updateGameEngine(gameEngineControlUpdateProcedure(updatedParam, newValue));
    }
  } else if (target.nodeName=='BUTTON') {
    updateGameEngine(gameEngineControlUpdateProcedure($(target).attr('name'), 1));
  }
};

var isValidControlParameter = function() {
  return true;
};

var gameEngineControlUpdateProcedure = function(updatedParam, newValue) {
  return function() {
    // Update value
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
      case 'edgeNeighbor':
        controlParameters[updatedParam].currentValue = newValue;
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
      case 'reset':
        resetAll();
        break;
      case 'random':
        fillGridWithRandomValue();
        break;
      default:
        console.log('Unrecognized updatedParam!!');
    }
  };
};

var renderGrid = function(gridLength) {
  // Update gameEngine variable;
  console.log('Rendering grid with gameEngine');
  gameEngine.gridBuffer={
    ever: matrixWithSize(gridLength),
    prev: matrixWithSize(gridLength),
    cur: matrixWithSize(gridLength),
  };
  console.log(gameEngine);

  // Update UI
  $('.grid tbody').empty();
  var grid = $('.grid tbody');
  var html;
  for (var i = 0; i < gridLength; i++) {
    html += '<tr>';
    for (var j = 0; j < gridLength; j++) {
      // check isDefault -> class never, on?
      html += '<td class="never" row="'+i+'" col="'+j+'"></td>';
    }
    html += '</tr>';
  }
  grid.append(html);

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

  $('.grid td').click(function(event) {
    console.log(event.target.getAttribute('row'));
    console.log(event.target.getAttribute('col'));
    var row = event.target.getAttribute('row');
    var col = event.target.getAttribute('col');
    updateGameEngine(gameEngineGridUpdateProcedure(row, col));
        // updateGameEngine(gameEngineControlUpdateProcedure($(target).attr('name'), 1));

    // console.log($(this));
    // console.log(event.target.nodeName);
    // handlerForControlUpdate(event.target);
  });
};

var gameEngineGridUpdateProcedure = function(i, j) {
  return function() {
    toggleCellState(i, j);
  };
};

var updateGameEngine = function(updatedProcedure) {
  // Stop if needed
  if (gameEngine.isRunning) {
    console.log('pause before updateGameEngine');
    stopRunning();
  }

  updatedProcedure();

  // Re-start if needed
  if (gameEngine.isRunning) {
    console.log('restart after updateGameEngine');
    startAutoStep();
  }
};

var resetAll = function() {
  $.each(controlParameters, function(key1, param) {
    param.currentValue = param.defaultValue;
    var element;
    if (param.type=='range') {
      element = $('input[name='+param.name+']');
    } else if (param.type=='dropdown') {
      element = $('select[name='+param.name+']');
    }
    element.val(param.defaultValue);
    element.parent().next().html(param.defaultValue);
  });
  var gridLength = controlParameters.gridLength.defaultValue;
  var wasRunningBeforeReset = gameEngine.isRunning;
  // console.log('wasRunningBeforeReset'+wasRunningBeforeReset);
  gameEngine = initGameEngine(gridLength);
  gameEngine.isRunning = wasRunningBeforeReset;
  // console.log('after'+gameEngine.isRunning);

  // Reset UI
  renderGrid(gridLength);
};

var fillGridWithRandomValue = function() {
  console.log('fillGridWithRandomValue');
  console.log(JSON.stringify(gameEngine.gridBuffer.cur));
  console.log(controlParameters.gridLength.currentValue);
  // console
  for (var i = 0; i < controlParameters.gridLength.currentValue; i++) {
    for (var j = 0; j < controlParameters.gridLength.currentValue; j++) {
      var alive = randomNumberFor1Or0();
      setCellState(i, j, alive);
      // gameEngine.gridBuffer.cur[i][j] = alive;
    }
  }
  console.log(JSON.stringify(gameEngine.gridBuffer.cur));
};

var randomNumberFor1Or0 = function() {
  return Math.round(Math.random());
};

var startAutoStep = function() {
  stopRunning();
  console.log('startAutoStep with controlParameters: ');
  gameEngine.isRunning = true;
  console.log(controlParameters);
  gameEngine.autoStep =  setInterval(function() {
    oneStep();
  }, controlParameters.renderInterval.currentValue);
};

var oneStep = function() {
  var bufferPre = gameEngine.gridBuffer.pre;
  var bufferCur = gameEngine.gridBuffer.cur;
  var matrixLength = controlParameters.gridLength.currentValue;
  var radius = controlParameters.radius.currentValue;

  console.log(matrixLength);
  console.log(radius);


  // console.log(JSON.stringify(gameEngine.gridBuffer.cur));
  // console.log(JSON.stringify(gameEngine.gridBuffer.ever));

  // Copy the matrix cur to prev
  bufferPre = $.extend(true, [], bufferCur);
  // console.log('loging bufferPre');
  // console.log(JSON.stringify(bufferPre));

  // Update cur and ever according to prev
  for (var i = 0; i < matrixLength; i++) {
    for (var j = 0; j < matrixLength; j++) {
      // console.log('i='+i+'; j='+j+'; radius='+radius);
      var isAlive = isCellAlive(bufferPre, i, j, radius);
      setCellState(i, j, isAlive);
    }
  }
  console.log(JSON.stringify(gameEngine.gridBuffer.cur));
  console.log(JSON.stringify(gameEngine.gridBuffer.ever));
};

var toggleCellState = function(i, j) {
  var alive = gameEngine.gridBuffer.cur[i][j] ? 0 : 1;
  console.log('toggleCellState: '+alive);
  setCellState(i, j, alive);
};

var setCellState = function(i, j, isAlive) {
  gameEngine.gridBuffer.cur[i][j] = isAlive;
  addOnOffBackgroundByState(i, j, isAlive);

  if (isAlive) {
    gameEngine.gridBuffer.ever[i][j] = isAlive;
  }
};

var addOnOffBackgroundByState = function(i, j, isAlive) {
  // console.log('addOnOffBackgroundByState'+isAlive);
  var element = $('.grid td[row="'+i+'"][col="'+j+'"]');
  if (isAlive) {
    element.removeClass('never');
    element.addClass('ever on');
    // element.html('g');
  } else {
    element.removeClass('on');
    // element.html('n');
  }
};

var isCellAlive = function(buffer, i, j, radius) {
  // console.log('isCellAlive');
  var over = controlParameters.overpolulation.currentValue;
  var lonly = controlParameters.lonliness.currentValue;
  var count = countOfNeighbor(buffer, i, j, radius);
  if (buffer[i][j]==1) {
    return (count>=lonly&&count<=over) ? 1 : 0;
  } else {
    return (count>=controlParameters.gmin.currentValue&&count<=controlParameters.gmax.currentValue) ? 1 : 0;
  }
};


var countOfNeighbor = function(buffer, i, j, radius) {
  // console.log('countOfNeighbor>>i='+i+'; j='+j+'; radius='+radius+'; i-radius='+(i-radius)+'; i+radius='+(i+radius)+'; j-radius='+(j-radius)+'; j-radius='+(j+radius));

  var count = 0;
  if(radius==0) {
    return count;
  }
  // Count square
  for (var m = i-radius; m <= i+radius; m++) {
    for (var n = j-radius; n <= j+radius; n++) {
      // console.log('m='+m+'; n='+n);
      count = valueInBuffer(buffer, m, n) ? count+1 : count;
      // if (i==19) {
      //   console.log('m='+m+'; n='+n+'; valueInBuffer='+valueInBuffer(buffer, m, n));
      // }
    }
  }
  // Minue itself
  if (valueInBuffer(buffer, i, j)==1) {
    count--;
  }

  // console.log(count);
  return count;

  // // Count top and bottom
  // for (var m = j-radius; m <= j+radius; m++) {
  //   count = valueInBuffer(buffer, i-radius, m) ? count+1 : count;
  //   count = valueInBuffer(buffer, i+radius, m) ? count+1 : count;
  // }
  // // Count left and right
  // for (var n = j-radius+1; n <= j+radius-1; n++) {
  //   count = valueInBuffer(buffer, n, i-radius) ? count+1 : count;
  //   count = valueInBuffer(buffer, n, i+radius) ? count+1 : count;
  // }
  // return count;
};

var valueInBuffer = function(buffer, i, j) {
  var matrixLength = controlParameters.gridLength.currentValue;
  var edge = controlParameters.edgeNeighbor.currentValue;
  if (i>=0&&i<matrixLength && j>=0&&j<matrixLength) {
    return buffer[i][j];
  } else if (edge=='live') {
    return 1;
  } else if (edge=='dead') {
    return 0;
  } else if (edge=='toroidal') {
    if (i<0||i>=matrixLength) {
      i = i<0 ? matrixLength+i : i-matrixLength;
    }
    if (j<0||j>=matrixLength) {
      j = j<0 ? matrixLength+j : j-matrixLength;
    }
    return buffer[i][j];
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
      ever: matrixWithSize(size),
      prev: matrixWithSize(size),
      cur: matrixWithSize(size),
    },
  };
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
    defaultValue: 1,
    currentValue: 1,
    min: 1,
    max: 10,
  },
  lonliness: {
    name: 'lonliness',
    nameDisplay: 'Cell Lonliness',
    type: 'range',
    defaultValue: 2,
    currentValue: 2,
    min: 0,
    max: 10,
  },
  overpolulation: {
    name: 'overpolulation',
    nameDisplay: 'Overpopulation Threshhold',
    type: 'range',
    defaultValue: 3,
    currentValue: 3,
    min: 0,
    max: 10,
  },
  gmin: {
    name: 'gmin',
    nameDisplay: 'Gmin',
    type: 'range',
    defaultValue: 3,
    currentValue: 3,
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
    defaultValue: 'dead',
    currentValue: 'dead',
    options: {
      1: 'dead',
      2: 'live',
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


