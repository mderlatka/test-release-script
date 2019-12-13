/* eslint-disable no-console */
const { execSync } = require('child_process');
const { EOL } = require('os');
const chalk = require('chalk');

function pushBranchAndTags() {
  const branchName = execSync('git branch | grep \\* | cut -d \' \' -f2').toString().trim()
  console.log(`${EOL}${chalk.bgBlue.white(`Pushing branch ${branchName}...`)}${EOL}`);

  console.log(execSync('git push').toString());
  console.log(execSync('git push --tags').toString());
}

function rebaseDevelopWithMaster() {
  try {
    console.log(`${EOL}${chalk.bgBlue.white(`Rebasing branch develop onto master${branchName}...`)}${EOL}`);
    console.log(execSync('git rebase master develop').toString());
  } catch (err) {
    const processOutput = err.stdout.toString();
    const errorInfo = err.stderr.toString();

    console.log(`${EOL}run: "git rebase master develop"${EOL}`);

    console.log(processOutput);
    console.log(chalk.bgRed.white('!!!  WATCH OUT  !!!'));
    console.log('You are trying to rebase develop onto master');
    console.log(`${EOL}${chalk.bgRed.white(errorInfo)}`);

    if (processOutput.search('CONFLICT') > -1) {
      console.log(chalk.red('Some CONFLICTS were found!'));
      execSync('git rebase --abort');
      console.log(`Rebase was aborted. Please rebase it manually!${EOL}`);
    }

    process.exit(1);
  }
}

function updateGitOrigin(branchName) {
  if (branchName === 'develop') {
    pushBranchAndTags();
  } else if (branchName === 'master') {
    pushBranchAndTags();
    rebaseDevelopWithMaster();
    pushBranchAndTags();
  } else {
    console.error(`${EOL}${chalk.bgRed.white(`Something is wrong, you are on ${branchName} branch!`)}`);
    console.error(`${chalk.bgRed.white('Automatic update of git origin is available on develop or master only!')}`);
    process.exit(1);
  }
}

updateGitOrigin(execSync('git branch | grep \\* | cut -d \' \' -f2').toString().trim());
