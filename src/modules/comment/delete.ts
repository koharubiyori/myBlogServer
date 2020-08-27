import { RequestHandler } from 'express'
import dbTools from '~/utils/dbTools'
import { ObjectID } from 'bson'

interface RequestArgs {
  commentIds: string[]
}

export default <RequestHandler>function(req, res){
  const userToken = (<MyCookie>req.signedCookies).userToken
  let reqArgs: RequestArgs = req.body
  
  let typeCheckWarnings = dbTools.typeChecker(reqArgs, { commentIds: Array })
  if(typeCheckWarnings) return res.json(typeCheckWarnings)

  if(reqArgs.commentIds.length === 0) return res.json(dbTools.responseData.error('传入的评论id数组为空', 400))
  dbTools.connectDB()
    .then(async db =>{
      let userData = await db.collection('user').findOne({ token: userToken, deleted: false })
      if(!dbTools.isAdmin(userData)) return res.json(dbTools.responseData.error('权限错误', 401))
      let queryFilterByCommentIds = reqArgs.commentIds.map(item => ({ _id: new ObjectID(item) }))
      await db.collection('comment').updateMany({ $or: queryFilterByCommentIds }, { $set: { deleted: true } })
      res.json(dbTools.responseData())
    })
    .catch(e =>{
      console.log(e)
      res.json(dbTools.responseData.error())
    })
}