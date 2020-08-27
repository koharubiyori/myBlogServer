import { RequestHandler } from 'express'
import { ObjectID } from 'mongodb'
import dbTools from '~/utils/dbTools'
import withArticleTotalByData from '~/utils/withArticleTotalByData'

interface RequestArgs {
  page?: number
  limit?: number
}

export default <RequestHandler>function(req, res){
  const userToken = (<MyCookie>req.signedCookies).userToken
  let reqArgs = <RequestArgs>dbTools.toTypes(req.body as StringValue<RequestArgs>, {
    page: Number,
    limit: Number,
  })
  
  dbTools.connectDB()
    .then(async db =>{
      let userData = await db.collection('user').findOne({ token: userToken, deleted: false })
      if(!userData) return res.json(dbTools.responseData.error('权限错误', 401))

      let limit = reqArgs.limit || 10,
          page = reqArgs.page || 1,
          skip = (page - 1) * limit
      let articleIdsFilter = (await db.collection('articleCollection').find({ userId: userData!._id }, { projection: { articleId: 1 } })
        .toArray())
        .map(item => ({ _id: item.articleId }))

      if(articleIdsFilter.length === 0){
        return res.json(dbTools.responseData({
          total: 0,
          pageTotal: 0,
          currentPage: 1,
          limit,
          list: []
        } as PageData))
      }

      let searchResult = await db.collection('article').find({ $or: articleIdsFilter, deleted: false }, { skip, limit, sort: { _id: -1 }, projection: { content: 0 } }).toArray()

      let newSearchResult = await Promise.all(
        searchResult.map(item => withArticleTotalByData(db, item))
      )

      let pageData: PageData = {
        total: articleIdsFilter.length,
        pageTotal: Math.ceil(articleIdsFilter.length / limit),
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