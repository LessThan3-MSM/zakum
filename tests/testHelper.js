const fs = require("fs");

module.exports = {
	groups: [],
	pool: [],
	waitlist: [],
	leaders: [],
	mockSendCall: jest.fn(),
	newMessage: function (str){
		return { 
			content: str,
			channel: { send: this.mockSendCall }
		}
	}
}