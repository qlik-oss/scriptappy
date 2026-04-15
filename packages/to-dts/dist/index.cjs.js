'use strict';

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var bin = {};

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	function isPrimitiveType(x) {
	    switch (x) {
	        case "string":
	        case "number":
	        case "boolean":
	        case "any":
	        case "unknown":
	        case "void":
	        case "object":
	        case "null":
	        case "undefined":
	        case "true":
	        case "false":
	            return true;
	    }
	    // StringLiteral
	    if (typeof x === 'string') {
	        return true;
	    }
	    // NumberLiteral
	    if (typeof x === 'number') {
	        return true;
	    }
	    return false;
	}
	exports.isPrimitiveType = isPrimitiveType;
	var DeclarationFlags;
	(function (DeclarationFlags) {
	    DeclarationFlags[DeclarationFlags["None"] = 0] = "None";
	    DeclarationFlags[DeclarationFlags["Private"] = 1] = "Private";
	    DeclarationFlags[DeclarationFlags["Protected"] = 2] = "Protected";
	    DeclarationFlags[DeclarationFlags["Static"] = 4] = "Static";
	    DeclarationFlags[DeclarationFlags["Optional"] = 8] = "Optional";
	    DeclarationFlags[DeclarationFlags["Export"] = 16] = "Export";
	    DeclarationFlags[DeclarationFlags["Abstract"] = 32] = "Abstract";
	    DeclarationFlags[DeclarationFlags["ExportDefault"] = 64] = "ExportDefault";
	    DeclarationFlags[DeclarationFlags["ReadOnly"] = 128] = "ReadOnly";
	})(DeclarationFlags = exports.DeclarationFlags || (exports.DeclarationFlags = {}));
	var ParameterFlags;
	(function (ParameterFlags) {
	    ParameterFlags[ParameterFlags["None"] = 0] = "None";
	    ParameterFlags[ParameterFlags["Optional"] = 1] = "Optional";
	    ParameterFlags[ParameterFlags["Rest"] = 2] = "Rest";
	})(ParameterFlags = exports.ParameterFlags || (exports.ParameterFlags = {}));
	exports.config = {
	    wrapJsDocComments: true,
	    outputEol: '\r\n',
	};
	exports.create = {
	    interface: function (name, flags) {
	        if (flags === void 0) { flags = DeclarationFlags.None; }
	        return {
	            name: name,
	            baseTypes: [],
	            typeParameters: [],
	            kind: "interface",
	            members: [],
	            flags: flags
	        };
	    },
	    class: function (name, flags) {
	        if (flags === void 0) { flags = DeclarationFlags.None; }
	        return {
	            kind: 'class',
	            name: name,
	            members: [],
	            implements: [],
	            typeParameters: [],
	            flags: flags
	        };
	    },
	    typeParameter: function (name, baseType) {
	        return {
	            kind: 'type-parameter',
	            name: name, baseType: baseType, defaultType: undefined
	        };
	    },
	    enum: function (name, constant, flags) {
	        if (constant === void 0) { constant = false; }
	        if (flags === void 0) { flags = DeclarationFlags.None; }
	        return {
	            kind: 'enum',
	            name: name, constant: constant,
	            members: [],
	            flags: flags
	        };
	    },
	    enumValue: function (name, value) {
	        return {
	            kind: 'enum-value',
	            name: name,
	            value: value
	        };
	    },
	    property: function (name, type, flags) {
	        if (flags === void 0) { flags = DeclarationFlags.None; }
	        return {
	            kind: "property",
	            name: name, type: type, flags: flags
	        };
	    },
	    method: function (name, parameters, returnType, flags) {
	        if (flags === void 0) { flags = DeclarationFlags.None; }
	        return {
	            kind: "method",
	            typeParameters: [],
	            name: name, parameters: parameters, returnType: returnType, flags: flags
	        };
	    },
	    callSignature: function (parameters, returnType) {
	        return {
	            kind: "call-signature",
	            typeParameters: [],
	            parameters: parameters, returnType: returnType
	        };
	    },
	    function: function (name, parameters, returnType, flags) {
	        if (flags === void 0) { flags = DeclarationFlags.None; }
	        return {
	            kind: "function",
	            typeParameters: [],
	            name: name, parameters: parameters, returnType: returnType, flags: flags
	        };
	    },
	    functionType: function (parameters, returnType) {
	        return {
	            kind: "function-type",
	            typeParameters: [],
	            parameters: parameters, returnType: returnType
	        };
	    },
	    parameter: function (name, type, flags) {
	        if (flags === void 0) { flags = ParameterFlags.None; }
	        return {
	            kind: "parameter",
	            name: name, type: type, flags: flags
	        };
	    },
	    constructor: function (parameters, flags) {
	        if (flags === void 0) { flags = DeclarationFlags.None; }
	        return {
	            kind: "constructor",
	            parameters: parameters,
	            flags: flags
	        };
	    },
	    const: function (name, type, flags) {
	        if (flags === void 0) { flags = DeclarationFlags.None; }
	        return {
	            kind: "const", name: name, type: type, flags: flags
	        };
	    },
	    variable: function (name, type) {
	        return {
	            kind: "var", name: name, type: type
	        };
	    },
	    alias: function (name, type, flags) {
	        if (flags === void 0) { flags = DeclarationFlags.None; }
	        return {
	            kind: "alias", name: name, type: type,
	            typeParameters: [], flags: flags
	        };
	    },
	    namespace: function (name) {
	        return {
	            kind: "namespace", name: name,
	            members: []
	        };
	    },
	    objectType: function (members) {
	        return {
	            kind: "object",
	            members: members
	        };
	    },
	    indexSignature: function (name, indexType, valueType) {
	        return {
	            kind: 'index-signature',
	            name: name, indexType: indexType, valueType: valueType
	        };
	    },
	    array: function (type) {
	        return {
	            kind: "array",
	            type: type
	        };
	    },
	    namedTypeReference: function (name) {
	        return {
	            kind: 'name',
	            name: name,
	            typeArguments: []
	        };
	    },
	    exportEquals: function (target) {
	        return {
	            kind: 'export=',
	            target: target
	        };
	    },
	    exportDefault: function (name) {
	        return {
	            kind: 'exportDefault',
	            name: name
	        };
	    },
	    exportName: function (name, as) {
	        return {
	            kind: "exportName",
	            name: name,
	            as: as
	        };
	    },
	    module: function (name) {
	        return {
	            kind: 'module',
	            name: name,
	            members: []
	        };
	    },
	    importAll: function (name, from) {
	        return {
	            kind: 'importAll',
	            name: name,
	            from: from
	        };
	    },
	    importDefault: function (name, from) {
	        return {
	            kind: 'importDefault',
	            name: name,
	            from: from
	        };
	    },
	    importNamed: function (name, as, from) {
	        return {
	            kind: 'importNamed',
	            name: name,
	            as: typeof from !== 'undefined' ? as : undefined,
	            from: typeof from !== 'undefined' ? from : as
	        };
	    },
	    importEquals: function (name, from) {
	        return {
	            kind: 'import=',
	            name: name,
	            from: from
	        };
	    },
	    import: function (from) {
	        return {
	            kind: 'import',
	            from: from
	        };
	    },
	    union: function (members) {
	        return {
	            kind: 'union',
	            members: members
	        };
	    },
	    intersection: function (members) {
	        return {
	            kind: 'intersection',
	            members: members
	        };
	    },
	    typeof: function (type) {
	        return {
	            kind: 'typeof',
	            type: type
	        };
	    },
	    tripleSlashReferencePathDirective: function (path) {
	        return {
	            kind: "triple-slash-reference-path",
	            path: path
	        };
	    },
	    tripleSlashReferenceTypesDirective: function (types) {
	        return {
	            kind: "triple-slash-reference-types",
	            types: types
	        };
	    },
	    tripleSlashReferenceNoDefaultLibDirective: function (value) {
	        if (value === void 0) { value = true; }
	        return {
	            kind: "triple-slash-reference-no-default-lib",
	            value: value
	        };
	    },
	    tripleSlashAmdModuleDirective: function (name) {
	        return {
	            kind: "triple-slash-amd-module",
	            name: name
	        };
	    }
	};
	exports.type = {
	    array: function (type) {
	        return {
	            kind: "array",
	            type: type
	        };
	    },
	    stringLiteral: function (string) {
	        return {
	            kind: "string-literal",
	            value: string
	        };
	    },
	    numberLiteral: function (number) {
	        return {
	            kind: "number-literal",
	            value: number
	        };
	    },
	    string: "string",
	    number: "number",
	    boolean: "boolean",
	    any: "any",
	    unknown: "unknown",
	    void: "void",
	    object: "object",
	    null: "null",
	    undefined: "undefined",
	    true: "true",
	    false: "false",
	    this: "this"
	};
	exports.reservedWords = ['abstract', 'await', 'boolean', 'break', 'byte', 'case',
	    'catch', 'char', 'class', 'const', 'continue', 'debugger', 'default',
	    'delete', 'do', 'double', 'else', 'enum', 'export', 'extends', 'false',
	    'final', 'finally', 'float', 'for', 'function', 'goto', 'if', 'implements',
	    'import', 'in', 'instanceof', 'int', 'interface', 'let', 'long', 'native',
	    'new', 'null', 'package', 'private', 'protected', 'public', 'return', 'short',
	    'static', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws',
	    'transient', 'true', 'try', 'typeof', 'var', 'void', 'volatile', 'while', 'with', 'yield'];
	/** IdentifierName can be written as unquoted property names, but may be reserved words. */
	function isIdentifierName(s) {
	    return /^[$A-Z_][0-9A-Z_$]*$/i.test(s);
	}
	exports.isIdentifierName = isIdentifierName;
	/** Identifiers are e.g. legal variable names. They may not be reserved words */
	function isIdentifier(s) {
	    return isIdentifierName(s) && exports.reservedWords.indexOf(s) < 0;
	}
	exports.isIdentifier = isIdentifier;
	function quoteIfNeeded(s) {
	    if (isIdentifierName(s)) {
	        return s;
	    }
	    else {
	        // JSON.stringify handles escaping quotes for us. Handy!
	        return JSON.stringify(s);
	    }
	}
	var ContextFlags;
	(function (ContextFlags) {
	    ContextFlags[ContextFlags["None"] = 0] = "None";
	    ContextFlags[ContextFlags["Module"] = 1] = "Module";
	    ContextFlags[ContextFlags["InAmbientNamespace"] = 2] = "InAmbientNamespace";
	})(ContextFlags = exports.ContextFlags || (exports.ContextFlags = {}));
	function never(x, err) {
	    throw new Error(err);
	}
	exports.never = never;
	function emit(rootDecl, _a) {
	    var _b = _a === void 0 ? {} : _a, _c = _b.rootFlags, rootFlags = _c === void 0 ? ContextFlags.None : _c, _d = _b.tripleSlashDirectives, tripleSlashDirectives = _d === void 0 ? [] : _d, _e = _b.singleLineJsDocComments, singleLineJsDocComments = _e === void 0 ? false : _e;
	    var output = "";
	    var indentLevel = 0;
	    var isModuleWithModuleFlag = rootDecl.kind === 'module' && rootFlags === ContextFlags.Module;
	    // For a module root declaration we must omit the module flag.
	    var contextStack = isModuleWithModuleFlag ? [] : [rootFlags];
	    tripleSlashDirectives.forEach(writeTripleSlashDirective);
	    writeDeclaration(rootDecl);
	    newline();
	    return output;
	    function getContextFlags() {
	        return contextStack.reduce(function (a, b) { return a | b; }, ContextFlags.None);
	    }
	    function tab() {
	        for (var i = 0; i < indentLevel; i++) {
	            output = output + '    ';
	        }
	    }
	    function print(s) {
	        output = output + s;
	    }
	    function start(s) {
	        tab();
	        print(s);
	    }
	    function classFlagsToString(flags) {
	        if (flags === void 0) { flags = DeclarationFlags.None; }
	        var out = '';
	        if (flags && flags & DeclarationFlags.Abstract) {
	            out += 'abstract ';
	        }
	        return out;
	    }
	    function memberFlagsToString(flags) {
	        if (flags === void 0) { flags = DeclarationFlags.None; }
	        var out = '';
	        if (flags & DeclarationFlags.Private) {
	            out += 'private ';
	        }
	        else if (flags & DeclarationFlags.Protected) {
	            out += 'protected ';
	        }
	        if (flags & DeclarationFlags.Static) {
	            out += 'static ';
	        }
	        if (flags & DeclarationFlags.Abstract) {
	            out += 'abstract ';
	        }
	        if (flags & DeclarationFlags.ReadOnly) {
	            out += 'readonly ';
	        }
	        return out;
	    }
	    function startWithDeclareOrExport(s, flags) {
	        if (flags === void 0) { flags = DeclarationFlags.None; }
	        if (getContextFlags() & ContextFlags.InAmbientNamespace) {
	            // Already in an all-export context
	            start(s);
	        }
	        else if (flags & DeclarationFlags.Export) {
	            start("export " + s);
	        }
	        else if (flags & DeclarationFlags.ExportDefault) {
	            start("export default " + s);
	        }
	        else if (getContextFlags() & ContextFlags.Module) {
	            start(s);
	        }
	        else {
	            start("declare " + s);
	        }
	    }
	    function newline() {
	        output = output + exports.config.outputEol;
	    }
	    function needsParens(d) {
	        if (typeof d === 'string') {
	            return false;
	        }
	        switch (d.kind) {
	            case "array":
	            case "alias":
	            case "interface":
	            case "class":
	            case "union":
	                return true;
	            default:
	                return false;
	        }
	    }
	    function printDeclarationComments(decl) {
	        if (decl.comment) {
	            start("// " + decl.comment);
	            newline();
	        }
	        if (decl.jsDocComment) {
	            if (singleLineJsDocComments && decl.jsDocComment.split(/\r?\n/g).length === 1) {
	                start('/**  ');
	                print(decl.jsDocComment.split(/\r?\n/g)[0]);
	                print('  */');
	            }
	            else if (exports.config.wrapJsDocComments) {
	                start('/**');
	                newline();
	                for (var _i = 0, _a = decl.jsDocComment.split(/\r?\n/g); _i < _a.length; _i++) {
	                    var line = _a[_i];
	                    start(" * " + line);
	                    newline();
	                }
	                start(' */');
	            }
	            else {
	                start(decl.jsDocComment);
	            }
	            newline();
	        }
	    }
	    function hasFlag(haystack, needle) {
	        if (haystack === undefined) {
	            return false;
	        }
	        return !!(needle & haystack);
	    }
	    function printObjectTypeMembers(members) {
	        print('{');
	        newline();
	        indentLevel++;
	        for (var _i = 0, members_1 = members; _i < members_1.length; _i++) {
	            var member = members_1[_i];
	            printMember(member);
	        }
	        indentLevel--;
	        tab();
	        print('}');
	        function printMember(member) {
	            switch (member.kind) {
	                case 'index-signature':
	                    printDeclarationComments(member);
	                    tab();
	                    print("[" + member.name + ": ");
	                    writeReference(member.indexType);
	                    print(']: ');
	                    writeReference(member.valueType);
	                    print(';');
	                    newline();
	                    return;
	                case "call-signature": {
	                    printDeclarationComments(member);
	                    tab();
	                    writeTypeParameters(member.typeParameters);
	                    print("(");
	                    writeDelimited(member.parameters, ', ', writeParameter);
	                    print("): ");
	                    writeReference(member.returnType);
	                    print(";");
	                    newline();
	                    return;
	                }
	                case 'method':
	                    printDeclarationComments(member);
	                    tab();
	                    print(quoteIfNeeded(member.name));
	                    if (hasFlag(member.flags, DeclarationFlags.Optional))
	                        print('?');
	                    writeTypeParameters(member.typeParameters);
	                    print('(');
	                    var first = true;
	                    for (var _i = 0, _a = member.parameters; _i < _a.length; _i++) {
	                        var param = _a[_i];
	                        if (!first)
	                            print(', ');
	                        first = false;
	                        writeParameter(param);
	                    }
	                    print('): ');
	                    writeReference(member.returnType);
	                    print(';');
	                    newline();
	                    return;
	                case 'property':
	                    printDeclarationComments(member);
	                    tab();
	                    if (hasFlag(member.flags, DeclarationFlags.ReadOnly))
	                        print('readonly ');
	                    print(quoteIfNeeded(member.name));
	                    if (hasFlag(member.flags, DeclarationFlags.Optional))
	                        print('?');
	                    print(': ');
	                    writeReference(member.type);
	                    print(';');
	                    newline();
	                    return;
	            }
	            never(member, "Unknown member kind " + member.kind);
	        }
	    }
	    function writeUnionReference(d) {
	        if (typeof d !== "string" && d.kind === "function-type") {
	            print('(');
	            writeReference(d);
	            print(')');
	        }
	        else {
	            writeReference(d);
	        }
	    }
	    function writeReference(d) {
	        if (typeof d === 'string') {
	            print(d);
	        }
	        else {
	            var e = d;
	            switch (e.kind) {
	                case "type-parameter":
	                case "class":
	                case "interface":
	                case "alias":
	                    print(e.name);
	                    break;
	                case "name":
	                    print(e.name);
	                    writeTypeArguments(e.typeArguments);
	                    break;
	                case "array":
	                    if (needsParens(e.type))
	                        print('(');
	                    writeReference(e.type);
	                    if (needsParens(e.type))
	                        print(')');
	                    print('[]');
	                    break;
	                case "object":
	                    printObjectTypeMembers(e.members);
	                    break;
	                case "string-literal":
	                    print(JSON.stringify(e.value));
	                    break;
	                case "number-literal":
	                    if (isNaN(e.value))
	                        print("typeof NaN");
	                    else if (!isFinite(e.value))
	                        print("typeof Infinity");
	                    else
	                        print(e.value.toString());
	                    break;
	                case "function-type":
	                    writeFunctionType(e);
	                    break;
	                case "union":
	                    writeDelimited(e.members, ' | ', writeUnionReference);
	                    break;
	                case "intersection":
	                    writeDelimited(e.members, ' & ', writeUnionReference);
	                    break;
	                case "typeof":
	                    print("typeof ");
	                    writeReference(e.type);
	                    break;
	                default:
	                    throw new Error("Unknown kind " + d.kind);
	            }
	        }
	    }
	    function writeTypeParameters(params) {
	        if (params.length === 0)
	            return;
	        print('<');
	        var first = true;
	        for (var _i = 0, params_1 = params; _i < params_1.length; _i++) {
	            var p = params_1[_i];
	            if (!first)
	                print(', ');
	            print(p.name);
	            if (p.baseType) {
	                print(' extends ');
	                if (isPrimitiveType(p.baseType))
	                    print(String(p.baseType));
	                else if (p.baseType.kind === 'type-parameter')
	                    print(p.baseType.name);
	                else
	                    writeReference(p.baseType);
	            }
	            if (p.defaultType) {
	                print(' = ');
	                writeReference(p.defaultType);
	            }
	            first = false;
	        }
	        print('>');
	    }
	    function writeTypeArguments(args) {
	        if (args.length === 0)
	            return;
	        print('<');
	        var first = true;
	        for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
	            var p = args_1[_i];
	            if (!first)
	                print(', ');
	            writeReference(p);
	            first = false;
	        }
	        print('>');
	    }
	    function writeInterface(d) {
	        printDeclarationComments(d);
	        startWithDeclareOrExport("interface ", d.flags);
	        print(d.name);
	        writeTypeParameters(d.typeParameters);
	        if (d.baseTypes && d.baseTypes.length) {
	            print("extends ");
	            var first = true;
	            for (var _i = 0, _a = d.baseTypes; _i < _a.length; _i++) {
	                var baseType = _a[_i];
	                if (!first)
	                    print(', ');
	                writeReference(baseType);
	                first = false;
	            }
	        }
	        print(" ");
	        printObjectTypeMembers(d.members);
	        newline();
	    }
	    function writeFunctionType(f) {
	        writeTypeParameters(f.typeParameters);
	        print('(');
	        writeDelimited(f.parameters, ', ', writeParameter);
	        print(')');
	        print('=>');
	        writeReference(f.returnType);
	    }
	    function writeFunction(f) {
	        printDeclarationComments(f);
	        if (!isIdentifier(f.name)) {
	            start("/* Illegal function name '" + f.name + "' can't be used here");
	            newline();
	        }
	        startWithDeclareOrExport("function " + f.name, f.flags);
	        writeTypeParameters(f.typeParameters);
	        print('(');
	        writeDelimited(f.parameters, ', ', writeParameter);
	        print('): ');
	        writeReference(f.returnType);
	        print(';');
	        newline();
	        if (!isIdentifier(f.name)) {
	            start("*/");
	            newline();
	        }
	    }
	    function writeParameter(p) {
	        var flags = p.flags || DeclarationFlags.None;
	        print("" + (flags & ParameterFlags.Rest ? '...' : '') + p.name + (flags & ParameterFlags.Optional ? '?' : '') + ": ");
	        writeReference(p.type);
	    }
	    function writeDelimited(arr, sep, printer) {
	        var first = true;
	        for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
	            var el = arr_1[_i];
	            if (!first) {
	                print(sep);
	            }
	            printer(el);
	            first = false;
	        }
	    }
	    function writeClass(c) {
	        printDeclarationComments(c);
	        startWithDeclareOrExport(classFlagsToString(c.flags) + "class " + c.name, c.flags);
	        writeTypeParameters(c.typeParameters);
	        if (c.baseType) {
	            print(' extends ');
	            writeReference(c.baseType);
	        }
	        if (c.implements && c.implements.length) {
	            print(' implements ');
	            var first = true;
	            for (var _i = 0, _a = c.implements; _i < _a.length; _i++) {
	                var impl = _a[_i];
	                if (!first)
	                    print(', ');
	                writeReference(impl);
	                first = false;
	            }
	        }
	        print(' {');
	        newline();
	        indentLevel++;
	        for (var _b = 0, _c = c.members; _b < _c.length; _b++) {
	            var m = _c[_b];
	            writeClassMember(m);
	            newline();
	        }
	        indentLevel--;
	        start('}');
	        newline();
	    }
	    function writeClassMember(c) {
	        switch (c.kind) {
	            case "property":
	                return writePropertyDeclaration(c);
	            case "method":
	                return writeMethodDeclaration(c);
	            case "constructor":
	                return writeConstructorDeclaration(c);
	        }
	    }
	    function writeConstructorDeclaration(ctor) {
	        printDeclarationComments(ctor);
	        start('constructor(');
	        writeDelimited(ctor.parameters, ', ', writeParameter);
	        print(');');
	        newline();
	    }
	    function writePropertyDeclaration(p) {
	        printDeclarationComments(p);
	        start("" + memberFlagsToString(p.flags) + quoteIfNeeded(p.name) + ": ");
	        writeReference(p.type);
	        print(';');
	        newline();
	    }
	    function writeMethodDeclaration(m) {
	        printDeclarationComments(m);
	        start("" + memberFlagsToString(m.flags) + quoteIfNeeded(m.name));
	        writeTypeParameters(m.typeParameters);
	        print('(');
	        writeDelimited(m.parameters, ', ', writeParameter);
	        print('): ');
	        writeReference(m.returnType);
	        print(';');
	        newline();
	    }
	    function writeNamespace(ns) {
	        printDeclarationComments(ns);
	        startWithDeclareOrExport("namespace " + ns.name + " {", ns.flags);
	        contextStack.push(ContextFlags.InAmbientNamespace);
	        newline();
	        indentLevel++;
	        for (var _i = 0, _a = ns.members; _i < _a.length; _i++) {
	            var member = _a[_i];
	            writeDeclaration(member);
	            newline();
	        }
	        indentLevel--;
	        start("}");
	        contextStack.pop();
	        newline();
	    }
	    function writeConst(c) {
	        printDeclarationComments(c);
	        startWithDeclareOrExport("const " + c.name + ": ", c.flags);
	        writeReference(c.type);
	        print(';');
	        newline();
	    }
	    function writeVar(c) {
	        printDeclarationComments(c);
	        startWithDeclareOrExport("var " + c.name + ": ", c.flags);
	        writeReference(c.type);
	        print(';');
	        newline();
	    }
	    function writeAlias(a) {
	        printDeclarationComments(a);
	        startWithDeclareOrExport("type " + a.name, a.flags);
	        writeTypeParameters(a.typeParameters);
	        print(' = ');
	        writeReference(a.type);
	        print(';');
	        newline();
	    }
	    function writeExportEquals(e) {
	        start("export = " + e.target + ";");
	        newline();
	    }
	    function writeExportDefault(e) {
	        start("export default " + e.name + ";");
	        newline();
	    }
	    function writeExportName(e) {
	        start("export { " + e.name);
	        if (e.as) {
	            print(" as " + e.as);
	        }
	        print(' };');
	        newline();
	    }
	    function writeModule(m) {
	        printDeclarationComments(m);
	        startWithDeclareOrExport("module '" + m.name + "' {", m.flags);
	        contextStack.push(ContextFlags.Module);
	        newline();
	        indentLevel++;
	        for (var _i = 0, _a = m.members; _i < _a.length; _i++) {
	            var member = _a[_i];
	            writeDeclaration(member);
	            newline();
	        }
	        indentLevel--;
	        start("}");
	        contextStack.pop();
	        newline();
	    }
	    function writeImportAll(i) {
	        start("import * as " + i.name + " from '" + i.from + "';");
	        newline();
	    }
	    function writeImportDefault(i) {
	        start("import " + i.name + " from '" + i.from + "';");
	        newline();
	    }
	    function writeImportNamed(i) {
	        start("import {" + i.name);
	        if (i.as) {
	            print(" as " + i.as);
	        }
	        print("} from '" + i.from + "';");
	        newline();
	    }
	    function writeImportEquals(i) {
	        start("import " + i.name + " = require('" + i.from + "');");
	        newline();
	    }
	    function writeImport(i) {
	        start("import '" + i.from + "';");
	        newline();
	    }
	    function writeEnum(e) {
	        printDeclarationComments(e);
	        startWithDeclareOrExport((e.constant ? 'const ' : '') + "enum " + e.name + " {", e.flags);
	        newline();
	        indentLevel++;
	        for (var _i = 0, _a = e.members; _i < _a.length; _i++) {
	            var member = _a[_i];
	            writeEnumValue(member);
	        }
	        indentLevel--;
	        start("}");
	        newline();
	    }
	    function writeEnumValue(e) {
	        printDeclarationComments(e);
	        start(e.name);
	        if (e.value !== undefined) {
	            if (typeof e.value === 'string') {
	                print(" = \"" + e.value + "\"");
	            }
	            else {
	                print(" = " + e.value);
	            }
	        }
	        print(',');
	        newline();
	    }
	    function writeTripleSlashDirective(t) {
	        var type = t.kind === "triple-slash-amd-module" ? "amd-module" : "reference";
	        start("/// <" + type);
	        switch (t.kind) {
	            case "triple-slash-reference-path":
	                print(" path=\"" + t.path + "\"");
	                break;
	            case "triple-slash-reference-types":
	                print(" types=\"" + t.types + "\"");
	                break;
	            case "triple-slash-reference-no-default-lib":
	                print(" no-default-lib=\"" + t.value + "\"");
	                break;
	            case "triple-slash-amd-module":
	                if (t.name) {
	                    print(" name=\"" + t.name + "\"");
	                }
	                break;
	            default:
	                never(t, "Unknown triple slash directive kind " + t.kind);
	        }
	        print(" />");
	        newline();
	    }
	    function writeDeclaration(d) {
	        if (typeof d === 'string') {
	            return print(d);
	        }
	        else {
	            switch (d.kind) {
	                case "interface":
	                    return writeInterface(d);
	                case "function":
	                    return writeFunction(d);
	                case "class":
	                    return writeClass(d);
	                case "namespace":
	                    return writeNamespace(d);
	                case "const":
	                    return writeConst(d);
	                case "var":
	                    return writeVar(d);
	                case "alias":
	                    return writeAlias(d);
	                case "export=":
	                    return writeExportEquals(d);
	                case "exportDefault":
	                    return writeExportDefault(d);
	                case "exportName":
	                    return writeExportName(d);
	                case "module":
	                    return writeModule(d);
	                case "importAll":
	                    return writeImportAll(d);
	                case "importDefault":
	                    return writeImportDefault(d);
	                case "importNamed":
	                    return writeImportNamed(d);
	                case "import=":
	                    return writeImportEquals(d);
	                case "import":
	                    return writeImport(d);
	                case "enum":
	                    return writeEnum(d);
	                default:
	                    return never(d, "Unknown declaration kind " + d.kind);
	            }
	        }
	    }
	}
	exports.emit = emit;
	
} (bin));

