import { RequestHandler } from 'express'
import dbTools from '~/utils/dbTools'

interface RequestArgs {
  
}

export default <RequestHandler>function(req, res){
  const userToken = (<MyCookie>req.signedCookies).userToken
  
  dbTools.connectDB()
    .then(async db =>{
      let userData = await db.collection('user').findOne({ token: userToken, deleted: false })
      if(!userData) return res.json(dbTools.responseData.error('账户无效', 401))

      let total = await db.collection('notification').find({ userId: userData._id, isChecked: false }).count()
      res.json(dbTools.responseData({ total }))
    })
    .catch(e =>{
      console.log(e)
      res.json(dbTools.responseData.error())
    })
}