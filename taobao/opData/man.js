
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~我是华丽的分割线~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  
下边是程序所需要的变量
*/
//获取最近三天的时间
var today = new Date();
today.setHours(8)
var yestday = new Date(new Date().getTime() - (1000 * 60 * 60 * 24))
var beforeYestay = new Date(new Date().getTime() - (1000 * 60 * 60 * 48))
var yestdayAllData = [];
var beforeYestdayAllData = [];
var getOperationDataLink = "http://qiancaotang.oicp.vip/magicflu/service/s/jsonv2/d553a687-4234-4536-9fe5-8489c8dfacc3/forms/c323773c-8db0-477d-84d2-c7d5cd17ee5c/records/entry?limit=-1&start=0&bq="
http://qiancaotang.oicp.vip/magicflu/service/s/jsonv2/d553a687-4234-4536-9fe5-8489c8dfacc3/forms/c323773c-8db0-477d-84d2-c7d5cd17ee5c/records/entry?limit=-1&start=0&bq=riqi(eq):2019-07-31

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~我是华丽的分割线~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  
需要的方法
*/

//这个主要是获取页面载入就要执行的
$(function () {

});

//这个 方法是判断两个date格式的年月日是相等的
function dateSame(date1, date2) {
  if (date1.getFullYear() == date2.getFullYear() && date1.getMonth() == date2.getMonth() && date1.getDate() == date2.getDate()) {
    return true
  } else {
    return false
  }
}

//通过日期获取运营数据表格的数据并且返回json格式
function get_data_by_date(date) {
  var result_data = "";
  //对日期做判断需要加0
  $.ajax({
    url: getOperationDataLink + "riqi(eq):" +return_date_url_use(date),
    data: {},
    dataType: 'json',
    async: false,
    success: function (data) {
      result_data = data;
    }
  });
  return result_data;
};

//传入日期返回一个链接使用的日期字符串
function return_date_url_use(date){
  //这个方法判断月份和日期是否是一位如果是的话需要前边加0
  function get_date_str(nu){
    if(String(nu).length==1){
      return "0"+String(nu);
    }else{
      return nu;
    }
  }
  return date.getFullYear()+"-"+get_date_str(date.getMonth())+"-"+get_date_str(date.getDate())
}

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~我是华丽的分割线~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  
man
*/

//底部选项卡的监听
$(function () {
  //选项卡被点击之后的样式更新
  $('.weui-navbar__item').on('click', function () {
    $(this).addClass('weui-bar__item_on').siblings('.weui-bar__item_on').removeClass('weui-bar__item_on');
    //被点击之后删除中心内容
    $(".weui-tab__panel").empty()
  });
  //当点击个人选项
  $('#personData').on('click', function () {
    getData();
  });

  //当点击整体选项
  $('#AllData').on('click', function () {

  });

  //当增加按钮被点击的时候
  $('#addData').on('click', function () {
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