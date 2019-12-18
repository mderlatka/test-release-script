/* eslint-disable no-console */
const { execSync } = require('child_process');
const chalk = require('chalk');
const git = require('simple-git/promise')();

/**
 * @namespace GitUpdater
 */
const GitUpdater = {
  logHeader: function(text) {
    console.log(chalk.blue.bold('\n' + text));
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
   * Executes script, using the output of parent process.
   * @param {string} script 
   */
  execScript: function(script) {
    try {
      this.logHeader(`Executing script "${script}"`);
      execSync(script, { stdio: 'inherit' });
    } catch(err) {
      this.stopWithErrorLog(`Executing of script "${script}" failed!`)
    }
  },


  /**
   * Upgrades version of repository.
   * @param {string} versionType 
   */
  upgradeVersion: function(versionType) {
    this.logHeader(`Upgrading version...`);

    if (versionType === 'prerelease') {
      const { version } = require('./package.json');
      const rcAlreadyExist = /\d-\d/.test(version)

      if (rcAlreadyExist) {
        this.execScript('yarn version --prerelease');
      } else {
        this.execScript('yarn version --preminor');
      }
    } else if (versionType === 'release') {
      this.execScript('yarn version --minor');
    }
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

      console.log(`${branch} branch ${status.behind ? 'has been updated.' : 'is up to date'}`);
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
      await git.rebase([rebaseTarget, branchToRebase])
      console.log(`Branch ${branchToRebase} rebased onto ${rebaseTarget}...`);
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
  prepareLocalRepository: async function(releaseType) {
    let status;

    try {
      status = await git.status();
    } catch(err) {
      this.stopWithErrorLog(`Something is wrong!`, err);
    }

    if (status.files.length) {
      this.stopWithErrorLog(`You have some uncommitted changes!`);
    }

    this.logHeader(`Updating local branches...`);
    await this.updateBranch('develop');

    if (releaseType === 'release') {
      await this.updateBranch('master')
      await this.rebaseBranches('develop', 'master')
    }
  },

  /**
   * Updates git repository after release process.
   * - Pushes version commits and tags
   * - Makes develop up to date with master
   */
  finishRelease: async function(releaseType) {
    this.logHeader('Updating repository after release...')

    try {
      if (releaseType === 'release') {
        await git.push('origin', 'master');
        await git.pushTags('origin');
        await this.rebaseBranches('master', 'develop');
        await git.push('origin', 'develop');
      } else {
        await git.push('origin', 'develop');
        await git.pushTags('origin');
      }
    } catch(err) {
      this.stopWithErrorLog(`Something went wrong!`, err);
    }
  },

  /**
   * 
   * @param {string} releaseType
   */
  makeRelease: async function(releaseType) {
    await this.prepareLocalRepository(releaseType);

    this.execScript('yarn install');
    this.execScript('yarn lint');
    this.execScript('yarn test:unit');

    this.upgradeVersion(releaseType);
    this.execScript('yarn deploy');

    await this.finishRelease(releaseType);
  }
}

// if () {
  GitUpdater.makeRelease(process.argv[2]);
// }
