const { Bagger } = require('./bagger');
const { BagItProfile } = require('./bagit_profile');
const fs = require('fs');
const { Job } = require('../core/job');
const os = require('os');
const { PackagingOperation } = require('../core/packaging_operation');
const path = require('path');

var tmpFile = path.join(os.tmpdir(), 'TestBag.tar');

// afterEach(() => {
//     if (fs.existsSync(tmpFile)) {
//         fs.unlinkSync(tmpFile);
//     }
// });

function getJob() {
    var job = new Job();
    job.packagingOperation = new PackagingOperation('TestBag', tmpFile, '.tar');
    var sourceDir = path.join(__dirname, '..', 'util');
    job.packagingOperation.sourceFiles.push(sourceDir);
    var profilesDir = path.join(__dirname, '..', 'test', 'profiles');
    job.bagItProfile = BagItProfile.load(path.join(profilesDir, 'multi_manifest.json'));

    // Set required APTrust tags
    var access = job.bagItProfile.firstMatchingTag('Access');
    access.userValue = 'Institution';
    var title = job.bagItProfile.firstMatchingTag('Title');
    title.userValue = 'Test Bag';
    var description = job.bagItProfile.firstMatchingTag('Description');
    description.userValue = 'Bag of files for unit testing.';
    return job;
}

test('create()', done => {
    let bagger = new Bagger(getJob());
    bagger.on('finish', function() {
        let result = bagger.job.packagingOperation.result;
        //console.log(result);
        expect(result.error).toBeNull();
        expect(result.succeeded).toEqual(true);
        expect(result.started).not.toBeNull();
        expect(result.competed).not.toBeNull();
        expect(result.operation).toEqual('bagging');
        expect(result.provider).toEqual('DART bagger');
        expect(result.filename.endsWith('TestBag.tar')).toEqual(true);
        expect(result.filesize).toBeGreaterThan(0);
        done();
    });

    bagger.create();
});
