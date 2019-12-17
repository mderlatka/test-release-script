/* eslint-disable no-console */
const { execSync } = require('child_process');
const chalk = require('chalk');
const git = require('simple-git/promise')();

const versionArg = JSON.parse(process.env.npm_config_argv).original[1]

const establishOperationType = () => {
  const operationTypes = {
    prerelease: ['--prepatch', '--preminor', '--premajor', '--prerelease'],
    release: ['--patch', '--minor', '--major'],
  };

  let currentOperationType;

  Object.entries(operationTypes).forEach(([key, value]) => {
    if(value.includes(versionArg)) {
      currentOperationType = key;
    }
  })

  return currentOperationType
}

// git.status((error, status) => {
//   const { current: currentBranch } = status;

//   if (error) {
//     console.error(error);
//     process.exit(1);
//   }

//   if (currentBranch === 'develop') {
//   } else if (currentBranch === 'master') {
//   } else {
//     console.error(chalk.red.bold(`Something is wrong, you are on ${currentBranch} branch!`));
//     console.error(chalk.red.bold('Automatic update of git origin is available on develop or master branch only!'));
//     process.exit(1);
//   }
// });

const test = async () => {
  let status;

  console.log(await git.fetch())

  try {
    status = await git.status()
  } catch(err) {
    console.error(chalk.red.bold(`ERROR: Something is wrong!`));
    console.error(error);
    process.exit(1);
  }

  if (status.files.length) {
    console.error(chalk.red.bold(`ERROR: You have some uncommitted changes!`));
    process.exit(1);
  }

  if (status.ahead) {
    console.error(chalk.red.bold(`ERROR: Your local ${status.current} is ${status.ahead} commits ahead ${status.tracking}`));
    process.exit(1);
  }

  process.exit(1);
};

// const cos = async () => {
//   await
// }

test();

const updateBranches = async (operation) => {
  let status;

  await git.checkoutLocalBranch('develop');
  status = await git.pull();

  console.log(status)
  if (operation === 'release') {

  }
}
// console.log(execSync('git status').toString())


// /**
//  * @namespace Git
//  */
// const Git = {
//   /**
//    * Returns branch name you are currently on
//    * @returns {string}
//    */
//   get currentBranch() {
//     return execSync('git branch | grep \\* | cut -d \' \' -f2').toString().trim();
//   },

//   pushCurrentBranch: function() {
//     console.log(chalk.blue.bold(`Pushing branch ${this.currentBranch}...`));
//     console.log(execSync('git push').toString());
//   },

//   pushTags: function() {
//     console.log(chalk.blue.bold(`Pushing tags...`));
//     console.log(execSync('git push --tags').toString());
//   },

//   fetch: function() {
//     console.log(chalk.blue.bold(`Pushing tags...`));
//     console.log(execSync('git fetch').toString());
//   },

//   status: function() {
//     const = execSync('git status').toString();
//   }

//   /**
//    * Rebasing branches
//    * @param {string} branchToRebase branch to checkout on
//    * @param {string} rebaseTarget branch to rebase with
//    */
//   rebaseBranches: function(branchToRebase, rebaseTarget) {
//     try {
//       console.log(chalk.blue.bold(`Rebasing branch ${branchToRebase} onto ${rebaseTarget}...`));
//       console.log(execSync(`git rebase ${rebaseTarget} ${branchToRebase}`).toString());
//     } catch (err) {
//       const processOutput = err.stdout.toString();
//       const errorInfo = err.stderr.toString();
  
//       console.log(processOutput);
//       console.log(chalk.bgRed.white('!!!  ERROR  !!!'));
//       console.log(chalk.red(errorInfo));
  
//       if (processOutput.search('CONFLICT') > -1) {
//         console.log(chalk.red.bold('Some CONFLICTS were found!'));
//         execSync('git rebase --abort');
//         console.log(chalk.red(`Rebase was aborted. Please rebase ${branchToRebase} onto ${rebaseTarget} manually!`));
//       }
  
//       process.exit(1);
//     }
//   }
// }

// if (Git.currentBranch === 'develop') {
//   Git.pushCurrentBranch();
//   Git.pushTags();
// } else if (Git.currentBranch === 'master') {
//   Git.pushCurrentBranch();
//   Git.pushTags();
//   Git.rebaseBranches('develop', 'master');
//   Git.pushCurrentBranch();
// } else {
//   console.error(chalk.bgRed.white(`Something is wrong, you are on ${Git.currentBranch} branch!`));
//   console.error(chalk.bgRed.white('Automatic update of git origin is available on develop or master branch only!'));
//   process.exit(1);
// }