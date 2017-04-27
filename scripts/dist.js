#!/bin/env node

let fs = require('fs');
let yazl = require('yazl');
let recursive = require('recursive-readdir');
let manifestJson = require('../manifest.json');

let rootFiles = [
  'LICENSE.md',
  'manifest.json',
  'README.md'
];

recursive('app', function(err, files) {
  let zipFile = new yazl.ZipFile();
  files = files.concat(rootFiles);
  files.forEach(function(file) {
    zipFile.addFile(file, file);
  });

  console.log('zip files');
  zipFile.entries.forEach(function(entry) {
    console.log(' ', entry.utf8FileName.toString());
  });

  let dir = 'dist';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  let outpoutPath = dir + '/image-checker-' + manifestJson.version + '.zip';

  zipFile.outputStream
    .pipe(fs.createWriteStream(outpoutPath))
    .on('close', function() {
      console.log('zip created');
      console.log(' ', outpoutPath);
    });

  zipFile.end();
});