const dom$e = bin;

const extract = (s) => s.match(/=\s(.*);/)[1];

var array = function a(def, tsParent, g) {
  let subtype = dom$e.type.any;
  if (def.items && !Array.isArray(def.items)) {
    // same type for all elements
    subtype = g.getType(def.items, { kind: 'array' });
  } else if (Array.isArray(def.items)) {
    // hackish way of handling tuples
    // TODO - handle tuples properly when dts-dom supports it
    subtype = def.items.map((t) => extract(dom$e.emit(dom$e.create.alias('a', g.getType(t, { kind: 'array' })))));
    return `[${subtype.join(', ')}]`;
  }
  return dom$e.create.array(subtype);
};

const dom$d = bin;

function params$4(pars = [], thisContext, g) {
  const ret = pars.map((p) => {
    let flags = dom$d.ParameterFlags.None;
    if (p.optional) {
      flags |= dom$d.ParameterFlags.Optional;
    } else if (p.variable) {
      // note that typescript does not allow a rest param to also
      // be optional, hence the else if here
      flags |= dom$d.ParameterFlags.Rest;
    }
    const t = g.getType(p, { kind: 'parameter' });
    if (t.kind === 'object' && p.entries) {
      g.traverse(p.entries, { parent: t, path: '', flags: 0 });
    } else if (p.entries) {
      console.warn('unhandled entries');
    }
    const pp = dom$d.create.parameter(p.name || '$', t, flags);
    if (p.description) {
      pp._description = p.description;
    }
    return pp;
  });
  return thisContext ? [dom$d.create.parameter('this', g.getType(thisContext)), ...ret] : ret;
}

