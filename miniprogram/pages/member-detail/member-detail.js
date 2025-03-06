Page({
  data: {
    member: {},
    isEditMode: false,
    editedMember: {}
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
  },
  // Toggle between view and edit modes
  toggleEditMode() {
    this.setData({
      isEditMode: !this.data.isEditMode,
      editedMember: { ...this.data.member }
    });
  },

  // Handle input changes in edit mode
  handleInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`editedMember.${field}`]: value
    });
  },

  // Save edited member information
  saveEditedMember() {
    wx.showLoading({ title: '保存中...' });
    
    // Call the familyMember cloud function with update action
    wx.cloud.callFunction({
      name: 'familyMember',
      data: {
        action: 'update',
        data: {
          _id: this.data.member._id,
          ...this.data.editedMember
        }
      }
    }).then(res => {
      wx.hideLoading();
      if (res.result && res.result.stats && res.result.stats.updated > 0) {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
        this.setData({
          member: this.data.editedMember,
          isEditMode: false
        });
      } else {
        throw new Error('Update failed');
      }
    }).catch(err => {
      wx.hideLoading();
      console.error('Update failed:', err);
      wx.showToast({
        title: '保存失败',
        icon: 'none',
        duration: 2000
      });
    });
  },

  // Cancel editing and revert changes
  cancelEdit() {
    this.setData({
      isEditMode: false,
      editedMember: { ...this.data.member }
    });
  },

  // 选择图片
  chooseImage: function() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        // 上传图片到云存储
        const tempFilePath = res.tempFilePaths[0];
        wx.showLoading({ title: '上传中...' });
        
        const cloudPath = `avatars/${Date.now()}.jpg`;
        wx.cloud.uploadFile({
          cloudPath,
          filePath: tempFilePath,
          success: res => {
            this.setData({
              'editedMember.avatarUrl': res.fileID
            });
          },
          fail: console.error,
          complete: () => {
            wx.hideLoading();
          }
        });
      }
    });
  },
});
