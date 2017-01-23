angular.module('team-task')
    .factory('LoginFactory', function LoginFactory (Pessoa, $window, $state) {
        LoginFactory.login = function (usuario, senha, vm) {
            waitingDialog.show("Validando login na rede. Aguarde");
            var query = {
                "usuario": usuario,
                "senha": senha,
                "ativo": true
            };
            Pessoa.query(query).then(function (pessoas) {
                if (pessoas[0]) {
                    waitingDialog.hide();
                    var logado = pessoas[0];
                    if(logado.perfil === "gerente") {
                        var gQuery = {
                            "cadastrado": logado._id.$oid
                        };
                        Pessoa.query(gQuery).then(function (pessoa) {
                            if(pessoa[0]) {
                                pessoas[0].subordinado = pessoa[0]._id.$oid;
                            }
                            finalizeLogin(logado, pessoas);
                        });
                    } else {
                        finalizeLogin(logado, pessoas);
                    }
                } else {
                    vm.errorLogin = "Login e ou senha inválidos";
                    waitingDialog.hide();
                }
            });
        };
        function finalizeLogin (logado, pessoas) {
            var nomes = logado.nome.split(" ");
            var iniciais = nomes[0].substring(0, 1);
            var nomeSimples = nomes[0];
            if (nomes.length > 1) {
                iniciais += nomes[1].substring(0, 1);
            }
            logado.iniciais = iniciais.toUpperCase();
            logado.nomeSimples = nomeSimples;
            $window.sessionStorage.setItem('usuarioLogado', angular.toJson(pessoas[0]));
            $state.go('workspace.projects');
        }
        return LoginFactory;
    });