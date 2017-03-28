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
