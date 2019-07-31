//获取数据
function getData(){
    $.getJSON( "http://qiancaotang.oicp.vip/magicflu/service/s/jsonv2/d553a687-4234-4536-9fe5-8489c8dfacc3/forms/c323773c-8db0-477d-84d2-c7d5cd17ee5c/records/entry/2", function( data ) {
        var items = [];
        $.each( data, function( key, val ) {
          items.push( "<li id='" + key + "'>" + val + "</li>" );
        });
        $( "<ul/>", {
          "class": "my-new-list",
          html: items.join( "" )
        }).appendTo( "body" );
      });
}

//底部选项卡的监听
$(function() {
    //选项卡被点击之后的样式更新
    $('.weui-navbar__item').on('click', function() {
        $(this).addClass('weui-bar__item_on').siblings('.weui-bar__item_on').removeClass('weui-bar__item_on');
        //被点击之后删除中心内容
        $(".weui-tab__panel").empty()
    });
    //当点击个人选项
    $('#personData').on('click', function() {
        getData();
    });

    //当点击整体选项
    $('#AllData').on('click', function() {

    });

    //当增加按钮被点击的时候
    $('#addData').on('click', function() {
        alert("暂时未完善")
    });

});


//生成单列选择器
//$('#personData').on('click', function () {
//    weui.picker(yestdayDatalist, {
//        onChange: function (result) {
//        },
//        onConfirm: function (result) {
//            makeDataToPage(result)
//        }
//    });
//});