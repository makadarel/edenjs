module.exports = function($) {
	var definition = this.define(function(public) {
		/* Constants
		-------------------------------*/
		var HTML_SPECIALCHARS 	= 100;
		var HTML_ENTITIES 		= 200;
		var ENT_NOQUOTES 		= 300;
		var ENT_COMPAT 			= 400;
		var ENT_QUOTES 			= 500;
			
		/* Public Properties
		-------------------------------*/
		public.data = null;
		
		/* Private Properties
		-------------------------------*/
		/* Loader
		-------------------------------*/
		public.__load = function(data) {
			//if it's any type of eden
			if($.isEden(data)) {
				//return it to prevent
				//recursiveness
				return data;
			}
			
			if(!this.isString(data)) {
				data = '';
			}
			
			return new this(data);
		};
		
		/* Construct
		-------------------------------*/
		public.__construct = function(data) {
			this.data = data || '';
		};
		
		/* Public Methods
		-------------------------------*/
		/**
		 * Returns a string with backslashes before characters
		 * that need to be escaped.
		 *
		 * @return this
		 */
		public.addSlashes = function() {
			this.data = this.data.replace(/\'/g, "\\\'").
				replace(/\"/g, "\\\"").
				replace(/\\/g, '\\').
				replace(/\n/g, '\\\\n').
				replace(/\t/g, '\\\\t').
				replace(/\f/g, '\\\\f').
				replace(/\r/g, '\\\\r');
			
			return this;
		};
		
		/**
		 * Decodes a base 64 string
		 *
		 * @return this
		 */
		public.base64Decode = function() {
			this.data = (new Buffer(this.data, 'base64')).toString();
			return this;
		};
		
		/**
		 * Encodes a base 64 string
		 *
		 * @return this
		 */
		public.base64Encode = function() {
			this.data = (new Buffer(this.data)).toString('base64');
			return this;
		};
		
		/**
		 * Camelizes a string
		 *
		 * @param string prefix
		 * @return this
		 */
		public.camelize = function(prefix) {
			this.replace(prefix || '-', ' ')
				.ucWords()
				.replace(' ', '')
				.lcFirst();
			
			return this;
		};
		
		/**
		 * Returns the character at the specified index
		 *
		 * @param number
		 * @return string
		 */
		public.charAt = function() {
			return this.data.charAt.apply(this.data, arguments);
		};
		
		/**
		 * Returns the Unicode of the character at the specified index
		 *
		 * @param number
		 * @return string
		 */
		public.charCodeAt = function() {
			return this.data.charCodeAt.apply(this.data, arguments);
		};
		
		/**
		 * Joins two or more strings
		 *
		 * @param string[,string..]
		 * @return this
		 */
		public.concat = function() {
			this.data = this.data.concat.apply(this.data, arguments);
			return this;
		};
		
		/**
		 * Transforms a string with caps and 
		 * space to a lower case dash string 
		 *
		 * @return this
		 */
		public.dasherize = function() {
			this.replace(/[^a-zA-Z0-9_-\s]/gi, '')
				.trim()
				.replace(' ', '-')
				.replace(/\-+/gi, '-')
				.toLowerCase();
			
			return this;
		};
		
		/**
		 * Returns true if string ends with given value
		 *
		 * @param string
		 * @return bool
		 */
		public.endsWith = function(value) {
			return (new RegExp(value+'$')).test(this.data);
		};
		
		/**
		 * Returns true if given value equals string
		 *
		 * @param mixed
		 * @param bool strict mode
		 * @return bool
		 */
		public.equals = public.eq = function(value, strict) {
			return strict? this.data === value: this.data == value;
		};
		
		/**
		 * Returns the value of a String object
		 *
		 * @return string
		 */
		public.get = public.toString = function() {
			return this.data.toString();
		};
		
		/**
		 * Returns true if specified value is
		 * found within the string
		 *
		 * @return bool
		 */
		public.has = function(needle) {
			return this.indexOf(needle) !== -1;
		};
		
		/**
		 * hmac encryption 
		 *
		 * @param string
		 * @param string sha1|md5|sha256
		 * @param string binary|hex|base64
		 * @return this
		 */
		public.hmac = function(key, algorythm, encoding) {
			encoding = encoding || 'base64';
			
			this.data = require('crypto')
				.createHmac(algorythm, key)
				.update(this.data)
				.digest(encoding);
			
			return this;
		};
		
		/**
		 * Convert all applicable characters to HTML entities
		 *
		 * @param number
		 * @param string
		 * @return this
		 */
		public.htmlEntities = function(quote, encode) {
			var symbol, map = _getHtmlMap(HTML_ENTITIES, quote);
			
			if(!map) {
				return this;
			}
			
			if(quote && quote === ENT_QUOTES) {
				map["'"] = '&#039;';
			}
		
			if(!!encode || encode == null) {
				for (symbol in map) {
					if (map.hasOwnProperty(symbol)) {
						this.data = this.data.split(symbol).join(map[symbol]);
					}
				}
			} else {
				this.data = this.data.replace(
					/([\s\S]*?)(&(?:#\d+|#x[\da-f]+|[a-zA-Z][\da-z]*);|$)/g,
					function(ignore, text, entity) {
						for (symbol in map) {
							if (map.hasOwnProperty(symbol)) {
								text = text.split(symbol).join(map[symbol]);
							}
						}
						
						return text + entity;
				});
			}
		
			return this;
		};
		
		/**
		 * Convert all HTML entities to their applicable characters
		 *
		 * @param number
		 * @return this
		 */
		public.htmlEntityDecode = function(quote) {
			var symbol, entity,
				map = _getHtmlMap(HTML_ENTITIES, quote);
			
			if (map === false) {
				return this;
			}
			
			// &amp; must be the last character when decoding!
			delete(map['&']);
			map['&'] = '&amp;';
		
			for(symbol in map) {
				entity = map[symbol];
				this.data = this.data.split(entity).join(symbol);
			}
		
			return this;
		};
		
		/**
		 * Returns the position of the first found 
		 * occurrence of a specified value in a string
		 *
		 * @param string
		 * @return number
		 */
		public.indexOf = function() {
			return this.data.indexOf.apply(this.data, arguments);
		};
		
		/**
		 * Returns true if string is JSON formatted
		 *
		 * @return bool
		 */
		public.isJson = function() {
			try {
				JSON.parse(this.data);
			} catch (e) {
				return false;
			}
			
			return true;
		};
		
		/**
		 * Returns true if string is empty
		 *
		 * @return bool
		 */
		public.isEmpty = function() {
			return this.size() === 0;
		};
		
		/**
		 * Converts a JSON string to an object
		 *
		 * @return object
		 */
		public.jsonToHash = function() {
			return $.load('hash', JSON.parse(this.data));
		};
		
		/**
		 * Returns the position of the last found 
		 * occurrence of a specified value in a string
		 *
		 * @param string
		 * @return number
		 */
		public.lastIndexOf = function() {
			return this.data.lastIndexOf.apply(this.data, arguments);
		};
		
		/**
		 * Loads a file and calls it passing arguments
		 *
		 * @param [mixed[,mixed..]]
		 * @return object
		 */
		public.load = function() {
			var args = $.args();
			args.unshift(this.data);
			return $.load.apply($, args);
		};
		
		/**
		 * Lowercase the first letter of the string
		 *
		 * @return this
		 */
		public.lcFirst = function() {
			var first = this.data.charAt(0).toLowerCase();
			this.data = first + this.data.substr(1);
			return this;
		};
		
		/**
		 * Inserts HTML line breaks before all newlines in a string
		 *
		 * @return this
		 */
		public.nl2br = function() {
			this.data = this.data.replace(/\r\n|\n\r|\r|\n/g, '<br />');
			return this;
		};
		
		/**
		 * Searches for a match between a regular expression 
		 * and a string, and returns the matches
		 *
		 * @param RegExp
		 * @return Eden.array
		 */
		public.match = function() {
			return $.load('array', this.data.match.apply(this.data, arguments));
		};
		
		/**
		 * Calculate the md5 hash of a string
		 *
		 * @return this
		 */
		public.md5 = function() {
			var str = this.data.toString();
			var xl;
			var rotateLeft = function (lValue, iShiftBits) {
				return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
			};
	
			var addUnsigned = function (lX, lY) {
				var lX4, lY4, lX8, lY8, lResult;
				lX8 	= (lX & 0x80000000);
				lY8 	= (lY & 0x80000000);
				lX4 	= (lX & 0x40000000);
				lY4 	= (lY & 0x40000000);
				lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
				
				if (lX4 & lY4) {
					return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
				}
				
				if (lX4 | lY4) {
					if (lResult & 0x40000000) {
						return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
					} else {
						return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
					}
				} else {
					return (lResult ^ lX8 ^ lY8);
				}
			};
		
			var _F = function (x, y, z) { return (x & y) | ((~x) & z); };
			var _G = function (x, y, z) { return (x & z) | (y & (~z)); };
			var _H = function (x, y, z) { return (x ^ y ^ z); };
			var _I = function (x, y, z) { return (y ^ (x | (~z))); };
	
			var _FF = function (a, b, c, d, x, s, ac) {
				a = addUnsigned(a, addUnsigned(addUnsigned(_F(b, c, d), x), ac));
				return addUnsigned(rotateLeft(a, s), b);
			};
			
			var _GG = function (a, b, c, d, x, s, ac) {
				a = addUnsigned(a, addUnsigned(addUnsigned(_G(b, c, d), x), ac));
				return addUnsigned(rotateLeft(a, s), b);
			};
			
			var _HH = function (a, b, c, d, x, s, ac) {
				a = addUnsigned(a, addUnsigned(addUnsigned(_H(b, c, d), x), ac));
				return addUnsigned(rotateLeft(a, s), b);
			};
			
			var _II = function (a, b, c, d, x, s, ac) {
				a = addUnsigned(a, addUnsigned(addUnsigned(_I(b, c, d), x), ac));
				return addUnsigned(rotateLeft(a, s), b);
			};
	
			var convertToWordArray = function (str) {
				var lWordCount;
				var lMessageLength = str.length;
				var lNumberOfWords_temp1 = lMessageLength + 8;
				var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
				var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
				var lWordArray = new Array(lNumberOfWords - 1);
				var lBytePosition = 0;
				var lByteCount = 0;
				
				while (lByteCount < lMessageLength) {
					lWordCount = (lByteCount - (lByteCount % 4)) / 4;
					lBytePosition = (lByteCount % 4) * 8;
					lWordArray[lWordCount] = (lWordArray[lWordCount] 
						| (str.charCodeAt(lByteCount) << lBytePosition));
					lByteCount++;
				}
				
				lWordCount = (lByteCount - (lByteCount % 4)) / 4;
				lBytePosition = (lByteCount % 4) * 8;
				lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
				lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
				lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
				
				return lWordArray;
			};
	
			var wordToHex = function (lValue) {
				var wordToHexValue = "",
				wordToHexValue_temp = "",
				lByte, lCount;
				
				for (lCount = 0; lCount <= 3; lCount++) {
					lByte = (lValue >>> (lCount * 8)) & 255;
					wordToHexValue_temp = "0" + lByte.toString(16);
					wordToHexValue = wordToHexValue + wordToHexValue_temp.
						substr(wordToHexValue_temp.length - 2, 2);
				}
			
				return wordToHexValue;
			};
	
			var x = [], k, AA, BB, CC, DD, a, b, c, d, 
				S11 = 7,	S12 = 12,
				S13 = 17,	S14 = 22,
				S21 = 5,	S22 = 9,
				S23 = 14,	S24 = 20,
				S31 = 4,	S32 = 11,
				S33 = 16,	S34 = 23,
				S41 = 6,	S42 = 10,
				S43 = 15,	S44 = 21;
			
			str = definition.load(str).utf8Encode().get();
			x = convertToWordArray(str);
			a = 0x67452301;
			b = 0xEFCDAB89;
			c = 0x98BADCFE;
			d = 0x10325476;
			xl = x.length;
			
			for (k = 0; k < xl; k += 16) {
				AA = a;
				BB = b;
				CC = c;
				DD = d;
				a = _FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
				d = _FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
				c = _FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
				b = _FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
				a = _FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
				d = _FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
				c = _FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
				b = _FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
				a = _FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
				d = _FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
				c = _FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
				b = _FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
				a = _FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
				d = _FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
				c = _FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
				b = _FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
				a = _GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
				d = _GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
				c = _GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
				b = _GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
				a = _GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
				d = _GG(d, a, b, c, x[k + 10], S22, 0x2441453);
				c = _GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
				b = _GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
				a = _GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
				d = _GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
				c = _GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
				b = _GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
				a = _GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
				d = _GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
				c = _GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
				b = _GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
				a = _HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
				d = _HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
				c = _HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
				b = _HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
				a = _HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
				d = _HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
				c = _HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
				b = _HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
				a = _HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
				d = _HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
				c = _HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
				b = _HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
				a = _HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
				d = _HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
				c = _HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
				b = _HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
				a = _II(a, b, c, d, x[k + 0], S41, 0xF4292244);
				d = _II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
				c = _II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
				b = _II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
				a = _II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
				d = _II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
				c = _II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
				b = _II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
				a = _II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
				d = _II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
				c = _II(c, d, a, b, x[k + 6], S43, 0xA3014314);
				b = _II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
				a = _II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
				d = _II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
				c = _II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
				b = _II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
				a = addUnsigned(a, AA);
				b = addUnsigned(b, BB);
				c = addUnsigned(c, CC);
				d = addUnsigned(d, DD);
			}
	
			var temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
	
			this.data = temp.toLowerCase();
			
			return this;
		};
		
		/**
		 * Converts a path into an array
		 *
		 * @return Eden.array
		 */
		public.pathToArray = function() {
			var data = this.data.toString();
			if(data.indexOf('?') != -1) {
				data = data.substr(0, data.indexOf('?'));
			}
			
			data = data.split('/');
			
			if(!data[0]) {
				data.shift();
			}
			
			if(!data[data.length - 1]) {
				data.pop();
			}
			
			return $.load('array', data);
		};
		
		/**
		 * Formats a path with query to an object
		 *
		 * @return Eden.object
		 */
		public.pathToQuery = function() {
			if(this.data.indexOf('?') != -1) {
				return definition
				.load(this.data.toString())
				.substr(this.indexOf('?'))
				.replace('?', '')
				.queryToHash();
			}
			
			return $.load('hash');
		};
		
		/**
		 * Converts a query string to an object
		 *
		 * @return Eden.object
		 */
		public.queryToHash = function() {
			var i, next, obj, vars = {};
			
			//foreach key=value
			('?'+decodeURIComponent(this.data))
			.replace(/[?&]+([^=&]+)=([^&]*)/gi 
			, function(m, keys, value) {
				var path = vars, keys = keys.replace(/\]/g, '').split('[');
				
				//test2[][eds] -> {test2: [{eds:123}]}
				//keys = ['test2', '', 'eds']
				for(i in keys) {
					next = i + 1;
					
					//this is the last one
					if(next == keys.length) {
						if(path instanceof Array) {
							if(keys[i].length > 0) {
								obj = {};
								obj[keys[i]] = value;
								path.push(obj);
								
								return;
							}
							
							path.push(value);
							return;
						}
						
						path[keys[i]] = value;
						
						return;
					}
					
					//if the next one has character/s
					if(keys[next] && keys[next].length > 0) {
						//it means we should generate an object
						if(path instanceof Array) {
							path.push({});
							path = path[path.length - 1];
							return;
						}
						
						if(!path[key]) {
							path[key] = {};
						}
						
						path = path[key];
						return;
					}
					
					//if we are here it means we should generate an array
					if(path instanceof Array) {
						path.push([]);
						path = path[path.length - 1];
						return;
					}
					
					if(!path[keys[i]]) {
						path[keys[i]] = [];
					}
					
					path = path[keys[i]];
				}
			});
			
			return $.load('hash', vars);
		};
		
		/**
		 * Searches for a match between a substring (or regular 
		 * expression) and a string, and replaces the matched 
		 * substring with a new substring
		 *
		 * @param string|RegExp
		 * @return this
		 */
		public.replace = function(needle, value) {
			if(typeof needle == 'string') {
				//prepare needle for regex
				needle = needle.replace(/[^a-zA-Z\d\s:]/, function(match) {
					return '\\'+match;
				});
				
				needle = new RegExp(needle, 'g');
			}
			
			this.data = this.data.replace(needle, value);
			return this;
		};
		
		/**
		 * Returns true if string starts with given value
		 *
		 * @param string
		 * @return bool
		 */
		public.startsWith = function(value) {
			return this.data.indexOf(value) === 0;
		};
		
		/**
		 * Searches for a match between a regular expression 
		 * and a string, and returns the position of the match
		 *
		 * @param string|RegExp
		 * @return number
		 */
		public.search = function() {
			return this.data.search.apply(this.data, arguments);
		};
		
		/**
		 * Calculate the sha1 hash of a string
		 *
		 * @return this
		 */
		public.sha1 = function() {
			function rotate_left(n,s) {
				var t4 = ( n<<s ) | (n>>>(32-s));
				return t4;
			};
	 
			function lsb_hex(val) {
				var str="";
				var i;
				var vh;
				var vl;
			
				for( i=0; i<=6; i+=2 ) {
					vh = (val>>>(i*4+4)) & 0x0f;
					vl = (val>>>(i*4)) & 0x0f;
					str += vh.toString(16) + vl.toString(16);
				}
				
				return str;
			};
	 
			function cvt_hex(val) {
				var str="";
				var i;
				var v;
				
				for( i=7; i>=0; i-- ) {
					v = (val>>>(i*4))&0x0f;
					str += v.toString(16);
				}
				
				return str;
			};
	
			var blockstart;
			var i, j;
			var W = new Array(80);
			var H0 = 0x67452301;
			var H1 = 0xEFCDAB89;
			var H2 = 0x98BADCFE;
			var H3 = 0x10325476;
			var H4 = 0xC3D2E1F0;
			var A, B, C, D, E;
			var temp;
	 
			msg = definition.load(this.data.toString()).utf8Encode(this.data).get();
	 
			var msg_len 	= msg.length;
			var word_array 	= new Array();
			
			for( i=0; i<msg_len-3; i+=4 ) {
				j = msg.charCodeAt(i)<<24 | msg.charCodeAt(i+1)<<16 |
				msg.charCodeAt(i+2)<<8 | msg.charCodeAt(i+3);
				word_array.push( j );
			}
	 
			switch( msg_len % 4 ) {
				case 0:
					i = 0x080000000;
					break;
				case 1:
					i = msg.charCodeAt(msg_len-1)<<24 | 0x0800000;
					break;
				case 2:
					i = msg.charCodeAt(msg_len-2)<<24 
						| msg.charCodeAt(msg_len-1)<<16 | 0x08000;
					break;
				case 3:
					i = msg.charCodeAt(msg_len-3)<<24 
						| msg.charCodeAt(msg_len-2)<<16 
						| msg.charCodeAt(msg_len-1)<<8
						| 0x80;
					break;
			}
	 
			word_array.push(i);
			while((word_array.length % 16) != 14 ) word_array.push(0);
			word_array.push( msg_len>>>29 );
			word_array.push( (msg_len<<3)&0x0ffffffff );
			
			for ( blockstart=0; blockstart<word_array.length; blockstart+=16 ) {
				for( i=0; i<16; i++ ) W[i] = word_array[blockstart+i];
				for( i=16; i<=79; i++ ) W[i] = rotate_left(W[i-3] ^ W[i-8] ^ W[i-14] ^ W[i-16], 1);
			
				A = H0;
				B = H1;
				C = H2;
				D = H3;
				E = H4;
	 
				for( i= 0; i<=19; i++ ) {
					temp = (rotate_left(A,5) + ((B&C) | (~B&D)) 
						+ E + W[i] + 0x5A827999) & 0x0ffffffff;
						
					E = D;
					D = C;
					C = rotate_left(B,30);
					B = A;
					A = temp;
				}
	 
				for( i=20; i<=39; i++ ) {
					temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] 
						+ 0x6ED9EBA1) & 0x0ffffffff;
						
					E = D;
					D = C;
					C = rotate_left(B,30);
					B = A;
					A = temp;
				}
	 
				for( i=40; i<=59; i++ ) {
					temp = (rotate_left(A,5) + ((B&C) | (B&D) | (C&D)) 
						+ E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
						
					E = D;
					D = C;
					C = rotate_left(B,30);
					B = A;
					A = temp;
				}
	 
				for( i=60; i<=79; i++ ) {
					temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] 
						+ 0xCA62C1D6) & 0x0ffffffff;
						
					E = D;
					D = C;
					C = rotate_left(B,30);
					B = A;
					A = temp;
				}
	 
				H0 = (H0 + A) & 0x0ffffffff;
				H1 = (H1 + B) & 0x0ffffffff;
				H2 = (H2 + C) & 0x0ffffffff;
				H3 = (H3 + D) & 0x0ffffffff;
				H4 = (H4 + E) & 0x0ffffffff;
			}
	 
			var temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
	 
			this.data = temp.toLowerCase();
			
			return this;
		};
		
		/**
		 * Returns the size of the string
		 *
		 * @return number
		 */
		public.size = function() {
			return this.data.length;
		};
		
		/**
		 * Extracts a part of a string and returns a new string
		 *
		 * @param number
		 * @param [number]
		 * @return this
		 */
		public.slice = function() {
			this.data = this.data.slice.apply(this.data, arguments);
			return this;
		};
		
		/**
		 * Splits a string into an array of substrings
		 *
		 * @param string
		 * @return Eden.array
		 */
		public.split = public.explode = function() {
			return $.load('array', this.data.split.apply(this.data, arguments));
		};
		
		/**
		 * Returns a string with backslashes stripped off.
		 *
		 * @return this
		 */
		public.stripSlashes = function() {
			this.data = this.data.replace(/\\'/g,'\'').
				replace(/\\"/g,'"').
				replace(/\\0/g,'\0').
				replace(/\\\\/g,'\\');
			
			return this;
		};
		
		/**
		 * Extracts the characters from a string, beginning at 
		 * a specified start position, and through the specified 
		 * number of character
		 *
		 * @param number
		 * @param [number]
		 * @return this
		 */
		public.substr = function() {
			this.data = this.data.substr.apply(this.data, arguments);
			return this;
		};
		
		/**
		 * Extracts the characters from a string, between two specified indices
		 *
		 * @param number
		 * @param [number]
		 * @return this
		 */
		public.substring = function() {
			this.data = this.data.substring.apply(this.data, arguments);
			return this;
		};
		
		/**
		 * Strips HTML out of string
		 *
		 * @param string
		 * @return this
		 */
		public.stripTags = function(allowed) {
			// making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
  			allowed = (((allowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); 
				
  			this.data = this.data
			.replace(/<!--[\s\S]*?-->/gi, '')
			.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, function ($0, $1) {
    			return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
  			});
			
			return this;
		};
		
		/**
		 * Summarizes a text
		 *
		 * @param int number of words
		 * @return this
		 */
		public.summarize = function(words) {
			var data = this.stripTags()
				.split(' ')
				.get();
			
			data.length = words;
			
			this.data = data.join(' ');
			
			return this;
		};
		
		/**
		 * Titlizes a string
		 *
		 * @param string prefix
		 * @return this
		 */
		public.titlize = function(prefix) {
			this.replace(prefix || '-', ' ').ucWords();
			return this;
		};
		
		/**
		 * Converts a string to lowercase letters
		 *
		 * @return this
		 */
		public.toLowerCase = public.toLower = 
		public.strToLower = function() {
			this.data = this.data.toLowerCase();
			return this;
		};
		
		/**
		 * Converts either a JSON string 
		 * or a query string to an object
		 *
		 * @return Eden.object
		 */
		public.toHash = function() {
			try {
				return this.jsonToHash(this.data);
			} catch (e) {
				return this.queryToHash();
			}
		};
		
		/**
		 * Formats a string into a proper path
		 *
		 * @return this
		 */
		public.toPath = function(path) {
			this.data = '/'+this.pathToArray().join('/').replace(/\/\//g, '/');
			return this;
		};
		
		/**
		 * Converts a string to uppercase letters
		 *
		 * @return this
		 */
		public.toUpperCase = public.toUpper =  
		public.strToUpper = function() {
			this.data = this.data.toUpperCase();
			return this;
		};
		
		/**
		 * Removes whitespace from both ends of a string
		 *
		 * @return this
		 */
		public.trim = function() {
			this.data = this.data.trim();
			return this;
		};
		
		/**
		 * Capitalize the first letter of the string
		 *
		 * @return this
		 */
		public.ucFirst = function() {
			this.data = this.data.charAt(0).toUpperCase() + this.data.slice(1);
			return this;
		};
		
		/**
		 * Uppercase the first character of each word in a string
		 *
		 * @return this
		 */
		public.ucWords = function() {
			this.data = this.data.toLowerCase().replace(/\b[a-z]/g, function(letter) {
				return letter.toUpperCase();
			});
			
			return this;
		};
		
		/**
		 * Uncamelizes a string
		 *
		 * @param string prefix
		 * @return this
		 */
		public.uncamelize = function(prefix) {
			prefix = prefix || '-';
			this.replace(/([A-Z])/g, function(match) {
				return prefix + match;
			}).toLowerCase();
			
			return this;
		};
		
		/**
		 * Decodes URI version
		 *
		 * @return this
		 */
		public.urlDecode = function() {
			this.data = decodeURIComponent(this.data);
			return this;
		};
		
		/**
		 * Returns the encoded URI version
		 *
		 * @return this
		 */
		public.urlEncode = function() {
			this.data = encodeURIComponent(this.data);
			return this;
		};
		
		/**
		 * Encodes an ISO-8859-1 string to UTF-8
		 *
		 * @param string
		 * @return string
		 */
		public.utf8Encode = function() {
			var string 	= this.data.toString(), 
				utftext = '',
				start 	= 0,
				end 	= 0;
			
			for (var c1, enc, n = 0; n < string.length; n++) {
				c1 = string.charCodeAt(n);
				enc = null;
	
				if (c1 < 128) {
					end++;
				} else if (c1 > 127 && c1 < 2048) {
					enc = String.fromCharCode(
					(c1 >> 6) | 192, (c1 & 63) | 128);
				} else if (c1 & 0xF800 != 0xD800) {
					enc = String.fromCharCode(
					(c1 >> 12) | 224, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128);
				} else { // surrogate pairs
					if (c1 & 0xFC00 != 0xD800) {
						throw new RangeError('Unmatched trail surrogate at ' + n);
					}
					
					var c2 = string.charCodeAt(++n);
					if (c2 & 0xFC00 != 0xDC00) {
						throw new RangeError('Unmatched lead surrogate at ' + (n - 1));
					}
					
					c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;
					enc = String.fromCharCode((c1 >> 18) | 240, 
						((c1 >> 12) & 63) | 128, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128);
				}
				
				if (enc !== null) {
					if (end > start) {
						utftext += string.slice(start, end);
					}
					
					utftext += enc;
					start = end = n + 1;
				}
			}
	
			if (end > start) {
				utftext += string.slice(start, string.length);
			}
			
			this.data = utftext;
			
			return this;
		};
		
		/* Private Methods
		-------------------------------*/
		var _getHtmlMap = function(table, quote) {
			var decimal, symbol, map = {},
				entities = { 38: '&amp;', 60: '&lt;', 62: '&gt;' };
			
			//check the table
			if (table !== HTML_SPECIALCHARS && table !== HTML_ENTITIES) {
				return false;
			}
			
			if (table === HTML_ENTITIES) {
				entities[160] = '&nbsp;';	entities[161] = '&iexcl;';
				entities[162] = '&cent;';	entities[163] = '&pound;';
				entities[164] = '&curren;';	entities[165] = '&yen;';
				entities[166] = '&brvbar;';	entities[167] = '&sect;';
				entities[168] = '&uml;';	entities[169] = '&copy;';
				entities[170] = '&ordf;';	entities[171] = '&laquo;';
				entities[172] = '&not;';	entities[173] = '&shy;';
				entities[174] = '&reg;';	entities[175] = '&macr;';
				entities[176] = '&deg;';	entities[177] = '&plusmn;';
				entities[178] = '&sup2;';	entities[179] = '&sup3;';
				entities[180] = '&acute;';	entities[181] = '&micro;';
				entities[182] = '&para;';	entities[183] = '&middot;';
				entities[184] = '&cedil;';	entities[185] = '&sup1;';
				entities[186] = '&ordm;';	entities[187] = '&raquo;';
				entities[188] = '&frac14;';	entities[189] = '&frac12;';
				entities[190] = '&frac34;';	entities[191] = '&iquest;';
				entities[192] = '&Agrave;';	entities[193] = '&Aacute;';
				entities[194] = '&Acirc;';	entities[195] = '&Atilde;';
				entities[196] = '&Auml;';	entities[197] = '&Aring;';
				entities[198] = '&AElig;';	entities[199] = '&Ccedil;';
				entities[200] = '&Egrave;';	entities[201] = '&Eacute;';
				entities[202] = '&Ecirc;';	entities[203] = '&Euml;';
				entities[204] = '&Igrave;';	entities[205] = '&Iacute;';
				entities[206] = '&Icirc;';	entities[207] = '&Iuml;';
				entities[208] = '&ETH;';	entities[209] = '&Ntilde;';
				entities[210] = '&Ograve;';	entities[211] = '&Oacute;';
				entities[212] = '&Ocirc;';	entities[213] = '&Otilde;';
				entities[214] = '&Ouml;';	entities[215] = '&times;';
				entities[216] = '&Oslash;';	entities[217] = '&Ugrave;';
				entities[218] = '&Uacute;';	entities[219] = '&Ucirc;';
				entities[220] = '&Uuml;';	entities[221] = '&Yacute;';
				entities[222] = '&THORN;';	entities[223] = '&szlig;';
				entities[224] = '&agrave;';	entities[225] = '&aacute;';
				entities[226] = '&acirc;';	entities[227] = '&atilde;';
				entities[228] = '&auml;';	entities[229] = '&aring;';
				entities[230] = '&aelig;';	entities[231] = '&ccedil;';
				entities[232] = '&egrave;';	entities[233] = '&eacute;';
				entities[234] = '&ecirc;';	entities[235] = '&euml;';
				entities[236] = '&igrave;';	entities[237] = '&iacute;';
				entities[238] = '&icirc;';	entities[239] = '&iuml;';
				entities[240] = '&eth;';	entities[241] = '&ntilde;';
				entities[242] = '&ograve;';	entities[243] = '&oacute;';
				entities[244] = '&ocirc;';	entities[245] = '&otilde;';
				entities[246] = '&ouml;';	entities[247] = '&divide;';
				entities[248] = '&oslash;';	entities[249] = '&ugrave;';
				entities[250] = '&uacute;';	entities[251] = '&ucirc;';
				entities[252] = '&uuml;';	entities[253] = '&yacute;';
				entities[254] = '&thorn;';	entities[255] = '&yuml;';
			}
		
			if(quote !== ENT_NOQUOTES) {
				entities[34] = '&quot;';
			} else {
				entities[39] = '&#39;';
			}
			
			// ascii decimals to real symbols
			for(decimal in entities) {
				symbol = String.fromCharCode(decimal);
				map[symbol] = entities[decimal];
			}
		
			return map;
		};
	});
	
	definition.isString = function(value) {
		return typeof value == 'string';
	};
	
	definition.injectSuper = function() {
		$.string = { isString: this.isString };
		
		var wrapper = function(method) {
			return function() {
				var args 		= $.args(), 
					data 		= args.shift(),
					instance 	= definition.load(data),
					results 	= instance[method].apply(instance, args);
				
				if($.isEden(results)) {
					results = results.get();
				}
				
				return results;
			};
		};
		
		for(var method in this.prototype) {
			if(method.indexOf('__') === 0 || method === 'get'
			|| typeof definition.prototype[method] != 'function') {
				continue;
			}
			
			$.string[method] = wrapper(method);
		}
		
		return this;
	};
	
	return definition.injectSuper();
};