/**
 * Created by Sochan on 22.11.2014.
 *
 * Здесь опишу логику и почему те или иные решения были приняты, подробнее в самом коде.
 *
 * Начну с самого интересного для меня это иерархия объектов и хождение по ней (ниже описано как я к этому пришол, если по быстрому то на лайн 17).
 * Сначала я думал сделать так. У каждого объекта есть поле Items которое хранит Item(Объект файла или папки), если у
 * обекта поле FileType имеет значение 0 значить нужно ити по масиву поля
 * Items и показывать каждый Item как отдельный объект. Наверное я так решыл потомучьто видел как сделали другие.
 * Подбирая комбинации для создания поля Items у объекта случайно создал поле Item. Сначало я не понял зачем он нужен ведь там можно было
 * разместить только один объект да и то только ссылку на него. Через долгое время пытаясь создать Item в Items а точьнее узнать что значит
 * "Message": "New form can't have original value" я его таки создаю (значения поля Id должно быть натуральным).
 * При создании точно также как и с полем Item есть только ссылка на созданый обект. И тут до меня доходит что это не иерархия а связаный список.
 * Логика получилась такая я создаю объект папку и в поле Items создаю другие обекты, а точьнее создаю обекты и паредаю ссылку в поле Id обекта Item
 * который находится в поле Items. Когда я связал два объекта между собой и пытался присоединить третий то выходила ошыбка Bad request.
 * Как я понял нельзя связать объект с полем Items объекта который уже связан. И тут приходит на помощ поле Item у обекта.
 * В итоге логика выходит такова: для каждого объекта типа папка в поле Item делаю ссылку на новый обект у которго в поле Items обекты для папки.
 *
 * Хождение по иерархии
 * KoCloud - это 1-ый уровень иерархии. При нажатии на папку добавить имя папки и будет выглядит так KoCloud/FolderName и показаны все файлы находящиеся в
 * папке и так далее. При нажатии на папку я сохраняю ее Id(для получения обектов внутри папки) и имя(для отображания) в массив.
 *
 * Удаление объектов в иерархии.
 * Удаление проходить не только выбранного объекта но и наследуемых(если выбранный обект папка)
 * Иду по полям Item или Items объекта и смотрю на какой обект он ссылается а затем делаю рекурсиию.
 *
 * Отображение объектов на которые никто не ссылается или QueryHighLevelOfHierarchy
 * Тут так же как и в удалении ничего сложного идем по обектам и смотрим кто на кого ссылается сохраняя ссылавшыеся обекты а точьнее их Id в масив.
 * А потом их удалить.
 *
 * Также можно выбрать сразу несколько объектов для дальнейшей работы с ними(удалить, скачать, поделится)
 * Все выделенные объекты попадают в массив $scope.selectedItemsArray.
 */

var app = angular.module('app', []);

