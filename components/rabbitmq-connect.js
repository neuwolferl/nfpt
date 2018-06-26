// Load the NoFlo interface
const noflo = require('noflo');
// Also load any other dependencies you have

require('dotenv').config();
const amqp = require('amqplib/callback_api');
// Implement the getComponent function that NoFlo's component loader
// uses to instantiate components to the program
exports.getComponent = () => {
	// Start by instantiating a component
	const c = new noflo.Component();
	console.log('CREATING CONNECTION');
	// Provide some metadata, including icon for visual editors
	c.description = 'Connects to a Rabbitmq server';
	c.icon = 'file';

	// Declare the ports you want your component to have, including
	// their data types
	c.inPorts.add('previousConnection', {
		datatype: 'object'
	});
  	// c.inPorts.add('in2', {
	// 	datatype: 'string'
	// });
	c.outPorts.add('connection', {
		datatype: 'object'
	});
	c.outPorts.add('connectionerror', {
		datatype: 'object'
	});

	// Implement the processing function that gets called when the
	// inport buffers have packets available
	c.process(((input, output) => {
		// Precondition: check that the "in" port has a data packet.
		// Not necessary for single-inport components but added here
		// for the sake of demonstration
		if (input.hasData('previousConnection')) {
			output.sendDone({
				connection: input.getData('previousConnection')
			});
			return;
		}

		// Since the preconditions matched, we can read from the inport
		// buffer and start processing
		
		amqp.connect(`amqp://${process.env.MQUSER}:${process.env.MQPASSWORD}@${process.env.MQHOST}`, function(err, conn) {
			if (err != null) {
				output.done(err);
				return;
			}
			output.sendDone({
				connection: conn
			});
			return;
		  });
		
		// const filePath = input.getData('in');
		// fs.readFile(filePath, 'utf-8', (err, contents) => {
		// 	// In case of errors we can just pass the error to the "error"
		// 	// outport
		// 	if (err) {
		// 		output.done(err);
		// 		return;
		// 	}

		// 	// Send the file contents to the "out" port
		// 	output.send({
		// 		out: contents
		// 	});
		// 	// Tell NoFlo we've finished processing
		// 	output.done();
		// });
	}));

	// Finally return to component to the loader
	return c;
}