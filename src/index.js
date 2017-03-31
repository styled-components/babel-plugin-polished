export default function({ types: t }) {
  return {
    visitor: {
      ImportDeclaration(path) {
        const source = path.get('source');
        const sourceValue = source.node.value;
        const specifiers = path.get('specifiers');

        if (sourceValue.indexOf('polished') !== 0) return;

        const safeSourceValue = sourceValue.replace(/^polished\/src/, 'polished/lib')
        const importedModule = require(safeSourceValue);

        const invalidatedSpecifiers = specifiers.filter(specifier => {
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

          const local = specifier.get('local');
          const binding = local.scope.getBinding(local.node.name);
          const refs = binding.referencePaths;

          const invalidatedRefs = refs.filter(ref => {
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

            let serializedArgs = args.map(arg => arg.node.value);
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
