
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
var getOperationDataLink = "http://qiancaotang.oicp.vip/magicflu/service/s/jsonv2/d553a687-4234-4536-9fe5-8489c8dfacc3/forms/10d021d4-ca02-438c-8fa1-33e0032a9935/records/entry?limit=-1&start=0&bq="











/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~我是华丽的分割线~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  
需要的方法
*/

//这个 方法是判断两个date格式的年月日是相等的
function dateSame(date1, date2) {
  if (date1.getFullYear() == date2.getFullYear() && date1.getMonth() == date2.getMonth() && date1.getDate() == date2.getDate()) {
    return true;
  } else {
    return false;
  }
}

//通过日期获取运营数据表格的数据并且返回json格式
function get_data_by_date(date) {
  var result_data = "";
  console.log(getOperationDataLink+"riqi(eq):"+return_date_url_use(date)) 
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
  return date.getFullYear()+"-"+get_date_str(date.getMonth()+1)+"-"+get_date_str(date.getDate())
}

//生成单列选择器
$('#personData').on('click', function () {
  weui.picker(make_list_to_select(), {
      onChange: function (result) {
      },
      onConfirm: function (result) {
          makeDataToPage(result)
      }
  });
});

//生成选择列表的json文件并且返回
function make_list_to_select(){
  var select_data_List = [];
  for (i = 0; i < yestdayAllData.length; i++) {
    $("#selectNameList").append("<div onclick=makeDataToPage(" + yestdayAllData[i].chanpinid1 + ")  class='weui-actionsheet__cell'>" + yestdayAllData[i].yunyingxingming + "的" + yestdayAllData[i].chanpinmingcheng + "</div>");
    var oneyestdayData={}
    oneyestdayData["label"] = "" + yestdayAllData[i].yunyingxingming + "的" + yestdayAllData[i].chanpinmingcheng + "";
    oneyestdayData["value"] = "" + yestdayAllData[i].chanpinid1 + "";
    select_data_List.push(oneyestdayData)
    }
  return select_data_List
}

//通过ID像页面展示数据
function makeDataToPage(chanpinid){
  var one_product_id_yesterday = find_One_OPdata_by_product_id(chanpinid)
  var one_product_id_beforeyesterday = find_One_OPdata_by_product_id(chanpinid,1)
  $(".weui-tab__panel").empty();
  $(".weui-tab__panel").append('<h1>'+one_product_id_yesterday.yunyingxingming+"的"+one_product_id_yesterday.yunyingxingming+'<h1>');
  
}

//输入产品ID查找数据下标,num是判断需要昨天的数据还是前天的数据0是昨天的数据默认不写，1是前天的数据。其他的就返回null
function find_One_OPdata_by_product_id(chanpinid,num = 0){
  if(num==0){
    for(i = 0; i < yestdayAllData.length; i++){
      if(yestdayAllData[i].chanpinid1 == chanpinid){
        return yestdayAllData[i];
      }else{
        console.log("昨天数据没有查到ID")
        return null
      }
    }
  }else if(num==1){
    for(i = 0; i < beforeYestdayAllData.length; i++){
      if(beforeYestdayAllData[i].chanpinid1 == chanpinid){
        return beforeYestdayAllData[i];
      }else{
        console.log("前天数据没有查到ID")
        return null
      }
    }
  }else{
    console.log("没有找到ID")
    return null;
  }
}


/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~我是华丽的分割线~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  
man
*/

//这个主要是获取页面载入就要执行的
//底部选项卡的监听
$(function () {
  //获取昨天和前天的数据
  yestdayAllData = (get_data_by_date(yestday)).entry
  beforeYestdayAllData = (get_data_by_date(beforeYestay)).entry
  //选项卡被点击之后的样式更新
  $('.weui-navbar__item').on('click', function () {
    $(this).addClass('weui-bar__item_on').siblings('.weui-bar__item_on').removeClass('weui-bar__item_on');
    //被点击之后删除中心内容
    $(".weui-tab__panel").empty()
  });
  //当点击个人选项
  $('#personData').on('click', function() {
    $(".weui-tab__panel").empty();
    $(".weui-tab__panel").append('<div class="weui-skin_android" id="androidActionsheet" style="display: non  "><div class="weui-actionsheet"><div id="selectNameList" class="weui-actionsheet__menu"></div></div></div>');
    $(".weui-tab__panel").append('<div class="page__hd" id="DataTitle"></div>');
    $(".weui-tab__panel").append('<div class="page__bd page__bd_spacing" id="DataContent"></div>');
    //展示列表
    var $androidActionSheet = $('#androidActionsheet');
    var $androidMask = $androidActionSheet.find('.weui-mask');
    $androidActionSheet.fadeIn(200);
    $androidMask.on('click', function() {
        $androidActionSheet.fadeOut(200);
    });
});
  //当点击整体选项
  $('#AllData').on('click', function() {
      $(".weui-tab__panel").empty();
      $(".weui-tab__panel").append('<div class="page__hd"><h1 class="page__title">昨日销售总额：'+getTureAllSellMoney()+'</h1><p class="page__desc">数据为已经统计的数据之和</p></div>');
  });

  //当增加按钮被点击的时候
  $('#addData').on('click', function () {
    alert("暂时未完善")
  });

});