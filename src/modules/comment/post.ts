import { RequestHandler } from 'express'
import dbTools from '~/utils/dbTools'
import _ from 'lodash'
import { CollectionsData } from '~/@types/collections'
import { ObjectID, ObjectId } from 'mongodb'
import { adminAccount } from '~/config'

interface RequestArgs {
  articleId: string
  targetId?: string     // 有表示操作为对评论进行回复
  targetUserId?: string
  content: string
}

export default <RequestHandler>function(req, res){
  const userToken = (<MyCookie>req.signedCookies).userToken
  let reqArgs: RequestArgs = req.body

  let typeCheckWarnings = dbTools.typeChecker(reqArgs, {
    articleId: String,
    targetId: '',
    targetUserId: '',
    content: String
  })
  if(typeCheckWarnings) return res.json(typeCheckWarnings)
  
  dbTools.connectDB()
    .then(async db =>{
      let userData = await db.collection('user').findOne({ token: userToken, deleted: false })
      if(!userData) return res.json(dbTools.responseData.error('权限错误', 401))

      let commentData: CollectionsData.Comment = {
        articleId: new ObjectID(reqArgs.articleId),
        content: reqArgs.content,
        parentId: reqArgs.targetId ? new ObjectID(reqArgs.targetId) : '',
        userId: <ObjectId>userData._id,
        deleted: false
      }
      let insertResult = await db.collection('comment').insertOne(commentData)

      res.json(dbTools.responseData({
        commentId: insertResult.insertedId
      }))

      let authorUserData = <CollectionsData.User>await db.collection('user').findOne({ account: '#' + adminAccount })
      let notificationUserId = reqArgs.targetId ? new ObjectID(reqArgs.targetUserId) : authorUserData._id!
      if(userData._id?.equals(notificationUserId)) { return }   // 如果通知目标和操作者相同，则不发通知
      
      let notificationData: CollectionsData.Notification = {
        userId: notificationUserId,
        operatorId: userData._id!,
        type: reqArgs.targetId ? 'reply' : 'comment',
        isChecked: false,
        deleted: false,
        commentId: insertResult.insertedId,
        articleId: new ObjectID(reqArgs.articleId)
      }

      db.collection('notification').insertOne(notificationData)
    })
    .catch(e =>{
      console.log(e)
      res.json(dbTools.responseData.error())
    })
}