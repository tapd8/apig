/**
 * @author lg<lirufei0808@gmail.com>
 * @date 8/22/19
 * @description
 */
const moment = require('moment');
Date.prototype.toJSON = function(){
	return moment(this).format();
};
/*Date.parse = function(str){
	return moment(str).toDate();
};*/
