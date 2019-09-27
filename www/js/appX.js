// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var myApp = angular.module('ionicAppH', ['ionic', 'firebase', 'ngResource']);

myApp.run(function($ionicPlatform) {
})
myApp.run(function($ionicPlatform, $rootScope, dbSvc) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });

  dbSvc.initGet;

  $rootScope.appLog = '1';
});
myApp.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    // setup an abstract state for the tabs directive
    .state('tab', {
      url: "/tab",
      abstract: true,
      templateUrl: "templates/tabs.html"
    })

    // Each tab has its own nav history stack:

    .state('tab.dash', {
      url: '/dash',
      views: {
        'tab-dash': {
          templateUrl: 'templates/tab1.html',
          controller: 'MainCtrl' // DashCtrl'
        }
      }
    })

    .state('tab.friends', {
      url: '/friends',
      views: {
        'tab-friends': {
          templateUrl: 'templates/tab2.html',
          controller: 'MainCtrl'   //  FriendsCtrl'
        }
      }
    })

    .state('tab.account', {
      url: '/account',
      views: {
        'tab-account': {
          templateUrl: 'templates/tab0.html',
          controller: 'MainCtrl'   // AccountCtrl'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/dash');
});
myApp.controller('DashCtrl', function($scope, fireBaseData, $firebase) {
      $scope.expenses = $firebase(fireBaseData.refExpenses()).$asArray();
        $scope.user = fireBaseData.ref().getAuth();
      //ADD MESSAGE METHOD
      $scope.addExpense = function(e) {
          $scope.expenses.$add({
            by: $scope.user.password.email,
            label: $scope.label,
              cost: $scope.cost
          });
          $scope.label = "";
          $scope.cost = 0;
      };
        $scope.getTotal = function () {
            var i, rtnTotal = 0;
            for (i = 0; i < $scope.expenses.length; i = i + 1) {
                rtnTotal = rtnTotal + $scope.expenses[i].cost;
            }
            return rtnTotal;
        };
})
myApp.controller('FriendsCtrl', function($scope, fireBaseData, $firebase) {
        $scope.user = fireBaseData.ref().getAuth();
        $scope.expenses = $firebase(fireBaseData.refExpenses()).$asArray();
        $scope.roomies = $firebase(fireBaseData.refRoomMates()).$asArray();
        $scope.roomies.$loaded().then(function(array) {
           var i;
            //array = [[set1_rm1_email, set1_rm2_email], [set2_rm1_email, set2_rm2_email] ...]
            for (i = 0; i < array.length; i = i + 1) {
               if (array[i][0] === $scope.user.password.email) {
                   $scope.roomiesEmail = array[i][1];
               } else if (array[i][1] === $scope.user.password.email) {
                   $scope.roomiesEmail = array[i][0];
               }
            }
            $scope.$apply();
            //Yes this whole app, front-end to backend is built only for two room-mates situation
        });
        $scope.addExpense = function(e) {
            $scope.expenses.$add({
                by: $scope.roomiesEmail,
                label: $scope.label,
                cost: $scope.cost
            });
            $scope.label = "";
            $scope.cost = 0;
        };
        $scope.getTotal = function () {
            var i, rtnTotal = 0;
            for (i = 0; i < $scope.expenses.length; i = i + 1) {
                rtnTotal = rtnTotal + $scope.expenses[i].cost;
            }
            return rtnTotal;
        };
})
myApp.controller('AccountCtrl', function($scope, fireBaseData, $firebase) {
        $scope.showLoginForm = false;
        //Checking if user is logged in
        $scope.user = fireBaseData.ref().getAuth();
        if (!$scope.user) {
            $scope.showLoginForm = true;
        }
        //Login method
        $scope.login = function (em, pwd) {
            fireBaseData.ref().authWithPassword({
                email    : em,
                password : pwd
            }, function(error, authData) {
                if (error === null) {
                    console.log("User ID: " + authData.uid + ", Provider: " + authData.provider);
                    $scope.user = fireBaseData.ref().getAuth();
                    $scope.showLoginForm = false;
                    $scope.$apply();
                    /*var r = $firebase(fireBaseData.refRoomMates()).$asArray();
                    r.$add(["k@gmail.com","r@gmail.com"]);*/
                } else {
                    console.log("Error authenticating user:", error);
                }
            });
        };
        //Logout method
        $scope.logout = function () {
            fireBaseData.ref().unauth();
            $scope.showLoginForm = true;
        };
});
/**
 * A simple example service that returns some data.
 */
myApp.factory('fireBaseData', function($firebase) {
  var ref = new Firebase("https://luminous-fire-3429.firebaseio.com/"),
      refExpenses = new Firebase("https://luminous-fire-3429.firebaseio.com/expenses"),
      refRoomMates = new Firebase("https://luminous-fire-3429.firebaseio.com/room-mates");
  return {
    ref: function () {
      return ref;
    },
    refExpenses: function () {
      return refExpenses;
    },
    refRoomMates: function () {
      return refRoomMates;
    }
  }
});

myApp.controller('MainCtrl', function($rootScope, $scope, $timeout, dbSvc)  {

// Ionic uses AngularUI Router which uses the concept of states
   // 5a6b9e9da07bee72000109a7   5ae78ec6150b711200002e1a   5879174153893a6e000036e5
// $scope.timer = function() {
  var rsScore = dbSvc.scoreById.get(  {recId:'5ae78ec6150b711200002e1a'}, function() {
    $rootScope.appLog += 'x' + rsScore.idx;
    $rootScope.vGm = angular.copy(rsScore.vGMstats);
    localStorage.setItem('ls_vGMstats', JSON.stringify(rsScore.vGMstats));
  });
  $rootScope.appLog += 'y' + Date.now();

    dbSvc.scoreById.update({recId:'5ae78ec6150b711200002e1a'}, {type: "rbyb-00", idx: Date.now(), vGMstats: $rootScope.vGm});

//  $timeout($scope.timer, 1500);    // 1.5 second delay
// };
// $timeout($scope.timer, 50);  

$rootScope.resetGM = function() {
  localStorage.removeItem('ls_vGMstats'); // clear();   
  $rootScope.vGm = JSON.parse(localStorage.getItem('ls_vGM00'));
  dbSvc.scoreById.update({recId:'5879174153893a6e000036e5'}, {type: "rbyb-00", idx: Date.now(), vGMstats: $rootScope.vGm});
  localStorage.setItem('ls_vGMstats', JSON.stringify($rootScope.vGm));
};

});
myApp.factory('dbSvc', function ($resource, $http) {

  var _httpGet = function () {   // recMqVmgrTh17ixkj     // recKbHjCbXLbJuSuJ
    $http.get('https://api.airtable.com/v0/app0hohtq4b1nM0Kb/Players/recMqVmgrTh17ixkj?api_key=key66fQg5IghIIQmb')  
      .success(function (jsonData) {
        localStorage.setItem('ls_vGM00', jsonData.fields.vGMstats);
    });
  };

//    return $resource('https://api.airtable.com/v0/app0hohtq4b1nM0Kb/Players?api_key=key66fQg5IghIIQmb');

  var _scoreById = function () {
    var url = 'https://gwfl-256d.restdb.io/rest/scores/:recId?apikey=5821f61550e9b39131fe1b6f';    //  5a6b9e9da07bee72000109a7   5879174153893a6e000036e5
    return $resource(url,      
    { recId: '@_id' }, 
    { update: { method: 'PUT' } }
  )};
  
  return {
    initGet: _httpGet(),
//    allSongs: _allSongs().query(),
    scoreById: _scoreById()
  };
});
