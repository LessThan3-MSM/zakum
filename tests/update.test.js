const mock = require('./testHelper'); // all test files should require this
const update = require('../commands/update').update;
const {MAPLE_STORY_CLASSES} = require("./../constants.json")
jest.mock('fs'); // don't actually write any files
let roster = [
  {
    "id": "Buttloaf#1234",
    "name": "Buttloaf",
    "rank": 12,
    "role": "Bowmaster",
    "leader": true
  }
];

describe("find", () => {
	beforeEach(() => {
		mock.mockSendCall.mockClear();
    roster = [
      {
        "id": "Buttloaf#1234",
        "name": "Buttloaf",
        "rank": 12,
        "role": "Bowmaster",
        "leader": true
      }
    ];
  });
	test('Cannot find member name', () => {
		update(mock.newMessage("!update id Tomcicle"), roster)
	  expect(mock.mockSendCall).toBeCalledWith("Successfully updated the id of Buttloaf!");
	});
  test('Cannot find member name', () => {
    roster[0].id = "NotButtloaf#1234"
    update(mock.newMessage("!update id NotButtloaf"), roster)
    expect(mock.mockSendCall).toBeCalledWith(`Zakum cannot find Buttloaf#1234 on the guild roster! Try updating your id first!`);
  });
  test('Update class', () => {
    update(mock.newMessage("!update class icelightning"), roster, MAPLE_STORY_CLASSES)
    expect(mock.mockSendCall).toBeCalledWith(`Successfully updated the class of ${roster[0].name}!`);
  });
  test('Update dps', () => {
    update(mock.newMessage("!update dps 16.52"), roster, MAPLE_STORY_CLASSES)
    expect(mock.mockSendCall).toBeCalledWith(`Successfully updated the dps of ${roster[0].name}!`);
  });
  test('Invalid dps', () => {
    update(mock.newMessage("!update dps 1forest1"), roster, MAPLE_STORY_CLASSES)
    expect(mock.mockSendCall).toBeCalledWith("Invalid dps value entered. Example: \`!update dps 13.37 \`");
  });
  test('Invalid name', () => {
    update(mock.newMessage("!update dps Boop 42"), roster, MAPLE_STORY_CLASSES)
    expect(mock.mockSendCall).toBeCalledWith("Zakum cannot find Boop on the guild roster! Try updating your id first!");
  });
  test('Update id', () => {
    update(mock.newMessage("!update id Buttloaf"), roster, MAPLE_STORY_CLASSES)
    expect(mock.mockSendCall).toBeCalledWith(`Successfully updated the id of ${roster[0].name}!`);
  });
  test('Update name', () => {
    update(mock.newMessage("!update name Lappu"), roster, MAPLE_STORY_CLASSES)
    expect(mock.mockSendCall).toBeCalledWith(`Successfully updated the name of Lappu!`);
  });
});
