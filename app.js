var ionApp = angular.module('ionAppH', [
  'ionic',
  'ngResource',
  'mdo-angular-cryptography',
]);

ionApp.config(function(
  $stateProvider,
  $urlRouterProvider,
  $httpProvider,
  $cryptoProvider,
  $provide
) {
  $stateProvider
    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'htmplates/menu.html',
      controller: 'MainCtrl',
    })
    .state('app.main', {
      url: '/main',
      views: {
        menuContent: {
          templateUrl: 'htmplates/main.html',
          controller: 'MainCtrl',
        },
      },
    })
    .state('app.login', {
      url: '/login',
      views: {
        menuContent: {
          templateUrl: 'htmplates/login.html',
          controller: 'MainCtrl',
        },
      },
    })
    .state('app.details', {
      url: '/details',
      views: {
        menuContent: {
          templateUrl: 'htmplates/details.html',
          controller: 'MainCtrl',
        },
      },
    });

  $urlRouterProvider.otherwise('/app/main');

  // gwfl:5821f61550e9b39131fe1b6f   rdb:569a2b87566759cf4b984a50
  $httpProvider.defaults.headers.common = {
    'x-apikey': '5821f61550e9b39131fe1b6f',
  };

  $cryptoProvider.setCryptographyKey('alpha1234');
  $provide.value('aat123', 123);
  $provide.factory('bbCrypt', function() {
    return '123bb';
  });
}); // end config

ionApp.run(function($rootScope, dbSvc) {
  $rootScope.userRec = {
    _id: '',
    utilkey: 'crypto',
    jsonData: { usrnm: '', accts: [] },
  };
  $rootScope.ngrAA = [];
  $rootScope.ngrUU = [];
  $rootScope.aaIdx = 0;
  $rootScope.uuIdx = 0;
  $rootScope.vm = {
    usrnm: '',
    cryptkey: '',
    eAES: '',
    dAES: '',
    aat123: 0,
    aatCrypt: '',
    loginOk: false,
    signup: false,
    inSession: false,
    accts: [{ acctnm: '', pswd: '', xtra: '' }],
  };
  $rootScope.encAES = { acctnm: 'encacct', pswd: 'encpass', xtra: 'encxtra' };
  $rootScope.decAES = { acctnm: '', pswd: '', xtra: '' };

  $rootScope.ngrUU = dbSvc.ngrUtil('{"utilkey":"crypto"}').query();
  $rootScope.ngrAA = dbSvc.ngrapp01('{"appkey":"crypto"}').query();
});

