# dcmall 答橙礼品商城
## 2018-11-28
### 真机调试时可能会漏传某些必要文件
~~如果需要在真机调试时就把所有文件都上传的话, 就需要在app.json里的usingComponents字段里添加相关的组件信息~~  
之前忽略组件的文件是因为代码有错误, 主要集中在引用组件和组件内部逻辑;  
代码如果没问题, 在页面的配置文件中使用usingComponents字段就可以正常引用组件
***
### Page里不强制需要methods字段
页面上需要的方法可一直接定义,但是Component里需要methods
***
### app.json里page的配置真扯蛋
路径配置竟然不能默认找index.js文件, 还必须写出index, 那我起个index的文件名搞毛啊?!  
我还把同一页面上的相关文件放在页面名名称的目录里搞毛啊?!
***
### 子组件向上传递数据
非函数类型的属性在模板里用小写和连字符的形式命名,函数类型的属性需要使用bind[:]前缀, 属性值是String, handler的名称
```
// page.wxml, 引用组件
<my-component bind:myEvent="enventHandler">
<my-component bindmyEvent="enventHandler">

```
```
// page.js 定义handler
Page({
  enventHandler(event){
    // event.detail就是组件传过来的数据
    // event.detail => { value: 'send data to parents' }
  }
})
```
```
// component.js 组件的model层  
// view层就不写了, 在view层需要触发trigger方法
Component({
  methods: {
    trigger(){
      this.triggerEvent('myEvent', {
        value: 'send data to parents'
      })
    }
  }
})
/* this.triggerEvent的第三个参数是个object类型的值, 是触发事件的选项, 主要设置是否冒泡和捕获,以及触发边际,值类型都是boolean, 默认值都是false, 一般不用设置 */
```

### 路由传参
貌似只能通过queryString, 文档并没有提及动态路由
```
// 触发跳转的页面, 使用wx.navigateTo等等路由方法
wx.navigateTo({url: `/pages/....?foo=${bar}`})
```
```
// 目标页面的model层, 通过onLoad回调的参数获得queryString
Page({
  ...
  onLoad(options){
    // options.foo
  }
  ...
})
```
## 2018-11-30
将项目迁移进dacheng-mall的组织
## 2018-12-01
今天在早上起床之前思考了下cms部分的实现;   
* 资源管理模块: 用来管理图片,视频资源,准备使用七牛的服务;  
* 商品管理: 商品也是资源,分两种类型:
  1. 厂商提供的;
  2. 平台在润色的;  
    这种是平台以厂商提供的商品为基础,并增加平台相关服务以及价格调整的商品,关联源商品,机构看到的是这种商品
* 元素组管理: 用来整合图片,视频,图文(伪富文本,支持简单排版)形成资源组,目前确定要做的是滚动图组和商品列表图组;  
* 页面管理: 用来整合元素组,以元素组id组成的数组来存储数据;  
* 商品详情内容管理: 商品详情也属于页面,主要有滚动图组和图文元素组成;  
* "含票,送货上门,破损包换"作为常态属性存在,中台维护时作为固定属性调整boolean值, 其他为自定义属性, 但是再商品数据结构中都作为attributes字段值的元素出现,上述三个常态属性放在前三个  

以上讨论大部分是关于终端工程的需求,暂且在这里记录下
## 2018-12-02
在wxml里非事件监听的时候如何使用model里的方法呢??  
***
<font color=#f66 size=6 face="黑体">下午, 果果帮我开箱出了Spike!!!!</font>  
我不久前开出了<font color=#f00 size=3 face="黑体">Mortis</font>, 和前几天用170个gem换了<font color=#93e size=3 face="黑体">Frank</font>, 现在就差<font color=#f00 size=3 face="黑体">Tara</font>就全收集了!!
## 2018-12-03
昨天的问题不搞了,还是采用Component的形式来写商品展示的图文部分,  
计划图文部分有3种类型: 文字(text), 图片(image), 表格(table);  
内容部分使用数组存储数据, 每个元素上有type字段, 每个type对应一个子组件;  
图文部分作为容器组件存在, 接收内容部分数据, 再循环数据时, 按type渲染相应的子组件.  
***
下午添加iconfont,真机测试的时候貌似只用其中svg的部分,ttf好像没啥用
***
video组件不能再swiper中使用, 开发工具里正常, 上真机就瞎了, 官方文档上也确认了这个bug, 需要换个方式将video放入页面中;  
## 2018-12-03
video组件的src和poster如果使用本地资源只能在开发工具上运行, 真机上必须使用在线资源;
cover-view需要被嵌套进video(等其他原生组件)时才会起作用;  
cover-view中也只能嵌入其他原生组件;
## 2018-12-05
在Component中使用 wx.createVideoContext("video-id", context) 第二个参数(context)需要指向当前组件的上下文(this);  
在lifetimes.ready(生命周期)中可以获得当前组件的properties;
## 2018-12-06
wx.getSystemInfoSync()返回的windowHeight和screenHeight不能乱用;  
window是页面内容区域, screen是屏幕区域(包含顶部导航栏)
## 2018-12-07
我去,{{}}双花括号中间不能插入函数执行表达式,还能不能愉快coding了???model层也没有computed属性,哎~  
开发工具不能监控Component的内部状态变更??我没找到地方?只有Page的,我去年买了个表!
## 2018-12-10
经过周末的思考,关于列表数据的渲染需要调整,从server获取列表数据后,根据用户的收藏状态表处理数据,再交给模板渲染,而不是让每个商品元素都去读取用户收藏状态;  
用户更新收藏状态后根据出发事件的currentTarget单独维护一个元素的收藏状态和全局的收藏状态表;  
### 有趣的问题:
在Component中的properties里会有个observer函数, 用来监听某个属性值变更, 如果在这个函数里重设其对应的属性值, 就会形成循环调用, 而且不抛异常;  
难道有这种应用场景? 为啥允许properties被变更呢?  
在react里prop是不允许在组件内部被变更的,这种规则还是很有建设性的!

## 2018-12-15
cover-view组件的padding会忽略背景色的样式!!!