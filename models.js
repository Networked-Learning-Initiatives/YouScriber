'use strict';
var Sequelize = require('sequelize');
var sequelize = new Sequelize(
  process.env.YS_DB, // database name
  process.env.YS_USER, // username
  process.env.YS_PASS, // password
  // { logging: console.log } // log all sql queries
  { logging: false } // log NO sql queries
);
var DROPTABLES = true;

console.log('process.env.YS_DROP', '|'+process.env.YS_DROP+'|');

if (process.env.YS_DROP === true || process.env.YS_DROP === 'true') {
  DROPTABLES = true;
}

// polyfill Promise.filter
// thanks to bluebird docs for implementation of Promise.filter
if (!('filter' in Promise)) { 
  Promise.filter = function (valuesToBeFiltered, filterer) {
    return Promise.map(valuesToBeFiltered, function(value, index, length) {
      return Promise.all([filterer(value, index, length), value]);
    }).then(function(values) {
      return values.filter(function(stuff) {
        return stuff[0] == true
      }).map(function(stuff) {
        return stuff[1];
      });
    });
  };
}

let PUBLIC_GROUP = null;
let TEST_USER = null;

let READ_PERM = null;
let AUTHOR_PERM = null;
let EDIT_PERM = null;
let DELETE_PERM = null;
let ADMIN_PERM = null;
let OWNER_PERM = null;

let ENTITY_TYPE_USER = 'user';
let ENTITY_TYPE_GROUP = 'group';
let ENTITY_TYPE_ORG = 'organization';

const NULL_USER_ID = -1;

function flatten(array, mutable) {
  var toString = Object.prototype.toString;

  var result = [];
  var nodes = (mutable && array) || array.slice();
  var node;

  if (!array.length) {
    return result;
  }

  node = nodes.pop();

  do {
    if (Array.isArray(node)) {
      nodes.push.apply(nodes, node);
    } else {
      result.push(node);
    }
  } while (nodes.length && (node = nodes.pop()) !== undefined);

  result.reverse(); // we reverse result to restore the original order
  return result;
}


var Group = sequelize.define('group', {
  name: Sequelize.STRING,
  description: Sequelize.TEXT,
});

var Organization = sequelize.define('organization', {
  name: Sequelize.STRING,
  description: Sequelize.TEXT,
});

// var OrganizationGroup = sequelize.define('organization_group', {
//   pending: Sequelize.BOOLEAN
// });

var GroupMembership = sequelize.define('group_membership', {
  pending: Sequelize.BOOLEAN
});

var OrganizationMembership = sequelize.define('organization_membership', {
  pending: Sequelize.BOOLEAN
});


var Video = sequelize.define('video', {
  title: Sequelize.STRING,
  ytid: Sequelize.STRING,   
  thumbnail: Sequelize.STRING,
  duration: Sequelize.INTEGER
}, {
  classMethods: {
    getPublicVideos: () => {
      return Video.findAll({
        include: [{
          model: Permission,
          where: {
            entityType: ENTITY_TYPE_GROUP,
            entity: PUBLIC_GROUP.get('id'),
            view: true
          },
        },
        {
          model: Comment
        }]
      });
    }
  },
  instanceMethods: {
    publicPermissions: function () {
      var returnVals = {
        canView: false,
        canComment: false
      };
      return Permission.findOne({
        where: {
          entity: PUBLIC_GROUP.get('id'),
          entityType: ENTITY_TYPE_GROUP,
          videoId: this.id
        }
      }).then((permission) => {
        if (permission.get('view')) {
          returnVals.canView = true;
        }
        if (permission.get('comment')) {
          returnVals.canComment = true;
        }
        return returnVals;
      })
    }
  }
});

var Comment = sequelize.define('comment', {
  time: Sequelize.FLOAT(8,3),
  content: Sequelize.TEXT,
});

var Permission = sequelize.define('permission', {
  view: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false},
  comment: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false},
  admin: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false},
  entity: Sequelize.INTEGER,
  entityType: Sequelize.ENUM(
    ENTITY_TYPE_USER,
    ENTITY_TYPE_GROUP,
    ENTITY_TYPE_ORG)
});

Permission.belongsTo(Video);
Video.hasMany(Permission);

var ManagementPermission = sequelize.define('management_permission', {
  videos: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false},
  memberships: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false},
  managerEntity: Sequelize.INTEGER,
  managerEntityType: Sequelize.ENUM(
    ENTITY_TYPE_USER,
    ENTITY_TYPE_GROUP,
    ENTITY_TYPE_ORG),
  managedEntity: Sequelize.INTEGER,
  managedEntityType: Sequelize.ENUM(
    ENTITY_TYPE_USER,
    ENTITY_TYPE_GROUP,
    ENTITY_TYPE_ORG)
});

