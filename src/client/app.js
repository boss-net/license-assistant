var module = angular.module('app', ['license.filters',
    'ui.utils',
    'ui.router',
    'ui.bootstrap',
    'ui.bootstrap.popover',
    'ui.select',
    'ngSanitize',
    'ngAnimate',
    'ngCsv'
]);
// eslint-disable-next-line no-unused-vars
var filters = angular.module('license.filters', []);

// *************************************************************
// Delay start
// *************************************************************

angular.element(document).ready(function () {
    angular.bootstrap(document, ['app']);
    angular.element(document.querySelectorAll('.needs-javascript')).removeClass('needs-javascript');
});

// *************************************************************
// States
// *************************************************************

module.config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
    function ($stateProvider, $urlRouterProvider, $locationProvider) {

        $stateProvider
            //
            // Home state
            //
            .state('home', {
                url: '/',
                templateUrl: '/templates/home.html',
                controller: 'HomeCtrl'
            })

            //
            // Settings view
            //
            .state('home.settings', {
                // url: '/detail/:user/:repo',
                templateUrl: '/templates/settings.html',
                controller: 'SettingsCtrl',
                params: {
                    'user': {},
                    'owner': {},
                    'repo': {},
                    'gist': {}
                }
                // params: ['user', 'owner', 'repo', 'gist'] <-- was in older angular version
            })

            //
            // My-License state
            //
            .state('license', {
                abstract: true,
                url: '/my-license',
                template: '<section ui-view></section>'
            })


            .state('license.myLicense', {
                url: '',
                templateUrl: '/templates/my-license.html',
                controller: 'MyLicenseCtrl'
            })

            //
            // Repo state (abstract)
            //
            .state('repo', {
                abstract: true,
                url: '/:user/:repo?pullRequest&redirect',
                template: '<section ui-view></section>'
            })

            //
            // Repo license
            //
            .state('repo.license', {
                url: '',
                templateUrl: '/templates/license.html',
                controller: 'LicenseController'
            })

            //
            // 404 Error
            //
            .state('404', {
                url: '/404',
                templateUrl: '/templates/404.html'
            });

        $urlRouterProvider.otherwise('/404');

        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }
]);
