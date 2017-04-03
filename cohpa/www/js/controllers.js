angular.module('starter.controllers', [])

.controller('ArtDetailCtrl', function($scope, $stateParams, Art, $ionicLoading, $rootScope) {
  $scope.mapCenter = {};
  $scope.markers = {};
  $scope.markers.detailMarker = {};
  
  $scope.tiles = {
    url: 'http://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}',
    options: {
      attribution: '<a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> | <a href="http://giscience.uni-hd.de/">GIScience Research Group</a>'
    }
  };
  
  $ionicLoading.show({
    template: 'Loading...'
  });
  
  Art.getDetails($stateParams.artId)
    .success(function(data) {
      $scope.art = data;
      
      var history = Art.getHistory() || [];
      history.forEach(function (h) {
        if (h._id === $scope.art._id) $scope.inHistory = true;
      });
      
      $scope.mapCenter.lat = $scope.markers.detailMarker.lat = $scope.art.location.coordinates[1];
      $scope.mapCenter.lng = $scope.markers.detailMarker.lng = $scope.art.location.coordinates[0];
      $scope.mapCenter.zoom = 16;
    })
    .error(function(error) {
      console.log(error);
    })
    .finally(function () {
      $ionicLoading.hide();
    });
    
  $scope.saveToHistory = function (art) {
    var historyObj = {
      _id: art._id,
      title: art.title,
      artist: art.artist
    };
    Art.saveToHistory(historyObj);
    $scope.inHistory = true;
    $rootScope.$emit('Update history');
  };
})

.controller('NearbyCtrl', function($scope, Art, $ionicLoading, $rootScope) {
  $scope.mapCenter = {};
  $scope.tiles = {
    url: 'http://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}',
    options: {
      attribution: '<a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> | <a href="http://giscience.uni-hd.de/">GIScience Research Group</a>'
    }
  };
  
  $scope.doRefresh = function () {
    getList();
  };
  
  getList();
  function getList() {
    var markers = {};
    $ionicLoading.show({
      template: 'Loading...'
    });
    navigator.geolocation.getCurrentPosition(function (position) {
      var myLocation = [];
      myLocation.push(position.coords.longitude);
      myLocation.push(position.coords.latitude);
      
      $scope.mapCenter.lat = position.coords.latitude;
      $scope.mapCenter.lng = position.coords.longitude;
      $scope.mapCenter.zoom = 10;
      
      $scope.listLength = 0;
      
      Art.findNearby(myLocation)
        .success(function (data) {
          var nearbyArt = data;
          
          $scope.nearbyArt = nearbyArt;
          
          var history = Art.getHistory() || [];
          $scope.nearbyArt.forEach(function (a) {
            history.forEach(function (h) {
              if (h._id === a._id) a.inHistory = true;
            });
            
            if (!a.inHistory) {
              markers[a._id] = {};
              markers[a._id].lat = a.location.coordinates[1];
              markers[a._id].lng = a.location.coordinates[0];
              
              $scope.listLength++;
            }
          });
          
          $rootScope.$emit('Update markers', markers);
          
          $scope.markers = markers;
        })
        .error(function (error) {
          console.log(error);
        })
        .finally(function () {
          $ionicLoading.hide();
          $scope.$broadcast('scroll.refreshComplete');
        });
    });
  }
  
  $rootScope.$on('Update List', function () {
    getList();
  });
})

.controller('ExploreCtrl', function ($scope, $rootScope) {
  $rootScope.$on('Update markers', function (event, markers) {
    $scope.markers = markers;
  });
})

.controller('HistoryCtrl', function($scope, Art, $ionicLoading, $rootScope) {
  $scope.history = Art.getHistory();
  
  getTotalArt();
  function getTotalArt() {
    $ionicLoading.show({
      template: 'Loading...'
    });
    Art.getTotal()
    .success(function (data) {
      $scope.total = data.total;
    })
    .error(function (error) { 
      console.log(error);
      $scope.total = 472;
    })
    .finally(function () {
      $ionicLoading.hide();
    });
  }
  
  $scope.removeFromHistory = function (art) {
    Art.removeFromHistory(art);
    $scope.history = Art.getHistory();
  };
  
  $scope.addLike = function (art) {
    if (!art.isLiked) {
      $ionicLoading.show({
        template: 'Loading...'
      });
      Art.addLike(art)
      .success(function (data) {
        Art.saveLike(art);
        $scope.history = Art.getHistory();
      })
      .error(function (error) {
        console.log(error);
      })
      .finally(function () {
        $ionicLoading.hide();
      });
    }
  };
  
  $scope.shareArt = function (art) {
    var options = {
      message: 'I saw ' + art.title + ' using Houston Art Hunt. Check it out!',
      subject: art.title,
      url: 'https://cohpa.larryeparks.com',
      chooserTitle: 'Pick an app'
    };
    
    var onSuccess = function (result) {
      
    };
    
    var onError = function (msg) {
      alert('Unable to share. Please try again later.');
    };
    
    window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
  };
  
  $rootScope.$on('Update history', function() {
    $scope.history = Art.getHistory();
  });
})