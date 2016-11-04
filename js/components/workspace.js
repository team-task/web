angular.module('team-task')
    .controller('WorkspaceProjectsController', [ '$scope', '$rootScope', '$state', 'Projeto', 'Atividade', 'Grupo',
        function($scope, $rootScope, $state, Projeto, Atividade, Grupo) {
            $scope.showLoading = false;
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