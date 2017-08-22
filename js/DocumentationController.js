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
                        $scope.Ctrls.DisplayDocs.docs.filterDocsWithTimeOut();
                        $scope.Ctrls.DisplayDocs.docs.openTreeItem(data.$$hashKey);
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
                        return item.name.toLowerCase().indexOf(searchStr.toLowerCase()) !== -1 ? [{ $$hashKey: item.$$hashKey, id: item.id, name: item.name, isFile: item.isFile }] : [];
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
                            childrenResult = [{ $$hashKey: item.$$hashKey, id: item.id, name: item.name, isFile: item.isFile }].concat(childrenResult);

                        return childrenResult;
                    }
                },
                filterDocsWithTimeOut: function () {
                    if ($scope.Ctrls.DisplayDocs.search.value.length > 1)
                        $timeout($scope.Ctrls.DisplayDocs.docs.filterDocs(), 800);
                    else if ($scope.Ctrls.DisplayDocs.search.value.length == 0)
                        $scope.Ctrls.DisplayDocs.search.results = [];
                },
                openTreeItem: function (openNodeHashKey) {
                    for (var i = 0; i < this.items.length; i++) {
                        let isChildOpen = $scope.Ctrls.DisplayDocs.docs.openTreeItemChildren(this.items[i], openNodeHashKey);

                        this.items[i].isOpen = isChildOpen;
                    }
                },
                openTreeItemChildren: function (item, openNodeHashKey) {
                    item.isOpen = item.$$hashKey === openNodeHashKey;

                    if (item.children == undefined || item.children.length == 0)
                        return item.isOpen && !item.isFile;

                    let isChildOpen = false;
                    for (let i = 0; i < item.children.length; i++) {
                        isChildOpen = $scope.Ctrls.DisplayDocs.docs.openTreeItemChildren(item.children[i], openNodeHashKey) || isChildOpen;
                    }

                    item.isOpen = item.isOpen || isChildOpen;
                    return item.isOpen;
                },
                removeNode: function (deletedNodeHashKey) {
                    for (let i = 0; i < this.items.length; i++) {
                        if(this.items[i].$$hashKey === deletedNodeHashKey){
                            this.items.splice(i, 1);
                            return;
                        }

                        $scope.Ctrls.DisplayDocs.docs.removeChildNode(this.items[i], deletedNodeHashKey);
                    }
                },
                removeChildNode: function (node, deletedNodeHashKey) {
                    if (node.children === null || node.children === undefined || node.children.length === 0) return;

                    for (let i = 0; i < node.children.length; i++) {
                        if (node.children[i].$$hashKey === deletedNodeHashKey) {
                            node.children.splice(i, 1);
                            return;
                        }

                        $scope.Ctrls.DisplayDocs.docs.removeChildNode(node.children[i], deletedNodeHashKey);
                    }
                }
            },

            nodeClick: function (data) {
                data.isOpen = !data.isOpen;

                if (data.isFile)
                    $scope.Ctrls.DisplayDocs.docs.getDocFile(data.id);
            },

            admin: {
                activeAction: null,
                activeNode: null,
                setActive: function (action, node) {
                    if (this.activeAction === action && this.activeNode === node) {
                        this.activeAction = null;
                        this.activeNode = null;
                    }
                    else {
                        this.activeAction = action;
                        this.activeNode = node;
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
                            { id: 2, name: 'Документ' },
                            { id: 3, name: 'Категорию', isCategory: true }
                        ]
                    },
                    accessRoles: {
                        items: [],
                        init: function (data) {
                            this.items = data;
                        },
                        getItems: function () {
                            let res = [];

                            this.items.forEach((item) => {
                                res.push({
                                    tagId: item.TagId,
                                    tagName: item.TagName,
                                    isSelected: true
                                });
                            });

                            return res;
                        }
                    },
                    getNewFolder: function () {
                        return {
                            name: '',
                            accessRoles: this.accessRoles.getItems(),
                            getActiveRoles: function () {
                                let res = [21];
                                for (var i = 0; i < this.accessRoles.length; i++) {
                                    if (this.accessRoles[i].isSelected)
                                        res.push(this.accessRoles[i].tagId);
                                }

                                if ($scope.Ctrls.DisplayDocs.admin.addNode.typeOfNode.activeTypeId === 3)
                                    res.push($scope.Ctrls.DisplayDocs.sideBarFilter.activeProduct.TagId);

                                return res;
                            }
                        };
                    },
                    newFolder: {},
                    files: {
                        items: [],
                        add: function (id, name, value, extension) {
                            this.items.push({
                                id: id,
                                name: name,
                                extension: extension,
                                value: value
                            });
                        },
                        remove: function (item) {
                            for (var i = this.items.length - 1; i >= 0; i--) {
                                if (this.items[i] === item) {
                                    this.items.splice(i, 1);
                                }
                            }
                        }
                    },
                    isOkDisabled: function () {
                        if ($scope.Ctrls.DisplayDocs.admin.addNode.typeOfNode.activeTypeId === 1 ||
                            $scope.Ctrls.DisplayDocs.admin.addNode.typeOfNode.activeTypeId === 3)
                            return $scope.Ctrls.DisplayDocs.admin.addNode.newFolder.name == '';

                        if ($scope.Ctrls.DisplayDocs.admin.addNode.typeOfNode.activeTypeId === 2)
                            return $scope.Ctrls.DisplayDocs.admin.addNode.files.items.length == 0;
                    },
                    posibleOpenTop: function () {
                        return $(window).height() > 500 && $('#documentTree').height() > 320;
                    },
                    posibleOpenTopNodeTree: function (id, elementHeight) {
                        return document.getElementById(id) != null && document.getElementById(id).getBoundingClientRect().top > elementHeight;
                    },
                    start: function (node) {
                        $scope.Ctrls.DisplayDocs.admin.setActive(this.id, node);

                        $scope.Ctrls.DisplayDocs.admin.addNode.files.items = [];
                        this.newFolder = $scope.Ctrls.DisplayDocs.admin.addNode.getNewFolder();

                        $scope.Ctrls.DisplayDocs.admin.addNode.typeOfNode.activeTypeId = node === 'isAddCategory' ? 3 : 1;
                        
                    },
                    getSaveData: function () {
                        if ($scope.Ctrls.DisplayDocs.admin.addNode.typeOfNode.activeTypeId === 1 ||
                            $scope.Ctrls.DisplayDocs.admin.addNode.typeOfNode.activeTypeId === 3)
                            return {
                                Id: null,
                                ParentId: $scope.Ctrls.DisplayDocs.admin.addNode.typeOfNode.activeTypeId === 1 ? $scope.Ctrls.DisplayDocs.admin.activeNode.id : null,
                                Topic: $scope.Ctrls.DisplayDocs.admin.addNode.newFolder.name,
                                Tags: $scope.Ctrls.DisplayDocs.admin.addNode.newFolder.getActiveRoles(),
                                Files: [],
                                StayOldFiles: true,
                                IsCategory: $scope.Ctrls.DisplayDocs.admin.addNode.typeOfNode.activeTypeId === 3
                            }
                        else
                            return {
                                Id: $scope.Ctrls.DisplayDocs.admin.activeNode.id,
                                ParentId: null,
                                Topic: $scope.Ctrls.DisplayDocs.admin.activeNode.name,
                                Tags:  $scope.Ctrls.DisplayDocs.admin.activeNode.accessRoles,
                                Files: $scope.Ctrls.DisplayDocs.admin.addNode.files.items,
                                StayOldFiles: true
                            }
                    },
                    save: function () {
                        if (this.isOkDisabled()) return;

                        //$scope.Ctrls.DisplayDocs.search.isLoading = true;

                        //$http({
                        //    url: '',
                        //    method: "POST",
                        //    data: {
                        //        data: this.getSaveData()
                        //    }
                        //}).then(function (res) {
                        //    if (res.data.status === 'success') {

                        //        if ($scope.Ctrls.DisplayDocs.admin.addNode.typeOfNode.activeTypeId === 3) 
                        //            $scope.Ctrls.DisplayDocs.docs.items.push(res.data.data[0]);
                        //        else {
                        //            $scope.Ctrls.DisplayDocs.admin.activeNode.children = res.data.data;
                        //            $scope.Ctrls.DisplayDocs.admin.activeNode.isOpen = true;
                        //        }

                        //        $scope.Ctrls.DisplayDocs.admin.clearActive()
                        //    }
                        //    else
                        //        alert('Произошла ошибка. Обратитесь в службу поддержки.');

                        //    $scope.Ctrls.DisplayDocs.search.isLoading = false;

                        //}, function () {
                        //    location.reload();
                        //});
                    }
                },
                editNode: {
                    id: 2,
                    editName: '',
                    isOkDisabled: function () {
                        return this.editName == '' || $scope.Ctrls.DisplayDocs.admin.activeNode == null || this.editName == $scope.Ctrls.DisplayDocs.admin.activeNode.name;
                    },
                    start: function (node) {
                        $scope.Ctrls.DisplayDocs.admin.setActive(this.id, node);

                        this.editName = $scope.Ctrls.DisplayDocs.admin.activeNode.name;
                    },
                    getSaveData: function () {
                        return {
                            Id: $scope.Ctrls.DisplayDocs.admin.activeNode.id,
                            ParentId: null,
                            Topic: this.editName,
                            Tags: $scope.Ctrls.DisplayDocs.admin.activeNode.accessRoles,
                            Files: [],
                            StayOldFiles: true
                        }
                    },
                    save: function () {
                        if (this.isOkDisabled()) return;

                        //$scope.Ctrls.DisplayDocs.search.isLoading = true;

                        //$http({
                        //    url: '',
                        //    method: "POST",
                        //    data: {
                        //        data: this.getSaveData()
                        //    }
                        //}).then(function (res) {
                        //    if (res.data.status === 'success') {

                        //        $scope.Ctrls.DisplayDocs.admin.activeNode.name = $scope.Ctrls.DisplayDocs.admin.editNode.editName;
                        //        $scope.Ctrls.DisplayDocs.admin.clearActive()
                        //    }
                        //    else
                        //        alert('Произошла ошибка. Обратитесь в службу поддержки.');

                        //    $scope.Ctrls.DisplayDocs.search.isLoading = false;

                        //}, function () {
                        //    location.reload();
                        //});
                    }
                },
                deleteNode: {
                    id: 3,
                    start: function (node) {
                        $scope.Ctrls.DisplayDocs.admin.setActive(this.id, node);
                    },
                    save: function () {
                        //$scope.Ctrls.DisplayDocs.search.isLoading = true;

                        //$http({
                        //    url: '',
                        //    method: "POST",
                        //    data: {
                        //        nodeId: $scope.Ctrls.DisplayDocs.admin.activeNode.id,
                        //        isFile: $scope.Ctrls.DisplayDocs.admin.activeNode.isFile
                        //    }
                        //}).then(function (res) {
                        //    if (res.data.status === 'success') {
                        //        $scope.Ctrls.DisplayDocs.docs.removeNode($scope.Ctrls.DisplayDocs.admin.activeNode.$$hashKey);
                        //        $scope.Ctrls.DisplayDocs.admin.clearActive();
                        //    }
                        //    else
                        //        alert('Произошла ошибка. Обратитесь в службу поддержки.');

                        //    $scope.Ctrls.DisplayDocs.search.isLoading = false;

                        //}, function () {
                        //    location.reload();
                        //});
                    }
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


function changeDocumentFiles() {
    var angularScope = angular.element('#DocumentationController').scope();

    var files = $("#documentFilesInput")[0].files;

    for (var i = 0; i < files.length; i++) {

        let reader = new FileReader();
        reader._index = i;
        reader.onload = function (e) {
            if (files[e.target._index].name, e.target.result.match(/,(.*)$/).length != 2)
                return;

            angularScope.Ctrls.DisplayDocs.admin.addNode.files.add(null, files[e.target._index].name, e.target.result.match(/,(.*)$/)[1], '.' + files[e.target._index].name.split('.')[1]);
            angularScope.$apply();
        };

        reader.readAsDataURL(files[i]);
    }
};