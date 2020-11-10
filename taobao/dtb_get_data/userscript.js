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




function get_dtb(){
    var c=0;
    function showLogin()
    {
    c++;
    document.getElementsByClassName("ant-pagination-item ant-pagination-item-"+c+"")[0]
    //document.getElementsByClassName("ant-table-tbody")[0].children[0]
    console.log(document.getElementsByClassName("ant-pagination-item ant-pagination-item-"+c+"")[0]);
    }
    setInterval("showLogin()","1000");
}


(function() {
    'use strict';

    //get_dtb()
})();