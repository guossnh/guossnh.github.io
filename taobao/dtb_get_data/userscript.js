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
// @connect *
// ==/UserScript==

function click_button(page_num){
    setTimeout(function(){
        var order_id,product_id,money,time,state;
        document.getElementsByClassName("ant-pagination-item ant-pagination-item-"+page_num+"")[0].click();
        var one = document.getElementById("rongqi");
        var table = document.getElementsByClassName("ant-table-tbody")[0].children;
            for(var i=0;i<table.length;i++){
                order_id = table[i].children[0].innerHTML
                product_id = table[i].children[3].innerHTML
                money = table[i].children[5].children[0].innerText.replace("￥","");
                state = table[i].children[6].children[0].children[1].innerText;
                time = table[i].children[7].children[0].children[0].innerText.replace("下单:","");
                console.log(order_id,product_id,money,time,state)
                one.append(""+order_id+","+product_id+","+money+","+time+","+state+"")
            }
    },2000*page_num);
}

function creat_div(){
    var wocao = document.createElement("div");
    wocao.setAttribute("id","rongqi");
    document.getElementsByTagName("body")[0].append(wocao);
}

(function() {
    'use strict';
    var $ = window.jQuery;
    creat_div();
    var c=0;
    for(let i=1;i<5;i++){
            click_button(i);
    }
    
    
})();