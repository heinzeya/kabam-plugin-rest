mwc_plugin_rest
=================

Rest interface for mongoose models of [kabam-kernel](https://github.com/mykabam/kabam-kernel)

This is classical REST interface - [http://docs.mykabam.apiary.io/#kabampluginrest](http://docs.mykabam.apiary.io/#kabampluginrest)

Example
=================
[https://github.com/mykabam/kabam-plugin-rest/blob/master/example/example.js](https://github.com/mykabam/kabam-plugin-rest/blob/master/example/example.js)

Configuration
=================
Access control list is defined in model. For kabam mongoose model to be compatible with this plugin, it have to expose 2 statics functions and 2 methods.

```javascript

    CatsSchema.statics.getForUser = function (user, parameters, callback) {
      if (user && user._id) {
        var query = this.find({'owner': user._id});
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

```

Function `statics.getForUser` is called against current authorized by passportJS frameworks user
(practically, `request.user` in controller) to generate and return by callback the collection items this user can read.
In our example, it returns the cats, that have this user as a owner.
This function covers this route - `GET /api/route/cats`

Function `statics.canCreate`  is called against current authorized by passportJS frameworks user
(practically, `request.user` in controller). If it returns true, user can create new cats. In our example, it returns
true, if user is authorized, it means, that everybody can create a cat document for himself/herself
This function covers this route - `POST /api/route/cats`

Function `statics.canRead`  is called against current authorized by passportJS frameworks user
(practically, `request.user` in controller). If it returns true, user can read information about this object. In our example, it returns
true, if user is authorized and is owner of the cat.
This function covers this route - `GET /api/route/cats/:id`

Function `statics.canWrite`  is called against current authorized by passportJS frameworks user
(practically, `request.user` in controller). If it returns true, user can edit information about this object. In our example, it returns
true, if user is authorized and is owner of the cat.
This function covers this routes - `PUT /api/route/cats/:id` and `DELETE /api/route/cats/:id`


Disclaimer
=================
Under development.
Example do not works, API works!


Test
=================
Will be created, shortly!
