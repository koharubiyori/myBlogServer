import { RequestHandler } from 'express'
import dbTools from '~/utils/dbTools'
import { CollectionsData } from '~/@types/collections'
import { ObjectID } from 'bson'

interface RequestArgs {
  articleId: string
  collect: boolean
}

export default <RequestHandler>function(req, res){
  const userToken = (<MyCookie>req.signedCookies).userToken
  let reqArgs: RequestArgs = req.body

  let typeCheckWarnings = dbTools.typeChecker(reqArgs, {
    articleId: String,
    collect: Boolean
  })
  if(typeCheckWarnings) return res.json(typeCheckWarnings)
  
  dbTools.connectDB()
    .then(async db =>{
      let userData = await db.collection('user').findOne({ token: userToken, deleted: false })
      if(!userData) return res.json(dbTools.responseData.error('权限错误', 401))
      let data: CollectionsData.ArticleCollection = { articleId: new ObjectID(reqArgs.articleId), userId: new ObjectID(userData._id) }
      if(reqArgs.collect){
        await db.collection('articleCollection').insertOne(data)
      }else{
        await db.collection('articleCollection').deleteOne(data)
      }

      res.json(dbTools.responseData())
    })
    .catch(e =>{
      console.log(e)
      res.json(dbTools.responseData.error())
    })
}