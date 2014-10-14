var express = require('express');
var app = express();
// var pg = require('pg');  //Commented out until database implementation
var mysql = require('mysql');
var http = require('http').Server(app);
var bodyParser = require('body-parser')
var async = require('async');
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use( bodyParser.urlencoded({extended:true}) ); // to support URL-encoded bodies

var request = require('request');


var connection = mysql.createConnection({
    host: 'localhost',
    user: 'youscriber',
    password: 'youscriber',
    database: 'youscriber'
});
connection.connect();



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


function executeQuery (sql, params, success, failure) {
  console.log(sql, params);
  connection.query(sql, params, function (err, result) {
    if(err) {
      if (failure){
        failure(err);
      }
      return console.error('error running query: ', sql, err);
    }
    else if (success) {
      success(result);
    }
  });
}

function cbWrapper (callback) {
  return function(result) {
    callback(null, result);
  };
}

function getGroups (id) {
  return function(cb) {
    var getGroupsQuery = 'select g.id, g.title from ysgroup g join group_member gm on gm.ysgroup=g.id where gm.ysuser=?';
    executeQuery(getGroupsQuery, [id], cbWrapper(cb), cb);
  };
}

function getOrgs (id) {
  return function(cb) {
    var getOrgsQuery = 'select o.id, o.title from organization o join organization_member om on om.organization=o.id where om.ysuser=?';
    executeQuery(getOrgsQuery, [id], cbWrapper(cb), cb);
  };
}

function getPublicVideos(callback, user){
  
  // we need to treat the union of the following several queries as a "derived table".
  // the prefix and suffix here will make that happen, and group the results as we need them.
  var queryPrefix = 'select * from ( ';
  var querySuffix = ' ) as videos group by videos.id';
  
  // this query finds out which videos have no permissions set for them (making them public)
  // TODO: what would make a video private?
  var publicVideoQuery = 'select video.*, count(distinct comment.id) as comments from video left join comment on video.id=comment.video_id where video.id not in (select video from user_privilege union select video from group_privilege union select video from organization_privilege) group by video.id';

  // this query finds out which videos the current user has permissions for
  // TODO: maybe limit this to "read" permission?
  var videosForUserQuery = 'select video.*, count(distinct comment.id) as comments from video left join comment on video.id=comment.video_id join user_privilege on user_privilege.video=video.id where user_privilege.ysuser=? group by video.id';

  // default the usserId to null, in case we don't currently know who the user is.
  var userId = 'null';
  if (user && user.hasOwnProperty('id')) {
    userId = user.id;
  }

  // here we start building the composite query
  var unionQuery = queryPrefix + publicVideoQuery + ' union distinct ' + videosForUserQuery;
  var unionParams = [];
  unionParams.push(userId);

  // this query finds out which videos the current user has permissions for through the current user's group memberships
  // TODO: maybe limit this to "read" permission?
  var videosForGroupQuery = 'select video.*, count(distinct comment.id) as comments from video left join comment on video.id=comment.video_id join group_privilege on group_privilege.video=video.id where group_privilege.ysgroup in (?) group by video.id';
  var groupId = [];

  if (user != null && user.hasOwnProperty('groups')) {

    // if the current user has groups, accumulate their ids so they can be used for this query
    for (var i=0; i<user.groups.length; i++) {
      groupId.push(user.groups[i].id);
    }
    unionParams.push(groupId);

    // add this query to the composite query started above
    unionQuery = unionQuery + ' union ' + videosForGroupQuery;
  }

  // this query finds out which videos the current user has permissions for through the current user's org memberships
  // TODO: maybe limit this to "read" permission?
  var videosForOrgQuery = 'select video.*, count(distinct comment.id) as comments from video left join comment on video.id=comment.video_id join organization_privilege on organization_privilege.video=video.id where organization_privilege.organization in (?) group by video.id';
  var org = [];

  if (user != null && user.hasOwnProperty('orgs')) {

    // if the current user has groups, accumulate their ids so they can be used for this query
    for (var i=0; i<user.orgs.length; i++) {
      org.push(user.orgs[i].id);
    }
    unionParams.push(org);

    // add this query to the composite query started above
    unionQuery = unionQuery + ' union ' + videosForOrgQuery;
  }

  // add the suffix on to the composite query
  unionQuery = unionQuery + querySuffix;

  // run the query and give the callback the results
  executeQuery(unionQuery, unionParams, function(results){
    callback(results);
  });
}

