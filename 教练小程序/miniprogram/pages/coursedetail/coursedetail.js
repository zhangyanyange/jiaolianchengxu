// miniprogram/pages/coursedetail/coursedetail.js
let app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    course_detail:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    let that=this;
    wx.showLoading({
      title: '获取详情',
      icon:"none"
    })
    let token=wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.baseUrl}api/curriculum-plan/coach/get-seatReserve-list/${options.id}`,
      method:"GET",
      header: {
        Authorization: `Bearer ${token}`
      },
      success(res){
        wx.hideLoading();
        console.log(res);
        for(let item of res.data){
          item.subscribeTime=item.subscribeTime.substr(0,10);
        }

        that.setData({
          course_detail:res.data
        })
      
      },
      fail(error){
        wx.hideLoading();
      wx.showToast({
        title: JSON.stringify(error),
        icon:"none"
      })
      }
    })
  }
})