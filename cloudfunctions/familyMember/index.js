// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database()
const _ = db.command
const $ = _.aggregate

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { action, data } = event

  // 根据不同的action执行不同的操作
  switch (action) {
    case 'add':
      try {
        // 添加创建时间和创建者信息
        const memberData = {
          ...data,
          createTime: db.serverDate(),
          creator: wxContext.OPENID,
          updateTime: db.serverDate()
        }
    
        const result = await db.collection('family_members').add({
          data: memberData
        })
    
        return {
          success: true,
          data: {
            id: result._id,
            ...memberData
          }
        }
      } catch (error) {
        return {
          success: false,
          error: error.message
        }
      }
    

    case 'update':
      try {
        const { _id, ...updateData } = data;
        // 更新成员信息，允许所有用户更新
        const result = await db.collection('family_members').doc(_id).update({
          data: {
            ...updateData,
            updateTime: db.serverDate()
          }
        });

        if (result.stats.updated > 0) {
          return {
            success: true,
            stats: result.stats,
            message: '更新成功'
          };
        } else {
          return {
            success: false,
            stats: result.stats,
            message: '更新失败'
          };
        }
      } catch (error) {
        return {
          success: false,
          error: error.message,
          message: '更新失败'
        };
      }

    case 'delete':
      // 删除成员，允许所有用户删除
      return await db.collection('family_members').doc(data._id).remove()

    case 'get':
      try {
        const { data } = await db.collection('family_members').get();
        return {
          success: true,
          data,
          message: '获取成功'
        };
      } catch (error) {
        return {
          success: false,
          data: [],
          message: error.message || '获取失败'
        };
      }

    case 'getById':
      try {
        // 尝试使用传入的ID获取成员信息
        const { memberId } = data;
        console.log('inside getById: memberId:', memberId);
        
        if (!memberId) {
          return {
            success: false,
            message: '未提供有效的成员ID'
          };
        }

        const result = await db.collection('family_members').doc(memberId).get();
        
        if (!result.data) {
          return {
            success: false,
            message: '未找到该成员信息'
          };
        }

        return {
          success: true,
          data: result.data,
          message: '获取成员信息成功'
        };
      } catch (error) {
        console.error('获取成员详情失败:', error);
        
        // 区分不同的错误类型
        if (error.errCode === -502002) {
          return {
            success: false,
            message: '未找到指定的成员'
          };
        }
        
        return {
          success: false,
          message: error.message || '获取成员信息失败'
        };
      }

    default:
      return {
        success: false,
        message: '未知的操作类型'
      }
  }
}
