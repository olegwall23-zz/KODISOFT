/**
 * Created by Sohan on 22.11.2014.
 * 
 * Отправлял письма на русском на нем же буду и комментировать.
 * 
 * 
 *  Не работает изменение поля Items у объекта
 *
 $scope.testRequestItem = function(itemToEdit){
 	$http.post('http://dev.kocloud.net/api/FSItem',
 	{
 	     Id:itemToEdit, Items : [
    		{Id:0, UID:"fileItem1", Item : 
	        {Id:0, Template:{Id : 1}, Name:"Nested file", UID: "file1" }}]
 		
 	}
	     ).success(function(data, status, headers, config) {
            }).error(function(data, status, headers, config) {
            });
 }
 
 POST http://dev.kocloud.net/api/FSItem 400 (Bad Request)
"Message": "New form can`t have original value",
"Source": "KoCloud.Server.Model",

 Если бы оно работало, то благодаря двум функциям ниже можно было бы добавить объект файла или папки в поле объекта
 с которыми вы сейчас работаете по иерархии.
 
 $scope.addFileToItems = function(ItemId, ItemName){
        $('#chooseFile').click();
        document.getElementById('chooseFile').addEventListener('change', function(e) {
            var files = e.target.files;
            var countFile = 0;
            var id = 0;
            var request = new XMLHttpRequest();
            request.open("POST", "http://dev.kocloud.net/api/FSItem");
            for (var i = 0, f; f = files[i]; i++) {
                var musicTypes = ['audio/basic','audio/L24','audio/mp4','audio/mpeg',
                    'audio/vnd.rn-realaudio','audio/ogg','audio/vorbis','audio/x-ms-wma','audio/x-ms-wax',
                    'audio/vnd.wave','audio/webm'];
                var imageTypes = ['image/gif','image/jpeg','image/pjpeg','image/png','image/svg+xml',
                    'image/tiff','image/vnd.microsoft.icon','image/vnd.wap.wbmp'];
                var videoTypes = ['video/mpeg','video/mp4','video/ogg','video/quicktime','video/webm','video/x-ms-wmv','video/x-flv'];

                function checkMIME(fT){
                    for(var i = 0; i < musicTypes.length; i++){
                        if(fT == musicTypes[i]){	return 3;	}
                    }
                    for(var i = 0; i < imageTypes.length; i++){
                        if(fT == imageTypes[i]){ return 2;	}
                    }
                    for(var i = 0; i < videoTypes.length; i++){
                        if(fT == videoTypes[i]){ return 4;}
                    }
                    return 1;
                }
                var MIMEType = checkMIME();
                var formData = new FormData();
                var idToUpload = $scope.getIdToUpload();
                formData.append(e.target.files[i].name, e.target.files[i]);
                if(idToUpload == "KoCloud"){
                    formData.append('save', {Id:0, Name: e.target.files[i].name, FileType: MIMEType, Template:{Id:1}, File:{Id:-1}, UID:1});    
                } else {
                    formData.append('save',
                        {Id:idToUpload, Items : [
                            {Id:0, Item : {Id:0, Name: e.target.files[i].name, FileType: MIMEType, Template:{Id:1}, File:{Id:-1}, UID:1}}
                        ]
                        }
                    );    
                }                             
                request.send(formData);
            }
        }, false);
    }
    
    $scope.addFolderToItem = function(FileName){
        var idToUpload = $scope.getIdToUpload();
        if(idToUpload == "KoCloud"){
            $http.post("http://dev.kocloud.net/api/FSItem",{Id:0, Name:FileName, FileType:0})
                .success(function(data, status, headers, config) {
                    $scope.updateDataAndSelectedItems();
                    console.log('New folder created');
                }).error(function(data, status, headers, config) {
                    console.log('Error: create new folder ');
                });        
        } else {
            $http.post("http://dev.kocloud.net/api/FSItem",
                {Id:idToUpload, Items : [
                    {Id:0, Item : {Id:0, Name:FileName, FileType:0}}
                ]
                }                
               ).success(function(data, status, headers, config) {
                    $scope.updateDataAndSelectedItems();
                    console.log('New folder created');
                }).error(function(data, status, headers, config) {
                    console.log('Error: create new folder ');
                });
        }
    }
 	
    $scope.getIdToUpload = function(){
        return $scope.currentPosition[$scope.currentPosition.length - 1].Id;
    }
  
 */

