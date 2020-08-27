import { RequestHandler } from 'express'
import textChecker from '~/utils/textChecker'
import dbTools from '~/utils/dbTools'

interface RequestArgs {
  name?: string
  avatar?: string
}

export default <RequestHandler>function(req, res){
  const userToken = req.signedCookies.userToken
  let reqArgs: RequestArgs = req.body
  let {name, avatar} = reqArgs

  if(typeof name === 'string'){
    if(!textChecker.name(name)) return res.json(dbTools.responseData.error('用户名格式有误', 400))
  }

  if(name || avatar){
    dbTools.connectDB()
      .then(async db =>{
        if(name){
          let userData = await db.collection('user').findOne({ name })
          if(userData && userData.token !== userToken) return res.json(dbTools.responseData.error('昵称已存在', 403))
        }

        await db.collection('user').updateOne({ token: userToken, deleted: false }, {
          $set: <RequestArgs>{
            ...(name ? { name } : {}),
            ...(avatar ? { avatar } : {})
          }
        })

        res.json(dbTools.responseData())
      })
      .catch(e =>{
        console.log(e)
        res.json(dbTools.responseData.error())
      })
  }else{
    res.json(dbTools.responseData.error('没有传入任何参数', 400))
  }
}