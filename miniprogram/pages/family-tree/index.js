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
    levelHeight: 180, // 层级高度
    horizontalGap: 50, // 节点之间的水平间距
    verticalGap: 80, // 节点之间的垂直间距
  },

  onLoad: function(options) {
    // 初始化家谱数据
    this.initFamilyData();
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
    const nodes = [];
    const visited = new Set();
    const minSpacing = this.data.nodeWidth + 40; // 最小节点间距

    const traverse = (member, level, offset) => {
      if (!member || visited.has(member.id)) return { width: 0, nodes: [] };
      visited.add(member.id);

      // 获取所有子节点
      const children = this.data.members.filter(m => m.parentId === member.id);
      let totalWidth = 0;
      let childrenNodes = [];
      let lastChildEndX = offset; // 跟踪最后一个子节点的结束位置

      // 递归处理子节点
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        // 确保每个子树从上一个子树的结束位置开始
        const childOffset = Math.max(lastChildEndX, offset + totalWidth);
        const result = traverse(child, level + 1, childOffset);
        
        // 更新总宽度，确保至少有最小间距
        if (i > 0) {
          totalWidth += Math.max(minSpacing, result.width);
        } else {
          totalWidth = result.width;
        }
        
        lastChildEndX = childOffset + result.width;
        childrenNodes = childrenNodes.concat(result.nodes);
      }

      // 如果没有子节点，设置最小宽度
      totalWidth = Math.max(totalWidth, minSpacing);

      // 计算当前节点的位置
      // 将节点放置在其子节点的中心
      const x = children.length > 0 
        ? offset + totalWidth / 2 
        : offset + minSpacing / 2;
      const y = level * this.data.levelHeight;

      // 创建节点数据
      const node = {
        id: member.id,
        x,
        y,
        member,
        hasChildren: children.length > 0
      };

      nodes.push(node);
      return {
        width: totalWidth,
        nodes: [node, ...childrenNodes]
      };
    };

    // 从根节点开始遍历
    const rootNode = this.data.members.find(m => !m.parentId);
    if (rootNode) {
      const result = traverse(rootNode, 0, 0);
      return result.nodes;
    }
    return [];
  },

  // 渲染家谱树
  renderFamilyTree() {
    const nodes = this.calculateTreeLayout();
    this.setData({
      treeNodes: nodes
    });
  },

  // 节点点击事件
  onNodeTap(e) {
    const member = e.currentTarget.dataset.member;
    console.log("member clicked", member)
    // 弹出一个弹框 信息
    wx.showModal({
      title: '成员信息',
      content: `姓名: ${member.name}\n年龄: ${member.age}\n性别: ${member.gender}\n父亲: ${member.fatherName}\n母亲: ${member.motherName}`,
    })
  },

  // 搜索成员
  onSearch: function(e) {
    const searchText = e.detail.value;
    // 实现搜索逻辑
  },

  // 添加新成员
  addMember: function() {
    // 实现添加成员逻辑
  },

  // 切换编辑模式
  editMode: function() {
    this.setData({
      isEditMode: !this.data.isEditMode
    });
  },

  // 查看成员详情
  viewMemberDetail: function(e) {
    const memberId = e.currentTarget.dataset.id;
    const member = this.data.members.find(m => m.id === memberId);
    
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
  }
});
