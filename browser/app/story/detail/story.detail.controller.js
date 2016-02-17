'use strict';

app.controller('StoryDetailCtrl', function ($scope, story, users) {
	$scope.story = story;
	console.log(story)
	$scope.users = users;
	$scope.$watch('story', function () {
		$scope.story.save();
	}, true);
});