var params_1 = params$4;

/* eslint-disable no-param-reassign */

const dom$c = bin;
const params$3 = params_1;

var _function = function fn(def, tsParent, g, isEntry) {
  const par = params$3(def.params || [], def.this, g);
  const ret = def.returns ? g.getType(def.returns) : dom$c.type.void;
  if (tsParent && ['class', 'interface', 'object'].includes(tsParent.kind)) {
    return dom$c.create.method(def.name, par, ret);
  }
  if (tsParent && ['union', 'array', 'parameter', 'alias'].includes(tsParent.kind)) {
    return dom$c.create.functionType(par, ret);
  }
  if (isEntry) {
    return dom$c.create.function(def.name, par, ret);
  }

  // TODO - async?
  // if (def.optional) {
  //   t.flags = dom.DeclarationFlags.Optional;
  // }
  const fnType = dom$c.create.functionType(par, ret);
  return dom$c.create.alias(def.name, fnType);
};

const dom$b = bin;

var typeParams$2 = function typeParams(templates, tsParent, g) {
  const ty = templates.map((tt) => {
    const basetype = tt.type ? g.getType(tt) : undefined;
    const defaultType = typeof tt.defaultValue !== 'undefined' ? g.getType({ type: tt.defaultValue }) : undefined;
    const tp = dom$b.create.typeParameter(tt.name, basetype);
    if (defaultType) {
      tp.defaultType = defaultType;
    }
    return tp;
  });

  return ty;
};