var User = sequelize.define('user', {
  name: {type: Sequelize.STRING, unique: true},
  pwhash: Sequelize.STRING,   // is hashed client-side before storing
  email: Sequelize.STRING,
}, {
  instanceMethods: {
    getConfirmedGroups: function () {
      return Group.findAll({
        include: [{
          model: GroupMembership,
          where: {
            pending: false,
            userId: this.id
          }          
        }, {
          model: Organization
        }]
      });
    },
    getConfirmedOrgs: function () {
      return Promise.all([
        Organization.findAll({
          include: [{
            model: OrganizationMembership,
            where: {
              pending: false,
              userId: this.id
            }
          }]
        }),
        this.getConfirmedGroups()
          .then(function (groups) {
            return Promise.all(groups.map((group) => {
              return group.getOrganization();
            }))
          })
          .then((orgs) => {
            return orgs.filter((org) => {
              return org !== null;
            });
          })
      ])
        .then((results) => {
          var orgs = [];
          var orgIds = [];
          results.forEach((orgList) => {
            orgList.forEach((org) => {
              if (org && orgIds.indexOf(org.id) < 0) {
                orgs.push(org);
              }
            });
          });
          return orgs;
        });
    },
    maxPermsForVideo: function (videoId) {

      var returnVals = {
        canView: false,
        canComment: false,
        canAdmin: false,
      };
      return this.getCreatedVideo()
        .then((videos) => {
          console.log('createdVideos for', this.id, 'looking for', videoId);
          var found = false;
          for (var i = 0; i < videos.length; i++) {
            if (videos[i].id == videoId) { // type coercion bc videoId comes from request (as string)
              found = true;
              break;
            }
          }
          if (found) {
            console.log('did find video in created');
            return {
              canView: false,
              canComment: false,
              canAdmin: true,
            };
          } else {
            return Promise.all([
              // get permissions for this user for video
              Permission.find({
                where: {
                  videoId: videoId,
                  entityType: ENTITY_TYPE_USER,
                  entity: this.id
                }
              }),

              this.getConfirmedGroups()
                .then((groups) => {
                  return Promise.all([
                    Permission.find({ // get permissions for this video for the groups this user is a member of
                      where: {
                        videoId: videoId,
                        entityType: ENTITY_TYPE_GROUP,
                        entity: {
                          in: groups.map((group) => {
                            return group.get('id');
                          })
                        }
                      }
                    }),

                    groups.map((group) => {
                      return group.getOrganization()
                        .then((org) =>{
                          return Permission.find({ // get permissions for this video for the orgs this user's groups are in
                            where: {
                              videoId: videoId,
                              entityType: ENTITY_TYPE_ORG,
                              entity: org.get('id')
                            }
                          });
                        })
                    })
                  ])
                }),
            
              this.getConfirmedOrgs()
                .then((orgs) => {
                  return Permission.find({ // get permissions for this video for the groups this user is a member of
                    where: {
                      videoId: videoId,
                      entityType: ENTITY_TYPE_ORG,
                      entity: {
                        in: orgs.map((org) => {
                          return org.get('id');
                        })
                      }
                    }
                  })
                })
            ])
              .then((permissionsSets) => {
                permissionsSets.reduce((a, b) => {
                  return a.concat(b);
                }, []).forEach((permission) => {
                  if (permission) {
                    if (permission.view) {
                      returnVals.canView = true;
                    }
                    if (permission.comment) {
                      returnVals.canComment = true;
                    }
                    if (permission.admin) {
                      returnVals.canAdmin = true;
                    }
                  }
                });
                console.log('returning maxPerms');
                return returnVals;
              });
            
          }
        })
    },
    permissionsForAdmin: function (videoId) {
      console.log('permissionsForAdmin', videoId);
      return this.maxPermsForVideo(videoId)
        .then((perms) => {
          console.log('gotmaxperms for admin');
          console.log(perms);
          if (perms && perms.hasOwnProperty('canAdmin') && perms.canAdmin) {
            console.log('so we can admin!');
            return Promise.all([
              Permission.findAll({
                where: {
                  videoId: videoId,
                  entityType: ENTITY_TYPE_USER
                }
              })
                .then((userPerms) => {
                  console.log('about to map userperms');
                  return Promise.all(userPerms.map((userPerm) => {
                    // console.log(userPerm);
                    return User.findById(userPerm.entity)
                      .then((permHoldingUser) => {
                        // console.log([permHoldingUser, userPerm]);
                        return {
                          entity: permHoldingUser, 
                          permission: userPerm
                        };
                      });

                  }));
                }),
              Permission.findAll({
                where: {
                  videoId: videoId,
                  entityType: ENTITY_TYPE_GROUP
                }
              })
                .then((groupPerms) => {
                  return Promise.all(groupPerms.map((groupPerm) => {
                    return Group.findById(groupPerm.entity)
                      .then((permHoldingGroup) => {
                        return {
                          entity: permHoldingGroup, 
                          permission: groupPerm
                        };
                      });
                  }));
                }),
              Permission.findAll({
                where: {
                  videoId: videoId,
                  entityType: ENTITY_TYPE_ORG
                }
              })
                .then((orgPerms) => {
                  return Promise.all(orgPerms.map((orgPerm) => {
                    return Organization.findById(orgPerm.entity)
                      .then((permHoldingOrg) => {
                        return {
                          entity: permHoldingOrg, 
                          permission: orgPerm
                        };
                      });

                  }));
                }),
            ])
              .then((permissionsForVideo) => {
                console.log('permissionsForVideo');
                console.log(permissionsForVideo);
                return {
                  user: permissionsForVideo[0],
                  group: permissionsForVideo[1],
                  organization: permissionsForVideo[2] 
                };
              });
          } else {
            return [];
          }
        })
        .catch((err) => {
          console.error(err);
        });
    },
    canAdminVideo: function (videoId) {
      return this.maxPermsForVideo(videoId)
        .then((perms) => {
          return perms && perms.hasOwnProperty('canAdmin') && perms.canAdmin;
        });
    },
    getManagementPerms: function () {
      // get perms for this user
      // get this user's groups,
      //    get these groups' perms
      //    get these groups' orgs
      //        get these orgs' perms
      // get this user's orgs
      //    get these orgs' perms
      return Promise.all([
        // get permissions for this user for video
        ManagementPermission.findAll({
          where: {
            managerEntity: this.id,
            managerEntityType: ENTITY_TYPE_USER,
            $or: [
              {
                videos: true
              }, {
                memberships: true
              }
            ]
          }
        })
          .then((mps) => {
            return Promise.all(mps.map((mp) => {
              return {
                entity: this,
                permission: mp
              };
            }));
          }),

        this.getConfirmedGroups()
          .then((groups) => {
            return Promise.all([
              ManagementPermission.findAll({
                where: {
                  managerEntity: {
                    in: groups.map((group) => {
                      return group.id;
                    })
                  },
                  managerEntityType: ENTITY_TYPE_GROUP,
                  $or: [
                    {
                      videos: true
                    }, {
                      memberships: true
                    }
                  ]
                }
              })
                .then((mps) => {
                  return Promise.all(mps.map((mp) => {
                    return Group.findById(mp.managerEntity)
                      .then((group) => {
                        return {
                          entity: group,
                          permission: mp
                        };
                      });
                  }));
                }),

              Promise.all(groups.map((group) => {
                return group.getOrganization()
                  .then((org) => {
                    if (org) {
                      console.log('org');
                      console.log(org);
                      return ManagementPermission.findAll({
                        where: {
                          managerEntity: org.id,
                          managerEntityType: ENTITY_TYPE_ORG,
                          $or: [
                            {
                              videos: true
                            }, {
                              memberships: true
                            }
                          ]
                        }
                      })
                        .then((mps) => {
                          return Promise.all(mps.map((mp) => {
                            return {
                              entity: org,
                              permission: mp
                            };
                          }));
                        });
                    } else {
                      return null;
                    }
                  });
              }))
            ])
          }),
      
        this.getConfirmedOrgs()
          .then((orgs) => {
            return ManagementPermission.findAll({
              where: {
                managerEntity: {
                  in: orgs.map((org) => {
                    return org.get('id');
                  })
                },
                managerEntityType: ENTITY_TYPE_ORG,
                $or: [
                  {
                    videos: true
                  }, {
                    memberships: true
                  }
                ]
              }
            })
              .then((mps) => {
                return Promise.all(mps.map((mp) => {
                  return Organization.findById(mp.managerEntity)
                    .then((org) => {
                      return {
                        entity: org,
                        permission: mp
                      };
                    });
                }));
              });
          })
      ])
        .then((permissionsSets) => {
          // console.log('permissionsSets');
          // console.log(permissionsSets);
          console.log('permissionsSets[1]');
          console.log(permissionsSets[1]);
          console.log('permissionsSets[1][1]');
          console.log(permissionsSets[1][1]);
          Promise.all(permissionsSets[1][1]).then((idk) => {
            console.log('idk');
            console.log(idk);
          })
          console.log('permissionsSets[1].length');
          console.log(permissionsSets[1].length);
          var flattened = flatten(permissionsSets).filter((obj) => {
            return !(obj === null);
          });
          console.log('flattened');
          console.log(flattened);
          return flattened;
        });
    }
  }
});



