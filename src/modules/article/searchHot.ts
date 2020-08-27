import { RequestHandler } from 'express'
import dbTools from '~/utils/dbTools'
import withArticleTotalByData from '~/utils/withArticleTotalByData'
import { CollectionsData } from '~/@types/collections'

interface RequestArgs {
  number?: number
}

export default <RequestHandler>function(req, res){
  let reqArgs = <RequestArgs>dbTools.toTypes(req.body as StringValue<RequestArgs>, {
    number: Number
  })
  
  dbTools.connectDB()
    .then(async db =>{
      let number = reqArgs.number || 5
      let articleData = await db.collection('article').find({ deleted: false }, { limit: number, sort: { readNum: -1 }, projection: { content: 0 } }).toArray()
      
      let articleDataWithTotal = await Promise.all(
        articleData.map(item => withArticleTotalByData(db, item as CollectionsData.Article))
      )

      res.json(dbTools.responseData(articleDataWithTotal))
    })
    .catch(e =>{
      console.log(e)
      res.json(dbTools.responseData.error())
    })
}