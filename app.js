// app.js

// 開発に必要なパッケージライブラリをロード
var cfenv = require( 'cfenv' );               // 実行環境における空きポート番号を動的に見つけてくれる
var express = require( 'express' );           // Express フレームワーク
var bodyParser = require( 'body-parser' );    // 送信データの取得用
var request = require( 'request' );
var SpotifyWebApi = require( 'spotify-web-api-node' );

var settings = require( './settings' );

var app = express();

// cfenv を使ってアプリケーションの環境を取得
var appEnv = cfenv.getAppEnv();

var spotifyApi = new SpotifyWebApi();
getAccessToken().then( function( token ){
  spotifyApi.setAccessToken( token );
});

// body-parser の挙動を設定
app.use( bodyParser.urlencoded() );
app.use( bodyParser.json() );

// HTML などの静的ファイルは public/ フォルダ以下に用意する
app.use( express.static( __dirname + '/public' ) );

// ejs テンプレートファイルは templates/ フォルダ以下に用意する
app.set( 'views', __dirname + '/template' );
app.set( 'view engine', 'ejs' );

// GET / ハンドラ
app.get( '/', function( req, res ){
  res.render( 'index', { name: 'K.Kimura' } );
});


app.get( '/artists/:id', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  var id = req.params.id;
  var limit = req.query.limit ? parseInt( req.query.limit ) : 10;
  var offset = req.query.offset ? parseInt( req.query.offset ) : 0;

  if( spotifyApi && id ){
    spotifyApi.getArtistAlbums( id, { limit: limit, offset: offset }, function( err0, body0 ){
      if( err0 ){
        console.log( err0 );
        res.status( 400 );
        res.write( JSON.stringify( { status: false, result: err0 }, 2, null ) );
        res.end();
      }else{
        console.log( body0 );
        res.write( JSON.stringify( { status: true, result: body0 }, 2, null ) );
        res.end();
      }
    });
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, result: 'No access_token and/or id provided.' }, 2, null ) );
    res.end();
  }
});

app.get( '/searchTracks', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  var keyword = req.query.keyword;
  var limit = req.query.limit ? parseInt( req.query.limit ) : 10;
  var offset = req.query.offset ? parseInt( req.query.offset ) : 0;

  if( spotifyApi && keyword ){
    spotifyApi.searchTracks( keyword, { limit: limit, offset: offset }, function( err0, body0 ){
      if( err0 ){
        console.log( err0 );
        res.status( 400 );
        res.write( JSON.stringify( { status: false, result: err0 }, 2, null ) );
        res.end();
      }else{
        console.log( body0 );
        res.write( JSON.stringify( { status: true, result: body0 }, 2, null ) );
        res.end();
      }
    });
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, result: 'No access_token and/or keyword provided.' }, 2, null ) );
    res.end();
  }
});

app.get( '/searchArtists', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  var keyword = req.query.keyword;
  var limit = req.query.limit ? parseInt( req.query.limit ) : 10;
  var offset = req.query.offset ? parseInt( req.query.offset ) : 0;

  if( spotifyApi && keyword ){
    spotifyApi.searchArtists( keyword, { limit: limit, offset: offset }, function( err0, body0 ){
      if( err0 ){
        console.log( err0 );
        res.status( 400 );
        res.write( JSON.stringify( { status: false, result: err0 }, 2, null ) );
        res.end();
      }else{
        console.log( body0 );
        res.write( JSON.stringify( { status: true, result: body0 }, 2, null ) );
        res.end();
      }
    });
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, result: 'No access_token and/or keyword provided.' }, 2, null ) );
    res.end();
  }
});


function getAccessToken(){
  return new Promise( function( resolve, reject ){
    var b64 = ( new Buffer( settings.client_id + ':' + settings.client_secret, 'ascii' ) ).toString( 'base64' );
    console.log( 'b64 = ' + b64 );
    var data = { grant_type: 'client_credentials' };
    var option = {
      url: 'https://accounts.spotify.com/api/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + b64
      },
      json: true,
      form: data
    };
    request( option, ( err, res, body ) => {
      if( err ){
        console.log( err );
        reject( null );
      }else{
        console.log( body );
        resolve( body.access_token );
      }
    });
  });
}


// 待ち受けポート番号を決定してスタート
var port = appEnv.port || 3000;
app.listen( port );
console.log( 'server started on ' + port );
