// miniprogram/pages/coursedetail/coursedetail.js
let app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
  item:{},
    course_detail:[],
    classroomName:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
    let course=JSON.parse(options.course);
   
    course.date=course.beginTime.substr(0,10);
    course.startSchooltime = course.beginTime.substr(11,5);
    course.endSchooltime = course.cutOffTime.substr(11, 5);
    if (!course.classroomName){
      course.classroomName="无"
    }
 
    wx.setNavigationBarTitle({
      title: course.productName
    })
    this.setData({
      item:course
    })
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
        for(let item of res.data.list){
          item.subscribeTime=item.subscribeTime.substr(0,10);
        }
        that.setData({
          course_detail:res.data.list,
          classroomName:res.data.classroomName
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