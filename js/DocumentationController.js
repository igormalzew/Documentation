documentationApp.controller('DocumentationController', ['$scope', '$timeout', '$http', function ($scope, $timeout, $http) {

    $scope.Ctrls = {
        ActiveCtrl: 1,
        ClassList: 'pt-page pt-page-current',

        DisplayDocs: {
            id: 1,

            sideBarFilter: {
                activeProduct: {},
                availableProducts: {
                    items: [],
                    init: function (data) {
                        this.items = data;

                        if (Array.isArray(data) && data.length > 0)
                            $scope.Ctrls.DisplayDocs.sideBarFilter.activeProduct = data[0];

                        $scope.Ctrls.DisplayDocs.docs.getDocs();
                    }
                },

                setActive: function (item) {
                    this.activeProduct = item;

                    $scope.Ctrls.DisplayDocs.search.value = '';
                    $scope.Ctrls.DisplayDocs.docs.getDocs();
                },
            },

            search: {
                value: '',
                isLoading: false,
                results: [],
                nodeClick: function (data) {
                    if (data.isFile)
                        $scope.Ctrls.DisplayDocs.docs.getDocFile(data.id);
                    else {
                        this.value = '';
                        $scope.Ctrls.DisplayDocs.docs.openTreeItem(data.id);
                    }
                }
            },

            docs: {
                items: [],

                getDocs: function () {
                    $scope.Ctrls.DisplayDocs.search.isLoading = true;

                    //$http({
                    //    url: '',
                    //    method: "POST",
                    //    data: {
                    //        tagId: $scope.Ctrls.DisplayDocs.sideBarFilter.activeProduct.TagId
                    //    }
                    //}).then(function (res) {

                    let res = $scope.FakeServer.getDocs();

                    if (res.status == 'success') {
                        $scope.Ctrls.DisplayDocs.docs.items = res.data;
                    }
                    else if (res.status == 'error')
                        alert('Произошло непредвиденное исключение. Обновите страницу.');
                    else
                        location.reload();

                    $scope.Ctrls.DisplayDocs.search.isLoading = false;

                    $timeout(function () { $scope.resizeDocTable() }, 401);

                    //}, function () {
                    //    location.reload();
                    //});
                },

                getDocFile: function (fileId) {
                   

                },

                filterDocs: function () {

                    let result = [];
                    let searchStr = $scope.Ctrls.DisplayDocs.search.value;

                    for (var i = 0; i < $scope.Ctrls.DisplayDocs.docs.items.length; i++) {
                        result = result.concat($scope.Ctrls.DisplayDocs.docs.filterItemChildren($scope.Ctrls.DisplayDocs.docs.items[i], searchStr));
                    }

                    $scope.Ctrls.DisplayDocs.search.results = result;

                },
                filterItemChildren: function (item, searchStr) {
                    if (item.children == undefined || item.children.length == 0) {
                        return item.name.toLowerCase().indexOf(searchStr.toLowerCase()) !== -1 ? [{ id: item.id, name: item.name, isFile: item.isFile }] : [];
                    }
                    else {
                        let childrenResult = [];

                        for (var i = 0; i < item.children.length; i++) {
                            childrenResult = childrenResult.concat($scope.Ctrls.DisplayDocs.docs.filterItemChildren(item.children[i], searchStr));
                        }

                        for (var i = 0; i < childrenResult.length; i++) {
                            childrenResult[i].path = childrenResult[i].path == undefined ? item.name : item.name + ' / ' + childrenResult[i].path;
                        }

                        if (item.name.toLowerCase().indexOf(searchStr.toLowerCase()) !== -1)
                            childrenResult = [{ id: item.id, name: item.name, isFile: item.isFile }].concat(childrenResult);

                        return childrenResult;
                    }
                },
                filterDocsWithTimeOut: function () {
                    if ($scope.Ctrls.DisplayDocs.search.value.length > 1)
                        $timeout($scope.Ctrls.DisplayDocs.docs.filterDocs(), 800);
                    else if ($scope.Ctrls.DisplayDocs.search.value.length == 0)
                        $scope.Ctrls.DisplayDocs.search.results = [];
                },
                openTreeItem: function (itemId) {
                    for (var i = 0; i < this.items.length; i++) {
                        let isChildOpen = $scope.Ctrls.DisplayDocs.docs.openTreeItemChildren(this.items[i], itemId);

                        this.items[i].isOpen = isChildOpen;
                    }
                },
                openTreeItemChildren: function (item, openItemId) {
                    item.isOpen = item.id === openItemId;

                    if (item.children == undefined || item.children.length == 0)
                        return item.isOpen && !item.isFile;

                    let isChildOpen = false;
                    for (var i = 0; i < item.children.length; i++) {
                        isChildOpen = $scope.Ctrls.DisplayDocs.docs.openTreeItemChildren(item.children[i], openItemId) || isChildOpen;
                    }

                    item.isOpen = item.isOpen || isChildOpen;
                    return item.isOpen;
                },
            },

            nodeClick: function (data) {
                data.isOpen = !data.isOpen;

                if (data.isFile)
                    $scope.Ctrls.DisplayDocs.docs.getDocFile(data.id);
            },

            admin: {
                activeAction: null,
                activeNode: null,
                setActive: function (action, nodeIndex) {
                    if (this.activeAction === action && this.activeNode === nodeIndex) {
                        this.activeAction = null;
                        this.activeNode = null;
                    }
                    else {
                        this.activeAction = action;
                        this.activeNode = nodeIndex;
                    }
                },
                clearActive: function () {
                    this.activeAction = null;
                    this.activeNode = null;
                },
                addNode: {
                    id: 1,
                    typeOfNode: {
                        activeTypeId: 1,
                        setActive: function (typeId) {
                            this.activeTypeId = typeId;
                        },
                        items: [
                            { id: 1, name: 'Подкатегорию' },
                            { id: 2, name: 'Документ' }
                        ]
                    },
                    folderName: '',
                    accessRoles: {
                        items: [],
                        init: function (data) {
                            this.items = data;
                        }
                    }
                },
                editNode: {
                    id: 2
                },
                deleteNode: {
                    id: 3
                }
            }
        }

    };




    $scope.FakeServer = {
        getCategories: function () {
            return [
                { "TagId": 1, "TagName": "Детские книги" },
                { "TagId": 2, "TagName": "Проза" },
                { "TagId": 3, "TagName": "Приключения" },
                { "TagId": 4, "TagName": "Фантастика" },
                { "TagId": 5, "TagName": "Зарубежная литература" }
            ]
        },

        getDocs: function () {
            return {
                "status": "success",
                "data":
                    [
                        {
                            "id": 336, "name": "Пушкин А.С.", "isFile": false, "isOpen": true,
                            "children": [
                                {
                                    "id": 337, "name": "Пьесы", "isFile": false, "isOpen": true,
                                    "children": [
                                        { "id": 1, "name": "Евгений Онегин.docx", "isFile": true, "children": null },
                                        { "id": 1, "name": "Борис Годунов.pdf", "isFile": true, "children": null },
                                        { "id": 1, "name": "Моцарт и Сальери.docx", "isFile": true, "children": null },
                                        { "id": 1, "name": "Пир во время чумы.docx", "isFile": true, "children": null }]
                                },
                                {
                                    "id": 338, "name": "Книги", "isFile": false, "isOpen": true,
                                    "children": [{
                                        "id": 339, "name": "Часть 1", "isFile": false, "isOpen": true,
                                        "children": [
                                            { "id": 1, "name": "Капитанская дочка.docx", "isFile": true, "children": null },
                                            { "id": 1, "name": "Пиковая дама.docx", "isFile": true, "children": null },
                                            { "id": 1, "name": "Руслан и Людмила.docx", "isFile": true, "children": null }]
                                    }]
                                }]
                        }]
            }
        },

        getAccessRoles: function () {
            return [
               { "TagId": 1, "TagName": "Free" },
               { "TagId": 2, "TagName": "Тариф Бронзовый" },
               { "TagId": 3, "TagName": "Тариф Серебряный" },
               { "TagId": 4, "TagName": "Тариф Золотой" },
               { "TagId": 5, "TagName": "Тариф Платиновый" }
            ]
        }
    };





    $scope.resizeDocTable = function () {
        let filterSize = $('#sideBarFilter').height();
        $('#docScroll').height($(window).height() - 20 > filterSize ? $(window).height() - 105 : filterSize - 55);
    };

    $timeout(function () {
        $scope.mainReady = true;
        $scope.$apply();
    }, 700);
}]);
