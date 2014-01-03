var app = angular.module('rcvr', ['ngAnimate']);

app.run(function() {
  console.log('ok');
})

app.constant('APP_ID', "8fe893fe-f4ba-4b4d-b824-e83c4578471f_1"); // qa

app.constant('NAMESPACES', [cast.receiver.RemoteMedia.NAMESPACE, "muse"]);

app.factory('receiver', function(APP_ID, NAMESPACES) {
  return new cast.receiver.Receiver(APP_ID, NAMESPACES);
});

app.controller('ImagesController', function($scope, receiver, $timeout) {
  var nextImg = "image1";
  $scope.image1 = null;
  $scope.image2 = null;

  setImage = function(src) {
    var img = nextImg;
    nextImg = (nextImg == "image1") ? "image2" : "image1";
    var lastImg = nextImg;
    $scope[lastImg] = null;
    $timeout(function() {
      $scope[img] = src;
    }, 1100)
  }

  var museHandler = new cast.receiver.ChannelHandler('muse');
  museHandler.addChannelFactory(receiver.createChannelFactory('muse'));

  museHandler.onMessage = function(msg) {
    if (msg.message.image !== undefined)
      setImage(msg.message.image);
      $scope.$digest();
      // document.getElementById('bkg').src = msg.message.image;
  }

  receiver.start();
});
