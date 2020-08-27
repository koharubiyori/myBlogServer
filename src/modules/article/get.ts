import { RequestHandler } from 'express'
import dbTools from '~/utils/dbTools'
import { ObjectID } from 'mongodb'
import withArticleTotalByData from '~/utils/withArticleTotalByData'

interface RequestArgs {
  articleId: string
  noCount?: boolean
}

export default <RequestHandler>function(req, res){
  let reqArgs = <RequestArgs>dbTools.toTypes(req.body as StringValue<RequestArgs>, {
    articleId: String,
    noCount: Boolean
  })

  let typeCheckWarnings = dbTools.typeChecker(reqArgs, { articleId: String })
  if(typeCheckWarnings) return res.json(typeCheckWarnings)
  
  dbTools.connectDB()
    .then(async db =>{
      let articleId = new ObjectID(reqArgs.articleId)
      let articleData = await db.collection('article').findOne({ _id: articleId, deleted: false })
      if(!articleData) return res.json(dbTools.responseData.error('请求的文章不存在', 404))
      
      let articleDataWithTotal = await withArticleTotalByData(db, articleData)
      let lastArticle = await db.collection('article').findOne({ _id: { $lt: articleId }, deleted: false }, { sort: { _id: -1 }, projection: { content: 0 } })
      let nextArticle = await db.collection('article').findOne({ _id: { $gt: articleId }, deleted: false }, { projection: { content: 0 } })

      res.json(dbTools.responseData({
        ...articleDataWithTotal,
        lastArticle,
        nextArticle,
        updatedAt: articleData.updatedAt.getTime()
      }))

      !reqArgs.noCount && db.collection('article').updateOne({ _id: articleId }, { $inc: { readNum: 1 } })
    })
    .catch(e =>{
      console.log(e)
      res.json(dbTools.responseData.error())
    })
}