// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const familyCollection = db.collection('family_members')

// 云函数入口函数
exports.main = async (event, context) => {
  const { action, data } = event
  const wxContext = cloud.getWXContext()

  switch (action) {
    case 'add':
      // 添加新成员
      return await addMember(data, wxContext)
    case 'update':
      // 更新成员信息
      return await updateMember(data)
    case 'delete':
      // 删除成员
      return await deleteMember(data.id)
    case 'get':
      // 获取所有成员
      return await getMembers(wxContext)
    default:
      return {
        success: false,
        error: 'Unknown action'
      }
  }
}

// 添加新成员
async function addMember(data, wxContext) {
  try {
    // 添加创建时间和创建者信息
    const memberData = {
      ...data,
      createTime: db.serverDate(),
      creator: wxContext.OPENID,
      updateTime: db.serverDate()
    }

    const result = await familyCollection.add({
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
}

// 更新成员信息
async function updateMember(data) {
  try {
    const { id, ...updateData } = data
    const result = await familyCollection.doc(id).update({
      data: {
        ...updateData,
        updateTime: db.serverDate()
      }
    })

    return {
      success: true,
      data: result
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

// 删除成员
async function deleteMember(id) {
  try {
    await familyCollection.doc(id).remove()
    return {
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

// 获取所有成员
async function getMembers(wxContext) {
  try {
    const { data } = await familyCollection
      .where({
        creator: wxContext.OPENID
      })
      .get()

    return {
      success: true,
      data
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}
