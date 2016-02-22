'use strict';

var express = require('express');
var app = express();
// var pg = require('pg');  //Commented out until database implementation
var mysql = require('mysql');
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var async = require('async'); //TODO: convert to RSVP
var RSVP = require('rsvp');
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // to support URL-encoded bodies

var request = require('request');

var models = require('./models.js');

const YS_YT_API_KEY = 'AIzaSyB8ZeEIa_wX_kAASWoX-Lxuf_478BqRNg0';

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'youscriber',
  password: 'youscriber',
  database: 'youscriber'
});
connection.connect();

var permissionIds = {
  'read': 1,
  'author': 2,
  'edit': 3,
  'delete': 4,
  'admin': 5
};

//CSRF Protection ------------------------------------------
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var csurf = require('csurf');

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

function query(sql, params) {
  var promise = new RSVP.Promise(function (resolve, reject) {
    console.log(sql, params);
    connection.query(sql, params, function (err, result) {
      if (err) {
        console.error('sql error in query', err);
        reject(err);
      } else {
        console.log('query success:', result);
        resolve(result);
      }
    });
  });
  return promise;
}

function executeQuery(sql, params, success, failure) {
  console.log(sql, params);
  connection.query(sql, params, function (err, result) {
    if (err) {
      if (failure) {
        failure(err);
      }
      return console.error('error running query: ', sql, err);
    }
    else if (success) {
      success(result);
    }
  });
}

// function getGroups (id) {
//   return models.allUserGroups(id);
// }

// function getOrgs (id) {
//   return models.allUserOrgs(id);
// }

app.get('/api/groups/search/:uid/:groupSubString', (req, res) => {
  console.log('search for group with substr', req.params.groupSubString, 'for user', req.params.uid);
  models.User.findById(req.params.uid)
    .then((user) => {
      user.getConfirmedGroups()
        .then((groups) => {
          var filteredGroups = groups.filter((group) => {
            return group.name.toLowerCase().indexOf(req.params.groupSubString.toLowerCase()) > -1;
          });
          console.log(filteredGroups);
          res.status(200).json(filteredGroups);
        })
    });
});

app.get('/api/orgs/search/:uid/:orgSubString', (req, res) => {
  console.log('search for org with substr', req.params.orgSubString, 'for user', req.params.uid);
  models.User.findById(req.params.uid)
    .then((user) => {
      user.getConfirmedOrgs()
        .then((orgs) => {
          console.log('orgs');
          console.log(orgs);
          var filteredOrgs = orgs.filter((org) => {
            console.log('thisorg');
            console.log(org);
            return org.name.toLowerCase().indexOf(req.params.orgSubString.toLowerCase()) > -1;
          });
          console.log('filteredOrgs');
          console.log(filteredOrgs);
          res.status(200).json(filteredOrgs);
        })
    });
});

