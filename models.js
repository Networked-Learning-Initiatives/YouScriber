'use strict';
var Sequelize = require('sequelize');
var sequelize = new Sequelize(
  process.env.YS_DB, // database name
  process.env.YS_USER, // username
  process.env.YS_PASS, // password
  { logging: function () {} }
);
var DROPTABLES = false;

console.log('process.env.YS_DROP', '|'+process.env.YS_DROP+'|');

if (process.env.YS_DROP === true || process.env.YS_DROP === 'true') {
  DROPTABLES = true;
}

let PUBLIC_GROUP = null;
let READ_PERM = null;

var User = sequelize.define('user', {
  name: {type: Sequelize.STRING, unique: true},
  pwhash: Sequelize.STRING,   // is hashed client-side before storing
  email: Sequelize.STRING,
});

var Group = sequelize.define('group', {
  title: Sequelize.STRING,
  description: Sequelize.TEXT,
});

var Organization = sequelize.define('organization', {
  title: Sequelize.STRING,
  description: Sequelize.TEXT,
});

var OrganizationGroup = sequelize.define('organization_group', {
});

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
});

var Comment = sequelize.define('comment', {
  time: Sequelize.FLOAT(8,3),
  content: Sequelize.TEXT,
});

var Permission = sequelize.define('permission', {
  name: Sequelize.STRING,
});

var UserPrivilege = sequelize.define('user_privilege', {
});

var GroupPrivilege = sequelize.define('group_privilege', {
});

var OrganizationPrivilege = sequelize.define('organization_privilege', {
});


Group.belongsTo(User, {as: 'Creators'});
User.hasMany(Group, {as: 'CreatedGroups'});

Organization.belongsTo(User, {as: 'Creators'});
User.hasMany(Organization, {as: 'CreatedOrganizations'});

Group.hasMany(GroupMembership, {as: 'Memberships'});
GroupMembership.belongsTo(Group);
User.hasMany(GroupMembership, {as: 'Groups'});
GroupMembership.belongsTo(User);


Organization.hasMany(OrganizationMembership, {as: 'Memberships'});
OrganizationMembership.belongsTo(Organization);
User.hasMany(OrganizationMembership, {as: 'Organizations'});
OrganizationMembership.belongsTo(User);

Video.belongsTo(User, {as: 'Creators'});
User.hasMany(Video, {as: 'CreatedVideos'});

Video.hasMany(Comment);
Comment.belongsTo(Video);
Comment.belongsTo(User, {as: 'Authors'});


User.hasMany(UserPrivilege, {as: 'Privilege'});
UserPrivilege.belongsTo(User);
UserPrivilege.belongsTo(Permission);
Permission.hasMany(UserPrivilege);
UserPrivilege.belongsTo(Video);

Group.hasMany(GroupPrivilege, {as: 'Privileges'});

GroupPrivilege.belongsTo(Group);
GroupPrivilege.belongsTo(Permission);
// Permission.hasMany(GroupPrivilege); // not sure it's appropriate to link in this direction
GroupPrivilege.belongsTo(Video);
Video.hasMany(GroupPrivilege);


Organization.hasMany(OrganizationPrivilege, {as: 'Privileges'});
OrganizationPrivilege.belongsTo(Organization);
OrganizationPrivilege.belongsTo(Permission);
// Permission.hasMany(OrganizationPrivilege); // not sure it's appropriate to link in this direction
OrganizationPrivilege.belongsTo(Video);
Video.hasMany(OrganizationPrivilege);

OrganizationGroup.belongsTo(Organization);
OrganizationGroup.belongsTo(Group);

Group.hasMany(OrganizationGroup);
Organization.hasMany(OrganizationGroup);


exports.User = User;
exports.Group = Group;
exports.Video = Video;
exports.Comment = Comment;
exports.Organization = Organization;
exports.GroupMembership = GroupMembership;
exports.OrganizationMembership = OrganizationMembership;
exports.Permission = Permission;
exports.UserPrivilege = UserPrivilege;
exports.GroupPrivilege = GroupPrivilege;
exports.OrganizationPrivilege = OrganizationPrivilege;
exports.OrganizationGroup = OrganizationGroup;


function publicVideos () {
  return Video.findAll({
    include: [{
      model: GroupPrivilege,
      include: [{
        model: Group,
        where: {
          id: PUBLIC_GROUP.id
        }
      }, {
        model: Permission,
        where: {
          id: READ_PERM.id
        }
      }]
    }]
  });
}

exports.publicVideos = publicVideos;

