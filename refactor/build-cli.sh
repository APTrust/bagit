#!/bin/bash

echo 'Building dart-cli'

./node_modules/.bin/nexe -i apps/dart-cli.js -o apps/bin/dart-cli --build mac-x64-11.0.0 --debugBundle=apps/bin/bundle.js

echo 'Executable is in ./apps/bin/dart-cli'
echo ''
echo 'Example: ./apps/bin/dart-cli -- --command validate-bag --profile test/profiles/aptrust_bagit_profile_2.2.json test/bags/aptrust/example.edu.tagsample_bad.tar'
echo ''