var app = angular.module('app', []);

app.controller("koCloudController", function($scope, $http){
    $scope.FSItemUploadDone = false;
    $scope.data = []; // Масив обьектов.  
    $scope.authorizationButtonValue = "Sign in";
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

     //	При загрузке страницы загружаю все айтемы в $scope.data
    $scope.request = function(){
        $scope.FSItemUploadDone = false;
        $http.get("http://dev.kocloud.net/api/")
            .success(function(data, status, headers, config) {
                $scope.data = data;
                $scope.FSItemUploadDone = true;
         //       console.log('queryItems: '+JSON.stringify(data, null, 4));
            }).error(function(data, status, headers, config) {
                $scope.FSItemUploadDone = true;
                console.log('error');
            });
    }

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
//  Функция для получения обектов 
    $scope.queryingData = function(type, id, specific, options){
        $scope.FSItemUploadDone = false;
        var url = 'http://dev.kocloud.net/api';
        if(type != null){
            url += "/" + type;
            if(id != null){
                url += "/" + id;
                if(specific != null){
                    url += "/" + specific;
                    if(options != null){
                        url += "/" + options;
                    }
                }
            }
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
    $scope.folderDescription = "";
    $scope.addFolderDescription = true;
    $scope.createNewFolderName = function(){
        if(checkForExistsFileName($scope.newFolderName)){
            $http.post("http://dev.kocloud.net/api/FSItem",{Id:0, Name:$scope.newFolderName, FileType:0, Description: $scope.folderDescription})
                .success(function(data, status, headers, config) {
                    $scope.updateDataAndSelectedItems();
                    console.log('New folder created');
                }).error(function(data, status, headers, config) {
                    console.log('Error: create new folder ');
                });
            $scope.description = "";
            $scope.addFolderDescription = true;
            $('#CreateNewFolderModal').modal('hide');
        }
    };
    $scope.resetNewFolderName = function(){
        $scope.newFolderName = undefined;
    }
    $scope.newFolderName = undefined;

    // Переименовать объект
    $scope.newFileName = undefined;
    $scope.renameFile = function(){
        $scope.newFileName = $scope.selectedItemsArray[0].Name;
        $('#renameModal').modal('show');
    }
    $scope.saveNewFileName = function(){
        if($scope.newFileName == $scope.selectedItemsArray[0].Name) {
            $('#renameModal').modal('hide');
        } else if(checkForExistsFileName($scope.newFileName)){
            $http.post('http://dev.kocloud.net/api/FSItem',{Id:$scope.selectedItemsArray[0].Id, Name: $scope.newFileName}).
                success(function(data, status, headers, config) {
                    $scope.data[getIndexOfObjectsArray($scope.data, $scope.selectedItemsArray[0].Id)].Name = $scope.newFileName;
                    console.log('Successful renamed');
                }).
                error(function(data, status, headers, config) {
                    console.log("Error: rename");
                });
        }
    };

   // Отображение выбранных объектов
    $scope.selectedItemsArray = [];
    $scope.isNewItemToAdd = false;
    $scope.selectAllCheck = false;
    $scope.selectAllItemsModel = function(){
        return $scope.selectAllCheck;
    };
    $scope.selectNewItem = function(fileId){
        if($scope.isNewItemToAdd == false){
            if(!checkForObjectExistsInArray($scope.selectedItemsArray, fileId)){
                $scope.selectedItemsArray = [];
                var obj = $scope.data[getIndexOfObjectsArray($scope.data, fileId)];
                $scope.selectedItemsArray.push(obj);
                $scope.selectAllCheck = false;
            }
        }
        $scope.isNewItemToAdd = false;
    }
    $scope.addItemToArray = function(fileId){
        $scope.isNewItemToAdd = true;
        if(!checkForObjectExistsInArray($scope.selectedItemsArray, fileId)){
            var obj = $scope.data[getIndexOfObjectsArray($scope.data, fileId)];
            $scope.selectedItemsArray.push(obj);
        } else {
            $scope.selectedItemsArray.splice(getIndexOfObjectsArray($scope.selectedItemsArray, fileId), 1);
        }
        if($scope.data.length == $scope.selectedItemsArray.length){
            $scope.selectAllCheck = true;
        } else {
            $scope.selectAllCheck = false;
        }
    }
    $scope.checkIfItemExists = function(fileId){
        return checkForObjectExistsInArray($scope.selectedItemsArray, fileId);
    }
    $scope.selectAllItems = function(){
        if($scope.selectAllCheck == false){
            for(var i = 0; i < $scope.data.length; i++) {
                if (!checkForObjectExistsInArray($scope.selectedItemsArray, $scope.data[i].Id)) {
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

    // JS функции которые мне пригодятся 
    // Их можно было бы вынести в отдельный файл для красоты, но мне и так не плохо
    function getIndexOfObjectsArray(arrayInWhichFind, idToCheck){
        for(var i = 0; i < arrayInWhichFind.length; i++){
            if(arrayInWhichFind[i].Id == idToCheck){
                return i;
            }
        }
        return false;
    }

    function checkForObjectExistsInArray(arrayInWhichFind, fieldToCheck){
        for(var i = 0; i < arrayInWhichFind.length; i++){
            if(arrayInWhichFind[i].Id == fieldToCheck){
                return true;
            }
        }
        return false;
    }

    function checkForExistsFileName(fileNameToCheck){
        for(var i = 0; i < $scope.data.length; i++){
            if($scope.data[i].Name == fileNameToCheck){
                return false;
            }
        }
        return true;
    }
   // Удаление объекта
    $scope.deleteFileInfo = function(){
        $('#deleteFileModal').modal('show');
    };

    $scope.deleteFile = function(){
        var countItemsToDelete = $scope.selectedItemsArray.length;
        var countDelete = 0;
        var loop = 1;
        var find = false;
        while(!find){
            for(var i = 0; i < $scope.data.length; i++){
                for(var j = 0; j < $scope.selectedItemsArray.length; j++){
                    if($scope.data[i].Id == $scope.selectedItemsArray[j].Id){
                        $scope.data.splice(i, 1);
                        $scope.selectedItemsArray.splice(j, 1);
                        countDelete++;
                    }
                    if(loop == countDelete){ break; }
                }
                if(loop == countDelete){ break; }
            }
            countItemsToDelete == countDelete ? find = true : loop++;
        }
        $scope.selectAllCheck = false;
        $('#deleteFileModal').modal('hide');
    };

    $scope.deleteObjects = function(){
        for(var i = 0; i < $scope.selectedItemsArray.length; i++){
            $scope.data.splice(getIndexOfObjectsArray($scope.data, $scope.selectedItemsArray[i].Id), 1);
            $http.delete("http://dev.kocloud.net/api/FSItem/"+$scope.selectedItemsArray[i].Id)
                .success(function(data, status, headers, config) {
                    console.log('Delete object: ');
                }).error(function(data, status, headers, config) {
                    console.log('Error: when delete object');
                });
        }
        $scope.selectedItemsArray = [];
    };

    $scope.removeShareId = function(idToRemove){
        $scope.shareIdArray.splice(getIndexOfObjectsArray($scope.shareIdArray, idToRemove), 1);
    };
    $scope.shareIdTyped = undefined;
    $scope.shareIdArray = [];
    $scope.moveFile = function(fileToMove){

    };
    $scope.releaseShareIdArray = function(){
        $scope.shareIdArray = [];
    };
    $scope.kyeHandler = function(keyEvent) {
        if (keyEvent.which === 13){
            var obj = {Id: $scope.shareIdTyped};
            $scope.shareIdArray.push(obj);
            $scope.shareIdTyped = undefined;
        }
    }
//  Добавление и чтение записей в объекте
    $scope.noteDataToAdd = "";
    $scope.addNoteToItem = function(){
        $http.post('http://dev.kocloud.net/api/FSItem',{Id:$scope.selectedItemsArray[0].Id, Notes:[{Id:0, Item: $scope.noteDataToAdd}]}).
            success(function(data, status, headers, config) {
                console.log("success");
                $scope.updateDataAndSelectedItems();
            }).
            error(function(data, status, headers, config) {
                console.log("Error: add note");
            });
        $scope.noteDataToAdd = "";
    }

    $scope.updateDataAndSelectedItems = function(){
        $http.get("http://dev.kocloud.net/api/FSItem")
            .success(function(data, status, headers, config) {
                $scope.data = data;
                if($scope.selectedItemsArray.length > 0){
                    for(var i = 0; i < $scope.selectedItemsArray.length; i++){
                        $scope.selectedItemsArray[i] = $scope.data[getIndexOfObjectsArray($scope.data, $scope.selectedItemsArray[i].Id)];
                    }
                }
                console.log('Data is updated');
            }).error(function(data, status, headers, config) {
                console.log('Error: update data');
            });
    };
//  Функция для хождения по иерархии объекта но только если этот обект папка
    $scope.currentPosition = [{Name:"KoCloud", Id:'KoCloud'}];
    $scope.itemToWorkWith = undefined;
    $scope.onItemClick = function(itemObject){
        if(itemObject.FileType > 0 && itemObject.hasOwnProperty('File')){
            if(itemObject.File.hasOwnProperty('MIME')){
                if(itemObject.File.MIME == 'image/gif' || itemObject.File.MIME == "image/jpeg" || itemObject.File.MIME == "image/png" || itemObject.File.MIME == "image/pjpeg"){
                    $http.get('http://dev.kocloud.net/download/'+itemObject.File.Id
                    ).success(function(data, status, headers, config) {

                            document.open(data);
                        }).error(function(data, status, headers, config) {
                            console.log('error');
                        });
                }
            }
        } else if(itemObject.FileType == 0) {
            $scope.itemToWorkWith = $scope.data[getIndexOfObjectsArray($scope.data, itemObject.Id)];
            var tmp = [];
            for(var i = 0; i < Object($scope.itemToWorkWith.Items).length; i++){
                tmp.push($scope.itemToWorkWith.Items[i].Item);
            }
         //   console.log('queryItems: '+JSON.stringify(tmp, null, 4));
            $scope.data = tmp;
            var addPosition = {Name:itemObject.Name, Id:itemObject.Id};
            $scope.currentPosition.push(addPosition);
        }
    };

    $scope.choosePosition = function(positionName, positionId){
        for(var i = 0; i < Object($scope.currentPosition).length; i++){
            if(positionId == $scope.currentPosition[i].Id){
                $scope.currentPosition = $scope.currentPosition.slice(0, ++i);
                if(Object($scope.currentPosition).length == 1){
                    $scope.queryingData("FSItem", null, null, null);
                } else {

                    function search(object) {
                        if (object.Id == $scope.currentPosition[i].Id) {
                            $scope.data = object;
                        } else {
                            if (Object(object.Items).length > 0 && object.FileType == 0) {
                                searchForId($scope.itemToWorkWith);
                            }
                        }

                        function searchForId(object) {
                            for (var i = 0; i < Object(object.Items).length; i++) {
                                if (object.Items[i].Item.Id != $scope.currentPosition[i].Id) {
                                    searchForId(object.Items[i].Item);
                                } else {
                                    if (object.Items[i].Item.Id == $scope.currentPosition[i].Id) {
                                        $scope.data = object.Items[i].Item;
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };
//  Поиск типа объекта в иерархии объекта(ов)
    $scope.finedFileTypeInObject = function(parameter, fileTypeToSearch){
        $scope.selectedItemsArray = [];
        var resultOfSearch = [];
        var url = "http://dev.kocloud.net/api/";
        if(parameter == "all"){
            url += "FSItem";
        } else if(parameter === parseInt(parameter, 10)) {
            url += "FSItem/" + parameter;
        }

        $http.get(url)
            .success(function(data, status, headers, config) {
               search(data);							
            }).error(function(data, status, headers, config) {
                console.log('Error fined files in object');
            });

        function search(object){
          for (var i = 0; i < (object).length; i++) {					
                if (object[i].FileType == fileTypeToSearch && Object(object[i].Items).length == 0) {
                 resultOfSearch.push(object[i]);
               } else if (Object(object[i].Items).length > 0 && object[i].FileType == 0) {
                   searchForFile(object[i]);
               }
           }

            function searchForFile(object) {
                for (var i = 0; i < object.Items.length; i++) {
                    if (Object(object.Items[i].Item.Items).length > 0 && object.Items[i].Item.FileType == 0) {
                        searchForFile(object.Items[i].Item);
                    } else {
                        if (object.Items[i].Item.FileType == fileTypeToSearch) {
                            resultOfSearch.push(object.Items[i].Item);
                        }
                    }
                }
            }
            $scope.data = resultOfSearch;
            console.log('RESULT: ' + JSON.stringify(resultOfSearch, null, 4));
        }
    }
//  Поиск имени объекта в иерархии объекта(ов)
    $scope.finedFileNameInObject = function(parameter, fileNameToSearch){
        $scope.selectedItemsArray = [];
				 var resultOfSearch = [];
        if(fileNameToSearch.length > 0) {           
            var url = "http://dev.kocloud.net/api/";
            if (parameter == "all") {
                url += "FSItem";
            } else if (parameter === parseInt(parameter, 10)) {
                url += "FSItem/" + parameter;
            }

            $http.get(url)
                .success(function (data, status, headers, config) {
                    search(data);
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
                $scope.data = resultOfSearch;
          //      console.log('RESULT: ' + JSON.stringify(resultOfSearch, null, 4));
            }
        }
    }
// Скачивание файлов из объекта. Если обект папка то ищет в нем файлы и скачивает их
    $scope.downloadSelectedFiles = function(){
        var filesToDownload = [];
        for (var i = 0; i < $scope.selectedItemsArray.length; i++) {
            if (Object($scope.selectedItemsArray[i].Items).length > 0 && $scope.selectedItemsArray[i].FileType == 0) {
                searchForFile($scope.data[i]);
            } else if ($scope.selectedItemsArray[i].hasOwnProperty('File')  && Object($scope.selectedItemsArray[i].Items).length == 0) {
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

        var count = 0;
        function download(object){
            $http.get('http://dev.kocloud.net/download/'+object[count].File.Id
            ).success(function(data, status, headers, config) {
                    var link = document.createElement("a");
                    link.download = object[count].Name;
                    link.href = data;
                    link.click();
                    ++count;
                    if(count < object.length){
                        download(object);
                    }
                }).error(function(data, status, headers, config) {
                    ++count;
                    if(count < object.length){
                        download(object);
                    }
                    console.log('error');
                });
        }
        download(filesToDownload);
    }
// Подписки на изминения всех или только выбраных обектов.
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
    $scope.wsInvokeMessagesShow = function(){
        return $scope.wsInvokerCheck;
    }

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
});
