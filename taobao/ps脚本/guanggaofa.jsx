﻿//再每次保存的时候执行如下方法

//极限词  绝对化用词
var no_word = ["绝对","最舒适","最真实","最流行","最贴心","极佳","最美","最火","最前沿","独一无二","最合适","最实用","最值得","必备","前所未有","最in","最高性价比","最满意","最全面","最优","第一选择","全能冠军","完美","无语伦比","销量最大","最超值","最环保","最具保暖性","最具人气","最美味","最前端","最实在","最贴身","最突出","最用心","最优秀"];

//绝对化的词
var no_word2 = ["最新","最先进","最高","最低","最具","最便宜","最新技术","最佳","最大","最好","最时尚","最受欢迎","最轻便","最逼真","最牛","最优","最热卖","最热销","最强","最有效","最实惠","最专业","最火","最安全","最新鲜","最新发明","最新科学","最新技术","最萌","世界之最","最牢固","最超值","最伟大","最健康","第一","第1","唯一","唯1","首选","顶级","国家级产品","填补国内空白","顶尖","空前绝后","巅峰","顶峰","抄底","极品","全网销量第一","王牌","销量冠军","NO1","Top1","极致","永久","领袖品牌","独一无二","绝无仅有","史无前例","万能","绝对","领导品牌","大品牌之一","100%回头客","100%瘦身","国际品质","国家级","世界级","极品","全国首家","世界领先","驰名商标","中国名牌","CCTV","央视品牌","秒杀全网","淘宝之冠","淘宝之王","前所未有","top品牌","无法超越","独有","国际一流","顶级","史无前例","首个","首家","金牌","独家","全球首发","全网首发","领先","最先","著名商标"];

//医疗用语
var no_word3 = ["增强免疫力","辅助降血脂","辅助降血糖","抗氧化","辅助改善记忆","缓解视疲劳","促进排铅","清咽","辅助降血压","改善睡眠","促进泌乳","缓解体力疲劳","提高缺氧耐受力","对辐射危害有辅助保护功能；","减肥","改善生长发育","增加骨密度","改善营养性贫血","对化学性肝损伤的辅助保护作用","祛痤疮","祛黄褐斑","改善皮肤水份","改善皮肤油份","调节肠道菌群","促进消化","通便","对胃粘膜损伤有辅助保护功能"];

//返回文字
function scanLayerSets(el){

    var mystr="";
        //检测美术文本
       for(var a=0; a<el.layerSets.length;a++){
           var ly=el.layerSets[a].typename;
           if(ly=="LayerSet"){                
               mystr+=scanLayerSets(el.layerSets[a]);
               }
           }
        //检测文字图层
       for(var j=0;j<el.artLayers.length;j++){
           var lk=el.artLayers[j].kind;
           if(lk=="LayerKind.TEXT"){
                   mystr+=el.artLayers[j].textItem.contents;
                   }
           }
       //alert(mystr)
       return mystr;
    }

//主方法
function main(){
    if(!documents.length) return;//查不到东西就返回
    var doc=activeDocument;    //获取对象
    var text = scanLayerSets(doc).replace(/[\r\n]/g,""); //获取文本内容 并且去掉空格和回车避免检测不到
    var inf1 = "极限词："//极限词
    var inf2 = "绝对化词："//绝对化词
    var inf3 = "医疗用语："//医疗用语
    for(var a =0;a<no_word.length;a++){
        if(text.indexOf(no_word[a]) != -1){
            inf1 += no_word[a] + ","
        }
    }
    for(var b =0;b<no_word2.length;b++){
        if(text.indexOf(no_word2[b]) != -1){
            inf2 += no_word2[b] + ","
        }
    }
    for(var c =0;c<no_word3.length;c++){
        if(text.indexOf(no_word3[c]) != -1){
            inf3 = no_word3[c] + ","
        }
    }
    if(inf1!="极限词：" || inf2!="绝对化词：" || inf3!="医疗用语："){
        alert("企业店铺不能用极限词, 个人店铺使用要谨慎小心\n\t当下出现\t\n"+inf1+"\n"+inf2+"\n"+inf3+"\n")
    }

}


//执行主方法
main();