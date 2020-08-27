import childProcess from 'child_process'
import schedule from 'node-schedule'
import path from 'path'

const scriptPath = path.resolve(__dirname, '../scripts/backup.js') 

schedule.scheduleJob('0 0 0 * * *', () => childProcess.execSync('node ' + scriptPath))