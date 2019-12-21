// ==UserScript==
// @name         copy_id_web
// @version      0.2
// @description  try to take over the world!
// @author       tlk
// @grant        none
//@include    https://www.duotuiba.com*
// @require  http://cdn.bootcss.com/jquery/2.1.0/jquery.js
// @require  https://cdn.bootcss.com/clipboard.js/2.0.4/clipboard.min.js
// @updateURL  http://guossnh.github.io/taobao/copy_id_web/userscript.js
// @downloadURL http://guossnh.github.io/taobao/copy_id_web/userscript.js
// ==/UserScript==


function get_id() {
    var idlist = document.getElementById("root").innerHTML.match(/[0-9]{6}\-{1}[0-9]{15}/g);
    var idtext = "";
    for(x = 0 ; x<idlist.length; x++){
        idtext += idlist[x]+"<br>";
    };
    console.log(idtext);
    $("#foo").html(idtext)
    var clipboard = new ClipboardJS(".myButton");
}

//建立按钮
function creat_button(){
    var $a1 = $("<a id = 'foo' width:0px;height:0px;></a><a style = 'position:fixed;bottom:100px;right:0px;width:62px;height:62px;z-index:901;background-color:#44c767;-moz-border-radius:42px;-webkit-border-radius:42px;border-radius:42px;border:2px solid #18ab29;display:inline-block;cursor:pointer;color:#ffffff;font-family:Arial;font-size:14px;padding:19px 7px;text-decoration:none;text-shadow:0px 1px 0px #2f6627;margin-bottom: 90px;margin-right: 135px;' id= 'copy_button' class='myButton' data-clipboard-target='#foo' rel='noopener noreferrer'>&nbsp;&nbsp;copy</a>");
    $("body").append($a1);//找到这个div
}



(function() {
    'use strict';
    creat_button();
    $('#copy_button').on('click', function () {
        console.log("进来了");
        get_id();
    });

})();