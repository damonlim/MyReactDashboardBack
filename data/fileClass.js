/**
 * FileClass used to hold latest library cell file read to the DB
 */
class FileClass {

  // Format: {
  //   'layout' : 'layout_2002_03_08.txt',
  //   'others' : 'others_2002_03_08.txt',
  //   'schematic' : 'schematic_2002_03_08.txt'
  // }
  static lastFile = {};
}

module.exports = {
  FileClass
};