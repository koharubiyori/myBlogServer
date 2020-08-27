import { RequestHandler } from 'express'
import dbTools from '~/utils/dbTools'
import { ObjectID } from 'mongodb'

interface RequestArgs {
  articleId: string
}

export default <RequestHandler>function(req, res){
  const userToken = (<MyCookie>req.signedCookies).userToken

  let reqArgs: RequestArgs = req.body
  let typeCheckWarnings = dbTools.typeChecker(reqArgs, {
    articleId: String
  })
  if(typeCheckWarnings) return res.json(typeCheckWarnings)

  dbTools.connectDB()
    .then(async db =>{
      let userData = await db.collection('user').findOne({ token: userToken, deleted: false })
      if(!userData) return res.json(dbTools.responseData.error('账户无效', 401))

      let collectStatus = !!(await db.collection('articleCollection').findOne({ userId: userData._id, articleId: new ObjectID(reqArgs.articleId) }))
      res.json(dbTools.responseData({ collectStatus }))
    })
    .catch(e =>{
      console.log(e)
      res.json(dbTools.responseData.error())
    })
}