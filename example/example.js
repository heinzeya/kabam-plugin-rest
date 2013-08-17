var mwcKernel = require('mwc_kernel');

var MWC = mwcKernel({
  'hostUrl': 'http://vvv.msk0.ru/',
  'mongoUrl': 'mongodb://localhost/mwc_dev',
  'secret': 'LalalaDai3Ryblya',
  'disableCsrf':true
});

MWC.extendModel('Cats', function (mongoose, config) {
  var CatsSchema = new mongoose.Schema({
    'nickname': String,
    'owner': mongoose.Schema.Types.ObjectId
  });

  CatsSchema.index({
    nickname: 1,
    owner: 1
  });

  CatsSchema.statics.getForUser = function (user, parameters, callback) {
    if (user && user._id) {
      //var query = this.find({'owner': user._id});
      var query = this.find();
      //todo - parameters

      query.exec(callback);
    } else {
      callback(null);
    }
  };
  CatsSchema.statics.canCreate = function (user) {
    return (user) ? true : false;
  };
  CatsSchema.methods.canRead = function (user) {
    return (user._id === this.owner);
  };
  CatsSchema.methods.canWrite = function (user) {
    return (user._id === this.owner);
  };
  return mongoose.model('cats', CatsSchema);
});

MWC.usePlugin(require('./../index.js'));
MWC.extendRoutes(function (core) {
  core.app.get('/', function (request, response) {
    if (request.user) {
      response.sendfile(__dirname + '/api.html');
    } else {
      response.sendfile(__dirname + '/index.html');
    }
  });
});

MWC.start();