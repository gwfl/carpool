var ionApp = angular.module('ionAppH', ['ionic', 'ngResource', 'mdo-angular-cryptography']);

ionApp.config(function(
  $stateProvider,
  $urlRouterProvider,
  $httpProvider,
  $cryptoProvider,
  $provide
) {
  $stateProvider
    .state('eventmenu', {
      url: '/event',
      abstract: true,
      templateUrl: 'htmplates/menu.html',
      controller: 'MainCtrl',
    })
    .state('eventmenu.main', {
      url: '/main',
      views: {
        menuContent: {
          templateUrl: 'htmplates/main.html',
          controller: 'MainCtrl',
        },
      },
    })
    .state('eventmenu.page1', {
      url: '/page1',
      views: {
        menuContent: {
          templateUrl: 'htmplates/page1.html',
          controller: 'MainCtrl',
        },
      },
    })
    .state('eventmenu.details', {
      url: '/details',
      views: {
        menuContent: {
          templateUrl: 'htmplates/details.html',
          controller: 'MainCtrl',
        },
      },
    });

  $urlRouterProvider.otherwise('/event/main');

  // gwfl:5821f61550e9b39131fe1b6f   rdb:569a2b87566759cf4b984a50
  $httpProvider.defaults.headers.common = {
    'x-apikey': '5821f61550e9b39131fe1b6f',
  };

  $cryptoProvider.setCryptographyKey('alpha1234');
  $provide.value('aat123', 123);
  $provide.factory('bbCrypt', function() {
    return '123bb';
  });

});  // end config

ionApp.run(function($rootScope, dbSvc) {
  
  $rootScope.userRec = {  _id: '',  utilkey: '',  
    jsonData: {  usrnm: '',  accts: [ { xtra: '', pswd: '', acctnm: '' } ] } };
  $rootScope.ngrAA = [];  $rootScope.ngrUU = [];
  $rootScope.gwflRec = {users: [], appkey:'crypto', recID:''};
  $rootScope.aaIdx = 0;  $rootScope.uuIdx = 0;
  $rootScope.vm = { usrnm: '', cryptkey:'', eAES: '', dAES: '', aat123: 0, aatCrypt: '', loginOk: false,  accts:[{acctnm: '', pswd: '', xtra: ''}] };
  $rootScope.encAES = { acctnm: '', pswd: '', xtra: ''};
  $rootScope.decAES = { acctnm: '', pswd: '', xtra: ''};
 
  $rootScope.ngrUU = dbSvc.ngrUtil('{"utilkey":"crypto"}').query(); 
  $rootScope.ngrAA = dbSvc.ngrapp01('{"appkey":"crypto"}').query();
//  $rootScope.ngrAA.$promise.then(function(data) {
//    $rootScope.gwflRec.recID  = $rootScope.ngrAA[0]._id; 
//    angular.copy($rootScope.ngrAA[0].jsData.users, $rootScope.gwflRec.users); 
//  });

/*  // ES5
var add1 = function(a, b) {
  return a + b;
};   console.log("add1:: ", add1(3, 40));
// ES2015
const add2 = (a, b) => a + b;  console.log("add2:: ", add2(3, 45));
*/
/*
  const deleteObj = (data, column, search) => {
    let resultObj = data.filter(m => m[column] == search);
    return resultObj;  
    };
  $rootScope.deleted = deleteObj($rootScope.gwflRec.users, 'usrnm', $rootScope.vm.usrnm.toLowerCase());
//  console.log(' ::deleted:: ', $rootScope.deleted);
*/

});

