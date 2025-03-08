Page({
  data: {
    locations: []
  },

  onLoad: function() {
    this.loadLocations();
  },

  onShow: function() {
    this.loadLocations();
  },

  loadLocations: function() {
    // 临时使用模拟数据
    const mockLocations = [
      {
        id: 1,
        locationName: '交叉口早高峰有叔叔查',
        type: 'danger',
        address: '四川省成都市武侯区剑南大道与天府一街交叉口',
        submitter: '老王',
        submitTime: new Date('2025-03-08T10:30:00').getTime()
      },
      {
        id: 2,
        locationName: '天马大道观景台',
        type: 'scenic',
        address: '四川省彭州市天马大道',
        submitter: '小李',
        submitTime: new Date('2025-03-08T09:15:00').getTime()
      },
      {
        id: 3,
        locationName: '交叉口晚高峰有叔叔查',
        type: 'danger',
        address: '四川省成都市郫都区蜀源大道与百草路交叉口',
        submitter: '阿强',
        submitTime: new Date('2025-03-07T16:45:00').getTime()
      },
      {
        id: 4,
        locationName: '高架下面晚高峰有叔叔查',
        type: 'danger',
        address: '四川省成都市青羊区三环路与清江西路交叉口',
        submitter: '阿强',
        submitTime: new Date('2025-03-07T16:45:00').getTime()
      },
      {
        id: 5,
        locationName: '过街天桥下面晚高峰有叔叔查',
        type: 'danger',
        address: '四川省成都市锦江区桐梓林',
        submitter: '阿强',
        submitTime: new Date('2025-03-07T16:45:00').getTime()
      },
      {
        id: 6,
        locationName: '月亮湾晚高峰有叔叔查',
        type: 'danger',
        address: '四川省成都市双流区绕城高速武侯大道',
        submitter: '阿强',
        submitTime: new Date('2025-03-07T16:45:00').getTime()
      }
    ];

    // 使用模拟数据更新界面
    this.setData({
      locations: mockLocations.map(item => ({
        ...item,
        submitTime: this.formatTime(item.submitTime)
      }))
    });

    /* 暂时注释掉云数据库代码
    const db = wx.cloud.database();
    db.collection('locations')
      .orderBy('submitTime', 'desc')
      .get()
      .then(res => {
        this.setData({
          locations: res.data.map(item => ({
            ...item,
            submitTime: this.formatTime(item.submitTime)
          }))
        });
      })
      .catch(err => {
        console.error('Failed to load locations:', err);
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
      });
    */
  },

  formatTime: function(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
  },

  navigateToAdd: function() {
    wx.navigateTo({
      url: '/pages/locationShare/addLocation/addLocation'
    });
  }
});
