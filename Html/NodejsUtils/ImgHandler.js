/************************************************
 * ImgHandler,图像文件处理模块
 ************************************************/
var fs = require('fs-extra');
var findit = require('findit');
//引入配置
var Config = require("./Config");
//后面相同字母或数字连续重复三次以上
var oldimg_specific_suffix_pattern=/[^a-zA-Z0-9]+([a-zA-Z0-9])\1{2,}\.(png|jpg|jpeg|gif)$/i;
//Config.img_dir
//var useless_dir_prefix = "SP_";
//var img_dir = "./Temp/image/";
/**
 * 去除使用compass产生精灵地图之后多余的缓存文件夹(这些应该删除的文件夹名称中带有特定前缀)
 * @return {[type]} [description]
 */
exports.rmCompassSpriteDir = function() {
    //获得finder对象
    var finder = findit(Config.img_dir);
    finder.on('directory', function(dir, stat, stop) {
        if (dir != Config.img_dir) {
            var regexp = new RegExp("(.*)?" + Config.useless_dir_prefix + "(.*)?");
            //如果是中间包含compass sprite前缀，删除该缓存文件夹
            if (regexp.test(dir)) {
                fs.remove(dir, function(err) {
                    if (err) return console.error(err);
                    console.log('compass精灵图标缓存文件夹删除成功。image中的剩余文件夹是有用的。');
                });
            } 
        }
    });
};
/**
 * 去除image文件夹中无用的图片(使用至少三个相同的字母或数字后缀标识)
 * @return {[type]} [description]
 */
exports.rmOldImgWithSpecificSuffix = function() {
    //获得finder对象
    var finder = findit(Config.img_dir);
    finder.on('file', function(file, stat) {
        if(oldimg_specific_suffix_pattern.test(file)){
            //console.log("soga");
            //console.log("the file path is: "+file);
            fs.remove(file, function(err) {
                if (err) return console.error(err);
                console.log('成功删除旧版本的图片：'+file);
            });
        }
    });
};
