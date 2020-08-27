import { RequestHandler } from 'express'
import dbTools from '~/utils/dbTools'
import md5 from 'md5'
import _ from 'lodash'
import { adminAccount } from '~/config'

interface RequestArgs {
  accountOrName: string
  password: string
}

export default <RequestHandler>function(req, res){
  let reqArgs: RequestArgs = req.body

  let typeCheckWarnings = dbTools.typeChecker(reqArgs, {
    accountOrName: String,
    password: String
  })
  if(typeCheckWarnings) return res.json(typeCheckWarnings)

  dbTools.connectDB()
    .then(async db =>{
      let userInfo = await db.collection('user').findOne({
        $or: [
          { account: '#' + reqArgs.accountOrName },
          { name: reqArgs.accountOrName }
        ],

        deleted: false
      })

      if(!userInfo) return res.json(dbTools.responseData.error('帐号不存在'))
      if(userInfo.password === md5(reqArgs.password + userInfo.salt)){
        userInfo.account = _.trimStart(userInfo.account, '#')
        res.cookie('userToken', userInfo.token, { 
          maxAge: 1000 * 60 * 60 * 24 * 365,
          signed: true,
          domain: 'koharu.top'
        })

        ;(userInfo as any).isAdmin = userInfo.account === adminAccount
        res.json(dbTools.responseData(dbTools.trimUserData(userInfo)))
      }else{
        res.json(dbTools.responseData.error('帐号或密码错误'))
      }
    })
    .catch(e =>{
      console.log(e)
      res.json(dbTools.responseData.error())
    })
}