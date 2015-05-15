/************************************************
 * 项目发布-将待处理的一批文件(夹)复制到指定的文件夹(默认:Release)
 ************************************************/
var fs = require('fs-extra');
var Config = require("./NodejsUtils/Config");
//处理CSS文件的模块
var CssHandler = require("./NodejsUtils/CssHandler");
var ImgHandler = require("./NodejsUtils/ImgHandler");
var JsHandler = require("./NodejsUtils/JsHandler");
var ReadMeHandler = require("./NodejsUtils/ReadMeHandler");

//定义忽略文件名列表
//var ignore_ls = [".sass-cache", "npm-debug.log", "config.rb", "gulpfile.js", "node_modules", "package.json"];
var useful_ls = [];
//Config.global_destdir
//var global_destdir = "./Release/";
var default_rootpath = "./";

/**
 * 从当前的数组列表删除忽略列表中设置的文件夹名称
 * @param  {[type]}   old_arr  之前数组
 * @param  {Function} callback 回调函数
 * @return {[type]}            [description]
 */
function removeIgnoreFromArr(old_arr, callback) {
    //新数组
    useful_ls = old_arr.slice(0);
    for (var j = 0; j < Config.ignore_ls.length; j++) {
        useful_ls.splice(useful_ls.indexOf(Config.ignore_ls[j]), 1);
    }
    //next
    callback();
};

/**
 * 获得根目录下面的所有待操作的文件(夹)名称数组
 * @param  {[type]}   rootpath [description]
 * @param  {Function} next     [description]
 * @return {[type]}            [description]
 */
function getUsefulPathArr(rootpath, next) {
    fs.readdir(rootpath, function(err, files) {
        if (err) {
            return console.error(err);
        }
        //console.log("first the files length is:" + files.length);
        //先保存所有的文件到有用文件列表
        useful_ls = files.slice(0);

        if (files) {
            var pointer = 0;
            while (1) {
                //索引超出停止运行
                if (pointer == useful_ls.length) {
                    //console.log(useful_ls);
                    //console.log("now the useful_ls length is:" + useful_ls.length);
                    removeIgnoreFromArr(useful_ls, next);
                    break;
                }
                //如果开头字母是大写
                if (/^[A-Z]/.test(useful_ls[pointer])) {
                    //剔除之后索引不增加
                    useful_ls.splice(pointer, 1);
                } else {
                    //元素不剔除,索引增加
                    pointer++;
                }
            }
        }
    });
};

/**
 * 复制文件或者文件夹
 * @param  {[type]} srcpath  源路径
 * @param  {[type]} destpath 目的路径
 * @return {[type]}          [description]
 */
function copyFolderOrFile(srcpath, destpath) {
    //使用同步方法
    fs.copySync(srcpath, destpath);
};

//调用过程:获得根目录下的有用(待处理)路径，进行复制
getUsefulPathArr(default_rootpath, function() {
	//先清空原文件夹中的内容
	fs.emptyDirSync(Config.global_destdir);
	console.log("已清空原发布文件夹中的内容。");
	//复制文件(夹)
    //console.log("最后获得有用文件(夹)名称是:" + useful_ls);
    useful_ls.forEach(function(val, index) {
        //开始复制
        copyFolderOrFile(default_rootpath + val, Config.global_destdir + val);
    });
    console.log("文件复制完毕");
    //复制完毕后处理CSS文件
    CssHandler.rmCssMap();
    ReadMeHandler.rmReadmeFile();
    //删除compass精灵图片缓存文件夹
    ImgHandler.rmCompassSpriteDir();
    //删除无用图片
    ImgHandler.rmOldImgWithSpecificSuffix();
    //删除js文件中的注释
    JsHandler.rmJsComments();
});
