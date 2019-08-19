/**
 * @author lg<lirufei0808@gmail.com>
 * @date 8/19/19
 * @description
 */

const APIDefineDataTypeToModel = {
	'ObjectId': 'string',
	'ObjectID': 'string',
	'String': 'string',
	'string': 'string',
	'Boolean': 'boolean',
	'boolean': 'boolean',
	'Integer': 'number',
	'Short': 'number',
	'Long': 'number',
	'Double': 'number',
	'Number': 'number',
	'Float': 'number',
	'Decimal128': 'number',
	'BigDecimal': 'number',
	'Date': 'date',
	'Document': 'object',
	'ArrayList': 'array',
	'Array': 'array',
	'array': 'array',
	'number': 'number',
	'date': 'date',
	'object': 'object',
	'Object': 'object',
	'Map': 'object',
	'Byte': 'number',
	'Bytes': 'buffer',
	'Null': 'string',
};
const MongoDataTypeToJava = {
	'ObjectID': 'String',
	'ObjectId': 'String',
	'Array': 'Array',
	'Boolean': 'Boolean',
	'Date': 'Date',
	'Number': 'Long',
	'Null': 'Null',
	'Decimal128': 'BigDecimal',
	'Document': 'Map',
	'Binary': 'Bytes',
	'Double': 'Double',
	'Int32': 'Integer',
	'Long': 'Long',
	'MinKey': 'Integer',
	'MaxKey': 'Integer',
	'Timestamp': 'Long',
	'String': 'String',
};
exports.APIDefineDataTypeToModel = APIDefineDataTypeToModel;
exports.MongoDataTypeToJava = MongoDataTypeToJava;
