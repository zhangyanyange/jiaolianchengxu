module.exports.getJSON = getJSON;
 function getJSON(url, method, data,header) {
   if(header===""){
     let promise = new Promise(function (resolve, reject) {
       //网络请求
       wx.request({
         url: url,
         method: method,
         data: data,
         success(res) {
      
           if (res.statusCode === 200) {
             resolve(res);
           } else {
             reject(res);
           }
         },
         fail(error) {
           reject(error);
         }
       })
     });
     return promise;
   }else{
     let promise = new Promise(function (resolve, reject) {
       //网络请求
       wx.request({
         url: url,
         method: method,
         data: data,
         header: {
           'Authorization': `Bearer ${header}`
         },
         success(res) {
           if (res.statusCode === 200) {
             resolve(res);
           } else {
             reject(res);
           }
         },
         fail(error) {
           reject(error);
         }
       })
     });
     return promise;
   }
  
}