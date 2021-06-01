# APTrust DART

[![Build Status](https://travis-ci.com/APTrust/dart.svg?branch=master)](https://travis-ci.org/APTrust/dart)
[![Build status](https://ci.appveyor.com/api/projects/status/i5d8hrlan9kph5np?svg=true)](https://ci.appveyor.com/project/aptrust/dart/branch/master)
[![Maintainability](https://api.codeclimate.com/v1/badges/8b51be47cf6ed6aaa698/maintainability)](https://codeclimate.com/github/APTrust/dart/maintainability)

In 2018, APTrust opened its services to depositors at smaller institutions
that did not have the technical resources to package and upload digital
materials into a remote repository.

APTrust created DART, the Digital Archivist's Resource Tool, to provide a
simple drag-and-drop application for non-technical users to package and
upload materials.

While the prototype worked well for our initial depositors, APTrust has a
broader vision for DART to serve a wider community. The next iteration of
DART, will be able to package digital assets in a number of formats and
upload them to any number of repositories. DART will support custom plugins
that allow developers to quickly customize and extend its features to serve
the needs of their own organizations and communities.

DART includes both an intuitive drag-and-drop UI and a scriptable command-line
tool for creating archival packages and sending them to a remote repository.

## Installation

Download the DART installer for your system and then check out our [Getting Started](https://aptrust.github.io/dart-docs/users/getting_started/) page.

* [Mac OSX v2.0.11](https://s3.amazonaws.com/aptrust.public.download/DART/DART-2.0.11.dmg)
* [Windows v2.0.11](https://s3.amazonaws.com/aptrust.public.download/DART/DART+Setup+2.0.11.exe)
* [Linux v2.0.11](https://s3.amazonaws.com/aptrust.public.download/DART/DART_2.0.11_amd64.deb)

While these installers are labeled as version 2.0, you should consider them
a 2.0 pre-release, and DART itself as beta software. See
[Status of Core Features](#status-of-core-features) below for more info.

## Documentation

[User and developer docs](https://aptrust.github.io/dart-docs)

[API documentation](https://aptrust.github.io/dart)

[Change Log / Release Notes](ReleaseNotes.md)

## DART's Intended Core Features

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

## Status of Core Features

As of February 27, 2020, the core features required for APTrust depositors
are working in both GUI and command-line mode. These include:

* Creating bags that conform to a selected BagIt profile.
* Validating those bags.
* Sending bags to an S3 bucket. (Or any remote service that supports the
  S3 API).
* Sending bags to an SFTP server.
* Returning basic information from the APTrust repository, including:
  * A list of items recently ingested.
  * A list of pending or in-progress ingests.
* [Settings import/export](https://aptrust.github.io/dart-docs/users/settings/export/), which allows an admin to configure DART and then share settings with multiple users.
* Defining and running basic [Workflows](https://aptrust.github.io/dart-docs/users/workflows/), which describe a repeatable sequence of bagging and upload steps.

### What's Not Working Yet

* Creating bags in formats other than unserialized and tar. (You can build a
  bag as a directory or a tar file, but zip, gzip, and other formats are
  not yet supported.)
* Shipping files in protocols other than S3 or SFTP.
* APTrust has an internal list of a number of minor bugs, all of which
  affect workflows outside the normal APTrust workflow.
* We have not yet formally defined the plugin APIs for developers who want
  to write their own plugins.

## Running Jobs on the Command-Line

DART can run both Jobs and Workflows from the [command line](https://aptrust.github.io/dart-docs/users/command_line/). Most users will want to run Workflows, because they're easier, but we'll start by discussing jobs.

There are several ways to pass job information to DART in command-line mode.
Each of the examples below will run a job withouth launching the graphical
interface. All jobs log to the same log file as the DART UI.

Note the double dashes before the --job and --json options.

```
# Run a job from Job JSON file, which contains a full description
# of the job to be executed.
dist/mac/DART.app/Contents/MacOS/DART -- --job ~/tmp/dart/job.json

# Run a Job stored in the DART Jobs database. The UUID is the unique
# identifier of the job
dist/mac/DART.app/Contents/MacOS/DART -- --job 00000000-0000-0000-0000-000000000000

# Run a job by passing Job JSON directly to stdin
echo '{ ... Job JSON ... }' | dist/mac/DART.app/Contents/MacOS/DART -- --json
```

A job file contains a JSON description of a job, including any or all of
the following operations:

* packaging (which is currently limited to producing BagIt bags)
* validation (which is currently limited validating BagIt bags)
* uploads to one or more remote endpoints (currently limited to S3)

The ability to export a Job JSON file will be coming soon.

## Running Workflows in Command-Line Mode

Workflows define a set of pre-determined actions to take a set of files. For
example, a Workflow may include the following steps:

* Package files in BagIt format
* Using a specified BagIt profile
* With a specified set of default values
* And upload the resulting package to one or more targets

Workflows are easy to run from the command line. To do so, simply create a
JobParams JSON structure with the following info and pass it to DART:

* The name of the workflow to execute
* The name of the package to create
* A list of files to package
* A list of tag values to include in the package

You can then run the Workflow in one of two ways.

```
# Run from a JobParams JSON file
dist/mac/DART.app/Contents/MacOS/DART -- --job ~/tmp/dart/job_params.json

# Run by passing JobParams JSON directly to stdin
echo '{ ... JobParams JSON ... }' | dist/mac/DART.app/Contents/MacOS/DART -- --json
```

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

Note that you can bump the version for new releases with the bump_version
script. For example, to bump from 2.x.x to 2.y.y, run `npm run bump 2.x.x to 2.y.y`

## Building the Docs

```
./jsdoc.sh
```

After running that, open the file `docs/DART/2.0.5/index.html` in your browser.

## Testing Against a Local SFTP Server (dev mode only)

To test jobs against a local SFTP server, run the following in a new terminal,
from the root of the DART project directory:

`node ./test/servers/sftp.js`

Note that this works only in dev mode, when you have the source files. This is not part of the release.

The local test SFTP server writes everything to a single temp file. It's not
meant to preserve any data, just to test whether data transfer works via the
SFTP protocol.

If you have docker and want to test against a more robust SFTP server,
follow these steps:

1. Get an SFTP container image from https://hub.docker.com/r/atmoz/sftp/.
1. Add a Storage Service record to your DART installation with the following
   settings:
   ```
   {
		"name": "Docker SFTP",
		"description": "Local docker sftp server",
		"protocol": "sftp",
		"host": "localhost",
		"port": 0,
		"bucket": "upload",
		"login": "foo",
		"password": "pass",
		"loginExtra": "",
		"allowsUpload": true,
		"allowsDownload": true
	}
   ```
1. Run `docker start <container id>`
