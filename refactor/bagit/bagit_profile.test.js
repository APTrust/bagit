const { AppSetting } = require('../core/app_setting');
const { BagItProfile } = require('./bagit_profile');
const { TagDefinition } = require('./tag_definition');
const { TestUtil } = require('../core/test_util');
const { Util } = require('../core/util');

beforeEach(() => {
    TestUtil.deleteJsonFile('BagItProfile');
});

test('Constructor sets initial properties', () => {
    let profile = new BagItProfile();
    expect(profile.name).toEqual('New BagIt Profile');
    expect(profile.description).toEqual('New custom BagIt profile');

    profile = new BagItProfile('Test Profile', 'Profile for testing');
    expect(profile.name).toEqual('Test Profile');
    expect(profile.description).toEqual('Profile for testing');

    expect(profile.acceptBagItVersion).toEqual(['0.97']);
    expect(profile.acceptSerialization).toEqual(['tar']);
    expect(profile.allowFetchTxt).toEqual(false);
    expect(profile.allowMiscTopLevelFiles).toEqual(false);
    expect(profile.allowMiscDirectories).toEqual(false);
    expect(profile.bagItProfileInfo).not.toBeNull();
    expect(profile.manifestsRequired).toEqual(['sha256']);
    expect(profile.tagManifestsRequired).toEqual([]);
    expect(profile.tags.length).toEqual(16);
    expect(profile.serialization).toEqual('optional');
    expect(profile.baseProfileId).toEqual(null);
    expect(profile.isBuiltIn).toEqual(false);
});

test('validate() catches invalid properties', () => {
    let profile = new BagItProfile();
    profile.id = '';
    profile.name = '';
    profile.acceptBagItVersion = [];
    profile.manifestsRequired = [];
    profile.tags = [];
    profile.serialization = "Cap'n Crunch";
    let result = profile.validate();
    expect(result.isValid()).toEqual(false);
    expect(result.errors['id']).toEqual('Id cannot be empty.');
    expect(result.errors['name']).toEqual('Name cannot be empty.');
    expect(result.errors['acceptBagItVersion']).toEqual("Profile must accept at least one BagIt version.");
    expect(result.errors['manifestsRequired']).toEqual("Profile must require at least one manifest.");
    expect(result.errors['tags']).toEqual("Profile lacks requirements for bagit.txt tag file.\nProfile lacks requirements for bag-info.txt tag file.");
    expect(result.errors['serialization']).toEqual("Serialization must be one of: required, optional, forbidden.");
});

test('findMatchingTags()', () => {
    let profile = new BagItProfile();
    profile.tags.push(new TagDefinition('custom-tag-file.txt', 'Contact-Name'));
    let tags = profile.findMatchingTags('tagName', 'Contact-Name');
    expect(tags.length).toEqual(2);
    expect(tags[0].tagFile).toEqual('bag-info.txt'); // was set in BagItProfile constructor
    expect(tags[1].tagFile).toEqual('custom-tag-file.txt');

    tags = profile.findMatchingTags('tagFile', 'bag-info.txt');
    expect(tags.length).toEqual(14);

    tags = profile.findMatchingTags('defaultValue', '');
    expect(tags.length).toEqual(15);  // BagIt-Version and Tag-File-Character-Encoding have values

    tags = profile.findMatchingTags('fakeProperty', 'fakeValue');
    expect(tags.length).toEqual(0);
});

test('firstMatchingTag()', () => {
    let profile = new BagItProfile();
    profile.tags.push(new TagDefinition('custom-tag-file.txt', 'Contact-Name'));
    let tag = profile.firstMatchingTag('tagName', 'Contact-Name');
    expect(tag.tagFile).toEqual('bag-info.txt');

    tag = profile.firstMatchingTag('tagFile', 'bagit.txt');
    expect(tag.tagName).toEqual('BagIt-Version');

    tag = profile.firstMatchingTag('defaultValue', '');
    expect(tag.tagName).toEqual('Bag-Count');

    tag = profile.firstMatchingTag('fakeProperty', 'fakeValue');
    expect(tag).toBeUndefined();
});


test('getTagsFromFile()', () => {
    let profile = new BagItProfile();
    let tags = profile.getTagsFromFile('bagit.txt', 'BagIt-Version');
    expect(tags.length).toEqual(1);
    expect(tags[0].tagFile).toEqual('bagit.txt');
    expect(tags[0].tagName).toEqual('BagIt-Version');

    tags = profile.getTagsFromFile('bag-info.txt', 'Contact-Name');
    expect(tags.length).toEqual(1);
    expect(tags[0].tagFile).toEqual('bag-info.txt');
    expect(tags[0].tagName).toEqual('Contact-Name');

    // Yes, the spec says a tag can appear more than once in a tag file.
    profile.tags.push(new TagDefinition('bag-info.txt', 'Contact-Name'));
    tags = profile.getTagsFromFile('bag-info.txt', 'Contact-Name');
    expect(tags.length).toEqual(2);

    tags = profile.getTagsFromFile('bag-info.txt', 'No-Such-Tag');
    expect(tags.length).toEqual(0);
});

