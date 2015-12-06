angular.module('MyApp', ['appRoutes', 'mainController', 'authService', 'userController', 
	'userService', 'storyService', 'storyController', 'reverseDirective'])	

	.config(function($httpProvider) {
		$httpProvider.interceptors.push('AuthInterceptor');
	})