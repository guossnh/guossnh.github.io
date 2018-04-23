// ==UserScript==
// @name         quicklink
// @namespace    http://guossnh.github.io/quickLink/userscript.js
// @version      0.2
// @description  try to take over the world!
// @author       tlk
// @updateURL  http://guossnh.com/taobao/quickLink/userscript.js
// @downloadURL http://guossnh.com/taobao/quickLink/userscript.js
// @include    *taobao.com*
// @require  http://cdn.bootcss.com/jquery/2.1.0/jquery.js
// ==/UserScript==


function creatButton(){
    $("body").append("<style>.myButton {z-index:999999999;-moz-box-shadow: 3px 4px 0px 0px #899599;-webkit-box-shadow: 3px 4px 0px 0px #899599;box-shadow: 3px 4px 0px 0px #899599;background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #ededed), color-stop(1, #bab1ba));background:-moz-linear-gradient(top, #ededed 5%, #bab1ba 100%);background:-webkit-linear-gradient(top, #ededed 5%, #bab1ba 100%);background:-o-linear-gradient(top, #ededed 5%, #bab1ba 100%);background:-ms-linear-gradient(top, #ededed 5%, #bab1ba 100%);background:linear-gradient(to bottom, #ededed 5%, #bab1ba 100%);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#ededed', endColorstr='#bab1ba',GradientType=0);background-color:#ededed;-moz-border-radius:15px;-webkit-border-radius:15px;border-radius:15px;border:1px solid #d6bcd6;display:inline-block;cursor:pointer;color:#3a8a9e;font-family:Arial;font-size:17px;padding:7px 25px;text-decoration:none;text-shadow:0px 1px 0px #e1e2ed;}.myButton:hover {background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #bab1ba), color-stop(1, #ededed));background:-moz-linear-gradient(top, #bab1ba 5%, #ededed 100%);background:-webkit-linear-gradient(top, #bab1ba 5%, #ededed 100%);background:-o-linear-gradient(top, #bab1ba 5%, #ededed 100%);background:-ms-linear-gradient(top, #bab1ba 5%, #ededed 100%);background:linear-gradient(to bottom, #bab1ba 5%, #ededed 100%);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#bab1ba', endColorstr='#ededed',GradientType=0);background-color:#bab1ba;}.myButton:active {position:relative;top:1px;}</style>");

    $("body").append("<a class='myButton' href = 'https://trade.taobao.com/trade/itemlist/list_sold_items.htm' style='top:100px;left:3px;position:fixed;' >已卖</a>");
    $("body").append("<a class='myButton' href = 'https://sell.taobao.com/auction/merchandise/auction_list.htm?type=1' style='top:200px;left:3px;position:fixed;' >仓库</a>");
    $("body").append("<a class='myButton' href = 'https://login.taobao.com/member/login.jhtml?style=minisimple' style='top:300px;left:3px;position:fixed;' >登录</a>");
    $("body").append("<a class='myButton' href = 'https://sycm.taobao.com/ipoll/rank.htm' style='top:400px;left:3px;position:fixed;' >参谋</a>");
    $("body").append("<a class='myButton' href = 'https://sell.taobao.com/auction/merchandise/auction_list.htm' style='top:500px;left:3px;position:fixed;' >售中</a>");
    $("body").append("<a class='myButton' href = 'https://healthcenter.taobao.com/home/health_home.htm' style='top:600px;left:3px;position:fixed;' >体检</a>");
}


if (window.frames.length == parent.frames.length) {    
    creatButton();
}  