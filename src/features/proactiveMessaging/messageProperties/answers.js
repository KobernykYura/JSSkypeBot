import * as fs from 'fs';
import { parse } from 'dot-properties';

const answers = {};

(function concatProperties() {
    if (!answers.length) {
        const pathsToPropertyFiles = fs.readdirSync(__dirname)
            .filter(file => file.endsWith('.properties'))
            .map(fileName => `${ __dirname }/${ fileName }`);
        pathsToPropertyFiles.forEach(path => {
            const src = fs.readFileSync(path, {
                encoding: 'utf8'
            });
            Object.assign(answers, parse(src));
        });
    }
})();

export default answers;
