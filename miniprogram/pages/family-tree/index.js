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
    const minSpacing = this.data.nodeWidth + this.data.horizontalGap;

    const traverse = (member, level, offset) => {
      if (!member) return { width: 0, nodes: [] };

      const nodes = [];
      let totalWidth = 0;
      const children = this.data.members.filter(m => m.parentId === member.id);

      // 检查节点是否已折叠
      const existingNode = this.data.treeNodes ? this.data.treeNodes.find(n => n.id === member.id) : null;
      const isCollapsed = existingNode ? existingNode.collapsed : false;

      // 如果节点已折叠，不处理其子节点
      if (isCollapsed) {
        const x = offset + minSpacing / 2;
        const y = this.data.verticalPadding + (level * this.data.levelHeight);
        
        nodes.push({
          id: member.id,
          x,
          y,
          member,
          hasChildren: children.length > 0,
          collapsed: true
        });
        
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

      // 如果没有子节点，设置最小宽度
      totalWidth = Math.max(totalWidth, minSpacing);

      // 计算当前节点的位置
      const x = children.length > 0 
        ? offset + totalWidth / 2 
        : offset + minSpacing / 2;
      const y = this.data.verticalPadding + (level * this.data.levelHeight);

      // 创建节点数据
      nodes.push({
        id: member.id,
        x,
        y,
        member,
        hasChildren: children.length > 0,
        collapsed: isCollapsed
      });

      return {
        width: totalWidth,
        nodes: isCollapsed ? nodes : nodes.concat(childrenNodes)
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
    const nodeId = e.currentTarget.dataset.id;
    const action = e.target.dataset.action;
    
    if (action === 'toggle') {
      // 处理折叠/展开操作
      const treeNodes = this.data.treeNodes;
      const node = treeNodes.find(n => n.id === nodeId);
      if (node) {
        node.collapsed = !node.collapsed;
        this.setData({ treeNodes }, () => {
          // 重新计算布局并渲染
          this.renderFamilyTree();
        });
      }
    } else {
      // 显示成员详情
      const member = e.currentTarget.dataset.member;
      this.setData({
        currentMember: member,
        showMemberDetail: true
      });
    }
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
