// ==UserScript==
// @name         pdd_all_remark
// @namespace    http://guossnh.github.io/pdd_all_remark/userscript.js
// @version      0.1
// @description  是自己用的批量备注的软件
// @author       You
// @updateURL  http://guossnh.github.io/pdd_all_remark/userscript.js
// @downloadURL http://guossnh.github.io/pdd_all_remark/userscript.js
// @match https://mms.pinduoduo.com/orders/list
// @require  https://cdn.bootcss.com/jquery/3.4.1/jquery.min.js
// ==/UserScript==
//message-box-NewMsgBox--important-wrapper-3bLn3   这是class 可以在这里插入元素

var sell_id_num= 0;
var reight_id=0;
var data_list = [];


function add_button(){
    var $a1 = $("<a style = 'position:fixed;bottom:100px;right:0px;width:62px;height:62px;z-index:901;background-color:#44c767;-moz-border-radius:42px;-webkit-border-radius:42px;border-radius:42px;border:2px solid #18ab29;display:inline-block;cursor:pointer;color:#ffffff;font-family:Arial;font-size:19px;padding:15px 7px;text-decoration:none;text-shadow:0px 1px 0px #2f6627;margin-bottom: 90px;margin-right: 135px;' id= 'remark_button' class='myButton'>备注</a>");
    $("body").append($a1);//找到这个div
}

function add_div_for_remark(){
    var $d1 =$('<div class = "message-box-NewMsgBox-AllMsg--modal-1xe4g" style = "position: fixed;left: 0;right: 0;bottom: 0;top: 0;background: rgba(0, 0, 0, 0.4);display: flex;justify-content: center;-webkit-box-align: center;    align-items: center;" id = "background_div" ><div id ="list_box_div" style = "position: relative;    height: 600px;width: 300px;background: white;border-radius: 6px;"><textarea id = "tx1" style ="height:500px;width:300px;"></textarea><br><input type="button" id ="bu" style ="height:38px;width:140px;" value= "go"><br></div></div>');
    $("#remark_button").after($d1);//找到这个div

    $("#background_div").on('click', function (e) {
	    if(e.target === $(this)[0]){
            $("#background_div").remove();
	    }
    });
    $("#list_box_div").on('click', function () {
        console.log("pass");
    });
}

function send_json_to_server_for_remark(product_id){
    var jsondata = {startTime: startTimen,endTime: endTimen,orderSn: product_id,pageNum: 0,pageSize: 20};
    $.ajax({
        url: "",
        method: "POST",
        authority: "mms.pinduoduo.com",
        path: "/latitude/message/getHistoryMessage",
        scheme: "https",
        accept: "application/json, text/javascript, */*; q=0.01",
        'accept-encoding': "gzip, deflate, br",
        'accept-language': "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
        cookie:document.cookie,
        origin: "https://mms.pinduoduo.com",
        referer: "https://mms.pinduoduo.com/chat-service/search",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent":navigator.userAgent,
        async: false,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(jsondata),
        success: function (data) {
            console.log("成功返回数据");

        }
      });
}

function get_id_from_div(){
    data_list = $("#tx1").val().split(/[\n]/);//获取文本框的值并且拆分字符串放入数组
    
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
}


(function () {
    add_button();
    // Your code here...
    $('#remark_button').on('click', function () {
        console.log("进来了");
        add_div_for_remark();
    });
})();


