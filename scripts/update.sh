zipName='dist.zip'
webDirPath='./dist/web/view'

if [ ! -d './dist' ]; then
  echo '请先执行yarn build！'
  exit 0
fi

if [ ! -d './dist/web' ];then
  mkdir -p './dist/web/view'
  mkdir -p './dist/web/uploads'
fi

if [ -f $zipName ];then rm $zipName; fi
if [ -d $webDirPath ];then rm $webDirPath -r; fi
rz

if [ -f $zipName ];then
  unzip $zipName -d $webDirPath
else
  echo "请上传名为“${zipName}”的压缩包文件！"
fi