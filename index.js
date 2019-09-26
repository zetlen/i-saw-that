const chalk = require('chalk'),
moment = require('moment'),
childProcess = require('child_process'),
columnify = require('columnify');

module.exports = pkgName => {
  const out = [];
  try {
    const distTags = {};
    require('child_process').execSync(`npm dist-tags ls ${pkgName}`, { encoding: 'utf8' })
    .split('\n')
    .forEach(s => {
      const [tag, ver] = s.split(':').map(w => w.trim());
      distTags[ver] = tag;
    })
    const time = JSON.parse(require('child_process').execSync(`npm info ${pkgName} time --json`));
    const publishedVersions = [];
    for (let [ver, ts] of Object.entries(time)) {
      if (ver !== 'created' && ver !== 'modified') {
        const row = {};
        const published = moment(ts).calendar();
          row.version = chalk.bgBlack.bold.hex('#9ADEDE')(ver);
          row.published = chalk.bgBlack.bold.hex('#64C0C0')(published);
        if (distTags[ver]) {
          row.tag = chalk.bgBlack.bold.hex('#9ADEDE')(distTags[ver]);
        }
        publishedVersions.push(row);
      }
    }
    out.push(chalk.bgBlack.bold.whiteBright(pkgName) + chalk.bgBlack.bold.hex('#3DA0A0')(' on the NPM registry:\n'));
    out.push(columnify(publishedVersions, {
      columnSplitter: ' ',
      headingTransform: h => chalk.bgBlack.underline.hex('#3DA0A0')(h.toLowerCase()),
      config: {
        version: {
          align: 'right'
        },
        tag: {
          showHeaders: false
        }
      }
    }))
  } catch (e) {
    // nothing
    out.push('Could not get versions', e);
  }

  return out.join('\n') + '\n';
};
