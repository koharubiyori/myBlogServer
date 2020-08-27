import { RequestHandler } from 'express'
import dbTools from '~/utils/dbTools'
import { ObjectID } from 'mongodb'
import _ from 'lodash'

interface RequestArgs {
  articleId: string
}

export default <RequestHandler>function(req, res){
  let reqArgs: RequestArgs = req.body
  
  let typeCheckWarnings = dbTools.typeChecker(reqArgs, { articleId: String })
  if(typeCheckWarnings) return res.json(typeCheckWarnings)
  
  dbTools.connectDB()
    .then(async db =>{
      let articleId = new ObjectID(reqArgs.articleId)
      let commentData = await db.collection('comment').find({ articleId, deleted: false }, { sort: { _id: -1 } }).toArray()
      let commentDataWithUserData = await Promise.all(
        commentData.map(async item =>{
          let userData = await db.collection('user').findOne({ _id: item.userId })
          return { ...item, userData: dbTools.trimUserData(userData!, 'account') }
        })
      )

      res.json(dbTools.responseData(commentDataWithUserData))
    })
    .catch(e =>{
      console.log(e)
      res.json(dbTools.responseData.error())
    })
}