app.post('/api/user/login', (req, res) => {
  if (req.body.hasOwnProperty('user') && req.body.hasOwnProperty('pwHash')) {
    models.attemptLogin(req.body)
      .then(results => {
        if (results) {
          let user = results[0];
          let groups = results[1];
          let orgs = results[2];
          let managementPerms = results[3];
          // console.log('attempt login results', user, groups, orgs);
          res.status(200).json({
            id: user.id,
            orgs: orgs,
            groups: groups,
            managementPerms: managementPerms
          });          
        } else {
          res.status(400).json({msg:'wrong username or password'});
        }
      })
      .catch(err => {
        res.status(500).json({msg:'error attempting login '+err});
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
  if (req.body.hasOwnProperty('user') && 
    req.body.hasOwnProperty('email') && 
    req.body.hasOwnProperty('pwHash')) {

    models.User.create({
      name: req.body.user,
      pwhash: req.body.pwHash,
      email: req.body.email,
    })
      .then(result => {
        res.status(200).json(result);
      })
      .catch(err => {
        res.status(500).json({msg:'username already exists', error:err});
      });
  }
  else {
    res.status(400).send('user, email, and pwHash fields required in post body to register');
  }
});

app.get('/api/videos', function (req, res) {
  var user = req.query.user;
  
  if (req.query.hasOwnProperty('user')) {
    models.Video.getPublicVideos()
      .then(results => {
        // console.log(results);
        res.status(200).json(results);
      });
  }

  else {
    console.log('api hit for public videos');
    models.Video.getPublicVideos()
      .then(results => {
        // console.log('callback for else');
        // console.log(results);
        res.status(200).json(results);
      });
  }
});

function secondsFromISO8601 (part) {
  let regex = new RegExp(/(?:(?:(\d+)H)?(\d+)M)?(\d+)S/);
  let multipliers = [3600, 60, 1];
  return regex.exec(part).filter(item => {
    return typeof item !== 'undefined';
  }).slice(1).reduce((prev, curr, i, fragments) => {
    if (fragments.length > 1) {
      if (fragments.length > 2) {
        console.log(prev, curr, i);
        return prev+multipliers[i]*curr;
      } else {
        return prev+multipliers.slice(1)[i]*curr;
      }
    } else {
      return curr;
    }
  }, 0);
}

function addVideo (response, userId, httpResponse) {
  console.log('add video fn');

  var entry = JSON.parse(response.body).items[0];
  var title = entry.snippet.title;
  var duration = secondsFromISO8601(entry.contentDetails.duration);
  var ytid = entry.id;
  var thumb = entry.snippet.thumbnails.default.url;
  var video = {
    title: title,
    ytid: ytid,
    owner: userId,
    thumbnail: thumb,
    duration: duration,
    comments: []
  };

  models.userAddsVideo({
    title: video.title,
    ytid: video.ytid,
    thumbnail: video.thumbnail,
    duration: video.duration, 
    creatorId: userId,                     
  }).then((newVideo) => {
    console.log('success creating new video');
    httpResponse.status(200).json(newVideo);
  }).catch((creationError) => {
    console.log('error creating new video', creationError);
    httpResponse.status(500).json(creationError);
  });
}

app.delete('/api/videos/:vid', function (req, res) {
  //first check permissions if this user can admin this video, 
  // the user can delte this video IF the user has admin, or a group or org this user is in has admin
  var userHasAdminQuery = 'select * from user_privilege where ysuser=? and video=? and permission=?';
  query(userHasAdminQuery, [req.body.uid, req.params.vid, permissionIds.admin])
    .then(function (results) {
      if (results.rows.length > 0) {
        //i'm allowed to delete it

      } else {
        //maybe my group or org memberships permit me to delete it
        var userInGroupCanDelete = 'select p.name from group_member gm join group_privilege gp on gp.ysgroup=gm.ysgroup join permission p on p.id=gp.permission where p.id=? and gp.video=? and gm.ysuser=?';
        query(userInGroupCanDelete, [permissionIds.admin, req.params.vid, req.body.uid])
          .then(function (results) {
            if (results.rows.length > 0) {
              //i'm allowed to delete it

            } else {
              var userInOrgCanDelete = 'select p.name from organization_member om join organization_privilege op on op.organization=om.organization join permission p on p.id=op.permission where p.id=? and op.video=? and om.ysuser=?';
              query(userInOrgCanDelete, [permissionIds.admin, req.params.vid, req.body.uid])
                .then(function (results) {
                  if (results.rows.length > 0) {
                    //i'm allowed to delete it

                  } else {
                    res.status(500).send("permission denied");
                  }
                });
            }
          });
      }
    });
  // if so, 
  var commentVideoQuery = 'delete from comment where video_id=?';
  var groupVideoQuery = 'delete from group_privilege where video=?';
  var userVideoQuery = 'delete from user_privilege where video=?';
  var organizationVideoQuery = 'delete from organization_privilege where video=?';
  query(commentVideoQuery, [req.params.vid])
    .then(function(){
      console.log('sbout to delete privilieges');
      return RSVP.all([
        query(groupVideoQuery, [req.params.vid]), 
        query(userVideoQuery, [req.params.vid]), 
        query(organizationVideoQuery, [req.params.vid])
      ]);
    })
    .then(function () {
      var deleteVideoQuery = 'delete from video where id=?';
      query(deleteVideoQuery, [req.params.vid])
        .then(function () {
          res.status(200).send('video deleted');
        })
        .catch(function (error) {
          res.status(400).send('failed to delete2'+error);
        });
    })
    .catch(function (error) {
      res.status(400).send('failed to delete1'+error);
    });
  
});

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
  // console.log(user);

  // TODO: should check here that the user has permission to add the video?

  let requestUrl = 'https://www.googleapis.com/youtube/v3/videos?id='+req.query.ytid+'&key='+YS_YT_API_KEY+'&part=snippet, contentDetails&fields=items(id,snippet(title,description,thumbnails),contentDetails(duration))';
  console.log('requesting yt info: ', requestUrl);
  request(requestUrl, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      // console.log(response); // Print the google web page.

      addVideo(response, user.id, res);
    } else {
      console.log('error getting yt data', error, response);
    }
  });
});