app.controller("koCloudController", function($scope, $http){
    $scope.FSItemUploadDone = false; // флаг для отображение загрузки
    $scope.data = []; //  массив объектов для отображения
    $scope.authorizationButtonValue = "Sign in"; // значение кнопки login/logout по умолчанию
    $scope.userProfileID = undefined;
    $scope.userProfileLang = undefined;

    $scope.isChecked = false;
    $scope.userLogin = undefined;
    $scope.userPassword = undefined;
    $scope.rememberMe = false;
    $scope.login = function(){
        if($scope.userLogin == undefined || $scope.userPassword == undefined){
            // alert error
        } else {
            $http.post('http://dev.kocloud.net/api/Auth/Login', {
                UserName : $scope.userLogin, Password : $scope.userPassword, RememberMe : $scope.rememberMe
            }).success(function(data, status, headers, config) {
                window.location.replace("http://dev.kocloud.net/TestTask/olegwall23_gmail_com/");
            }).error(function(data, status, headers, config) {
                console.log('Error: user login');
            });
        }
    }

    $scope.resetLoginData = function(){
        $scope.userLogin = undefined;
        $scope.userPassword = undefined;
        $scope.rememberMe = false;
    };

    $scope.changeAuthorizationStatus = function(){
        if($scope.userProfileID == undefined){
            $('#LoginModal').modal('show');
        } else {
            $http.post('http://dev.kocloud.net/api/Auth/Logout').
                success(function(data, status, headers, config) {
                    window.location.replace("http://dev.kocloud.net/TestTask/olegwall23_gmail_com/");
                }).
                error(function(data, status, headers, config) {
                    console.log("Error: user logout");
                });
        }
    }

    $scope.getUserInfo = function(){
        $http.get("http://dev.kocloud.net/api/Auth/GetUserInfo")
            .success(function(data, status, headers, config) {
                if(data.hasOwnProperty('ProfileId')){
                    $scope.userProfileID = data.ProfileId;
                    $scope.userProfileLang = data.ProfileLang;
                    $scope.authorizationButtonValue = "Sign out";
                } else {
                    console.log('unauthorized');
                    $scope.authorizationButtonValue = "Sign in";
                }
                //      console.log('UserInfo: '+JSON.stringify(data, null, 4));
            }).error(function(data, status, headers, config) {

                console.log('Error: Get user info ');
            });
    };

    $scope.changeLanguage = function(code){
        $http.post("http://dev.kocloud.net/api/Auth/ChangeLanguage?code=" + code)
            .success(function(data, status, headers, config) {
                //       console.log('info: '+JSON.stringify(data, null, 4));
            }).error(function(data, status, headers, config) {
                console.log('Error: change language');
            });
    };

    $scope.getFileTypeName = function(typeID){
        if(typeID == 0){
            return 'folder';
        } else if(typeID == 1){
            return 'file';
        } else if(typeID == 2){
            return 'image';
        } else if(typeID == 3){
            return 'music';
        } else if(typeID == 4){
            return 'video';
        } else if(typeID == 5){
            return 'document';
        }
        return 'unknown';
    }

    // функция для запроса объектов
    $scope.queryingData = function(type, id, specific, options){
        $scope.FSItemUploadDone = false;
        var url = 'http://dev.kocloud.net/api';
        if(type != null){
            url += "/" + type;
            if(id != null){
                url += "/" + id;
                if(specific != null){
                    url += "/" + specific;
                }
            }
        }
        if(options != null){
            url += "?" + options;
        }
        $http.get(url)
            .success(function(data, status, headers, config) {
                $scope.data = data;
                $scope.FSItemUploadDone = true;
                console.log('queryItems: '+JSON.stringify(data, null, 4));
            }).error(function(data, status, headers, config) {
                $scope.FSItemUploadDone = true;
                console.log('error');
            });
    }

    // отображения объектов при загрузке. объекты ни на кого не ссылаются а значит они самые верхнии в иерархии
    $scope.queryHighLevelOfHierarchy = function(){
        $scope.FSItemUploadDone = false;
        $http.get('http://dev.kocloud.net/api/FSItem')
            .success(function(data, status, headers, config) {
                buildHierarchy(data);
                $scope.FSItemUploadDone = true;
                console.log('queryItems: '+JSON.stringify($scope.data, null, 4));
            }).error(function(data, status, headers, config) {
                $scope.FSItemUploadDone = true;
                console.log('error');
            });

        function buildHierarchy(data) {
            var idsToDelete = [];
            for (var i = 0; i < data.length; i++) {
                if (Object(data[i]['Items']).length > 0) {
                    var itemData = data[i]['Items'];
                    for (var k = 0; k < itemData.length; k++) {
                        if (itemData[k].hasOwnProperty('Item')) {
                            for (var j = 0; j < data.length; j++) {
                                if(data[j].hasOwnProperty('Id')){
                                    if (data[j].Id == itemData[k]['Item']['Id']) {
                                        idsToDelete.push(data[j].Id);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            for(var i = 0; i < data.length; i++){
                if(data[i].hasOwnProperty('Item')){
                    for(var j = 0; j < data.length; j++){
                        if(data[j].Id == data[i].Item.Id){
                            idsToDelete.push(data[j].Id);
                        }
                    }
                }
            }

            for(var i = 0; i < data.length; i++){
                for(var j = 0; j < idsToDelete.length; j++){
                    if(Object(data[i]).hasOwnProperty('Id')){
                        if(data[i].Id == idsToDelete[j]){
                            data.splice(i, 1);
                            --i;
                        }
                    }
                }
            }
            $scope.data = data;
        }
    };


    // Меню
    $scope.selectTab = function(setTab){
        $scope.tab = setTab;
    };
    $scope.tab = 8;
    $scope.isSelected = function(checkTab){
        return $scope.tab === checkTab;
    };

    $scope.check = undefined;
    $scope.clickCheck = function(fileName){
        $scope.check = fileName;
    };

    //изменение описания объекта
    $scope.changeDescription = function(newDescription){
        $http.post("http://dev.kocloud.net/api/FSItem", {Id:$scope.selectedItemsArray[0].Id, Description:newDescription})
            .success(function(data, status, headers, config) {
                finedObjectAndUpdate(data['ChangedForms']);
                console.log('Description is changed');
            }).error(function(data, status, headers, config) {
                console.log('Error: description change');
            });
    };

    //Создание папки
    $scope.createNewFolderName = function(name, description){
        if($scope.currentPosition.length == 1){ // $scope.currentPosition - положение в иерархии(в какой папке мы находимся проще говоря) ниже болие подробнее
            $http.post("http://dev.kocloud.net/api/FSItem",{Id:0, Name:name, FileType:0, Description: description, UID:"new_folder", Item:{Id:0, Name:"FFI", FileType:0}})
                .success(function(data, status, headers, config) {
                    // console.log('queryItems: '+JSON.stringify(data, null, 4));
                    var idOfFolder = data['UidToIdMap']['new_folder'];
                    console.log(idOfFolder);
                    update(idOfFolder);
                    console.log('New folder created');
                }).error(function(data, status, headers, config) {
                    console.log('Error: create new folder ');
                });
        } else {
            $http.post("http://dev.kocloud.net/api/FSItem",
                {Id:$scope.currentPosition[$scope.currentPosition.length - 1].Id, Items:[{Id:1, Item:{Name:name, UID:"new_folder", Description:description, FileType:0,
                    Item:{Id:0, Name:"FFI", FileType:0}}}]}
            )
                .success(function(data, status, headers, config) {
                    console.log('queryItems: '+JSON.stringify(data, null, 4));
                    var idOfFolder = data['UidToIdMap']['new_folder'];
                    console.log(idOfFolder);
                    update(idOfFolder);
                    console.log('New folder created');
                }).error(function(data, status, headers, config) {
                    console.log('Error: create new folder ');
                });
        }


        function update(objId){
            $http.get("http://dev.kocloud.net/api/FSItem/"+objId)
                .success(function(data, status, headers, config) {
                    $scope.data.splice(0, 0, data);
                    console.log('Data updated');
                }).error(function(data, status, headers, config) {
                    console.log('Error: create new folder ');
                });
        }
    };

    $scope.showModalWithFileNameToRename = function(){
        $scope.newfileName = $scope.selectedItemsArray[0].Name;
        $('#renameModal').modal('show');
    };
    $scope.newfileName = undefined;
    // Переименовать файл
    $scope.saveNewFileName = function(name){
        if($scope.newFileName != $scope.selectedItemsArray[0].Name) {
            $http.post('http://dev.kocloud.net/api/FSItem',{Id:$scope.selectedItemsArray[0].Id, Name: $scope.newfileName}).
                success(function(data, status, headers, config) {
                    finedObjectAndUpdate(data['ChangedForms']);
                    console.log('Successful renamed');
                }).
                error(function(data, status, headers, config) {
                    console.log("Error: rename");
                });
        }
    };

    // Массив выбранных объектов
    $scope.selectedItemsArray = [];
    $scope.isNewItemToAdd = false;
    $scope.selectAllCheck = false;
    $scope.selectAllItemsModel = function(){
        return $scope.selectAllCheck;
    };
    $scope.selectNewItem = function(fileId){
        if($scope.isNewItemToAdd == false){
            if(!checkForObjectExistsInArray($scope.selectedItemsArray, 'Id', fileId)){
                $scope.selectedItemsArray = [];
                var obj = $scope.data[getIndexOfObjectInArrayByField($scope.data, 'Id', fileId)];
                $scope.selectedItemsArray.push(obj);
                $scope.selectAllCheck = false;
            }
        }
        $scope.isNewItemToAdd = false;
    }
    $scope.addItemToArray = function(fileId){
        $scope.isNewItemToAdd = true;
        if(!checkForObjectExistsInArray($scope.selectedItemsArray, 'Id', fileId)){
            var obj = $scope.data[getIndexOfObjectInArrayByField($scope.data, 'Id', fileId)];
            $scope.selectedItemsArray.push(obj);
        } else {
            $scope.selectedItemsArray.splice(getIndexOfObjectInArrayByField($scope.selectedItemsArray, 'Id', fileId), 1);
        }
        if($scope.data.length == $scope.selectedItemsArray.length){
            $scope.selectAllCheck = true;
        } else {
            $scope.selectAllCheck = false;
        }
    }
    $scope.checkIfItemExists = function(fileId){
        return checkForObjectExistsInArray($scope.selectedItemsArray, 'Id', fileId);
    }
    $scope.selectAllItems = function(){
        if($scope.selectAllCheck == false){
            for(var i = 0; i < $scope.data.length; i++) {
                if (!checkForObjectExistsInArray($scope.selectedItemsArray, 'Id', $scope.data[i].Id)) {
                    var obj = $scope.data[i];
                    $scope.selectedItemsArray.push(obj);
                }
            }
            $scope.selectAllCheck = true;
        } else {
            $scope.selectedItemsArray = [];
            $scope.selectAllCheck = false;
        }
    };
    $scope.checkIfFilesSelected = function(){
        if($scope.selectedItemsArray.length == 0){
            return 0;
        } else if($scope.selectedItemsArray.length == 1){
            return 1;
        } else if($scope.selectedItemsArray.length > 1){
            return 2;
        }
    }

    // JS Functions функции которые использую
    function getIndexOfObjectInArrayByField(array, field, value){
        for(var i = 0; i < array.length; i++){
            if(array[i].hasOwnProperty(field)) {
                if (array[i][field] == value) {
                    return i;
                }
            }
        }
        return -1;
    }

    function checkForObjectExistsInArray(array, field, value){
        for(var i = 0; i < array.length; i++){
            if(array[i].hasOwnProperty(field)){
                if(array[i][field] == value){
                    return true;
                }
            }
        }
        return false;
    }


    $scope.deleteFileInfo = function(){
        $('#deleteFileModal').modal('show');
    };
//  Удаление объектов в иерархии (если папка удаляет все наследуемые объекты)
    $scope.deleteObjects = function(){
        var idsToDelete = [];
        $http.get("http://dev.kocloud.net/api/FSItem")// загружаю все объекты
            .success(function(data, status, headers, config) {
                search(data);

                for(var i = 0; i < idsToDelete.length; i++){
                    console.log(idsToDelete[i]);
                    sendDeleteRequest(idsToDelete[i]);
                }

                splitData();
                $scope.selectedItemsArray = [];
            }).error(function(data, status, headers, config) {
                console.log('Error');
            });

        function search(data){ // ищу выбранные объекты
            for(var i = 0; i < $scope.selectedItemsArray.length; i++){
                fined(data, $scope.selectedItemsArray[i].Id);
            }
        }

        function fined(data, id){ // дела рекурсию с наследуемым id
            checkAndPush(id);
            for(var j = 0; j < data.length; j++){
                if(data[j].Id == id){
                    if(data[j].hasOwnProperty('Item')){
                        fined(data, data[j].Item.Id);
                    } else if(data[j].Items.length > 0){
                        for(var k = 0; k < data[j].Items.length; k++){
                            fined(data, data[j].Items[k]['Item']['Id']);
                        }
                    }
                }
            }
        }

        function checkAndPush(id){ // вставить только новые объекты
            var isHave = false;
            for(var i = 0; i < idsToDelete.length; i++){
                if(idsToDelete[i] == id){
                    isHave = true;
                }
            }
            if(!isHave)
                idsToDelete.push(id);
        }

        function splitData(){ // убираю с отображение выбранные объекты
            for(var i = 0; i < $scope.selectedItemsArray.length; i++){
                $scope.data.splice(getIndexOfObjectInArrayByField($scope.data, 'Id', $scope.selectedItemsArray[i].Id), 1);
            }
        }

        function sendDeleteRequest(id){ // удаляю объекты
            $http.delete("http://dev.kocloud.net/api/FSItem/"+id)
                .success(function(data, status, headers, config) {
                    console.log('Deleted object: ');
                }).error(function(data, status, headers, config) {
                    console.log('Error: when delete object');
                });
        }
    };


    $scope.removeShareId = function(idToRemove){
        $scope.shareIdArray.splice(getIndexOfObjectInArrayByField($scope.shareIdArray, 'Id', idToRemove), 1);
    };
    $scope.shareId = undefined;
    $scope.shareType = undefined;
    $scope.shareStatus = undefined;
    $scope.shareModeration = undefined;
    $scope.shareIdArray = [];
// Делится объектом. Поле id отсутствует. Пытался с методами Share, UnShare но не помогло.
    $scope.shareItems = function(){
        var accesses = [];

        for(var i = 0; i < $scope.selectedItemsArray.length; i++){
            $http.post('http://dev.kocloud.net/api/FSItem', {
                Id: $scope.selectedItemsArray[i]['Id'], Accesses:[{Type:$scope.shareType, Status:$scope.shareStatus, Moderation:$scope.shareModeration}]
            }).success(function(data, status, headers, config) {
                finedObjectAndUpdate(data['ChangedForms']);
            }).error(function(data, status, headers, config) {
                console.log('Error: change access');
            });
        }
        $scope.releaseShareIdArray();
    }

    $scope.releaseShareIdArray = function(){
        $scope.shareIdArray = [];
        $scope.shareId = undefined;
        $scope.shareType = undefined;
        $scope.shareStatus = undefined;
        $scope.shareModeration = undefined;
    };

    $scope.kyeHandler = function(keyEvent) {
        if (keyEvent.which === 13){
            var obj = {Id: $scope.shareId};
            $scope.shareIdArray.push(obj);
            $scope.shareId = undefined;
        }
    }

    // добавить заметку
    $scope.noteDataToAdd = "";
    $scope.addNoteToItem = function(){
        $http.post('http://dev.kocloud.net/api/FSItem',{Id:$scope.selectedItemsArray[0].Id, Notes:[{Id:0, UID:"note_add", Item: $scope.noteDataToAdd}]}).
            success(function(data, status, headers, config) {
                console.log("Success: add note");
                finedObjectAndUpdate(data['ChangedForms']);
            }).
            error(function(data, status, headers, config) {
                console.log("Error: add note");
            });
        $scope.noteDataToAdd = "";
    }

    // обновить обект(ы)
    function finedObjectAndUpdate(ChangedForms){
        for(var i = 0; i < ChangedForms.length; i++){
            $http.get('http://dev.kocloud.net/api/FSItem/'+ChangedForms[i]
            ).success(function(data, status, headers, config) {
                    for(var i = 0; i < $scope.data.length; i++){
                        if($scope.data[i].Id == data.Id){
                            $scope.data[i] = data;
                        }
                    }
                    for(var i = 0; i < $scope.selectedItemsArray.length; i++){
                        if($scope.selectedItemsArray[i].Id == data.Id){
                            $scope.selectedItemsArray[i] = data;
                        }
                    }
                    console.log("Success: update data");
                }).error(function(data, status, headers, config) {
                    console.log("Error: update data");
                });
        }
    }

    $scope.currentPosition = [{Name:"KoCloud", Id:'KoCloud'}]; // положение относительно иерархии. При нажатии на папку добовляю Id папки.
    $scope.itemToWorkWith = undefined;
    $scope.onItemClick = function(itemObject){
        $scope.selectedItemsArray = [];
        // По идее должно открыть картинку в браузере если байты как dataUrl
        if(itemObject.FileType > 0 && itemObject.hasOwnProperty('File')){
            if(itemObject.File.hasOwnProperty('MIME')){
                if(itemObject.File.MIME == 'image/gif' || itemObject.File.MIME == "image/jpeg" || itemObject.File.MIME == "image/png" || itemObject.File.MIME == "image/pjpeg"){
                    $http.get('http://dev.kocloud.net/download/'+itemObject.File.Id
                    ).success(function(data, status, headers, config) {
                            document.open(data, 'Image');
                        }).error(function(data, status, headers, config) {
                            console.log('error');
                        });
                }
            }
        } else if(itemObject.FileType == 0) {
            $scope.FSItemUploadDone = false;
            $scope.selectedItemsArray = [];
            $scope.itemToWorkWith = $scope.data[getIndexOfObjectInArrayByField($scope.data, 'Id', itemObject.Item.Id)];

            $http.get('http://dev.kocloud.net/api/FSItem/'+itemObject.Item.Id+'?cascade=true'
            ).success(function(data, status, headers, config) {
                    var tmp = [];
                    for(var i = 0; i < Object(data.Items).length; i++){
                        if(Object(data.Items[i].Item).hasOwnProperty('Name')){
                            tmp.push(data.Items[i].Item);
                        }
                    }
                    $scope.data = tmp;

                    var addPosition = {Name:itemObject.Name, Id:itemObject.Item.Id};
                    $scope.currentPosition.push(addPosition);
                    $scope.selectedItemsArray = [];
                    $scope.FSItemUploadDone = true;
                    console.log('RESULT: ' + JSON.stringify(tmp, null, 4));
                }).error(function(data, status, headers, config) {
                    $scope.FSItemUploadDone = true;
                    console.log('error');
                });
        }
    };

    // выбор позиции в иерархии папок
    $scope.choosePosition = function(positionName, positionId){
        for(var i = 0; i < Object($scope.currentPosition).length; i++){
            if(positionId == $scope.currentPosition[i].Id){
                $scope.currentPosition = $scope.currentPosition.slice(0, ++i);
                if(Object($scope.currentPosition).length == 1){
                    $scope.queryHighLevelOfHierarchy();
                } else {
                    $http.get('http://dev.kocloud.net/api/FSItem/'+positionId+'?cascade=true'
                    ).success(function(data, status, headers, config) {
                            var tmp = [];
                            for(var i = 0; i < Object(data.Items).length; i++){
                                if(Object(data.Items[i].Item).hasOwnProperty('Name')){
                                    tmp.push(data.Items[i].Item);
                                }
                            }
                            $scope.data = tmp;
                            $scope.selectedItemsArray = [];
                            $scope.FSItemUploadDone = true;
                            console.log('RESULT: ' + JSON.stringify(tmp, null, 4));
                        }).error(function(data, status, headers, config) {
                            $scope.selectedItemsArray = [];
                            $scope.FSItemUploadDone = true;
                            console.log('error');
                        });
                }
            }
        }
    };

    // Ищу объект по заданному значению поля и значения поля. Например файл, папка, музыка... (по всей иерархии)
    $scope.selectObjectsBySpecificField = function(field, value){
        $scope.selectedItemsArray = [];
        var resultOfSearch = [];

        $http.get("http://dev.kocloud.net/api/FSItem")
            .success(function(data, status, headers, config) {
                search(data);
                $scope.data = resultOfSearch;
                console.log('RESULT: ' + JSON.stringify(resultOfSearch, null, 4));
            }).error(function(data, status, headers, config) {
                console.log('Error fined files in object');
            });

        function search(object){
            for (var i = 0; i < object.length; i++) {
                if (object[i][field] == value && Object(object[i].Items).length == 0) {
                    resultOfSearch.push(object[i]);
                } else if (Object(object[i].Items).length > 0 && object[i][field] == value) {
                    searchForFile(object[i]);
                }
            }

            function searchForFile(object) {
                for (var i = 0; i < Object(object.Items).length; i++) {
                    if (Object(object.Items[i].Item.Items).length > 0 && object.Items[i].Item.FileType == 0) {
                        searchForFile(object.Items[i].Item);
                    } else {
                        if (object.Items[i].Item[field] == value) {
                            resultOfSearch.push(object.Items[i].Item);
                        }
                    }
                }
            }
        }
    }

    // поиск объекта где поле Name == fileNameToSearch (по всей иерархии)
    $scope.finedFileNameInObject = function(fileNameToSearch){
        $scope.selectedItemsArray = [];
        var resultOfSearch = [];
        if(fileNameToSearch.length > 0) {
            $http.get("http://dev.kocloud.net/api/FSItem")
                .success(function (data, status, headers, config) {
                    search(data);
                    $scope.data = resultOfSearch;
                    console.log('RESULT: ' + JSON.stringify(resultOfSearch, null, 4));
                }).error(function (data, status, headers, config) {
                    console.log('Error fined files in object');
                });

            function search(object) {
                for (var i = 0; i < object.length; i++) {
                    if (object[i].hasOwnProperty('Name')) {
                        if (Object(object[i].Items).length > 0 && object[i].FileType == 0) {
                            searchForFile(object[i]);
                        } else if (Object(object[i].Name).indexOf(fileNameToSearch) != -1) {
                            resultOfSearch.push(object[i]);
                        }
                    }
                }

                function searchForFile(object) {
                    for (var i = 0; i < object.Items.length; i++) {
                        if (object.Items[i].Item.hasOwnProperty('Name')) {
                            if (Object(object.Items[i].Item.Items).length > 0 && object.Items[i].Item.FileType == 0) {
                                searchForFile(object.Items[i].Item);
                            } else if (Object(object.Items[i].Item.Name).indexOf(fileNameToSearch) != -1) {
                                resultOfSearch.push(object.Items[i].Item);
                            }
                        }
                    }
                }
            }
        }
    }

    // скачать файл (если папка то файлы внутри папки)
    $scope.downloadSelectedFiles = function(){
        var filesToDownload = [];
        startSearch();
        function startSearch(){
            for (var i = 0; i < $scope.selectedItemsArray.length; i++) {
                if (Object($scope.selectedItemsArray[i].Items).length > 0 && $scope.selectedItemsArray[i].FileType == 0) {
                    searchForFile($scope.data[i]);
                } else if ($scope.selectedItemsArray[i].hasOwnProperty('File') && Object($scope.selectedItemsArray[i].Items).length == 0) {
                    filesToDownload.push($scope.selectedItemsArray[i]);
                }
            }

            function searchForFile(object) {
                for (var i = 0; i < object.Items.length; i++) {
                    if (Object(object.Items[i].Item.Items).length > 0 && object.Items[i].Item.FileType == 0) {
                        searchForFile(object.Items[i].Item);
                    } else if(object.Items[i].Item.hasOwnProperty('File')) {
                        filesToDownload.push(object.Items[i].Item);
                    }
                }
            }
        }

        var count = 0;
        function download(object){
            var link = document.createElement("a");
            link.download = object[count].Name;
            link.href = 'http://dev.kocloud.net/download/'+object[count].File.Id;
            link.click();
            if(++count < object.length){
                download(object);
            }
        }
        download(filesToDownload);
    }

    // Вебсокет. можно выбрать все файлы или только некоторые.
    $scope.connection = $.hubConnection();
    $scope.contosoChatHubProxy = $scope.connection.createHubProxy('FormTracker');

    $scope.itemEditFormIds = [];

    $scope.onWsInvokerSelectAll = function(){
        if($scope.wsInvokerCheck == true){
            $scope.offWsInvoker();
        }
        var allItemIds = [];
        var flag = false;
        $http.get("http://dev.kocloud.net/api/FSItem")
            .success(function (data, status, headers, config) {
                search(data);
            }).error(function (data, status, headers, config) {
                console.log('Error fined files in object');
            });

        function search(object) {
            for (var i = 0; i < object.length; i++) {
                if (Object(object[i].Items).length > 0) {
                    searchForFile(object[i]);
                } else {
                    allItemIds.push(object[i].Id);
                }
            }

            function searchForFile(object) {
                for (var i = 0; i < object.Items.length; i++) {
                    if (Object(object.Items[i].Item.Items).length > 0) {
                        searchForFile(object.Items[i].Item);
                    } else {
                        allItemIds.push(object.Items[i].Id);
                    }
                }
            }
            $scope.contosoChatHubProxy.on('OnUpdated', function(FormId) {
                console.log(FormId+ "   " +  $scope.itemEditFormIds.length);
                $scope.itemEditFormIds.push(FormId);
                document.getElementById("webSocketMessages").innerHTML = (String)($scope.itemEditFormIds.length);
            });
            $scope.connection .start().done(function() {
                console.log('done');
                $scope.contosoChatHubProxy.invoke('TrackForms', allItemIds);
                $scope.wsInvokerCheck = true;
            });
        }
    }

    $scope.offWsInvoker = function(){
        $scope.connection.stop();
        $scope.connection = $.hubConnection();
        $scope.contosoChatHubProxy = $scope.connection.createHubProxy('FormTracker');
        $scope.itemEditFormIds = [];
        document.getElementById("webSocketMessages").innerHTML = (String)($scope.itemEditFormIds.length);
        $scope.wsInvokerCheck = false;
    }

    $scope.setWsInvokeFormIds = function(formIds){
        if($scope.invokeIdsArray.length > 0){
            console.log("WebSocket: close");
            if($scope.wsInvokerCheck == true){
                $scope.offWsInvoker();
            }
            $scope.contosoChatHubProxy.on('OnUpdated', function(FormId) {
                console.log(FormId+ "   " +  $scope.itemEditFormIds.length);
                $scope.itemEditFormIds.push(FormId);
                document.getElementById("webSocketMessages").innerHTML = (String)($scope.itemEditFormIds.length);
            });

            $scope.connection .start().done(function() {
                console.log('done');
                $scope.contosoChatHubProxy.invoke('TrackForms', $scope.invokeIdsArray);
                $scope.wsInvokerCheck = true;
            });
        }
    }

    $scope.resetWsInvokeFormIds = function(){
        $scope.invokeIdsArray = [];
        $scope.invokeId = undefined;
    }

    $scope.wsInvokerCheck = false;

    $scope.removeInvokeId = function(Id){
        for(var i = 0; i < $scope.invokeIdsArray.length; i++){
            if($scope.invokeIdsArray[i] == Id){
                $scope.invokeIdsArray.splice(i, 1);
            }
        }
    }

    $scope.invokeIdsArray = [];
    $scope.invokeId = undefined;
    $scope.InvokeKyeHandler = function(keyEvent) {
        if (keyEvent.which === 13){
            $scope.invokeIdsArray.push($scope.invokeId);
            $scope.invokeId = undefined;
        }
    }

    // Загрузка файлов в папку где сейчас находимся. Сделал все как написано но все равно не работает
    document.getElementById('chooseFile').addEventListener('change', function(e) {
        var files = e.target.files;
        var request = new XMLHttpRequest();
        request.open("POST", "http://dev.kocloud.net/api/FSItem");
        var formData = new FormData();
        $http.get("http://dev.kocloud.net/api/FSItem")
            .success(function (data, status, headers, config) {
                search(data);
            }).error(function (data, status, headers, config) {
                console.log('Error fined files in object');
            });
        function search(data){
            if($scope.currentPosition[$scope.currentPosition.length - 1].Id == "KoCloud"){
                for (var i = 0, f; f = files[i]; i++) {
                    formData.append('File', e.target.result);
                    formData.append('save', {
                        Id: 0,
                        Name: e.target.files[i].name,
                        File: {Id: -1},
                        Template: {Id: 1},
                        UID: 1
                    });
                    request.send(formData);
                }
            } else {
                for(var j = 0; j < data.length; j++) {
                    if(data[j].Id == $scope.currentPosition[$scope.currentPosition.length - 1].Id){
                        for (var i = 0, f; f = files[i]; i++) {
                            formData.append(e.target.files[i].name, e.target.files[i].type);
                            formData.append('save', {
                                Id: data[j].Id,
                                Items: [{
                                    Id: 1,
                                    Item: {Name: e.target.files[i].name,File: {Id: -1}, Template: {Id: 1},  UID: 1}
                                }]
                            });
                            request.send(formData);
                        }
                    }
                }
            }
        }
    }, false);

});
