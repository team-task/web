angular.module('team-task')
    .service('loginService', ['$http', function ($http) {
    	var loginUrl = '/gerenciadorsalas/rest/loginservice';
    	
    	this.loginUser = function (usuario, senha) {
    		var user = {
    			"usuario": usuario,
    			"senha": senha
    		};
    		return $http.post(loginUrl, user).then(function (result) {
    			return result.data;
    		});
    	};
}])
.service('salasService', ['$http', function ($http) {
	var defaultUrl = '/gerenciadorsalas/rest/agenda';
	this.getSalas = function () {
		var salasUrl = defaultUrl + '/salas';
		return $http.get(salasUrl).then(function (result) {
			return result.data.salas;
		});
	};
	
	this.getSalasByOrgInst = function (orgId, instId) {
		var salasUrl = defaultUrl + '/minhas-salas';
		return $http.get(salasUrl + "/" + orgId + "/" + instId).then(function (result) {
			return result.data.salas;
		});
	};
	
	this.getMinhasSalas = function (userId) {
		var minhasSalasUrl = defaultUrl + '/minhas-salas';
		return $http.get(minhasSalasUrl + "/" + userId).then(function (result) {
			return result.data.salas;
		});
	};
	
	this.getSalasParticipando = function (userId) {
		var salasUrl = defaultUrl + '/salas-participando';
		return $http.get(salasUrl + "/" + userId).then(function (result) {
			return result.data.salas;
		});
	};
	
	this.getReservasByOrgInst = function (orgId, instId) {
		var reservasUrl = defaultUrl + '/reservas';
		return $http.get(reservasUrl + "/" + orgId + "/" + instId).then(function (result) {
			return result.data.reservas;
		});
	};
	
}]);