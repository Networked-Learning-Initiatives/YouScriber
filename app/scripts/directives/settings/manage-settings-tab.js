/* global angular */
angular.module('youScriberApp').directive('manageSettingsTab', function () {
  return {
    restrict: 'E',
    scope: {
      'entityName': '=',
      'initialPermissions': '=',
      'finalPermissions': '=',
      'search': '=',
      'revokees': '=',
      'userId': '='
    },
    replace: true,
    templateUrl: 'views/directives/manage-settings-tab.html',
    link: function (scope, elem, attrs) {
      // TODO: make sure we don't add an entity that already has permissions

      // starting permissions for newly added entity
      scope.newEntityPermissions = {
        videos: true,
        memberships: false
      }

      scope.finalPermissions = scope.initialPermissions.map((perm) => {
        return {
          entity: {
            name: perm.entity.name,
            id: perm.entity.id,
            type: perm.entityType
          },
          permissions: perm.permissions.map((singlePerm) => {
            return {
              videos: singlePerm.perm.videos,
              memberships: singlePerm.perm.memberships,
              entityType: singlePerm.perm.managerEntityType,
              entity: singlePerm.perm.manager.id
            }
          }),
          modified: false
        }
      })

      scope.newEntity = {
        name: '',
        type: ''
      }

      scope.addNewEntityPermission = function () {
        scope.finalPermissions.push({
          entity: {
            name: scope.newEntity.name,
            id: scope.newEntity.id
          },
          permissions: [{ // how is any of this gonna work?
            videos: scope.newEntityPermissions.videos,
            memberships: scope.newEntityPermissions.memberships,
            entityType: scope.entityName.toLowerCase(),
            entity: scope.entityName.toLowerCase()
          }],
          new: true
        })

        // reset the newEntity model and permissions vars
        // (so that a 2nd newentity [of this type] can be added)
        scope.newEntity = {
          name: ''
        }
        scope.newEntityPermissions = {
          view: true,
          comment: false,
          admin: false
        }
      }

      scope.revokeAll = function (permEntityId) {
        var toDelete = -1
        for (var i = 0; i < scope.finalPermissions.length; i++) {
          if (scope.finalPermissions[i].entity.id === permEntityId) {
            toDelete = i
            break
          }
        }
        if (toDelete > -1) {
          scope.revokees.push(scope.finalPermissions.splice(toDelete, 1)[0].entity.id)
        }
      }
    }
  }
})
