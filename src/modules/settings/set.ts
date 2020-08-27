import { RequestHandler } from 'express'
import dbTools from '~/utils/dbTools'
import _ from 'lodash'

interface RequestArgs {
  bgImg: string
  title: string
  subtitle: string
}

export default <RequestHandler>function(req, res){
  const userToken = (<MyCookie>req.signedCookies).userToken
  let reqArgs: RequestArgs = req.body
  
  let typeCheckWarnings = dbTools.typeChecker(reqArgs, {
    bgImg: String,
    title: String,
    subtitle: String
  })
  if(typeCheckWarnings) return res.json(typeCheckWarnings)
  
  dbTools.connectDB()
    .then(async db =>{
      let userData = await db.collection('user').findOne({ token: userToken, deleted: false })
      if(!dbTools.isAdmin(userData)) return res.json(dbTools.responseData.error('权限错误', 401))

      await db.collection('settings').updateOne({}, { $set: _.pick(reqArgs, 'title', 'subtitle', 'bgImg') })
      res.json(dbTools.responseData())      
    })
    .catch(e =>{
      console.log(e)
      res.json(dbTools.responseData.error())
    })
}