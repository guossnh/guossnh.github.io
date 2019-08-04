
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
  console.log(getOperationDataLink + "riqi(eq):" + return_date_url_use(date))
  //对日期做判断需要加0
  $.ajax({
    url: getOperationDataLink + "riqi(eq):" + return_date_url_use(date),
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
function return_date_url_use(date) {
  //这个方法判断月份和日期是否是一位如果是的话需要前边加0
  function get_date_str(nu) {
    if (String(nu).length == 1) {
      return "0" + String(nu);
    } else {
      return nu;
    }
  }
  return date.getFullYear() + "-" + get_date_str(date.getMonth() + 1) + "-" + get_date_str(date.getDate())
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
function make_list_to_select() {
  var select_data_List = [];
  for (i = 0; i < yestdayAllData.length; i++) {
    $("#selectNameList").append("<div onclick=makeDataToPage(" + yestdayAllData[i].chanpinid + ")  class='weui-actionsheet__cell'>" + yestdayAllData[i].yunyingxingming11 + "的" + yestdayAllData[i].chanpinmingcheng1 + "</div>");
    var oneyestdayData = {}
    oneyestdayData["label"] = "" + yestdayAllData[i].yunyingxingming11 + "的" + yestdayAllData[i].chanpinmingcheng1 + "";
    oneyestdayData["value"] = "" + yestdayAllData[i].chanpinid + "";
    select_data_List.push(oneyestdayData)
  }
  return select_data_List
}


//通过ID像页面展示数据
function makeDataToPage(chanpinid) {
  var one_product_id_yesterday = find_One_OPdata_by_product_id(chanpinid)
  var one_product_id_beforeyesterday = find_One_OPdata_by_product_id(chanpinid, 1)
  //百分比计算方法
  function GetPercent(num, total) {
    console.log("分子：" + num)
    console.log("分母" + total)
    num = parseFloat(num);
    total = parseFloat(total);
    if (isNaN(num) || isNaN(total)) {
      return "-";
    }
    return total <= 0 ? "0%" : (Math.round(num / total * 10000) / 100.00) + "%";
  }
  //通过js方法插入数据减少代码量——————参数一：变量名。不能为空。参数二：显示名称：不能为空
  function make_data_content(v_name, show_name) {
    //取昨日和今日的数据
    var yestady_one_data = one_product_id_yesterday[v_name];
    var before_yestady_one_data = one_product_id_beforeyesterday[v_name];
    if (yestady_one_data > before_yestady_one_data) {
      $("#contentTable").append("<tr><td>" + show_name + "</td><td>" + yestady_one_data + "</td><td><span style='color: red;'>增加" + GetPercent((yestady_one_data - before_yestady_one_data), yestady_one_data) + "</span></td></tr>")
    } else if (yestady_one_data < before_yestady_one_data) {
      $("#contentTable").append("<tr><td>" + show_name + "</td><td>" + yestady_one_data + "</td><td><span style='color: green;'>减少" + GetPercent((before_yestady_one_data - yestady_one_data), yestady_one_data) + "</span></td></tr>")
    } else {
      $("#contentTable").append("<tr><td>" + show_name + "</td><td>" + yestady_one_data + "</td><td>持平</td></tr>")
    }
  }
  $("#DataTitle").append('<h1>' + one_product_id_yesterday.yunyingxingming11 + "的" + one_product_id_yesterday.chanpinmingcheng1 + '昨天运营数据如下<h1>');
  //表格生成标题行
  $("#DataContent").append('<table class="gridtable" id= "contentTable"><tr><th>类别</th><th>昨日数据</th><th>前日较</th></tr></table>');
  //天加总访客数合计
  make_data_content("zongfangkeshuheji", "总访客数合计");
  //添加自然访客数
  make_data_content("ziranfangkeshu", "自然访客数");
  //推广访客数tuiguangfangkeshu
  make_data_content("tuiguangfangkeshu", "推广访客数");
}




//输入产品ID查找数据下标,num是判断需要昨天的数据还是前天的数据0是昨天的数据默认不写，1是前天的数据。其他的就返回null
function find_One_OPdata_by_product_id(chanpinid, num = 0) {
  console.log("chanpinid传入的值为" + chanpinid)
  console.log("chanpinid传入的值的类型为" + typeof chanpinid)
  String(chanpinid)
  if (num == 0) {
    for (i = 0; i < yestdayAllData.length; i++) {
      if (String(yestdayAllData[i].chanpinid) == chanpinid) {
        return yestdayAllData[i];
      }
    }
    console.log("昨天数据没有查到ID")
  } else if (num == 1) {
    for (i = 0; i < beforeYestdayAllData.length; i++) {
      if (String(beforeYestdayAllData[i].chanpinid) == chanpinid) {
        return beforeYestdayAllData[i];
      }
    }
    console.log("前天数据没有查到ID")
  } else {
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
  $('#personData').on('click', function () {
    $(".weui-tab__panel").empty();
    $(".weui-tab__panel").append('<div class="weui-skin_android" id="androidActionsheet" style="display: non  "><div class="weui-actionsheet"><div id="selectNameList" class="weui-actionsheet__menu"></div></div></div>');
    $(".weui-tab__panel").append('<div class="page__hd" id="DataTitle"></div>');
    $(".weui-tab__panel").append('<div class="page__bd page__bd_spacing" id="DataContent"></div>');
    //展示列表
    var $androidActionSheet = $('#androidActionsheet');
    var $androidMask = $androidActionSheet.find('.weui-mask');
    $androidActionSheet.fadeIn(200);
    $androidMask.on('click', function () {
      $androidActionSheet.fadeOut(200);
    });
  });
  //当点击整体选项
  $('#AllData').on('click', function () {
    $(".weui-tab__panel").empty();
    $(".weui-tab__panel").append('<div class="page__hd"><h1 class="page__title">昨日销售总额：' + getTureAllSellMoney() + '</h1><p class="page__desc">数据为已经统计的数据之和</p></div>');
  });

  //当增加按钮被点击的时候
  $('#addData').on('click', function () {
    alert("暂时未完善")
  });

});