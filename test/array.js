!function() {
	var eden = require('eden');
	var unit = eden().get('unit');
	var test = unit.extend(function($, public) {
		/* Public Properties
		-------------------------------*/
		public.TEST1 	= 'Combine with Keys';
		public.TEST2 	= 'Combine with Keys Length';
		public.TEST3 	= 'Combine with Values';
		public.TEST4 	= 'Combine with Values Length';
		public.TEST5 	= 'Each extra argument';
		public.TEST6 	= 'Each scope override';
		public.TEST7 	= 'Each key';
		public.TEST8 	= 'Each value';
		public.TEST9 	= 'Get length';
		public.TEST10 	= 'Get key';
		public.TEST11 	= 'Get type';
		public.TEST12 	= 'Has true';
		public.TEST13 	= 'Has false';
		public.TEST14 	= 'Empty';
		public.TEST15 	= 'Keys';
		public.TEST16 	= 'Keys length';
		public.TEST17 	= 'Map';
		public.TEST18 	= 'To Query';
		public.TEST19 	= 'To String';
		public.TEST20 	= 'Keys';
		public.TEST21 	= 'Keys length';
	
		/* Private Properties
		-------------------------------*/
		/* Loader
		-------------------------------*/
		public.__load = function() {
			return new this();
		};
		
		/* Construct
		-------------------------------*/
		public.__construct = function() {
			this.__parent.__construct();
			this.list = eden([1,2,3,4]);
		};
		
		/* Public Methods
		-------------------------------*/
		public.testCombineWithKeys = function() {
			var object = this.list.combineWithKeys([10, 11, 12, 13, 14]);
			this.assertSame(2, object[11], this.TEST1);
			this.assertSame(4, object.size(), this.TEST2);
		};
	
		public.testCombineWithValues = function() {
			var object = this.list.combineWithValues([10, 11, 12, 13, 14]);
			this.assertSame(11, object[2], this.TEST3);
			this.assertSame(4, object.size(), this.TEST4);
		};
		
		public.testEach = function() {
			var list = this.list, scope = { foo: 'bar' };
			this.list.each(function(key, value, extra, unit) {
				unit.assertSame('another', extra, unit.TEST5);
				unit.assertSame('bar', this.foo, unit.TEST6);
				unit.assertHasKey(key, list, unit.TEST7);
				unit.assertSame(list[key], value, unit.TEST8);
			}, scope, 'another', this);
		};
		
		public.testGet = function() {
			var list = this.list.get();
			this.assertCount(4, list, this.TEST9);
			this.assertSame(3, list[2], this.TEST10);
		};
		
		public.testGetType = function() {
			this.assertSame('array', this.list.getType(), this.TEST11);
		};
		
		public.testHas = function() {
			this.assertTrue(this.list.has(3), this.TEST12);
			this.assertFalse(this.list.has(5), this.TEST13);
		};
		
		public.testIsEmpty = function() {
			this.assertFalse(this.list.isEmpty(), this.TEST14);
		};
		
		public.testKeys = function() {
			var keys = this.list.keys();
			this.assertSame(1, keys[1], this.TEST15);
			this.assertCount(4, keys, this.TEST16);
		};
		
		public.testMap = function() {
			this.list.map(function(key, value) {
				return value + 1;
			});
			
			this.assertSame(3, this.list[1], this.TEST17);
		};
		
		public.testToQuery = function(prefix) {
			this.assertSame('0=2&1=3&2=4&3=5', this.list.toQuery(), this.TEST18);
		};
		
		public.testToString = function() {
			this.assertSame('[2,3,4,5]', this.list.toString(), this.TEST19);
		};
		
		public.testValues = function() {
			var values = this.list.values();
			this.assertSame(3, values[1], this.TEST20);
			this.assertCount(4, values, this.TEST21);
		};
		
		/* Private Methods
		-------------------------------*/
	});
	
	unit.cli.call(test, 'array');
}();