import { RequestHandler } from 'express'
import dbTools from '~/utils/dbTools'
import { CollectionsData } from '~/@types/collections'

interface RequestArgs {

}

export default <RequestHandler>function(req, res){
  dbTools.connectDB()
    .then(async db =>{
      let settingsData = await db.collection('settings').findOne({})
      if(!settingsData){
        let settings: CollectionsData.Settings = {
          title: '小春日和の秘密基地',
          subtitle: 'あしたもこはるびよりはずなんです',
          bgImg: ''
        }
        
        db.collection('settings').insertOne(settings)
        return res.json(dbTools.responseData(settings))
      }
      
      res.json(dbTools.responseData(settingsData))      
    })
    .catch(e =>{
      console.log(e)
      res.json(dbTools.responseData.error())
    })
}