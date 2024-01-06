// const path=require('path');
// //module.exports=path.dirname(process.mainModule.filename);
// module.exports = path.resolve(__dirname);
// //module.exports = path.resolve(path.join('../',__dirname)); 
// console.log(__dirname);

const path = require('path');

module.exports = path.dirname(path.resolve(__dirname));
