var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const url = require('url');
const querystring = require('querystring');
var oracledb = require('oracledb');
if (process.platform === 'win64') {
    try {
      oracledb.initOracleClient({libDir: 'C:\\oracleclient\\instantclient'});   // note the double backslashes
    } catch (err) {
      console.error('Whoops!');
      console.error(err);
      process.exit(1);
    }
}



// Use body parser to parse JSON body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



var connAttrs = {
    "user": "test",
    "password": "test",
  //  "connectString": "jdbc:oracle:thin:@DESKTOP-ESRH7J2:1521:XE"
"connectString" : "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = DESKTOP-ESRH7J2)(PORT = 1521))(CONNECT_DATA =(SID= XE)))"
}
//jdbc:oracle:thin:@DESKTOP-ESRH7J2:1521:XE
// Http Method: GET
// URI        : /user_profiles
// Read all the user profiles
let rawUrl = '/user_profiles' ;
app.get(rawUrl, function (req, res) {
    "use strict";
     var stmt ;
     var bindValues = {};
     let parsedUrl = url.parse(rawUrl);
     console.log(parsedUrl);

     var EMPID = req.query.EMPID ;
     var ACDATE = req.query.ACDATE ;
     stmt = "SELECT * FROM EMPLOYEE_INF" ;

    oracledb.getConnection(connAttrs, function (err, connection) {
        if (err) {
            // Error connecting to DB
            res.set('Content-Type', 'application/json');
            res.status(500).send(JSON.stringify({
                status: 500,
                message: "Error connecting to DB",
                detailed_message: err.message
            }));
            return;
        }
        console.log('general get') ;

        if (!EMPID  &&  !ACDATE )
        {

         console.log('no parameters');
         bindValues = {};
        }
        else if (EMPID &&  !ACDATE )  {
          console.log('there are parameters');
          bindValues.EMPID = EMPID ;
          stmt = stmt + " where EMPID=:EMPID" ;
         console.log(stmt);
        }
        else if (!EMPID &&  ACDATE )  {
          console.log('there are parameters');
          var    mydate  = new Date(ACDATE);
          mydate.setHours(0,0,0,0);
          bindValues.mydate =  mydate ;
          console.log(mydate);
          stmt = stmt + " where AC_REJ_DATE=:mydate " ;
         console.log(stmt);
        }
        else if (EMPID &&  !ACDATE )  {
          console.log('there are parameters');
          bindValues.EMPID = EMPID ;
          stmt = stmt + " where EMPID=:EMPID" ;
         console.log(stmt);
        }
        else if (EMPID &&  ACDATE )  {
          console.log('there are parameters');
          var    mydate  = new Date(ACDATE);
          mydate.setHours(0,0,0,0);
          bindValues.EMPID  = EMPID;
          bindValues.mydate =  mydate ;
          console.log(mydate);
          stmt = stmt + " where EMPID=:EMPID AND AC_REJ_DATE=:mydate " ;
         console.log(stmt);
        }




        connection.execute(stmt, bindValues, {
            outFormat: oracledb.OBJECT // Return the result as Object
        }, function (err, result) {
            if (err) {
                res.set('Content-Type', 'application/json');
                res.status(500).send(JSON.stringify({
                    status: 500,
                    message: "Error getting the user profile",
                    detailed_message: err.message
                }));
            } else {
                res.contentType('application/json').status(200);
                res.send(JSON.stringify(result.rows));
            }
            // Release the connection
            connection.release(
                function (err) {
                    if (err) {
                        console.error(err.message);
                    } else {
                        console.log("GET /user_profiles : Connection released");
                    }
                });
        });
    });
});


