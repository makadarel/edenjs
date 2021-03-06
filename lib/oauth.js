module.exports = function($) {
	return this.define(function(public) {
		/* Constant
		-------------------------------*/
		public.HMAC_SHA1 		= 'HMAC-SHA1';
		public.RSA_SHA1 		= 'RSA-SHA1';
		public.PLAIN_TEXT 		= 'PLAINTEXT';
		
		public.POST				= 'POST';
		public.GET				= 'GET';
		public.DELETE			= 'DELETE';
		
		public.OAUTH_VERSION	= '1.0';
		
		public.AUTH_HEADER 		= 'Authorization: OAuth ';
		public.POST_HEADER 		= 'Content-Type: application/x-www-form-urlencoded';
		
		/* Public Properties
		-------------------------------*/
		public.consumerKey 		= ''; 
		public.consumerSecret 	= ''; 
		public.requestToken		= ''; 
		public.requestSecret	= ''; 
		public.authorization	= false;
		
		public.url			= ''; 
		public.method 		= '';
		public.realm		= ''; 
		public.time			= ''; 
		public.nonce		= ''; 
		public.verifier		= ''; 
		public.callback		= '';
		public.signature	= '';
		public.headers		= [];
		public.json			= false;
		
		/* Private Properties
		-------------------------------*/
		/* Loader
		-------------------------------*/
		public.__load = function(url, key, secret) {
			return new this(url, key, secret);
		};
		
		/* Construct
		-------------------------------*/
		public.__construct = function(url, key, secret) {
			this.consumerKey 	= key;
			this.consumerSecret = secret;
			
			this.url	= url;
			this.time 	= $.time.now();
			this.nonce 	= $.string.md5($.uid());
			
			this.signature 	= this.PLAIN_TEXT;
			this.method 	= this.GET;
		};
		
		/* Public Methods
		-------------------------------*/
		/**
		 * Returns the authorization header string
		 *
		 * @param string
		 * @return string
		 */
		public.getAuthorization = function(signature, string) {
			string = string !== false;
			
			//this is all possible configurations
			var params = {
				realm					: this.realm,
				oauth_consumer_key 		: this.consumerKey,
				oauth_token				: this.requestToken,
				oauth_signature_method	: this.signature,
				oauth_signature			: signature,
				oauth_timestamp			: this.time,
				oauth_nonce				: this.nonce,
				oauth_version			: this.OAUTH_VERSION,
				oauth_verifier			: this.verifier,
				oauth_callback			: this.callback };
			
			//if no realm
			if(!this.realm) {
				//remove it
				delete params.realm;
			}
			
			//if no token
			if(!this.requestToken) {
				//remove it
				delete params.oauth_token;
			}
			
			//if no verifier
			if(!this.verifier) {
				//remove it
				delete params.oauth_verifier;
			}
			
			//if no callback
			if(!this.callback) {
				//remove it
				delete params.oauth_callback;
			}
			
			if(!string) {
				return params;
			}
			
			return this.AUTH_HEADER + this._buildQuery(params, ',', false);	
		};
		
		/**
		 * Returns the signature
		 *
		 * @return string
		 */
		public.getHmacPlainTextSignature = function() {
			return this.consumerSecret + '&' + this.requestSecret;
		};
		
		/**
		 * Returns the signature
		 *
		 * @param array
		 * @return string
		 */
		public.getHmacSha1Signature = function(query) {
			query = query || {};
			
			//this is like the authorization params minus the realm and signature
			var params = {
				oauth_consumer_key 		: this.consumerKey,
				oauth_token				: this.requestToken,
				oauth_signature_method	: this.HMAC_SHA1,
				oauth_timestamp			: this.time,
				oauth_nonce				: this.nonce,
				oauth_version			: this.OAUTH_VERSION,
				oauth_verifier			: this.verifier,
				oauth_callback			: this.callback };
			
			//if no token
			if(!this.requestToken) {
				//unset that parameter
				delete params.oauth_token;
			}
			
			//if no verifier
			if(!this.verifier) {
				//remove it
				delete params.oauth_verifier;
			}
			
			//if no callback
			if(!this.callback) {
				//remove it
				delete params.oauth_callback;
			}
			
			query = $.hash.concat(params, query); //merge the params and the query
			query = _buildQuery(query); //make query into a string
			
			//create the base string
			var string = [this.method, _encode(this.url), _encode(query)].join('&');
			
			//create the encryption key
			var key = _encode(this.consumerSecret) + '&' + _encode(this.requestSecret);
			
			//authentication method
			return $.string.hmac(string, key, 'sha1');
		};
		
		/**
		 * Returns the signature based on what signature method was set
		 *
		 * @param array
		 * @return string
		 */
		public.getSignature = function(query) {
			query = query || {};
			
			switch(this.signature) {
				case this.HMAC_SHA1:
					return this.getHmacSha1Signature(query);
				case this.RSA_SHA1:
				case this.PLAIN_TEXT:
				default:
					return this.getHmacPlainTextSignature();
			}
		};
		
		/**
		 * When sent, sends the parameters as post fields
		 *
		 * @return this
		 */
		public.jsonEncodeQuery = function() {
			this.json = true;
			return this;
		};
		
		/**
		 * Returns the token from the server
		 *
		 * @param array
		 * @return array
		 */
		public.send = function(query, callback) {
			query = query || {};
			
			if(typeof query == 'function') {
				callback = query;
				query = {};
			}
			
			var headers = this.headers.slice(0);
			var json 	= null;
			
			if(this.json) {
				json 	= JSON.stringify(query);
				query 	= {};
			}
			
			//get the authorization parameters as an array
			var signature 		= this.getSignature(query);
			var authorization 	= this.getAuthorization(signature, false);
			
			//if we should use the authrization
			if(this.authorization) {
				//add the string to headers
				this.headers.push(this.AUTH_HEADER + _buildQuery(authorization, ',', false));
			} else {
				//merge authorization and query
				query = $.hash.concat(authorization, query);
				
			}
			
			query 	= _buildQuery(query);
			
			//set curl
			var rest = $.load('rest')
				.setUrl(this.url)
				.setHeaders(headers);
				
			//if post
			if(this.method == this.POST) {
				headers.push(this.POST_HEADER);
				
				if(json) {
					query = json;
				}
				
				//get the response
				 rest.setMethod(this.POST).setBody(query);
			//if delete		
			} else if(this.method == this.DELETE) {
				//get the response
				rest.setMethod(this.DELETE);
			} else if(query) {
				//determine the conector
				var connector = null;
				
				//if there is no question mark
				if(this.url.indexOf('?') === -1) {
					connector = '?';
				//if the redirect doesn't end with a question mark
				} else if(this.url.substr(-1) != '?') {
					connector = '&';
				}
				
				//now add the secret to the redirect
				rest.setUrl(this.url + connector + query);
			}
			
			var meta = {
				url 			: this.url,
				authorization 	: authorization,
				headers 		: headers,
				query 			: query };
			
			rest.send($.alter(callback, callback, meta));
			
			return this;
		};
		
		/**
		 * Sets the callback for authorization
		 * This should be set if wanting an access token
		 *
		 * @param string
		 * @return this
		 */
		public.setCallback = function(url) {
			this.callback = url;
			return this;
		};
		
		/**
		 * Sets request headers
		 *
		 * @param array|string
		 * @return this
		 */
		public.setHeaders = function(key, value) {
			if($.array.isArray(key)) {
				this.headers = key;
				return this;
			}
			
			this.headers.push(key + ': ' + value);
			return this;
		};
		
		/**
		 * When sent, appends the parameters to the URL
		 *
		 * @return this
		 */
		public.setMethodToGet = function() {
			this.method = this.GET;
			return this;
		};
		
		/**
		 * When sent, appends the parameters to the URL
		 *
		 * @return this
		 */
		public.setMethodToDelete = function() {
			this.method = this.DELETE;
			return this;
		};
	
		/**
		 * When sent, sends the parameters as post fields
		 *
		 * @return this
		 */
		public.setMethodToPost = function() {
			this.method = this.POST;
			return this;
		};
		
		/**
		 * Some Oauth servers requires a realm to be set
		 *
		 * @param string
		 * @return this
		 */
		public.setRealm = function(realm) {
			this.realm = realm;
			return this;
		};
		
		/**
		 * Sets the signature encryption type to HMAC-SHA1
		 *
		 * @return this
		 */
		public.setSignatureToHmacSha1 = function() {
			this.signature = this.HMAC_SHA1;
			return this;
		};
		
		/**
		 * Sets the signature encryption to RSA-SHA1
		 *
		 * @return this
		 */
		public.setSignatureToRsaSha1 = function() {
			this.signature = this.RSA_SHA1;
			return this;
		};
		
		/** 
		 * Sets the signature encryption to PLAINTEXT
		 *
		 * @return this
		 */
		public.setSignatureToPlainText = function() {
			this.signature = this.PLAIN_TEXT;
			return this;
		};
		
		/**
		 * Sets the request token and secret. 
		 * This should be set if wanting an access token
		 *
		 * @param string
		 * @param string
		 * @return this
		 */
		public.setToken = function(token, secret) {
			this.requestToken = token;
			this.requestSecret = secret;
			
			return this;
		};
		
		/**
		 * Some Oauth servers requires a verifier to be set
		 * when retrieving an access token
		 *
		 * @param string
		 * @return this
		 */
		public.setVerifier = function(verifier) {
			this.verifier = verifier;
			return this;
		};
		
		/**
		 * When sent, appends the authroization to the headers
		 *
		 * @param bool
		 * @return this
		 */
		public.useAuthorization = function(use) {
			this.authorization = use !== false;
			return this;
		};
		
		/* Private Methods
		-------------------------------*/
		var _buildQuery = function(query, separator, noQuotes, subList) {
			separator 	= separator || '&';
			noQuotes	= noQuotes !== false;
			subList 	= !!subList;
			query 		= $.load('hash', query);
			
			if(query.isEmpty()) {
				return '';
			}
			
			//encode both keys and values
			var keys = _encode(query.keys().get());
			var values = _encode(query.values().get());
			
			query = $.load('array', keys)
				.combineWithValues(values)
				// Parameters are sorted by name, using lexicographical byte value ordering.
				// http://oauth.net/core/1.0/#rfc.section.9.1.1
				.natksort();
			
				// Turn params array into an array of "key=value" strings
			query.each(function(key, value) {
				if($.array.isArray(value)) {
					value = $.array.natsort(value);
					this.set(key, _buildQuery(value, separator, noQuotes, true));
					return;
				}
				
				if(!noQuotes) {
					value = '"'+value+'"';
				}
				
				this.set(key, value);
			});
			
			if(subList) {
				return query.get();
			}
			
			query.each(function(key, value) {
				this.set(key, key+'='+value);
			});
			
			return query.implode(separator).get();
		};
		
		var _decode = function(value) {
			return $.string(value).urlDecode().get();
		};
		
		var _encode = function(value) {
			if($.hash.isHash(value) 
			|| $.array.isArray(value)) {
				for(var key in value) {
					value[key] = _encode(value[key]);
				}
				
				return value;
			}
			
			return $.string.urlEncode(''+value);
		};
		
		var _parseString = function(value) {
			var hash 	= $.load('hash');
			
			value = $.load('string', value);
			
			if(value.isEmpty()) {
				return hash.get();
			}
		
			// Separate single string into an array of "key=value" strings
			value.split('&').each(function(key, pair) {
				// Separate each "key=value" string into an array[key] = value
				pair = pair.split('=');
				
				// Handle the case where multiple values map to the same key
				// by pulling those values into an array themselves
				if(hash[pair[0]]) {
					// If the existing value is a scalar, turn it into an array
					if(!(hash[pair[0]] instanceof Array)) {
						hash[pair[0]] = [hash[pair[0]]];
					}
					
					hash[pair[0]].push(pair[1]);
				} else {
					hash[pair[0]] = pair[1];
				}
				
			});
			
			return hash;
		};
	});
};