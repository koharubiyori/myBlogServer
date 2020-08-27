import { RequestHandler } from 'express'
import dbTools from '~/utils/dbTools'
import { ObjectID } from 'mongodb'
import _ from 'lodash'
import { CollectionsData } from '~/@types/collections'

interface RequestArgs {
  articleId?: string      // 传入文章id时，为修改文章
  title: string
  profile: string
  content: string
  tags: string[]
  headImg: string
  headImgPosition: number[]
  isTop: boolean
}

export default <RequestHandler>function(req, res){
  const userToken = (<MyCookie>req.signedCookies).userToken
  let reqArgs: RequestArgs = req.body

  let typeCheckWarnings = dbTools.typeChecker(reqArgs, {
    title: String,
    content: String,
    profile: String,
    tags: Array,
    headImg: String,
    headImgPosition: Array,
    isTop: Boolean
  })
  if(typeCheckWarnings) return res.json(typeCheckWarnings)

  dbTools.connectDB()
    .then(async db =>{
      let userData = await db.collection('user').findOne({ token: userToken, deleted: false })
      if(!dbTools.isAdmin(userData)) return res.json(dbTools.responseData.error('权限错误', 401))

      let articleId = new ObjectID
      if(reqArgs.articleId){
        articleId = new ObjectID(reqArgs.articleId)
      }

      let date = new Date
      let articleData: Partial<CollectionsData.Article> = {
        ..._.pick(reqArgs, 'articleId', 'title', 'profile', 'content', 'tags', 'headImg', 'headImgPosition', 'isTop'),
        updatedAt: date,
        ...(reqArgs.articleId ? {} : { 
          readNum: 0, 
          deleted: false, 
          createdYear: date.getFullYear(), 
          createdMonth: date.getMonth() + 1,
        })
      }

      await db.collection('article').updateOne({ _id: articleId }, { $set: articleData }, { upsert: true })
      res.json(dbTools.responseData())
    })
    .catch(e =>{
      console.log(e)
      res.json(dbTools.responseData.error())
    })
}