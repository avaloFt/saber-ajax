# saber-ajax

适用于移动端、promise风格的ajax封装，支持[XMLHttpRequest2](http://www.w3.org/TR/XMLHttpRequest2/)

<del>以<a href="http://baike.baidu.com/view/8420590.htm" target="_blank">吾王</a>之名~</del>

## Usage

    var request = ajax.get(url);
    request.then(
        // 请求请求完成
        // data为responseText
        function (data) {
            renderData(data);
        },

        // 请求失败
        // error参数可能为以下三种情况
        // * 请求超时: 'timeout'
        // * 请求中止: 'abort'
        // * 其它情况: HTTP Status Code
        function (error) {
            showError(error);
        }
    );

## API

### get(url)

发起异步GET请求，返回`Request`对象

### post(url, data)

发起异步POST请求，返回`Request`对象

`data` 请求的参数，可以为以下类型：

* `string` 不会对参数进行任何处理，需要注意自行进行`encodeURIComponent`处理
* `Object` 会自动进行URL参数序列化并对各`value`进行`encodeURIComponent`处理，**注意** 暂时只支持单一层级序列化，不支持多层级，比如`{date: {begin: '2012', end: '2013'}}`


### request(url, options)

发起请求，`options`配置项参数为可选

* `options.method` `string` 请求方式，默认为`'GET'`
* `options.data` `string|Object` 请求参数
* `options.stringify` `boolean` 是否自动序列化请求参数，默认为`true`
* `options.async` `boolean` 是否异步请求，默认为`true`
* `options.headers` `Object` 需要额外设置的请求头
* `options.timeout` `number` 请求超时时间，单位ms，只有异步请求才有效
* `options.username` `string` 用户名
* `options.password` `string` 密码
* `options.responseType` `string` 返回的数据类型：`arraybuffer`、`blob`或者`document`

### Request

`ajax.get`，`ajax.post`，`ajax.request`的返回参数，实现了[Promise](https://github.com/ecomfe/saber-promise)接口

#### Request.then

请参考[Promise.then](https://github.com/ecomfe/saber-promise)

`onReject`回调函数的第一个参数有三种取值：

* `'timeout'`: `string` 请求超时
* `'abort'`: `string` 请求中止
* `HTTP Status Code`: `number` 其它情况为响应请求的HTTP状态码

#### Request.abort

中止请求，会触发`onReject`回调，并且第一个参数为`'abort'`
