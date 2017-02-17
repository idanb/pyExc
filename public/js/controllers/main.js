angular.module('scriptController', [])
	// inject the Script service factory into the controller
	.controller('mainController', ['$scope','$http','Scripts', function($scope, $http, Scripts) {
		$scope.loading = true;
		$scope.response = '';
        var errorCallback = function(data){
            $scope.loading = false;
            $scope.response_type = -1;
            $scope.response = 'Server error response';
            console.log($scope.response, data);
        }

		// GET =====================================================================
		// when landing on the page, get all scripts and show them
		// use the service to get all scripts
        Scripts.get().success(function(data) {
                $scope.selectedIndex = 0;
                $scope.formData = data.response[0];
                $scope.scripts = data.response;
				$scope.loading = false;
			}).error(errorCallback);

        $scope.showScriptData = function(index){
            $scope.selectedIndex = index;
            $scope.response = $scope.response_type = '';
            $scope.formData = $scope.scripts[index];
        }

		// CREATE ==================================================================
		// when submitting the add form, send the text to the node API
		$scope.createScript = function() {
			// validate the formData to make sure that something is there
			// if form is empty, nothing will happen
			if ($scope.formData.script != undefined && $scope.formData.name != undefined) {
				$scope.loading = true;

				// call the create function from our service (returns a promise object)
                Scripts.create($scope.formData)
					// if successful creation, call our get function to get all the new scripts
					.success(function(data) {
                        $scope.response_type = 0;
                        $scope.response = 'Script created successfully';
						$scope.loading = false;
						$scope.formData = {}; // clear the form so our user is ready to enter another
						$scope.scripts = data.response; // assign our new list of scripts
					}).error(errorCallback);
			}
		};

		// DELETE ==================================================================
		// delete a script after checking it
		$scope.deleteScript = function() {
			$scope.loading = true;
            Scripts.delete($scope.formData.name)
				// if successful creation, call our get function to get all the new scripts
				.success(function(data) {
                    $scope.response_type = 0;
                    $scope.response = 'Script deleted successfully';
					$scope.loading = false;
					$scope.scripts = data.response; // assign our new list of scripts
				}).error(errorCallback);
		};

		// GET ==================================================================
		// run a script after checking it
		$scope.runScript = function() {
			$scope.loading = true;
            $scope.response = '';
            Scripts.run($scope.formData.name)
				// if successful creation, call our get function to get all the new scripts
				.success(function(data) {
					$scope.loading = false;
                    $scope.response = data.response;
                    $scope.response_type = data.status;
                }).error(errorCallback);
		};


		// PUT ==================================================================
		// update script data after checking it
		$scope.updateScript = function() {
			$scope.loading = true;
            Scripts.update($scope.formData._id, $scope.formData)
				// if successful creation, call our get function to get all the new scripts
				.success(function(data) {
                    if(data.status != 202){
                        var err = data.response.errors;
                        $scope.response = err.name ? err.name.message : err.script.message;
                        $scope.response_type = data.status;
                    }
                    else {
                        $scope.response_type = 0;
                        $scope.response = 'Script updated successfully';
                        $scope.scripts = data.response; // assign our new list of scripts
                    }
                    $scope.loading = false;
				}).error(errorCallback);
		};
	}]);