import { RequestHandler } from 'express'
import moment from 'moment'

const logger = (...blackList: RegExp[]): RequestHandler => (req, res, next) =>{
  const { url, method, query, body } = req

  if (blackList.some(regex => regex.test(url)) === false) {
    const time = moment().format('YYYY年MM月DD日 HH:mm:ss')
    console.log('------------------------------------------')
    console.log(`${time} 以 ${method} 方式收到请求链接：${url}`)
    if (body instanceof ArrayBuffer === false) {
      console.log(`参数为：${JSON.stringify(method === 'GET' ? query : body)}`)
    }
  }

  next()
} 

export default logger