ionApp.controller('MainCtrl', function(
  $rootScope,
  $scope,
  $location,
  $filter,
  $timeout,
  $resource,
  $state,
  $ionicSideMenuDelegate,
  $ionicModal,
  $ionicPopup,
  dbSvc,
  $crypto
) {

  if (! $rootScope.vm.loginOk) {
    $state.go('app.login');
  };

  $scope.checkLogin = function() {
    if ($rootScope.vm.cryptkey == '' || $rootScope.vm.usrnm == '') {
      alert('You must enter a username and a crypt key!');
    } else {
      $scope.userMatch();
      if ($rootScope.vm.loginOk) {
        $rootScope.vm.signup = false;
        $rootScope.vm.inSession = true;
      } else {
        if ($rootScope.vm.signup) {
          $scope.addUsername();
          $rootScope.vm.loginOk = true;
          $rootScope.vm.inSession = true;
        } else {
          alert(
            'Unkown Username - Click OK to SignUp  >> ' + $rootScope.vm.usrnm
          );
          $rootScope.vm.signup = true;
          $rootScope.vm.loginOk = true;
          $rootScope.vm.inSession = false;
        }
      }
    }
    console.log('checkLogin:: ', $rootScope.userRec);
    if ( $rootScope.vm.inSession) {
      $state.go('app.main');
    };
  }; // end checkLogin

  $scope.userMatch = function() {
    var jj = 0;
    var ii = 0;
    $rootScope.vm.loginOk = false;
    $rootScope.vm.usrnm = $rootScope.vm.usrnm.toLowerCase();
    if ( $rootScope.vm.usrnm == 'sample') {
      $rootScope.vm.cryptkey = 'alpha1234';  // ** sample alpha1234
    };

    angular.forEach($rootScope.ngrUU, function(uuObj) {
      if (
        !$rootScope.vm.loginOk &&
        uuObj.jsonData.usrnm.toLowerCase() == $rootScope.vm.usrnm
      ) {
        $rootScope.vm.loginOk = true;
        $rootScope.uuIdx = jj;
        $rootScope.userRec.jsonData.usrnm = $rootScope.vm.usrnm;
        $rootScope.userRec._id = $rootScope.ngrUU[jj]._id;
        $rootScope.userRec.utilkey = $rootScope.ngrUU[jj].utilkey;
        $rootScope.userRec.jsonData.accts = JSON.parse(JSON.stringify($rootScope.ngrUU[jj].jsonData.accts));
        $rootScope.vm.accts = JSON.parse(JSON.stringify($rootScope.userRec.jsonData.accts));

        ii = 0;
        for (ii = 0; ii < $rootScope.vm.accts.length; ii++) {
          $rootScope.vm.accts[ii].acctnm = $crypto.decrypt(
            $rootScope.vm.accts[ii].acctnm,
            $rootScope.vm.cryptkey,
            256
          );
        }
      }
      jj++;
    });
  }; // end userMatch

  $scope.addUsername = function() {
    var vSU = dbSvc.ngrUtil();
    var vsu1 = new vSU();
    $rootScope.userRec = {
    _id: '',
    utilkey: 'crypto',
    jsonData: { usrnm: '', accts: [] },
  };
    $rootScope.userRec.jsonData.usrnm = $rootScope.vm.usrnm;
    vsu1.utilkey = 'crypto';
    vsu1.usrnmx = $rootScope.vm.usrnm;
    vsu1.jsonData = JSON.stringify($rootScope.userRec.jsonData);
    vsu1.$save(function() {
      var qq = '{"usrnmx":"' + $rootScope.vm.usrnm + '"}';
      $rootScope.ngrUU = dbSvc.ngrUtil(qq).query();
      $rootScope.ngrUU.$promise.then(function(data) {
        $scope.userMatch();
      });
    });
    $rootScope.vm.accts = [];
    $rootScope.aaIdx = -1;
    $state.go('app.main');
  }; // end addUsername()

  $scope.addAcct = function() {
    $rootScope.decAES = {acctnm: '', pswd: '', xtra: ''};
    $rootScope.vm.accts.push($rootScope.decAES);   
    $rootScope.userRec.jsonData.accts.push($rootScope.decAES);  
    $rootScope.aaIdx = $rootScope.vm.accts.length - 1;
  }; // end addAcct()

  $scope.updAcct = function() {
    $scope.encAES1();
    $rootScope.vm.accts[$rootScope.aaIdx] = JSON.parse(JSON.stringify($rootScope.encAES));
    $rootScope.userRec.jsonData.accts[$rootScope.aaIdx] = JSON.parse(JSON.stringify($rootScope.encAES));;
    console.log('updAcct:1:', $rootScope.aaIdx, "::", $rootScope.userRec.jsonData.accts[$rootScope.aaIdx].acctnm, "::", $rootScope.vm.accts[$rootScope.aaIdx].acctnm);

    $rootScope.vm.accts[$rootScope.aaIdx].acctnm = $rootScope.decAES.acctnm;
    console.log('updAcct:1a:', $rootScope.aaIdx, "::", $rootScope.userRec.jsonData.accts[$rootScope.aaIdx].acctnm);    
    $rootScope.decAES = {acctnm: '', pswd: '', xtra: ''};
    console.log('updAcct::', $rootScope.aaIdx, "::", $rootScope.userRec);

    // write updated ngrUU
    dbSvc
      .ngrUtil()
      .get({ id: $rootScope.userRec._id })
      .$promise.then(function(urec) {
        urec.jsonData = JSON.stringify($rootScope.userRec.jsonData);
        urec.$save();
      });
    
    $state.go('app.main');
  }; // end updAcct()

  $scope.aaView = function(aa) {
    $rootScope.aaIdx = aa;
    $rootScope.decAES.acctnm = $rootScope.vm.accts[aa].acctnm;
    $rootScope.decAES.pswd = $crypto.decrypt(
      $rootScope.vm.accts[$rootScope.aaIdx].pswd,
      $rootScope.vm.cryptkey,
      256
    );
    $rootScope.decAES.xtra = $crypto.decrypt(
      $rootScope.vm.accts[$rootScope.aaIdx].xtra,
      $rootScope.vm.cryptkey,
      256
    );
  };

  $scope.encAES1 = function() {
    $rootScope.encAES.acctnm = $crypto.encrypt(
      $rootScope.decAES.acctnm, 
      $rootScope.vm.cryptkey,
      256
    );
    $rootScope.encAES.pswd = $crypto.encrypt(
      $rootScope.decAES.pswd,
      $rootScope.vm.cryptkey,
      256
    );
    $rootScope.encAES.xtra = $crypto.encrypt(
      $rootScope.decAES.xtra,
      $rootScope.vm.cryptkey,
      256
    );
  };

  $scope.saveRec = function() {
/*  $scope.encAES1();
    dbSvc
      .ngrUtil()
      .get({ id: '5ed997272d9d125d00016725' })
      .$promise.then(function(urec) {
        urec.usrnm = 'samplex';
        urec.$save();
      });
*/
  }; //  $scope.saveRec();

  $scope.newRec = function() {
    $scope.encAES1();
    console.log('$vm.user::', $rootScope.aaIdx, ' :: ', $rootScope.encAES);
    var vnrUtil = dbSvc.ngrUtil();
    var newRec1 = new vnrUtil();
    newRec1.utilkey = 'crypto';
    newRec1.jsonData = JSON.stringify($rootScope.userRec.jsonData);
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
    ngrapp01: _ngrapp01,
  };
});

ionApp.factory('aatCrypt', function() {
  return '123a';
});

//  $rootScope.ngrAA.$promise.then(function(data) { $scope.userMatch();
//    $rootScope.userRec.recID  = $rootScope.ngrAA[0]._id;
//    JSON.parse(JSON.stringify($rootScope.ngrAA[0].jsData.users, $rootScope.userRec);
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
  $rootScope.deleted = deleteObj($rootScope.userRec, 'usrnm', $rootScope.vm.usrnm.toLowerCase());
//  console.log(' ::deleted:: ', $rootScope.deleted);


nameApp.controller('ListCtrl', function($scope, $state) {
  $scope.changePage = function(){
    $state.go('view', {movieid: 1});
  }    
});
 
nameApp.controller('ViewCtrl', function($scope, $stateParams, $ionicHistory) {
  console.log($stateParams.movieid);
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }    
});
*/