const dom$a = bin;
const params$2 = params_1;
const typeParams$1 = typeParams$2;

/* eslint no-param-reassign: 0 */

var _interface = function fn(def, tsParent, g) {
  const t = dom$a.create.interface(def.name);
  if (def.templates) {
    t.typeParameters = typeParams$1(def.templates, false, g);
  }
  if (def.returns || def.params) {
    const rt = def.returns ? g.getType(def.returns) : dom$a.type.void;
    const cs = dom$a.create.callSignature(params$2(def.params, def.this, g), rt);

    // optional/rest flags for params in call-signatures are NOT printed by dts-dom,
    // so hack it a bit by ammending ... or ? to the name of the param to get the same effect
    // TODO - remove this hack when dts-dom fixes this
    cs.parameters.forEach((p) => {
      if ((p.flags || 0) & dom$a.ParameterFlags.Optional) {
        p.name += '?';
      } else if (p.flags === dom$a.ParameterFlags.Rest) {
        p.name = `...${p.name}`;
      }
      p.flags = 0; // reset to avoid flags being used if dts-dom supports it before above code has been removed
    });
    t.members.push(cs);
  }
  if (def.extends) {
    t.baseTypes = t.baseTypes || [];
    def.extends.forEach((d) => {
      t.baseTypes.push(g.getType(d));
    });
  }
  return t;
};

