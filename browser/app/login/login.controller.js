'use strict';

app.controller('LoginCtrl', function ($scope, $http, AuthFactory) {
	
	$scope.submitLogin = function () {
		AuthFactory.loginUser({email:$scope.loginForm.email.$viewValue, password: $scope.loginForm.password.$viewValue})
	}

});