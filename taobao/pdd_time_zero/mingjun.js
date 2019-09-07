    // ==UserScript==
    // @name         mj
    // @namespace    http://tampermonkey.net/
    // @version      0.1
    // @description  try to take over the world!
    // @author       You
    // @match        https://mms.pinduoduo.com/sycm/goods_effect
    // @match        https://mms.pinduoduo.com/chat-service/search
    // @include    https://mms.pinduoduo.com/chat-service/search
    // @grant        none
    // ==/UserScript==

    var data_list = [];
    var data_num=0;
    var right_num = 0;
    var startTimen;
    var endTimen;

    function add_wrong_num(num) {
        var $a1 = $('<span>' + num + '</span><br>')
        $("body").prepend($a1)
    }




    (function () {
        var $h1 = $('<textarea id = "tx1" style ="height:300px;width:300px;"></textarea><br><input type="button" id ="bu" style ="height:40px;width:140px;" value= "点击开始执行">');
        $("body").prepend($h1);
        $("#bu").click(function(){
            console.log("进入主函数")
            data_list = $("#tx1").val().split(/[\n]/);//获取文本框的值并且拆分字符串放入数组
            console.log("data_list的值事"+data_list+"")
            //下边是时间的处理部分
            var startTime = $("input")[2].value;
            var endTime = $("input")[3].value;
            startTimen = Date.parse(new Date(startTime))/1000;
            endTimen = Date.parse(new Date(endTime))/1000;

            console.log("startTime是："+startTime+"");
            console.log("endTime是："+endTime+"");
            console.log("startTimen是："+startTimen+"");
            console.log("endTimen是："+endTimen+"");
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
        });


    })();

    function get_json_from_server(product_id){
        var jsondata = JSON.parse('{"startTime": '+startTimen+',"endTime": '+endTimen+',"orderSn": '+product_id+',"pageNum": 0,"pageSize": 20}');
        $.ajax({
            url: "https://mms.pinduoduo.com/latitude/message/getHistoryMessage",
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
            data: jsondata,
            success: function (data) {
                console.log("成功返回数据");
                data_num++;
                console.log("data.total的值是"+data[0]+"");
                if(data.total=="0"){
                    
                }else if(data.total=="1"){
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