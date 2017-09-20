/* ഓം ബ്രഹ്മാർപ്പണം. */

/*
 * src/libs/RestTransport.js
 * Created: Wed May 24 2017 16:31:37 GMT+0530 (IST)
 * Copyright 2017 Harish.K<harish2704@gmail.com>
 */

const logger = require('src/libs/logger')('RestTransport');
const Promise = require('bluebird');

/**
 * Represents the output of a service action
 * @typedef {Object} ServiceResult
 *
 * @property {String} [redirect] - if provided, will send HTTP redirect to that string
 * @property {Object} [ headers ] - used to set response headers using `res.header( headers )`
 * @property {Object} [ stream ] - if present, this stream is passed to response. Can be used to `export-csv/pdf` kind of feature
 * @property {String} [ template ] - if provided, render the data with given template and send HTML response.
 * @property {Object} [ data ] - actual output in the json response.
 */

function buildParams(req, res) {
  req.$scratchpad = req.$scratchpad || {};
  res.$result = {};
/**
 * Represents parameters passed to a service action
 * @typedef {Object} ServiceParams
 *
 * @property {Express.request} req - Express request instance
 * @property {Express.response} res - Express response instance
 * @property {Object} query - alias req.query
 * @property {Object} headers - alias req.headers
 * @property {Session} session - alias req.session
 * @property {Object} files - req.files
 * @property {Object} file - req.file
 * @property {Object} scratchpad - A general purpose object for storing data between service actions/middlewares
 * @property {Object} data - req.body
 * @property {Object} result - after middlewares can access the result from this property
 */

  return {
    req,
    res,
    query: req.query,
    headers: req.headers,
    session: req.session,
    files: req.files,
    file: req.file,
    scratchpad: req.$scratchpad,
    data: req.body,
    result: res.$result
  };
}

function captureData(res, next) {
  return function (data = {}) {
    Object.assign( res.$result, data );
    next();
  };
}

function taskToGeneralMiddleware( task, thisArg ){
  return function( req, res, next ){
    task.call( thisArg, buildParams(req, res) )
      .then( captureData(res, next))
      .catch(next);
  };
}


/**
 * Convert a Task  ( which is a simple function returns a Promise ) to a express middleware
 * @ignore
 *
 *  @param {MiddlewareTask} task - The task which we need to convert into a express middleware.
 *    A task is a function with following signature `function(params){} -> Promise<data>`
 *  @param {Object} opts - additional options
 *  @param {Array<MiddlewareTask>} opts.before - additional middlewares to run befoe executing main task
 *  @param {Array<MiddlewareTask>} opts.after - additional  middlewares to run after executing main task
 *  return {Array<ExpressMiddleware>}
 */
function taskToRouteHandle( task, opts ){
  const out = opts.before.concat([ task ], opts.after )
    .map( task => taskToGeneralMiddleware( task, opts.thisArg ) );
  out.push( sendAsReponse );
  return out;
}


function runTask( params ){
  return function( task ){
    return task(params)
      .then(function(data){
        Object.assign( params.result, data );
      });
  };
}

function taskToPromise( task, opts={} ){
  const completeChain = opts.before.concat([ task ], opts.after );
  return function( params ){
    params = Object.assign({ scratchpad:{}, body:{}, query:{}, result:{} }, params );
    return Promise.each( completeChain, runTask( params ) ).return(params);
  };
}



/**
 * 
 * @ignore
 *  Send the data as a HTTP response.
 *  if data.redirect is set and , request is not accepting json, it will send a 3xx redirect response
 *  if data.template is set and request is not accepting json, it will render the given templte with data send html response.
 *  if data.data is set and request is accepting json, it will send a json reponse with data.
 */
function sendAsReponse( req, res, next ) {
  const source = res.$result;
  if ( source.hasOwnProperty('redirect')) {
    return res.redirect( source.redirect);
  }
  if( source.headers ){
    res.set(source.headers);
  }
  if( source.stream ){
    return source.stream.pipe( res );
  }
  if ( source.hasOwnProperty('template')){
    return res.render( source.template, { data: source.data } );
  }
  if( source.hasOwnProperty('data') ){
    return res.send({ success: true, data: source.data });
  }
  return next();
}


