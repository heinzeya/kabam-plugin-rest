var mwcKernel = require('kabam-kernel');

var MWC = mwcKernel({
  'hostUrl': 'http://vvv.msk0.ru/',
  'mongoUrl': 'mongodb://localhost/mwc_dev',
  'secret': 'LalalaDai3Ryblya',
  'disableCsrf':true
});

MWC.extendModel('Cats', function (kabam) {
  var CatSchema = new kabam.mongoose.Schema({
    'nickname': String,
    'owner': kabam.mongoose.Schema.Types.ObjectId
  });

  CatSchema.index({
    nickname: 1,
    owner: 1
  });

  CatSchema.statics.getForUser = function (user, parameters, callback) {
    if (user && user._id) {
      var query = this.find({'owner': user._id});
      //var query = this.find();
      //todo - parameters

      query.exec(callback);
    } else {
      callback(null);
    }
  };
  CatSchema.statics.canCreate = function (user) {
    return (user) ? true : false;
  };
  CatSchema.methods.canRead = function (user) {
    return (user._id === this.owner);
  };
  CatSchema.methods.canWrite = function (user) {
    return (user._id === this.owner);
  };
  return kabam.mongoConnection.model('cat', CatSchema);
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