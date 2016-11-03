angular.module('team-task')

	.factory('Atividade', function ($mongolabResourceHttp) {
		return $mongolabResourceHttp('atividade');
	})
	.factory('Pessoa', function ($mongolabResourceHttp) {
		return $mongolabResourceHttp('pessoa');
	})
	.factory('Projeto', function ($mongolabResourceHttp) {
		return $mongolabResourceHttp('projeto');
	});