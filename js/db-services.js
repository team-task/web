angular.module('team-task')
	.factory('Atividade', function ($mongolabResourceHttp) {
		return $mongolabResourceHttp('atividade');
	})
	.factory('Pessoa', function ($mongolabResourceHttp) {
		return $mongolabResourceHttp('pessoa');
	})
	.factory('Projeto', function ($mongolabResourceHttp) {
		return $mongolabResourceHttp('projeto');
	})
	.factory('Time', function ($mongolabResourceHttp) {
		return $mongolabResourceHttp('time');
	})
	.factory('AjustesDB', function AjustesDB (Atividade) {
        AjustesDB.ajusteNotasAtividades = function () {
            Atividade.all().then(function (atividades) {
                angular.forEach(atividades, function (atividade) {
                    var nota = atividade.notas;
                    var notaObj = {
                        data: atividade.inicio.$date,
                        nota: nota
                    };
                    atividade.notas = [];
                    if(nota) {
                        atividade.notas.push(notaObj);
                    }


                    atividade.$saveOrUpdate().then(function () {
                        console.log('salvo ' + atividade.nome)
                    });


                })
            });
        };

        AjustesDB.ajusteDataNotasAtividades = function () {
            Atividade.all().then(function (atividades) {
                angular.forEach(atividades, function (atividade) {
                    for(var i = 0; i < atividade.notas.length; i++) {
                        delete atividade.notas[i].data;
                        atividade.notas[i].data = atividade.inicio;
                    }

                    atividade.$saveOrUpdate().then(function () {
                        console.log('salvo ' + atividade.nome)
                    });
                })
            });
        };

        return AjustesDB;
    });