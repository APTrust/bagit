# APTrust DART

[![Build Status](https://travis-ci.org/APTrust/dart.svg?branch=master)](https://travis-ci.org/APTrust/dart)
[![Build status](https://ci.appveyor.com/api/projects/status/waprqft4knhb5ktb/branch/master?svg=true)](https://ci.appveyor.com/project/cdahlhausen/dart/branch/master)
[![Maintainability](https://api.codeclimate.com/v1/badges/8b51be47cf6ed6aaa698/maintainability)](https://codeclimate.com/github/APTrust/dart/maintainability)

In 2018, APTrust opened its services to depositors at smaller institutions
that did not have the technical resources to package and upload digital
materials into a remote repository.

APTrust created DART, the Digital Archivist's Resource Tool, to provide a
simple drag-and-drop application for non-technical users to package and
upload materials.

While the prototype worked well for our initial depositors, APTrust has a
broader vision for DART to serve a wider community. The next iteration of
DART, which should be available in the summer of 2019, will be able to
package digital assets in a number of formats and upload them to any number
of repositories. DART will support custom plugins that allow developers
to quickly customize and extend its features to serve the needs of their
own organizations and communities.

While the prototype was a proof of concept, and was used successfully in
production by a number of organizations, its underlying code was not suitable
for long-term maintenance.

This repository contains refactored code which is meant to be the foundation
of a viable community-supported project.

The upcoming version of DART will include both an intuitive drag-and-drop
UI and scriptable command-line tool for creating archival packages and sending
them across a network to a remote repository. You'll find a working prototype
of the GUI application in the
[dart-prototype repository](https://github.com/APTrust/dart-prototype).

## DART Core Features

* Create Submission Information Packages (SIPs) in BagIt format that conform
  to pre-configured BagIt profiles
* Define your own custom BagIt profiles
* Support additional SIP formats (tar, zip, parchive, etc) in the future
* Send SIPs across a network to be ingested into a repository using S3,
  FTP, SFTP, and other protocols.
* Define jobs that describe what items should be packaged, how, and where
  the should be sent.
* Implement all features as plugins, using a well-defined plugin interface
  so developers can add new features without having to dig into core code.
* Provide all of these features in a simple drag-and-drop, point-and-click UI
  that non-technical users can operate with minimal learning curve.
* Provide all of these features in a well-defined command-line interface, so
  they can be scripted using any scripting language.

## DART Refactor

The goal of the refactor is to create maintainable, extensible code so other
developers can contribute to DART.

1. Separate concerns so core code can run in the Electron UI or from the command line.
1. Refactor duplicated code into base classes or helpers.
1. Standardize APIs so they're more intuitive.
1. Use idiomatic JavaScript.
1. Strive for full test coverage with Jest.
1. Document all relevant code with JSDoc.

## Testing

Jest runs tests in parallel by default, but this can cause problems when different
tests are saving different AppSetting values as part of their setup process.
The --runInBand flag tells Jest to run tests sequentially.

See the [Jest CLI reference](https://jestjs.io/docs/en/cli.html)

```
npm test -- --runInBand
```

### Testing on Windows

A number of tests will fail on Windows if git is set to automatically convert
line endings from `\n` to `\r\n`. Specifically, tests involving bag validation
and checksums will fail because the git checkout on Windows adds an extra byte
to the end of each line of each text file.

If you want these tests to pass, you'll need to disable git's automatic newline
transformations with the following command:

```
git config --local core.autocrlf false
```

## Building

To build the DART application into a standalone binary, run this command from
the top-level directory of the project.

```
./node_modules/.bin/electron-builder
```

The binary will appear in the /dist folder. For example, when building
on a Mac, it will appear in `dist/mac/DART.app/Contents/MacOS/DART`.

You can run the binary directly from there.

## Running in Command-Line Mode

DART runs in command-line mode if you specify a job file on the command line.
Note the double dashes before the --job option.

```
dist/mac/DART.app/Contents/MacOS/DART -- --job ~/tmp/dart/job.json
```

A job file contains a JSON description of a job, including any or all of
the following operations:

* packaging (which is currently limited to producing BagIt bags)
* validation (which is currently limited validating BagIt bags)
* uploads to one or more remote endpoints (currently limited to S3)

The ability to export a Job JSON file will be coming soon.

## Documentation
After every commit the documentation is rebuilt and published at

[https://aptrust.github.io/dart](https://aptrust.github.io/dart)

## Building the Docs

```
./jsdoc.sh
```

After running that, check the index.html file in the docs directory, which the
command will create if it doesn't already exist.
