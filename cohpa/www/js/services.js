angular.module('starter.services', [])

.factory('Art', function($http) {
  var API = 'https://cohpa.larryeparks.com/api/art/';
  var art = {};
  
  art.findNearby = function (currentLoc) {
    return $http.get(API + 'near/' + currentLoc);
  };
  
  art.getDetails = function(art) {
    return $http.get(API + art);
  };
  
  art.saveToHistory = function(item) {
    var history = this.getHistory() || [];
    history.push(item);
    window.localStorage.setItem('cohpa-history', JSON.stringify(history));
  };
  
  art.getHistory = function() {
    return JSON.parse(window.localStorage.getItem('cohpa-history'));
  };
  
  art.removeFromHistory = function(art) {
    var history = this.getHistory() || [];
    var newHistory = history.filter(function (h) {
      if (h._id !== art._id) return h;
    });
    
    window.localStorage.setItem('cohpa-history', JSON.stringify(newHistory));
  };
  
  art.addLike = function(art) {
    return $http.post(API + art._id + '/like'); 
  };
  
  art.saveLike = function(art) {
    var history = this.getHistory() || [];
    history.forEach(function (h) {
      if (h._id === art._id) {
        h.isLiked = true;
        window.localStorage.setItem('cohpa-history', JSON.stringify(history));
      } else {
        return;
      }
    });
  };
  
  art.getLikes = function () {
    return JSON.parse(window.localStorage.getItem('cohpa-likes'));
  };
  
  art.getTotal = function () {
    return $http.get(API + 'total/');
  };

  return art;
});
