import { RequestHandler } from 'express'
import dbTools from '~/utils/dbTools'
import _ from 'lodash'
import { CollectionsData } from '~/@types/collections'
import withArticleTotalByData from '~/utils/withArticleTotalByData'

interface RequestArgs {
  keyword?: string
  page?: number
  limit?: number
  exceptTop?: boolean
}

export default <RequestHandler>function(req, res){
  let reqArgs = <RequestArgs>dbTools.toTypes(req.body as StringValue<RequestArgs>, {
    keyword: String,
    page: Number,
    limit: Number,
    exceptTop: Boolean
  })
  
  dbTools.connectDB()
    .then(async db =>{
      let keyword: string = reqArgs.keyword || '',
          regex = new RegExp(_.escapeRegExp(keyword)),
          limit = reqArgs.limit || 10,
          page = reqArgs.page || 1,
          skip = (page - 1) * limit,
          filter = reqArgs.keyword ? { $or: [{ title: regex }, { content: regex }], deleted: false} : { deleted: false }
      filter = {
        ...filter,
        ...(reqArgs.exceptTop ? { isTop: false } : {})
      }
      let searchResultTotal = await db.collection('article').find(filter).count()
      let searchResult: Omit<CollectionsData.Article, 'content'>[] = 
        await db.collection('article').find(filter, { skip, limit, sort: { _id: -1 }, projection: { content: 0 } }).toArray()

      let newSearchResult = await Promise.all(
        searchResult.map(item => withArticleTotalByData(db, item as CollectionsData.Article))
      )

      let pageData: PageData = {
        total: searchResultTotal,
        pageTotal: Math.ceil(searchResultTotal / limit),
        currentPage: page,
        limit,
        list: newSearchResult
      }

      res.json(dbTools.responseData(pageData))
    })
    .catch(e =>{
      console.log(e)
      res.json(dbTools.responseData.error())
    })
}