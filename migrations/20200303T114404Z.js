const { BagItProfile } = require('../bagit/bagit_profile');
const { Constants } = require('../core/constants');
const { Context } = require('../core/context');
const { InternalSetting } = require('../core/internal_setting');
const path = require('path');
const { TestUtil } = require('../core/test_util');

/**
 * Migration 20200227T120404Z.js adds the BTR BagIt profile.
 *
 */
function run() {
    let migration = path.parse(__filename).name;
    let migrationName = `Migration_${migration}`;
    let record = InternalSetting.firstMatching('name', migrationName);
    if (record && record.value) {
        return;
    }
    Context.logger.info(`Starting migration ${migration}`);

    loadBTRProfile();

    Context.logger.info(`Finished ${migration}`);
    let now = new Date().toISOString();
    let migrationRecord = new InternalSetting({
        name: migrationName,
        value: now,
        userCanDelete: false
    });
    migrationRecord.save();
}

function loadBTRProfile() {
    let profile = BagItProfile.find(Constants.BUILTIN_PROFILE_IDS['btr'])
    if (!profile) {
        let jsonFile = path.join(__dirname, '..', 'profiles', 'btr-v0.1.json');
        Context.logger.info(`Installing 'BTR Profile' from ${jsonFile}`);
        profile = BagItProfile.load(jsonFile);
        profile.isBuiltIn = true;
        profile.userCanDelete = false;
        profile.save();
    } else {
        Context.logger.info(`'BTR Profile' is already installed`);
    }
}

module.exports.run = run;