app.post('/api/user/login', function (req, res) {
  if (req.body.hasOwnProperty('user') && req.body.hasOwnProperty('pwHash')) {

    var checkLogin = 'select id from ysuser where name=? and pwhash=?';

    executeQuery(checkLogin, [req.body.user, req.body.pwHash], 
      function (loginResult){
        console.log('login success', loginResult);
        if (loginResult.rowCount == 0) {
          res.status(500).json({msg:'user or password incorrect'});
        }
        async.parallel([getGroups(loginResult[0].id), getOrgs(loginResult[0].id)], function(error, results){
          if (error) {
            res.status(500).json({msg:error});
          }
          else {
            console.log(results[0], results[1]);
            res.status(200).json({id:loginResult[0].id, groups:results[0], orgs:results[1]});
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

app.post('/api/user/logout', function (req, res) {
  // TODO: add logout logic
  res.status(200).send();
});


//registration route
app.post('/api/user', function (req, res) {
  if (req.body.hasOwnProperty('user') && req.body.hasOwnProperty('email') && req.body.hasOwnProperty('pwHash')) {
    var checkUser = 'select id from ysuser where name=?';
    executeQuery(checkUser, [req.body.user], 
      function (checkUserResult){
        //there's no user already using the requested username
        if (checkUserResult.rowCount < 1) {
          //add this user to the db
          var insertNewUser = "insert into ysuser (name,email,pwhash) values (?,?,?) returning id";
          executeQuery(insertNewUser,[req.body.user, req.body.email, req.body.pwHash],
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

app.get('/api/videos', function (req, res) {
  var user = req.query.user;
  
  if (req.query.hasOwnProperty('user')) {
    getPublicVideos(function(results) {
      console.log(results);
      res.status(200).json(results);
    }, JSON.parse(user));
  }

  else {
    getPublicVideos(function(results) {
      // console.log('callback for else');
      // console.log(results);
      res.status(200).json(results);
    });
  }
});

function addVideo (response, userId, httpResponse) {
  // console.log(response.body.entry);

  var entry = JSON.parse(response.body).entry;
  // console.log(entry);
  var title = entry.title.$t;
  var duration = entry.media$group.yt$duration.seconds;
  var ytid = entry.media$group.yt$videoid.$t;
  var thumb = entry.media$group.media$thumbnail[1].url;
  var video = {
    title: title,
    ytid: ytid,
    owner: userId,
    thumbnail: thumb,
    duration: duration,
    comments: []
  };

  // console.log('title, duration, thumb', title, duration, thumb);

  var insertNewVideoQuery = 'insert into video (title, ytid, owner, thumbnail, duration) values (?, ?, ?, ?, ?)';
  executeQuery(insertNewVideoQuery, [title, ytid, userId, thumb, duration], function(results){
    console.log(results);
    video.id = results.insertId;
    httpResponse.status(200).json(video);
  });
}

app.get('/api/video/new', function(req, res) {
  // video is not in our database, so add it.
  if (!req.query.hasOwnProperty('user')) {
    var msg = 'have to be logged in to add a new video';
    console.log(msg);
    res.status(500).json({msg:msg});
    return;
  }

  if (!req.query.hasOwnProperty('ytid')) {
    var msg = 'no ytid received for new video.';
    console.log(msg);
    res.status(500).json({msg:msg});
    return;
  }

  console.log('new video');
  var user = JSON.parse(req.query.user);
  console.log(user);

  request('http://gdata.youtube.com/feeds/api/videos/'+req.query.ytid+'?v=2&alt=json', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      // console.log(response); // Print the google web page.

      addVideo(response, user.id, res);
    }
  });
});

app.get('/api/videos/:vid', function(req, res) {

  console.log('/api/videos/:vid', req.params.vid);
  console.log(req.params);
  console.log(req.query);

  // TODO: make these queries respect permissions
  var videoDetailsQuery = 'select video.* from video where video.id=?';
  var videoCommentsQuery = 'select comment.* from comment where comment.video_id=?';

  function makeSuccessCB(cb) {
    return function (r) {
      cb(null, r);
    };
  }

  async.parallel([function(cb) {

    executeQuery(videoDetailsQuery, [req.params.vid], makeSuccessCB(cb), cb);

  }, function(cb) {

    executeQuery(videoCommentsQuery, [req.params.vid], makeSuccessCB(cb), cb);

  }], function(error, results) {

    console.log('parallel callback', error, results);
    if (error && (!error.hasOwnProperty('length')||error.length>0)) {
      console.log('error case', error);
      res.status(500).json({msg:error});
    }
    else {
      console.log('videos/vid else');
      if (results && (!results.hasOwnProperty('length')||(results.length>0 && results[0] && typeof results[0] != 'undefined'))) {
        console.log('results', results);
        var video = results[0][0];
        video.comments = results[1];
        console.log('video to be sent to client:');
        console.log(video);
        res.status(200).json({video:video});
      }
      else {
        // this mut be an error bc i moved it to a different route


        // (!results || (results.hasOwnProperty('length') && results.length == 0)) {
        // // video is not in our database, so add it.
        // if (!req.query.hasOwnProperty('user')) {
        //   console.log('have to be logged in to add a new video');
        //   res.status(500).json({msg:'have to be logged in to add a new video'});
        //   return;
        // }
        // console.log('no video');
        // var user = JSON.parse(req.query.user);
        // console.log(user);

        // request('http://gdata.youtube.com/feeds/api/videos/'+req.params.vid+'?v=2&alt=json', function (error, response, body) {
        //   if (!error && response.statusCode == 200) {
        //     // console.log(response); // Print the google web page.

        //     addVideo(response, user.id, res);
        //   }
        // });
      }
      // console.log(results[0], results[1]);
      
    }          
  });
});

// app.get('/posts/:slug', function(req, res) {
//   var post = posts[req.params.slug];

// app.get('/api/videos/org/:orgId', function (req, res) {
//   getPublicVideos(function(results) {
//     console.log(results);
//     res.status(200).json(results);
//   }, {org:orgId});
// });

// app.get('/api/videos/group/:gId', function (req, res) {
//   getPublicVideos(function(results) {
//     console.log(results);
//     res.status(200).json(results);
//   }, {group:gId});
// });

// app.get('/api/videos/user/:uId', function (req, res) {
//   getPublicVideos(function(results) {
//     console.log(results);
//     res.status(200).json(results);
//   }, {user:uId});
// });


// app.post('/api/user/login', function (req, res) {
//   if (req.body.hasOwnProperty('user') && req.body.hasOwnProperty('pwHash')) {
//     var loginUser = 'select id from ysuser where name=? and pwhash=?';
//     executeQuery(loginUser, [req.body.user, req.body.pwHash], 
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
    var checkUser = 'select id from ysuser where name=?';
    executeQuery(checkUser, [req.body.user], 
      function (checkUserResult){
        //there's no user already using the requested username
        if (checkUserResult.rowCount < 1) {
          //add this user to the db
          var insertNewUser = "insert into ysuser (name,email,pwhash) values (?,?,?)";
          executeQuery(insertNewUser,[req.body.user, req.body.email, req.body.pwHash],
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

