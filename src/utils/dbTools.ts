import { adminAccount } from '~/config'
import _ from 'lodash'
import { CollectionsData } from '~/@types/collections'
import connectDB from './connectDB'

// 构造响应数据
function responseData(
  data = {}, 
  result = true,
  message = '请求成功',
  status = 200
){
  if(!result && status === 200) status = 500
  return { data, result, message, status }
}

responseData.error = (message = '服务器酱好像被玩坏了的样子...', status = 500) => ({ message, status, result: false })

// 检查类型，传入构造器表示必填，传入实例为选填
type BaseConstructor = ObjectConstructor | ArrayConstructor | StringConstructor | NumberConstructor | BooleanConstructor
type Base = object | [] | string | number | boolean
function typeChecker<T extends { [key: string]: any }>(
  requestArgs: T, 
  pattern: { [K in keyof T]: BaseConstructor | Base }
){
  let warningWords = []
  for(let key in pattern){
    let ptnType = pattern[key]
    let isRequired = [Object, Array, String, Number, Boolean].includes(<any>ptnType)

    if(isRequired){
      if(key in requestArgs){
        let argType = requestArgs[key].constructor
        argType !== ptnType && warningWords.push(`参数"${key}"期望得到"${(<BaseConstructor>ptnType).name}"类型，实际却得到"${argType.name}"类型`)
      }else{
        warningWords.push(`缺少参数：${key}`)
      }
    }else if(requestArgs[key]){
      let argType = requestArgs[key].constructor
      ptnType = (<Base>ptnType).constructor
      argType !== ptnType && warningWords.push(`参数"${key}"期望得到"${(<BaseConstructor>ptnType).name}"类型，实际却得到"${argType.name}"类型`)
    }
  }

  // 一些情况是需要传入空字符串的，这里暂时注释
  // 筛选出pattern中requestArgs有的字段名
  // if(warningWords.length === 0) return _emptyChecker(requestArgs, ...Object.keys(_.pick(pattern, Object.keys(requestArgs))))
  // else return {
  //   message: warningWords,
  //   status: 400,
  //   result: false
  // }

  return warningWords.length === 0 ? null : {
    message: warningWords,
    status: 400,
    result: false
  }
}

// 检查空值，本来是暴露出去的，在使用中发现参数和typeChecker大量重叠，为方便使用直接并入typeChecker
// function _emptyChecker<T extends { [key: string]: any }>(
//   requestArgs: T, 
//   ...shouldCheckArgs: (keyof T)[]
// ){
//   let warningWord = shouldCheckArgs
//     .filter(argName => requestArgs[argName].toString().trim() === '')
//     .join('、')

//   return warningWord === '' ? null : {
//     message: `参数：${warningWord} 不能为空`,
//     status: 400,
//     result: false
//   }
// }

function dateObjToStr(date: Date){
  let month = date.getMonth() + 1
  const foo = (val: number) => val > 9 ? val.toString() : '0' + val
  return `${date.getFullYear()}-${foo(month)}-${foo(date.getDate())} ${foo(date.getHours())}:${foo(date.getMinutes())}:${foo(date.getSeconds())}`
}

function isAdmin(userData: CollectionsData.User | null){
  return !!(userData && userData.account === ('#' + adminAccount))
}

function toTypes<
  T extends { [key: string]: string | undefined | null }, 
  Types extends { [K in keyof T]: StringConstructor | NumberConstructor | BooleanConstructor }
>(
  requestArgs: T,
  types: Types,
){
  let typedGetRequestArgs: any = {}

  for(let key in types){
    if(typeof requestArgs[key] !== 'string'){ continue }
    if(types[key] === Number){
      typedGetRequestArgs[key] = parseInt(<string>requestArgs[key])
    }
    if(types[key] === Boolean){
      typedGetRequestArgs[key] = requestArgs[key] === 'true'
    }
    if(types[key] === String){
      typedGetRequestArgs[key] = requestArgs[key]
    }
  }

  return typedGetRequestArgs
}

function trimUserData(data: CollectionsData.User, ...dropProperty: (keyof CollectionsData.User)[]){
  let copyData = { ...data }
  copyData.account = _.trimStart(data.account, '#')
  return _.omit(copyData, 'salt', 'password', 'token', ...dropProperty)
}

export default { connectDB, responseData, typeChecker, dateObjToStr, isAdmin, toTypes, trimUserData }