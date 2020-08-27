import { RequestHandler } from 'express'
import dbTools from '~/utils/dbTools'

interface RequestArgs {
  
}

export default <RequestHandler>function(req, res){
  dbTools.connectDB()
    .then(async db =>{
      let tagList = await db.collection('tag').find({ deleted: false }).toArray()
      res.json(dbTools.responseData(tagList))
    })
    .catch(e =>{
      console.log(e)
      res.json(dbTools.responseData.error())
    })
}