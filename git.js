/* eslint-disable no-console */
const { execSync } = require('child_process');
const chalk = require('chalk');
const git = require('simple-git')();

git.fetch((a, s) => {
console.log(s)
})
git.status((error, status) => {
  const {files: filesChanged, current: currentBranch, ahead, behind} = status;

  if (error) {
    console.error(error);
    process.exit(1);
  }

  if (currentBranch === 'develop') {

  } else if (currentBranch === 'master') {

  } else {

  }
});

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