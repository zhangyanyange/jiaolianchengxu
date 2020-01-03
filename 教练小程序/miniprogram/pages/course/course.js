// miniprogram/pages/course/course.js
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageSize: 15,
    pageIndex: 1,
    pageMax: 0,
    token:"",
    all_courses:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
  
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    let that = this;
    this.data.pageIndex = this.data.pageIndex + 1;
    if (this.data.pageIndex > this.data.pageMax) {
      return
    }
    wx.showLoading({
      title: '加载中',
      icon:"none"
    })
    that.getList();
  },
  getList(){
    let that=this;
    wx.request({
      url: `${app.globalData.baseUrl}api/curriculum-plan/coach/get-seatReserve-list`,
      method: "GET",
      header: {
        Authorization: `Bearer ${that.data.token}`
      },
      data: {
        PageIndex: that.data.pageIndex,
        PageSize: that.data.pageSize
      },
      success(res) {
        wx.hideLoading();
        for (let item of res.data.items){
          item.date=item.date.substr(0,10);
          for(let item1 of item.list){
            item1.startSchooltime= item1.startSchooltime.substr(11,5);
            item1.endSchooltime=item1.endSchooltime.substr(11, 5);
          }
        }
        if(that.data.pageIndex===1){//等于1
          that.data.pageMax = Math.ceil(res.data.totalCount / that.data.pageSize);
          that.setData({
            all_courses:res.data.items
          })
        }else{//不等于1
        let courses=that.data.all_courses.concat(res.data.items);
          that.setData({
            all_courses: courses
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
  //去course详情
  gotoDetail(event){
    let courses=[];
    for (let item of this.data.all_courses){
          for(let item1 of item.list){
              item1.date=item.date
              courses.push(item1);
          }
    }
    let course=courses.find(item=>{
      return item.id==event.currentTarget.id;
    })
    wx.navigateTo({
      url: `../coursedetail/coursedetail?id=${event.currentTarget.id}&course=${JSON.stringify(course)}`
    })
  }
})