import { RequestHandler } from 'express'
import dbTools from '~/utils/dbTools'
import { ObjectID } from 'mongodb'
import { CollectionsData } from '~/@types/collections'

interface RequestArgs {
  name: string
  tagId?: string      // 有id为修改原有标签，没有为新建
}

export default <RequestHandler>function(req, res){
  const userToken = (<MyCookie>req.signedCookies).userToken
  let reqArgs: RequestArgs = req.body
  
  let typeCheckWarnings = dbTools.typeChecker(reqArgs, { name: String, tagId: '' })
  if(typeCheckWarnings) return res.json(typeCheckWarnings)
  
  dbTools.connectDB()
    .then(async db =>{
      let userData = await db.collection('user').findOne({ token: userToken, deleted: false })
      if(!dbTools.isAdmin(userData)) return res.json(dbTools.responseData.error('权限错误', 401))

      if(reqArgs.tagId){
        await db.collection('tag').updateOne({ _id: new ObjectID(reqArgs.tagId) }, { $set: { name: reqArgs.name } })
        res.json(dbTools.responseData())
      }else{
        let tagData: CollectionsData.Tag = {
          name: reqArgs.name,
          deleted: false
        }
        let insertResult = await db.collection('tag').insertOne(tagData)
        res.json(dbTools.responseData({ tagId: insertResult.insertedId }))
      }
    })
    .catch(e =>{
      console.log(e)
      res.json(dbTools.responseData.error())
    })
}