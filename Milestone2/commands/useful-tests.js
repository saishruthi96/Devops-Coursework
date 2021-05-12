const sshSync = require("../lib/ssh");
const chalk = require("chalk");

exports.command = "useful-tests";
exports.desc = "Provision and configure the configuration server";
exports.builder = yargs => {
  yargs.options({
    count: {
      alias: 'c',
      describe: "Number of iterations to run the tests",
      type: "number",
      default: 100
    },
    'gh-user': {
        describe: 'GitHub username',
        type: 'string',
      },
      'gh-pass': {
        describe: 'GitHub password',
        type: 'string',
      },
  });
};

exports.handler = async argv => {
    const { c , ghUser, ghPass} = argv;
  
    (async () => {
      await run(c, ghUser, ghPass);
    })();
  };

async function run(c,ghUser, ghPass) {
  if (!ghUser || !ghPass) {
    console.log("GITHUB CREDENTIALS MISSING!!!");
    process.exit(1);
  }
  // Check for any running git process and delete;
  console.log(chalk.keyword('orange')('Delete any git processes...'));
  let result = await sshSync(`rm -f iTrust2-v8/.git/index.lock`, 'vagrant@192.168.33.20');
  result = await sshSync(`rm -f iTrust2-v8/.git/head.lock`, 'vagrant@192.168.33.20');
  if (result.error) {
    console.log(result.error);
    process.exit(result.status);
  }

//   Clone a fresh copy of the iTrust repository

  console.log(chalk.keyword('orange')('Cloning the iTrust repository...'));

  result = await sshSync(`git clone https://${ghUser}:${ghPass}@github.ncsu.edu/engr-csc326-staff/iTrust2-v8.git`, 'vagrant@192.168.33.20');
  if (result.error) {
    console.log(result.error);
    process.exit(result.status);
  }


//   Running the test suite analysis

  console.log(chalk.keyword('orange')('Running the test suite'));
  result = await sshSync(`node mutation_driver.js ${c}`, "vagrant@192.168.33.20");
  if (result.error) {
    console.log(result.error);
    process.exit(result.status);
  }
}
