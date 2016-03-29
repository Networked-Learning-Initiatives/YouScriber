angular.module('youScriberApp').directive('settingsTab', function () {
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
    templateUrl: 'views/directives/settings-tab.html',
    link: function (scope, elem, attrs) {
      // TODO: make sure we don't add an entity that already has permissions

      // starting permissions for newly added entity
      scope.newEntityPermissions = {
        view: true,
        comment: false,
        admin: false
      };

      scope.finalPermissions = scope.initialPermissions.map((perm) => {
        return {
          entity: {
            name: perm.entity.name,
            id: perm.entity.id
          },
          permission: {
            view: perm.permission.view,
            comment: perm.permission.comment,
            admin: perm.permission.admin,
            entityType: perm.permission.entityType
          },
          modified: false
        };
      });

      scope.newEntity = {
        name: ''
      };

      scope.addNewEntityPermission = function () {
        scope.finalPermissions.push({
          entity: {
            name: scope.newEntity.name,
            id: scope.newEntity.id
          },
          permission: {
            view: scope.newEntityPermissions.view,
            comment: scope.newEntityPermissions.comment,
            admin: scope.newEntityPermissions.admin,
            entityType: scope.entityName.toLowerCase() // TODO: why tolowercase?!
          },
          new: true
        });

        // reset the newEntity model and permissions vars 
        // (so that a 2nd newentity [of this type] can be added)
        scope.newEntity = {
          name: ''
        };
        scope.newEntityPermissions = {
          view: true,
          comment: false,
          admin: false
        };
      };

      scope.revokeAll = function (permEntityId) {
        var toDelete = -1;
        for (var i = 0; i < scope.finalPermissions.length; i++) {
          if (scope.finalPermissions[i].entity.id === permEntityId) {
            toDelete = i;
            break;
          }
        }
        if (toDelete > -1) {
          scope.revokees.push(scope.finalPermissions.splice(toDelete, 1)[0].entity.id);
        }
      };
    }
  }
});