import 'module-alias/register'
import childProcess from 'child_process'
import fs from 'fs'
import path from 'path'

const backupLogFilePath = path.resolve(__dirname, '../logs/backup.log') 

childProcess.exec('mongodump --uri mongodb://chino:c2effc49-d469-4a46-859d-93a404d27318@127.0.0.1:19901 --out /var/db_backup --gzip', (err, stdout, stderr) =>{
    if(err) console.log(err)
    console.log(stdout)
    console.log(stderr)
    fs.open(backupLogFilePath, 'a+', (err, fd) =>{
      if(err) return console.log(err)
      let record = new Date().toUTCString() + ':\n' + stderr + '\n'
      fs.write(fd, record, err => err && console.log(err))
    })   
  })