import 'module-alias/register'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express from 'express'
import session from 'express-session'
import { port } from './config'
import logger from './middlewares/logger'
import originChecker from './middlewares/originChecker'
import tokenChecker from './middlewares/tokenChecker'
import addRoutes, { baseUrl } from './routes'

// 初始化全局变量
global._rootPath = __dirname
global._DEV = false

const app = express()
  .use(cookieParser('secret'))
  .use(bodyParser.json())
  .use(logger())
  .use(session({ 
    secret: 'koharubiyori', 
    cookie: { 
      maxAge: 1000 * 60 * 10,
      domain: 'koharu.top' 
    },
    resave: true,
    saveUninitialized: false
  }))
  .use(originChecker(
    /^https?:\/\/koharu\.top$/,
    /^http:\/\/localhost:\d+$/
  ))
  .use(tokenChecker(
    baseUrl +  '/user/register',
    baseUrl + '/user/login',
    baseUrl + '/user/getRegisterCaptcha'
  ))
  .use((req, res, next) =>{
    // 参数统一放到body上
    if(req.method === 'GET') req.body = req.query

    // 允许跨域设置cookie
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    next()
  })
app.set('env', 'production')    // 使抛出错误时响应中不输出具体错误信息
// 全局捕获框架请求回调中抛出的错误，不知道为什么无效
// app.use(function (err: any, req: any, res: any, next: any) {
//   console.error(err.stack)
//   res.status(500).send('Something broke!')
// })

addRoutes(app)

console.log('启动服务...')
app.listen(port, () =>{
  console.log(`服务正在运行于：http://localhost:${port}`)
})