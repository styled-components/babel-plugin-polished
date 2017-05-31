// @flow
'use strict';

const unsafeRequire = require;

/*::
type Types = {
  valueToNode(mixed): Node,
};

type Node = {
  type: string,
  [key: string]: any,
};

type Path = {
  type: string,
  node: Node,
  [key: string]: any,
};
*/

module.exports = ({ types: t } /*: { types: Types } */) => {
  return {
    name: 'polished',
    visitor: {
      ImportDeclaration(path /*: Path */) {
        let source = path.get('source');
        let sourceValue = source.node.value;
        let specifiers = path.get('specifiers');

        if (sourceValue.indexOf('polished') !== 0) return;

        let safeSourceValue = sourceValue.replace(/^polished\/src/, 'polished/lib')
        let importedModule = unsafeRequire(safeSourceValue);

        let invalidatedSpecifiers = specifiers.filter(specifier => {
          let importedValue = importedModule;

          if (specifier.node.imported) {
            let imported = specifier.get('imported');
            let importedName = imported.node.name;
            let value = importedValue[importedName];

            if (!value) {
              throw imported.buildCodeFrameError('Method does not exist: ' + importedName);
            }

            importedValue = value;
          }

          let local = specifier.get('local');
          let binding = local.scope.getBinding(local.node.name);
          let refs = binding.referencePaths;

          let invalidatedRefs = refs.filter(ref => {
            let matchedMethod = importedValue;

            let callExpression = ref.findParent(parent => {
              if (parent.isCallExpression()) {
                return true;
              } else if (parent.isMemberExpression()) {
                let property = parent.get('property');
                let methodName = property.node.name;
                let method = matchedMethod[methodName];

                if (!method) {
                  throw property.buildCodeFrameError('Method does not exist: ' + methodName);
                }

                matchedMethod = method;
                return false;
              } else {
                throw parent.buildCodeFrameError("Unexpected node type: " + parent.type);
              }
            });

            let args = callExpression.get('arguments');
            let foundNonLiteral = args.find(arg => !arg.isLiteral());
            if (foundNonLiteral) return true;

            let serializedArgs = args.map(arg => {
              if (arg.isNullLiteral()) {
                return null;
              } else {
                return arg.node.value
              }
            });

            let result = matchedMethod(...serializedArgs);
            let resultAst = t.valueToNode(result);

            callExpression.replaceWith(resultAst);
            return false;
          });

          if (!invalidatedRefs.length) {
            specifier.remove();
            return false;
          } else {
            return true;
          }
        });

        if (!invalidatedSpecifiers.length) {
          path.remove();
        }
      }
    }
  };
}
