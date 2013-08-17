exports.name = 'mwc_plugin_rest';

exports.routes = function (mwc) {
  mwc.app.get(/^\/api\/rest\/([a-zA-Z0-9_]+)$/, function (request, response) {
    var modelName = request.params[0];

    if (request.model[modelName]) {
      if (request.user) {
        request.model[modelName].getForUser(request.user, {}, function (err, documents) {
          if (err) {
            throw err;
          } else {
            response.json(documents);
          }
        });
      } else {
        response.send(400);
      }
    } else {
      response.send(404);
    }
  });

  mwc.app.post(/^\/api\/rest\/([a-zA-Z0-9_]+)\/?$/, function (request, response) {
    var modelName = request.params[0];
    if (request.model[modelName]) {
      if (request.user) {
        if (request.model[modelName].canCreate(request.user)) {
          request.model[modelName].create(request.body, function (err, objCreated) {
            if (err) {
              throw err;
            }
            if (request.is('json')) {
              if (objCreated) {
                response.status(202);
                response.json(objCreated);
              } else {
                response.send(400);
              }
            } else {
              if (objCreated) {
                request.flash('success', 'Object created!');
                response.redirect('back');
              } else {
                request.flash('error', 'Unable to create object!');
                response.redirect('back');
              }
            }
          });
        } else {
          response.send(403);
        }
      } else {
        response.send(400);
      }
    } else {
      response.send(404);
    }
  });

  mwc.app.get(/^\/api\/rest\/([a-zA-Z0-9_]+)\/([a-zA-Z0-9_]+)$/, function (request, response) {
    //response.send('Show one item from collection of ' + request.params[0] + ' with id of  ' + request.params[1]);
    var modelName = request.params[0];
    if (request.model[modelName]) {
      if (request.user) {
        request.model[modelName].findOne({'_id': request.params[1]}, function (err, objectFound) {
          if (err) {
            throw err;
          }
          if (objectFound) {
            if (objectFound.canRead(request.user)) {
              response.json(200, objectFound);
            } else {
              response.send(403);
            }
          } else {
            response(404);
          }
        });
      } else {
        response.send(403);
      }
    }
    else {
      response.send(404);
    }
  });

  mwc.app.put(/^\/api\/rest\/([a-zA-Z0-9_]+)\/([a-zA-Z0-9_]+)$/, function (request, response) {
    //response.send('Update one item from collection of ' + request.params[0] + ' with id of  ' + request.params[1]);
    var modelName = request.params[0];
    if (request.model[modelName]) {
      if (request.user) {
        request.model[modelName].findOne(request.params[1], function (err, objFound) {
          if (err) {
            throw err;
          }
          if (objFound) {
            if (objFound.canWrite(request.user)) {
              for (var x in request.body) {
                if (objFound.hasOwnProperty(x)) {
                  objFound[x] = request.body[x];
                }
              }
              objFound.save(function (err) {
                if (err) {
                  response.json(400, {'Error updating - validation fail': err.message});
                } else {
                  response.json(202, objFound);
                }
              });
            } else {
              response.send(403);
            }
          } else {
            response.send(404);
          }
        });
      } else {
        response.send(400);
      }
    }
    else {
      response.send(404);
    }
  });

  mwc.app.delete(/^\/api\/rest\/([a-zA-Z0-9_]+)\/([a-zA-Z0-9_]+)$/, function (request, response) {
    //response.send('Delete one item from collection of ' + request.params[0] + ' with id of  ' + request.params[1]);
    var modelName = request.params[0];
    if (request.model[modelName]) {
      if (request.user) {
        request.model[modelName].findOne(request.params[1], function (err, objFound) {
          if (err) {
            throw err;
          }
          if (objFound) {
            if (objFound.canWrite(request.user)) {
              objFound.remove(function (err) {
                if (err) {
                  response.json(500, {'Error deleting': err.message});
                } else {
                  response.json(202);
                }
              });
            } else {
              response.send(403);
            }
          } else {
            response.send(404);
          }
        });
      } else {
        response.send(400);
      }
    }
    else {
      response.send(404);
    }
  });

};
