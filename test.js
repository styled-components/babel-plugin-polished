// @flow
'use strict';

const pluginTester = require('babel-plugin-tester');
const plugin = require('./');

pluginTester({
  plugin,
  tests: [
    {
      title: 'namespace',
      code: `
        import * as polished from 'polished';

        let a = polished.clearFix();
        let b = polished.clearFix('parent');
        let c = polished.ellipsis();
        let d = polished.ellipsis('250px');
      `,
      output: `
        let a = {
          '&::after': {
            clear: 'both',
            content: '',
            display: 'table'
          }
        };
        let b = {
          'parent::after': {
            clear: 'both',
            content: '',
            display: 'table'
          }
        };
        let c = {
          display: 'inline-block',
          'max-width': '100%',
          overflow: 'hidden',
          'text-overflow': 'ellipsis',
          'white-space': 'nowrap',
          'word-wrap': 'normal'
        };
        let d = {
          display: 'inline-block',
          'max-width': '250px',
          overflow: 'hidden',
          'text-overflow': 'ellipsis',
          'white-space': 'nowrap',
          'word-wrap': 'normal'
        };
      `,
    },
    {
      title: 'nested paths',
      code: `
        import clearFix from 'polished/src/mixins/clearFix';
        import ellipsis from 'polished/src/mixins/ellipsis';

        let a = clearFix();
        let b = clearFix('parent');
        let c = ellipsis();
        let d = ellipsis('250px');
      `,
      output: `
        let a = {
          '&::after': {
            clear: 'both',
            content: '',
            display: 'table'
          }
        };
        let b = {
          'parent::after': {
            clear: 'both',
            content: '',
            display: 'table'
          }
        };
        let c = {
          display: 'inline-block',
          'max-width': '100%',
          overflow: 'hidden',
          'text-overflow': 'ellipsis',
          'white-space': 'nowrap',
          'word-wrap': 'normal'
        };
        let d = {
          display: 'inline-block',
          'max-width': '250px',
          overflow: 'hidden',
          'text-overflow': 'ellipsis',
          'white-space': 'nowrap',
          'word-wrap': 'normal'
        };
      `,
    },
    {
      title: 'specifiers',
      code: `
        import {clearFix, ellipsis} from 'polished';

        let a = clearFix();
        let b = clearFix('parent');
        let c = ellipsis();
        let d = ellipsis('250px');
      `,
      output: `
        let a = {
          '&::after': {
            clear: 'both',
            content: '',
            display: 'table'
          }
        };
        let b = {
          'parent::after': {
            clear: 'both',
            content: '',
            display: 'table'
          }
        };
        let c = {
          display: 'inline-block',
          'max-width': '100%',
          overflow: 'hidden',
          'text-overflow': 'ellipsis',
          'white-space': 'nowrap',
          'word-wrap': 'normal'
        };
        let d = {
          display: 'inline-block',
          'max-width': '250px',
          overflow: 'hidden',
          'text-overflow': 'ellipsis',
          'white-space': 'nowrap',
          'word-wrap': 'normal'
        };
      `,
    },
    {
      title: 'non-literal arg',
      code: `
        import * as polished from 'polished';

        let parent = 'parent';

        let a = polished.clearFix(parent);
        let b = polished.clearFix('parent');
      `,
      output: `
        import * as polished from 'polished';

        let parent = 'parent';

        let a = polished.clearFix(parent);
        let b = {
          'parent::after': {
            clear: 'both',
            content: '',
            display: 'table'
          }
        };
      `,
    },
    {
      title: 'null args',
      code: `
        import {position} from 'polished';

        let a = position('absolute', '20px', '20px', null, null)
      `,
      output: `
        let a = {
          position: 'absolute',
          top: '20px',
          right: '20px'
        };
      `,
    },
  ],
});
