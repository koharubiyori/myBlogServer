import { CollectionsData } from "~/@types/collections"
import { MyDb } from "./connectDB"

export type WithUserData = <Data extends {}, KeyName extends string>(
  db: MyDb, 
  data: Data,
  findUserDataFilter: { [Key in keyof CollectionsData.User]?: CollectionsData.User[Key] }, 
  keyName: KeyName
) => Data & { [Key in KeyName]: Omit<CollectionsData.User, 'salt' | 'password' | 'token' | 'account'> }

export default <WithUserData>async function(db, data, findUserDataFilter, keyName){
  let userData = (await db.collection('user').findOne(findUserDataFilter, { projection: { salt: 0, password: 0, token: 0, account: 0 } }))

  return { ...data, [keyName]: userData }
}