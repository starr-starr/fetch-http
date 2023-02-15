/*
    简单的fetch封装
    http([config])
     + url 请求地址
     + method 请求方式 *get/post/delete/put/patch
     + credentials 携带凭证   *include/same-origin/omit
     + headers 自定义请求头  （格式为对象）
     + body 请求体信息 （post）
     + params 设定？传参信息 （格式为对象）
     + responceType 返回结果的读取方式 *json/text/arrayBuffer/blob
     + singal 中断请求的信号
 */
import isPlainObj from "./isPlainObj";
import qs from 'qs'

/*
let obj= {
    user:'wdx',
    pwd:'123',
    appToken:'7d22e38e-5717-11e7-907b-a6006ad3dba0'
}
qs.stringify(obj)
console.log(qs.stringify(obj))
                        'user=wdx&pwd=123&appToken=7d22e38e-5717-11e7-907b-a6006ad3dba0'
*/



//  核心方法
const baseUrl = ''
const http = function http(config){
    let { url,method,credentials,headers,body,params,responceType,signal} = config

    !isPlainObj(config) ? config = {} :

        //  处理默认情况
        config = Object.assign({
            //  默认配置项
            url : '',
            method : 'get',
            credentials : 'include',
            headers : null,
            body : null,
            params : null,
            responseType : 'json',
            signal : null
        },config)
            //  类型校验
            if (!url) throw new TypeError('url must be required')
            if (!isPlainObj(headers)) headers = {}
            if ( !params && !isPlainObj(params)) params = null

        //  处理问号传参
        url = baseUrl +     url
        if (params) {
            url += `${url.includes('?')} ? '&' : '?'}${qs.stringify(params)}`
        }
        //  处理body
        if (isPlainObj(body)) {
            //  body = qs.stringify(body)
            headers['Content-Type'] = 'application/json'
        }
        // 请求拦截器(请求相同的内容)  - eg:token
        let token = localStorage.getItem('token')
        if (token) {
            headers['authorization'] = token
        }

        //  发送请求
        config = {
            method,
            credentials,
            headers,
            cache : 'no-cache',
            signal
        }
        if(/^(post|put|patch)$/i.test(method) && body){
            config.body = body
        }
        return fetch(url,config)
                    .then(res=>{
                        let { status,statusText }=res
                        if (/^(2|3)\d{2}$/.test(status)){
                            return responceType ? `res.${responceType}()` : res.json()
                        }
                        return Promise.reject({
                            code : 0,
                            status,
                            statusText
                        })
                    })
                    .catch(reason => {
                        if( reason && !isPlainObj(reason)) {
                            let { code,status } = reason
                            if (code = 0){
                                switch (+status){
                                    case 400 : console.log('请求参数出现问题');
                                               break
                                }
                            }else if (code = 20){
                                console.log('请求被中断')
                            }
                        }
                        //  统一提示
                        console.log('出错了！')
                        return Promise.reject(reason)
                    })
}

//  快捷方法
['get','head','delete','options'].forEach( item => {
    http[item] = function (url,config){
        !isPlainObj(config) ? config = {} :
            config['url'] = url
            config['method'] =item
            return http(config)
    }
})

['post','put','patch'].forEach( item => {
    http[item] = function (url,body,config){
        !isPlainObj(config) ? config = {} :
            config['url'] = url
            config['method'] =item
            config['body'] = body
            return http(config)
    }
})

export default http