// Http Method: GET
// URI        : /user_profiles
// Read the profile of user given in :USER_NAME
/*
app.get('/user_profiles/:EMPID', function (req, res) {
    "use strict";

    oracledb.getConnection(connAttrs, function (err, connection) {
        if (err) {
            // Error connecting to DB
            res.set('Content-Type', 'application/json');
            res.status(500).send(JSON.stringify({
                status: 500,
                message: "Error connecting to DB",
                detailed_message: err.message
            }));
            return;
        }
         console.log('empid get') ;
        connection.execute("SELECT * FROM USER_PROFILES WHERE EMPID = :EMPID", [req.params.EMPID], {
            outFormat: oracledb.OBJECT // Return the result as Object
        }, function (err, result) {
            if (err || result.rows.length < 1) {
                res.set('Content-Type', 'application/json');
                var status = err ? 500 : 404;
                res.status(status).send(JSON.stringify({
                    status: status,
                    message: err ? "Error getting the user profile" : "User doesn't exist",
                    detailed_message: err ? err.message : ""
                }));
            } else {
                res.contentType('application/json').status(200).send(JSON.stringify(result.rows));
            }
            // Release the connection
            connection.release(
                function (err) {
                    if (err) {
                        console.error(err.message);
                    } else {
                        console.log("GET /user_profiles/" + req.params.EMPID + " : Connection released");
                    }
                });
        });
    });
});
*/


// Http Method: GET
// URI        : /user_profiles
// Read the profile of user given in :EMPID  and AC_REJ_DATE
/*
app.get('/user_profiles/:EMPID & :AC_DATE ', function (req, res) {
    "use strict";

    oracledb.getConnection(connAttrs, function (err, connection) {
        if (err) {
            // Error connecting to DB
            res.set('Content-Type', 'application/json');
            res.status(500).send(JSON.stringify({
                status: 500,
                message: "Error connecting to DB",
                detailed_message: err.message
            }));
            return;
        }
         console.log('empid and date  get') ;
        connection.execute("SELECT * FROM USER_PROFILES WHERE EMPID = :EMPID", [req.params.EMPID], {
            outFormat: oracledb.OBJECT // Return the result as Object
        }, function (err, result) {
            if (err || result.rows.length < 1) {
                res.set('Content-Type', 'application/json');
                var status = err ? 500 : 404;
                res.status(status).send(JSON.stringify({
                    status: status,
                    message: err ? "Error getting the user profile" : "User doesn't exist",
                    detailed_message: err ? err.message : ""
                }));
            } else {
                res.contentType('application/json').status(200).send(JSON.stringify(result.rows));
            }
            // Release the connection
            connection.release(
                function (err) {
                    if (err) {
                        console.error(err.message);
                    } else {
                        console.log("GET /user_profiles/" + req.params.EMPID + ", "+req.params.AC_DATE+" : Connection released");
                    }
                });
        });
    });
});
*/











// Http method: POST
// URI        : /user_profiles
// Creates a new user profile
app.post('/user_profiles', function (req, res) {
    "use strict";
  //  if ("application/json" !== req.get('Content-Type')) {
  //      res.set('Content-Type', 'application/json').status(415).send(JSON.stringify({
  //          status: 415,
  //          message: "Wrong content-type. Only application/json is supported",
  //          detailed_message: null
  //      }));
  //      return;
  //  }

    oracledb.getConnection(connAttrs, function (err, connection) {
        if (err) {
            // Error connecting to DB
            res.set('Content-Type', 'application/json').status(500).send(JSON.stringify({
                status: 500,
                message: "Error connecting to DB",
                detailed_message: err.message
            }));
            return;
        }
        //console.log('req-body');
      //  console.log(req.body);
      //  var rawdate  =  req.body.AC_REJ_DATE ;
        var mydate   = new Date();
         mydate.setHours(0,0,0,0);
        connection.execute("INSERT INTO EMPLOYEE_INF VALUES " +
            "( :EMPTYPE, :EMPCODE, :EMPNAME," +
            ":COMPANY, :DEPT, :MOBILENO, :ACCEPT, :AC_REJ_DATE, :EMPID) ", [ req.body.EMPTYPE,
                            req.body.EMPCODE, req.body.EMPNAME, req.body.COMPANY, req.body.DEPT,
                            req.body.MOBILENO,req.body.ACCEPT, mydate, req.body.EMPID  ], {
                autoCommit: true,
                outFormat: oracledb.OBJECT // Return the result as Object
            },
            function (err, result) {
                if (err) {
                    // Error
                    res.set('Content-Type', 'application/json');
                    res.status(400).send(JSON.stringify({
                        status: 400,
                        message: err.message.indexOf("ORA-00001") > -1 ? "User already exists" : "Input Error",
                        detailed_message: err.message
                    }));
                } else {
                    // Successfully created the resource
                    res.status(201).set('Location', '/user_profiles/' + req.body.EMPID).end();
                }
                // Release the connection
                connection.release(
                    function (err) {
                        if (err) {
                            console.error(err.message);
                        } else {
                            console.log("POST /user_profiles : Connection released");
                        }
                    });
            });
    });
});


