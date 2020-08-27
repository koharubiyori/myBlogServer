import { RequestHandler } from 'express'
import dbTools from '~/utils/dbTools'
import { CollectionsData } from '~/@types/collections'

interface RequestArgs {
  content: string
}

export default <RequestHandler>function(req, res){
  const userToken = (<MyCookie>req.signedCookies).userToken
  let reqArgs: RequestArgs = req.body
  
  let typeCheckWarnings = dbTools.typeChecker(reqArgs, { content: String })
  if(typeCheckWarnings) return res.json(typeCheckWarnings)
  
  dbTools.connectDB()
    .then(async db =>{
      let userData = await db.collection('user').findOne({ token: userToken, deleted: false })
      if(!dbTools.isAdmin(userData)) return res.json(dbTools.responseData.error('权限错误', 401))

      let katakotoData: CollectionsData.Katakoto = {
        content: reqArgs.content,
        deleted: false
      }
      await db.collection('katakoto').insertOne(katakotoData)
      res.json(dbTools.responseData())
    })
    .catch(e =>{
      console.log(e)
      res.json(dbTools.responseData.error())
    })
}