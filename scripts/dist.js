#!/bin/env node
/**
 Copyright 2017 NCC Group PLC http://www.nccgroup.trust/

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

let fs = require('fs');
let yazl = require('yazl');
let recursive = require('recursive-readdir');
let childProcess = require('child_process');
let manifestJson = require('../manifest.json');

let rootFiles = [
  'LICENSE.md',
  'manifest.json',
  'README.md'
];

let commitId = childProcess.execSync('git rev-parse --verify HEAD').toString().trim();

recursive('app', (err, files) => {
  let zipFile = new yazl.ZipFile();
  files = files.concat(rootFiles);
  files.forEach((file) => {
    zipFile.addFile(file, file);
  });

  console.log('zip files');
  zipFile.entries.forEach((entry) => {
    console.log(' ', entry.utf8FileName.toString());
  });

  let dir = 'dist';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  let outputPath = `${dir}/image-checker-${manifestJson.version}-${commitId}.zip`;

  zipFile.outputStream
    .pipe(fs.createWriteStream(outputPath))
    .on('close', () => {
      console.log('zip created');
      console.log(' ', outputPath);
    });

  zipFile.end();
});