function addComment(comment, httpResponse) {
  // TODO: check that user has permission to comment
  models.User.findById(comment.author.id)
    .then((user) => {
      user.maxPermsForVideo(comment.video)
        .then((perms) => {
          if (perms && ((perms.hasOwnProperty('canAdmin') && perms.canAdmin) || (perms.hasOwnProperty('canComment') && perms.canComment))) {
            models.Comment.create({
              time: comment.time,
              content: comment.content,
              videoId: comment.video,
              authorId: comment.user.id
            })
              .then((comment) => {
                httpResponse.status(200).json({id: comment.id});
              })
              .catch((err) => {
                httpResponse.status(500).send('problem with db query to add comment '+err);
              });
          }
          else {
            httpResponse.status(500).send('user not permitted to comment on this video');
          }
        })
    })
}

app.get('/api/comment/new', function(req, res) {
  console.log('/api/comment/new');

  if (!req.query.hasOwnProperty('comment')) {
    var msg = 'got no comment data when adding new comment';
    console.log(msg);
    res.status(500).json({msg:msg});
    return;
  }

  var comment = JSON.parse(req.query.comment);
  console.log(comment);

  if (!comment.hasOwnProperty('author')) {
    var msg = 'have to be logged in to add a new comment';
    console.log(msg);
    res.status(500).json({msg:msg});
    return;
  }

  if (!comment.hasOwnProperty('video')) {
    var msg = 'no video id received for new comment.';
    console.log(msg);
    res.status(500).json({msg:msg});
    return;
  }

  // TODO: check that user has permission to comment

  addComment(comment, res);
});

app.get('/api/videos/:vid', function(req, res) {

  console.log('/api/videos/:vid', req.params.vid);
  let userId = -1;
  if (req.query.hasOwnProperty('user')) {
    userId = JSON.parse(req.query.user).id;
  }
  console.log('user requesting:', userId);

  let videoDetails = models.getVideo(req.params.vid, userId);
  videoDetails.then((info) => {
    res.json(info);
  })
  .catch(err=>{
    console.log('error getting video info', err);
  });
});

app.get('/api/videos/:vid/permissions', function(req, res) {
  console.log('/api/videos/:vid/permissions');
  if (!req.query.hasOwnProperty('user')) {
    res.status(500).json({msg: 'must be logged in to admin'});
    return; // exit early if error
  }
  if (!req.params.hasOwnProperty('vid')) {
    res.status(500).json({msg: 'must have videoId in URL to admin'});
    return; // exit early if error
  }
  
  var userId = JSON.parse(req.query.user).id;
  models.User.findById(userId)
    .then((user) => {
      console.log('got user, now get perms');
      return user.permissionsForAdmin(req.params.vid);
    })
    .then((permissions) => {
      console.log('got perms, now send them back');
      res.status(200).json(permissions);
    })
});

app.post('/api/org', function (req, res) {

  // check if we have the name and description and a user to be the owner

  if (req.body.hasOwnProperty('name')) {
    console.log('we found the name', req.body.name);
  }

  if (req.body.hasOwnProperty('name') && req.body.hasOwnProperty('description') && req.body.hasOwnProperty('user')) {
    // TODO: consider making description optional
    var addOrganizationQuery = "insert into organization (name, description, owner) values (?,?,?)";
    
    executeQuery(addOrganizationQuery, [req.body.name, req.body.description, req.body.user.id], function(result) {
      //called for success
      console.log(result);
      res.status(201).json({
        id:result.insertId,
        name: req.body.name
      });

    }, function (err) {
      // called for error
      res.status(400).send('error creating organization: '+err);
    });
  }
  else {
    var errorMessage = 'name, description, and user are all required to create and organization';
    res.status(400).send(errorMessage);
  }
});

