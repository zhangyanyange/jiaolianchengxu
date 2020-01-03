//index.js
const app = getApp()
let value = 60;
Page({
  data: {
    phoneNumber: "",
    phoneCode: "",
    isGetCode: false,
    codeTest: "获取验证码",
    openid: ""
  },

  onLoad: function() {
    if(wx.getStorageSync('isLogin')){
      wx.redirectTo({
        url: '../home/home'
      })
      return
    }


    this.onGetOpenid();
  },
  onGetOpenid: function() {
    let that = this;
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        that.data.openid = res.result.openid
        wx.setStorageSync('openid', res.result.openid);
      
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },
  //登录
  login() {
    let that = this;
    if (this.data.phoneCode === "") {
      wx.showToast({
        title: '验证码不能为空',
        icon: "none"
      })
      return
    }
    wx.showLoading({
      title: '对比中',
      mask: true
    })
    wx.request({
      url: `${app.globalData.baseUrl}api/user/coach/attestation`,
      method: "POST",
      data: {
        "phoneCode": that.data.phoneNumber,
        "smsCode": that.data.phoneCode,
        "openId": that.data.openid,
        "userName": "随便给一个"
      },
      success(res) {
        wx.hideLoading();
        if (res.data.code === "200") {
          wx.showToast({
            title: '登陆成功',
            icon:"none"
          })
          wx.setStorageSync('isLogin', true);
          wx.redirectTo({
            url: '../home/home'
          })
        } else {
          wx.showToast({
            title: res.data.message,
            icon: "none"
          })
        }
      },
      fail(error) {
        wx.hideLoading();
        wx.showToast({
          title: JSON.stringify(error),
        })
      }
    })

  },
  //获取手机号
  phoneChange(event) {
    this.data.phoneNumber = event.detail.detail.value;
  },
  //获取验证码
  codeChange(event) {
    this.data.phoneCode = event.detail.detail.value;
  },
  //点击获取验证码
  clickGetCode() {
    if (this.data.phoneNumber === "") {
      wx.showToast({
        title: '手机号不能为空',
        icon: "none"
      })
      return
    }
    let that = this;
    wx.showLoading({
      title: '获取验证码',
      mask: true
    })
    wx.request({
      url: `${app.globalData.baseUrl}api/sms/coach/code`,
      method: "GET",
      data: {
        phoneCode: that.data.phoneNumber
      },
      success(res) {
        wx.hideLoading();
        if (res.data.code === "200") {
          if (value !== 60) {
            return;
          }

          let timer = setInterval(() => {
            value--;
            if (value !== 0) { //未到0s
              that.setData({
                codeTest: `剩余${value}秒`,
                isGetCode: true
              });
            } else {
              that.setData({
                codeTest: `获取验证码`,
                isGetCode: true
              });
              value = 60;
              clearInterval(timer);
            }
          }, 1000);
        } else {
          wx.showToast({
            title: res.data.message,
            icon: "none"
          })
        }
      },
      fail(error) {
        wx.hideLoading();
        wx.showToast({
          title: JSON.stringify(error),
        })
      }
    })
  }
})