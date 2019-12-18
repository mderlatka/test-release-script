/* eslint-disable no-console */
const chalk = require('chalk');
const git = require('simple-git/promise')();

const scriptName = process.env.npm_lifecycle_event;
const operationType = process.argv[2];

/**
 * @namespace GitUpdater
 */
const GitUpdater = {



  /**
   * Returns operation type that depend on argument passed to yarn version script
   * @param {string} versionArg
   * @returns {('prerelease'|'release')}
   */
  bumpUpVersion: function(scriptArg) {

  },

  /**
   * Logs error information and exits the process with error
   * @param {string} errorInfo
   * @param {any} error
   */
  stopWithErrorLog: function(errorInfo, error) {
    console.error(chalk.red.bold(`ERROR: ${errorInfo}`));
    console.error(error);
    process.exit(1);
  },

  /**
   * Check for uncommitted files on branch you are currently.
   * @returns {number} amount of uncommitted files that contains changes.
   */
  checkForUncommittedFiles: async function() {
    let status;

    try {
      status = await git.status();
    } catch(err) {
      this.stopWithErrorLog(`Something is wrong!`, err);
    }

    return status.files.length;
  },

  /**
   * Updates branch with origin.
   * @param {string} branch 
   */
  updateBranch: async function(branch) {
    try {
      await git.checkout(branch)
      const status = await git.status()

      if (status.ahead) {
        this.stopWithErrorLog(`Your local ${status.current} is ${status.ahead} commits ahead ${status.tracking}`);
      }

      if (status.behind) {
        await git.pull('origin', branch, { '--rebase': 'true' });
      }

      console.log(chalk.blue.bold(`${branch} branch ${status.behind ? 'has been updated.' : 'is up to date'}`));
    } catch(err) {
      this.stopWithErrorLog(`While updating ${branch}!`, err);
    }
  },

  /**
   * Rebase branch onto target branch.
   * @param {string} rebaseTarget
   * @param {string} branchToRebase
   */
  rebaseBranches: async function(rebaseTarget, branchToRebase) {
    try {
      console.log(chalk.blue.bold(`Rebasing branch ${branchToRebase} onto ${rebaseTarget}...`));
      await git.rebase([rebaseTarget, branchToRebase])
    } catch(err) {
      this.stopWithErrorLog(`Something is wrong!`, err);
    }
  },

  /**
   * Updates local git repository with origin, before release happens.
   * - develop branch for operation argument equal "prerelease"
   * - develop and master for operation argument equal "release"
   * - rebase master onto develop for operation argument equal "release"
   * @param {string} operation
   */
  prepareRelease: async function(scriptArg) {
    const operationType = this.establishOperationType(scriptArg);
    const amountOfUncommittedFiles = await this.checkForUncommittedFiles();

    if (amountOfUncommittedFiles) {
      this.stopWithErrorLog(`You have some uncommitted changes!`);
    }

    console.log(chalk.blue(`Updating branches...`));
    await this.updateBranch('develop')
  
    if (scriptName === 'release') {
      await this.updateBranch('master')
      await this.rebaseBranches('develop', 'master')
    }
  },

  /**
   * Updates git repository after release process.
   * - Pushes version commits and tags
   * - Makes develop up to date with master
   */
  finishRelease: async function(scriptArg) {
    const operationType = this.establishOperationType(scriptArg);

    try {
      if (scriptName === 'pre-release') {
        await git.push('origin', 'develop');
        await git.pushTags('origin');
      } else if (scriptName === 'release') {
        await git.push('origin', 'master');
        await git.pushTags('origin');
        await this.rebaseBranches('master', 'develop');
        await git.push('origin', 'develop');
      }
    } catch(err) {
      this.stopWithErrorLog(`Something went wrong!`, err);
    }
  }
}

if (operationType === 'prepare') {
  console.log(chalk.bgBlue.white(' Running "preversion" script... '));
  GitUpdater.prepareRelease();
} else if (operationType === 'finish') {
  console.log(chalk.bgBlue.white(' Running "postversion" script... '));
  GitUpdater.finishRelease();
} else {
  GitUpdater.stopWithErrorLog('This script should run with "preversion" and "postversion" scripts only!')
}
