import { RequestHandler } from 'express'
import dbTools from '~/utils/dbTools'
import _ from 'lodash'
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
      let total = await db.collection('article').find({ deleted: false }).count()
      
      if(total <= number){
        let articleData = await db.collection('article').find({ deleted: false }).toArray()
        return res.json(dbTools.responseData(articleData))
      }

      let randoms: number[] = []
      while(randoms.length < number){
        let random = _.random(0, total - 1)
        !randoms.includes(random) && randoms.push(random)
      }

      let articleData = await Promise.all(
        randoms.map(skip => 
          db.collection('article').findOne({ deleted: false }, { skip, projection: { content: 0 } })
        )
      )

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