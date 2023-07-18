import assert from 'assert';
import fs from 'fs';
import yaml from 'js-yaml';

const message = (key) => `[secret]: ${key} is a falsy value`;

function ensureAssertions(secret) {
  assert(secret.db_url, message('secret.db_url'));

}

export const secretBuilder = (path) => {
  let c = {};
  try {
    assert(path, '[env]: SECRET_FILE does not exist');
    c = yaml.load(fs.readFileSync(path, 'utf-8'));
    ensureAssertions(c);
  } catch (err) {
    console.log(err);
    process.exit(17);
  }
  return c;
};

