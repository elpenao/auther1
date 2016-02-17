"use strict";

app.controller('SignUpCtrl', function ($scope, $http, AuthFactory) {

	$scope.signupUser = function () {
		console.log($scope.email)
		AuthFactory.createUser({email:$scope.signupForm.email.$viewValue, password: $scope.signupForm.password.$viewValue})
	}


});