const dom$9 = bin;

var alias$1 = function alias(def, tsParent, g) {
  const al = dom$9.create.alias(def.name, g.getType(def.items, { kind: 'alias' }));
  return al;
};

const dom$8 = bin;
const params$1 = params_1;

var _class = function klass(def, tsParent, g) {
  const t = dom$8.create.class(def.name);
  if (Object.prototype.hasOwnProperty.call(def, 'constructor')) {
    const c = dom$8.create.constructor(params$1(def.constructor.params || [], false, g));
    t.members.push(c);
  }

  if (def.extends && def.extends[0]) {
    t.baseType = g.getType(def.extends[0]);
  }
  (def.implements || []).forEach((i) => {
    t.implements.push(g.getType(i));
  });
  // traverse(def.staticEntries || {}, t, `${path}/staticEntries`, {
  //   flags: dom.DeclarationFlags.Static,
  // });
  return t;
};

const dom$7 = bin;

var _enum = function enm(def) {
  const e = dom$7.create.enum(def.name, true);
  return e;
};

const dom$6 = bin;

const DEF_RX = /^#\/definitions\//;
var reference$1 = function ref(path, name, g, isEntry) {
  const p = path
    .split('/')
    .slice(1)
    .filter((a, i) => i % 2 !== 0)
    .join('.');

  // API entry
  if (isEntry) {
    return dom$6.create.const(name, [g.namespace, p].filter(Boolean).join('.'));
  }
  // Definition ref
  if (DEF_RX.test(path)) {
    return dom$6.create.namedTypeReference([g.namespace, p].filter(Boolean).join('.'));
  }
  // Entry ref
  const typeRef = dom$6.create.namedTypeReference(p);
  return dom$6.create.typeof(typeRef);
};

