// pages/member-manage/member-manage.js
Page({
  data: {
    members: [], // 家庭成员数据
    newMember: {
      name: '',
      birthDate: '',
      description: ''
    },
    selectedParentId: null,
    selectedParentName: '',
    isEditing: false,
    currentMemberId: null
  },

  onLoad: function(options) {
    this.loadFamilyData();
  },

  // 加载家谱数据
  async loadFamilyData() {
    try {
      wx.showLoading({ title: '加载中...' });
      
      const { result } = await wx.cloud.callFunction({
        name: 'familyMember',
        data: { action: 'get' }
      });

      if (result.success) {
        if (!Array.isArray(result.data)) {
          throw new Error('返回数据格式错误');
        }

        this.setData({ 
          members: result.data
        });

        if (result.data.length === 0) {
          wx.showToast({
            title: '暂无家庭成员',
            icon: 'none'
          });
        }
      } else {
        wx.showToast({
          title: '加载家庭成员失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('加载家庭成员出错:', error);
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 处理出生日期变更
  onBirthDateChange(e) {
    this.setData({
      'newMember.birthDate': e.detail.value
    });
  },

  // 选择父节点
  selectParent(e) {
    const index = e.detail.value;
    const parent = this.data.members[index];
    this.setData({
      selectedParentId: parent._id,
      selectedParentName: parent.name
    });
  },

  // 提交新成员
  async submitNewMember(e) {
    const formData = e.detail.value;
    if (!formData.name) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      });
      return;
    }

    try {
      wx.showLoading({ title: this.data.isEditing ? '更新中...' : '添加中...' });
      
      // 构建成员数据
      const memberData = {
        name: formData.name,
        birthDate: this.data.newMember.birthDate,
        description: formData.description,
        parentId: this.data.selectedParentId
      };

      // 添加或更新成员
      const { result } = await wx.cloud.callFunction({
        name: 'familyMember',
        data: { 
          action: this.data.isEditing ? 'update' : 'add',
          data: this.data.isEditing 
            ? { ...memberData, _id: this.data.currentMemberId }
            : memberData
        }
      });

      console.log("result: >>", result)
      if (result.success) {
        wx.showToast({
          title: this.data.isEditing ? '更新成功' : '添加成功',
          icon: 'success'
        });
        
        // 重新加载数据
        this.loadFamilyData();
        
        // 重置表单
        this.resetForm();
      } else {
        wx.showToast({
          title: result.message || (this.data.isEditing ? '更新失败' : '添加失败'),
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('添加/更新成员出错:', error);
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 重置表单
  resetForm() {
    this.setData({
      newMember: {
        name: '',
        birthDate: '',
        description: ''
      },
      selectedParentId: null,
      selectedParentName: '',
      isEditing: false,
      currentMemberId: null
    });
  },

  // 取消添加
  cancel() {
    this.resetForm();
  },

  // 编辑成员
  editMember(e) {
    const memberId = e.currentTarget.dataset.id;
    const member = this.data.members.find(m => m._id === memberId);
    
    if (member) {
      // 找到父节点名称
      let parentName = '';
      if (member.parentId) {
        const parent = this.data.members.find(m => m._id === member.parentId);
        if (parent) {
          parentName = parent.name;
        }
      }
      
      this.setData({
        newMember: {
          name: member.name,
          birthDate: member.birthDate || '',
          description: member.description || ''
        },
        selectedParentId: member.parentId || null,
        selectedParentName: parentName,
        isEditing: true,
        currentMemberId: member._id
      });
    }
  },

  // 删除成员
  async deleteMember(e) {
    const memberId = e.currentTarget.dataset.id;
    
    // 检查是否有子节点
    const hasChildren = this.data.members.some(m => m.parentId === memberId);
    if (hasChildren) {
      wx.showModal({
        title: '无法删除',
        content: '该成员拥有子节点，请先删除所有子节点',
        showCancel: false
      });
      return;
    }
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该成员吗？此操作不可撤销。',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '删除中...' });
            
            const { result } = await wx.cloud.callFunction({
              name: 'familyMember',
              data: { 
                action: 'delete',
                data: {
                  _id: memberId
                }
              }
            });
            console.log("result: ", result)
            if (result.stats.removed==1) {
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              });
              
              // 重新加载数据
              this.loadFamilyData();
              
              // 如果正在编辑此成员，重置表单
              if (this.data.currentMemberId === memberId) {
                this.resetForm();
              }
            } else {
              wx.showToast({
                title: result.message || '删除失败',
                icon: 'none'
              });
            }
          } catch (error) {
            console.error('删除成员出错:', error);
            wx.showToast({
              title: '网络错误',
              icon: 'none'
            });
          } finally {
            wx.hideLoading();
          }
        }
      }
    });
  }
});
