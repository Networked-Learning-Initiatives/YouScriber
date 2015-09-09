'use strict';
var Sequelize = require('sequelize');
var sequelize = new Sequelize(
  process.env.YS_DB, // database name
  process.env.YS_USER, // username
  process.env.YS_PASS, // password
  { logging: function () {} }
);
var DROPTABLES = false;
if (process.env.YS_DROP === true) {
  DROPTABLES = true;
}


var User = sequelize.define('user', {
  name: {type: Sequelize.STRING, unique: true},
  pwhash: Sequelize.STRING,   // is hashed client-side before storing
  email: Sequelize.STRING,
});

var Group = sequelize.define('group', {
  title: Sequelize.STRING,
  description: Sequelize.STRING,
});

var Organization = sequelize.define('organization', {
  title: Sequelize.STRING,
  description: Sequelize.STRING,
});

var OrganizationGroup = sequelize.define('organization_group', {
});

var GroupMembership = sequelize.define('group_membership', {
  pending: Sequelize.BOOLEAN
});

var OrganizationMembership = sequelize.define('organization_membership', {
  pending: Sequelize.BOOLEAN
});


var Video = sequelize.define('user', {
  title: Sequelize.STRING,
  ytid: Sequelize.STRING,   
  thumbnail: Sequelize.STRING,
  duration: Sequelize.INTEGER
});

var Comment = sequelize.define('comment', {
  time: Sequelize.FLOAT(8,3),
  content: Sequelize.STRING,
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


Group.belongsTo(User, {as: 'Creator'});
User.hasMany(Group, {as: 'CreatedGroup'});

Organization.belongsTo(User, {as: 'Creator'});
User.hasMany(Organization, {as: 'CreatedOrganization'});

Group.hasMany(GroupMembership, {as: 'Membership'});
GroupMembership.belongsTo(Group);

Organization.hasMany(OrganizationMembership, {as: 'Membership'});
OrganizationMembership.belongsTo(Organization);

Video.belongsTo(User, {as: 'Creator'});
User.hasMany(Video, {as: 'CreatedVideo'});

Video.hasMany(Comment);
Comment.belongsTo(Video);
Comment.belongsTo(User, {as: 'Author'});


User.hasMany(UserPrivilege, {as: 'Privilege'});
UserPrivilege.belongsTo(User);
UserPrivilege.belongsTo(Permission);
Permission.hasMany(UserPrivilege);
UserPrivilege.belongsTo(Video);

Group.hasMany(GroupPrivilege, {as: 'Privilege'});

GroupPrivilege.belongsTo(Group);
GroupPrivilege.belongsTo(Permission);
// Permission.hasMany(GroupPrivilege); // not sure it's appropriate to link in this direction
GroupPrivilege.belongsTo(Video);
Video.hasMany(GroupPrivilege);


Organization.hasMany(OrganizationPrivilege, {as: 'Privilege'});
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

exports.start = function () {
  return sequelize.sync({force: DROPTABLES}) // Use {force:true} only for updating the above models, it drops all current data
    .then( function () {
      return User.findOrCreate({
        where: {
          email: 'test@youscriber.com',
          name: 'test',
          pwhash: '098f6bcd4621d373cade4e832627b4f6', // md5 hash of test
        } 
      });
    })
    .then(function (newUserResult) {
      return Permission.findOrCreate({
        where: {
          name: 'read', 
        }
      })
        .then(function () {
          return Permission.findOrCreate({
            where: {
              name: 'author', 
            }
          })
        })
        .then(function () {
          return Permission.findOrCreate({
            where: {
              name: 'edit', 
            }
          })
        })
        .then(function () {
          return Permission.findOrCreate({
            where: {
              name: 'delete', 
            }
          })
        })
        .then(function () {
          return Permission.findOrCreate({
            where: {
              name: 'admin', 
            }
          })
        })
        .then(function () {
          return Permission.findOrCreate({
            where: {
              name: 'owner', 
            }
          })
        })
        .then(function () {
          // make some example data: group, org, video, comments, give test user access
          return Group.findOrCreate({
            where: {
              title: 'NLI',
              description: 'Networked Learning Initiatives (NLI), formerly the Faculty Development Institute (FDI), is a centralized, cross-discipline professional development program available to all Virginia Tech faculty, staff, and students. As a unit of Technology-enhanced Learning and Online Strategies (TLOS), NLI facilitates and leverages campus-wide partnerships to offer programming and training opportunities designed to foster technology integration and increase digital fluency for faculty, staff, and students at Virginia Tech.'
            }, 
          })
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