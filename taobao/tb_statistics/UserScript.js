// ==UserScript==
// @name         tb_statistics
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://translate.google.cn/?hl=zh-CN&tab=wT&sl=auto&tl=en&text=%E7%BB%9F%E8%AE%A1&op=translate
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.cn
// @grant        none
// @match  https://s.taobao.com/*
// @require  https://cdn.bootcss.com/jquery/3.4.1/jquery.min.js
// ==/UserScript==

(function() {
    //这个是给页面注入显示区域的方法
    function make_div(){
        $("body").append("<div style='position: fixed;right: 3px;top: 100px;z-index: 100000;width:100px,height:100px;background-color: #d2ffd5;'><h3 id = 'guanjianci'>关键词：你好</h3><div/>")
    }
    //传入参数返回url中的值
    function getUrlParam(name) {
        //构造一个含有目标参数的正则表达式对象
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        //匹配目标参数
        var r = window.location.search.substr(1).match(reg);
        //返回参数值
        if(r != null) {
            return decodeURI(r[2]);
        }
        return null;
    }
    //这个是生成数据
    function make_data(){
        $("#guanjianci").text("关键词："+getUrlParam('q')+"")
        var list_nu = $('#mainsrp-itemlist').find(".items").children();
        var all_um = list_nu.length
        var tm_qq = 0//统计天猫全球够的数量
        var cd_d = 0//c店大于1k
        var cd_s = 0//c店少于1k
        for(var i=0;i<list_nu.length;i++){
            if($(list_nu[i]).find(".icon-service-tianmao").length==1||$(list_nu[i]).find(".icon-fest-quanqiugou").length==1){
                tm_qq++
            }
            else if(($(list_nu[i]).find(".icon-service-tianmao").length==0&&$(list_nu[i]).find(".icon-fest-quanqiugou").length==0)){
                var num = $(list_nu[i]).find(".deal-cnt").text();
                num = num.split('+')[0]
                if(num.indexOf("万")==-1){
                    if(parseInt(num)<1000){
                        cd_s++
                    }
                    else{
                        cd_d++
                    }
                }
                else{
                    cd_d++
                }
            }
            else{
                console.log("出错了检测出不是0或者1个天猫图标")
            }
        }

        $("#guanjianci").append("<br><span>总共数量："+all_um+"</span><br><span>天猫全球购："+tm_qq+"</span><br><span>C店多："+cd_d+"</span><br><span>C店少："+cd_s+"</span>")

    }
    $(document).ready(function(){
        //获取页面链接的元素
        
        make_div();
        make_data();

        })
})();

