import { RequestHandler } from 'express'
import dbTools from '~/utils/dbTools'

interface RequestArgs {
  page?: number
  limit?: number
}

export default <RequestHandler>function(req, res){
  let reqArgs = <RequestArgs>dbTools.toTypes(req.body as StringValue<RequestArgs>, {
    page: Number,
    limit: Number
  })

  dbTools.connectDB()
    .then(async db =>{
      let limit = reqArgs.limit || 10,
          page = reqArgs.page || 1,
          skip = (page - 1) * limit
      let listDataTotal = await db.collection('katakoto').find({ deleted: false }).count()
      let katakotoData = await db.collection('katakoto').find({ deleted: false }, { skip, limit, sort: { _id: -1 } }).toArray()
      let pageData: PageData = {
        total: listDataTotal,
        pageTotal: Math.ceil(listDataTotal / limit),
        currentPage: page,
        limit,
        list: katakotoData
      }

      res.json(dbTools.responseData(pageData))
    })
    .catch(e =>{
      console.log(e)
      res.json(dbTools.responseData.error())
    })
}