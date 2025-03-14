// pages/family-tree/index.js
Page({
  data: {
    members: [], // 家庭成员数据
    treeNodes: [], // 树形节点数据
    showMemberDetail: false, // 是否显示成员详情弹窗
    currentMember: null, // 当前查看的成员
    isEditMode: false, // 是否处于编辑模式
    nodeWidth: 120, // 节点宽度
    nodeHeight: 150, // 节点高度
    levelHeight: 200, // 层级高度
    horizontalGap: 50, // 节点之间的水平间距
    verticalPadding: 100, // 顶部内边距
    showPasswordDialog: false, // 密码验证弹窗
    inputPassword: '', // 输入的密码
    scale: 1.0,
    showSearchModal: false, // 搜索弹窗
    searchQuery: '', // 搜索查询
    searchResults: [], // 搜索结果
    showSearchResultModal: false // 搜索结果弹窗
  },

  onLoad: function(options) {
    // 初始化家谱数据
    this.loadFamilyData().then(() => {
      this.renderFamilyTree();
    });
  },

  // 加载家谱数据
  async loadFamilyData() {
    try {
      wx.showLoading({ title: '加载中...' });
      
      const { result } = await wx.cloud.callFunction({
        name: 'familyMember',
        data: { action: 'get' }
      });

      console.log('云函数返回结果:', result);

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

        return result.data; // 返回成员数据
      } else {
        wx.showToast({
          title: '加载家庭成员失败',
          icon: 'none'
        });
        return []; // 返回空数组
      }
    } catch (error) {
      console.error('加载家庭成员出错:', error);
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      });
      return []; // 返回空数组
    } finally {
      wx.hideLoading();
    }
  },

  // 初始化家谱数据
  initFamilyData() {
    // 示例数据
    const mockData = [{
      id: '1',
      name: '张三',
      birthDate: '1960-01-01',
      relation: '祖父',
      description: '家族长者',
      children: ['2', '3']
    }, {
      id: '2',
      name: '张明',
      birthDate: '1985-05-15',
      relation: '父亲',
      description: '工程师',
      parentId: '1',
      children: ['4', '5']
    }, {
      id: '3',
      name: '张华',
      birthDate: '1988-03-20',
      relation: '叔叔',
      description: '医生',
      parentId: '1',
      children: ['6']
    }, {
      id: '4',
      name: '张小明',
      birthDate: '2010-08-12',
      relation: '儿子',
      description: '学生',
      parentId: '2'
    }, {
      id: '5',
      name: '张小红',
      birthDate: '2012-11-30',
      relation: '女儿',
      description: '学生',
      parentId: '2'
    }, {
      id: '6',
      name: '张小华',
      birthDate: '2015-04-25',
      relation: '侄子',
      description: '学生',
      parentId: '3'
    }];

    this.setData({
      members: mockData
    });
    this.renderFamilyTree();
  },

  // 计算树形布局
  calculateTreeLayout(rootMember) {
    const minSpacing = this.data.nodeWidth + this.data.horizontalGap;
    const processedNodes = new Set();
    const verticalLineHeight = 25; // 竖线的高度

    const traverse = (member, level, offset) => {
      if (!member || processedNodes.has(member._id)) {
        return { width: 0, nodes: [] };
      }

      processedNodes.add(member._id);

      const nodes = [];
      let totalWidth = 0;
      const children = this.data.members.filter(m => m.parentId === member._id);

      // 检查节点是否已折叠
      const existingNode = this.data.treeNodes ? this.data.treeNodes.find(n => n._id === member._id) : null;
      const isCollapsed = existingNode ? existingNode.collapsed : true;

      // 如果节点已折叠，不处理其子节点
      if (isCollapsed) {
        const x = offset + minSpacing / 2;
        const y = this.data.verticalPadding + (level * this.data.levelHeight);
        
        nodes.push({
          _id: member._id,
          x,
          y,
          member,
          hasChildren: children.length > 0,
          collapsed: true
        });
        
        processedNodes.delete(member._id);
        return {
          width: minSpacing,
          nodes
        };
      }

      // 计算子节点的布局
      let lastChildEndX = offset;
      let childrenNodes = [];

      for (const child of children) {
        const childOffset = lastChildEndX;
        const result = traverse(child, level + 1, childOffset);
        totalWidth += result.width;
        lastChildEndX = childOffset + result.width;
        childrenNodes = childrenNodes.concat(result.nodes);
      }

      totalWidth = Math.max(totalWidth, minSpacing);
      const x = children.length > 0 ? offset + totalWidth / 2 : offset + minSpacing / 2;
      const y = this.data.verticalPadding + (level * this.data.levelHeight);

      // 获取直接子节点
      const directChildren = childrenNodes.filter(node => 
        children.some(child => child._id === node._id)
      );

      // 计算连线数据
      let connectionData = null;
      if (children.length > 0 && !isCollapsed) {
        const leftmostChild = directChildren[0];
        const rightmostChild = directChildren[directChildren.length - 1];
        
        connectionData = {
          // 父节点底部的竖线
          parentLine: {
            x: x,
            y: y + this.data.nodeHeight / 2,
            height: verticalLineHeight
          },
          // 横线（如果有多个子节点）
          horizontalLine: directChildren.length > 1 ? {
            x1: leftmostChild.x,
            x2: rightmostChild.x,
            y: y + this.data.nodeHeight / 2 + verticalLineHeight
          } : null,
          // 子节点顶部的竖线
          childrenLines: directChildren.map(child => ({
            x: child.x,
            y: child.y - this.data.nodeHeight / 2 - verticalLineHeight,
            height: verticalLineHeight
          }))
        };
      }

      nodes.push({
        _id: member._id,
        x,
        y,
        member,
        hasChildren: children.length > 0,
        collapsed: isCollapsed,
        connectionData
      });

      processedNodes.delete(member._id);
      return {
        width: totalWidth,
        nodes: nodes.concat(childrenNodes)
      };
    };

    return traverse(rootMember, 0, 0).nodes;
  },

  // 渲染家谱树
  renderFamilyTree() {
    const rootMember = this.data.members.find(m => !m.parentId);
    if (rootMember) {
      const result = this.calculateTreeLayout(rootMember);
      this.setData({
        treeNodes: result
      });
    }
  },

  // 节点点击事件
  onNodeTap(e) {
    const nodeId = e.currentTarget.dataset._id;
    const action = e.target.dataset.action;
    console.log("nodeId", nodeId, "action:", action);
    
    if (action === 'toggle') {
      // 处理折叠/展开操作
      const treeNodes = [...this.data.treeNodes];
      const node = treeNodes.find(n => n._id === nodeId);
      if (node) {
        node.collapsed = !node.collapsed;
        this.setData({ treeNodes }, () => {
          this.renderFamilyTree();
        });
      }
    } else {
      // 处理查看成员详情
      const member = e.currentTarget.dataset.member;
      if (member) {
        this.viewMemberDetail(e);
      }
    }
  },

  // 搜索成员
  onSearch: function(e) {
    const searchText = e.detail.value;
    // 暂时不实现搜索逻辑，而是勘误，而是仅仅弹出一个弹窗，说明功能正在开发中，可以联系作者获取更多信息
    wx.showModal({
      title: '反馈错误',  
      content: `联系锁成提供更多信息`,
    })
  },

  // 显示密码验证弹窗
  showPasswordDialog() {
    this.setData({
      showPasswordDialog: true,
      inputPassword: ''
    });
  },

  // 关闭密码验证弹窗
  closePasswordDialog() {
    this.setData({
      showPasswordDialog: false,
      inputPassword: ''
    });
  },

  // 处理密码输入
  onPasswordInput: function(e) {
    console.log("input: ", e.detail.value)
    this.setData({
      inputPassword: e.detail.value
    });
  },

  // 验证密码
  verifyPassword() {
    const correctPassword = '1212'; // 这里设置正确的密码
    console.log("pass: ", this.data.inputPassword)
    if (this.data.inputPassword === correctPassword) {
      this.setData({
        showPasswordDialog: false,
        showAddModal: true,
        inputPassword: ''
      });
      // 导航到成员管理页面
      wx.navigateTo({
        url: '/pages/member-manage/member-manage'
      });
    } else {
      wx.showToast({
        title: '密码错误',
        icon: 'error'
      });
    }
  },

  // 获取父节点显示文本
  getParentNodeText: function() {
    if (!this.data.selectedParentId) {
      return '点击选择父节点';
    }
    const parent = this.data.members.find(m => m._id === this.data.selectedParentId);
    return parent ? parent.name + ' (点击更改)' : '点击选择父节点';
  },

  // 选择父节点
  selectParent: function(e) {
    const index = e.detail.value;
    const selectedMember = this.data.members[index];
    
    if (selectedMember) {
      this.setData({
        selectedParentId: selectedMember._id,
        selectedParentName: selectedMember.name
      });
    }
  },


  // 查看成员详情
  viewMemberDetail: function(e) {
    const memberId = e.currentTarget.dataset._id;
    const member = this.data.members.find(m => m._id === memberId);
    
    if (member) {
      this.setData({
        currentMember: member,
        showMemberDetail: true
      });
    }
  },

  // 关闭成员详情弹窗
  closeMemberDetail: function() {
    this.setData({
      showMemberDetail: false,
      currentMember: null
    });
  },

  onZoomIn() {
    let newScale = this.data.scale + 0.2;
    if (newScale > 3) newScale = 3;
    this.setData({ scale: newScale });
  },

  onZoomOut() {
    let newScale = this.data.scale - 0.2;
    if (newScale < 0.5) newScale = 0.5;
    this.setData({ scale: newScale });
  },

  // 显示使用说明页面
  showHelp() {
    wx.navigateTo({
      url: '/pages/help/help'
    });
  },

  // 显示搜索弹窗
  showSearchModal() {
    this.setData({
      showSearchModal: true,
      searchQuery: '',
      searchResults: []
    });
  },

  // 关闭搜索弹窗
  closeSearchModal() {
    this.setData({
      showSearchModal: false,
      searchQuery: '',
      searchResults: []
    });
  },

  // 处理搜索输入变化
  onSearchInputChange: function(e) {
    console.log('Input event:', e);
    console.log('Input value:', e.detail.value);
    
    const searchQuery = e.detail.value || '';
    
    this.setData({
      searchQuery: searchQuery
    });
    
    console.log('Current searchQuery:', this.data.searchQuery);
  },

  // 执行搜索
  performSearch() {
    const { searchQuery, members } = this.data;
    
    console.log('Search query:', searchQuery);
    console.log('Total members:', members ? members.length : 'No members');
    
    if (!searchQuery) {
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none'
      });
      return;
    }

    if (!members || members.length === 0) {
      // 如果成员列表为空，重新加载家庭成员数据
      this.loadFamilyData().then(() => {
        this.performSearch(); // 重新执行搜索
      });
      return;
    }

    // 根据姓名进行模糊搜索
    const results = members.filter(member => 
      member.name.includes(searchQuery)
    );

    console.log('Raw search results:', results);

    // 确保每个结果都有唯一标识
    const searchResults = results.map(member => ({
      ...member,
      id: member._id || member.id || Math.random().toString(36).substr(2, 9)
    }));

    console.log('Processed search results:', searchResults);

    // 分两步设置数据，确保数据正确传递
    this.setData({
      searchResults: []  // 先清空
    }, () => {
      // 在回调中设置新的搜索结果
      this.setData({
        searchResults: searchResults,
        showSearchResultModal: true
      }, () => {
        console.log('Final searchResults:', this.data.searchResults);
        console.log('Final searchResults length:', this.data.searchResults.length);
      });
    });

    // 如果没有找到结果，显示提示
    if (searchResults.length === 0) {
      wx.showToast({
        title: '未找到匹配的成员',
        icon: 'none'
      });
    }

    this.closeSearchModal();
  },

  // 关闭搜索结果弹窗
  closeSearchResultModal() {
    this.setData({
      showSearchResultModal: false,
      searchResults: []
    });
  },

  // 导航到成员详情页
  navigateToMemberDetail(e) {
    const memberId = e.currentTarget.dataset.id;
    console.log('memberId:', memberId);
    
    // 确保memberId存在且不为空
    if (!memberId) {
      wx.showToast({
        title: '无效的成员ID',
        icon: 'none'
      });
      return;
    }

    wx.navigateTo({
      url: `/pages/member-detail/member-detail?id=${memberId}`
    });
  },

  // 导航到成员详情页
  navigateToMemberDetail() {
    const memberId = this.data.currentMember._id;
    wx.navigateTo({
      url: `/pages/member-detail/member-detail?id=${memberId}`
    });
    this.closeMemberDetail(); // 关闭当前弹窗
  },
});
