import { RequestHandler } from 'express'

const originChecker = (...originPatterns: RegExp[]): RequestHandler => (req, res, next) =>{
  let origin = (req.headers.origin || req.headers.referer) as string
  if (req.headers.origin === undefined) {
    origin = origin.replace(/^(https?:\/\/.+?)\/.+$/, '$1')
  }

  if(
    originPatterns.some(pattern => pattern.test(origin))
  ) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }

  next()
} 

export default originChecker