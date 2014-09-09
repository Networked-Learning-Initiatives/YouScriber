var express = require('express');
var app = express();
var pg = require('pg');  //Commented out until database implementation
var http = require('http').Server(app);
var bodyParser = require('body-parser')
var async = require('async');
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use( bodyParser.urlencoded({extended:true}) ); // to support URL-encoded bodies



//CSRF Protection ------------------------------------------
cookieParser = require('cookie-parser');
cookieSession = require('cookie-session');
csurf = require('csurf');

app.use(cookieParser("I know what you did last summer, and I'm jealous of your ears."));
app.use(cookieSession({
  secret: "I know what you did last summer, and I'm jealous of your ears."
}));
// app.use(express.csrf());

var csrfValue = function (req) {
  var token = (req.body && req.body._csrf)
    || (req.query && req.query._csrf)
    || (req.headers['x-csrf-token'])
    || (req.headers['x-xsrf-token']);
  return token;
};

// app.use(csurf({value: csrfValue}));

// app.use(function(req, res, next) {
//   res.cookie('XSRF-TOKEN', req.session._csrf);
//   next();
// });

//end CSRF stuff -------------------------------------------




app.use(express.static(__dirname + '/app'));

var port = 3333;


var conString = "postgres://youscriber:5432@localhost/youscriber";

function executePGQueryParam (sql, params, success, failure) {
  console.log(sql, params);
  pg.connect(conString, function (error, client, done){
    if (error) {
      return console.error('error fetching pg client from pool', error);
    }

    client.query(sql, params, function (err, result) {
      if(err) {
        if (failure){
          failure(err);
        }
        return console.error('error running query: ', sql, err);
      }
      if (success) {
        success(result);
      }
      done();
    });
  });
}

function cbWrapper (callback) {
  return function(result) {
    callback(null, result);
  };
}

function getGroups (id) {
  return function(cb) {
    var getGroupsQuery = 'select g.id, g.title from ysgroup g join group_member gm on gm.ysgroup=g.id where gm.ysuser=$1';
    executePGQueryParam(getGroupsQuery, [id], cbWrapper(cb), cb);
  };
}

function getOrgs (id) {
  return function(cb) {
    var getOrgsQuery = 'select o.id, o.title from organization o join organization_member om on om.organization=o.id where om.ysuser=$1';
    executePGQueryParam(getOrgsQuery, [id], cbWrapper(cb), cb);
  };
}

app.post('/api/user/login', function (req, res) {
  if (req.body.hasOwnProperty('user') && req.body.hasOwnProperty('pwHash')) {
    var checkLogin = 'select id from ysuser where name=$1 and pwhash=$2';
    executePGQueryParam(checkLogin, [req.body.user, req.body.pwHash], 
      function (loginResult){
        console.log('login success', loginResult);
        if (loginResult.rowCount == 0) {
          res.status(500).json({msg:'user or password incorrect'});
        }
        async.parallel([getGroups(loginResult.rows[0].id), getOrgs(loginResult.rows[0].id)], function(error, results){
          if (error) {
            res.status(500).json({msg:error});
          }
          else {
            console.log(results[0], results[1]);
            res.status(200).json({id:loginResult.rows[0].id, groups:results[0].rows, orgs:results[1].rows});
          }          
        });
      },
      function (loginError){
        console.log('error in login', loginError);
        res.status(500).json({msg:'error in login '+ loginError});
      });
  }
  else {
    res.status(400).json({msg:'user and pwHash fields required in search/query string'});
  }
});


//registration route
app.post('/api/user', function (req, res) {
  if (req.body.hasOwnProperty('user') && req.body.hasOwnProperty('email') && req.body.hasOwnProperty('pwHash')) {
    var checkUser = 'select id from ysuser where name=$1';
    executePGQueryParam(checkUser, [req.body.user], 
      function (checkUserResult){
        //there's no user already using the requested username
        if (checkUserResult.rowCount < 1) {
          //add this user to the db
          var insertNewUser = "insert into ysuser (name,email,pwhash) values ($1,$2,$3) returning id";
          executePGQueryParam(insertNewUser,[req.body.user, req.body.email, req.body.pwHash],
            function (newUserSuccess) {
              console.log(newUserSuccess);
              res.status(201).json({id:newUserSuccess.rows[0].id});
            },
            function (newUserError) {
              res.status(500).json({msg:newUserError});
            });
        }
        else {
          res.status(500).json({msg:'username already exists'});
        }
        // res.json(200, {id:checkUserResult});
      },
      function (checkUserError){
        console.log('error in checkUser', checkUserError);
        res.status(500).json({msg:'error in checkUser', error: checkUserError});
      });
  }
  else {
    res.status(400).send('user, email, and pwHash fields required in post body to register');
  }
});

// app.post('/api/user/login', function (req, res) {
//   if (req.body.hasOwnProperty('user') && req.body.hasOwnProperty('pwHash')) {
//     var loginUser = 'select id from ysuser where name=$1 and pwhash=$2';
//     executePGQueryParam(loginUser, [req.body.user, req.body.pwHash], 
//       function (loginUserResult) {
//         console.log('found user for login', loginUserResult);

//         res.status(200).json({});
//       },
//       function (loginUserError) {
//         console.log('error in login', loginUserError);

//       }
//     );
//   }
//   else {
//     res.status(400).send('login failed');
//   }
// });

app.post('/api/org', function (req, res) {
  if (req.body.hasOwnProperty('title') && req.body.hasOwnProperty('email') && req.body.hasOwnProperty('pwHash')) {
    var checkUser = 'select id from ysuser where name=$1';
    executePGQueryParam(checkUser, [req.body.user], 
      function (checkUserResult){
        //there's no user already using the requested username
        if (checkUserResult.rowCount < 1) {
          //add this user to the db
          var insertNewUser = "insert into ysuser (name,email,pwhash) values ($1,$2,$3)";
          executePGQueryParam(insertNewUser,[req.body.user, req.body.email, req.body.pwHash],
            function (newUserSuccess) {
              res.status(201).json({id:newUserSuccess});
            },
            function (newUserError) {
              res.status(500).json({msg:newUserError});
            });
        }
        else {
          res.status(500).json({msg:'username already exists'});
        }
        // res.json(200, {id:checkUserResult});
      },
      function (checkUserError){
        console.log('error in checkUser', checkUserError);
        res.status(500).json({msg:'error in checkUser', error: checkUserError});
      });
  }
  else {
    res.status(400).send('user, email, and pwHash fields required in post body to register');
  }
});

app.use(express.static(__dirname + '/app'));

var server = app.listen(port, function () {
    console.log('Listening on port %d', server.address().port);
});

