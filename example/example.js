var mwcKernel = require('mwc_kernel');

var MWC = mwcKernel({
  'hostUrl':'http://vvv/msk0.ru/',
  'mongoUrl': 'mongodb://localhost/mwc_dev',
  'secret':'LalalaDai3Ryblya'
});

MWC.usePlugin(require('./../index.js'));

MWC.start();