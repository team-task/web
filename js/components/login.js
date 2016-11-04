angular.module('team-task')
	.controller('LoginController', [ '$scope', '$rootScope', '$state', 'Pessoa', '$window',
function($scope, $rootScope, $state, Pessoa, $window) {
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
		var query = {
			"usuario": usuario,
			"senha": senha
		};
		Pessoa.query(query).then(function (pessoas) {
			if(pessoas[0]) {
				waitingDialog.hide();
				var logado = pessoas[0];
				var nomes = logado.nome.split(" ");
				var iniciais = nomes[0].substring(0, 1);
				var nomeSimples = nomes[0];
				if(nomes.length > 1) {
					iniciais += nomes[1].substring(0, 1);
				}
				logado.iniciais = iniciais.toUpperCase();
				logado.nomeSimples = nomeSimples;
				$window.sessionStorage.setItem('usuarioLogado', angular.toJson(pessoas[0]));
				$state.go('workspace-projects');
			} else {
				$scope.errorLogin = "Login e ou senha inválidos";
				waitingDialog.hide();
			}
		});
	};
} ]);