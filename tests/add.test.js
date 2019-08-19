const mock = require('./testHelper'); // all test files should require this
const add = require('../commands/add').addCommand;
jest.mock('fs'); // don't actually write any files

describe("add", () => {
	beforeEach(() => {
		mock.mockSendCall.mockClear();
  });
	test('Invalid member add format', () => {
		let roster = [];
		add(mock.newMessage("foo"), roster)
	  expect(mock.mockSendCall).toBeCalledWith("Invalid member add format. Example: \`!add Horntail#1234 Horntail Bowmaster 5 \`");
	});

	test('Invalid discord ID', () => {
		let roster = [];
		add(mock.newMessage("one ##two three four five"), roster, './testRoster.json')
	  expect(mock.mockSendCall).toBeCalledWith("Invalid Discord ID. Example: `Horntail#1234`");
	});

	test('Duplicate', () => {
		let roster = [];
		add(mock.newMessage("!add Buttloaf#1234 Buttloaf Bowmaster 5"), roster)
		expect(roster.length).toBe(1);
		add(mock.newMessage("!add Buttloaf#1234 Buttloaf Bowmaster 5"), roster)
		expect(mock.mockSendCall).toBeCalledWith("Buttloaf already exists on the LessThan3 guild roster!");
		expect(roster.length).toBe(1);
	});

	test('Successful submission', () => {
		let roster = [];
		add(mock.newMessage("!add Buttloaf#1234 Buttloaf Bowmaster 5"), roster)
		expect(roster.length).toBe(1);
		expect(roster[0].id).toBe("Buttloaf#1234");
		expect(roster[0].name).toBe("Buttloaf");
		expect(roster[0].rank).toBe(5);
		expect(roster[0].role).toBe("bowmaster");
		expect(roster[0].leader).toBe(false);
	});
});