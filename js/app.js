var app = angular.module('musecast', []);

app.constant('APP_ID', "8fe893fe-f4ba-4b4d-b824-e83c4578471f_1"); // qa

app.factory('castApi', function($q) {
  var deferred = $q.defer();

  function initializeApi() {
    deferred.resolve(new window.cast.Api());
  }

  if (window.cast && window.cast.isAvailable) {
    initializeApi();
  } else {
    window.addEventListener('message', function(event) {
      if (event.source == window && event.data &&
          event.data.source == "CastApi" &&
          event.data.event == "Hello") {
        initializeApi();
      }
    });
  }

  return deferred.promise;
});

app.factory('receivers', function(APP_ID, $q, castApi) {
  var deferred = $q.defer();
  return castApi.then(function(castApi) {
    castApi.addReceiverListener(APP_ID, function(list) {
      deferred.resolve(list);
    });
    return deferred.promise;
  });
});

app.controller('ReceiverController', function(APP_ID, $scope, castApi, receivers) {
  var api = $scope.api = null;
  $scope.activity = null;
  $scope.receivers = [];

  castApi.then(function(castApi) {
    api = $scope.api = castApi;
  });

  receivers.then(function(list) {
    angular.copy(list, $scope.receivers);
  });

  $scope.launch = function(receiver) {
    var request = new cast.LaunchRequest(APP_ID, receiver);
    // request.description = new cast.LaunchDescription();
    api.launch(request, function(activity) {
      $scope.activity = activity;
      $scope.$digest();
    });
  }

  $scope.stopActivity = function() {
    if (!$scope.activity) return;
    try {
      api.stopActivity($scope.activity.activityId, angular.noop);
    } catch (e) {
      console.log("Caught an error in api.stopActivity");
    }
    $scope.activity = null;
    $scope.status = null;
  }

  $scope.setText = function(text) {
    if (!$scope.activity) return;
    api.sendMessage($scope.activity.activityId, "muse", {
      text: text
    }, angular.noop);
  }

  $scope.setImage = function(img) {
    if (!$scope.activity) return;
    api.sendMessage($scope.activity.activityId, "muse", {
      image: img
    }, angular.noop);
  }
});
