const { Context } = require('../../core/context');
const path = require('path');
const SFTPServer = require('./sftp_server');
const SFTPClient = require('./sftp_client');
const { StorageService } = require('../../core/storage_service');

var server = null;
const remoteFileName = 'TestFileForSFTPUpload.xyz';

beforeAll(() => {
    server = SFTPServer.start(SFTPServer.PORT);
});

afterAll(() => {
    server.server.close();
});

function getStorageService() {
    return new StorageService({
        name: 'SFTP Service for Unit Tests',
        protocol: 'sftp',
        host: 'localhost',
        port: SFTPServer.DEFAULT_PORT,
        login: SFTPServer.USER,
        password: SFTPServer.PASSWORD
    });
}

function testCommonResultProperties(result, withNullCompleted = false) {
    expect(result.operation).toEqual('upload');
    expect(result.provider).toEqual('SFTPClient');
    expect(result.filepath).toEqual(__filename);
    expect(result.filesize).toBeGreaterThan(1400);
    expect(result.fileMtime).not.toBeNull();
    expect(result.remoteChecksum).toBeNull();
    expect(result.attempt).toEqual(1);
    expect(result.started).not.toBeNull();
    if (withNullCompleted) {
        expect(result.completed).toBeNull();
    } else {
        expect(result.completed).not.toBeNull();
    }
    expect(result.remoteURL).toEqual('sftp://localhost:8088/TestFileForSFTPUpload.xyz');
}

test('Description', () => {
    var desc = SFTPClient.description();
    expect(desc.name).toEqual('SFTPClient');
    expect(desc.implementsProtocols).toEqual(['sftp']);
});

test('Constructor sets expected properties', () => {
    var ss = getStorageService();
    var client = new SFTPClient(ss);
    expect(client.storageService).toEqual(ss);
});

test('Upload', done => {
    var ss = getStorageService();
    var client = new SFTPClient(ss);
    client.on('finish', function(result) {
        testCommonResultProperties(result);
        expect(result.info).toEqual(Context.y18n.__("Upload succeeded"));
        expect(result.warning).toBeNull();
        expect(result.errors).toEqual([]);
        done();
    });
    client.on('error', function(err) {
        // Force failure
        expect(err).toBeNull();
        done();
    });

    client.upload(__filename, remoteFileName);
});

test('Upload with bad credentials', done => {
    var ss = getStorageService();
    ss.login = 'BAD-LOGIN';
    ss.password = 'BAD-PASSWORD';
    var client = new SFTPClient(ss);
    client.on('finish', function(result) {
        throw "Bad credentials should have thrown an exception."
        done();
    });
    client.on('error', function(result) {
        testCommonResultProperties(result);
        expect(result.info).toBeNull();
        expect(result.warning).toBeNull();
        expect(result.errors.length).toEqual(1);
        expect(result.errors[0]).toMatch(/authentication methods failed/);
        done();
    });
    client.upload(__filename, remoteFileName);
});

test('upload emits error instead of throwing on bad private key file', done => {
    var ss = getStorageService();
    // For SFTP, loginExtra is path to private key file.
    ss.loginExtra = '/bad/path/to/key.file';
    var client = new SFTPClient(ss);

    client.on('error', function(result) {
        testCommonResultProperties(result);
        expect(result.info).toBeNull();
        expect(result.warning).toBeNull();
        expect(result.errors.length).toEqual(1);
        expect(result.errors[0]).toEqual(
            Context.y18n.__("Private key file %s is missing for storage service %s", ss.loginExtra, ss.name)
        );
        done();
    });
    client.upload(__filename, remoteFileName);
});

test('_getConnSettings', () => {
    var ss = getStorageService();
    var client = new SFTPClient(ss);
    var connSettings = client._getConnSettings();
    expect(connSettings).toEqual({
        host: 'localhost',
        port: 8088,
        username: 'user',
        password: 'password'
    });
});

test('_loadPrivateKey', () => {
    var ss = getStorageService();

    // For SFTP storage service, loginExtra is the path to the
    // private key file.
    ss.loginExtra = path.join(__dirname, '..', '..', 'test', 'certs', 'rsa_test_key');

    var client = new SFTPClient(ss);

    // Make sure it loads
    var pk = client._loadPrivateKey();
    expect(pk.startsWith('-----BEGIN RSA PRIVATE KEY-----')).toBe(true);
    expect(pk.trim().endsWith('-----END RSA PRIVATE KEY-----')).toBe(true);

    // Make sure it gets into the connection settings.
    // Note that connSettings omits password if private key is present.
    var connSettings = client._getConnSettings();
    expect(connSettings).toEqual({
        host: 'localhost',
        port: 8088,
        username: 'user',
        privateKey: pk
    });
});

test('_initUploadResult', () => {
    var ss = getStorageService();
    var client = new SFTPClient(ss);
    var result = client._initUploadResult(__filename, remoteFileName);
    testCommonResultProperties(result, true);
});

test('_buildUrl', () => {
    var ss = getStorageService();
    var client = new SFTPClient(ss);
    var url = client._buildUrl(remoteFileName);
    expect(url).toEqual('sftp://localhost:8088/TestFileForSFTPUpload.xyz');
});