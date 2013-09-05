var should = require('should'),
  KabamKernel = require('kabam-kernel'),
  request = require('request'),
  port = 3019;

describe('kabam-plugin-rest test', function () {
    var MWC;
    before(function (done) {

        MWC = KabamKernel({
            'hostUrl': 'http://localhost:' + port,
            'mongoUrl': 'mongodb://localhost/mwc_dev',
            'secret': 'LalalaDai3Ryblya',
            'disableCsrf': true // NEVER DO IT!
        });

        MWC.on('started', function (evnt) {
            done();
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
        MWC.start(port);
    });
    describe('Testing create cat for this user', function () {
        var response,
        body,
        user;
        before(function (done) {
            MWC.model.User.create({
                'email': 'emailForNewUser@example.org',
                'profileComplete': false
            }, function (err, userCreated) {
                if (err) {
                    throw err;
                }
                user = userCreated;
                request({
                    'url': 'http://localhost:3019/api/rest/Cats?mwckey=' + userCreated.apiKey,
                    'method': 'POST',
                    'json': {
                        "nickname": "kitty"
                    }
                },
                  function (err, r, b) {
                      if (err) {
                          throw err;
                      }
                      body = b;
                      response = r;
                      done();
                  });

            });
        });

        it('check cat nickname', function () {
            body.nickname.should.be.equal('kitty');
        });
        it('check proper response for it', function() {
            response.statusCode.should.be.equal(202);
        });

        describe('We can get users collection of cats with this cat in it',function(){
          it('have to be done');
          it('cat have proper nickname');
          it('cat have proper _id');

        });

      describe('We can get this cat by id ',function(){
        it('have to be done');
        it('cat have proper nickname');
        it('cat have proper _id');
      });

      describe('We can rename cat by PUT request',function(){
        it('have to be done');
        it('have proper response');
        it('cat have proper nickname');
        it('cat have proper _id');
      });

      describe('We can delete cat\'s record by DELETE request',function(){
        it('have to be done');
        it('have proper response');
        it('there is no cat record in /api/rest/cats');
      });


      after(function (done) {
            user.remove(done);
            MWC.model.Cats.remove({ nickname: 'kitty' }, function (err) {
                if (err) {
                    throw err;
                }
            });
        });
    });


    after(function (done) {
        MWC.stop();
        done();
    });
});