// Build UPDATE statement and prepare bind variables
var buildUpdateStatement = function buildUpdateStatement(req) {
    "use strict";

    var statement = "",
        bindValues = {};
    if (req.body.MOBILENO) {
        statement += "EMPNAME = :EMPNAME";
        bindValues.MOBILENO = req.body.MOBILENO;
    }
    if (req.body.ACCEPT) {
        if (statement) statement = statement + ", ";
        statement += "ACCEPT = :ACCEPT";
        bindValues.ACCEPT = req.body.ACCEPT;
    }
    if (req.body.DEPT) {
        if (statement) statement = statement + ", ";
        statement += "DEPT = :DEPT";
        bindValues.DEPT = req.body.DEPT;
    }




    statement += " WHERE EMPID = :EMPID";
    bindValues.EMPID = req.params.EMPID;
    statement = "UPDATE USER_PROFILES SET " + statement;

    return {
        statement: statement,
        bindValues: bindValues
    };
};

// Http method: PUT
// URI        : /user_profiles/:USER_NAME
// Update the profile of user given in :USER_NAME
app.put('/user_profiles/:EMPID', function (req, res) {
    "use strict";

    if ("application/json" !== req.get('Content-Type')) {
        res.set('Content-Type', 'application/json').status(415).send(JSON.stringify({
            status: 415,
            message: "Wrong content-type. Only application/json is supported",
            detailed_message: null
        }));
        return;
    }

    oracledb.getConnection(connAttrs, function (err, connection) {
        if (err) {
            // Error connecting to DB
            res.set('Content-Type', 'application/json').status(500).send(JSON.stringify({
                status: 500,
                message: "Error connecting to DB",
                detailed_message: err.message
            }));
            return;
        }

        var updateStatement = buildUpdateStatement(req);
        connection.execute(updateStatement.statement, updateStatement.bindValues, {
                autoCommit: true,
                outFormat: oracledb.OBJECT // Return the result as Object
            },
            function (err, result) {
                if (err || result.rowsAffected === 0) {
                    // Error
                    res.set('Content-Type', 'application/json');
                    res.status(400).send(JSON.stringify({
                        status: 400,
                        message: err ? "Input Error" : "User doesn't exist",
                        detailed_message: err ? err.message : ""
                    }));
                } else {
                    // Resource successfully updated. Sending an empty response body.
                    res.status(204).end();
                }
                // Release the connection
                connection.release(
                    function (err) {
                        if (err) {
                            console.error(err.message);
                        } else {
                            console.log("PUT /user_profiles/" + req.params.EMPID + " : Connection released ");
                        }
                    });
            });
    });
});


var server = app.listen(process.env.HTTP_PORT || 3000, function () {
    "use strict";

  //  var host = server.address().address,
  //      port = server.address().port;


    console.log(' Server is listening at 3000 ');
});
