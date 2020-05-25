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
var wrong_id=0;
var data_list = [];

function add_button(){
    var $a1 = $("<a style = 'position:fixed;bottom:100px;right:0px;width:62px;height:62px;z-index:901;background-color:#44c767;-moz-border-radius:42px;-webkit-border-radius:42px;border-radius:42px;border:2px solid #18ab29;display:inline-block;cursor:pointer;color:#ffffff;font-family:Arial;font-size:14px;padding:19px 7px;text-decoration:none;text-shadow:0px 1px 0px #2f6627;margin-bottom: 90px;margin-right: 135px;' id= 'remark_button' class='myButton'>remark</a>");
    $("body").append($a1);//找到这个div
}

function sent_vilue_to_txt(){
    for(var i=0;i<document.getElementsByName("tlk").length;i++){
        if(document.getElementsByName("tlk")[i].checked){
            //console.log(document.getElementsByName("tlk")[i].value);
            document.getElementById('tx1').value += "\n" + document.getElementsByName("tlk")[i].value
        }
    }
    //删除空行
    document.getElementById('tx1').value = document.getElementById('tx1').value.replace(/(\n[\s\t]*\r*\n)/g, '\n').replace(/^[\n\r\n\t]*|[\n\r\n\t]*$/g, '');
}

function add_div_for_remark(){
    $("#span_result").remove();
    sell_id_num =0;
    reight_id =0;
    wrong_id = 0;
    var $d1 =$('<div class = "message-box-NewMsgBox-AllMsg--modal-1xe4g" style = "position: fixed;left: 0;right: 0;bottom: 0;top: 0;background: rgba(0, 0, 0, 0.4);display: flex;justify-content: center;-webkit-box-align: center;    align-items: center;" id = "background_div" ><div id ="list_box_div" style = "position: relative;    height: 600px;width: 300px;background: white;border-radius: 6px;"><textarea placeholder="写入单号一行一个，不要加空格" id = "tx1" style ="border:0;border-radius:5px;background-color:rgba(241,241,241,.98);padding: 10px;resize: none;height:500px;width:300px;"></textarea><br><input type = "text" id = "remark_content" placeholder="写入备注内容" style = "width:100%;font-size:17px;margin-bottom: 10px;margin-top: 10px;"><br><input type="button" id ="bu" style ="height:38px;width:140px;"value= "go"><br></div></div>');
    $("#remark_button").after($d1);//找到这个div
    $("#background_div").on('click', function (e) {
	    if(e.target === $(this)[0]){
            $("#background_div").remove();
	    }
    });
    $("#list_box_div").on('click', function () {
        console.log("pass");
    });
    $("#bu").on('click', function () {
        get_id_from_div();
    });
}

function send_json_to_server_for_remark(product_id,user_remark){
    var jsondata = {orderSn: product_id,remark: user_remark};
    $.ajax({
        url: "https://mms.pinduoduo.com/mars/shop/addOrderNote",
        method: "POST",
        authority: "mms.pinduoduo.com",
        path: "/mars/shop/addOrderNote",
        scheme: "https",
        accept: "application/json",
        'accept-encoding': "gzip, deflate, br",
        'accept-language': "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
        cookie:document.cookie,
        'content-length': "52",
        origin: "https://mms.pinduoduo.com",
        referer: "https://mms.pinduoduo.com/orders/list",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent":navigator.userAgent,
        async: false,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(jsondata),
        success: function (data) {
            console.log("成功返回数据");
            console.log(data.success);
            console.log(data);
            if(data.success){
                reight_id++;
                console.log("写入成功");
            }else{
                wrong_id++;
                console.log("写入失败");
            }
        }
      });
}

function find_inf_by_id(sell_id){//根据单个id查询商品信息并且返回商品信息包括 价格 优惠券

}

function get_id_from_div(){
    data_list = $("#tx1").val().split(/[\n]/);//获取文本框的值并且拆分字符串放入数组
    if(data_list[0] == ''){
        alert("请在文本框选择合适的值");
        return null;
    }else{
        var product;
        var remark = document.getElementById('remark_content').value
        for (var i=0;i<data_list.length;i++){
            console.log(data_list[i]);
            product = data_list[i];
            send_json_to_server_for_remark(product,remark);
            sell_id_num++;
            //先给问本框赋值
        }
    }
    var $r1 =$('<span id = "span_result">总共添加了'+sell_id_num+'条\n备注成功'+reight_id+'条\n错误'+wrong_id+'条</span>');
    $("#bu").after($r1);//找到这个div
}

function put_box_to_id(){//在每一个ID的前边放一个多选框
    console.log("开始执行1");
    for(var i=0;i<$(".package-center-table").children.length;i++){
        var pdd_id = $(".package-center-table").children[i].children[0].children[0].children[0].children[0].innerText.split("：")[1];
        console.log(pdd_id);
        var abs=document.createElement("input"); 
        abs.setAttribute('name', 'tlk');
        abs.setAttribute('value', pdd_id);
        abs.setAttribute('type', "checkbox");
        abs.setAttribute('style', "width:20px;");
        abs.setAttribute('id', "myCheck");
        $(".package-center-table").children[i].children[0].children[0].children[0].children[0].before(abs);
    };
}

function put_box_to_id_v2(){
    console.log("开始执行2");
    //删除之前的多选框
    try {
        var checkbox_list = document.getElementsByName("tlk")
        for(var i=0;i<checkbox_list.length;i++){
            checkbox_list[i].remove()
        }
    } catch (error) {
        
    }
    //添加新的多选框
    setTimeout(function () {
        for(var i=0;i<document.getElementsByClassName("package-center-table")[0].children.length;i++){
            var pdd_id = document.getElementsByClassName("package-center-table")[0].children[i].getElementsByTagName("span")[0].innerText.split("：")[1];
            var abs=document.createElement("input"); 
            abs.setAttribute('name', 'tlk');
            abs.setAttribute('value', pdd_id);
            abs.setAttribute('type', "checkbox");
            abs.setAttribute('style', "width:20px;");
            abs.setAttribute('id', "myCheck");
            document.getElementsByClassName("package-center-table")[0].children[i].getElementsByTagName("span")[0].appendChild(abs);
    };
    }, 3000);
}

(function () {
    add_button();
    //code here...
    $('#remark_button').on('click', function () {
        console.log("点击remark按钮");
        add_div_for_remark();
        sent_vilue_to_txt();
    });
    setTimeout(function () {
        put_box_to_id_v2();
        }, 2000);
    setTimeout(function () {
        var spanlist = document.getElementsByTagName("span")
        for(var i =0;i<spanlist.length;i++){
        if(spanlist[i].innerHTML=="查询")
            //console.log(spanlist[i])
            $(spanlist[i].parentNode).on('click', function () {
                console.log("点击remark按钮");
                put_box_to_id_v2();
            });
        }
        var page_button = document.getElementsByClassName("PGT_pagerItem_290")
        for(var i =0;i<spanlist.length;i++){
            $(page_button[i]).on('click', function () {
                console.log("点击了页码按钮");
                put_box_to_id_v2();
            });
        }
        }, 4000);
    
    
})();



