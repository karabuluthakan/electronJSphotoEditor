var app=angular.module('myApp',['ngRoute']);

const {remote}=require('electron');

app.config(function($routeProvider){
    $routeProvider.when('/',{
        templateUrl:'/components/home/home.html',
        controller:'homeCtrl'
    }).when('/edit',{
        templateUrl:'/components/edit/edit.html',
        controller:'editCtrl'
    }).otherwise({
        template:'404 not found!'
    })
})

app.service('imageService',function(){
    var imagePath="";
    var dimension=[];

    this.setImagePath=function(path){
        imagePath=path;
    }

    this.getImagePath=function(){
       return imagePath ;
    }

    this.setImageDimension=function(imageDimension){
        dimension=imageDimension;
    }

    this.getImageDimension=function(){
       return dimension ;
    }
})

app.controller('headCtrl',function($scope){

    var win =remote.getCurrentWindow(); 

    $scope.exit=function(){
        win.close();
    }

    $scope.maximize=function(){
        win.isMaximized()?win.unmaximize():win.maximize();
    }

    $scope.minimize=function(){
        win.minimize();
    }
});

app.controller('homeCtrl',function($scope,$location,imageService){
    $scope.selectFile=function(){
        var {dialog}=remote; 

        dialog.showOpenDialog({
            properties:['opneFile'],
            filters:[{
                name:'Photos',
                extensions:['jpg','jpeg','png']
            }]
        },function(file){
            //console.log(file);
            if(!!file){
                var path=file[0];

                var sizeof=require('image-size');
                var dimension=sizeof(path);
                imageService.setImageDimension(dimension);

                $location.path('/edit');
                $scope.$apply();

                imageService.setImagePath(path);
            }
        })
    }
})

app.controller('editCtrl',function($scope,imageService,$location){
    
    $scope.controlActive=false;
    $scope.imagePath=imageService.getImagePath();

    var filterStyle="";
    var imageReference = document.getElementById('mainImage'); 

    $scope.effects={
        'Brightness':{val:100,min:0,max:200,scale:'%'}, //Parlaklık
        'Contrast':{val:100,min:0,max:200,scale:'%'},   //Kontrast
        'Invert':{val:0,min:0,max:100,scale:'%'},       //Renk tersliği
        'Sepia':{val:0,min:0,max:100,scale:'%'},        //Nostaljik ton
        'Grayscale':{val:0,min:0,max:100,scale:'%'},    //Gri tonlama
        'Opacity':{val:0,min:0,max:360,scale:'%'},      //Saydamlık
        'Saturate':{val:100,min:0,max:200,scale:'%'},   //Doygunluk
        'Blur':{val:0,min:0,max:5,scale:'px'},          //Bulanıklık
        'Hue-Rotate':{val:0,min:0,max:5,scale:'deg'},   //Değiştirme
    };

    $scope.imageEffect=function(effectName){
        console.log(effectName);
        $scope.controlActive=true;

        $scope.activeEffect=effectName;
    }

    $scope.setEffect=function(){
        filterStyle="";

        for(let i in $scope.effects){ //i=>Brightness,etc.
            filterStyle+=`${i}{${$scope.effects[i].val+$scope.effects[i].scale}}`;
        }

        imageReference.style.filter=filterStyle;
        console.log(filterStyle);
    }

    $scope.completed=function(){
        $scope.controlActive=false;
    }

    $scope.change=function(){
        $location.path('/');
    }

    $scope.save=function(){
        const {BrowserWindow}=remote;

        var dimension=imageService.getImageDimension();

        let src=imageService.getImagePath;
        let style=imageReference.style.filter;

        let win=new BrowserWindow({
            frame:false,
            show:false,
            width:dimension.width,
            height:dimension.height,
            webPreferences:{
                webSecurity:false;
            }
        })

        win.loadUrl(`data:text/html,
        <style>"{margin:0;padding:0}"</style>
        <img src="${src}" style="filter:${style}"/>
        
        <script>
            var screenshot = require('electron-screenshot');
            screenshot({
                filename:'image.png',
                delay:1000
            })
        </script> 

        `);
    }
})