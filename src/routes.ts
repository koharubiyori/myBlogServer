import { Express } from 'express'
import createCaptchaRequestHandler from '~/utils/createCaptchaRequestHandler'
import * as common from './modules/common'
import * as user from './modules/user'
import * as notification from './modules/notification'
import * as article from './modules/article'
import * as comment from './modules/comment'
import * as katakoto from './modules/katakoto'
import * as tag from './modules/tag'
import * as settings from './modules/settings'

export const baseUrl = '/blog'

let prefixCache = ''
const p = (name: string, prefix?: string) =>{
  if(prefix) prefixCache = prefix
  return baseUrl + prefixCache + '/' + name
} 

export default function(app: Express){
  // common
  app.get(p('getTheme', '/common'), common.getTheme)
  
  // user
  app.get(p('getUserInfo', '/user'), user.getUserInfo)
  app.post(p('getRegisterCaptcha'), createCaptchaRequestHandler('registerCaptcha'))
  app.post(p('register'), user.register)
  app.post(p('login'), user.login)
  app.post(p('setUserInfo'), user.setUserInfo)
  // app.post(p('uploadAvatar'), createUploader({ dirName: 'userAvatar' }), createUploader.createSimpleRequestHandler('userAvatar'))

  // notification
  app.get(p('load', '/notification'), notification.load)
  app.get(p('getUncheckedTotal'), notification.getUncheckedTotal)
  app.post(p('check'), notification.check)

  // article
  app.get(p('get', '/article'), article.get)
  app.get(p('search'), article.search)
  app.get(p('searchByTag'), article.searchByTag)
  app.get(p('searchTop'), article.searchTop)
  app.get(p('searchRandom'), article.searchRandom)
  app.get(p('searchHot'), article.searchHot)
  app.get(p('searchByUserCollect'), article.searchByUserCollect)
  app.get(p('getCollectStatus'), article.getCollectStatus)
  app.post(p('publish'), article.publish)
  app.post(p('delete'), article.delete)
  app.post(p('setCollectStatus'), article.setCollectStatus)
  // app.post(p('uploadImg'), createUploader({ 
  //   dirName: 'articleImg', 
  //   sizeLimit: 5, 
  //   mimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'] 
    
  // }), createUploader.createSimpleRequestHandler('articleImg'))
  // app.post(p('uploadHeadImg'), createUploader({ 
  //   dirName: 'articleHeadImg', 
  //   sizeLimit: 5 
  // }), createUploader.createSimpleRequestHandler('articleHeadImg'))

  // tag
  app.get(p('getAll', '/tag'), tag.getAll)
  app.post(p('set'), tag.set)
  app.post(p('delete'), tag.delete)

  // comment
  app.post(p('post', '/comment'), comment.post)
  app.post(p('delete'), comment.delete)
  app.get(p('get'), comment.get)

  // katakoto
  app.get(p('load', '/katakoto'), katakoto.load)
  app.post(p('add'), katakoto.add)
  app.post(p('delete'), katakoto.delete)

  // settings
  app.get(p('get', '/settings'), settings.get)
  app.post(p('set'), settings.set)
  // app.post(p('uploadBgImg'), createUploader({
  //   dirName: 'bgImg',
  //   sizeLimit: 10
  // }), createUploader.createSimpleRequestHandler('bgImg'))

  app.options('/*', (req, res) => {
    res.status(200)
    res.writeHead(200, {
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type,token',
      'Access-Control-Allow-Credentials': 'true'
    })
    res.end()
  })
}


