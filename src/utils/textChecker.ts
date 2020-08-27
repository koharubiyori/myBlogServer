const checker = (regex: RegExp) => (text: string) => regex.test(text)
export default {
  account: checker(/^\w{8,16}$/),
  name: checker(/^[ぁ-んァ-ヶ\u4e00-\u9fa5\w\!@\$%\^&\*\(\)\[\]\{\}\|\\'":<>\/\?,\.~，。、；‘’“”【】｛｝\-=——\+ 　]{1,16}$/)
}