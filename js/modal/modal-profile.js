angular.module('team-task')
    .controller('ModalMyProfileController',
    function ($scope, $rootScope, $window, Pessoa) {
        $scope.nameErro = "";
        $scope.usuarioErro = "";
        $scope.novasenhaErro = "";
        $scope.senhaanteriorErro = "";
        $scope.novasenha = "";
        $scope.senhaanterior = "";
        $scope.initModalMyProfile = function () {
            if($rootScope.usuarioLogado) {
                $scope.pessoa = {
                    "nome": $rootScope.usuarioLogado.nome,
                    "usuario": $rootScope.usuarioLogado.usuario
                };
            }
        };

        $scope.ok = function () {
            if(validaProfile()) {
                waitingDialog.show("Salvando novas informações. Aguarde.");
                Pessoa.getById($rootScope.usuarioLogado._id.$oid).then(
                    function (usuario) {
                        $rootScope.usuarioLogado.nome = $scope.pessoa.nome;
                        $rootScope.usuarioLogado.usuario = $scope.pessoa.usuario;
                        if($scope.novasenha) {
                            $rootScope.usuarioLogado.senha = $scope.novasenha;
                            usuario.senha = $scope.novasenha;
                        }
                        usuario.nome = $scope.pessoa.nome;
                        usuario.usuario = $scope.pessoa.usuario;

                        usuario.$saveOrUpdate().then(function () {
                            var nomes = $rootScope.usuarioLogado.nome.split(" ");
                            var iniciais = nomes[0].substring(0, 1);
                            var nomeSimples = nomes[0];
                            if (nomes.length > 1) {
                                iniciais += nomes[1].substring(0, 1);
                            }
                            $rootScope.usuarioLogado.iniciais = iniciais.toUpperCase();
                            $rootScope.usuarioLogado.nomeSimples = nomeSimples;
                            $window.sessionStorage.setItem('usuarioLogado', angular.toJson($rootScope.usuarioLogado));
                            waitingDialog.hide();
                            $scope.$close(true);
                        });
                    }
                );
            }
        };

        function validaProfile () {
            var valido = true;
            $scope.nameErro = "";
            $scope.usuarioErro = "";
            $scope.novasenhaErro = "";
            $scope.senhaanteriorErro = "";

            if(!$scope.pessoa.nome) {
                $scope.nameErro = "O Nome é obrigatório.";
                valido = false;
            }
            if(!$scope.pessoa.usuario) {
                $scope.usuarioErro = "O Login do Usuário é obrigatório.";
                valido = false;
            }

            if($scope.novasenha) {
                //quer mudar a senha
                if($scope.novasenha.length < 4) {
                    $scope.novasenhaErro = "A nova senha deve ter pelo menos 4 caracteres.";
                    valido = false;
                }
                if(!$scope.senhaanterior) {
                    $scope.senhaanteriorErro = "Para alterar a senha, uma nova é obrigatória.";
                    valido = false;
                } else {
                    if($scope.senhaanterior === $scope.novasenha) {
                        $scope.senhaanteriorErro = "As senhas tem que ser diferentes.";
                        valido = false;
                    }
                    if($scope.senhaanterior !== $rootScope.usuarioLogado.senha) {
                        $scope.senhaanteriorErro = "Senha anterior não confere.";
                        valido = false;
                    }
                }
            }
            return valido;
        }

        $scope.cancel = function () {
            $scope.$dismiss();
        };
    });