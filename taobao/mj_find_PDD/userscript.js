// ==UserScript==
// @name         mj_find_PDD
// @namespace    http://guossnh.github.io/mj_find_PDD/userscript.js
// @version      1.2
// @description  明君使用的查出刷单的
// @author       You
// @updateURL  http://guossnh.github.io/mj_find_PDD/userscript.js
// @downloadURL http://guossnh.github.io/mj_find_PDD/userscript.js
// @match        https://mms.pinduoduo.com/sycm/goods_effect
// @match        https://mms.pinduoduo.com/mms-chat/search
// @include    https://mms.pinduoduo.com/mms-chat/search
// @require  http://lib.sinaapp.com/js/jquery/1.7.2/jquery.min.js
// @grant        none
// ==/UserScript==

var data_list = [];
var data_num=0;
var right_num = 0;
var startTimen;
var endTimen;

function add_wrong_num(num) {
    var $a1 = $('<span style = "color:red;">' + num + '</span><br>')
    $("#bu").after($a1)
}


(function () {
    var $h1 = $('<textarea id = "tx1" style ="height:300px;width:300px;"></textarea><br><input type="button" id ="bu" style ="height:40px;width:140px;" value= "点击开始执行"><br>');
    $("body").prepend($h1);
    $("#bu").click(function(){
        console.log("进入主函数")
        data_list = $("#tx1").val().split(/[\n]/);//获取文本框的值并且拆分字符串放入数组
        console.log("data_list的值事"+data_list+"")
        //下边是时间的处理部分
        var tt = $("input")[5].value.replace(/-/g,"/");
        var startTime = tt.split(" ~ ")[0];
        var endTime = tt.split(" ~ ")[1];
        startTimen = Date.parse(new Date(startTime))/1000;
        endTimen = Date.parse(new Date(endTime))/1000;

        console.log("startTime是："+startTime+"");
        console.log("endTime是："+endTime+"");
        console.log("startTimen是："+startTimen+"");
        console.log("endTimen是："+endTimen+"");
        setTimeout(function () {
            if(data_list[0] == ''){
                alert("请在文本框选择合适的值");
                return null;
            }else{
                var product;
                for (var i=0;i<data_list.length;i++){
                    console.log(data_list[i]);
                    product = data_list[i];
                    get_json_from_server(product);
                    //先给问本框赋值
                }
            }
            $("#data_num").text(data_num);
            $("#right_num").text(right_num);
        },3000);
        var $resultin = $('<p>总共分析<span id = "data_num" style = "color:red;">'+data_num+'</span>条数据。有<span id = "right_num" style = "color:red;">'+right_num+'</span>条数据出现问题<p>');
            $("body").prepend($resultin);
        });


})();

function get_json_from_server(product_id){
    var jsondata = {startTime: startTimen,endTime: endTimen,orderSn: product_id,pageNum: 0,pageSize: 20};
    $.ajax({
        url: "https://mms.pinduoduo.com/latitude/message/getHistoryMessage",
        method:"POST",
        type: "POST",
        authority: "mms.pinduoduo.com",
        path: "/latitude/message/getHistoryMessage",
        scheme: "https",
        accept: "application/json",
        'accept-encoding': "gzip, deflate, br",
        'accept-language': "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
        'content-type': "application/json;charset=UTF-8",
        contentType: 'application/json;charset=UTF-8',
        cookie:document.cookie,
        origin: "https://mms.pinduoduo.com",
        referer: "https://mms.pinduoduo.com/chat-service/search",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent":navigator.userAgent,
        async: false,
        dataType: "json",
        data: JSON.stringify(jsondata),
        success: function (data) {
            console.log("成功返回数据");
            data_num++;
            console.log("data.total的值是"+data.result.total+"");
            if(data.result.total=="0"){
            }else if(data.result.total=="1"){
                console.log("这条是仅有一条记录的过滤掉");
            }else if((data.result.total!="1")&&(data.result.total!="0")){
                add_wrong_num(product_id);
                right_num++;
            }else{
                console.log("出现重大问题了");
            }
        }
      });
}



    function wrong_or_right(product_id) {
        console.log("wrong_or_right开始执行");
        console.log("product_id的值事："+product_id+"");
        setTimeout(function(){
            var tf = $("div[class='table-blank-text']").attr('style');
            data_num++;
            if(tf =="display: block;"){
                right_num++;
            }else if(tf =="display: none;"){
                add_wrong_num(product_id);
            }
        },2000);
    }

    //190906-255574344533922 //有
    //190813-325206672053584 //没有 