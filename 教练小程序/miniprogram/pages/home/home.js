let app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    calendarConfig: {
      multi: false,
      isWeek: false,
      disablePastDay: true
    }, 
  },

  //选择日期
  afterTapDay(e) {
    let time = e.detail.year + "-" + e.detail.month + "-" + e.detail.day;
    wx.navigateTo({
      url: `../courseSchedule/courseSchedule?time=${time}`,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

})