const dom$5 = bin;

var union$1 = function union(def, tsParent, g) {
  const un = dom$5.create.union(def.items.map(($) => g.getType($, { kind: 'union' })));
  return un;
  // return !tsParent || tsParent.kind === 'namespace' ? dom.create.alias(def.name, un) : un;
};

const dom$4 = bin;
const params = params_1;

var event$1 = function event(def, tsParent, g) {
  // TODO - register more event methods, e.g. 'once', removeListener etc
  const eventDef = {
    ...def,
    name: 'on',
    params: [{ name: 'event', kind: 'literal', value: `${def.name}` }],
    kind: 'function',
  };
  const eventType = g.getType(eventDef, tsParent);

  const listener = dom$4.create.functionType(params(def.params, false, g), dom$4.type.void);
  const listenerParemeter = dom$4.create.parameter('listener', listener);
  eventType.parameters.push(listenerParemeter);
  return eventType;
};

var comments$1 = function c(def, t) {
  const comments = [];

  if (def.description) {
    comments.push(def.description);
  }
  if (def.availability && def.availability.deprecated) {
    // TODO - add @version if @since is present
    comments.push('@deprecated');
  }
  if (t.parameters && t.parameters.length) {
    comments.push(
      ...t.parameters
        .filter((p) => p.name !== 'this')
        .map((p) => `@param ${p.name}${p._description ? ` ${p._description}` : ''}`)
    );
  }

  return comments.length ? comments.join('\n') : undefined;
};

