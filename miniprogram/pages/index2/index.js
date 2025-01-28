const { envList } = require("../../envList");
const { QuickStartPoints, QuickStartSteps } = require("./constants");

Page({
  data: {
    knowledgePoints: QuickStartPoints,
    steps: QuickStartSteps,
    userInfo: {
      avatarUrl: '',
      nickName: '沈复',
      points: '8.35',
      checkInDays: 15,
      streakDays: 7,
      totalPoints: 235
    },
    selectedCheckinType: '',
    familyMembers: [
      {
        id: 1,
        name: 'Person1',
        avatar: '../../images/avatar1.svg',
        stats: ['#4a90e2', '#4a90e2', '#4a90e2', '#ddd']
      },
      {
        id: 2,
        name: 'Person2',
        avatar: '../../images/avatar2.svg',
        stats: ['#4a90e2', '#4a90e2', '#ddd', '#ddd']
      },
      {
        id: 3,
        name: 'Person3',
        avatar: '../../images/avatar3.svg',
        stats: ['#4a90e2', '#4a90e2', '#4a90e2', '#4a90e2']
      },
      {
        id: 4,
        name: 'Person4',
        avatar: '../../images/avatar4.svg',
        stats: ['#4a90e2', '#ddd', '#ddd', '#ddd']
      },
      {
        id: 5,
        name: 'Person5',
        avatar: '../../images/avatar5.svg',
        stats: ['#4a90e2', '#4a90e2', '#ddd', '#ddd']
      },
      {
        id: 6,
        name: 'Person6',
        avatar: '../../images/avatar6.svg',
        stats: ['#4a90e2', '#4a90e2', '#4a90e2', '#ddd']
      }
    ],
    functionList: [
      {
        id: 1,
        name: '我的订单',
        icon: '../../images/icons/order.png',
        url: '/pages/orders/index'
      },
      {
        id: 2,
        name: '收货地址',
        icon: '../../images/icons/address.png',
        url: '/pages/address/index'
      },
      {
        id: 3,
        name: '联系客服',
        icon: '../../images/icons/service.png',
        url: '/pages/service/index'
      },
      {
        id: 4,
        name: '设置',
        icon: '../../images/icons/settings.png',
        url: '/pages/settings/index'
      }
    ]
  },

  copyCode(e) {
    const code = e.target?.dataset?.code || '';
    wx.setClipboardData({
      data: code,
      success: () => {
        wx.showToast({
          title: '已复制',
        })
      },
      fail: (err) => {
        console.error('复制失败-----', err);
      }
    })
  },

  discoverCloud() {
    wx.switchTab({
      url: '/pages/examples/index',
    })
  },

  gotoGoodsListPage() {
    wx.navigateTo({
      url: '/pages/goods-list/index',
    })
  },

  onLoad: function() {
    // Get user info if available
    wx.getUserInfo({
      success: (res) => {
        this.setData({
          'userInfo.avatarUrl': res.userInfo.avatarUrl,
          'userInfo.nickName': res.userInfo.nickName
        });
      }
    });
  },

  getUserProfile() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo });
    }
  },

  getUserInfo(e) {
    if (e.detail.userInfo) {
      const userInfo = {
        ...e.detail.userInfo,
        registerTime: new Date().toLocaleDateString()
      };
      wx.setStorageSync('userInfo', userInfo);
      this.setData({ userInfo });
    }
  },

  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    this.setData({
      'userInfo.avatarUrl': avatarUrl
    });
  },

  getPhoneNumber(e) {
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      // 实际开发中需要调用后端接口解密手机号
      const userInfo = {
        ...this.data.userInfo,
        phoneNumber: '已绑定'  // 这里仅作示例，实际应该使用解密后的手机号
      };
      wx.setStorageSync('userInfo', userInfo);
      this.setData({ userInfo });
    }
  },

  onMenuTap() {
    // Handle menu button tap
    wx.showActionSheet({
      itemList: ['设置', '关于', '退出'],
      success(res) {
        console.log(res.tapIndex);
      }
    });
  },

  navigateToFunction(e) {
    const { url } = e.currentTarget.dataset;
    wx.navigateTo({ url });
  },

  handleCheckin(e) {
    const type = e.currentTarget.dataset.type;
    // Remove selected class from all options
    const options = this.selectAllComponents('.checkin-option');
    options.forEach(option => {
      option.removeClass('selected');
    });
    // Add selected class to clicked option
    e.currentTarget.addClass('selected');
    this.setData({
      selectedCheckinType: type
    });
  },

  submitCheckin() {
    if (!this.data.selectedCheckinType) {
      wx.showToast({
        title: '请先选择打卡类型',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // Here you would typically make an API call to your backend
    // For now, we'll just show a success message
    wx.showToast({
      title: '打卡成功！',
      icon: 'success',
      duration: 2000
    });

    // Update local stats
    this.setData({
      'userInfo.checkInDays': this.data.userInfo.checkInDays + 1,
      'userInfo.streakDays': this.data.userInfo.streakDays + 1,
      'userInfo.totalPoints': this.data.userInfo.totalPoints + 10,
      selectedCheckinType: ''
    });

    // Remove selected class from all options
    const options = this.selectAllComponents('.checkin-option');
    options.forEach(option => {
      option.removeClass('selected');
    });
  },
});
