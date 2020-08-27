import { RequestHandler } from 'express'
import dbTools from '~/utils/dbTools'
import { adminAccount } from '~/config'

interface RequestArgs {
  
}

export default <RequestHandler>function(req, res){
  
  
  dbTools.connectDB()
    .then(async db =>{
      let avatarUrl = await db.collection('user').findOne({ account: '#' + adminAccount }, { projection: { _id: 0, avatar: 1 } })
      res.json(dbTools.responseData(avatarUrl || {}))
    })
    .catch(e =>{
      console.log(e)
      res.json(dbTools.responseData.error())
    })
}