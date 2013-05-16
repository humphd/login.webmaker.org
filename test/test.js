var assert = require( 'assert' ),
    fork = require( 'child_process' ).fork,
    request = require( 'request' ),
    child,
    hostAuth = 'http://travis:travis@localhost:3000',
    hostNoAuth = 'http://localhost:3000';

function startServer( callback ) {
  // Spin-up the server as a child process
  child = fork( 'app.js', null, {} );
  child.on( 'message', function( msg ) {
    if ( msg === 'Started' ) {
      callback();
    }
  });
}

function stopServer() {
  child.kill();
}

describe( '/user routes', function() {

  var api = hostNoAuth + '/user',
      email = "test@testing.com";

  function postHelper( data, callback ) {
    request({
      url: api,
      method: 'post',
      json: data
    }, callback );
  }

  before( function( done ) {
    startServer( done );
  });

  after( function() {
    stopServer();
  });

  it( 'should error when missing required subdomain', function( done ) {
    postHelper({ email: email }, function( err, res, body ) {
      assert.ok( !err );
      assert.equal( res.statusCode, 404 );
      done();
    });
  });

  it( 'should create a new login with minimum required fields', function( done ) {
    var newUser = {
      "email": email,
      "subdomain": "subdomain",
      "fullName": "Test User"
    };

    postHelper( newUser, function( err, res, body ) {
      assert.ok( !err );
      assert.equal( res.statusCode, 200 );
      assert.equal( body.user._id, email );
      assert.equal( body.user.email, email );
      assert.equal( body.user.fullName, newUser.fullName );
      done();
    });
  });

});