exports.start = function () {
  return sequelize.sync({force: DROPTABLES}) // Use {force:true} only for updating the above models, it drops all current data
    .then( function () {
      console.log('sync"ed db. dropped tables:', DROPTABLES);
    })
    .then( function () {
      return User.findOrCreate({
        where: {
          email: 'admin@youscriber.com',
          name: 'public',
          pwhash: '4c9184f37cff01bcdc32dc486ec36961', // md5 hash of test
        } 
      });
    })
    .spread(function (publicUser, publicUserCreated) {
      return User.findOrCreate({
        where: {
          email: 'test@youscriber.com',
          name: 'test',
          pwhash: '098f6bcd4621d373cade4e832627b4f6', // md5 hash of test
        } 
      })
      .spread(function (testUser, userCreated) {
        return Permission.findOrCreate({
          where: {
            name: 'delete', 
          }
        })
        .then(function () {
          return Permission.findOrCreate({
            where: {
              name: 'author', 
            }
          });
        })
        .then(function () {
          return Permission.findOrCreate({
            where: {
              name: 'edit', 
            }
          });
        })
        .then(function () {
          return Permission.findOrCreate({
            where: {
              name: 'read', 
            }
          });
        })
        .spread(function (readPerm, readPermCreated) {
          READ_PERM = readPerm;
          return Permission.findOrCreate({
            where: {
              name: 'admin', 
            }
          })
          .spread(function (adminPerm, adminPermCreated) {
            return Permission.findOrCreate({
              where: {
                name: 'owner', 
              }
            })
            .spread(function (ownerPerm, ownerPermCreated) {
              // make some example data: group, org, video, comments, give test user access
              return Group.findOrCreate({
                where: {
                  title: 'Public',
                  description: 'All YouScribers',
                }, 
              })
              .spread(function (pubGroup, pubGroupCreated) {
                PUBLIC_GROUP = pubGroup;
                return Group.findOrCreate({
                  where: {
                    title: 'NLI',
                    description: 'Networked Learning Initiatives (NLI), formerly the Faculty Development Institute (FDI), is a centralized, cross-discipline professional development program available to all Virginia Tech faculty, staff, and students. As a unit of Technology-enhanced Learning and Online Strategies (TLOS), NLI facilitates and leverages campus-wide partnerships to offer programming and training opportunities designed to foster technology integration and increase digital fluency for faculty, staff, and students at Virginia Tech.',
                  }, 
                })
                .spread(function (nliGroup, groupCreated) {
                  return Organization.findOrCreate({
                    where: {
                      title: 'VT',
                      description: 'Virginia Polytechnic Institute and State University, popularly known as Virginia Tech, is a public, land-grant, research university with a main campus in Blacksburg, Virginia, educational facilities in six regions statewide, and a study-abroad site in Switzerland. The commonwealth\'s third-largest university and its leading research institution, Virginia Tech offers 225 undergraduate and graduate degree programs to some 31,000 students and manages a research portfolio of $496 million. The university fulfills its land-grant mission of transforming knowledge to practice through technological leadership and by fueling economic growth and job creation locally, regionally, and across Virginia.',
                    }, 
                  })
                  .spread(function (vtOrg, orgCreated) {
                    return Video.findOrCreate({
                      where: {
                        title: 'True Facts About The Tarsier',
                        ytid: '6Jz0JcQYtqo',
                        thumbnail: 'http://i1.ytimg.com/vi/6Jz0JcQYtqo/mqdefault.jpg',
                        duration: 134,
                      },
                    })
                    .spread(function (tarsierVideo, videoCreated) {
                      return Promise.all([
                        GroupMembership.findOrCreate({
                          where: {
                            userId: testUser.id,
                            groupId: pubGroup.id,
                            pending: false,
                          },
                        }),
                        GroupMembership.findOrCreate({
                          where: {
                            userId: testUser.id,
                            groupId: nliGroup.id,
                            pending: false,
                          },
                        }),
                        OrganizationMembership.findOrCreate({
                          where: {
                            userId: testUser.id,
                            organizationId: vtOrg.id,
                            pending: false,
                          },
                        }),
                        UserPrivilege.findOrCreate({
                          where: {
                            userId: testUser.id,
                            permissionId: ownerPerm.id,
                            videoId: tarsierVideo.id,
                          },
                        }),
                        GroupPrivilege.findOrCreate({
                          where: {
                            groupId: pubGroup.id,
                            permissionId: readPerm.id,
                            videoId: tarsierVideo.id,
                          },
                        }),
                      ])
                        .then(something => {
                          console.log('promise.all then', something);
                        })
                        .catch(something => {
                          console.log('promise.all catch', something);
                        });
                    });
                  });
                });
              });
            });
          });
        });
      });
    })
    .then( function () {
      if (DROPTABLES) {
        console.log('Testing: All Table Data Dropped');
      }
      console.info('Tables Synced');
      return true;
    })
    .catch(function (error) {
      console.error(error);
    });
};