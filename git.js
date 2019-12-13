/* eslint-disable no-console */
const { execSync } = require('child_process');
const { EOL } = require('os');
const chalk = require('chalk');

/**
 * Returns branch name you are currently on
 * @returns {string}
 */
function getCurrentBranchName() {
  return execSync('git branch | grep \\* | cut -d \' \' -f2').toString().trim();
}

/**
 * Pushes tags and branch, you are currently on
 */
function pushCurrentBranchAndTags() {
  console.log(chalk.blue.bold(`Pushing branch ${getCurrentBranchName()}...`));

  console.log(execSync('git push').toString());
  console.log(execSync('git push --tags').toString());
}

/**
 * Rebasing branches
 * @param {string} branchToRebase branch to checkout on
 * @param {string} rebaseTarget branch to rebase with
 */
function rebaseBranches(branchToRebase, rebaseTarget) {
  try {
    console.log(chalk.blue.bold(`Rebasing branch ${branchToRebase} onto ${rebaseTarget}...`));
    console.log(execSync(`git rebase ${rebaseTarget} ${branchToRebase}`).toString());
  } catch (err) {
    const processOutput = err.stdout.toString();
    const errorInfo = err.stderr.toString();

    console.log(processOutput);
    console.log(chalk.bgRed.white('!!!  ERROR  !!!'));
    console.log(`${EOL}${chalk.red(errorInfo)}`);

    if (processOutput.search('CONFLICT') > -1) {
      console.log(chalk.red('Some CONFLICTS were found!'));
      execSync('git rebase --abort');
      console.log(`Rebase was aborted. Please rebase it manually!`);
    }

    process.exit(1);
  }
}

const branchName = getCurrentBranchName();

if (branchName === 'develop') {
  pushCurrentBranchAndTags();
} else if (branchName === 'master') {
  pushCurrentBranchAndTags();
  rebaseBranches('develop', 'master');
  pushCurrentBranchAndTags();
} else {
  console.error(`${EOL}${chalk.bgRed.white(`Something is wrong, you are on ${branchName} branch!`)}`);
  console.error(`${chalk.bgRed.white('Automatic update of git origin is available on develop or master only!')}`);
  process.exit(1);
}