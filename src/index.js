export default function({types: t }) {
  let valueToAst = value => {
    if (typeof value === 'string') {
      return t.stringLiteral(value);
    }

    if (typeof value === 'object') {
      let properties = Object.keys(value).map(key => {
        let id = t.isValidIdentifier(key) ? t.identifier(key) : t.stringLiteral(key)
        return t.objectProperty(id, valueToAst(value[key]));
      });

      return t.objectExpression(properties);
    }
  };

  return {
    visitor: {
      ImportDeclaration(path) {
        let source = path.get('source');
        let sourceValue = source.node.value;
        let specifiers = path.get('specifiers');

        if (sourceValue.indexOf('polished') !== 0) return;

        let safeSourceValue = sourceValue.replace(/^polished\/src/, 'polished/lib')
        let importedModule = require(safeSourceValue);

        let invalidatedSpecifiers = specifiers.filter(specifier => {
          let importedValue = importedModule;

          if (specifier.node.imported) {
            let imported = specifier.get('imported');
            let importedName = imported.node.name;
            let value = importedValue[importedName];

            if (!value) {
              throw imported.buildCodeFrameError('Method does not exist: ' + methodName);
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

            let serializedArgs = args.map(arg => arg.node.value);
            let result = matchedMethod(...serializedArgs);
            let resultAst = valueToAst(result);

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
