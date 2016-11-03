angular.module('team-task')
	.controller('LoginController', [ '$scope', '$rootScope', '$state', 'loginService',
function($scope, $rootScope, $state, loginService) {
	$scope.errorLogin = "";
	$scope.usuario = "";
	$scope.senha = "";
	$scope.initLogin = function () {
		$rootScope.loginBody = {
				'overflow': 'hidden'
		}
	};
	
	$scope.login = function () {
		var usuario = $scope.usuario;
		var senha = $scope.senha;
		waitingDialog.show("Validando login na rede. Aguarde");
		loginService.loginUser(usuario, senha).then(function (result) {
			if(result.msgRetorno === "OK") {
				waitingDialog.hide();
				$state.go('agenda');
			} else {
				$scope.errorLogin = result.msgRetorno;
				waitingDialog.hide();
			}
		});
	};
} ]);