/**
 * A service can have multiple actions. Each action is a pure promise and should resolve a value which matches <ServiceResult> interface
 * @typedef {Object} ServiceDefnition
 *
 * @property {Object} $before - Hashmap of `before` middlewares to be applied to each service action
 * @property {Object} $after - Hashmap of `after` middlewares to be applied to each service action
 * @property {ServiceAction} \<any_serviceAction_name\> - All other properties are considered as service actions
 *
 * @example
 *
 * var UserService = {
 *  get: getUser,
 *  list: listUsers,
 *  $before:{
 *    list: [
 *      loadSessionUser,
 *      restrictAdmin, // Only admin can list all the users.
 *    ],
 *    get: [
 *      loadSessionUser,
 *      restrictToCurrentUser, // Only allow to fetch current user's data
 *    ]
 *  }
 * };
 * module.exports = UserService;
 */

/**
 * Represents an action defined in a service.
 * A ServiceAction should return a promise which should resolve a data matching <ServiceResult> interface
 *
 * @callback ServiceAction
 *
 * @param {ServiceParams} params - params passed to ServiceAction
 *
 * @returns {Promise<ServiceResult>}
 * 
 * @example
 * async function listUsers( params ){
 *  const users = User.findAll( params.query );
 *  return { data: users };
 * }
 * const UserService = {
 *  list: listUsers,
 * };
 * module.exports = UserService;
 */


/**
 * Represents a transport layer which can expose all actions defined in a ServiceDefnition to front-end in the form REST Api.
 *
 * @example <caption>In express appication</caption>
 * const userServiceDef = {
 *  get: getUser,
 *  list: listUser,
 * };
 * const userService = new RestTransport( userServiceDef );
 * const app = express();
 * app.get('/users/:id', userService.getRouteHandler('get'));
 * app.get('/users', userService.getRouteHandler('list'));
 * app.use( RestTransport.errorHandler );
 *
 * @example <caption>In unit tests</caption>
 *
 * const action = userService.getPromise('list');
 * action()
 * .then(function( result ){
 *    assert( result.data instanceOf Array );
 *    assert( result.data[0] instanceOf UserModel );
 * })
 *
 */
class RestTransport{

  /**
   * 
   * @param {ServiceDefnition} defnition - Service defnition object
   *
   * @returns {undefined}
   */
  constructor( defnition ){
    this._actions = Object.assign( {}, defnition );
    this._beforeMiddlewares = defnition.$before || {};
    this._afterMiddlewares = defnition.$after || {};
    delete this._actions.$before;
    delete this._actions.$after;
  }

  _getMiddlewares( actionName ){
    return {
      before: this._beforeMiddlewares[ actionName ] || [],
      after: this._afterMiddlewares[ actionName ] || [],
    };
  }

  /**
   * Get a particular action in the service as a express route handler
   *
   * @param {String} actionName - Name of the action defined in the service defnition
   *
   * @returns {ExpressMiddleware}
   */
  getRouteHandler( actionName ){
    return taskToRouteHandle( this._actions[ actionName ], this._getMiddlewares( actionName ) );
  }

  /**
   * Get a particular action in the service as a pure promise
   *
   * @param {String} actionName - Name of the action defined in the service defnition
   *
   * @returns {Promise<ServiceResult>}
   */
  getPromise( actionName ){
    return taskToPromise( this._actions[ actionName ], this._getMiddlewares( actionName ) );
  }

  /**
   *  An express error handling middleware which handle normal errors and custom errors
   *  
   *  This middleware should be added to the end of express middleware chain for this Transport to work
   */
  static errorHandler( err, req, res, next ){
    const acceptedType = req.accepts([ 'html', 'json' ]);
    const source = err;
    logger.error( 'errorHandler', err, req.url );

    err.status = err.status || 500;
    if( acceptedType === 'html' ){
      err.template = err.template || `error-pages/${err.status}`;
    }

    if ( source.hasOwnProperty('redirect')) {
      return res.redirect( source.redirect);
    }
    res.status( err.status );
    if ( source.hasOwnProperty('template')){
      return res.render( source.template, { data: source.data || source } );
    }
    if( source.hasOwnProperty('data') ){
      return res.send({ success: true, data: source.data });
    }
    return res.send({ success: false, message: err.message||'Unknown error occured', errors: err.errors });
  }

}

module.exports = RestTransport;

