
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
var all_weak_date =[];//这是一周数据的合集
var product_ID = "";
var getOperationDataLink = "http://qiancaotang.oicp.vip/magicflu/service/s/jsonv2/d553a687-4234-4536-9fe5-8489c8dfacc3/forms/c323773c-8db0-477d-84d2-c7d5cd17ee5c/records/entry?limit=-1&start=0&bq="


/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~我是华丽的分割线~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  
需要的方法
*/

//获取一周的数据根日期。网表的查询功能真是想骂人，操你妈
function get_data_weak(date,time=7){
  var weak_data=[date];
  for(i = 1; i < time; i++){
    weak_data.push(new Date(date.getTime() - (1000 * 60 * 60 * 24*i)));
  }
  console.log("最近一周的时间数据为"+weak_data);
  for(i = 0; i < time; i++){
    all_weak_date = all_weak_date.concat(get_data_by_date(weak_data[i]).entry);
  }
  console.log("所有数据集合为"+all_weak_date);
}

//这个 方法是判断两个date格式的年月日是相等的
function dateSame(date1, date2) {
  if (date1.getFullYear() == date2.getFullYear() && date1.getMonth() == date2.getMonth() && date1.getDate() == date2.getDate()) {
    return true;
  } else {
    return false;
  }
};
//通过日期获取运营数据表格的数据并且返回json格式
function get_data_by_date(date) {
  var result_data = "";
  make_black_page(true);
  console.log(getOperationDataLink + "riqi(eq):" + return_date_url_use(date))
  //对日期做判断需要加0
  $.ajax({
    url: getOperationDataLink + "riqi(eq):" + return_date_url_use(date),
    data: {},
    dataType: 'json',
    async: false,
    success: function (data) {
      result_data = data;
      make_black_page(false);
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

  function make_date_content_no_count(v_name, show_name){
    $("#contentTable").append("<tr><td>" + show_name + "</td><td>" + one_product_id_yesterday[v_name] + "</td></tr>")
  }
  $("#DataTitle").append('<h2>' + one_product_id_yesterday.yunyingxingming11 + "的" + one_product_id_yesterday.chanpinmingcheng1 + '运营数据如下<h2>');
  //表格生成标题行
  $("#DataContent").append('<table class="gridtable" id= "contentTable"><tr><th>类别</th><th>昨日数据</th><th>前日较</th></tr></table>');
  
  make_data_content("zongfangkeshuheji", "总访客数合计");//天加总访客数合计

  make_data_content("ziranfangkeshu", "自然访客数");//添加自然访客数

  make_data_content("tuiguangfangkeshu", "推广访客数");//推广访客数tuiguangfangkeshu

  make_data_content("tfangkeshu", "真实访客数");//真实访客数tfangkeshu



  make_data_content("zongxiaoshoueheji", "总销售合计");//总销量zongxiaoshoueheji

  make_data_content("tchudanliang", "真实出单量");//tchudanliang真实出单量

  make_data_content("danpinzongxiaoliang", "单品总销量");//总共销量danpinzongxiaoliang
  
  make_data_content("sdandanliang","刷单数量")//刷单数量

  make_data_content("tuiguangchengdanliang", "推广单量");//tuiguangchengdanliang推广单量
  


  make_data_content("tuiguangfeiyong", "推广费用");//推广费用tuiguangfeiyong

  make_data_content("txiaoshoue", "真实销售额");//txiaoshoue真实销售额

  make_data_content("zhuanhuashuai", "转化数");//zhuanhuashuai转化数



  make_data_content("zongpingjiashu", "总评价数");//总评价数zongpingjiashu

  make_date_content_no_count("jiage","价格")//价格jiage
  make_date_content_no_count("xiugaijihua","修改计划")//修改计划xiugaijihua
  make_date_content_no_count("cunzaiwenti","存在问题")//存在问题cunzaiwenti
  make_date_content_no_count("huodong","活动")//活动huodong
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
//计算真实销售额
function getTureAllSellMoney() {
  var allmoney = 0;
  for (i = 0; i < yestdayAllData.length; i++) {
    console.log(yestdayAllData.txiaoshoue)
    allmoney = Number(allmoney) + Number(parseFloat(yestdayAllData[i].txiaoshoue))
  }
  return allmoney.toFixed(2);
}
//生成页面图标的方法
function make_date_img_to_page(chanpin_id) {
/* 
页面数据分成如下
#访客部分
##访客总数
##自然访客数
##推广访客数
##干预访客数、
#流量部分
##流量总数
##自然流量
##推广流量 
##干预流量
#出单数
##总单数
##推广单数
##干预单数
##自然单数
#总共销售额
##自然销售额
##推广销售额
##干预销售额
##推广费用
*/
//把大数组放入小数组并且去重，方便后边计算
var all_date_by_chanpinid = [];
var flow_data =[];//这个是流量的数据合集
//用于专门的对象数组去重的函数根据日期去重。也不知道去除的是哪一个去他妈的
function find_same_data_by_date(data_list){
  for(i = 0;i<data_list.length;i++){
    for(j = i+1;j<data_list.length;j++){
      if(data_list[i].riqi == data_list[j].riqi){
        data_list.splice(j,1);
       j--;
      }
    }
   }
   return data_list;
}
//这个是数据的缩减
for(i = 0; i < all_weak_date.length; i++){ 
  if(Number(all_weak_date[i].chanpinid) == chanpin_id){
    console.log("我是I的值"+i)
    all_date_by_chanpinid.push(all_weak_date[i]); 
  }
}
//开始执行数据去重
all_date_by_chanpinid = find_same_data_by_date(all_date_by_chanpinid);

//生成流量部分需要的json格式文件
for (i=0;i<all_date_by_chanpinid.length;i++){
  var jsonObj = [{"date": (all_date_by_chanpinid[i].riqi).substr(-5),"type":"总访客","value":Number(all_date_by_chanpinid[i].zongfangkeshuheji)},{"date": (all_date_by_chanpinid[i].riqi).substr(-5),"type":"自然访客","value":Number(all_date_by_chanpinid[i].ziranfangkeshu)},{"date": (all_date_by_chanpinid[i].riqi).substr(-5),"type":"推广访客","value":Number(all_date_by_chanpinid[i].tuiguangfangkeshu)},{"date": (all_date_by_chanpinid[i].riqi).substr(-5),"type":"干预访客","value":Number(all_date_by_chanpinid[i].tfangkeshu)}]
  flow_data = jsonObj.concat(flow_data)
}
//制作访客图标
make_flow_img_for_page(flow_data);

}

//生成流量访客的方法
function make_flow_img_for_page(flow_data){
  $("#weak_data").append('<h3>下边是最近一周的流量数据</h3>');
  $("#weak_data").append('<canvas id="flow_chart_id" style="width: 100%;" height="300"></canvas>');
  //创建图标对象
  const flow_chart = new F2.Chart({
    id: 'flow_chart_id',
    pixelRatio: window.devicePixelRatio // 指定分辨率
  });
  //载入数据源
  flow_chart.source(flow_data);

  flow_chart.line().position('date*value').color('type');

  flow_chart.render();
}

//生成销量数据的方法
function make_sell_img_for_page(sell_data){
  $("#weak_data").append('<h3>下边是最近一周的销量数据</h3>');
  $("#weak_data").append('<canvas id="sell_chart_id" style="width: 100%;" height="300"></canvas>');
  //创建图标对象
  const flow_chart = new F2.Chart({
    id: 'sell_chart_id',
    pixelRatio: window.devicePixelRatio // 指定分辨率
  });
  //载入数据源
  flow_chart.source(sell_data);

  flow_chart.interval().position('月份*月均降雨量').color('name').adjust('stack');

  flow_chart.render();
}

//页面遮罩层的开关
function make_black_page(off_on){
  if(off_on){
    $(".weui-tab").append("<div class='weui-mask'></div>");
  }else{
    $(".weui-mask").remove();
  }

  //
  //top: 50%;
  //position: fixed;
  //z-index: 1001;
  //
}







/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~我是华丽的分割线~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  
man
*/

//这个主要是获取页面载入就要执行的
//底部选项卡的监听
$(function () {
  //获取昨天和前天的数据
  yestdayAllData = (get_data_by_date(yestday)).entry;
  beforeYestdayAllData = (get_data_by_date(beforeYestay)).entry;
  //获取一周的数据
  get_data_weak(yestday);
  //选项卡被点击之后的样式更新
  $('.weui-navbar__item').on('click', function () {
    $(this).addClass('weui-bar__item_on').siblings('.weui-bar__item_on').removeClass('weui-bar__item_on');
    //被点击之后删除中心内容
    $(".weui-tab__panel").empty()
  });
  //当点击个人选项
  $('#personData').on('click', function () {
    weui.picker(make_list_to_select(), {
      onChange: function (result) {
      },
      onConfirm: function (result) {
        makeDataToPage(result);
        make_date_img_to_page(result);
      },
      title:'选择要查看的产品'
    });

    $(".weui-tab__panel").empty();
    $(".weui-tab__panel").append('<div class="weui-half-screen-dialog weui-picker weui-animate-slide-up" id="androidActionsheet" style="display: none"><div class="weui-actionsheet"><div id="selectNameList" class="weui-actionsheet__menu"></div></div></div>');
    $(".weui-tab__panel").append('<div class="page__hd" id="DataTitle"></div>');
    $(".weui-tab__panel").append('<div class="page__bd page__bd_spacing" id="weak_data"></div>');
    $(".weui-tab__panel").append('<div class="page__bd page__bd_spacing" id="DataContent"></div>');
    
    //添加流量模块
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
    $(".weui-tab__panel").append('<div class="page__hd"><h1 class="page__title">昨日销售总额：</h1><p class="page__desc">数据为已经统计的数据之和</p></div>');
  });

});