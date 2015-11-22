'use strict';

var Papa = require('papaparse');
var mysql = require('mysql');
var fs = require('fs');
var crypto = require('crypto');
var async = require('async');

var connection = mysql.createConnection({
  host     : 'classroom.cs.unc.edu',
  user     : 'yinanf',
  password : 'CH@ngemenow99Please!yinanf',
  database : 'yinanfdb',
});

var fileLineCount = 0;
var fileData;

var dict = {
  scoreType: {
    'fieldgoal': {
      id: 1,
      points: 3,
    },
    'passing': {
      id: 2,
      points: 7,
    },
    'rushing': {
      id: 3,
      points: 7,
    },
  },
  team: {},
  player: {},
  scoreEvent: [],
};

runApp();

function runApp() {
  async.waterfall([
    // Truncate existing table except ScoreType
    function(callback) {
      truncateTable('Player', callback);
    },
    function(callback) {
      truncateTable('Team', callback);
    },
    function(callback) {
      truncateTable('ScoreType', callback);
    },
    function(callback) {
      truncateTable('ScoringEvent', callback);
    },
    // Parse file
    function(callback) {
      var inputFile = fs.readFileSync(__dirname + '/a3-data.txt', 'utf8');
      Papa.parse(inputFile, {
        header: true,
        delimiter: ' ',
        skipEmptyLines: true,
        complete: function(results) {
          fileData = results.data;
          fileLineCount = fileData.length;
          // console.log(fileData);
          console.log('Parse input line total:', fileLineCount);
          callback(null);
        },
      });
    },
    // Build dictionary
    function(callback) {
      // Build team dict
      console.log('building team dict');
      var teamCount = 1;
      for (var i = 0; i < fileLineCount; i++) {
        if (!dict.team[fileData[i]['TeamName']]) {
          dict.team[fileData[i]['TeamName']] = teamCount++;
        }
      }

      console.log('building player dict');
      var playerCount = 1;
      for (var j = 0; j < fileLineCount; j++) {
        var teamID = dict.team[fileData[j]['TeamName']];
        var player1 = fileData[j]['FirstName']+' '+fileData[j]['LastName'];
        var player2 = fileData[j]['QFirstName']+' '+fileData[j]['QLastName'];
        if (!dict.player[player1]) {
          dict.player[player1] = {};
          dict.player[player1].id = playerCount;
          dict.player[player1].fname = fileData[j]['FirstName'];
          dict.player[player1].lname = fileData[j]['LastName'];
          dict.player[player1].teamID = teamID;
          playerCount++;
        }
        if (fileData[j]['QFirstName'] && !dict.player[player2]) {
          dict.player[player2] = {};
          dict.player[player2].id = playerCount;
          dict.player[player2].fname = fileData[j]['QFirstName'];
          dict.player[player2].lname = fileData[j]['QLastName'];
          dict.player[player2].teamID = teamID;
          playerCount++;
        }
      }

      console.log('building score event');
      for (var k = 0; k < fileLineCount; k++) {
        var player1 = fileData[k]['FirstName'] + ' ' + fileData[k]['LastName'];
        var scoreEvent = {
          GameDate: fileData[k]['Date'],
          OpposingTeamID: dict.team[fileData[k]['OpposingTeam']],
          PlayerID: dict.player[player1].id,
          ScoreTypeID: dict.scoreType[fileData[k]['Type']].id,
        };
        if (fileData[k]['QFirstName']) {
          var player2 = fileData[k]['QFirstName'] + ' ' + fileData[k]['QLastName'];
          scoreEvent.QuarterbackID = dict.player[player2].id;
        }
        dict.scoreEvent.push(scoreEvent);
      }

      console.log(dict);
      callback(null);
    },
    // Insert data
    function(callback) {
      // Score Type
      for (var key in dict.scoreType){
        console.log(key);
        var sql = 'INSERT INTO ScoreType (id, Type, Points) VALUES ('+dict.scoreType[key].id+',\''+key+'\','+dict.scoreType[key].points+')';
        console.log(sql);
        connection.query(sql, function(err) {
          if (err) {
            callback(new Error('Failed: ' + err.message));
          }
        });
      }
      // Team
      for (var key in dict.team){
        console.log(key);
        var sql = 'INSERT INTO Team (id, TeamName) VALUES ('+dict.team[key]+',\''+key+'\')';
        console.log(sql);
        connection.query(sql, function(err) {
          if (err) {
            callback(new Error('Failed: ' + err.message));
          }
        });
      }
      // Player
      for (var key in dict.player){
        console.log(key);
        var sql = 'INSERT INTO Player SET ?';
        var inserts = {
          id: dict.player[key].id,
          FirstName: dict.player[key].fname,
          LastName: dict.player[key].lname,
          TeamID: dict.player[key].teamID,
        };
        sql = mysql.format(sql, inserts);
        console.log(sql);
        connection.query(sql, function(err) {
          if (err) {
            callback(new Error('Failed: ' + err.message));
          }
        });
      }
      // Score Event
      for (var i = 0; i < dict.scoreEvent.length; i++) {
        var sql = 'INSERT INTO ScoringEvent SET ?';
        sql = mysql.format(sql, dict.scoreEvent[i]);
        console.log(sql);
        connection.query(sql, function(err) {
          if (err) {
            callback(new Error('Failed: ' + err.message));
          }
        });
      }

    },




    // // Insert team data
    // function(callback) {
    //   // Insert team with count, call back
    //   var count = 0;
    //   for (var i = 0; i < fileLineCount; i++) {
    //     // console.log(i);
    //     // console.log(fileData[i]['TeamName']);
    //     // console.log(fileData[i]['OpposingTeam']);
    //     var teamName1 = fileData[i]['TeamName'];
    //     var sql1 = 'INSERT INTO Team (TeamName) SELECT * FROM (SELECT \''+teamName1+'\') AS tmp WHERE NOT EXISTS (SELECT TeamName FROM Team WHERE TeamName = \''+teamName1+'\') LIMIT 1';
    //     var teamName2 = fileData[i]['OpposingTeam'];
    //     var sql2 = 'INSERT INTO Team (TeamName) SELECT * FROM (SELECT \''+teamName2+'\') AS tmp WHERE NOT EXISTS (SELECT TeamName FROM Team WHERE TeamName = \''+teamName2+'\') LIMIT 1';
    //     console.log(sql1);
    //     console.log(sql2);
    //     connection.query(sql1, function(err) {
    //       if (err) {
    //         callback(new Error('Failed: ' + err.message));
    //       }
    //       connection.query(sql2, function(err) {
    //         if (err) {
    //           callback(new Error('Failed: ' + err.message));
    //         }
    //         count++;
    //         // console.log(count + ' - ' + rows.length);
    //         if (count==fileLineCount*2) {
    //           console.log('Inserted all teams!');
    //           callback(null);
    //         }
    //       });
    //     });
    //   }
    // },
    // // Insert Player data
    // function(callback) {
    //   // Insert player with count, call back
    //   // with select: http://stackoverflow.com/questions/6354132/insert-data-into-table-with-result-from-another-select-query
    //   // INSERT INTO Player( FirstName, LastName, TeamID ) SELECT  't1',  't2', Team.id FROM Team WHERE Team.TeamName =  'Miami'
    //   for (var i = 0; i < fileLineCount; i++) {
    //     var teamName = fileData[i]['TeamName'];
    //     var player1FN = fileData[i]['FirstName'];
    //     var player1LN = fileData[i]['LastName'];
    //     var sql1 = 'INSERT INTO Team (TeamName) SELECT * FROM (SELECT \''+teamName1+'\') AS tmp WHERE NOT EXISTS (SELECT TeamName FROM Team WHERE TeamName = \''+teamName1+'\') LIMIT 1';
    //     var teamName2 = fileData[i]['OpposingTeam'];
    //     var sql2 = 'INSERT INTO Team (TeamName) SELECT * FROM (SELECT \''+teamName2+'\') AS tmp WHERE NOT EXISTS (SELECT TeamName FROM Team WHERE TeamName = \''+teamName2+'\') LIMIT 1';
    //     console.log(sql1);
    //     console.log(sql2);
    //     connection.query(sql1, function(err) {
    //       if (err) {
    //         callback(new Error('Failed: ' + err.message));
    //       }
    //       connection.query(sql2, function(err) {
    //         if (err) {
    //           callback(new Error('Failed: ' + err.message));
    //         }
    //         count++;
    //         // console.log(count + ' - ' + rows.length);
    //         if (count==fileLineCount*2) {
    //           console.log('Inserted all teams!');
    //           callback(null);
    //         }
    //       });
    //     });
    //   }
    // },

      // Insert player with count, call back
      // with select: http://stackoverflow.com/questions/6354132/insert-data-into-table-with-result-from-another-select-query

      // Insert Scoring event with count, callback

      // import sql from text and do them

  ], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log('waterfall completed! ' + result);
    }
  });
}