Group.belongsTo(User, {as: 'creator'});
User.hasMany(Group, {as: 'createdGroup', foreignKey: 'creatorId'});

Organization.belongsTo(User, {as: 'creator'});
User.hasMany(Organization, {as: 'createdOrganization', foreignKey: 'creatorId'});

// User.belongsToMany(Group, { through: GroupMembership});
User.hasMany(GroupMembership);
GroupMembership.belongsTo(User);
// Group.belongsToMany(User, { through: GroupMembership});
Group.hasMany(GroupMembership);
GroupMembership.belongsTo(Group);

Group.hasMany(GroupMembership);
Organization.hasMany(OrganizationMembership);

Group.belongsTo(Organization);
Organization.hasMany(Group);

// User.belongsToMany(Organization, {through: OrganizationMembership});
User.hasMany(OrganizationMembership);
OrganizationMembership.belongsTo(User);
// Organization.belongsToMany(User, {through: OrganizationMembership});
Organization.hasMany(OrganizationMembership);
OrganizationMembership.belongsTo(Organization);

Video.belongsTo(User, {as: 'creator'});
User.hasMany(Video, {as: 'createdVideo', foreignKey: 'creatorId'});

Video.hasMany(Comment);
Comment.belongsTo(Video);
Comment.belongsTo(User, {as: 'author'});


