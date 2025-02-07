Page({
  data: {
    member: null
  },

  onLoad(options) {
    // 从路由参数中获取成员ID
    const memberId = options.id;
    console.log('inside member page: memberId:', memberId);
    
    if (!memberId) {
      wx.showToast({
        title: '未找到成员信息',
        icon: 'none',
        duration: 5000,
        complete: () => {
          wx.navigateBack();
        }
      });
      return;
    }

    // 获取成员详细信息
    this.fetchMemberDetails(memberId);
  },

  fetchMemberDetails(memberId) {
    wx.showLoading({ title: '加载中...' });
    console.log('inside fetchMemberDetails: memberId:', memberId);

    wx.cloud.callFunction({
      name: 'familyMember',
      data: {
        action: 'getById',
        data: memberId  // 直接传递memberId作为data
      }
    }).then(res => {
      wx.hideLoading();
      console.log('getById信息:', res.result);

      if (res.result.success && res.result.data) {
        this.setData({
          member: res.result.data
        });
      } else {
        wx.showToast({
          title: res.result.message || '获取成员信息失败',
          icon: 'none',
          duration: 8000,
          complete: () => {
            wx.navigateBack();
          }
        });
      }
    }).catch(err => {
      wx.hideLoading();
      console.error('获取成员详情错误:', err);
      
      wx.showToast({
        title: '网络错误',
        icon: 'none',
        duration: 18000,
        complete: () => {
          wx.navigateBack();
        }
      });
    });
  }
});