function teamInsertionHandler(err) {

}

function truncateTable(dbName, callback) {
  var sql = 'TRUNCATE table ' + dbName;
  connection.query(sql, function(err, rows, fields) {
    if (err) {
      console.log(err);
      throw err;
    }
    console.log('TRUNCATE table - ' + dbName);
    callback(null);
  });
}


function testing() {
  var sql = 'SELECT * from ScoreType';
  connection.query(sql, function(err, rows, fields) {
    if (err) {
      console.log(err);
      throw err;
    }
    console.log('Obtained ' + rows.length + ' records from ');
    console.log(rows);
  });
}

function updateDatabase(dbFrom, dbTo) {
  async.waterfall([
    // Clear table
    function(callback) {
      var sql = 'TRUNCATE table ' + dbTo;
      connection.query(sql, function(err, rows, fields) {
        if (err) {
          console.log(err);
          throw err;
        }
        console.log('TRUNCATE table - ' + dbTo);
        callback(null);
      });
    },
    // Get all data
    function(callback) {
      var sql = 'SELECT * from ' + dbFrom;
      connection.query(sql, function(err, rows, fields) {
        if (err) {
          console.log(err);
          throw err;
        }
        console.log('Obtained ' + rows.length + ' records from ' + dbFrom);
        callback(null, rows);
      });
    },
    // Insert data
    function(rows, callback) {
      var count = 0;
      for (var i = 0; i < rows.length; i++) {
        var sql = 'INSERT INTO ' + dbTo + ' SET ?';
        var inserts = sqlInsertsMapping(dbTo, rows[i]);
        sql = mysql.format(sql, inserts);
        console.log(sql+';');
        connection.query(sql, function(err) {
          if (err) {
            callback(new Error('Failed: ' + err.message));
          }
          count++;
          // console.log(count + ' - ' + rows.length);
          if (count==rows.length) {
            callback(null, 'Inserted '+rows.length+' new records into '+ dbTo + '!');
          }
        });
      }
    },
  ], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log('waterfall completed! ' + result);
    }
  });
}

function sqlInsertsMapping(dbTo, row) {
  if (dbTo=='directory') {
    return {
      firstname:  row.first_name,
      lastname:   row.last_name,
      suffix:     row.suffix,
      photo:      row.Uphoto,
      site:       row.site,
      jobtitle:   row.jobtitle,
      email:      row.email,
      gmail:      row.gmail==null ? '' : row.gmail,
      phone:      row.phone,
      fax:        row.fax,
      address1:   row.address,
      address2:   row.address2,
      address3:   row.address3,
      city:       row.city,
      state:      row.state,
      zip:        row.zip,
      workgroups: row.workinggroup==null ? '' : ','+row.workinggroup+',',
    };
  }
  if (dbTo=='users') {
    return {
      username:   row.username,
      password:   crypto.createHash('md5').update(row.password).digest('hex'),
      role:       (row.userlevel-1),
      center_id:  2,
    };
  }
  if (dbTo=='workgroup') {
    return {
      id:         row.groupid,
      groupname:  row.groupname,
      gmailname:  row.drivename,
      archive:    row.Archived=='1' ? 'yes' : 'no',
      groupOrder: row.OrderID,
    };
  }
}






