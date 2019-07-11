// ==UserScript==
// @name         pdd_time_zero
// @namespace   http://guossnh.github.io/ pdd_time_zero/ pdd_time_zero.js
// @version      0.1
// @description  这个主要是老谢用拼多多查询的时候 时间归零的插件
// @author       You
// @match        https://mms.pinduoduo.com/orders/list*
// @updateURL  http://guossnh.com/taobao/pdd_time_zero/pdd_time_zero.js
// @downloadURL http://guossnh.com/taobao/pdd_time_zero/pdd_time_zero.js
// @include    https://mms.pinduoduo.com/orders/list*
// @require  https://cdn.bootcss.com/jquery/3.4.1/jquery.min.js
// @grant        none
//
// ==/UserScript==

function set_time_over(){
    //$("input[height='24']").eq('0').attr('value','0')
    setTimeout(function () {
        //这个是获取点击次数的函数
        var time = $("span[class='BeastInputNumber___control-right___1rSuQ BeastInputNumber___control-down___JCYje']")[0]
        //while(time!==undefined){
        //    $("span[class='BeastInputNumber___control-right___1rSuQ BeastInputNumber___control-down___JCYje']").eq(0).click()
        //    time  = $("span[class='BeastInputNumber___control-right___1rSuQ BeastInputNumber___control-down___JCYje']")[0]
        //};
        var getnum = 0
        for( i =6;i<document.getElementsByClassName("BeastInput___input___1TtTZ").length;i++){
            getnum = getnum + Number(document.getElementsByClassName("BeastInput___input___1TtTZ")[i].value)
        }
        for(a = 0 ; a<getnum ; a++){
            $("span[class='BeastInputNumber___control-right___1rSuQ BeastInputNumber___control-down___JCYje']").eq(0).click()
        }
        
    }, 200);
}   

(function() {
    setTimeout(function () {
        $("input[placeholder='请选择日期']").on('click', function () {
        set_time_over();
        });
        $("i[class='BeastIcon___outer-wrapper___1um08 BeastSelect___arrow-icon___3_NXq BeastIcon___type-down___12RiT']").eq(0).click()
        $("span[class='BeastSelect___item-renderer-label___24ERE']").eq(0).click()
    }, 1000);
    setTimeout(function () {
        $("i[class='BeastIcon___outer-wrapper___1um08 BeastSelect___arrow-icon___3_NXq BeastIcon___type-down___12RiT']").eq(1).click()
        setTimeout(function () {
        $("span[class='BeastSelect___item-renderer-label___24ERE']").eq(0).click()
        }, 200);
    }, 1500);
})();