exports.User = User;
exports.Group = Group;
exports.Video = Video;
exports.Comment = Comment;
exports.Organization = Organization;
// exports.GroupMembership = GroupMembership;
// exports.OrganizationMembership = OrganizationMembership;
exports.Permission = Permission;

exports.ENTITY_TYPE_GROUP = ENTITY_TYPE_GROUP;
exports.ENTITY_TYPE_ORG = ENTITY_TYPE_ORG;
exports.ENTITY_TYPE_USER = ENTITY_TYPE_USER;

exports.userAddsVideo = (options) => {
  return Video.create({
    title: options.title,
    ytid: options.ytid,
    thumbnail: options.thumbnail,
    duration: options.duration, 
    creatorId: options.creatorId                     
  });
};

exports.attemptLogin = (loginInfo) => {
  console.log('attempt login with', loginInfo);
  return User.findOne({
    where: {
      name: loginInfo.user,
      pwhash: loginInfo.pwHash
    }
  }).then(user => {
    if (user && user.get('id')) {
      return Promise.all([
        user,
        user.getConfirmedGroups(),
        user.getConfirmedOrgs(),
        user.getManagementPerms()
      ]);
    } else {
      console.log('has no id');
    }
  });
};

exports.getVideo = (videoId, userId) => {

  if (userId !== NULL_USER_ID) {
    // have a logged in user
    console.log('have a logged in user');
    return User.findById(userId).then((authedUser) => {
      console.log('found user');
      return authedUser.maxPermsForVideo(videoId);
    })
      .then((permissions) => {
        console.log('found maxperms');
        return Video.findById(videoId, {
          include: [{
            model: Comment,
            include: [{
              model: User,
              as: 'author'
            }]
          }]
        })
          .then((video) => {
            if (Object.keys(permissions).length > 0) {
              return {video: video, can: permissions};
            } else {
              return {};
            }
          });
      });
  } else {
    // anonymous user
    return Video.findById(videoId, {
      include: [
        {
          model: Comment
        },
        {
          model: Permission,
          where: {
            entityType: ENTITY_TYPE_GROUP,
            entity: PUBLIC_GROUP.get('id')
          }
        },
      ]
    }).then((video) => {
      console.log('gonna can it');
      return video.publicPermissions().then((permissions) => {
        return {video: video, can: permissions};
      })
    });
  }
};


