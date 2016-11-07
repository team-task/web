angular.module('team-task')
    .controller('WorkspaceProjectsController', [ '$scope', '$rootScope', '$state', 'Projeto', 'Atividade', 'Grupo',
        'DTOptionsBuilder',
        function($scope, $rootScope, $state, Projeto, Atividade, Grupo, DTOptionsBuilder) {
            $scope.showLoading = false;

            $scope.dtOptions = DTOptionsBuilder.newOptions().withLanguage({
                "emptyTable" : "Nenhum registro encontrado",
                "info" : "Mostrando de _START_ até _END_ de _TOTAL_ registros",
                "infoEmpty" : "Mostrando 0 até 0 de 0 registros",
                "infoFiltered" : "(Filtrados de _MAX_ registros)",
                "infoPostFix" : "",
                "infoThousands" : ".",
                "lengthMenu" : "_MENU_ resultados por página",
                "loadingRecords" : "Carregando...",
                "processing" : "Processando...",
                "zeroRecords" : "Nenhum registro encontrado",
                "search" : "Pesquisar",
                "paginate" : {
                    "next" : "Próximo",
                    "previous" : "Anterior",
                    "first" : "Primeiro",
                    "last" : "Último"
                },
                "aria" : {
                    "sortAscending" : ": Ordenar colunas de forma ascendente",
                    "sortDescending" : ": Ordenar colunas de forma descendente"
                }
            });

            $scope.initWorkspaceProjects = function () {
                $scope.showLoading = true;
                var idusuario = $rootScope.usuarioLogado._id.$oid;
                var qGrupo = {
                    "$or": [
                        {"gerente": idusuario},
                        {"recursos": idusuario}
                    ]
                };
                Grupo.query(qGrupo).then(function (grupos) {

                    if(grupos[0]) {
                        var listaGrupos = [];
                        for (var i = 0; i < grupos.length; i++) {
                            listaGrupos.push(grupos[i]._id.$oid);
                        }
                        var pQuery = {
                            "$or": [
                                {"administrador": idusuario}
                                , {"grupo": {"$in": listaGrupos}}]
                        };
                        Projeto.query(pQuery).then(function (projetos) {
                            $scope.projetos = projetos;
                            $scope.showLoading = false;
                        });
                    }
                });
            };
        } ]);