import multer from 'multer'
import md5 from 'md5'
import uuid from 'uuid'
import { RequestHandler } from 'express'
import dbTools from './dbTools'

function createUploader({ 
  dirName, 
  mimeTypes = ['image/jpeg', 'image/png', 'image/jpg'], 
  sizeLimit = 3
}: {
  dirName: string
  mimeTypes?: string[]
  sizeLimit?: number
}){
  let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, _rootPath + '/web/uploads/' + dirName),
    filename (req, file, cb) {
      if(!file) return cb(new ReferenceError('未上传文件'), '')
      let originalName: string = (file as any).originalname
      let [, fileName, fileType] = originalName.match(/^(.+)\.(.+)$/) as Array<string>
      let md5Msg = md5(originalName + uuid.v1())
      cb(null, md5Msg + '.' + fileType)
    }
  })

  return multer({ 
    storage, 
    limits: { fileSize: 1024 * 1024 * sizeLimit },
    fileFilter: (req, file, cb) =>{
      let typeCheckResult = mimeTypes.includes(file.mimetype)
      if(!typeCheckResult) (req as any).params = { _fileUploadError: 'type' }
      cb(null, typeCheckResult)
    },
  }).single('file')
}

createUploader.createSimpleRequestHandler = function(dirName: string){
  return <RequestHandler>function(req, res, next){
    switch(req.params._fileUploadError){
      case 'type': {
        res.json(dbTools.responseData.error('上传内容类型错误', 400))
        break
      }
      
      default: {
        if(!req.file) res.json(dbTools.responseData.error('没有上传任何文件', 400))
        res.json(dbTools.responseData({ fileUrl: `/uploads/${dirName}/${req.file.filename}` }))
      }
    }
  }
}

export default createUploader