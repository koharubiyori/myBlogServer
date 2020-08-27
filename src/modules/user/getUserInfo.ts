import { RequestHandler } from 'express'
import dbTools from '~/utils/dbTools'
import _ from 'lodash'
import { adminAccount } from '~/config'

interface RequestArgs {
  
}

export default <RequestHandler>function(req, res){
  const userToken = (<MyCookie>req.signedCookies).userToken

  dbTools.connectDB()
    .then(async db =>{
      let userInfo = await db.collection('user').findOne({ token: userToken, deleted: false })
      if(!userInfo) return res.json(dbTools.responseData.error('账户无效', 401))
      ;(userInfo as any).isAdmin = userInfo.account.split('#')[1] === adminAccount
      res.json(dbTools.responseData(dbTools.trimUserData(userInfo)))
    })
    .catch(e =>{
      console.log(e)
      res.json(dbTools.responseData.error())
    })
}