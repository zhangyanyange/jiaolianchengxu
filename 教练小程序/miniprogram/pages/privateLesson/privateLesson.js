let app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    course: {},
    select: true,
    locationID: "",
    times: [],
    token: "",
    time: "",
    calendarConfig: {
      multi: false,
      isWeek: false,
      disablePastDay: true,
    },
    visible: 'novisible',
    showTimes: false,
    showRooms:false,
    timeType: [],
    token:"",
    classRoomName:"",
    classRoomType:false,
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.data.token=wx.getStorageSync('token');
      let that=this;
      wx.request({
        url: `${app.globalData.baseUrl}api/curriculum-plan/common/personal-subscribe/get/${options.id}`,
        method:"GET",
        header: {
          Authorization: `Bearer ${that.data.token}`
        },
        success(res){
        if(res.data.code==="200"){
          that.getClassRoomList(res.data.data.shopId, res.data.data.startSchooltime,false);
       
          let currentTime=res.data.data.startSchooltime.substr(0, 10);
          let reservationStartTime=res.data.data.startSchooltime.substr(11,5);
          let reservationEndTime = res.data.data.endSchooltime.substr(11,5);
          if (res.data.data.classroomName===null){
            res.data.data.classroomName="无";
          }
      
          that.setData({
            curriculumPlanId:res.data.data.id,
            course:res.data.data,
            currentTime:currentTime,
            reservationStartTime: reservationStartTime,
            reservationEndTime: `---${reservationEndTime}` ,
            classRoomName: res.data.data.classroomName
          })
          that.getPeriod(res.data.data.shopId, currentTime,false);
          that.getLocation();

        }else{
          wx.showToast({
            title: res.data.message,
            icon:"none"
          })
        }
        },
        fail(error){
            wx.showToast({
              title: JSON.stringify(error),
              icon:"none"
            })
        }
      })

  },
  locationSelect(e) {
    if (e.currentTarget.id === this.data.locationID) {//选择位置未变
      return;
    }
    this.setData({
      locationID: e.currentTarget.id
    });
    this.getPeriod(this.data.locationID, this.data.currentTime,true);
  },
  //获取门店
  getLocation(){
    let that=this;
    wx.showLoading({
      title: '获取门店',
      icon: "none"
    })

    wx.request({
      url: `${app.globalData.baseUrl}api/shop/all`,
      method: "GET",
      success(res) {
        wx.hideLoading();
        res.data[1].width = '20rpx';
        let location = res.data.find(item => {
          return item.name === that.data.course.shopName;
        })
        that.setData({
          location: res.data,
          locationID: location.id
        });
      

      },
      fail(error) {
        wx.hideLoading();
      }
    })
  },
  //获取可用时间段
  getPeriod(locationID, time,isChange) {
    let that = this;
    wx.showLoading({
      title: '获取教练可用时间',
      icon: "none"
    })
    wx.request({
      url: `${app.globalData.baseUrl}api/curriculum-plan/coach/available-time`,
      methis: "GET",
      header: {
        'Authorization': `Bearer ${that.data.token}`
      },
      data: {
        time: time,
        shopId: locationID
      },
      success(res) {
        wx.hideLoading();
        if (res.data.length===0){ //无可用时间，将教室变成无，数组为空。
          that.setData({
            reservationStartTime:"暂无可用时间",
            classRoomName: "无",
            reservationEndTime: "",
            timeType:[],
            classRoomName:[]
          })
          return;
        }
        
        if(isChange){
            that.setData({             
              reservationStartTime: res.data[0]
            })       
          that.timeReservation(`${that.data.currentTime} ${res.data[0]}`);
        }  
        that.data.timeType=[];
        for (let item of res.data) {
          that.data.timeType.push({
            name: item
          })
        }
        that.setData({
          timeType: that.data.timeType
        })
        let timeClassroom=time+" "+res.data[0];
       if(isChange){
         that.getClassRoomList(that.data.locationID, timeClassroom, true);
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
  //选择日期
  afterTapDay(e) {
    let time= e.detail.year + "-" + e.detail.month + "-" + e.detail.day;
    if(time===this.data.currentTime){
      this.setData({
        visible: "novisible"
      })
      return
    }
    this.setData({
      currentTime: time,
      visible: "novisible"
    })
    this.getPeriod(this.data.locationID, this.data.currentTime,true);
  },
  //开始时间转化为结束时间
  timeReservation(time) {
    time = time.replace(/-/g, '/');
    let appointment = new Date(time).getTime();
    let addTime = 45 * 60 * 1000;
    let endTimeAppointment = appointment + addTime;
    var endTime = new Date(endTimeAppointment);
    let hour = endTime.getHours();
    let minutes = endTime.getMinutes();
    if (minutes === 0) {
      minutes = '00';
    }
    this.setData({
      reservationEndTime: `---${hour}:${minutes}`
    })
  },
  //更换日期
  changeTime() {
    this.setData({
      visible: 'visible'
    })
  },
  //关闭日期
  close(event) {
    this.setData({
      visible: 'novisible'
    })
  },
  //使用时间
  useTime(e) {
    this.setData({
      reservationStartTime: this.data.timeType[e.detail.index].name,
      showTimes: false
    })
    this.timeReservation(`${this.data.currentTime} ${this.data.reservationStartTime}`);
    this.getClassRoomList(this.data.locationID, this.data.currentTime+" "+this.data.reservationStartTime, true);
  },
  //使用教室
  useRoom(e){
    this.setData({
      classRoomName: this.data.classRoomType[e.detail.index].name,
      showRooms: false,
      classroomId:this.data.classRoomType[e.detail.index].id
    })
  },
  //显示时间
  showTime() {
    if (this.data.timeType.length === 0) {
      wx.showToast({
        title: '无可用时间!',
        icon: "none"
      })
      return;
    }
    this.setData({
      showTimes: true
    })
  },
  //关闭时间
  closeModal() {
    this.setData({
      showTimes: false,
      showRooms: false
    })
  },
  //显示ClassRoom
  showClassRoom(){
    if (this.data.classRoomType.length === 0) {
      wx.showToast({
        title: '没有可用教室!',
        icon: "none"
      })
      return;
    }
    this.setData({
      showRooms:true
    })
  },
  //获取上课教室列表
  getClassRoomList(shopId,time,isChange){
    let that=this;
    wx.showLoading({
      title: '获取教室列表',
      icon:"none"
    })
    wx.request({
      url: `${app.globalData.baseUrl}api/curriculum-plan/coach/available-classroom/for-time`,
      method:"GET",
      header: {
        'Authorization': `Bearer ${that.data.token}`
      },
      data:{
        shopId: shopId,
        time:time
      },
      success(res){
        wx.hideLoading();
        if (isChange){
          if(res.data.data.length===0){
            that.setData({
              classRoomName:"无",
            })
          }else{
            that.setData({
              classRoomName: res.data.data[0].name,
              classroomId:res.data.data[0].id
            })
          }
        }
        that.setData({
          classRoomType:res.data.data
        })    
      },
      fail(error){
      
      }
    })
  },
  //取消约课
  cancelAppointment(res){
    let that=this;
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
  //确认约课
  confirmAppointment(res){
    if (this.data.reservationStartTime ==='无可用时间!'){
      wx.showToast({
        title: '请选择有效时间在做提交',
        icon: "none"
      })
      return;
    }

    if (this.data.classRoomName==="无"){
      wx.showToast({
        title: '请选择教室信息,再做提交',
        icon:"none"
      })
      return;
    }
  //时间和教室信息填写完毕，提交信息
    let that=this;
    wx.showLoading({
      title: '确认中',
      mask:true
    })
    wx.request({
      url: `${app.globalData.baseUrl}api/curriculum-plan/coach/affirm-plan/${this.data.curriculumPlanId}`,
      method:"POST",
      header: {
        'Authorization': `Bearer ${that.data.token}`
      },
      data:{
        classroomId:that.data.classroomId,
        planTime: that.data.currentTime + " " + that.data.reservationStartTime
      },
      success(res){
        wx.hideLoading();
      if(res.data.code==="200"){
        wx.showToast({
          title: '确认成功',
          icon:"none"
        })
        wx.navigateBack({
          delta:1
        })
      }
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