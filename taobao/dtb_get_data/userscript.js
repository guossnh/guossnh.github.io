// ==UserScript==
// @name         dtb_get_data
// @namespace    http://guossnh.github.io/dtb_get_data/userscript.js
// @version      0.1
// @description  try to take over the world!
// @author       tlk
// @updateURL  http://guossnh.github.io/dtb_get_data/userscript.js
// @downloadURL http://guossnh.github.io/dtb_get_data/userscript.js
// @include    https://www.duotuiba.com/*
// @require  http://lib.sinaapp.com/js/jquery/1.7.2/jquery.min.js
// ==/UserScript==




function get_dtb(page_id){
    //var jsondata = {orderSn: product_id,remark: user_remark,source: 1};
    var get_time = new Date().getTime();
    $.ajax({
        url: "https://web.duotuiba.com/v1/web/order/list?page="+page_id+"&platfrom=0&task_id=0&goods_id=0&state=-1&p_order_id=0",
        method: "GET",
        Accept: "*/*",
        'Accept-Encoding': "gzip, deflate, br",
        'Accept-Language': "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
        Connection: "keep-alive",
        Host: "web.duotuiba.com",
        Origin: "https://www.duotuiba.com",
        platform: web,
        Referer: "https://www.duotuiba.com/",
        'Sec-Fetch-Dest': empty,
        'Sec-Fetch-Mode': cors,
        'Sec-Fetch-Site': "same-site",
        timestamp: get_time,
        token: "2oU29yfypPCQV1dO48Nxb7eZitoaH6oK",
        'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.183 Safari/537.36",
        success: function (data) {
            console.log("成功返回数据");
            console.log(data.success);
            console.log(data);
        }
      });
}


(function() {
    'use strict';

    get_dtb(1)
})();