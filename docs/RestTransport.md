## Classes

<dl>
<dt><a href="#RestTransport">RestTransport</a></dt>
<dd><p>Represents a transport layer which can expose all actions defined in a ServiceDefnition to front-end in the form REST Api.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#ServiceResult">ServiceResult</a> : <code>Object</code></dt>
<dd><p>Represents the output of a service action</p>
</dd>
<dt><a href="#ServiceParams">ServiceParams</a> : <code>Object</code></dt>
<dd><p>Represents parameters passed to a service action</p>
</dd>
<dt><a href="#ServiceDefnition">ServiceDefnition</a> : <code>Object</code></dt>
<dd><p>A service can have multiple actions. Each action is a pure promise and should resolve a value which matches <ServiceResult> interface</p>
</dd>
<dt><a href="#ServiceAction">ServiceAction</a> ⇒ <code><a href="#ServiceResult">Promise.&lt;ServiceResult&gt;</a></code></dt>
<dd><p>Represents an action defined in a service.
A ServiceAction should return a promise which should resolve a data matching <ServiceResult> interface</p>
</dd>
</dl>

<a name="RestTransport"></a>

## RestTransport
Represents a transport layer which can expose all actions defined in a ServiceDefnition to front-end in the form REST Api.

**Kind**: global class  

* [RestTransport](#RestTransport)
    * [new RestTransport(defnition)](#new_RestTransport_new)
    * _instance_
        * [.getRouteHandler(actionName)](#RestTransport+getRouteHandler) ⇒ <code>ExpressMiddleware</code>
        * [.getPromise(actionName)](#RestTransport+getPromise) ⇒ [<code>Promise.&lt;ServiceResult&gt;</code>](#ServiceResult)
    * _static_
        * [.errorHandler()](#RestTransport.errorHandler)

<a name="new_RestTransport_new"></a>

### new RestTransport(defnition)

| Param | Type | Description |
| --- | --- | --- |
| defnition | [<code>ServiceDefnition</code>](#ServiceDefnition) | Service defnition object |

**Example** *(In express appication)*  
```js
const userServiceDef = {
 get: getUser,
 list: listUser,
};
const userService = new RestTransport( userServiceDef );
const app = express();
app.get('/users/:id', userService.getRouteHandler('get'));
app.get('/users', userService.getRouteHandler('list'));
app.use( RestTransport.errorHandler );
```
**Example** *(In unit tests)*  
```js

const action = userService.getPromise('list');
action()
.then(function( result ){
   assert( result.data instanceOf Array );
   assert( result.data[0] instanceOf UserModel );
})
```
<a name="RestTransport+getRouteHandler"></a>

### restTransport.getRouteHandler(actionName) ⇒ <code>ExpressMiddleware</code>
Get a particular action in the service as a express route handler

**Kind**: instance method of [<code>RestTransport</code>](#RestTransport)  

| Param | Type | Description |
| --- | --- | --- |
| actionName | <code>String</code> | Name of the action defined in the service defnition |

<a name="RestTransport+getPromise"></a>

### restTransport.getPromise(actionName) ⇒ [<code>Promise.&lt;ServiceResult&gt;</code>](#ServiceResult)
Get a particular action in the service as a pure promise

**Kind**: instance method of [<code>RestTransport</code>](#RestTransport)  

| Param | Type | Description |
| --- | --- | --- |
| actionName | <code>String</code> | Name of the action defined in the service defnition |

<a name="RestTransport.errorHandler"></a>

### RestTransport.errorHandler()
An express error handling middleware which handle normal errors and custom errors
 
 This middleware should be added to the end of express middleware chain for this Transport to work

**Kind**: static method of [<code>RestTransport</code>](#RestTransport)  
<a name="ServiceResult"></a>

## ServiceResult : <code>Object</code>
Represents the output of a service action

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| redirect | <code>String</code> | if provided, will send HTTP redirect to that string |
| headers | <code>Object</code> | used to set response headers using `res.header( headers )` |
| stream | <code>Object</code> | if present, this stream is passed to response. Can be used to `export-csv/pdf` kind of feature |
| template | <code>String</code> | if provided, render the data with given template and send HTML response. |
| data | <code>Object</code> | actual output in the json response. |

<a name="ServiceParams"></a>

## ServiceParams : <code>Object</code>
Represents parameters passed to a service action

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| req | <code>Express.request</code> | Express request instance |
| res | <code>Express.response</code> | Express response instance |
| query | <code>Object</code> | alias req.query |
| headers | <code>Object</code> | alias req.headers |
| session | <code>Session</code> | alias req.session |
| files | <code>Object</code> | req.files |
| file | <code>Object</code> | req.file |
| scratchpad | <code>Object</code> | A general purpose object for storing data between service actions/middlewares |
| data | <code>Object</code> | req.body |
| result | <code>Object</code> | after middlewares can access the result from this property |

<a name="ServiceDefnition"></a>

## ServiceDefnition : <code>Object</code>
A service can have multiple actions. Each action is a pure promise and should resolve a value which matches <ServiceResult> interface

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| $before | <code>Object</code> | Hashmap of `before` middlewares to be applied to each service action |
| $after | <code>Object</code> | Hashmap of `after` middlewares to be applied to each service action |
| \&lt;any_serviceAction_name\&gt; | [<code>ServiceAction</code>](#ServiceAction) | All other properties are considered as service actions |

**Example**  
```js
var UserService = {
 get: getUser,
 list: listUsers,
 $before:{
   list: [
     loadSessionUser,
     restrictAdmin, // Only admin can list all the users.
   ],
   get: [
     loadSessionUser,
     restrictToCurrentUser, // Only allow to fetch current user's data
   ]
 }
};
module.exports = UserService;
```
<a name="ServiceAction"></a>

## ServiceAction ⇒ [<code>Promise.&lt;ServiceResult&gt;</code>](#ServiceResult)
Represents an action defined in a service.
A ServiceAction should return a promise which should resolve a data matching <ServiceResult> interface

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| params | [<code>ServiceParams</code>](#ServiceParams) | params passed to ServiceAction |

**Example**  
```js
async function listUsers( params ){
 const users = User.findAll( params.query );
 return { data: users };
}
const UserService = {
 list: listUsers,
};
module.exports = UserService;
```
