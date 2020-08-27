import { RequestHandler } from 'express'
import dbTools from '~/utils/dbTools'
import withArticleTotalByData from '~/utils/withArticleTotalByData'
import { CollectionsData } from '~/@types/collections'

interface RequestArgs {
  
}

export default <RequestHandler>function(req, res){
  dbTools.connectDB()
    .then(async db =>{
      let searchResult = await db.collection('article').find({ isTop: true, deleted: false }).toArray()

      let newSearchResult = await Promise.all(
        searchResult.map(item => withArticleTotalByData(db, item as CollectionsData.Article))
      )

      res.json(dbTools.responseData(newSearchResult))
    })
    .catch(e =>{
      console.log(e)
      res.json(dbTools.responseData.error())
    })
}