app.post('/api/groups', function (req, res) {

  // check if we have the name and description and a user to be the owner

  if (req.body.hasOwnProperty('name')) {
    console.log('we found the name', req.body.name);
  }

  if (req.body.hasOwnProperty('name') && req.body.hasOwnProperty('description') && req.body.hasOwnProperty('user')) {
    // TODO: consider making description optional
    models.User.findById(req.body.user.id)
      .then((user) => {
        console.log('got user', user.id);
        return user.createCreatedGroup({
          name: req.body.name,
          description: req.body.description
        });
      })
      .then((newGroup) => {
        res.status(201).json(newGroup);
      })
      .catch((error) => {
        res.status(400).send('error creating group: '+err);
      });
  }
  else {
    var errorMessage = 'name, description, and user are all required to create and group';
    res.status(400).send(errorMessage);
  }
});

app.get('/api/users/:infix', function(req, res) {
  console.log('infix', req.params.infix);
  models.User.findAll({
    where: {
      name: {
        $like: '%'+req.params.infix+'%'
      }
    }
  })
    .then((users) => {
      console.log(users);
      res.status(200).json(users);  
    })
    .catch((errorMessage) => {
      res.status(204).send(errorMessage);
    });
});

app.get('/api/groups/:userId/:infix', function(req, res) {
  // TODO: respect ManagementPermissions
  models.Group.findAll({
    where: {
      name: {
        $like: '%'+req.params.infix+'%'
      }
    }
  })
    .then((groups) => {
      res.status(200).json(groups);  
    })
    .catch((errorMessage) => {
      res.status(204).send(errorMessage);
    });
});

app.get('/api/orgs/:userId/:infix', function(req, res) {
  // TODO: respect ManagementPermissions
  models.Organization.findAll({
    where: {
      name: {
        $like: '%'+req.params.infix+'%'
      }
    }
  })
    .then((orgs) => {
      res.status(200).json(orgs);  
    })
    .catch((errorMessage) => {
      res.status(204).send(errorMessage);
    });
});

function userCanAdmin(user, video) {
  var userItselfCanAdmin = 'select true from user_privilege where ysuser=? and video=? and permission=5';
  var userInAGroupCanAdmin = 'select true from group_privilege gp join group_member gm on gm.ysgroup=gp.ysgroup where gm.ysuser=? and gp.video=? and gp.permission=5';
  var userInAnOrgCanAdmin = 'select true from organization_privilege op join organization_member om on om.organization=op.organization where om.ysuser=? and op.video=? and op.permission=5';

  return RSVP.all([
    query(userItselfCanAdmin, [user, video]), 
    query(userInAGroupCanAdmin, [user, video]), 
    query(userInAnOrgCanAdmin, [user, video])
  ])
    .then(function (canAdminResults) {
      console.log(canAdminResults);
      if (canAdminResults[0].length > 0 || canAdminResults[1].length > 0 || canAdminResults[2].length > 0) {
        return true;
      } else {
        return false;
      }
    });
}

function dropAllEntitiesPermissionsFromVideo (entities, video) {
  console.log('dropAllEntitiesPermissionsFromVideo (entities, video)');
  console.log(entities, video);
  return Promise.all(Object.keys(entities).map((entityType) => {
    // return Promise.all(entities[entityType].map((entityOfType) => {
      return models.Permission.destroy({
        where: {
          entity: {
            $in: entities[entityType]
          },
          entityType: entityType,
          videoId: video
        }
      });
    // }));
  }));
}

