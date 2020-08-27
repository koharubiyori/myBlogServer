import { RequestHandler } from 'express'
import dbTools from '~/utils/dbTools'

const tokenChecker = (...exclude: string[]): RequestHandler => (req, res, next) =>{
  console.log(exclude, exclude.includes(req.path))
  if(req.method === 'POST' && !exclude.includes(req.path)){
    const userToken = (<MyCookie>req.signedCookies).userToken
    if(!userToken) return res.json(dbTools.responseData.error('缺少用户凭证', 401))
  }

  next()
} 

export default tokenChecker