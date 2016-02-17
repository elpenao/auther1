'use strict';

app.factory("AuthFactory", function ($http, $state) {

	var currentUser = false;

	return {
		createUser: function (user) {
			$http.post('/api/users', user)
			.then(function (data) {
				console.log('posted do we get data back?', data)
				currentUser = true;
				$state.go('stories')
			})
		},
		loginUser: function (user) {
			$http.post('/login', user)
			.then(function (data) {
				console.log('posted do we get data back?', data)
				currentUser = true;
				$state.go('stories')
			})
		},
		logout: function () {
			$http.put('logout')
			.then(function () {
				currentUser = false;
				$state.go('home')
			})
		},
		getCurrentUser: function () {
			return currentUser
		},
		getByCookie: function () {
			return $http.get('validsession')
			.then(function (response) {
				console.log(response)
				return response.data
			})
		}
	}

})