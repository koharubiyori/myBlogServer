import { RequestHandler } from 'express'
import dbTools from '~/utils/dbTools'
import withUserData from '~/utils/withUserData'
import { CollectionsData } from '~/@types/collections'

interface RequestArgs {
  page?: number
  limit?: number
  isUnchecked?: boolean
}

export default <RequestHandler>function(req, res){
  const userToken = (<MyCookie>req.signedCookies).userToken
  let reqArgs = <RequestArgs>dbTools.toTypes(req.body as StringValue<RequestArgs>, {
    page: Number,
    limit: Number,
    isUnchecked: Boolean
  })

  dbTools.connectDB()
    .then(async db =>{
      let userData = await db.collection('user').findOne({ token: userToken, deleted: false })
      if(!userData) return res.json(dbTools.responseData.error('账户无效', 401))

      if(!reqArgs.isUnchecked){
        let limit = reqArgs.limit || 10,
            page = reqArgs.page || 1,
            skip = (page - 1) * limit
        let filter = { 
          userId: userData._id,
          deleted: false,
          isChecked: true 
        }
        let listDataTotal = await db.collection('notification').find(filter).count()
        let notificationData = await db.collection('notification').find(filter, { skip, limit, sort: { _id: -1 } }).toArray()
        let attachedData = await withSubData(notificationData)
        
        let pageData: PageData = {
          total: listDataTotal,
          pageTotal: Math.ceil(listDataTotal / limit),
          currentPage: page,
          limit,
          list: attachedData
        }
  
        res.json(dbTools.responseData(pageData))
      }else{
        let notificationData = await db.collection('notification').find({ userId: userData._id, deleted: false, isChecked: false }).toArray()
        let attachedData = await withSubData(notificationData)

        res.json(dbTools.responseData(attachedData))
      }

      function withSubData(notificationData: CollectionsData.Notification[]){
        return Promise.all(
          notificationData.map(item => new Promise(async resolve =>{
            let result: typeof item & { [key: string]: any } = item
            result = await withUserData(db, result, { _id: item.operatorId }, 'operatorUserData')
            result = await withUserData(db, result, { _id: item.userId }, 'userData')
            
            if(item.type === 'reply' || item.type === 'comment'){
              let articleData = await db.collection('article').findOne({ _id: item.articleId, deleted: false }, { projection: { content: 0 } })
              let commentData = await db.collection('comment').findOne({ _id: item.commentId, deleted: false })
              result = { ...result, articleData, commentData }
            }

            resolve(result)
          }))
        )
      }
    })
    .catch(e =>{
      console.log(e)
      res.json(dbTools.responseData.error())
    })
}