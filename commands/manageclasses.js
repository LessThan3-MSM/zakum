var fs = require("fs");

module.exports = {
  addClass: function (classname, classes, channel) {
    if(classname == undefined || classname === ''){
      channel.send(':scream: Please supply the name of the class to add.');
      return;
    }
    if(!classes.includes(classname)){
      classes.push(classname);
      writeToMSMClassesFile(classes);
    }
    channel.send(`:thumbsup: Successfully added ${classname} to the list of allowable classes.`);

  },
  removeClass: function (classname, classes, channel){
    if(classname == undefined || classname === ''){
      channel.send(':scream: Please supply the name of the class to remove.');
      return;
    }

    let pos = classes.indexOf(classname);
    if(pos !== -1) {
      classes.splice(pos, 1);
      writeToMSMClassesFile(classes);
      channel.send(`:thumbsup: Successfully removed ${classname} from the list of allowable classes.`);
    }else{
      channel.send(`:eyes: ${classname} does not exist in the list of allowable classes and was therefore not removed.`);
    }

  }
};

function writeToMSMClassesFile(classes){
  fs.writeFile("./resources/maplestoryclasses.json", JSON.stringify(classes, null, 4), (err) => {
      if (err) {
          console.error(err);
      };
  });
}
