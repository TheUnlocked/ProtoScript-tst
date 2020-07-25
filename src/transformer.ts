import ts from 'typescript';

interface ProtoScriptConfig {}

const transformer = (program: ts.Program, config?: ProtoScriptConfig): ts.TransformerFactory<ts.SourceFile> => {
    return context => {
        return sourceFile => {
            const visitor = (node: ts.Node): ts.Node => {
                if (ts.isClassDeclaration(node) || ts.isClassExpression(node)) {
                    return visitClass(node);
                }
                if (ts.isNewExpression(node)) {
                    return visitNew(node);
                }
                if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.SuperKeyword) {
                    return visitSuper(node);
                }

                return ts.visitEachChild(node, visitor, context);
            };

            const visitClass = (node: ts.ClassDeclaration | ts.ClassExpression): ts.Node => {
                const body = [] as ts.Statement[];

                const members = node.members.map(node => classEltToObjectLitElt(node));
                const proto = ts.createObjectLiteral(members);
                const protoId = ts.createUniqueName('proto');
                body.push(ts.createVariableStatement(
                    undefined,
                    ts.createVariableDeclarationList(
                        [ts.createVariableDeclaration(protoId, undefined, proto)],
                        ts.NodeFlags.Const
                    )
                ));
                const extendsClause = node.heritageClauses?.find(x => x.token === ts.SyntaxKind.ExtendsKeyword);
                if (extendsClause !== undefined) {
                    body.push(ts.createExpressionStatement(ts.createCall(
                        ts.createPropertyAccess(
                            ts.createIdentifier("Object"),
                            ts.createIdentifier("setPrototypeOf")
                        ),
                        undefined,
                        [protoId, ts.visitNode(extendsClause.types[0]?.expression, visitor)]
                    )));
                };
                body.push(ts.createReturn(protoId));

                const prototypeResult = ts.createCall(
                    ts.createArrowFunction(
                        undefined,
                        undefined,
                        [],
                        undefined,
                        ts.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                        ts.createBlock(body, true)
                    ),
                    undefined,
                    []
                );

                if (ts.isClassDeclaration(node)) {
                    return ts.createVariableStatement(
                        undefined,
                        ts.createVariableDeclarationList(
                            [ts.createVariableDeclaration(node.name ?? ts.createUniqueName('protoclass'), undefined, prototypeResult)],
                            ts.NodeFlags.Const
                        )
                    );
                }
                else {
                    return prototypeResult;
                }
            }

            const classEltToObjectLitElt = (node: ts.ClassElement): ts.ObjectLiteralElementLike => {
                if (ts.isConstructorDeclaration(node)) {
                    return ts.createMethod(
                        ts.visitNodes(node.decorators, visitor),
                        ts.visitNodes(node.modifiers, visitor),
                        ts.visitNode(node.asteriskToken, visitor),
                        ts.createIdentifier('constructor'),
                        ts.visitNode(node.questionToken, visitor),
                        ts.visitNodes(node.typeParameters, visitor),
                        ts.visitNodes(node.parameters, visitor),
                        ts.visitNode(node.type, visitor),
                        ts.visitNode(node.body, visitor)
                    );
                }
                else if (ts.isMethodDeclaration(node)) {
                    return ts.visitNode(node, visitor);
                }
                else if (ts.isAccessor(node)) {
                    return ts.visitNode(node, visitor);
                }
                else if (ts.isPropertyDeclaration(node)) {
                    return ts.createPropertyAssignment(
                        ts.visitNode(node.name, visitor),
                        ts.visitNode(node.initializer, visitor) ?? ts.createIdentifier('undefined')
                    );
                }
                throw "Unknown property discovered: " + node.kind;
            };

            const visitNew = (node: ts.NewExpression): ts.Node => {
                return ts.createCall(ts.createPropertyAccess(
                    ts.visitNode(node.expression, visitor),
                    ts.createIdentifier('factory')
                ), undefined, ts.visitNodes(node.arguments, visitor));
            };

            const visitSuper = (node: ts.CallExpression): ts.Node => {
                return ts.createCall(
                    ts.createPropertyAccess(
                        ts.createCall(
                            ts.createPropertyAccess(ts.createIdentifier("Object"), ts.createIdentifier("getPrototypeOf")),
                            undefined,
                            [
                                ts.createCall(
                                    ts.createPropertyAccess(ts.createIdentifier("Object"), ts.createIdentifier("getPrototypeOf")),
                                    undefined,
                                    [ts.createThis()]
                                )
                            ]
                        ),
                        ts.createIdentifier("constructor")
                    ),
                    undefined,
                    ts.visitNodes(node.arguments, visitor)
                );
            };
    
            return ts.visitNode(sourceFile, visitor);
        };
    };
}

export default transformer;