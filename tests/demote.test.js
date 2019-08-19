const mock = require('./testHelper'); // all test files should require this
const demote = require('../commands/demote').demoteCommand;
jest.mock('fs'); // don't actually write any files

describe("add", () => {
	beforeEach(() => {
		mock.mockSendCall.mockClear();
  });
	test('Invalid member demote format', () => {
		let roster = [];
		demote(mock.newMessage("foo"), roster, './testRoster.json')
	  expect(mock.mockSendCall).toBeCalledWith("No input. Please use like so: !demote <IGN>");
	});

	test('Member not in roster', () => {
		let roster = [];
		demote(mock.newMessage("!demote buttloaf"), roster, './testRoster.json')
	  expect(mock.mockSendCall).toBeCalledWith("buttloaf is not in your guild roster! Please try again");
	});

	test('Successful removed', () => {
		let roster = [
			{
        "id": "Buttloaf#1234",
        "name": "Buttloaf",
        "rank": 12,
        "role": "Bowmaster",
        "leader": true
      }
		];
		expect(roster.length).toBe(1);
		expect(roster[0].leader).toBe(true);
		demote(mock.newMessage("!demote Buttloaf"), roster, './testRoster.json')
		expect(roster.length).toBe(1);
		expect(roster[0].leader).toBe(false);
	});
});