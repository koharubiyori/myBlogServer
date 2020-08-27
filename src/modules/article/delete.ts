import { RequestHandler } from 'express'
import dbTools from '~/utils/dbTools'
import { ObjectID } from 'mongodb'

interface RequestArgs {
  articleId: string
}

export default <RequestHandler>function(req, res){
  const userToken = (<MyCookie>req.signedCookies).userToken
  let reqArgs: RequestArgs = req.body
  
  let typeCheckWarnings = dbTools.typeChecker(reqArgs, { articleId: String })
  if(typeCheckWarnings) return res.json(typeCheckWarnings)

  dbTools.connectDB()
    .then(async db =>{
      let userData = await db.collection('user').findOne({ token: userToken, deleted: false })
      if(!dbTools.isAdmin(userData)) return res.json(dbTools.responseData.error('权限错误', 401))

      let articleId = new ObjectID(reqArgs.articleId)
      await db.collection('article').updateOne({ _id: articleId }, { $set: { deleted: true } })
      res.json(dbTools.responseData())
    })
    .catch(e =>{
      console.log(e)
      res.json(dbTools.responseData.error())
    })
}