const config = require('../config');
const mkdirp = require('mkdirp');
const path = require('path');
const fs = require('fs');

exports.uploadFile = (file, filePath) => {
  return new Promise((resolve, reject) => {
    const reader = fs.createReadStream(file.path);
    const upStream = fs.createWriteStream(filePath); // 创建可写流
    // 对写入流进行事件监听
    // upStream.on('open', function () {
    //   console.log("open");
    // });
    // 流写入成功后调用的事件，在这里处理返回结果
    upStream.on('finish', function() {
      // console.log('finish');
      // 对图片计算md5值的，你也可以处理自己的逻辑，然后通过 resolve() 函数将处理的结果返回即可
      // const buf = fs.readFileSync(filePath);
      // const hash = md5(buf);
      resolve({ ok: true });
    });
    // upStream.on('close', function () {
    //   console.log("close");
    // });
    upStream.on('error', function(err) {
      // 有错误的话，在这个里面处理
      console.log('error', err);
      reject(err);
    });
    // 可读流通过管道写入可写流
    reader.pipe(upStream);
  });
};
