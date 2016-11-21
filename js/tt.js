angular.module('team-task', [
    'ui.router', 'ngResource', 'mongolabResourceHttp', 'ui.bootstrap', 'angular.filter', 'ngLetterAvatar', 'angularMoment',
    'datatables', 'ngAnimate','gantt', 'gantt.table', 'gantt.tooltips'
])
    .constant('MONGOLAB_CONFIG', {API_KEY: 'YXgR-q92vuVCKlSm-ji3nplDTE7rHIQh', DB_NAME: 'tt'})
    .run(function (amMoment) {
        amMoment.changeLocale('pt-br');
    })
    .run(function ($rootScope, $state, $window) {
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
            var currentUser = angular.fromJson($window.sessionStorage.getItem('usuarioLogado'));
            if (currentUser) {
                $rootScope.usuarioLogado = currentUser;
            }
        });
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            $rootScope.currentState = toState.name;
        });
    })
    .config(function () {

    })
    .filter('sumByKey', function () {
    return function (data, key) {
        if (typeof(data) === 'undefined' || typeof(key) === 'undefined') {
            return 0;
        }

        var sum = 0;
        angular.forEach(data, function (obj, objKey) {
            sum += parseFloat(obj[key]);
        });

        return sum;
    };
});

$(document).ready(function () {
    $(document).on('click', '.panel-heading span.clickable', function (e) {
        var $this = $(this);
        if (!$this.hasClass('panel-collapsed')) {
            $this.parents('.panel').find('.panel-body').slideUp();
            $this.addClass('panel-collapsed');
            $this.find('i').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
        } else {
            $this.parents('.panel').find('.panel-body').slideDown();
            $this.removeClass('panel-collapsed');
            $this.find('i').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
        }
    });
});