exports.start = () => {
  return sequelize.sync({force: DROPTABLES, logging: false}) // Use {force:true} only for updating the above models, it drops all current data
    .then(() => {
      console.log('sync"ed db. dropped tables:', DROPTABLES);
    })
    .then(() => {
      return User.findOrCreate({
        where: {
          email: 'admin@youscriber.com',
          name: 'admin',
          pwhash: '21232f297a57a5a743894a0e4a801fc3', // md5 hash of admin
        } 
      });
    })
    .spread(() => {
      return User.findOrCreate({
        where: {
          email: 'test@youscriber.com',
          name: 'test',
          pwhash: '098f6bcd4621d373cade4e832627b4f6', // md5 hash of test
        } 
      })
      .spread(testUser => {
        TEST_USER = testUser;
        return Group.findOrCreate({
          where: {
            name: 'Public',
            description: 'All YouScribers',
          }, 
        });
      })
      .spread(pubGroup => {
        PUBLIC_GROUP = pubGroup;
        return Organization.findOrCreate({
          where: {
            name: 'VT',
            description: 'Virginia Polytechnic Institute and State University, popularly known as Virginia Tech, is a public, land-grant, research university with a main campus in Blacksburg, Virginia, educational facilities in six regions statewide, and a study-abroad site in Switzerland. The commonwealth\'s third-largest university and its leading research institution, Virginia Tech offers 225 undergraduate and graduate degree programs to some 31,000 students and manages a research portfolio of $496 million. The university fulfills its land-grant mission of transforming knowledge to practice through technological leadership and by fueling economic growth and job creation locally, regionally, and across Virginia.',
          }, 
        })
          .spread(vtOrg => {
            return Group.findOrCreate({
              where: {
                name: 'ICG',
                description: 'Innovation Catalyst Group in TLOS at Virginia Tech.',
                organizationId: vtOrg.id
              }, 
            })
            .spread(icgGroup => {
            return Organization.findOrCreate({
              where: {
                name: 'CHI',
                description: 'Premier Professional Organization for Human-Computer Interaction',
              }, 
            })
            .spread((chiOrg) => {
              return Video.findOrCreate({
                where: {
                  title: 'True Facts About The Tarsier',
                  ytid: '6Jz0JcQYtqo',
                  thumbnail: 'http://i1.ytimg.com/vi/6Jz0JcQYtqo/mqdefault.jpg',
                  duration: 134,
                  creatorId: TEST_USER.id
                },
              })
              .spread(tarsierVideo => {
                return Promise.all([
                  Comment.findOrCreate({
                    where: {
                      videoId: tarsierVideo.id,
                      time: 2.3,
                      content: '<p>yay tarsier!!</p>',
                      authorId: TEST_USER.id
                    }
                  }),
                  GroupMembership.findOrCreate({
                    where: {
                      userId: TEST_USER.id,
                      groupId: PUBLIC_GROUP.id,
                      pending: false,
                    },
                  }),
                  GroupMembership.findOrCreate({
                    where: {
                      userId: TEST_USER.id,
                      groupId: icgGroup.id,
                      pending: false,
                    },
                  }),
                  ManagementPermission.findOrCreate({ // test user can manage ICG
                    where: {
                      videos: true,
                      memberships: true,
                      managerEntity: TEST_USER.id,
                      managerEntityType: ENTITY_TYPE_USER,
                      managedEntity: icgGroup.id,
                      managedEntityType: ENTITY_TYPE_GROUP
                    }
                  }),
                  ManagementPermission.findOrCreate({ // all icg can manage VT
                    where: {
                      videos: true,
                      memberships: true,
                      managerEntity: icgGroup.id,
                      managerEntityType: ENTITY_TYPE_GROUP,
                      managedEntity: vtOrg.id,
                      managedEntityType: ENTITY_TYPE_ORG
                    }
                  }),
                  // OrganizationMembership.findOrCreate({
                  //   where: {
                  //     userId: TEST_USER.id,
                  //     organizationId: vtOrg.id,
                  //     pending: false,
                  //   },
                  // }),
                  Permission.findOrCreate({
                    where: {
                      entity: TEST_USER.id,
                      entityType: ENTITY_TYPE_USER,
                      admin: true,
                      // comment: true,
                      videoId: tarsierVideo.id,
                    },
                  }),
                  Permission.findOrCreate({
                    where: {
                      entity: PUBLIC_GROUP.id,
                      entityType: ENTITY_TYPE_GROUP,
                      view: true,
                      comment: true,
                      videoId: tarsierVideo.id,
                    },
                  })
                ])
                  .then(() => {
                    console.log('seeding complete');
                  })
                  .catch(err => {
                    console.log('error in seeding', err);
                  });
              });
            });
          });
        });
      });
    })
    .then(() => {
      if (DROPTABLES) {
        console.log('Testing: All Table Data Dropped');
      }
      console.info('Tables Synced');
      return true;
    })
    .catch(error => {
      console.error(error);
    });
};