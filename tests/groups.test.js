const mock = require('./testHelper'); // all test files should require this
const fg = require('../commands/groups').formGroups;
jest.mock('fs'); // don't actually write any files

describe("groups", () => {
	beforeEach(() => {
		mock.mockSendCall.mockClear();
  });
	test('No Input', () => {
		let roster = [];
		let groups = [
			[],
			[]
		];
		let pool = [];
		let waitlist = [];
		console.log("[roster, groups, pool, waitlist]")
		console.log([roster, groups, pool, waitlist])
		fg(mock.newMessage("!groups ", roster, groups, pool, waitlist), roster)
	});
});