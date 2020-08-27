import { RequestHandler } from 'express'
import _ from 'lodash'
import md5 from 'md5'
import dbTools from '~/utils/dbTools'
import textChecker from '~/utils/textChecker'
import { CollectionsData } from '~/@types/collections'

interface RequestArgs {
  account: string
  name: string
  password: string
  code: string
}

function createSalt (){
  var digits = ('0123456789!@#$%^&*()abcdefg').split('')
  return _.fill(new Array(10), 0).map(() => digits[_.random(0, digits.length - 1)]).join('')
}

export default <RequestHandler>function(req, res){
  let reqArgs: RequestArgs = req.body

  let session = req.session as MySession
  console.log(JSON.stringify(session))
  if(!session.registerCaptcha && !_DEV){
    return res.json(dbTools.responseData.error('验证码已过期，请再次获取', 403))
  }

  let typeCheckWarnings = dbTools.typeChecker(reqArgs, {
    account: String,
    name: String,
    password: String,
    code: String
  })
  if(typeCheckWarnings) return res.json(typeCheckWarnings)

  if(!textChecker.account(reqArgs.account)) return res.json(dbTools.responseData.error('帐号格式有误', 400))
  if(!textChecker.name(reqArgs.name)) return res.json(dbTools.responseData.error('用户名格式有误', 400))

  if((reqArgs.code.toLowerCase() !== (<string>session.registerCaptcha).toLowerCase()) && !_DEV){
    return res.json(dbTools.responseData.error('请输入正确的验证码', 400))
  }
  
  dbTools.connectDB()
    .then(async db =>{
      let accountFindResult = await db.collection('user').findOne({ account: '#' + reqArgs.account })
      let nameFindResult = await db.collection('user').findOne({ name: reqArgs.name })

      if(!accountFindResult && !nameFindResult){
        const salt = createSalt()
        const password = md5(reqArgs.password + salt)
        let userData: CollectionsData.User = {
          // 在帐号前统一加上#号，且帐号和昵称中都不允许使用#号，以此实现登录时输入帐号或昵称都可以进行登录
          account: '#' + reqArgs.account,
          name: reqArgs.name,
          avatar: '',
          token: md5(reqArgs.account + password),
          deleted: false,
          password,
          salt
        }
        await db.collection('user').insertOne(userData)
        
        res.json(dbTools.responseData())
      }else{
        res.json(dbTools.responseData.error(`${accountFindResult ? '帐号' : '用户名'}已存在`, 403))
      }
    })
    .catch(e =>{
      console.log(e)
      res.json(dbTools.responseData.error())
    })
}