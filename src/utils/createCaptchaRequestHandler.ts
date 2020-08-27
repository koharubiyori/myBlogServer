import { RequestHandler } from 'express'
import svgCaptcha from 'svg-captcha'
import dbTools from '~/utils/dbTools'

const createCaptchaRequestHandler = (sessionName: string): RequestHandler => (req, res) =>{
  let captcha = svgCaptcha.create()
  ;(<MySession>req.session)[sessionName] = captcha.text
  res.json(dbTools.responseData({ svg: captcha.data }))
}

export default createCaptchaRequestHandler