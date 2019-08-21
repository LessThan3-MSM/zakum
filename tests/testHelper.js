const fs = require("fs");

module.exports = {
	groups: [],
	pool: [],
	waitlist: [],
	leaders: [],
	mockSendCall: jest.fn(),
	newMessage: function (str){
		return {
			author: {
				username: "Buttloaf",
				discriminator: "1234",
			},
			content: str,
			channel: { send: this.mockSendCall }
		}
	}
}