test('hasTagFile()', () => {
    let profile = new BagItProfile();
    expect(profile.hasTagFile('bagit.txt')).toEqual(true);
    expect(profile.hasTagFile('bag-info.txt')).toEqual(true);
    expect(profile.hasTagFile('no-file.txt')).toEqual(false);
});

test('suggestBagName()', () => {
    let inst = new AppSetting('Institution Domain', 'aptrust.org');
    inst.save();

    // Make something that looks like an APTrust profile,
    // just because it has an aptrust-info.txt tag file.
    let aptrustProfile = new BagItProfile();
    aptrustProfile.tags.push(new TagDefinition('aptrust-info.txt', 'Access'));
    expect(aptrustProfile.suggestBagName()).toMatch(/^aptrust.org.bag-\d+$/);

    // Make something that looks like a DPN profile,
    // just because it has an dpn-tags/dpn-info.txt tag file.
    let dpnProfile = new BagItProfile();
    dpnProfile.tags.push(new TagDefinition('dpn-tags/dpn-info.txt', 'Member-Id'));
    let bagName = dpnProfile.suggestBagName();
    expect(Util.looksLikeUUID(bagName)).toEqual(true);

    let genericProfile = new BagItProfile();
    expect(genericProfile.suggestBagName()).toMatch(/^bag-\d+$/);
});

test('suggestGenericBagName()', () => {
    expect(BagItProfile.suggestGenericBagName()).toMatch(/^bag-\d+$/);
});

test('nameLooksLegal() accepts valid file names and rejects invalid ones', () => {
    expect(BagItProfile.nameLooksLegal("legal-name")).toEqual(true);
    expect(BagItProfile.nameLooksLegal("Legal_Name")).toEqual(true);
    expect(BagItProfile.nameLooksLegal("Illeg*l_name")).toEqual(false);
    expect(BagItProfile.nameLooksLegal("Illeg?l_name")).toEqual(false);
    expect(BagItProfile.nameLooksLegal("Illeg\\l_name")).toEqual(false);
    expect(BagItProfile.nameLooksLegal("Illeg/l_name")).toEqual(false);
    expect(BagItProfile.nameLooksLegal("Illegal name")).toEqual(false);
    expect(BagItProfile.nameLooksLegal("Illegal:name")).toEqual(false);
    expect(BagItProfile.nameLooksLegal("Illegal\rname")).toEqual(false);
    expect(BagItProfile.nameLooksLegal("Illegal\nname")).toEqual(false);
    expect(BagItProfile.nameLooksLegal("Illegal\tname")).toEqual(false);
});

test('isValidBagName() asserts profile-specific naming rules', () => {
    let inst = new AppSetting('Institution Domain', 'aptrust.org');
    inst.save();

    let aptrustProfile = new BagItProfile();
    aptrustProfile.tags.push(new TagDefinition('aptrust-info.txt', 'Access'));
    expect(aptrustProfile.isValidBagName("aptrust.org.historical-photos-1951")).toEqual(true);
    expect(aptrustProfile.isValidBagName("historical-photos-1951")).toEqual(false);

    let dpnProfile = new BagItProfile();
    dpnProfile.tags.push(new TagDefinition('dpn-tags/dpn-info.txt', 'Member-Id'));
    expect(dpnProfile.isValidBagName(Util.uuid4())).toEqual(true);
    expect(dpnProfile.isValidBagName("BagOfGlass")).toEqual(false);

    let genericProfile = new BagItProfile();
    expect(genericProfile.isValidBagName("BagOfGlass")).toEqual(true);
    expect(genericProfile.isValidBagName("**Bag?Of:Glass**")).toEqual(false);
});

test('tagsGroupedByFile()', () => {
    let profile = new BagItProfile();
    let files = profile.tagsGroupedByFile();
    expect(files['bagit.txt'].length).toEqual(2);
    expect(files['bag-info.txt'].length).toEqual(14);
});

