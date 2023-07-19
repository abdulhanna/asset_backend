import fs from 'fs';
import yaml from 'js-yaml';

const message = (key) => `[config]: ${key} is a falsy value`;

export const configBuilder = (path) => {
     let c = {};
     try {
          c = yaml.load(fs.readFileSync(path, 'utf-8'));
     } catch (err) {
          console.log(err.message);
          process.exit(17);
     }
     return c;
};
