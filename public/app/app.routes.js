angular.module('appRoutes', ['ngRoute'])

	.config(function($routeProvider, $locationProvider) {
		$routeProvider
			.when('/', {
				templateUrl: 'app/views/pages/home.html',
				controller: 'MainController',
				controllerAs: 'main'
			})
			.when('/login', {
				templateUrl: 'app/views/pages/login.html'
			})
			.when('/signup', {
				templateUrl: 'app/views/pages/signup.html'
			})
			.when('/all_stories', {
				templateUrl: 'app/views/pages/all_stories.html',
				controller: 'AllStoriesController',
				controllerAs: 'story',
				resolve: {
					stories: function(Story) {
						return Story.allStories();
					}
				}
			})

		$locationProvider.html5Mode(true);
	})