test('getTagFileContents()', () => {
    let profile = new BagItProfile();
    let files = profile.tagsGroupedByFile();
    profile.getTagsFromFile('bag-info.txt', 'External-Description')[0].userValue = 'Bag of Stuff';
    profile.getTagsFromFile('bag-info.txt', 'Bag-Count')[0].userValue = '1';
    profile.getTagsFromFile('bag-info.txt', 'Bag-Size')[0].userValue = '10887';
    profile.getTagsFromFile('bag-info.txt', 'Bagging-Date')[0].userValue = '2018-08-20';
    profile.getTagsFromFile('bag-info.txt', 'Contact-Email')[0].userValue = 'bagger@aptrust.org';
    profile.getTagsFromFile('bag-info.txt', 'Contact-Name')[0].userValue = 'Bagger Vance';
    profile.getTagsFromFile('bag-info.txt', 'Contact-Phone')[0].userValue = '434-555-1212';
    profile.getTagsFromFile('bag-info.txt', 'Bag-Group-Identifier')[0].userValue = 'Stuff Collection';
    profile.getTagsFromFile('bag-info.txt', 'External-Identifier')[0].userValue = 'MYLB/NDA';
    profile.getTagsFromFile('bag-info.txt', 'Internal-Sender-Description')[0].userValue = 'Bag of miscellaneous junk';
    profile.getTagsFromFile('bag-info.txt', 'Internal-Sender-Identifier')[0].userValue = 'NMOT';
    profile.getTagsFromFile('bag-info.txt', 'Organization-Address')[0].userValue = '1234 Main St., Charlottesville, VA 22903';
    profile.getTagsFromFile('bag-info.txt', 'Payload-Oxum')[0].userValue = '10232.4';
    profile.getTagsFromFile('bag-info.txt', 'Source-Organization')[0].userValue = 'Academic Preservation Trust';
    let bagItContents = "BagIt-Version: 0.97\nTag-File-Character-Encoding: UTF-8";
    let bagInfoContents = "External-Description: Bag of Stuff\nBag-Count: 1\nBag-Size: 10887\nBagging-Date: 2018-08-20\nContact-Email: bagger@aptrust.org\nContact-Name: Bagger Vance\nContact-Phone: 434-555-1212\nBag-Group-Identifier: Stuff Collection\nExternal-Identifier: MYLB/NDA\nInternal-Sender-Description: Bag of miscellaneous junk\nInternal-Sender-Identifier: NMOT\nOrganization-Address: 1234 Main St., Charlottesville, VA 22903\nPayload-Oxum: 10232.4\nSource-Organization: Academic Preservation Trust";
    expect(profile.getTagFileContents('bagit.txt')).toEqual(bagItContents);
    expect(profile.getTagFileContents('bag-info.txt')).toEqual(bagInfoContents);
});

test('isCustomTagFile()', () => {
    let profile = new BagItProfile();

    // These are not custom. They're built in to all profiles.
    expect(profile.isCustomTagFile('bagit.txt')).toEqual(false);
    expect(profile.isCustomTagFile('bag-info.txt')).toEqual(false);

    // This won't be custom, because we're not flagging it as custom.
    let aptrustTag = new TagDefinition('aptrust-info.txt', 'Access');
    aptrustTag.userValue = 'Institution';
    profile.tags.push(aptrustTag);
    expect(profile.isCustomTagFile('aptrust-info.txt')).toEqual(false);

    // This will be custom, because we're flagging it as such.
    let customTag = new TagDefinition('custom-tags.txt', 'Sample-Tag');
    customTag.isUserAddedFile = true;
    customTag.isUserAddedTag = true;
    customTag.userValue = 'electra';
    profile.tags.push(customTag);
    expect(profile.isCustomTagFile('custom-tags.txt')).toEqual(true);

    // Check on a tag file that doesn't even exist.
    expect(profile.isCustomTagFile('file-does-not-exist.txt')).toEqual(false);
});

test('tagFileNames()', () => {
    let profile = new BagItProfile();
    expect(profile.tagFileNames()).toEqual(['bag-info.txt', 'bagit.txt']);

    profile.tags.push(new TagDefinition('aptrust-info.txt', 'Access'));
    profile.tags.push(new TagDefinition('custom-tags.txt', 'Sample-Tag'));
    expect(profile.tagFileNames()).toEqual(['aptrust-info.txt', 'bag-info.txt', 'bagit.txt', 'custom-tags.txt']);
});

test('mustBeTarred()', () => {
    let profile = new BagItProfile();
    expect(profile.mustBeTarred()).toEqual(false);
    profile.acceptSerialization = ['application/tar'];
    expect(profile.mustBeTarred()).toEqual(false);
    profile.serialization = 'required';
    expect(profile.mustBeTarred()).toEqual(true);
});

// test('fromJson()', () => {

// });

// test('bagTitle()', () => {

// });

// test('bagDescription()', () => {

// });

// test('bagInternalIdentifier()', () => {

// });

// test('copyDefaultTagValuesFrom()', () => {

// });
