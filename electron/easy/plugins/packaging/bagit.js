const { spawn } = require('child_process');
const decoder = new TextDecoder("utf-8");
const path = require('path');
const NEWLINE = require('os').EOL;

const name = "APTrust BagIt Provider";
const description = "Provides access to the APTrust command-line bagging library."
const version = "0.1";
const format = "bagit";
const formatMimeType = "";

/*
  TODO: Implement bagger in JavaScript. Will need the following:

  1. Crypto: https://nodejs.org/api/crypto.html#crypto_class_hash
     Md5 example: https://gist.github.com/kitek/1579117

  2. Tar: https://www.npmjs.com/package/archiver
     Supports streams and zip.

  3. Multiwriter candidates:
     https://github.com/mafintosh/multi-write-stream
     https://www.npmjs.com/package/multiwriter

     Or use builtin Node streams and pipes, as described here:
     https://stackoverflow.com/questions/17957525/multiple-consumption-of-single-stream
*/

class BagIt {

    /**
     * Custom packager.
     * @constructor
     * @param {object} job - The job object. See easy/job.js.
     * @param {object} emitter - An Node event object that can emit events
     * @returns {object} - A new custom packager.
     */
    constructor(job, emitter) {
        this.job = job;
        this.emitter = emitter;
        this.outputFile = "";
    }

    /**
     * Returns a map with descriptive info about this provider.
     * @returns {object} - Contains descriptive info about this provider.
     */
     describe() {
         return { name: name,
                  description: description,
                  version: version,
                  format: format,
                  formatMimeType: formatMimeType
                };
     }

    /**
     * Assembles all job.files into a package (e.g. a zip file,
     * tar file, rar file, etc.).
     */
    packageFiles() {
        var packager = this;
        packager.job.packagedFile = "";
        try {
            // Start the bagger executable
            // TODO: Set up the spawn env to include the PATH in which apt_create_bag resides.
            // Maybe that goes in AppSettings?
            var started = false;
            var fileCount = 0;
            var baggerProgram = "apt_create_bag";
            var bagger = spawn(baggerProgram, [ "--stdin" ]);

            bagger.on('error', (err) => {
                var msg = `Bagger ${baggerProgram} exited with error: ${err}`;
                if (String(err).includes("ENOENT")) {
                    msg += ". Make sure the program exists and is in your PATH.";
                }
                packager.emitter.emit('error', msg);
                console.log(msg);
                return;
            });

            bagger.on('exit', function (code, signal) {
                var msg = `Bagger exited with code ${code} and signal ${signal}`;
                var succeeded = false;
                if (code == 0) {
                    msg = `Bagger completed successfully with code ${code} and signal ${signal}`;
                    succeeded = true;
                }
                packager.emitter.emit('complete', succeeded, msg);
            });

            bagger.stdout.on('data', (data) => {
                if (started == false) {
                    packager.emitter.emit('start', 'Building bag...');
                    started = true;
                }
                var lines = decoder.decode(data).split(NEWLINE);
                for (var line of lines) {
                    if (line.startsWith('Adding')) {
                        fileCount += 1;
                        packager.emitter.emit('fileAddStart', line);
                    } else if (line.startsWith('Writing')) {
                        packager.emitter.emit('fileAddComplete', true, `Added ${fileCount} files`);
                        packager.emitter.emit('packageStart', line);
                    } else if (line.startsWith('Validating')) {
                        packager.emitter.emit('packageComplete', true, 'Finished packaging');
                        packager.emitter.emit('validateStart', line);
                    } else if (line.startsWith('Bag at')) {
                        var isValid = false;
                        if (line.endsWith("is valid")) {
                            isValid = true;
                        }
                        packager.emitter.emit('validateComplete', isValid, line);
                    } else if (line.startsWith('Created')) {
                        var filePath = line.substring(7);
                        packager.job.packagedFile = filePath.trim();
                    }
                }
                // console.log(decoder.decode(data));
            });

            bagger.stderr.on('data', (data) => {
                var lines = decoder.decode(data).split(NEWLINE);
                for (var line of lines) {
                    packager.emitter.emit('error', line);
                }
            });


            bagger.stdin.write(JSON.stringify(packager.job));

        } catch (ex) {
            packager.emitter.emit('error', ex);
            console.error(ex);
        }
    }
}

module.exports.Provider = BagIt;
module.exports.name = name;
module.exports.description = description;
module.exports.version = version;
module.exports.format = format;
module.exports.formatMimeType = formatMimeType;
