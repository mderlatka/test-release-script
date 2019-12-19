/* eslint-disable no-console */
const { execSync } = require('child_process');
const readline = require('readline');
const chalk = require('chalk');
const git = require('simple-git/promise')();
const releaseType = process.argv[2];

/**
 * @namespace ReleaseInterface
 */
const ReleaseInterface = {
  logHeader(text) {
    console.log(chalk.blue.bold(`\n${text}`));
  },

  /**
   * Logs error information and exits the process with error
   * @param {string} errorInfo
   * @param {any} error
   */
  stopWithErrorLog(errorInfo, error) {
    console.error(chalk.red.bold(`ERROR: ${errorInfo}`));
    console.error(error);
    process.exit(1);
  },

  /**
   * Executes script, using the output of parent process.
   * @param {string} script
   */
  execScript(script) {
    try {
      this.logHeader(`Executing script "${script}"`);
      execSync(script, { stdio: 'inherit' });
    } catch (err) {
      this.stopWithErrorLog(`Executing of script "${script}" failed!`, err);
    }
  },


  /**
   * Upgrades version of repository.
   * @param {string} versionType
   */
  upgradeVersion(versionType) {
    this.logHeader('Upgrading version...');

    if (versionType === 'prerelease') {
      // eslint-disable-next-line global-require
      const { version } = require('../package.json');
      const rcAlreadyExist = /\d-\d/.test(version);

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
  async updateBranch(branch) {
    try {
      await git.checkout(branch);
      const status = await git.status();

      if (status.ahead) {
        this.stopWithErrorLog(`Your local ${status.current} is ${status.ahead} commits ahead ${status.tracking}`);
      }

      if (status.behind) {
        await git.pull('origin', branch, { '--rebase': 'true' });
      }

      console.log(`${branch} branch ${status.behind ? 'has been updated.' : 'is up to date'}`);
    } catch (err) {
      this.stopWithErrorLog(`While updating ${branch}!`, err);
    }
  },

  /**
   * Rebase branch onto target branch.
   * @param {string} rebaseTarget
   * @param {string} branchToRebase
   */
  async rebaseBranches(rebaseTarget, branchToRebase) {
    try {
      await git.rebase([rebaseTarget, branchToRebase]);
      console.log(`Branch ${branchToRebase} rebased onto ${rebaseTarget}`);
    } catch (err) {
      console.log(err.git)
      // try {
      //   await git.rebase({ '--abort': null });
      // } catch (err) {
        this.stopWithErrorLog('Something is wrong!', err);
      // }
    }
  },

  /**
   * Updates local git repository with origin, before release start.
   * - develop branch for operation argument equal "prerelease"
   * - develop and master for operation argument equal "release"
   * - rebase master onto develop for operation argument equal "release"
   * @param {string} operation
   */
  async prepareLocalRepository(operation) {
    let status;

    try {
      status = await git.status();
    } catch (err) {
      this.stopWithErrorLog('Something is wrong!', err);
    }

    if (status.files.length) {
      this.stopWithErrorLog('You have some uncommitted changes!');
    }

    this.logHeader('Updating local branches...');
    await this.updateBranch('develop');

    if (operation === 'release') {
      await this.updateBranch('master');
      await this.rebaseBranches('develop', 'master');
    }
  },

  /**
   * Updates git repository after release process.
   * - Pushes commits and tags
   * - Makes develop up to date with master if normal release happen
   * @param {string} operation
   */
  async finishRelease(operation) {
    this.logHeader('Updating repository after release...');

    try {
      if (operation === 'release') {
        await git.push('origin', 'master');
        console.log('Pushed master to origin');
        await git.pushTags('origin');
        console.log('Pushed tags to origin');
        await this.rebaseBranches('master', 'develop');
        await git.push('origin', 'develop');
        console.log('Pushed develop to origin');
      } else {
        await git.push('origin', 'develop');
        console.log('Pushed develop to origin');
        await git.pushTags('origin');
        console.log('Pushed tags to origin');
      }
    } catch (err) {
      this.stopWithErrorLog('Something went wrong!', err);
    }
  },

  /**
   * Runs whole release process.
   * @param {string} operation
   */
  async makeRelease(operation) {
    await this.prepareLocalRepository(operation);

    this.execScript('yarn install');
    this.execScript('yarn lint');
    this.execScript('yarn test:unit');

    this.upgradeVersion(operation);
    this.execScript('yarn deploy');

    await this.finishRelease(operation);
  },
};

if (releaseType !== 'pre-release' || releaseType !== 'release') {
  /**
   * To prevent accidental release, creates question with confirm prompt.
   */
  const input = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
  });

  console.log(`You are trying to run ${releaseType}, are you sure to continue this process? ${chalk.blue.bold('[y/n]')}`);
  input.prompt();

  input.on('line', (answer) => {
    switch (answer.trim().toLowerCase()) {
      case 'y':
        input.close();
        ReleaseInterface.makeRelease(releaseType);
        break;
      case 'n':
        process.exit(0);
        break;
      default:
        console.log('incorrect answer!');
        input.prompt();
        break;
    }
  });
}
