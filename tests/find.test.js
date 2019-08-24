const mock = require('./testHelper'); // all test files should require this
const find = require('../commands/find').findCommand;
jest.mock('fs'); // don't actually write any files

describe("find", () => {
	beforeEach(() => {
		mock.mockSendCall.mockClear();
  });
	test('No Iput', () => {
		let roster = [];
		find(mock.newMessage("!find"), roster)
	  expect(mock.mockSendCall).toBeCalledWith("No input, please use like this: !find <IGN>");
	});

	test('Cannot find member', () => {
		let roster = [];
		find(mock.newMessage("!find Buttloaf"), roster)
	  expect(mock.mockSendCall).toBeCalledWith("Zakum can't find Buttloaf on the guild roster.");
	});

	test('Member found', () => {
		let roster = [
			{
        "id": "Buttloaf#1234",
        "name": "Buttloaf",
        "rank": 12,
        "role": "Bowmaster",
        "leader": true
      }
		];
		find(mock.newMessage("!find Buttloaf"), roster)
		expect(mock.mockSendCall).toBeCalledWith(`\`\`\`ID: ${roster[0].id}\nName: ${roster[0].name}\nClass: ${roster[0].role}\nDPS: ${roster[0].rank}\`\`\``);
	});
});
