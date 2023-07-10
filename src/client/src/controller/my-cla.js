// SPDX-FileCopyrightText: 2022 SAP SE or an SAP affiliate company and LICENSE-assistant contributors
//
// SPDX-License-Identifier: Apache-2.0

// *****************************************************
// My-LICENSE Controller
//
// tmpl: my-cla.html.html
// path: /
// *****************************************************

module.controller('MyClaCtrl', ['$scope', '$filter', '$HUB', '$RAW', '$RPCService', '$HUBService', '$modal', 'utils',
    function ($scope, $filter, $HUB, $RAW, $RPCService, $HUBService, $modal, utils) {
        $scope.repos = [];
        $scope.gists = [];
        $scope.signedLICENSEs = [];
        $scope.users = [];
        $scope.user = {};
        $scope.defaultClas = [];

        var orderBy = $filter('orderBy');

        var getUser = function () {
            $scope.user = { value: { admin: false } };

            return $HUBService.call('users', 'getAuthenticated', {}, function (err, res) {
                if (err) {
                    return;
                }

                $scope.user = res;
                $scope.user.value.admin = false;

                if (res.meta && res.meta['x-oauth-scopes'] && res.meta['x-oauth-scopes'].indexOf('write:repo_hook') > -1) {
                    $scope.user.value.admin = true;
                }
            });
        };

        var getSignedLICENSE = function () {
            return $RPCService.call('cla', 'getSignedLICENSE', {}, function (err, data) {
                if (!err && data) {
                    $scope.signedLICENSEs = data.value;
                    for (var i = 0; i < $scope.signedLICENSEs.length; i++) {
                        $scope.getGist($scope.signedLICENSEs[i]);
                        $scope.getVersionStatus($scope.signedLICENSEs[i]);
                    }
                }
            });
        };

        $scope.getGist = function (repo) {
            $RPCService.call('cla', 'getGist', {
                repo: repo.repo,
                owner: repo.owner,
                gist: {
                    gist_url: repo.gist_url,
                    gist_version: repo.gist_version
                }
            }, function (err, data) {
                if (!err && data.value) {
                    repo.gistObj = data.value;
                }
            });
        };

        $scope.getGistName = function (gistObj) {
            return utils.getGistAttribute(gistObj, 'filename');
        };

        getUser().then(function () {
            getSignedLICENSE();
        });

        $scope.order = function (predicate, reverse) {
            $scope.signedLICENSEs = orderBy($scope.signedLICENSEs, predicate, reverse);
        };

        $scope.getDefaultClaFiles = function () {
            return $RAW.get('/static/cla-assistant.json').then(function (res) {
                $scope.defaultClas = res.data['default-cla'];
            });
        };

        $scope.getClaView = function (signedLICENSE) {
            $modal.open({
                templateUrl: '/assets/templates/modals/claView.html',
                controller: 'ClaViewCtrl',
                scope: $scope,
                resolve: {
                    cla: function () { return signedLICENSE; }
                }
            });
        };

        $scope.getGistVersion = function (gistObj) {
            return utils.getGistAttribute(gistObj, 'updated_at');
        };

        $scope.getVersionView = function (signedLICENSE) {
            if (signedLICENSE.newLICENSE) {
                signedLICENSE.noLICENSE = false;

                if (signedLICENSE.newLICENSE.html_url !== signedLICENSE.gist_url) {
                    signedLICENSE.showLICENSE = true;
                } else {
                    signedLICENSE.showLICENSE = false;
                }
            } else {
                signedLICENSE.noLICENSE = true;
            }
            $modal.open({
                templateUrl: '/assets/templates/modals/versionView.html',
                controller: 'VersionViewCtrl',
                scope: $scope,
                resolve: {
                    cla: function () { return signedLICENSE; },
                    noLICENSE: function () { return signedLICENSE.noLICENSE; },
                    showLICENSE: function () { return signedLICENSE.showLICENSE; }
                }
            });
        };

        function getLinkedGist(signedLICENSE) {
            return $RPCService.call('cla', 'getGist', {
                repo: signedLICENSE.repo,
                owner: signedLICENSE.owner
            }, function (err, data) {
                if (!err && data.value) {
                    signedLICENSE.newLICENSE = data.value;
                }
            });
        }

        function checkLICENSE(signedLICENSE) {
            return $RPCService.call('cla', 'check', {
                repo: signedLICENSE.repo,
                owner: signedLICENSE.owner
            }, function (err, signed) {
                if (!err && signed.value && signed) {
                    signedLICENSE.signed = true;
                } else {
                    signedLICENSE.signed = false;
                    getLinkedGist(signedLICENSE);
                }
            });
        }

        $scope.getVersionStatus = function (signedLICENSE) {
            checkLICENSE(signedLICENSE).then(function () {
                if (signedLICENSE.signed) {
                    signedLICENSE.stat = true;
                } else {
                    signedLICENSE.stat = false;
                }
            });
        };

        $scope.confirmRevoke = function (claItem) {
            var modal = $modal.open({
                templateUrl: '/assets/templates/modals/confirmRevoke.html',
                controller: 'ConfirmCtrl',
                windowClass: 'confirm-add',
                resolve: {
                    selected: function () {
                        return {
                            item: claItem
                        };
                    }
                }
            });
            modal.result.then(function (claItem) {
                $scope.remove(claItem);
            });
        };

        $scope.remove = function (claItem) {
            $RPCService.call('cla', 'revoke', claItem, function (err) {
                if (err) {
                   return
                }
                $scope.signedLICENSEs.splice($scope.signedLICENSEs.indexOf(claItem), 1);
            });
        };
    }
]);
