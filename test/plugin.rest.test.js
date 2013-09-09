var should = require('should'),
  KabamKernel = require('kabam-kernel'),
  request = require('request'),
  port = 3020;

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
                    var query = this.find({ 'owner': user._id });
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
                return (user._id.equals(this.owner));
            };
            CatSchema.methods.canWrite = function (user) {
                return (user._id.equals(this.owner));
            };
            return kabam.mongoConnection.model('cat', CatSchema);
        });

        MWC.usePlugin(require('./../index.js'));
        MWC.start(port);
    });
    describe('Testing create cat for this user', function () {
        var response,
        body,
        cat_id,
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
                    'url': 'http://localhost:' + port + '/api/rest/Cats?mwckey=' + userCreated.apiKey,
                    'method': 'POST',
                    'json': {
                        "nickname": "kitty",
                        "owner": userCreated._id
                    }
                },
                  function (err, r, b) {
                      if (err) {
                          throw err;
                      }
                      body = b;
                      response = r;
                      cat_id = b._id;
                      done();
                  });

            });
        });

        it('check cat nickname', function () {
            body.nickname.should.be.equal('kitty');
        });
        it('check proper response for it', function () {
            response.statusCode.should.be.equal(202);
        });

        describe('We can get users collection of cats with this cat in it', function () {
            var body,
                response;
            before(function (done) {
                request({
                    'url': 'http://localhost:' + port + '/api/rest/Cats?mwckey=' + user.apiKey,
                    'method': 'GET'
                },
                  function (err, r, b) {
                      if (err) {
                          throw err;
                      }
                      body = JSON.parse(b);
                      response = r;
                      done();
                  });
            });
            it('cat have nickname', function () {
                body[0].nickname.should.be.equal('kitty');
            });
            it('cat have proper owner _id', function () {
                body[0].owner.should.be.equal(user._id.toString());
            });

        });

        describe('We can get this cat by id ', function () {
            var body,
                response;
            before(function (done) {
                request({
                    'url': 'http://localhost:' + port + '/api/rest/Cats/' + cat_id + '?mwckey=' + user.apiKey,
                    'method': 'GET'
                },
                  function (err, r, b) {
                      if (err) {
                          throw err;
                      }
                      body = JSON.parse(b);
                      response = r;
                      done();
                  });
            });
            it('cat have nickname', function () {
                body.nickname.should.be.equal('kitty');
            });
            it('cat have proper owner _id', function () {
                body.owner.should.be.equal(user._id.toString());
            });
        });

        describe('We can rename cat by PUT request', function () {
            var body,
                response;
            before(function (done) {
                request({
                    'url': 'http://localhost:' + port + '/api/rest/Cats/' + cat_id + '?mwckey=' + user.apiKey,
                    'method': 'PUT',
                    'json': {
                        "nickname": "jjj"
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
            it('have proper response for it', function () {
                response.statusCode.should.be.equal(202);
            });
            it('cat have proper nickname', function () {
                body.nickname.should.be.equal('jjj');
            });
            it('cat have proper owner _id', function () {
                body.owner.should.be.equal(user._id.toString());
            });
        });

        describe('We can delete cat\'s record by DELETE request', function () {
            var body,
                response,
                isfound = true;
            before(function (done) {
                request({
                    'url': 'http://localhost:' + port + '/api/rest/Cats/' + cat_id + '?mwckey=' + user.apiKey,
                    'method': 'DELETE',
                    'json': {
                        "nickname": "jjj"
                    }
                },
                  function (err, r, b) {
                      if (err) {
                          throw err;
                      }
                      body = b;
                      response = r; console.log(b);
                      

                      MWC.model.Cats.findOne({ _id: cat_id }, function (err, objFound) {
                          if (err) {
                              throw err;
                          }
                          if (!objFound) isfound=false;
                          done();
                      });
                  });
            });
            it('have proper response for it', function () {
                response.statusCode.should.be.equal(200);
            });
            it('there is no cat record in /api/rest/cats', function () {
                isfound.should.be.false;
            });
        });


        after(function (done) {
            user.remove(done);            
        });
    });


    after(function (done) {
        MWC.stop();
        done();
    });
});