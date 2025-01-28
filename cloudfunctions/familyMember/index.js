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
      // 更新成员信息，允许所有用户更新
      return await db.collection('family_members').doc(data._id).update({
        data: {
          ...data,
          updatedAt: new Date()
        }
      })

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
      // 根据ID获取成员，不做 OPENID 限制
      return await db.collection('family_members').doc(data._id).get()

    default:
      return {
        success: false,
        message: '未知的操作类型'
      }
  }
}