ionApp.controller('MainCtrl', function(
  $rootScope,$scope,$location,$filter,$timeout,$resource,
  $ionicSideMenuDelegate,$ionicModal,$ionicPopup,
  dbSvc,$crypto) {

  $scope.checkLogin = function() {
    var jj = 0; var ii = 0;
    $rootScope.vm.loginOk = false;
    $rootScope.vm.usrnm = $rootScope.vm.usrnm.toLowerCase();
  //    console.log('rS.vm::', $rootScope.vm);
    angular.forEach($rootScope.ngrUU, function(obj) {      
      if ( !($rootScope.vm.loginOk)  &&  
      obj.jsonData.usrnm.toLowerCase() == $rootScope.vm.usrnm ) {
        $rootScope.vm.loginOk = true;
        $rootScope.uuIdx = jj;
        angular.copy(obj.jsonData.accts,$rootScope.vm.accts);
  //    console.log('copy::', $rootScope.uuIdx, '::', $rootScope.vm);
        ii = 0;
        for (ii = 0; ii < $rootScope.vm.accts.length; ii++) {        
          $rootScope.vm.accts[ii].acctnm = 
          $crypto.decrypt($rootScope.vm.accts[ii].acctnm, $rootScope.vm.cryptkey,256);
        };
  //      console.log('decVMaccts::',$rootScope.vm.accts);
      };
      jj++;
    }); 
    if ( !($rootScope.vm.loginOk) ) {
      alert('Unkown Username.  Please try again using  username: "sample"');
      $rootScope.vm.usrnm = 'sample';
      $rootScope.vm.cryptkey = 'alpha1234';
    }
  };     // end checkLogin

  $scope.aaView = function(aa) {
    $rootScope.aaIdx = aa;
    $rootScope.decAES.acctnm = $rootScope.vm.accts[aa].acctnm;
    $rootScope.decAES.pswd = $crypto.decrypt($rootScope.vm.accts[$rootScope.aaIdx].pswd, $rootScope.vm.cryptkey,256);
    $rootScope.decAES.xtra = $crypto.decrypt($rootScope.vm.accts[$rootScope.aaIdx].xtra, $rootScope.vm.cryptkey,256);

    $location.path('/event/details');
  };

  $scope.encAES = function() {
    //  $rootScope.encAES.acctnm = $crypto.encrypt($rootScope.decAES.acctnm, $rootScope.vm.cryptkey,256);
    $rootScope.encAES.pswd = $crypto.encrypt($rootScope.decAES.pswd, $rootScope.vm.cryptkey,256);
    $rootScope.encAES.xtra = $crypto.encrypt($rootScope.decAES.xtra, $rootScope.vm.cryptkey,256);

    $rootScope.vm.accts[$rootScope.aaIdx].pswd = $rootScope.encAES.pswd;
    $rootScope.vm.accts[$rootScope.aaIdx].xtra = $rootScope.encAES.xtra;

    // $rootScope.gwflRec.users[$rootScope.uuIdx] = ;
    $rootScope.gwflRec.users[$rootScope.uuIdx].accts[$rootScope.aaIdx].pswd = 
      $rootScope.encAES.pswd;
    $rootScope.gwflRec.users[$rootScope.uuIdx].accts[$rootScope.aaIdx].xtra = 
      $rootScope.encAES.xtra;
  };

$scope.saveRec = function() {
dbSvc.ngrUtil().get({id: '5ed997272d9d125d00016725'}).$promise.then(function(urec) {
  urec.usrnm = 'samplex';
  urec.$save();
}); 
};   //  $scope.saveRec();

  $scope.newRec = function() {
    $scope.encAES();
    console.log('$vm.user::', $rootScope.aaIdx, " :: ",  $rootScope.encAES);
    var vnrUtil = dbSvc.ngrUtil();
    var newRec1 = new vnrUtil();
    $rootScope.newRecID = newRec1;
    newRec1.utilkey = 'crypto';
    newRec1.jsonData = JSON.stringify($rootScope.gwflRec.users[$rootScope.uuIdx]);
    // console.log('$save', newRec1);
    newRec1.$save();
  };

});

// DB Service
ionApp.factory('dbSvc', function($rootScope, $http, $resource) {
  var _getMeta = function() {
    $http
      .get('https://gwfl-256d.restdb.io/rest/app01/_meta')
      .success(function(jsData) {
        $rootScope.getMeta = jsData;
      });
  };

  var _ngrapp01 = function(xp) {
    var url = 'https://gwfl-256d.restdb.io/rest/app01';
    if (xp > ' ') {
      url += '?&q=' + xp;
    } else {
      url += '/:id';
    }
    return $resource(
      url,
      {
        id: '@_id',
      },
      {
        update: {
          method: 'PUT',
        },
      }
    );
  };

  var _ngrUtil = function(xp) {
    var url = 'https://gwfl-256d.restdb.io/rest/utility';
    if (xp > ' ') {
      url += '?&q=' + xp;
    } else {
      url += '/:id';
    }
    return $resource(
      url,
      {
        id: '@_id',
      },
      {
        update: {
          method: 'PUT',
        },
      }
    );
  };

  return {
    getMeta: _getMeta,
    ngrUtil: _ngrUtil, 
    ngrapp01: _ngrapp01 
  };

});

ionApp.factory('aatCrypt', function() {
  return '123a';
});
