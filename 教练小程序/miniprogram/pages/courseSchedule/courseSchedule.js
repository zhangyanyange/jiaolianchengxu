let app=getApp();
let date=new Date();
Page({

  /**
   * 页面的初始数据
   */
  data: {
   momentEvent:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.time=options.time;
  },
  onShow(){
    this.data.momentEvent=[];
    //渲染小时
    for (let i = 9; i < 20; i++) {
      this.data.momentEvent.push({
        hour: i,
        timeCourses: []
      })
    }
    let openid = wx.getStorageSync('openid');

    let that = this;
    wx.showLoading({
      title: '加载中...',
    })
    wx.request({
      url: `${app.globalData.baseUrl}api/user/coach/get-token`,
      method: "GET",
      data: {
        openId: openid
      },
      success(res) {
        if (res.data.code === "200") {
          wx.setStorageSync('token', res.data.data);
          that.data.token = res.data.data;
          that.getPlanCourse();
        } else if (res.data.code === "501") {
          wx.hideLoading();
          wx.showToast({
            title: res.data.message,
            icon: "none"
          })
          wx.setStorageSync('isLogin', false);
          wx.redirectTo({
            url: '../index/index',
          })

        } else {
          wx.hideLoading();
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
          icon: "none"
        })
      }
    })
  },
  getPlanCourse(){
    let that=this;
    let timeCourse=[];
    wx.request({
      url: `${app.globalData.baseUrl}api/user/coach/time-plan-record/all`,
      method: "GET",
      data: {
        time: that.data.time,
        valid:true
      },
      header: {
        Authorization: `Bearer ${that.data.token}`
      },
      success(res){
        console.log(res);
        wx.hideLoading();
        that.setData({
          rawData:res.data
        })
        for(let item of res.data){
        let bHour= item.beginTime.substr(11, 2);
        let eHour= item.cutOffTime.substr(11,2);
     
        let bStartMinute = parseInt(item.beginTime.substr(14, 2));
        let eEndMinute = parseInt(item.cutOffTime.substr(14, 2));

        if(bHour===eHour){
          let newTimePlan = {
            timePlanState: item.timePlanState,
            curriculumPlanId: item.curriculumPlanId,
            userTimePlanSource: item.userTimePlanSource,
            productName: item.productName,
            hour: bHour,
            minutes: {},
            personalPlanCoachAffirmState: item.personalPlanCoachAffirmState
          };
          newTimePlan.minutes={
            s: bStartMinute,
            e: eEndMinute
          }
          timeCourse.push(newTimePlan);
        }else{
        for(let i=bHour;i<=eHour;i++){
          let newTimePlan1 ={
            timePlanState: item.timePlanState,
            curriculumPlanId: item.curriculumPlanId,
            userTimePlanSource: item.userTimePlanSource,
            productName: item.productName,
            hour : i,
            minutes:{},
            personalPlanCoachAffirmState: item.personalPlanCoachAffirmState
          } 

          if (i == bHour){         
            newTimePlan1.minutes={
                s: bStartMinute,
                e:60
            }
          }else if(i==eHour){
            newTimePlan1.minutes={
              s: 0,
              e: eEndMinute
            }
          }else{
            newTimePlan1.minutes={
              s:0,
              end:60
            }
          }
          timeCourse.push(newTimePlan1);
         }
        }
        }
        for(let i=0;i<timeCourse.length;i++){
          if (timeCourse[i].minutes.s === 0 && timeCourse[i].minutes.e===0){
            timeCourse.splice(i,1);
          }
        }
        for (let item2 of that.data.momentEvent){
          //过滤出同一时段的课程
          let filterTimeCourse=timeCourse.filter(item3=>{
            return item3.hour==item2.hour
           });
           //没有课程被过滤出来，添加一个整体元素
          if(filterTimeCourse.length===0){
            item2.timeCourses.push({
              curriculumPlanId:"1",
              width:'100%',
              sort:1,
              productName:"",
              backgroundcolor:"#fff"
            })//过滤出一个课程
          } else if (filterTimeCourse.length === 1){
            let newCourse;
            if(filterTimeCourse[0].minutes.s===0){
              filterTimeCourse[0].sort=1;
              let width = that.toPercent((filterTimeCourse[0].minutes.e - filterTimeCourse[0].minutes.s)/60);
              filterTimeCourse[0].width=width;
              if (filterTimeCourse[0].userTimePlanSource===0){//团课
                filterTimeCourse[0].backgroundcolor ="#F8992D"
              } else if (filterTimeCourse[0].userTimePlanSource === 1) {//私课
                if (filterTimeCourse[0].personalPlanCoachAffirmState === 1) {
                  filterTimeCourse[0].backgroundcolor = "#52B8F8"
                } else if (filterTimeCourse[0].personalPlanCoachAffirmState === 0) {
                  filterTimeCourse[0].backgroundcolor = "#E94925"
                }
              }
              newCourse = {
                curriculumPlanId: "1",
                sort: 2,
                productName: "",
                width: that.toPercent((60 - (filterTimeCourse[0].minutes.e - filterTimeCourse[0].minutes.s))/60),
                backgroundcolor: "#ffffff"
              }
            } else if (filterTimeCourse[0].e===60){
              filterTimeCourse[0].sort = 2;
              let width = that.toPercent((filterTimeCourse[0].minutes.e - filterTimeCourse[0].minutes.s) / 60);
              filterTimeCourse[0].width = width;
              if (filterTimeCourse[0].userTimePlanSource === 0) {//团课
                filterTimeCourse[0].backgroundcolor = "#F8992D"
              } else if (filterTimeCourse[0].userTimePlanSource === 1) {//私课     
                if (filterTimeCourse[0].personalPlanCoachAffirmState === 1) {
                  filterTimeCourse[0].backgroundcolor = "#52B8F8"
                } else if (filterTimeCourse[0].personalPlanCoachAffirmState === 0) {
                  filterTimeCourse[0].backgroundcolor = "#E94925"
                }
              }
              newCourse = {
                curriculumPlanId: "1",
                sort: 1,
                productName: "",
                width: that.toPercent((60 - (filterTimeCourse[0].minutes.e - filterTimeCourse[0].minutes.s)) / 60),
                backgroundcolor: "#ffffff"
              }
            }else{
              filterTimeCourse[0].sort = 2;
              let width = that.toPercent((filterTimeCourse[0].minutes.e - filterTimeCourse[0].minutes.s) / 60);
              filterTimeCourse[0].width = width;
              if (filterTimeCourse[0].userTimePlanSource === 0) {//团课
                filterTimeCourse[0].backgroundcolor = "#F8992D"
              } else if (filterTimeCourse[0].userTimePlanSource === 1) {//私课     
                if (filterTimeCourse[0].personalPlanCoachAffirmState === 1) {
                  filterTimeCourse[0].backgroundcolor = "#52B8F8"
                } else if (filterTimeCourse[0].personalPlanCoachAffirmState === 0) {
                  filterTimeCourse[0].backgroundcolor = "#E94925"
                }
              }
              newCourse = {
                curriculumPlanId: "1",
                sort: 1,
                productName: "",
                width: that.toPercent((filterTimeCourse[0].minutes.s-0) / 60),
                backgroundcolor: "#ffffff"
              }
              let newCourse1={
                curriculumPlanId: "1",
                sort: 3,
                productName: "",
                width: that.toPercent((60 - filterTimeCourse[0].minutes.e) / 60),
                backgroundcolor: "#ffffff"
              }
              item2.timeCourses.push(newCourse1);
            }
            //将元素放入
            item2.timeCourses.push(filterTimeCourse[0]);
            item2.timeCourses.push(newCourse);
          } else if (filterTimeCourse.length === 2){
            if (filterTimeCourse[0].minutes.s > filterTimeCourse[1].minutes.s){//判断谁大
              filterTimeCourse[0].sort = 3;
              filterTimeCourse[1].sort = 1;
            }else{
              filterTimeCourse[0].sort = 1;
              filterTimeCourse[1].sort = 3;
            }
           
            let width1 = that.toPercent((filterTimeCourse[0].minutes.e - filterTimeCourse[0].minutes.s) / 60);
            filterTimeCourse[0].width = width1;
            if (filterTimeCourse[0].userTimePlanSource === 0) {//团课
              filterTimeCourse[0].backgroundcolor = "#F8992D"
            } else if (filterTimeCourse[0].userTimePlanSource === 1) {//私课
              if (filterTimeCourse[0].personalPlanCoachAffirmState === 1) {
                filterTimeCourse[0].backgroundcolor = "#52B8F8"
              } else if (filterTimeCourse[0].personalPlanCoachAffirmState === 0) {
                filterTimeCourse[0].backgroundcolor = "#E94925"
              }
            }
           
            let width2 = that.toPercent((filterTimeCourse[1].minutes.e - filterTimeCourse[1].minutes.s) / 60);
            filterTimeCourse[1].width = width2;
            if (filterTimeCourse[1].userTimePlanSource === 0) {//团课
              filterTimeCourse[1].backgroundcolor = "#F8992D"
            } else if (filterTimeCourse[1].userTimePlanSource === 1) {//私课
              if (filterTimeCourse[1].personalPlanCoachAffirmState===1){
                filterTimeCourse[1].backgroundcolor = "#52B8F8"
              } else if (filterTimeCourse[1].personalPlanCoachAffirmState=== 0){
                filterTimeCourse[1].backgroundcolor = "#E94925"
              }
            
            }
            let width4="";
            if (filterTimeCourse[0].minutes.s > filterTimeCourse[1].minutes.s){
              width4=that.toPercent((filterTimeCourse[0].minutes.s - filterTimeCourse[1].minutes.e) / 60);
            }else{

              width4 = that.toPercent((filterTimeCourse[1].minutes.s - filterTimeCourse[0].minutes.e) / 60)
            }
            let  newCourse1 = {
              curriculumPlanId: "1",
              sort: 2,
              productName: "",
              width: width4,
              backgroundcolor: "#fff"
            }
            item2.timeCourses.push(filterTimeCourse[0]);
            item2.timeCourses.push(newCourse1);
            item2.timeCourses.push(filterTimeCourse[1]);
          }
        }
        that.setData({
          momentEvent: that.data.momentEvent
        })
      },
      fail(error){
        wx.hideLoading();
      }
    })
  },
  toPercent(point) {
    var str = Number(point * 100).toFixed(2);
    str += "%";
    return str;
  },
  //进入课程详情页
  courseDetail(e){
    if (e.currentTarget.id==1){//自由时间
      return
    }
    let course = this.data.rawData.find(item=>{
      return item.curriculumPlanId === e.currentTarget.id
    });

    if(course.userTimePlanSource===0){//团课
      wx.navigateTo({
        url: `../coursedetail/coursedetail?id=${e.currentTarget.id}&course=${JSON.stringify(course)}`,
      })
    } else if (course.userTimePlanSource === 1){//私课
      if (course.personalPlanCoachAffirmState===0){
        wx.navigateTo({
          url: `../privateLesson/privateLesson?id=${e.currentTarget.id}`,
        })
      } else if (course.personalPlanCoachAffirmState === 1){
        wx.navigateTo({
          url: `../confirmLesson/confirmLesson?id=${e.currentTarget.id}`,
        })
      }
    
    }
  }
})