import { RequestHandler } from 'express'
import dbTools from '~/utils/dbTools'
import { ObjectID } from 'mongodb'

interface RequestArgs {
  notificationIds: string[]
}

export default <RequestHandler>function(req, res){
  const userToken = (<MyCookie>req.signedCookies).userToken
  let reqArgs: RequestArgs = req.body

  let typeCheckWarnings = dbTools.typeChecker(reqArgs, {
    notificationIds: Array
  })
  if(typeCheckWarnings) return res.json(typeCheckWarnings)

  if(reqArgs.notificationIds.length === 0) return res.json(dbTools.responseData.error('传入的通知id数组为空', 400))
  dbTools.connectDB()
    .then(async db =>{
      let queryFilterByNotificationIds = reqArgs.notificationIds.map(item => ({ _id: new ObjectID(item) }))
      await db.collection('notification').updateMany({ $or: queryFilterByNotificationIds }, { $set: { isChecked: true } })
      res.json(dbTools.responseData())
    })
    .catch(e =>{
      console.log(e)
      res.json(dbTools.responseData.error())
    })
}