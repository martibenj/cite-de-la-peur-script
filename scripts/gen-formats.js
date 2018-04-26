const fs = require('fs-extra');
const path = require('path');
const rimraf = require('rimraf');

const {find} = require('lodash/fp');

const startToken = '%START%';
const endToken = '%END%';
const brTag = '<br>';

const data = 'data';
const filmRaw = 'data-film.raw';
const creditsRaw = 'data-credits.raw';
const filmHtml = 'data-film.html';
const filmFortune = 'data-film.fortune';
const dist = 'dist';
const html = 'html';
const fortune = 'fortune';
const projRootPath = path.resolve('.');

const rawFilmFilePath = path.resolve(projRootPath, data, filmRaw);

const distPath = path.resolve(projRootPath, dist);
const distHtmlDirPath = path.resolve(projRootPath, dist, html);
const distFortuneDirPath = path.resolve(projRootPath, dist, fortune);

const htmlFilePath = path.resolve(distHtmlDirPath, filmHtml);
const fortuneFilePath = path.resolve(distFortuneDirPath, filmFortune);

const htmlStart = '<html><head><meta charset="UTF-8"></head><body><div id="script">';
const htmlEnd = '</div></body></html>';

/**
 * Clean arborescence.
 * @param pFormat
 */
const clean = (pFormat = null) => {
  let pathToDelete = distPath;

  if (pFormat && path.resolve(distPath, pFormat)) {
    pathToDelete = path.resolve(distPath, pFormat);
  }

  console.log('Deleting ', pathToDelete);
  rimraf(pathToDelete, () => null);
};

/**
 * Generate arborescence.
 * @param pFormat
 */
const genArbo = (pFormat = null) => {
  let pathToCreate = distPath;

  if (pFormat && path.resolve(distPath, pFormat)) {
    pathToCreate = path.resolve(distPath, pFormat);
  }

  console.log('Creating ', pathToCreate);
  fs.ensureDirSync(pathToCreate);
};

/** Generate HTML output file */
const genHtml = () => {
  clean(html);
  genArbo(html);
  fs.readFile(rawFilmFilePath, 'utf8', (err, pData) => {
    Object.setPrototypeOf(pData, String.prototype);
    if (pData && pData.length > 0) {
      // Adding html tags
      pData = htmlStart + pData + htmlEnd;

      // Replacing tokens
      pData = pData.replace(new RegExp(startToken, 'g'), '');
      pData = pData.replace(new RegExp(endToken, 'g'), brTag);

      // Writing file
      fs.writeFileSync(htmlFilePath, pData, 'utf8');
    }
  });
};

/** Generate Fortune output file. */
const genFortune = () => {
  clean(fortune);
  genArbo(fortune);
  fs.readFile(rawFilmFilePath, 'utf8', (err, pData) => {
    Object.setPrototypeOf(pData, String.prototype);
    if (pData && pData.length > 0) {
      // Replacing tokens
      pData = pData.replace(new RegExp(startToken, 'g'), '');
      pData = pData.replace(new RegExp(endToken, 'g'), String.fromCharCode(13) + '%');

      // Writing file
      fs.writeFileSync(fortuneFilePath, pData, 'utf8');
    }
  });
};

/** Generate all output files. */
const genAll = () => {
  clean();
  genHtml();
  genFortune();
};

const arg = find(e => e.includes('--format'), process.argv);
if (!arg) {
  // Default, Gen all
  genAll();
}
else {
  const format = arg.split('=')[1];
  switch (format) {
    case html:
      genHtml();
      break;
    case fortune:
      genFortune();
      break;
    default:
      console.log('Unknown format, please use html or fortune or skip the use of the parameter format');
  }
}