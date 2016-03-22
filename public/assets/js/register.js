var app = angular.module('Chat',['LocalStorageModule']);

app.controller('RegisterCtrl',RegisterCtrl);

RegisterCtrl.$inject = ['$scope','localStorageService','$http'];

function RegisterCtrl($scope,localStorageService,$http){

    var success = function(data){
        if (data.ok){
            localStorageService.cookie.set('authToken',data.token,$scope.Config.sessionTimeout);
        } else {
            $scope.noRecognized = true;
        }
        console.log('hhhhh');
    };

    var failure = function(){
        alert('Damn!  Something went wrong, sorry');
    };

    $scope.submit = function(){
        $scope.noRecognized = false;
        $http.post('/register',{user: $scope.register}).then(success, failure);
    };
}