app.post('/api/video/:vid/entity-drop', function (req, res) {
  if (req.body.hasOwnProperty('entities') 
    && req.body.hasOwnProperty('user')) {
    // check that at least right now this user somehow has admin permissions
      models.User.findById(req.body.user)
        .then((user) => {
          return user.canAdminVideo(req.params.vid);
        })
        .then((canAdmin) => {
          if (canAdmin) {
            dropAllEntitiesPermissionsFromVideo(req.body.entities, req.params.vid).then(function () {
              res.status(200).send('dropped permissions');
            });
          } else {
            res.status(403).send('not allowed to admin');
          }
        });
  } else {
    res.status(400).send("entities, user, and permGroup required in body");
  }
});

function addEntityPermissionsForVideo(entityPerm, video) {
  console.log('addEntityPermissionsForVideo(entityPerm, video)');
  console.log(entityPerm, video);
  return models.Permission.create({
    entity: entityPerm.entity.id,
    entityType: entityPerm.permission.entityType,
    view: entityPerm.permission.view,
    comment: entityPerm.permission.comment,
    admin: entityPerm.permission.admin,
    videoId: video
  });
}

app.post('/api/video/:vid/entity-add', function (req, res) {
  if (req.body.hasOwnProperty('entityPerm') 
    && req.body.hasOwnProperty('user')) {

      models.User.findById(req.body.user)
        .then((user) => {
          return user.canAdminVideo(req.params.vid);
        })
        .then((canAdmin) => {
          if (canAdmin) {
            addEntityPermissionsForVideo(req.body.entityPerm, req.params.vid).then(function () {
              res.status(200).send('added permissions');
            });
          } else {
            res.status(403).send('not allowed to admin');
          }
        });
  } else {
    res.status(400).send("entityPerm, user required in body");
  }
});

function updateEntityPermissionsForVideo(entityPerm, video) {
  return models.Permission.findOne({
    where: {
      videoId: video,
      entity: entityPerm.entity.id,
      entityType: entityPerm.permission.entityType,
    }
  })
    .then((perm) => {
      perm.view = entityPerm.permission.view;
      perm.comment = entityPerm.permission.comment;
      perm.admin = entityPerm.permission.admin;
      return perm.save();
    });
}

app.post('/api/video/:vid/entity-mod', function (req, res) {
  if (req.body.hasOwnProperty('entityPerm') 
    && req.body.hasOwnProperty('user')) {

      models.User.findById(req.body.user)
        .then((user) => {
          return user.canAdminVideo(req.params.vid);
        })
        .then((canAdmin) => {
          if (canAdmin) {
            updateEntityPermissionsForVideo(req.body.entityPerm, req.params.vid).then(function () {
              res.status(200).send('modded permissions');
            });
          } else {
            res.status(403).send('not allowed to admin');
          }
        });
  } else {
    res.status(400).send("entityPerm, user required in body");
  }
});

function dropComment (cid) {
  var dropCommentQuery = 'delete from comment where id=?';
  return query(dropCommentQuery, [cid]);
}

app.post('/api/comments/:cid/delete', function (req, res) {
  dropComment(req.params.cid)
    .then(function () {
      res.status(200).send('deleted comment');
    })
    .catch(function (error) {
      res.status(500).send('some problem dropping comment');
    });
});

function updateCommentTime (cid, t) {
  var updateCommentQuery = 'update comment set time=? where id=?';
  return query(updateCommentQuery, [t, cid]);
}


app.post('/api/comments/:cid/time', function (req, res) {
  updateCommentTime(req.params.cid, req.body.time)
    .then(function () {
      res.status(200).send('updated comment time');
    })
    .catch(function (error) {
      res.status(500).send('some problem updating comment time');
    });
});

function updateCommentContent (cid, content) {
  var updateCommentQuery = 'update comment set content=? where id=?';
  return query(updateCommentQuery, [content, cid]);
}

app.post('/api/comments/:cid/content', function (req, res) {
  updateCommentContent(req.params.cid, req.body.content)
    .then(function () {
      res.status(200).send('updated comment content');
    })
    .catch(function (error) {
      res.status(500).send('some problem updating comment content');
    });
});


app.use(express.static(__dirname + '/app'));

var server = app.listen(port, function () {
    console.log('Listening on port %d', server.address().port);

    models.start()
      .then(function () {
        console.log('started, then...');
        return models.Video.getPublicVideos();
      })
      .then(function (videos) {
        console.log('got public videos');
        // console.log('got public videos', videos);
      });
});

