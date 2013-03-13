var u = require('util');
function test(str, start, msg) {
    var tree = JoshParser.matchAll(str,start); //'top'
    console.log(str + " -> " +u.inspect(tree,false,20));
}
function _isKeyword(n) {
    if(n == 'if') return true;
//    if(n == 'null') return true;
    return false;
}


ometa JoshParser {
    //standard stuff        
    type   = "array" | "double" | "int" | "color" | "object" | "boolean" | iName,
    number = <digit+ ('.' digit+)?>:f,
    boolean = "true" | "false",
    color = "blue" | "red" | "green",
    
    alpha = letter | sp,
    words = alpha*,
    literal = (number | boolean | color | "null" ):l -> [#literal, l]
        | ("'" words:l "'") -> [#literal, [#string, l.join("")]],

    //standard stuff
    sp   = ^space | fromTo('//', '\n') | fromTo('/*','*/'),
    nameFirst    = letter | '$' | '_',
    nameRest     = nameFirst | digit,
    iName        = <nameFirst nameRest*>,
    isKeyword :x = ?_isKeyword(x),
    name         = iName:n ~isKeyword(n) 
        -> [#name, n=='self' ? '$elf' : n],
        
        
    //expressions
    expMul  = ref:a sp* "*"  sp* ref:b   -> [#mul, a,b],
    expAdd  = ref:a sp* "+"  sp* exp:b   -> [#add, a,b],
    expSub  = ref:a sp* "-"  sp* exp:b   -> [#sub, a,b],
    expNe   = ref:a sp* "!=" sp* exp:b   -> [#ne,  a,b],
    expEq   = ref:a sp* "==" sp* exp:b   -> [#eq,  a,b],
    expLt   = ref:a sp* "<"  sp* exp:b   -> [#lt,  a,b],
    expGt   = ref:a sp* ">"  sp* exp:b   -> [#gt,  a,b],

    exp = (expMul | expEq | expNe | expAdd | expSub | expLt | expGt | fcall | cstr | ref | literal | name):e   -> [#exp, e],
    
    
    //statements
    ref   = (ref:r "." name:n)                -> [#ref, r,n]
        |  name:n                             -> [#ref, n]
        | literal:n -> [#ref, n]
        ,
    fcall = (ref:r fcallargs:a )              -> [#fcall, r, a]
        |  name:n "()"                        -> [#fcall, n],
    fcallargs = "(" listOf(#ref,','):args ")" -> [#cargs, args],
    cstr  = "new" sp* name:n "(" listOf(#exp,","):args ")"             -> [#cstr,  n, [#cargs, args]],
    stmt  = (stmtRet|stmtAss|stmtFcall|stmtDec):s ";" sp* -> s,
    stmt  = cond:c -> c,
    stmtAss = ref:a sp* "=" sp* exp:b        -> [#assign, a, b],
    stmtDec = "var" sp* ref:a ":" name:t             -> [#dec, a, t],
    
    stmtRet = "return" sp+ ref:v          -> [#return, v],    
    stmtFcall = fcall,
    
    
    //conditionals
    cond = "if" "(" sp* exp:e ")" (block:block)? -> [#if, e, block],
    block= "{" sp* stmt*:s sp* "}"           -> [#block, s],
    

    
    //class def
    class  = classtype:t sp* name:n sp* extendDec?:ex sp* classblock:b   -> [#classdef, t, n, ex!=null ? ex : [], b ],
    classtype = "class" | "interface" | "value",
    extendDec = ("extends" sp* name:n) -> [#extend, n],    
    classblock = "{" member*:members "}"                   -> members,
    member = propdef | constdef | funcdef,
    //properties
    propdef = "prop" sp* type:t sp* iName:n ("=" sp* literal)?:v sp* ";" 
        -> [#propdef, n, [#type,t], v !=null ? [#value, v] :[]],
        
    //constants and enums
    constdef = "const" sp* iName:n ("=" sp* literal:v)? sp* ";"
        -> [#constdef, n, v !=null ? [#value, v] : []],
    //functions
    funcdef = "func" sp* ret:type sp* name:n funcargs:a sp* funcblock?:b
        -> [#func, n, a, type, b],
    arg = sp* iName?:t sp+ iName:n -> [t,n],
    ret = sp* iName:n -> [#rettype, n],
    funcargs = "(" listOf(#arg, ','):args ")"
        -> [#args, args],
    funcblock = "{" sp* stmt*:s sp* "}" -> [#block, s],
    
    
    
    top     = class*:cls                               -> [#blocks, [#classes, cls]]
}

function genProp(pname, type, value, ctype) {
    if(ctype == "value") {
        propcache.push({
                name:pname,
                type:type
        });
    } 
    var name = pname;
    var decl = tab+"   this."+pname+ ((value!=null) ? " = "+value:"") + ";"+nl;
    var getter = 
         tab+"this.get"+name+" = function(){"+nl
         +tab+"  return this."+pname+";"+nl
         +tab+"}"+nl;
    var setter = 
         tab+"this.set"+name+" = function("+name+"){"+nl
         +tab+"  this."+pname+"="+name+";"+nl
         +tab+"  this.markDirty();"+nl
         +tab+"  return this;"+nl
         +tab+"}"+nl;
    
    if(ctype =="value") {
        return decl + getter;
    } else {
        return decl + getter + setter;
    }
    
}


function genClass(name, type,ex,block) {
var cstr = "function " + name + "(){";
if(type == "value") {
        cstr = "function " + name + " (";
        var args = [];
        propcache.forEach(function(prop) {
                args.push(" " + prop.name);
        });
        cstr += args.join(", ");
        cstr += (") {"+nl);
        propcache.forEach(function(prop) {
                cstr += " this."+prop.name +" = " +prop.name+";"+nl;
        });
        //cstr += "}"+nl;
        
        //clear the property cache
        propcache = [];    
}
var temp = cstr + block +"}"+nl;


var ext = "";
if(ex == "[]") {
} else {
    ext = name +".extend("+ex+");"+nl;
}
return temp + ext;
}

function genFunc(name, fargs, fbody, lang) {
    var args = [];
    for(var i in fargs) {
        args[i] = fargs[i][1];
    }
    return "
    this."+name+" = function("+args.join(",")+"){
        "+fbody+"
    }";
}

function genConst(n) {
var temp = "    this.N = 'N';
"
    return temp.replace(/N/g,n);
}


var nl="
";


ometa Josh2JS {
    blocks = [#blocks [#classes [classdef*:x]]]           -> x.join(""),
    classdef = [#classdef classtype:t c:n c:ex [member(t)*:b]]        -> genClass(n,t,ex,b.join("")),
    classtype = #class     -> setClass(true, "class")
              | #interface -> setClass(false,"interface")
              | #value     -> setClass(true, "value"),
    member :t = (propdef(t)|funcdef|constdef):m                 -> m,
    
    block = [#block [c*:line]]                            -> line.join(";"+nl), 
    type = ['type' :t]                                    -> t,
    propdef :t = [#propdef :n type:type value:value]        -> genProp(n,type,value,t),
    funcdef  = [#func c:n [#args [c*]:args] c:type block:block] -> genFunc(n,args,block),
    constdef = [#constdef :n value]           -> genConst(n),
    
    value = [#value c:v]    -> v,
    value = []    -> null,
    
    c     = [#asdf      :v]    -> "asdf",
    c     = [#fcall    c:v]    -> (v + "();"),
    c     = [#return   c:v]    -> ("    return " + v +";"),
    c     = [#assign c:v c:v2]                      -> (v +" = " + v2),
    c     = [#dec [#ref [#name :n]] [#name :t]]     -> ("var " + n),
    c     = [#cstr c:n c:args]                      -> ("new "+n+"("+args+")"),
    c     = [#name      :v]                         -> v,
    c     = [#literal   [#string :v]]               -> ('"'+v+'"'),
    c     = [#literal   :v]                         -> v,
    c     = [#ref c:v c:v2]                         -> (v+"."+v2),
    c     = [#ref c:v]                              -> v,
    c     = [#extend c:n] -> n,
    c     = [#if c:ex block:b] -> ("    if("+ex+"){"+nl+b+"}"+nl),
    // expressions
    c     = [#exp [#eq c:v c:v2]]                   -> (v+"=="+v2),
    c     = [#exp [#ne c:v c:v2]]                   -> (v+"!="+v2),
    c     = [#exp [#gt c:v c:v2]]   -> (v+">"+v2),
    c     = [#exp [#lt c:v c:v2]]   -> (v+"<"+v2),
    c     = [#exp c:v]         -> v,
    c     = [#add c:v1 c:v2] -> (v1+"+"+v2),
    c     = [#sub c:v1 c:v2] -> (v1+"-"+v2),
    
    //function call
    c     = [#fcall c:n c:args]                     -> (n + "(" +args+")"),
    c     = [#cargs [c*:a]]                         -> a.join(","),
    
    c = [],
    c = :x -> ("  =:"+x+":="),
    c = [c:x] -> x.join(""),
    foo = bar
}

function p(s) {
    console.log(s);
}
function genJavaClass(name, type, ex, body, d) {
    var ext = " extends CommonObject ";
    if(ex != "[]") {
        ext = " extends " + ex + " ";
    }
    
    var clsstype = "class";
    if(type == "interface") {
        clsstype = "interface";
        ext = ""
    }
    
    var cstr = "";
    if(type == "value") {
        cstr = "public " + name + " (";
        var args = [];
        propcache.forEach(function(prop) {
                args.push(prop.type + " " + prop.name);
        });
        cstr += args.join(", ");
        cstr += (") {"+nl);
        propcache.forEach(function(prop) {
                cstr += " this."+prop.name +" = " +prop.name+";"+nl;
        });
        cstr += "}"+nl;
        
        //clear the property cache
        propcache = [];
    }
    
    return "public static "+clsstype+" " + name + ext + " {" + nl 
        + cstr +nl
        + body +nl
        + nl+"}"+nl;
}
var tab = "  ";
function genJavaMethod(name,args,type,block) {
    for(var i =0; i<args.length; i++) {
        args[i] = args[i][0] + " " + args[i][1]; 
    }
    
    var blk = "{"+nl+block.join(nl)+tab+"}"+nl;
    if(!icl) {
        blk=";"+nl;
    }
    return tab+"public "+type+" "
    + name
    + "("+args.join(", ")+")"
    +blk
    ;
}

function camelize(s) {
    return s.substring(0,1).toUpperCase() + s.substring(1);
}
function genJavaProp(pname,type,value,ctype) {
    //console.log("type = " + type + " value = " + value);
    if(ctype == "value") {
        propcache.push({
                name:pname,
                type:type
        });
    }
    if(type == "array") {
        type = "Object[]";
    }
    var name = camelize(pname);
    
    var decl = tab+"public "+type+" "+""+pname+ ((value!=null) ? " = "+value:"") + ";"+nl;
    var getter = 
         tab+"public "+type+" get"+name+"(){"+nl
         +tab+"  return this."+pname+";"+nl
         +tab+"}"+nl;
    var setter = 
         tab+"public void set"+name+"("+type+" "+name+"){"+nl
         +tab+"  this."+pname+"="+name+";"+nl
         +tab+"  markDirty();"+nl
         +tab+"}"+nl;
    
    if(ctype =="value") {
        return decl + getter;
    } else {
        return decl + getter + setter;
    }
}

function genJavaConst(n) {
    return tab + 'public static final Object '+n+' = "'+n+'";'+nl;
}

function setClass(v,s) {
    icl = v;
    return s;
}
var icl = true;

var propcache = [];


ometa Josh2Java {
    blocks   = [#blocks [#classes [classdef*:x]]]         -> x.join(""),
    classdef = [#classdef classtype:t c:n c:ex [member(t)*:b]:d] -> genJavaClass(n,t,ex,b.join(""),d),
    classtype = #class     -> setClass(true, "class")
              | #interface -> setClass(false,"interface")
              | #value     -> setClass(true, "value"),
    member  :t = (propdef(t)|funcdef|constdef):m          -> m,
    propdef :t = [#propdef :n type:type value:value]      -> genJavaProp(n,type,value,t),
    funcdef  = [#func c:n c:args c:type block:block]      -> genJavaMethod(n,args,type,block),
    constdef = [#constdef :n []]                          -> genJavaConst(n),
    
    block    = [#block [c*:line]]                         -> line, 
    value    = [#value c:v]                               -> v,
    value    = []                                         -> null,
    type     = ['type' :t]                                -> t,
    c        = ['rettype' :t]                             -> t,
    
    
    c        = [#literal [#string :v]]                    -> ('"'+v+'"'),
    c        = [#literal :v]                              -> v,
    c        = [#if c:ex block:b]                         -> ("if("+ex+"){"+nl+b.join("")+"}"+nl),
    c        = [#return   c:v]                            -> ("return "+v+";"+nl),
    c        = [#assign   c:v c:v2]                       -> (v +" = " + v2 + ";"+nl),
    c        = [#dec [#ref [#name :n]] [#name :t]]         -> (t + " " + n +";"+nl),
    c        = [#cstr c:n c:args]                         -> ("new "+n+"("+args+")"),
    c        = [#exp [#lt  c:v c:v2]]                     -> (v+"<" +v2),
    c        = [#exp [#sub c:v c:v2]]                     -> (v+"-" +v2),
    c        = [#exp [#add c:v c:v2]]                     -> (v+"+" +v2),
    c        = [#exp [#eq  c:v c:v2]]                     -> (v+"=="+v2),
    c        = [#exp [#ne  c:v c:v2]]                     -> (v+"!="+v2),
    c        = [#exp [#gt  c:v c:v2]]                     -> (v+">" +v2),
    
    c        = [#ref c:v c:v2]                            -> (v+"."+v2),
    c        = [#ref c:v]                                 -> v,
    c        = [#exp c:v]                                 -> v,
    
    c        = [#fcall c:n c:args]                        -> (n + "(" +args+");"),
    c        = [#cargs [c*:a]] -> a.join(","),
    
    c        = [#args    :v]                -> v,
    c        = [#name    :v]                -> v,
    c        = [#extend  [c :v]]            -> v,
    
    c = [],
    c = :x -> ("  =:"+x+":="),
    c = [c:x] -> x.join(""),
    foo = bar
}
Josh2Java.resetIt = function() {
    console.log("resetting");
    icl = true;
    propcache = [];
}