const dom$3 = bin;

const arr = array;
const fn = _function;
const iface = _interface;
const alias = alias$1;
const klass = _class;
const enm = _enum;
const reference = reference$1;
const union = union$1;
const event = event$1;
const typeParams = typeParams$2;

const comments = comments$1;

const primitives = [
  'string',
  'number',
  'boolean',
  'any',
  'void',
  'object',
  'null',
  'undefined',
  'true',
  'false',
  'this',
];

const ENTRY_RX = /^#\/entries\//;

function typeFn$1(g) {
  const getBase = (def, tsParent) => {
    const isEntry = def.path && ENTRY_RX.test(def.path);

    if (!def.kind && /^#\//.test(def.type)) {
      return reference(def.type, def.name, g, isEntry);
    }

    let t;

    // ====== kinds ===========
    switch (def.kind) {
      case 'module':
        return dom$3.create.module(def.name);
      case 'namespace':
        return dom$3.create.namespace(def.name);
      case 'object':
        return dom$3.create.objectType([]);
      case 'alias':
        return alias(def, tsParent, g);
      case 'class':
        return klass(def, tsParent, g);
      case 'enum':
        return enm(def);
      case 'function':
        return fn(def, tsParent, g, isEntry);
      case 'interface':
        return iface(def, tsParent, g);
      case 'array':
        return arr(def, tsParent, g);
      case 'union':
        return union(def, tsParent, g);
      case 'event':
        return event(def, tsParent, g);
    }

    if (tsParent && tsParent.kind === 'enum') {
      return dom$3.create.enumValue(def.name, def.value);
    }

    if (def.kind === 'literal') {
      let { value } = def;
      if (typeof value === 'string') {
        value = value.replace(/'/g, '');
      }
      return dom$3.type.stringLiteral(value);
    }

    // ====== types ===========
    if (def.type === 'function') {
      return dom$3.create.functionType([], def.returns ? g.getType(def.returns) : dom$3.type.void);
    }

    if (def.type === 'object' && def.generics && ['string', 'number'].includes(def.generics[0])) {
      t = dom$3.create.objectType([]);
      const gen = dom$3.create.indexSignature('index', g.getType(def.generics[0]), g.getType(def.generics[1]));
      t.members.push(gen);
      return t;
    }

    if (primitives.includes(def.type) && dom$3.type[def.type]) {
      const primitiveType = dom$3.type[def.type];
      return isEntry ? dom$3.create.const(def.name, primitiveType) : primitiveType;
    }

    if (def.type) {
      return dom$3.create.namedTypeReference(def.type);
    }

    // console.warn('ANY', def);
    return dom$3.type.any;
  };

  return (def, tsParent) => {
    const t = getBase(def, tsParent);

    if (def.generics && t.typeArguments) {
      def.generics.forEach((gen) => {
        t.typeArguments.push(g.getType(gen));
      });
    }

    if (def.templates && t.typeParameters) {
      t.typeParameters = typeParams(def.templates, t, g);
    }

    const com = comments(def, t);
    if (com) {
      t.jsDocComment = com;
    }

    return t;
  };
}

var type = typeFn$1;

const dom$2 = bin;

const VALID_MEMBERS = {
  class: ['property', 'method', 'index-signature', 'constructor'],
  enum: ['enum-value'],
  module: ['interface', 'alias', 'class', 'namespace', 'const', 'var', 'function'],
  namespace: ['interface', 'alias', 'class', 'namespace', 'const', 'var', 'function', 'enum'],
  interface: ['property', 'method', 'index-signature', 'call-signature'],
  object: ['property', 'method', 'index-signature', 'call-signature'],
};

const VALID_TOP_LEVEL = [
  'interface',
  'function',
  'class',
  'namespace',
  'const',
  'var',
  'alias',
  'export=',
  'exportDefault',
  'exportName',
  'module',
  'importAll',
  'importDefault',
  'importNamed',
  'import=',
  'import',
  'enum',
];

function traverseFn$1(g) {
  return (obj, { parent: tsParent, path = '', flags = '' }) => {
    const arr = [];
    Object.keys(obj || {}).forEach((key) => {
      const p = `${path}/${key}`;
      const def = obj[key];
      const tsType = g.getType(
        {
          name: key,
          path: p,
          ...def,
        },
        tsParent
      );
      if (flags) {
        tsType.flags = flags | (tsType.flags || 0);
      }
      if (tsParent) {
        if (VALID_MEMBERS[tsParent.kind] && VALID_MEMBERS[tsParent.kind].includes(tsType.kind)) {
          if (def.optional) {
            tsType.flags = (tsType.flags || 0) | dom$2.DeclarationFlags.Optional;
          }
          tsParent.members.push(tsType);
        } else if (tsType.kind === 'object' && def.extends) {
          const extendsType = g.getType(def.extends[0]);
          const intersection = dom$2.create.intersection([extendsType, tsType]);
          const propType = dom$2.create.alias(key, intersection, def.optional ? dom$2.DeclarationFlags.Optional : 0);
          tsParent.members.push(propType);
        } else if (VALID_MEMBERS[tsParent.kind] && VALID_MEMBERS[tsParent.kind].includes('property')) {
          const propType = dom$2.create.property(key, tsType, def.optional ? dom$2.DeclarationFlags.Optional : 0);
          tsParent.members.push(propType);
        } else if (VALID_MEMBERS[tsParent.kind] && VALID_MEMBERS[tsParent.kind].includes('alias')) {
          const propType = dom$2.create.alias(key, tsType, def.optional ? dom$2.DeclarationFlags.Optional : 0);
          tsParent.members.push(propType);
        } else {
          console.warn(`${tsParent.kind} '${tsParent.name}' can not have members of type '${tsType.kind}'`);
        }
      } else if (!VALID_TOP_LEVEL.includes(tsType.kind)) {
        const ali = dom$2.create.alias(key, tsType);
        arr.push(ali);
      } else {
        arr.push(tsType);
      }

      if (def.entries) {
        if (def.kind === 'function') {
          const ns = dom$2.create.namespace(key);
          if (flags) {
            ns.flags = flags | (tsType.flags || 0);
          }
          arr.push(ns, ...g.traverse(def.entries, { parent: ns, path: `${p}/entries`, flags: 0 }));
        } else {
          arr.push(...g.traverse(def.entries, { parent: tsType, path: `${p}/entries`, flags: 0 }));
        }
      }
      if (def.staticEntries) {
        arr.push(
          ...g.traverse(def.staticEntries, {
            parent: tsType,
            path: `${p}/staticEntries`,
            flags: dom$2.DeclarationFlags.Static,
          })
        );
      }

      if (def.events) {
        arr.push(...g.traverse(def.events, { parent: tsType, path: `${p}/events`, flags: 0 }));
      }

      if (def.definitions) {
        const ns = dom$2.create.namespace(key);
        if (tsParent && VALID_MEMBERS[tsParent.kind] && VALID_MEMBERS[tsParent.kind].includes('namespace')) {
          tsParent.members.push(ns);
        } else {
          arr.push(ns);
        }
        arr.push(...g.traverse(def.definitions, { parent: ns, path: `${p}/definitions`, flags: 0 }));
      }
    });
    return arr;
  };
}

var traverse = traverseFn$1;

const dom$1 = bin;

var top$1 = function top(spec, { umd = '', export: exp, includeDisclaimer, dependencies = {} } = {}) {
  // dom.create.namespace('supernova');
  const types = [];
  let entriesFlags = 0;
  // let definitionsFlags = 0;
  let entriesRoot;
  let libraryName;
  let ex = exp || 'named';

  if (includeDisclaimer) {
    types.push('// File generated automatically by "@scriptappy/to-dts"; DO NOT EDIT.');
  }

  if (Array.isArray(dependencies.references)) {
    dependencies.references.forEach((reference) => {
      types.push(`/// <reference types="${reference}" />`);
    });
  }

  if (Array.isArray(dependencies.imports)) {
    dependencies.imports.forEach((imp) => {
      types.push(`import ${imp.type} from ${imp.package};`);
    });
  }

  const entries = Object.keys(spec.entries || {});
  const definitions = Object.keys(spec.definitions || {});
  if (entries.length === 1) {
    [libraryName] = entries;
    ex = exp || 'exports';
  }

  if (umd) {
    types.push(`export as namespace ${umd}`);

    if (!libraryName) {
      libraryName = umd;
    }
  }
  if (!libraryName && spec.info) {
    const n = spec.info.name
      .split('/')
      .reverse()[0]
      .split('.')[0]
      .replace(/-([A-z0-9])/g, (v) => `${v[1].toUpperCase()}`);
    libraryName = n;
  }

  const definitionsRoot = definitions.length ? dom$1.create.namespace(libraryName) : undefined;

  // "export = x" is used for commonjs modules of type "module.exports = x"
  // "export default x" is used for es6 modules of type "export default x"
  // "export x" is for named exports
  if (ex === 'default') {
    types.push(dom$1.create.exportDefault(libraryName));
  } else if (ex === 'exports') {
    types.push(dom$1.create.exportEquals(libraryName));
  } else {
    // named
    entriesFlags = dom$1.DeclarationFlags.Export;
  }

  return {
    types,
    entriesRoot,
    entriesFlags,
    definitionsRoot,
  };
};

/* eslint no-bitwise:0 */

const dom = bin;

const typeFn = type;
const traverseFn = traverse;
const top = top$1;

/**
 *
 * @typedef {object} Config
 * @property {string=} umd
 * @property {('named'|'exports'|'default')=} export
 * @property {object=} output
 * @property {string=} output.file
 * @property {boolean=} includeDisclaimer
 * @property {object=} dependencies
 * @property {string[]} [references]
 */

/**
 * @entry
 * @param {object} specification
 * @param {Config} config
 * @returns {string}
 */
function toDts(specification, config) {
  let dts = '';

  const g = {
    specification,
  };
  g.getType = typeFn(g);
  g.traverse = traverseFn(g);

  const { types, entriesRoot, entriesFlags, definitionsRoot } = top(specification, config);

  if (definitionsRoot && definitionsRoot !== entriesRoot) {
    g.namespace = definitionsRoot.name;
  }

  const entries = g.traverse(specification.entries, {
    parent: entriesRoot,
    path: '#/entries',
    flags: entriesFlags,
  });
  const definitions = g.traverse(specification.definitions, {
    parent: definitionsRoot,
    path: '#/definitions',
    flags: 0,
  });

  const toEmit = [...types];

  if (entriesRoot) {
    toEmit.push(entriesRoot);
  }

  toEmit.push(...entries);

  if (definitionsRoot && definitionsRoot !== entriesRoot) {
    toEmit.push(definitionsRoot);
  }
  toEmit.push(...definitions);

  dts += toEmit.map((t) => dom.emit(t)).join('');

  // dts-dom@3.7.0 omits the leading space before "extends" in interface/class
  // declarations (e.g. `interface Fooextends Bar`). The lookahead (?=[A-Za-z_$])
  // ensures we only fix cases where "extends" introduces a type name, avoiding
  // false positives on interface names that happen to end with "extends".
  dts = dts.replace(/(\S)extends (?=[A-Za-z_$])/g, '$1 extends ');

  return dts;
}

var lib = toDts;

var index = /*@__PURE__*/getDefaultExportFromCjs(lib);

module.exports = index;
