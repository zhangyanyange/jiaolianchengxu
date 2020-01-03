let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: "",
    course: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.token = wx.getStorageSync('token');
    let that = this;
    this.data.id = options.id;
    wx.request({
      url: `${app.globalData.baseUrl}api/curriculum-plan/common/personal-subscribe/get/${options.id}`,
      method: "GET",
      header: {
        Authorization: `Bearer ${that.data.token}`
      },
      success(res) {
        console.log(res);
        if (res.data.code === "200") {
          let currentTime = res.data.data.startSchooltime.substr(0, 10);
          let reservationStartTime = res.data.data.startSchooltime.substr(11, 5);
          let reservationEndTime = res.data.data.endSchooltime.substr(11, 5);
          console.log(res);
          if (res.data.data.classroomName === null) {
            res.data.data.classroomName = "无";
          }

          that.setData({
            curriculumPlanId: res.data.data.id,
            course: res.data.data,
            currentTime: currentTime,
            reservationStartTime: reservationStartTime,
            reservationEndTime: `---${reservationEndTime}`,
            classRoomName: res.data.data.classroomName
          })

        } else {
          wx.showToast({
            title: res.data.message,
            icon: "none"
          })
        }
      },
      fail(error) {
        wx.showToast({
          title: JSON.stringify(error),
          icon: "none"
        })
      }
    })
  },
  //取消约课
  cancelAppointment(res) {
    let that = this;
    wx.showLoading({
      title: '取消中',
      mask: true
    })

    wx.request({
      url: `${app.globalData.baseUrl}api/curriculum-plan/coach/cancel-plan/${this.data.curriculumPlanId}`,
      method: "POST",
      header: {
        'Authorization': `Bearer ${that.data.token}`
      },
      success(res) {
        console.log(res);
        wx.hideLoading();
        if (res.data.code === "200") {
          wx.showToast({
            title: '取消成功',
            icon: "none"
          })
          wx.navigateBack({
            delta: 1
          })
        }
      },
      fail(error) {
        wx.hideLoading();
        wx.showToast({
          title: JSON.stringify(error),
          icon: "none"
        })
      }
    })
  },
})