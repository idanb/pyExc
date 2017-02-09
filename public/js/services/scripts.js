angular.module('scriptsService', []).factory('Scripts', ['$http',function($http) {
		return {
			get : function() {
				return $http.get('/api/scripts');
			},
            run : function(name) {
                return $http.get('/api/script/' + name);
            },
			create : function(scriptData) {
				return $http.post('/api/scripts', scriptData);
			},
			delete : function(name) {
				return $http.delete('/api/script/' + name);
			},
            update : function(script_id, scriptData) {
                return $http.put('/api/script/' + script_id, scriptData);
            }
		}
	}]);