# 表单验证器

### 文件介绍

| 文件 | 说明 | 类别 | 
| --- | --- | --- |
| ./src/js/form.js | 表单验证类 | 核心 | 
| ./src/js/validate.js | 验证器 | 核心 |
| ./src/js/formSwitch.js | 实现表单Switch组件 | 演示 |
| ./src/js/message.js | 消息弹窗 | 演示 |
| ./src/css/from.css | 表单样式 | 演示 |
| ./src/css/message.css | 消息弹窗样式 | 演示 |


### 开始
```text

npm run install 安装

npm run build 生产环境打包，对应目录 ./dist

npm run dev   开发环境，对应目录 ./dev

npm run example 生成示例文件
```


### 验证规则
| 名称 | 说明 | 别名 | 示例 |
| ----- | ----- | ----- | ----- |
| require | 必须 | | require |
| has | 存在 | | has |
| accepted | 接受 | | accepted |
| boolean | 是否为布尔 | bool | boolean |
| number | 是否为数字 | | number |
| alphaNum | 是否为字母和数字 | | alphaNum |
| alpha | 是否为纯字母 | | alpha |
| chs | 是否为纯汉字 | | chs |
| chsAlpha | 是否为汉字或字母或汉字 + 字母 | | chsAlpha |
| chsAlphaNum | 是否为汉字或字母或数字或汉字 + 字母 + 数字 | | chsAlphaNum |
| array | 是否为数组 | | array |
| object | 是否为对象 | | object |
| function | 是否为函数 | func | function |
| int | 是否为整型 | | int |
| float | 是否为浮点型 | | float |
| >= | 大于等于 | egt | egt:15 |
| <= | 小于等于 | lte | lte:20 |
| = | 等于 | eq | eq:3 |
| < | 小于 | lt | lt:6 |
| \> | 大于 | gt | gt:66 |
| != | 不等于 | unequal，<> | unequal: 10 |
| in | 在某个范围 | | in:1,2,3 |
| notIn | 不在某个范围 | | notIn:a,b,c |
| length | 长度是否在某个范围 | | length:1,50 或 length:5 |
| max | 最大值 | | max:5 |
| min | 最小值 | | min:1 |
| email | 邮箱 | | email | 
| mobile | 手机号 | | mobile | 
| ipv4 | ipv4 | | ipv4 | 
| ipv6 | ipv6 | | ipv6 | 
| ip | ipv4 或 ipv6 | | ip |
| between | 范围/区间 | | between:10,500 |  



