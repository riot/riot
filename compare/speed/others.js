/*

Copyright (C) 2011 by Yehuda Katz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/
var Handlebars={};!function(Handlebars,undefined){Handlebars.VERSION="1.0.0";Handlebars.COMPILER_REVISION=4;Handlebars.REVISION_CHANGES={1:"<= 1.0.rc.2",2:"== 1.0.0-rc.3",3:"== 1.0.0-rc.4",4:">= 1.0.0"};Handlebars.helpers={};Handlebars.partials={};var toString=Object.prototype.toString,functionType="[object Function]",objectType="[object Object]";Handlebars.registerHelper=function(name,fn,inverse){if(toString.call(name)===objectType){if(inverse||fn){throw new Handlebars.Exception("Arg not supported with multiple helpers")}Handlebars.Utils.extend(this.helpers,name)}else{if(inverse){fn.not=inverse}this.helpers[name]=fn}};Handlebars.registerPartial=function(name,str){if(toString.call(name)===objectType){Handlebars.Utils.extend(this.partials,name)}else{this.partials[name]=str}};Handlebars.registerHelper("helperMissing",function(arg){if(arguments.length===2){return undefined}else{throw new Error("Missing helper: '"+arg+"'")}});Handlebars.registerHelper("blockHelperMissing",function(context,options){var inverse=options.inverse||function(){},fn=options.fn;var type=toString.call(context);if(type===functionType){context=context.call(this)}if(context===true){return fn(this)}else if(context===false||context==null){return inverse(this)}else if(type==="[object Array]"){if(context.length>0){return Handlebars.helpers.each(context,options)}else{return inverse(this)}}else{return fn(context)}});Handlebars.K=function(){};Handlebars.createFrame=Object.create||function(object){Handlebars.K.prototype=object;var obj=new Handlebars.K;Handlebars.K.prototype=null;return obj};Handlebars.logger={DEBUG:0,INFO:1,WARN:2,ERROR:3,level:3,methodMap:{0:"debug",1:"info",2:"warn",3:"error"},log:function(level,obj){if(Handlebars.logger.level<=level){var method=Handlebars.logger.methodMap[level];if(typeof console!=="undefined"&&console[method]){console[method].call(console,obj)}}}};Handlebars.log=function(level,obj){Handlebars.logger.log(level,obj)};Handlebars.registerHelper("each",function(context,options){var fn=options.fn,inverse=options.inverse;var i=0,ret="",data;var type=toString.call(context);if(type===functionType){context=context.call(this)}if(options.data){data=Handlebars.createFrame(options.data)}if(context&&typeof context==="object"){if(context instanceof Array){for(var j=context.length;i<j;i++){if(data){data.index=i}ret=ret+fn(context[i],{data:data})}}else{for(var key in context){if(context.hasOwnProperty(key)){if(data){data.key=key}ret=ret+fn(context[key],{data:data});i++}}}}if(i===0){ret=inverse(this)}return ret});Handlebars.registerHelper("if",function(conditional,options){var type=toString.call(conditional);if(type===functionType){conditional=conditional.call(this)}if(!conditional||Handlebars.Utils.isEmpty(conditional)){return options.inverse(this)}else{return options.fn(this)}});Handlebars.registerHelper("unless",function(conditional,options){return Handlebars.helpers["if"].call(this,conditional,{fn:options.inverse,inverse:options.fn})});Handlebars.registerHelper("with",function(context,options){var type=toString.call(context);if(type===functionType){context=context.call(this)}if(!Handlebars.Utils.isEmpty(context))return options.fn(context)});Handlebars.registerHelper("log",function(context,options){var level=options.data&&options.data.level!=null?parseInt(options.data.level,10):1;Handlebars.log(level,context)});var handlebars=function(){var parser={trace:function trace(){},yy:{},symbols_:{error:2,root:3,program:4,EOF:5,simpleInverse:6,statements:7,statement:8,openInverse:9,closeBlock:10,openBlock:11,mustache:12,partial:13,CONTENT:14,COMMENT:15,OPEN_BLOCK:16,inMustache:17,CLOSE:18,OPEN_INVERSE:19,OPEN_ENDBLOCK:20,path:21,OPEN:22,OPEN_UNESCAPED:23,CLOSE_UNESCAPED:24,OPEN_PARTIAL:25,partialName:26,params:27,hash:28,dataName:29,param:30,STRING:31,INTEGER:32,BOOLEAN:33,hashSegments:34,hashSegment:35,ID:36,EQUALS:37,DATA:38,pathSegments:39,SEP:40,$accept:0,$end:1},terminals_:{2:"error",5:"EOF",14:"CONTENT",15:"COMMENT",16:"OPEN_BLOCK",18:"CLOSE",19:"OPEN_INVERSE",20:"OPEN_ENDBLOCK",22:"OPEN",23:"OPEN_UNESCAPED",24:"CLOSE_UNESCAPED",25:"OPEN_PARTIAL",31:"STRING",32:"INTEGER",33:"BOOLEAN",36:"ID",37:"EQUALS",38:"DATA",40:"SEP"},productions_:[0,[3,2],[4,2],[4,3],[4,2],[4,1],[4,1],[4,0],[7,1],[7,2],[8,3],[8,3],[8,1],[8,1],[8,1],[8,1],[11,3],[9,3],[10,3],[12,3],[12,3],[13,3],[13,4],[6,2],[17,3],[17,2],[17,2],[17,1],[17,1],[27,2],[27,1],[30,1],[30,1],[30,1],[30,1],[30,1],[28,1],[34,2],[34,1],[35,3],[35,3],[35,3],[35,3],[35,3],[26,1],[26,1],[26,1],[29,2],[21,1],[39,3],[39,1]],performAction:function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$){var $0=$$.length-1;switch(yystate){case 1:return $$[$0-1];break;case 2:this.$=new yy.ProgramNode([],$$[$0]);break;case 3:this.$=new yy.ProgramNode($$[$0-2],$$[$0]);break;case 4:this.$=new yy.ProgramNode($$[$0-1],[]);break;case 5:this.$=new yy.ProgramNode($$[$0]);break;case 6:this.$=new yy.ProgramNode([],[]);break;case 7:this.$=new yy.ProgramNode([]);break;case 8:this.$=[$$[$0]];break;case 9:$$[$0-1].push($$[$0]);this.$=$$[$0-1];break;case 10:this.$=new yy.BlockNode($$[$0-2],$$[$0-1].inverse,$$[$0-1],$$[$0]);break;case 11:this.$=new yy.BlockNode($$[$0-2],$$[$0-1],$$[$0-1].inverse,$$[$0]);break;case 12:this.$=$$[$0];break;case 13:this.$=$$[$0];break;case 14:this.$=new yy.ContentNode($$[$0]);break;case 15:this.$=new yy.CommentNode($$[$0]);break;case 16:this.$=new yy.MustacheNode($$[$0-1][0],$$[$0-1][1]);break;case 17:this.$=new yy.MustacheNode($$[$0-1][0],$$[$0-1][1]);break;case 18:this.$=$$[$0-1];break;case 19:this.$=new yy.MustacheNode($$[$0-1][0],$$[$0-1][1],$$[$0-2][2]==="&");break;case 20:this.$=new yy.MustacheNode($$[$0-1][0],$$[$0-1][1],true);break;case 21:this.$=new yy.PartialNode($$[$0-1]);break;case 22:this.$=new yy.PartialNode($$[$0-2],$$[$0-1]);break;case 23:break;case 24:this.$=[[$$[$0-2]].concat($$[$0-1]),$$[$0]];break;case 25:this.$=[[$$[$0-1]].concat($$[$0]),null];break;case 26:this.$=[[$$[$0-1]],$$[$0]];break;case 27:this.$=[[$$[$0]],null];break;case 28:this.$=[[$$[$0]],null];break;case 29:$$[$0-1].push($$[$0]);this.$=$$[$0-1];break;case 30:this.$=[$$[$0]];break;case 31:this.$=$$[$0];break;case 32:this.$=new yy.StringNode($$[$0]);break;case 33:this.$=new yy.IntegerNode($$[$0]);break;case 34:this.$=new yy.BooleanNode($$[$0]);break;case 35:this.$=$$[$0];break;case 36:this.$=new yy.HashNode($$[$0]);break;case 37:$$[$0-1].push($$[$0]);this.$=$$[$0-1];break;case 38:this.$=[$$[$0]];break;case 39:this.$=[$$[$0-2],$$[$0]];break;case 40:this.$=[$$[$0-2],new yy.StringNode($$[$0])];break;case 41:this.$=[$$[$0-2],new yy.IntegerNode($$[$0])];break;case 42:this.$=[$$[$0-2],new yy.BooleanNode($$[$0])];break;case 43:this.$=[$$[$0-2],$$[$0]];break;case 44:this.$=new yy.PartialNameNode($$[$0]);break;case 45:this.$=new yy.PartialNameNode(new yy.StringNode($$[$0]));break;case 46:this.$=new yy.PartialNameNode(new yy.IntegerNode($$[$0]));break;case 47:this.$=new yy.DataNode($$[$0]);break;case 48:this.$=new yy.IdNode($$[$0]);break;case 49:$$[$0-2].push({part:$$[$0],separator:$$[$0-1]});this.$=$$[$0-2];break;case 50:this.$=[{part:$$[$0]}];break}},table:[{3:1,4:2,5:[2,7],6:3,7:4,8:6,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,5],22:[1,14],23:[1,15],25:[1,16]},{1:[3]},{5:[1,17]},{5:[2,6],7:18,8:6,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,19],20:[2,6],22:[1,14],23:[1,15],25:[1,16]},{5:[2,5],6:20,8:21,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,5],20:[2,5],22:[1,14],23:[1,15],25:[1,16]},{17:23,18:[1,22],21:24,29:25,36:[1,28],38:[1,27],39:26},{5:[2,8],14:[2,8],15:[2,8],16:[2,8],19:[2,8],20:[2,8],22:[2,8],23:[2,8],25:[2,8]},{4:29,6:3,7:4,8:6,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,5],20:[2,7],22:[1,14],23:[1,15],25:[1,16]},{4:30,6:3,7:4,8:6,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,5],20:[2,7],22:[1,14],23:[1,15],25:[1,16]},{5:[2,12],14:[2,12],15:[2,12],16:[2,12],19:[2,12],20:[2,12],22:[2,12],23:[2,12],25:[2,12]},{5:[2,13],14:[2,13],15:[2,13],16:[2,13],19:[2,13],20:[2,13],22:[2,13],23:[2,13],25:[2,13]},{5:[2,14],14:[2,14],15:[2,14],16:[2,14],19:[2,14],20:[2,14],22:[2,14],23:[2,14],25:[2,14]},{5:[2,15],14:[2,15],15:[2,15],16:[2,15],19:[2,15],20:[2,15],22:[2,15],23:[2,15],25:[2,15]},{17:31,21:24,29:25,36:[1,28],38:[1,27],39:26},{17:32,21:24,29:25,36:[1,28],38:[1,27],39:26},{17:33,21:24,29:25,36:[1,28],38:[1,27],39:26},{21:35,26:34,31:[1,36],32:[1,37],36:[1,28],39:26},{1:[2,1]},{5:[2,2],8:21,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,19],20:[2,2],22:[1,14],23:[1,15],25:[1,16]},{17:23,21:24,29:25,36:[1,28],38:[1,27],39:26},{5:[2,4],7:38,8:6,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,19],20:[2,4],22:[1,14],23:[1,15],25:[1,16]},{5:[2,9],14:[2,9],15:[2,9],16:[2,9],19:[2,9],20:[2,9],22:[2,9],23:[2,9],25:[2,9]},{5:[2,23],14:[2,23],15:[2,23],16:[2,23],19:[2,23],20:[2,23],22:[2,23],23:[2,23],25:[2,23]},{18:[1,39]},{18:[2,27],21:44,24:[2,27],27:40,28:41,29:48,30:42,31:[1,45],32:[1,46],33:[1,47],34:43,35:49,36:[1,50],38:[1,27],39:26},{18:[2,28],24:[2,28]},{18:[2,48],24:[2,48],31:[2,48],32:[2,48],33:[2,48],36:[2,48],38:[2,48],40:[1,51]},{21:52,36:[1,28],39:26},{18:[2,50],24:[2,50],31:[2,50],32:[2,50],33:[2,50],36:[2,50],38:[2,50],40:[2,50]},{10:53,20:[1,54]},{10:55,20:[1,54]},{18:[1,56]},{18:[1,57]},{24:[1,58]},{18:[1,59],21:60,36:[1,28],39:26},{18:[2,44],36:[2,44]},{18:[2,45],36:[2,45]},{18:[2,46],36:[2,46]},{5:[2,3],8:21,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,19],20:[2,3],22:[1,14],23:[1,15],25:[1,16]},{14:[2,17],15:[2,17],16:[2,17],19:[2,17],20:[2,17],22:[2,17],23:[2,17],25:[2,17]},{18:[2,25],21:44,24:[2,25],28:61,29:48,30:62,31:[1,45],32:[1,46],33:[1,47],34:43,35:49,36:[1,50],38:[1,27],39:26},{18:[2,26],24:[2,26]},{18:[2,30],24:[2,30],31:[2,30],32:[2,30],33:[2,30],36:[2,30],38:[2,30]},{18:[2,36],24:[2,36],35:63,36:[1,64]},{18:[2,31],24:[2,31],31:[2,31],32:[2,31],33:[2,31],36:[2,31],38:[2,31]},{18:[2,32],24:[2,32],31:[2,32],32:[2,32],33:[2,32],36:[2,32],38:[2,32]},{18:[2,33],24:[2,33],31:[2,33],32:[2,33],33:[2,33],36:[2,33],38:[2,33]},{18:[2,34],24:[2,34],31:[2,34],32:[2,34],33:[2,34],36:[2,34],38:[2,34]},{18:[2,35],24:[2,35],31:[2,35],32:[2,35],33:[2,35],36:[2,35],38:[2,35]},{18:[2,38],24:[2,38],36:[2,38]},{18:[2,50],24:[2,50],31:[2,50],32:[2,50],33:[2,50],36:[2,50],37:[1,65],38:[2,50],40:[2,50]},{36:[1,66]},{18:[2,47],24:[2,47],31:[2,47],32:[2,47],33:[2,47],36:[2,47],38:[2,47]},{5:[2,10],14:[2,10],15:[2,10],16:[2,10],19:[2,10],20:[2,10],22:[2,10],23:[2,10],25:[2,10]},{21:67,36:[1,28],39:26},{5:[2,11],14:[2,11],15:[2,11],16:[2,11],19:[2,11],20:[2,11],22:[2,11],23:[2,11],25:[2,11]},{14:[2,16],15:[2,16],16:[2,16],19:[2,16],20:[2,16],22:[2,16],23:[2,16],25:[2,16]},{5:[2,19],14:[2,19],15:[2,19],16:[2,19],19:[2,19],20:[2,19],22:[2,19],23:[2,19],25:[2,19]},{5:[2,20],14:[2,20],15:[2,20],16:[2,20],19:[2,20],20:[2,20],22:[2,20],23:[2,20],25:[2,20]},{5:[2,21],14:[2,21],15:[2,21],16:[2,21],19:[2,21],20:[2,21],22:[2,21],23:[2,21],25:[2,21]},{18:[1,68]},{18:[2,24],24:[2,24]},{18:[2,29],24:[2,29],31:[2,29],32:[2,29],33:[2,29],36:[2,29],38:[2,29]},{18:[2,37],24:[2,37],36:[2,37]},{37:[1,65]},{21:69,29:73,31:[1,70],32:[1,71],33:[1,72],36:[1,28],38:[1,27],39:26},{18:[2,49],24:[2,49],31:[2,49],32:[2,49],33:[2,49],36:[2,49],38:[2,49],40:[2,49]},{18:[1,74]},{5:[2,22],14:[2,22],15:[2,22],16:[2,22],19:[2,22],20:[2,22],22:[2,22],23:[2,22],25:[2,22]},{18:[2,39],24:[2,39],36:[2,39]},{18:[2,40],24:[2,40],36:[2,40]},{18:[2,41],24:[2,41],36:[2,41]},{18:[2,42],24:[2,42],36:[2,42]},{18:[2,43],24:[2,43],36:[2,43]},{5:[2,18],14:[2,18],15:[2,18],16:[2,18],19:[2,18],20:[2,18],22:[2,18],23:[2,18],25:[2,18]}],defaultActions:{17:[2,1]},parseError:function parseError(str,hash){throw new Error(str)},parse:function parse(input){var self=this,stack=[0],vstack=[null],lstack=[],table=this.table,yytext="",yylineno=0,yyleng=0,recovering=0,TERROR=2,EOF=1;this.lexer.setInput(input);this.lexer.yy=this.yy;this.yy.lexer=this.lexer;this.yy.parser=this;if(typeof this.lexer.yylloc=="undefined")this.lexer.yylloc={};var yyloc=this.lexer.yylloc;lstack.push(yyloc);var ranges=this.lexer.options&&this.lexer.options.ranges;if(typeof this.yy.parseError==="function")this.parseError=this.yy.parseError;function popStack(n){stack.length=stack.length-2*n;vstack.length=vstack.length-n;lstack.length=lstack.length-n}function lex(){var token;token=self.lexer.lex()||1;if(typeof token!=="number"){token=self.symbols_[token]||token}return token}var symbol,preErrorSymbol,state,action,a,r,yyval={},p,len,newState,expected;while(true){state=stack[stack.length-1];if(this.defaultActions[state]){action=this.defaultActions[state]}else{if(symbol===null||typeof symbol=="undefined"){symbol=lex()}action=table[state]&&table[state][symbol]}if(typeof action==="undefined"||!action.length||!action[0]){var errStr="";if(!recovering){expected=[];for(p in table[state])if(this.terminals_[p]&&p>2){expected.push("'"+this.terminals_[p]+"'")}if(this.lexer.showPosition){errStr="Parse error on line "+(yylineno+1)+":\n"+this.lexer.showPosition()+"\nExpecting "+expected.join(", ")+", got '"+(this.terminals_[symbol]||symbol)+"'"}else{errStr="Parse error on line "+(yylineno+1)+": Unexpected "+(symbol==1?"end of input":"'"+(this.terminals_[symbol]||symbol)+"'")}this.parseError(errStr,{text:this.lexer.match,token:this.terminals_[symbol]||symbol,line:this.lexer.yylineno,loc:yyloc,expected:expected})}}if(action[0]instanceof Array&&action.length>1){throw new Error("Parse Error: multiple actions possible at state: "+state+", token: "+symbol)}switch(action[0]){case 1:stack.push(symbol);vstack.push(this.lexer.yytext);lstack.push(this.lexer.yylloc);stack.push(action[1]);symbol=null;if(!preErrorSymbol){yyleng=this.lexer.yyleng;yytext=this.lexer.yytext;yylineno=this.lexer.yylineno;yyloc=this.lexer.yylloc;if(recovering>0)recovering--}else{symbol=preErrorSymbol;preErrorSymbol=null}break;case 2:len=this.productions_[action[1]][1];yyval.$=vstack[vstack.length-len];yyval._$={first_line:lstack[lstack.length-(len||1)].first_line,last_line:lstack[lstack.length-1].last_line,first_column:lstack[lstack.length-(len||1)].first_column,last_column:lstack[lstack.length-1].last_column};if(ranges){yyval._$.range=[lstack[lstack.length-(len||1)].range[0],lstack[lstack.length-1].range[1]]}r=this.performAction.call(yyval,yytext,yyleng,yylineno,this.yy,action[1],vstack,lstack);if(typeof r!=="undefined"){return r}if(len){stack=stack.slice(0,-1*len*2);vstack=vstack.slice(0,-1*len);lstack=lstack.slice(0,-1*len)}stack.push(this.productions_[action[1]][0]);vstack.push(yyval.$);lstack.push(yyval._$);newState=table[stack[stack.length-2]][stack[stack.length-1]];stack.push(newState);break;case 3:return true}}return true}};var lexer=function(){var lexer={EOF:1,parseError:function parseError(str,hash){if(this.yy.parser){this.yy.parser.parseError(str,hash)}else{throw new Error(str)}},setInput:function(input){this._input=input;this._more=this._less=this.done=false;this.yylineno=this.yyleng=0;this.yytext=this.matched=this.match="";this.conditionStack=["INITIAL"];this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0};if(this.options.ranges)this.yylloc.range=[0,0];this.offset=0;return this},input:function(){var ch=this._input[0];this.yytext+=ch;this.yyleng++;this.offset++;this.match+=ch;this.matched+=ch;var lines=ch.match(/(?:\r\n?|\n).*/g);if(lines){this.yylineno++;this.yylloc.last_line++}else{this.yylloc.last_column++}if(this.options.ranges)this.yylloc.range[1]++;this._input=this._input.slice(1);return ch},unput:function(ch){var len=ch.length;var lines=ch.split(/(?:\r\n?|\n)/g);this._input=ch+this._input;this.yytext=this.yytext.substr(0,this.yytext.length-len-1);this.offset-=len;var oldLines=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1);this.matched=this.matched.substr(0,this.matched.length-1);if(lines.length-1)this.yylineno-=lines.length-1;var r=this.yylloc.range;this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:lines?(lines.length===oldLines.length?this.yylloc.first_column:0)+oldLines[oldLines.length-lines.length].length-lines[0].length:this.yylloc.first_column-len};if(this.options.ranges){this.yylloc.range=[r[0],r[0]+this.yyleng-len]}return this},more:function(){this._more=true;return this},less:function(n){this.unput(this.match.slice(n))},pastInput:function(){var past=this.matched.substr(0,this.matched.length-this.match.length);return(past.length>20?"...":"")+past.substr(-20).replace(/\n/g,"")},upcomingInput:function(){var next=this.match;if(next.length<20){next+=this._input.substr(0,20-next.length)}return(next.substr(0,20)+(next.length>20?"...":"")).replace(/\n/g,"")},showPosition:function(){var pre=this.pastInput();var c=new Array(pre.length+1).join("-");return pre+this.upcomingInput()+"\n"+c+"^"},next:function(){if(this.done){return this.EOF}if(!this._input)this.done=true;var token,match,tempMatch,index,col,lines;if(!this._more){this.yytext="";this.match=""}var rules=this._currentRules();for(var i=0;i<rules.length;i++){tempMatch=this._input.match(this.rules[rules[i]]);if(tempMatch&&(!match||tempMatch[0].length>match[0].length)){match=tempMatch;index=i;if(!this.options.flex)break}}if(match){lines=match[0].match(/(?:\r\n?|\n).*/g);if(lines)this.yylineno+=lines.length;this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:lines?lines[lines.length-1].length-lines[lines.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+match[0].length};this.yytext+=match[0];this.match+=match[0];this.matches=match;this.yyleng=this.yytext.length;if(this.options.ranges){this.yylloc.range=[this.offset,this.offset+=this.yyleng]}this._more=false;this._input=this._input.slice(match[0].length);this.matched+=match[0];token=this.performAction.call(this,this.yy,this,rules[index],this.conditionStack[this.conditionStack.length-1]);if(this.done&&this._input)this.done=false;if(token)return token;else return}if(this._input===""){return this.EOF}else{return this.parseError("Lexical error on line "+(this.yylineno+1)+". Unrecognized text.\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})}},lex:function lex(){var r=this.next();if(typeof r!=="undefined"){return r}else{return this.lex()}},begin:function begin(condition){this.conditionStack.push(condition)},popState:function popState(){return this.conditionStack.pop()},_currentRules:function _currentRules(){return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules},topState:function(){return this.conditionStack[this.conditionStack.length-2]},pushState:function begin(condition){this.begin(condition)}};lexer.options={};lexer.performAction=function anonymous(yy,yy_,$avoiding_name_collisions,YY_START){var YYSTATE=YY_START;switch($avoiding_name_collisions){case 0:yy_.yytext="\\";return 14;break;case 1:if(yy_.yytext.slice(-1)!=="\\")this.begin("mu");if(yy_.yytext.slice(-1)==="\\")yy_.yytext=yy_.yytext.substr(0,yy_.yyleng-1),this.begin("emu");if(yy_.yytext)return 14;break;case 2:return 14;break;case 3:if(yy_.yytext.slice(-1)!=="\\")this.popState();if(yy_.yytext.slice(-1)==="\\")yy_.yytext=yy_.yytext.substr(0,yy_.yyleng-1);return 14;break;case 4:yy_.yytext=yy_.yytext.substr(0,yy_.yyleng-4);this.popState();return 15;break;case 5:return 25;break;case 6:return 16;break;case 7:return 20;break;case 8:return 19;break;case 9:return 19;break;case 10:return 23;break;case 11:return 22;break;case 12:this.popState();this.begin("com");break;case 13:yy_.yytext=yy_.yytext.substr(3,yy_.yyleng-5);this.popState();return 15;break;case 14:return 22;break;case 15:return 37;break;case 16:return 36;break;case 17:return 36;break;case 18:return 40;break;case 19:break;case 20:this.popState();return 24;break;case 21:this.popState();return 18;break;case 22:yy_.yytext=yy_.yytext.substr(1,yy_.yyleng-2).replace(/\\"/g,'"');return 31;break;case 23:yy_.yytext=yy_.yytext.substr(1,yy_.yyleng-2).replace(/\\'/g,"'");return 31;break;case 24:return 38;break;case 25:return 33;break;case 26:return 33;break;case 27:return 32;break;case 28:return 36;break;case 29:yy_.yytext=yy_.yytext.substr(1,yy_.yyleng-2);return 36;break;case 30:return"INVALID";break;case 31:return 5;break}};lexer.rules=[/^(?:\\\\(?=(\{\{)))/,/^(?:[^\x00]*?(?=(\{\{)))/,/^(?:[^\x00]+)/,/^(?:[^\x00]{2,}?(?=(\{\{|$)))/,/^(?:[\s\S]*?--\}\})/,/^(?:\{\{>)/,/^(?:\{\{#)/,/^(?:\{\{\/)/,/^(?:\{\{\^)/,/^(?:\{\{\s*else\b)/,/^(?:\{\{\{)/,/^(?:\{\{&)/,/^(?:\{\{!--)/,/^(?:\{\{![\s\S]*?\}\})/,/^(?:\{\{)/,/^(?:=)/,/^(?:\.(?=[}\/ ]))/,/^(?:\.\.)/,/^(?:[\/.])/,/^(?:\s+)/,/^(?:\}\}\})/,/^(?:\}\})/,/^(?:"(\\["]|[^"])*")/,/^(?:'(\\[']|[^'])*')/,/^(?:@)/,/^(?:true(?=[}\s]))/,/^(?:false(?=[}\s]))/,/^(?:-?[0-9]+(?=[}\s]))/,/^(?:[^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=[=}\s\/.]))/,/^(?:\[[^\]]*\])/,/^(?:.)/,/^(?:$)/];lexer.conditions={mu:{rules:[5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31],inclusive:false},emu:{rules:[3],inclusive:false},com:{rules:[4],inclusive:false},INITIAL:{rules:[0,1,2,31],inclusive:true}};return lexer}();parser.lexer=lexer;function Parser(){this.yy={}}Parser.prototype=parser;parser.Parser=Parser;return new Parser}();Handlebars.Parser=handlebars;Handlebars.parse=function(input){if(input.constructor===Handlebars.AST.ProgramNode){return input}Handlebars.Parser.yy=Handlebars.AST;return Handlebars.Parser.parse(input)};Handlebars.AST={};Handlebars.AST.ProgramNode=function(statements,inverse){this.type="program";this.statements=statements;if(inverse){this.inverse=new Handlebars.AST.ProgramNode(inverse)}};Handlebars.AST.MustacheNode=function(rawParams,hash,unescaped){this.type="mustache";this.escaped=!unescaped;this.hash=hash;var id=this.id=rawParams[0];var params=this.params=rawParams.slice(1);var eligibleHelper=this.eligibleHelper=id.isSimple;this.isHelper=eligibleHelper&&(params.length||hash)};Handlebars.AST.PartialNode=function(partialName,context){this.type="partial";this.partialName=partialName;this.context=context};Handlebars.AST.BlockNode=function(mustache,program,inverse,close){var verifyMatch=function(open,close){if(open.original!==close.original){throw new Handlebars.Exception(open.original+" doesn't match "+close.original)}};verifyMatch(mustache.id,close);this.type="block";this.mustache=mustache;this.program=program;this.inverse=inverse;if(this.inverse&&!this.program){this.isInverse=true}};Handlebars.AST.ContentNode=function(string){this.type="content";this.string=string};Handlebars.AST.HashNode=function(pairs){this.type="hash";this.pairs=pairs};Handlebars.AST.IdNode=function(parts){this.type="ID";var original="",dig=[],depth=0;for(var i=0,l=parts.length;i<l;i++){var part=parts[i].part;original+=(parts[i].separator||"")+part;if(part===".."||part==="."||part==="this"){if(dig.length>0){throw new Handlebars.Exception("Invalid path: "+original)}else if(part===".."){depth++}else{this.isScoped=true}}else{dig.push(part)}}this.original=original;this.parts=dig;this.string=dig.join(".");this.depth=depth;this.isSimple=parts.length===1&&!this.isScoped&&depth===0;this.stringModeValue=this.string};Handlebars.AST.PartialNameNode=function(name){this.type="PARTIAL_NAME";this.name=name.original};Handlebars.AST.DataNode=function(id){this.type="DATA";this.id=id};Handlebars.AST.StringNode=function(string){this.type="STRING";this.original=this.string=this.stringModeValue=string};Handlebars.AST.IntegerNode=function(integer){this.type="INTEGER";this.original=this.integer=integer;this.stringModeValue=Number(integer)};Handlebars.AST.BooleanNode=function(bool){this.type="BOOLEAN";this.bool=bool;this.stringModeValue=bool==="true"};Handlebars.AST.CommentNode=function(comment){this.type="comment";this.comment=comment};var errorProps=["description","fileName","lineNumber","message","name","number","stack"];Handlebars.Exception=function(message){var tmp=Error.prototype.constructor.apply(this,arguments);for(var idx=0;idx<errorProps.length;idx++){this[errorProps[idx]]=tmp[errorProps[idx]]}};Handlebars.Exception.prototype=new Error;Handlebars.SafeString=function(string){this.string=string};Handlebars.SafeString.prototype.toString=function(){return this.string.toString()};var escape={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"};var badChars=/[&<>"'`]/g;var possible=/[&<>"'`]/;var escapeChar=function(chr){return escape[chr]||"&amp;"};Handlebars.Utils={extend:function(obj,value){for(var key in value){if(value.hasOwnProperty(key)){obj[key]=value[key]}}},escapeExpression:function(string){if(string instanceof Handlebars.SafeString){return string.toString()}else if(string==null||string===false){return""}string=string.toString();if(!possible.test(string)){return string}return string.replace(badChars,escapeChar)},isEmpty:function(value){if(!value&&value!==0){return true}else if(toString.call(value)==="[object Array]"&&value.length===0){return true}else{return false}}};var Compiler=Handlebars.Compiler=function(){};var JavaScriptCompiler=Handlebars.JavaScriptCompiler=function(){};Compiler.prototype={compiler:Compiler,disassemble:function(){var opcodes=this.opcodes,opcode,out=[],params,param;for(var i=0,l=opcodes.length;i<l;i++){opcode=opcodes[i];if(opcode.opcode==="DECLARE"){out.push("DECLARE "+opcode.name+"="+opcode.value)}else{params=[];for(var j=0;j<opcode.args.length;j++){param=opcode.args[j];if(typeof param==="string"){param='"'+param.replace("\n","\\n")+'"'}params.push(param)}out.push(opcode.opcode+" "+params.join(" "))}}return out.join("\n")},equals:function(other){var len=this.opcodes.length;if(other.opcodes.length!==len){return false}for(var i=0;i<len;i++){var opcode=this.opcodes[i],otherOpcode=other.opcodes[i];if(opcode.opcode!==otherOpcode.opcode||opcode.args.length!==otherOpcode.args.length){return false}for(var j=0;j<opcode.args.length;j++){if(opcode.args[j]!==otherOpcode.args[j]){return false}}}len=this.children.length;if(other.children.length!==len){return false}for(i=0;i<len;i++){if(!this.children[i].equals(other.children[i])){return false}}return true},guid:0,compile:function(program,options){this.children=[];this.depths={list:[]};this.options=options;var knownHelpers=this.options.knownHelpers;this.options.knownHelpers={helperMissing:true,blockHelperMissing:true,each:true,"if":true,unless:true,"with":true,log:true};if(knownHelpers){for(var name in knownHelpers){this.options.knownHelpers[name]=knownHelpers[name]}}return this.program(program)},accept:function(node){return this[node.type](node)},program:function(program){var statements=program.statements,statement;this.opcodes=[];for(var i=0,l=statements.length;i<l;i++){statement=statements[i];this[statement.type](statement)}this.isSimple=l===1;this.depths.list=this.depths.list.sort(function(a,b){return a-b});return this},compileProgram:function(program){var result=(new this.compiler).compile(program,this.options);var guid=this.guid++,depth;this.usePartial=this.usePartial||result.usePartial;this.children[guid]=result;for(var i=0,l=result.depths.list.length;i<l;i++){depth=result.depths.list[i];if(depth<2){continue}else{this.addDepth(depth-1)}}return guid},block:function(block){var mustache=block.mustache,program=block.program,inverse=block.inverse;if(program){program=this.compileProgram(program)}if(inverse){inverse=this.compileProgram(inverse)}var type=this.classifyMustache(mustache);if(type==="helper"){this.helperMustache(mustache,program,inverse)}else if(type==="simple"){this.simpleMustache(mustache);this.opcode("pushProgram",program);this.opcode("pushProgram",inverse);this.opcode("emptyHash");this.opcode("blockValue")}else{this.ambiguousMustache(mustache,program,inverse);this.opcode("pushProgram",program);this.opcode("pushProgram",inverse);this.opcode("emptyHash");this.opcode("ambiguousBlockValue")}this.opcode("append")},hash:function(hash){var pairs=hash.pairs,pair,val;this.opcode("pushHash");for(var i=0,l=pairs.length;i<l;i++){pair=pairs[i];val=pair[1];if(this.options.stringParams){if(val.depth){this.addDepth(val.depth)}this.opcode("getContext",val.depth||0);this.opcode("pushStringParam",val.stringModeValue,val.type)}else{this.accept(val)}this.opcode("assignToHash",pair[0])}this.opcode("popHash")},partial:function(partial){var partialName=partial.partialName;this.usePartial=true;if(partial.context){this.ID(partial.context)}else{this.opcode("push","depth0")}this.opcode("invokePartial",partialName.name);this.opcode("append")},content:function(content){this.opcode("appendContent",content.string)},mustache:function(mustache){var options=this.options;var type=this.classifyMustache(mustache);if(type==="simple"){this.simpleMustache(mustache)}else if(type==="helper"){this.helperMustache(mustache)}else{this.ambiguousMustache(mustache)}if(mustache.escaped&&!options.noEscape){this.opcode("appendEscaped")}else{this.opcode("append")}},ambiguousMustache:function(mustache,program,inverse){var id=mustache.id,name=id.parts[0],isBlock=program!=null||inverse!=null;this.opcode("getContext",id.depth);this.opcode("pushProgram",program);this.opcode("pushProgram",inverse);this.opcode("invokeAmbiguous",name,isBlock)},simpleMustache:function(mustache){var id=mustache.id;if(id.type==="DATA"){this.DATA(id)}else if(id.parts.length){this.ID(id)}else{this.addDepth(id.depth);this.opcode("getContext",id.depth);this.opcode("pushContext")}this.opcode("resolvePossibleLambda")},helperMustache:function(mustache,program,inverse){var params=this.setupFullMustacheParams(mustache,program,inverse),name=mustache.id.parts[0];if(this.options.knownHelpers[name]){this.opcode("invokeKnownHelper",params.length,name)}else if(this.options.knownHelpersOnly){throw new Error("You specified knownHelpersOnly, but used the unknown helper "+name)}else{this.opcode("invokeHelper",params.length,name)}},ID:function(id){this.addDepth(id.depth);this.opcode("getContext",id.depth);var name=id.parts[0];if(!name){this.opcode("pushContext")}else{this.opcode("lookupOnContext",id.parts[0])}for(var i=1,l=id.parts.length;i<l;i++){this.opcode("lookup",id.parts[i])}},DATA:function(data){this.options.data=true;if(data.id.isScoped||data.id.depth){throw new Handlebars.Exception("Scoped data references are not supported: "+data.original)}this.opcode("lookupData");var parts=data.id.parts;for(var i=0,l=parts.length;i<l;i++){this.opcode("lookup",parts[i])}},STRING:function(string){this.opcode("pushString",string.string)},INTEGER:function(integer){this.opcode("pushLiteral",integer.integer)},BOOLEAN:function(bool){this.opcode("pushLiteral",bool.bool)},comment:function(){},opcode:function(name){this.opcodes.push({opcode:name,args:[].slice.call(arguments,1)})},declare:function(name,value){this.opcodes.push({opcode:"DECLARE",name:name,value:value})},addDepth:function(depth){if(isNaN(depth)){throw new Error("EWOT")}if(depth===0){return}if(!this.depths[depth]){this.depths[depth]=true;this.depths.list.push(depth)}},classifyMustache:function(mustache){var isHelper=mustache.isHelper;var isEligible=mustache.eligibleHelper;var options=this.options;if(isEligible&&!isHelper){var name=mustache.id.parts[0];if(options.knownHelpers[name]){isHelper=true}else if(options.knownHelpersOnly){isEligible=false}}if(isHelper){return"helper"}else if(isEligible){return"ambiguous"}else{return"simple"}},pushParams:function(params){var i=params.length,param;while(i--){param=params[i];if(this.options.stringParams){if(param.depth){this.addDepth(param.depth)}this.opcode("getContext",param.depth||0);this.opcode("pushStringParam",param.stringModeValue,param.type)}else{this[param.type](param)}}},setupMustacheParams:function(mustache){var params=mustache.params;this.pushParams(params);if(mustache.hash){this.hash(mustache.hash)}else{this.opcode("emptyHash")}return params},setupFullMustacheParams:function(mustache,program,inverse){var params=mustache.params;this.pushParams(params);this.opcode("pushProgram",program);this.opcode("pushProgram",inverse);if(mustache.hash){this.hash(mustache.hash)}else{this.opcode("emptyHash")}return params}};var Literal=function(value){this.value=value};JavaScriptCompiler.prototype={nameLookup:function(parent,name){if(/^[0-9]+$/.test(name)){return parent+"["+name+"]"
}else if(JavaScriptCompiler.isValidJavaScriptVariableName(name)){return parent+"."+name}else{return parent+"['"+name+"']"}},appendToBuffer:function(string){if(this.environment.isSimple){return"return "+string+";"}else{return{appendToBuffer:true,content:string,toString:function(){return"buffer += "+string+";"}}}},initializeBuffer:function(){return this.quotedString("")},namespace:"Handlebars",compile:function(environment,options,context,asObject){this.environment=environment;this.options=options||{};Handlebars.log(Handlebars.logger.DEBUG,this.environment.disassemble()+"\n\n");this.name=this.environment.name;this.isChild=!!context;this.context=context||{programs:[],environments:[],aliases:{}};this.preamble();this.stackSlot=0;this.stackVars=[];this.registers={list:[]};this.compileStack=[];this.inlineStack=[];this.compileChildren(environment,options);var opcodes=environment.opcodes,opcode;this.i=0;for(l=opcodes.length;this.i<l;this.i++){opcode=opcodes[this.i];if(opcode.opcode==="DECLARE"){this[opcode.name]=opcode.value}else{this[opcode.opcode].apply(this,opcode.args)}}return this.createFunctionContext(asObject)},nextOpcode:function(){var opcodes=this.environment.opcodes;return opcodes[this.i+1]},eat:function(){this.i=this.i+1},preamble:function(){var out=[];if(!this.isChild){var namespace=this.namespace;var copies="helpers = this.merge(helpers, "+namespace+".helpers);";if(this.environment.usePartial){copies=copies+" partials = this.merge(partials, "+namespace+".partials);"}if(this.options.data){copies=copies+" data = data || {};"}out.push(copies)}else{out.push("")}if(!this.environment.isSimple){out.push(", buffer = "+this.initializeBuffer())}else{out.push("")}this.lastContext=0;this.source=out},createFunctionContext:function(asObject){var locals=this.stackVars.concat(this.registers.list);if(locals.length>0){this.source[1]=this.source[1]+", "+locals.join(", ")}if(!this.isChild){for(var alias in this.context.aliases){if(this.context.aliases.hasOwnProperty(alias)){this.source[1]=this.source[1]+", "+alias+"="+this.context.aliases[alias]}}}if(this.source[1]){this.source[1]="var "+this.source[1].substring(2)+";"}if(!this.isChild){this.source[1]+="\n"+this.context.programs.join("\n")+"\n"}if(!this.environment.isSimple){this.source.push("return buffer;")}var params=this.isChild?["depth0","data"]:["Handlebars","depth0","helpers","partials","data"];for(var i=0,l=this.environment.depths.list.length;i<l;i++){params.push("depth"+this.environment.depths.list[i])}var source=this.mergeSource();if(!this.isChild){var revision=Handlebars.COMPILER_REVISION,versions=Handlebars.REVISION_CHANGES[revision];source="this.compilerInfo = ["+revision+",'"+versions+"'];\n"+source}if(asObject){params.push(source);return Function.apply(this,params)}else{var functionSource="function "+(this.name||"")+"("+params.join(",")+") {\n  "+source+"}";Handlebars.log(Handlebars.logger.DEBUG,functionSource+"\n\n");return functionSource}},mergeSource:function(){var source="",buffer;for(var i=0,len=this.source.length;i<len;i++){var line=this.source[i];if(line.appendToBuffer){if(buffer){buffer=buffer+"\n    + "+line.content}else{buffer=line.content}}else{if(buffer){source+="buffer += "+buffer+";\n  ";buffer=undefined}source+=line+"\n  "}}return source},blockValue:function(){this.context.aliases.blockHelperMissing="helpers.blockHelperMissing";var params=["depth0"];this.setupParams(0,params);this.replaceStack(function(current){params.splice(1,0,current);return"blockHelperMissing.call("+params.join(", ")+")"})},ambiguousBlockValue:function(){this.context.aliases.blockHelperMissing="helpers.blockHelperMissing";var params=["depth0"];this.setupParams(0,params);var current=this.topStack();params.splice(1,0,current);params[params.length-1]="options";this.source.push("if (!"+this.lastHelper+") { "+current+" = blockHelperMissing.call("+params.join(", ")+"); }")},appendContent:function(content){this.source.push(this.appendToBuffer(this.quotedString(content)))},append:function(){this.flushInline();var local=this.popStack();this.source.push("if("+local+" || "+local+" === 0) { "+this.appendToBuffer(local)+" }");if(this.environment.isSimple){this.source.push("else { "+this.appendToBuffer("''")+" }")}},appendEscaped:function(){this.context.aliases.escapeExpression="this.escapeExpression";this.source.push(this.appendToBuffer("escapeExpression("+this.popStack()+")"))},getContext:function(depth){if(this.lastContext!==depth){this.lastContext=depth}},lookupOnContext:function(name){this.push(this.nameLookup("depth"+this.lastContext,name,"context"))},pushContext:function(){this.pushStackLiteral("depth"+this.lastContext)},resolvePossibleLambda:function(){this.context.aliases.functionType='"function"';this.replaceStack(function(current){return"typeof "+current+" === functionType ? "+current+".apply(depth0) : "+current})},lookup:function(name){this.replaceStack(function(current){return current+" == null || "+current+" === false ? "+current+" : "+this.nameLookup(current,name,"context")})},lookupData:function(id){this.push("data")},pushStringParam:function(string,type){this.pushStackLiteral("depth"+this.lastContext);this.pushString(type);if(typeof string==="string"){this.pushString(string)}else{this.pushStackLiteral(string)}},emptyHash:function(){this.pushStackLiteral("{}");if(this.options.stringParams){this.register("hashTypes","{}");this.register("hashContexts","{}")}},pushHash:function(){this.hash={values:[],types:[],contexts:[]}},popHash:function(){var hash=this.hash;this.hash=undefined;if(this.options.stringParams){this.register("hashContexts","{"+hash.contexts.join(",")+"}");this.register("hashTypes","{"+hash.types.join(",")+"}")}this.push("{\n    "+hash.values.join(",\n    ")+"\n  }")},pushString:function(string){this.pushStackLiteral(this.quotedString(string))},push:function(expr){this.inlineStack.push(expr);return expr},pushLiteral:function(value){this.pushStackLiteral(value)},pushProgram:function(guid){if(guid!=null){this.pushStackLiteral(this.programExpression(guid))}else{this.pushStackLiteral(null)}},invokeHelper:function(paramSize,name){this.context.aliases.helperMissing="helpers.helperMissing";var helper=this.lastHelper=this.setupHelper(paramSize,name,true);var nonHelper=this.nameLookup("depth"+this.lastContext,name,"context");this.push(helper.name+" || "+nonHelper);this.replaceStack(function(name){return name+" ? "+name+".call("+helper.callParams+") "+": helperMissing.call("+helper.helperMissingParams+")"})},invokeKnownHelper:function(paramSize,name){var helper=this.setupHelper(paramSize,name);this.push(helper.name+".call("+helper.callParams+")")},invokeAmbiguous:function(name,helperCall){this.context.aliases.functionType='"function"';this.pushStackLiteral("{}");var helper=this.setupHelper(0,name,helperCall);var helperName=this.lastHelper=this.nameLookup("helpers",name,"helper");var nonHelper=this.nameLookup("depth"+this.lastContext,name,"context");var nextStack=this.nextStack();this.source.push("if ("+nextStack+" = "+helperName+") { "+nextStack+" = "+nextStack+".call("+helper.callParams+"); }");this.source.push("else { "+nextStack+" = "+nonHelper+"; "+nextStack+" = typeof "+nextStack+" === functionType ? "+nextStack+".apply(depth0) : "+nextStack+"; }")},invokePartial:function(name){var params=[this.nameLookup("partials",name,"partial"),"'"+name+"'",this.popStack(),"helpers","partials"];if(this.options.data){params.push("data")}this.context.aliases.self="this";this.push("self.invokePartial("+params.join(", ")+")")},assignToHash:function(key){var value=this.popStack(),context,type;if(this.options.stringParams){type=this.popStack();context=this.popStack()}var hash=this.hash;if(context){hash.contexts.push("'"+key+"': "+context)}if(type){hash.types.push("'"+key+"': "+type)}hash.values.push("'"+key+"': ("+value+")")},compiler:JavaScriptCompiler,compileChildren:function(environment,options){var children=environment.children,child,compiler;for(var i=0,l=children.length;i<l;i++){child=children[i];compiler=new this.compiler;var index=this.matchExistingProgram(child);if(index==null){this.context.programs.push("");index=this.context.programs.length;child.index=index;child.name="program"+index;this.context.programs[index]=compiler.compile(child,options,this.context);this.context.environments[index]=child}else{child.index=index;child.name="program"+index}}},matchExistingProgram:function(child){for(var i=0,len=this.context.environments.length;i<len;i++){var environment=this.context.environments[i];if(environment&&environment.equals(child)){return i}}},programExpression:function(guid){this.context.aliases.self="this";if(guid==null){return"self.noop"}var child=this.environment.children[guid],depths=child.depths.list,depth;var programParams=[child.index,child.name,"data"];for(var i=0,l=depths.length;i<l;i++){depth=depths[i];if(depth===1){programParams.push("depth0")}else{programParams.push("depth"+(depth-1))}}return(depths.length===0?"self.program(":"self.programWithDepth(")+programParams.join(", ")+")"},register:function(name,val){this.useRegister(name);this.source.push(name+" = "+val+";")},useRegister:function(name){if(!this.registers[name]){this.registers[name]=true;this.registers.list.push(name)}},pushStackLiteral:function(item){return this.push(new Literal(item))},pushStack:function(item){this.flushInline();var stack=this.incrStack();if(item){this.source.push(stack+" = "+item+";")}this.compileStack.push(stack);return stack},replaceStack:function(callback){var prefix="",inline=this.isInline(),stack;if(inline){var top=this.popStack(true);if(top instanceof Literal){stack=top.value}else{var name=this.stackSlot?this.topStackName():this.incrStack();prefix="("+this.push(name)+" = "+top+"),";stack=this.topStack()}}else{stack=this.topStack()}var item=callback.call(this,stack);if(inline){if(this.inlineStack.length||this.compileStack.length){this.popStack()}this.push("("+prefix+item+")")}else{if(!/^stack/.test(stack)){stack=this.nextStack()}this.source.push(stack+" = ("+prefix+item+");")}return stack},nextStack:function(){return this.pushStack()},incrStack:function(){this.stackSlot++;if(this.stackSlot>this.stackVars.length){this.stackVars.push("stack"+this.stackSlot)}return this.topStackName()},topStackName:function(){return"stack"+this.stackSlot},flushInline:function(){var inlineStack=this.inlineStack;if(inlineStack.length){this.inlineStack=[];for(var i=0,len=inlineStack.length;i<len;i++){var entry=inlineStack[i];if(entry instanceof Literal){this.compileStack.push(entry)}else{this.pushStack(entry)}}}},isInline:function(){return this.inlineStack.length},popStack:function(wrapped){var inline=this.isInline(),item=(inline?this.inlineStack:this.compileStack).pop();if(!wrapped&&item instanceof Literal){return item.value}else{if(!inline){this.stackSlot--}return item}},topStack:function(wrapped){var stack=this.isInline()?this.inlineStack:this.compileStack,item=stack[stack.length-1];if(!wrapped&&item instanceof Literal){return item.value}else{return item}},quotedString:function(str){return'"'+str.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029")+'"'},setupHelper:function(paramSize,name,missingParams){var params=[];this.setupParams(paramSize,params,missingParams);var foundHelper=this.nameLookup("helpers",name,"helper");return{params:params,name:foundHelper,callParams:["depth0"].concat(params).join(", "),helperMissingParams:missingParams&&["depth0",this.quotedString(name)].concat(params).join(", ")}},setupParams:function(paramSize,params,useRegister){var options=[],contexts=[],types=[],param,inverse,program;options.push("hash:"+this.popStack());inverse=this.popStack();program=this.popStack();if(program||inverse){if(!program){this.context.aliases.self="this";program="self.noop"}if(!inverse){this.context.aliases.self="this";inverse="self.noop"}options.push("inverse:"+inverse);options.push("fn:"+program)}for(var i=0;i<paramSize;i++){param=this.popStack();params.push(param);if(this.options.stringParams){types.push(this.popStack());contexts.push(this.popStack())}}if(this.options.stringParams){options.push("contexts:["+contexts.join(",")+"]");options.push("types:["+types.join(",")+"]");options.push("hashContexts:hashContexts");options.push("hashTypes:hashTypes")}if(this.options.data){options.push("data:data")}options="{"+options.join(",")+"}";if(useRegister){this.register("options",options);params.push("options")}else{params.push(options)}return params.join(", ")}};var reservedWords=("break else new var"+" case finally return void"+" catch for switch while"+" continue function this with"+" default if throw"+" delete in try"+" do instanceof typeof"+" abstract enum int short"+" boolean export interface static"+" byte extends long super"+" char final native synchronized"+" class float package throws"+" const goto private transient"+" debugger implements protected volatile"+" double import public let yield").split(" ");var compilerWords=JavaScriptCompiler.RESERVED_WORDS={};for(var i=0,l=reservedWords.length;i<l;i++){compilerWords[reservedWords[i]]=true}JavaScriptCompiler.isValidJavaScriptVariableName=function(name){if(!JavaScriptCompiler.RESERVED_WORDS[name]&&/^[a-zA-Z_$][0-9a-zA-Z_$]+$/.test(name)){return true}return false};Handlebars.precompile=function(input,options){if(input==null||typeof input!=="string"&&input.constructor!==Handlebars.AST.ProgramNode){throw new Handlebars.Exception("You must pass a string or Handlebars AST to Handlebars.precompile. You passed "+input)}options=options||{};if(!("data"in options)){options.data=true}var ast=Handlebars.parse(input);var environment=(new Compiler).compile(ast,options);return(new JavaScriptCompiler).compile(environment,options)};Handlebars.compile=function(input,options){if(input==null||typeof input!=="string"&&input.constructor!==Handlebars.AST.ProgramNode){throw new Handlebars.Exception("You must pass a string or Handlebars AST to Handlebars.compile. You passed "+input)}options=options||{};if(!("data"in options)){options.data=true}var compiled;function compile(){var ast=Handlebars.parse(input);var environment=(new Compiler).compile(ast,options);var templateSpec=(new JavaScriptCompiler).compile(environment,options,undefined,true);return Handlebars.template(templateSpec)}return function(context,options){if(!compiled){compiled=compile()}return compiled.call(this,context,options)}};Handlebars.VM={template:function(templateSpec){var container={escapeExpression:Handlebars.Utils.escapeExpression,invokePartial:Handlebars.VM.invokePartial,programs:[],program:function(i,fn,data){var programWrapper=this.programs[i];if(data){programWrapper=Handlebars.VM.program(i,fn,data)}else if(!programWrapper){programWrapper=this.programs[i]=Handlebars.VM.program(i,fn)}return programWrapper},merge:function(param,common){var ret=param||common;if(param&&common){ret={};Handlebars.Utils.extend(ret,common);Handlebars.Utils.extend(ret,param)}return ret},programWithDepth:Handlebars.VM.programWithDepth,noop:Handlebars.VM.noop,compilerInfo:null};return function(context,options){options=options||{};var result=templateSpec.call(container,Handlebars,context,options.helpers,options.partials,options.data);var compilerInfo=container.compilerInfo||[],compilerRevision=compilerInfo[0]||1,currentRevision=Handlebars.COMPILER_REVISION;if(compilerRevision!==currentRevision){if(compilerRevision<currentRevision){var runtimeVersions=Handlebars.REVISION_CHANGES[currentRevision],compilerVersions=Handlebars.REVISION_CHANGES[compilerRevision];throw"Template was precompiled with an older version of Handlebars than the current runtime. "+"Please update your precompiler to a newer version ("+runtimeVersions+") or downgrade your runtime to an older version ("+compilerVersions+")."}else{throw"Template was precompiled with a newer version of Handlebars than the current runtime. "+"Please update your runtime to a newer version ("+compilerInfo[1]+")."}}return result}},programWithDepth:function(i,fn,data){var args=Array.prototype.slice.call(arguments,3);var program=function(context,options){options=options||{};return fn.apply(this,[context,options.data||data].concat(args))};program.program=i;program.depth=args.length;return program},program:function(i,fn,data){var program=function(context,options){options=options||{};return fn(context,options.data||data)};program.program=i;program.depth=0;return program},noop:function(){return""},invokePartial:function(partial,name,context,helpers,partials,data){var options={helpers:helpers,partials:partials,data:data};if(partial===undefined){throw new Handlebars.Exception("The partial "+name+" could not be found")}else if(partial instanceof Function){return partial(context,options)}else if(!Handlebars.compile){throw new Handlebars.Exception("The partial "+name+" could not be compiled when running in runtime-only mode")}else{partials[name]=Handlebars.compile(partial,{data:data!==undefined});return partials[name](context,options)}}};Handlebars.template=Handlebars.VM.template}(Handlebars);
/*
 *  Copyright 2011 Twitter, Inc.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */



var Hogan = {};

(function (Hogan, useArrayBuffer) {
  Hogan.Template = function (renderFunc, text, compiler, options) {
    this.r = renderFunc || this.r;
    this.c = compiler;
    this.options = options;
    this.text = text || '';
    this.buf = (useArrayBuffer) ? [] : '';
  }

  Hogan.Template.prototype = {
    // render: replaced by generated code.
    r: function (context, partials, indent) { return ''; },

    // variable escaping
    v: hoganEscape,

    // triple stache
    t: coerceToString,

    render: function render(context, partials, indent) {
      return this.ri([context], partials || {}, indent);
    },

    // render internal -- a hook for overrides that catches partials too
    ri: function (context, partials, indent) {
      return this.r(context, partials, indent);
    },

    // tries to find a partial in the curent scope and render it
    rp: function(name, context, partials, indent) {
      var partial = partials[name];

      if (!partial) {
        return '';
      }

      if (this.c && typeof partial == 'string') {
        partial = this.c.compile(partial, this.options);
      }

      return partial.ri(context, partials, indent);
    },

    // render a section
    rs: function(context, partials, section) {
      var tail = context[context.length - 1];

      if (!isArray(tail)) {
        section(context, partials, this);
        return;
      }

      for (var i = 0; i < tail.length; i++) {
        context.push(tail[i]);
        section(context, partials, this);
        context.pop();
      }
    },

    // maybe start a section
    s: function(val, ctx, partials, inverted, start, end, tags) {
      var pass;

      if (isArray(val) && val.length === 0) {
        return false;
      }

      if (typeof val == 'function') {
        val = this.ls(val, ctx, partials, inverted, start, end, tags);
      }

      pass = (val === '') || !!val;

      if (!inverted && pass && ctx) {
        ctx.push((typeof val == 'object') ? val : ctx[ctx.length - 1]);
      }

      return pass;
    },

    // find values with dotted names
    d: function(key, ctx, partials, returnFound) {
      var names = key.split('.'),
          val = this.f(names[0], ctx, partials, returnFound),
          cx = null;

      if (key === '.' && isArray(ctx[ctx.length - 2])) {
        return ctx[ctx.length - 1];
      }

      for (var i = 1; i < names.length; i++) {
        if (val && typeof val == 'object' && names[i] in val) {
          cx = val;
          val = val[names[i]];
        } else {
          val = '';
        }
      }

      if (returnFound && !val) {
        return false;
      }

      if (!returnFound && typeof val == 'function') {
        ctx.push(cx);
        val = this.lv(val, ctx, partials);
        ctx.pop();
      }

      return val;
    },

    // find values with normal names
    f: function(key, ctx, partials, returnFound) {
      var val = false,
          v = null,
          found = false;

      for (var i = ctx.length - 1; i >= 0; i--) {
        v = ctx[i];
        if (v && typeof v == 'object' && key in v) {
          val = v[key];
          found = true;
          break;
        }
      }

      if (!found) {
        return (returnFound) ? false : "";
      }

      if (!returnFound && typeof val == 'function') {
        val = this.lv(val, ctx, partials);
      }

      return val;
    },

    // higher order templates
    ho: function(val, cx, partials, text, tags) {
      var compiler = this.c;
      var options = this.options;
      options.delimiters = tags;
      var text = val.call(cx, text);
      text = (text == null) ? String(text) : text.toString();
      this.b(compiler.compile(text, options).render(cx, partials));
      return false;
    },

    // template result buffering
    b: (useArrayBuffer) ? function(s) { this.buf.push(s); } :
                          function(s) { this.buf += s; },
    fl: (useArrayBuffer) ? function() { var r = this.buf.join(''); this.buf = []; return r; } :
                           function() { var r = this.buf; this.buf = ''; return r; },

    // lambda replace section
    ls: function(val, ctx, partials, inverted, start, end, tags) {
      var cx = ctx[ctx.length - 1],
          t = null;

      if (!inverted && this.c && val.length > 0) {
        return this.ho(val, cx, partials, this.text.substring(start, end), tags);
      }

      t = val.call(cx);

      if (typeof t == 'function') {
        if (inverted) {
          return true;
        } else if (this.c) {
          return this.ho(t, cx, partials, this.text.substring(start, end), tags);
        }
      }

      return t;
    },

    // lambda replace variable
    lv: function(val, ctx, partials) {
      var cx = ctx[ctx.length - 1];
      var result = val.call(cx);

      if (typeof result == 'function') {
        result = coerceToString(result.call(cx));
        if (this.c && ~result.indexOf("{\u007B")) {
          return this.c.compile(result, this.options).render(cx, partials);
        }
      }

      return coerceToString(result);
    }

  };

  var rAmp = /&/g,
      rLt = /</g,
      rGt = />/g,
      rApos =/\'/g,
      rQuot = /\"/g,
      hChars =/[&<>\"\']/;


  function coerceToString(val) {
    return String((val === null || val === undefined) ? '' : val);
  }

  function hoganEscape(str) {
    str = coerceToString(str);
    return hChars.test(str) ?
      str
        .replace(rAmp,'&amp;')
        .replace(rLt,'&lt;')
        .replace(rGt,'&gt;')
        .replace(rApos,'&#39;')
        .replace(rQuot, '&quot;') :
      str;
  }

  var isArray = Array.isArray || function(a) {
    return Object.prototype.toString.call(a) === '[object Array]';
  };

})(typeof exports !== 'undefined' ? exports : Hogan);




(function (Hogan) {
  // Setup regex  assignments
  // remove whitespace according to Mustache spec
  var rIsWhitespace = /\S/,
      rQuot = /\"/g,
      rNewline =  /\n/g,
      rCr = /\r/g,
      rSlash = /\\/g,
      tagTypes = {
        '#': 1, '^': 2, '/': 3,  '!': 4, '>': 5,
        '<': 6, '=': 7, '_v': 8, '{': 9, '&': 10
      };

  Hogan.scan = function scan(text, delimiters) {
    var len = text.length,
        IN_TEXT = 0,
        IN_TAG_TYPE = 1,
        IN_TAG = 2,
        state = IN_TEXT,
        tagType = null,
        tag = null,
        buf = '',
        tokens = [],
        seenTag = false,
        i = 0,
        lineStart = 0,
        otag = '{{',
        ctag = '}}';

    function addBuf() {
      if (buf.length > 0) {
        tokens.push(new String(buf));
        buf = '';
      }
    }

    function lineIsWhitespace() {
      var isAllWhitespace = true;
      for (var j = lineStart; j < tokens.length; j++) {
        isAllWhitespace =
          (tokens[j].tag && tagTypes[tokens[j].tag] < tagTypes['_v']) ||
          (!tokens[j].tag && tokens[j].match(rIsWhitespace) === null);
        if (!isAllWhitespace) {
          return false;
        }
      }

      return isAllWhitespace;
    }

    function filterLine(haveSeenTag, noNewLine) {
      addBuf();

      if (haveSeenTag && lineIsWhitespace()) {
        for (var j = lineStart, next; j < tokens.length; j++) {
          if (!tokens[j].tag) {
            if ((next = tokens[j+1]) && next.tag == '>') {
              // set indent to token value
              next.indent = tokens[j].toString()
            }
            tokens.splice(j, 1);
          }
        }
      } else if (!noNewLine) {
        tokens.push({tag:'\n'});
      }

      seenTag = false;
      lineStart = tokens.length;
    }

    function changeDelimiters(text, index) {
      var close = '=' + ctag,
          closeIndex = text.indexOf(close, index),
          delimiters = trim(
            text.substring(text.indexOf('=', index) + 1, closeIndex)
          ).split(' ');

      otag = delimiters[0];
      ctag = delimiters[1];

      return closeIndex + close.length - 1;
    }

    if (delimiters) {
      delimiters = delimiters.split(' ');
      otag = delimiters[0];
      ctag = delimiters[1];
    }

    for (i = 0; i < len; i++) {
      if (state == IN_TEXT) {
        if (tagChange(otag, text, i)) {
          --i;
          addBuf();
          state = IN_TAG_TYPE;
        } else {
          if (text.charAt(i) == '\n') {
            filterLine(seenTag);
          } else {
            buf += text.charAt(i);
          }
        }
      } else if (state == IN_TAG_TYPE) {
        i += otag.length - 1;
        tag = tagTypes[text.charAt(i + 1)];
        tagType = tag ? text.charAt(i + 1) : '_v';
        if (tagType == '=') {
          i = changeDelimiters(text, i);
          state = IN_TEXT;
        } else {
          if (tag) {
            i++;
          }
          state = IN_TAG;
        }
        seenTag = i;
      } else {
        if (tagChange(ctag, text, i)) {
          tokens.push({tag: tagType, n: trim(buf), otag: otag, ctag: ctag,
                       i: (tagType == '/') ? seenTag - ctag.length : i + otag.length});
          buf = '';
          i += ctag.length - 1;
          state = IN_TEXT;
          if (tagType == '{') {
            if (ctag == '}}') {
              i++;
            } else {
              cleanTripleStache(tokens[tokens.length - 1]);
            }
          }
        } else {
          buf += text.charAt(i);
        }
      }
    }

    filterLine(seenTag, true);

    return tokens;
  }

  function cleanTripleStache(token) {
    if (token.n.substr(token.n.length - 1) === '}') {
      token.n = token.n.substring(0, token.n.length - 1);
    }
  }

  function trim(s) {
    if (s.trim) {
      return s.trim();
    }

    return s.replace(/^\s*|\s*$/g, '');
  }

  function tagChange(tag, text, index) {
    if (text.charAt(index) != tag.charAt(0)) {
      return false;
    }

    for (var i = 1, l = tag.length; i < l; i++) {
      if (text.charAt(index + i) != tag.charAt(i)) {
        return false;
      }
    }

    return true;
  }

  function buildTree(tokens, kind, stack, customTags) {
    var instructions = [],
        opener = null,
        token = null;

    while (tokens.length > 0) {
      token = tokens.shift();
      if (token.tag == '#' || token.tag == '^' || isOpener(token, customTags)) {
        stack.push(token);
        token.nodes = buildTree(tokens, token.tag, stack, customTags);
        instructions.push(token);
      } else if (token.tag == '/') {
        if (stack.length === 0) {
          throw new Error('Closing tag without opener: /' + token.n);
        }
        opener = stack.pop();
        if (token.n != opener.n && !isCloser(token.n, opener.n, customTags)) {
          throw new Error('Nesting error: ' + opener.n + ' vs. ' + token.n);
        }
        opener.end = token.i;
        return instructions;
      } else {
        instructions.push(token);
      }
    }

    if (stack.length > 0) {
      throw new Error('missing closing tag: ' + stack.pop().n);
    }

    return instructions;
  }

  function isOpener(token, tags) {
    for (var i = 0, l = tags.length; i < l; i++) {
      if (tags[i].o == token.n) {
        token.tag = '#';
        return true;
      }
    }
  }

  function isCloser(close, open, tags) {
    for (var i = 0, l = tags.length; i < l; i++) {
      if (tags[i].c == close && tags[i].o == open) {
        return true;
      }
    }
  }

  Hogan.generate = function (tree, text, options) {
    var code = 'var _=this;_.b(i=i||"");' + walk(tree) + 'return _.fl();';
    if (options.asString) {
      return 'function(c,p,i){' + code + ';}';
    }

    return new Hogan.Template(new Function('c', 'p', 'i', code), text, Hogan, options);
  }

  function esc(s) {
    return s.replace(rSlash, '\\\\')
            .replace(rQuot, '\\\"')
            .replace(rNewline, '\\n')
            .replace(rCr, '\\r');
  }

  function chooseMethod(s) {
    return (~s.indexOf('.')) ? 'd' : 'f';
  }

  function walk(tree) {
    var code = '';
    for (var i = 0, l = tree.length; i < l; i++) {
      var tag = tree[i].tag;
      if (tag == '#') {
        code += section(tree[i].nodes, tree[i].n, chooseMethod(tree[i].n),
                        tree[i].i, tree[i].end, tree[i].otag + " " + tree[i].ctag);
      } else if (tag == '^') {
        code += invertedSection(tree[i].nodes, tree[i].n,
                                chooseMethod(tree[i].n));
      } else if (tag == '<' || tag == '>') {
        code += partial(tree[i]);
      } else if (tag == '{' || tag == '&') {
        code += tripleStache(tree[i].n, chooseMethod(tree[i].n));
      } else if (tag == '\n') {
        code += text('"\\n"' + (tree.length-1 == i ? '' : ' + i'));
      } else if (tag == '_v') {
        code += variable(tree[i].n, chooseMethod(tree[i].n));
      } else if (tag === undefined) {
        code += text('"' + esc(tree[i]) + '"');
      }
    }
    return code;
  }

  function section(nodes, id, method, start, end, tags) {
    return 'if(_.s(_.' + method + '("' + esc(id) + '",c,p,1),' +
           'c,p,0,' + start + ',' + end + ',"' + tags + '")){' +
           '_.rs(c,p,' +
           'function(c,p,_){' +
           walk(nodes) +
           '});c.pop();}';
  }

  function invertedSection(nodes, id, method) {
    return 'if(!_.s(_.' + method + '("' + esc(id) + '",c,p,1),c,p,1,0,0,"")){' +
           walk(nodes) +
           '};';
  }

  function partial(tok) {
    return '_.b(_.rp("' +  esc(tok.n) + '",c,p,"' + (tok.indent || '') + '"));';
  }

  function tripleStache(id, method) {
    return '_.b(_.t(_.' + method + '("' + esc(id) + '",c,p,0)));';
  }

  function variable(id, method) {
    return '_.b(_.v(_.' + method + '("' + esc(id) + '",c,p,0)));';
  }

  function text(id) {
    return '_.b(' + id + ');';
  }

  Hogan.parse = function(tokens, text, options) {
    options = options || {};
    return buildTree(tokens, '', [], options.sectionTags || []);
  },

  Hogan.cache = {};

  Hogan.compile = function(text, options) {
    // options
    //
    // asString: false (default)
    //
    // sectionTags: [{o: '_foo', c: 'foo'}]
    // An array of object with o and c fields that indicate names for custom
    // section tags. The example above allows parsing of {{_foo}}{{/foo}}.
    //
    // delimiters: A string that overrides the default delimiters.
    // Example: "<% %>"
    //
    options = options || {};

    var key = text + '||' + !!options.asString;

    var t = this.cache[key];

    if (t) {
      return t;
    }

    t = this.generate(this.parse(this.scan(text, options.delimiters), text, options), text, options);
    return this.cache[key] = t;
  };
})(typeof exports !== 'undefined' ? exports : Hogan);

// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
(function(){
  var cache = {};

  this.tmpl = function tmpl(str, data){
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = cache[str] = cache[str] ||

      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +

        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +

        // Convert the template into pure JavaScript
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")
      + "');}return p.join('');");

    // Provide some basic currying to the user
    return data ? fn( data ) : fn;
  };

})();//     Underscore.js 1.5.2
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.
(function(){var n=this,t=n._,r={},e=Array.prototype,u=Object.prototype,i=Function.prototype,a=e.push,o=e.slice,c=e.concat,l=u.toString,f=u.hasOwnProperty,s=e.forEach,p=e.map,h=e.reduce,v=e.reduceRight,g=e.filter,d=e.every,m=e.some,y=e.indexOf,b=e.lastIndexOf,x=Array.isArray,w=Object.keys,_=i.bind,j=function(n){return n instanceof j?n:this instanceof j?(this._wrapped=n,void 0):new j(n)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=j),exports._=j):n._=j,j.VERSION="1.5.2";var A=j.each=j.forEach=function(n,t,e){if(null!=n)if(s&&n.forEach===s)n.forEach(t,e);else if(n.length===+n.length){for(var u=0,i=n.length;i>u;u++)if(t.call(e,n[u],u,n)===r)return}else for(var a=j.keys(n),u=0,i=a.length;i>u;u++)if(t.call(e,n[a[u]],a[u],n)===r)return};j.map=j.collect=function(n,t,r){var e=[];return null==n?e:p&&n.map===p?n.map(t,r):(A(n,function(n,u,i){e.push(t.call(r,n,u,i))}),e)};var E="Reduce of empty array with no initial value";j.reduce=j.foldl=j.inject=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),h&&n.reduce===h)return e&&(t=j.bind(t,e)),u?n.reduce(t,r):n.reduce(t);if(A(n,function(n,i,a){u?r=t.call(e,r,n,i,a):(r=n,u=!0)}),!u)throw new TypeError(E);return r},j.reduceRight=j.foldr=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),v&&n.reduceRight===v)return e&&(t=j.bind(t,e)),u?n.reduceRight(t,r):n.reduceRight(t);var i=n.length;if(i!==+i){var a=j.keys(n);i=a.length}if(A(n,function(o,c,l){c=a?a[--i]:--i,u?r=t.call(e,r,n[c],c,l):(r=n[c],u=!0)}),!u)throw new TypeError(E);return r},j.find=j.detect=function(n,t,r){var e;return O(n,function(n,u,i){return t.call(r,n,u,i)?(e=n,!0):void 0}),e},j.filter=j.select=function(n,t,r){var e=[];return null==n?e:g&&n.filter===g?n.filter(t,r):(A(n,function(n,u,i){t.call(r,n,u,i)&&e.push(n)}),e)},j.reject=function(n,t,r){return j.filter(n,function(n,e,u){return!t.call(r,n,e,u)},r)},j.every=j.all=function(n,t,e){t||(t=j.identity);var u=!0;return null==n?u:d&&n.every===d?n.every(t,e):(A(n,function(n,i,a){return(u=u&&t.call(e,n,i,a))?void 0:r}),!!u)};var O=j.some=j.any=function(n,t,e){t||(t=j.identity);var u=!1;return null==n?u:m&&n.some===m?n.some(t,e):(A(n,function(n,i,a){return u||(u=t.call(e,n,i,a))?r:void 0}),!!u)};j.contains=j.include=function(n,t){return null==n?!1:y&&n.indexOf===y?n.indexOf(t)!=-1:O(n,function(n){return n===t})},j.invoke=function(n,t){var r=o.call(arguments,2),e=j.isFunction(t);return j.map(n,function(n){return(e?t:n[t]).apply(n,r)})},j.pluck=function(n,t){return j.map(n,function(n){return n[t]})},j.where=function(n,t,r){return j.isEmpty(t)?r?void 0:[]:j[r?"find":"filter"](n,function(n){for(var r in t)if(t[r]!==n[r])return!1;return!0})},j.findWhere=function(n,t){return j.where(n,t,!0)},j.max=function(n,t,r){if(!t&&j.isArray(n)&&n[0]===+n[0]&&n.length<65535)return Math.max.apply(Math,n);if(!t&&j.isEmpty(n))return-1/0;var e={computed:-1/0,value:-1/0};return A(n,function(n,u,i){var a=t?t.call(r,n,u,i):n;a>e.computed&&(e={value:n,computed:a})}),e.value},j.min=function(n,t,r){if(!t&&j.isArray(n)&&n[0]===+n[0]&&n.length<65535)return Math.min.apply(Math,n);if(!t&&j.isEmpty(n))return 1/0;var e={computed:1/0,value:1/0};return A(n,function(n,u,i){var a=t?t.call(r,n,u,i):n;a<e.computed&&(e={value:n,computed:a})}),e.value},j.shuffle=function(n){var t,r=0,e=[];return A(n,function(n){t=j.random(r++),e[r-1]=e[t],e[t]=n}),e},j.sample=function(n,t,r){return arguments.length<2||r?n[j.random(n.length-1)]:j.shuffle(n).slice(0,Math.max(0,t))};var k=function(n){return j.isFunction(n)?n:function(t){return t[n]}};j.sortBy=function(n,t,r){var e=k(t);return j.pluck(j.map(n,function(n,t,u){return{value:n,index:t,criteria:e.call(r,n,t,u)}}).sort(function(n,t){var r=n.criteria,e=t.criteria;if(r!==e){if(r>e||r===void 0)return 1;if(e>r||e===void 0)return-1}return n.index-t.index}),"value")};var F=function(n){return function(t,r,e){var u={},i=null==r?j.identity:k(r);return A(t,function(r,a){var o=i.call(e,r,a,t);n(u,o,r)}),u}};j.groupBy=F(function(n,t,r){(j.has(n,t)?n[t]:n[t]=[]).push(r)}),j.indexBy=F(function(n,t,r){n[t]=r}),j.countBy=F(function(n,t){j.has(n,t)?n[t]++:n[t]=1}),j.sortedIndex=function(n,t,r,e){r=null==r?j.identity:k(r);for(var u=r.call(e,t),i=0,a=n.length;a>i;){var o=i+a>>>1;r.call(e,n[o])<u?i=o+1:a=o}return i},j.toArray=function(n){return n?j.isArray(n)?o.call(n):n.length===+n.length?j.map(n,j.identity):j.values(n):[]},j.size=function(n){return null==n?0:n.length===+n.length?n.length:j.keys(n).length},j.first=j.head=j.take=function(n,t,r){return null==n?void 0:null==t||r?n[0]:o.call(n,0,t)},j.initial=function(n,t,r){return o.call(n,0,n.length-(null==t||r?1:t))},j.last=function(n,t,r){return null==n?void 0:null==t||r?n[n.length-1]:o.call(n,Math.max(n.length-t,0))},j.rest=j.tail=j.drop=function(n,t,r){return o.call(n,null==t||r?1:t)},j.compact=function(n){return j.filter(n,j.identity)};var M=function(n,t,r){return t&&j.every(n,j.isArray)?c.apply(r,n):(A(n,function(n){j.isArray(n)||j.isArguments(n)?t?a.apply(r,n):M(n,t,r):r.push(n)}),r)};j.flatten=function(n,t){return M(n,t,[])},j.without=function(n){return j.difference(n,o.call(arguments,1))},j.uniq=j.unique=function(n,t,r,e){j.isFunction(t)&&(e=r,r=t,t=!1);var u=r?j.map(n,r,e):n,i=[],a=[];return A(u,function(r,e){(t?e&&a[a.length-1]===r:j.contains(a,r))||(a.push(r),i.push(n[e]))}),i},j.union=function(){return j.uniq(j.flatten(arguments,!0))},j.intersection=function(n){var t=o.call(arguments,1);return j.filter(j.uniq(n),function(n){return j.every(t,function(t){return j.indexOf(t,n)>=0})})},j.difference=function(n){var t=c.apply(e,o.call(arguments,1));return j.filter(n,function(n){return!j.contains(t,n)})},j.zip=function(){for(var n=j.max(j.pluck(arguments,"length").concat(0)),t=new Array(n),r=0;n>r;r++)t[r]=j.pluck(arguments,""+r);return t},j.object=function(n,t){if(null==n)return{};for(var r={},e=0,u=n.length;u>e;e++)t?r[n[e]]=t[e]:r[n[e][0]]=n[e][1];return r},j.indexOf=function(n,t,r){if(null==n)return-1;var e=0,u=n.length;if(r){if("number"!=typeof r)return e=j.sortedIndex(n,t),n[e]===t?e:-1;e=0>r?Math.max(0,u+r):r}if(y&&n.indexOf===y)return n.indexOf(t,r);for(;u>e;e++)if(n[e]===t)return e;return-1},j.lastIndexOf=function(n,t,r){if(null==n)return-1;var e=null!=r;if(b&&n.lastIndexOf===b)return e?n.lastIndexOf(t,r):n.lastIndexOf(t);for(var u=e?r:n.length;u--;)if(n[u]===t)return u;return-1},j.range=function(n,t,r){arguments.length<=1&&(t=n||0,n=0),r=arguments[2]||1;for(var e=Math.max(Math.ceil((t-n)/r),0),u=0,i=new Array(e);e>u;)i[u++]=n,n+=r;return i};var R=function(){};j.bind=function(n,t){var r,e;if(_&&n.bind===_)return _.apply(n,o.call(arguments,1));if(!j.isFunction(n))throw new TypeError;return r=o.call(arguments,2),e=function(){if(!(this instanceof e))return n.apply(t,r.concat(o.call(arguments)));R.prototype=n.prototype;var u=new R;R.prototype=null;var i=n.apply(u,r.concat(o.call(arguments)));return Object(i)===i?i:u}},j.partial=function(n){var t=o.call(arguments,1);return function(){return n.apply(this,t.concat(o.call(arguments)))}},j.bindAll=function(n){var t=o.call(arguments,1);if(0===t.length)throw new Error("bindAll must be passed function names");return A(t,function(t){n[t]=j.bind(n[t],n)}),n},j.memoize=function(n,t){var r={};return t||(t=j.identity),function(){var e=t.apply(this,arguments);return j.has(r,e)?r[e]:r[e]=n.apply(this,arguments)}},j.delay=function(n,t){var r=o.call(arguments,2);return setTimeout(function(){return n.apply(null,r)},t)},j.defer=function(n){return j.delay.apply(j,[n,1].concat(o.call(arguments,1)))},j.throttle=function(n,t,r){var e,u,i,a=null,o=0;r||(r={});var c=function(){o=r.leading===!1?0:new Date,a=null,i=n.apply(e,u)};return function(){var l=new Date;o||r.leading!==!1||(o=l);var f=t-(l-o);return e=this,u=arguments,0>=f?(clearTimeout(a),a=null,o=l,i=n.apply(e,u)):a||r.trailing===!1||(a=setTimeout(c,f)),i}},j.debounce=function(n,t,r){var e,u,i,a,o;return function(){i=this,u=arguments,a=new Date;var c=function(){var l=new Date-a;t>l?e=setTimeout(c,t-l):(e=null,r||(o=n.apply(i,u)))},l=r&&!e;return e||(e=setTimeout(c,t)),l&&(o=n.apply(i,u)),o}},j.once=function(n){var t,r=!1;return function(){return r?t:(r=!0,t=n.apply(this,arguments),n=null,t)}},j.wrap=function(n,t){return function(){var r=[n];return a.apply(r,arguments),t.apply(this,r)}},j.compose=function(){var n=arguments;return function(){for(var t=arguments,r=n.length-1;r>=0;r--)t=[n[r].apply(this,t)];return t[0]}},j.after=function(n,t){return function(){return--n<1?t.apply(this,arguments):void 0}},j.keys=w||function(n){if(n!==Object(n))throw new TypeError("Invalid object");var t=[];for(var r in n)j.has(n,r)&&t.push(r);return t},j.values=function(n){for(var t=j.keys(n),r=t.length,e=new Array(r),u=0;r>u;u++)e[u]=n[t[u]];return e},j.pairs=function(n){for(var t=j.keys(n),r=t.length,e=new Array(r),u=0;r>u;u++)e[u]=[t[u],n[t[u]]];return e},j.invert=function(n){for(var t={},r=j.keys(n),e=0,u=r.length;u>e;e++)t[n[r[e]]]=r[e];return t},j.functions=j.methods=function(n){var t=[];for(var r in n)j.isFunction(n[r])&&t.push(r);return t.sort()},j.extend=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)n[r]=t[r]}),n},j.pick=function(n){var t={},r=c.apply(e,o.call(arguments,1));return A(r,function(r){r in n&&(t[r]=n[r])}),t},j.omit=function(n){var t={},r=c.apply(e,o.call(arguments,1));for(var u in n)j.contains(r,u)||(t[u]=n[u]);return t},j.defaults=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)n[r]===void 0&&(n[r]=t[r])}),n},j.clone=function(n){return j.isObject(n)?j.isArray(n)?n.slice():j.extend({},n):n},j.tap=function(n,t){return t(n),n};var S=function(n,t,r,e){if(n===t)return 0!==n||1/n==1/t;if(null==n||null==t)return n===t;n instanceof j&&(n=n._wrapped),t instanceof j&&(t=t._wrapped);var u=l.call(n);if(u!=l.call(t))return!1;switch(u){case"[object String]":return n==String(t);case"[object Number]":return n!=+n?t!=+t:0==n?1/n==1/t:n==+t;case"[object Date]":case"[object Boolean]":return+n==+t;case"[object RegExp]":return n.source==t.source&&n.global==t.global&&n.multiline==t.multiline&&n.ignoreCase==t.ignoreCase}if("object"!=typeof n||"object"!=typeof t)return!1;for(var i=r.length;i--;)if(r[i]==n)return e[i]==t;var a=n.constructor,o=t.constructor;if(a!==o&&!(j.isFunction(a)&&a instanceof a&&j.isFunction(o)&&o instanceof o))return!1;r.push(n),e.push(t);var c=0,f=!0;if("[object Array]"==u){if(c=n.length,f=c==t.length)for(;c--&&(f=S(n[c],t[c],r,e)););}else{for(var s in n)if(j.has(n,s)&&(c++,!(f=j.has(t,s)&&S(n[s],t[s],r,e))))break;if(f){for(s in t)if(j.has(t,s)&&!c--)break;f=!c}}return r.pop(),e.pop(),f};j.isEqual=function(n,t){return S(n,t,[],[])},j.isEmpty=function(n){if(null==n)return!0;if(j.isArray(n)||j.isString(n))return 0===n.length;for(var t in n)if(j.has(n,t))return!1;return!0},j.isElement=function(n){return!(!n||1!==n.nodeType)},j.isArray=x||function(n){return"[object Array]"==l.call(n)},j.isObject=function(n){return n===Object(n)},A(["Arguments","Function","String","Number","Date","RegExp"],function(n){j["is"+n]=function(t){return l.call(t)=="[object "+n+"]"}}),j.isArguments(arguments)||(j.isArguments=function(n){return!(!n||!j.has(n,"callee"))}),"function"!=typeof/./&&(j.isFunction=function(n){return"function"==typeof n}),j.isFinite=function(n){return isFinite(n)&&!isNaN(parseFloat(n))},j.isNaN=function(n){return j.isNumber(n)&&n!=+n},j.isBoolean=function(n){return n===!0||n===!1||"[object Boolean]"==l.call(n)},j.isNull=function(n){return null===n},j.isUndefined=function(n){return n===void 0},j.has=function(n,t){return f.call(n,t)},j.noConflict=function(){return n._=t,this},j.identity=function(n){return n},j.times=function(n,t,r){for(var e=Array(Math.max(0,n)),u=0;n>u;u++)e[u]=t.call(r,u);return e},j.random=function(n,t){return null==t&&(t=n,n=0),n+Math.floor(Math.random()*(t-n+1))};var I={escape:{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;"}};I.unescape=j.invert(I.escape);var T={escape:new RegExp("["+j.keys(I.escape).join("")+"]","g"),unescape:new RegExp("("+j.keys(I.unescape).join("|")+")","g")};j.each(["escape","unescape"],function(n){j[n]=function(t){return null==t?"":(""+t).replace(T[n],function(t){return I[n][t]})}}),j.result=function(n,t){if(null==n)return void 0;var r=n[t];return j.isFunction(r)?r.call(n):r},j.mixin=function(n){A(j.functions(n),function(t){var r=j[t]=n[t];j.prototype[t]=function(){var n=[this._wrapped];return a.apply(n,arguments),z.call(this,r.apply(j,n))}})};var N=0;j.uniqueId=function(n){var t=++N+"";return n?n+t:t},j.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var q=/(.)^/,B={"'":"'","\\":"\\","\r":"r","\n":"n","	":"t","\u2028":"u2028","\u2029":"u2029"},D=/\\|'|\r|\n|\t|\u2028|\u2029/g;j.template=function(n,t,r){var e;r=j.defaults({},r,j.templateSettings);var u=new RegExp([(r.escape||q).source,(r.interpolate||q).source,(r.evaluate||q).source].join("|")+"|$","g"),i=0,a="__p+='";n.replace(u,function(t,r,e,u,o){return a+=n.slice(i,o).replace(D,function(n){return"\\"+B[n]}),r&&(a+="'+\n((__t=("+r+"))==null?'':_.escape(__t))+\n'"),e&&(a+="'+\n((__t=("+e+"))==null?'':__t)+\n'"),u&&(a+="';\n"+u+"\n__p+='"),i=o+t.length,t}),a+="';\n",r.variable||(a="with(obj||{}){\n"+a+"}\n"),a="var __t,__p='',__j=Array.prototype.join,"+"print=function(){__p+=__j.call(arguments,'');};\n"+a+"return __p;\n";try{e=new Function(r.variable||"obj","_",a)}catch(o){throw o.source=a,o}if(t)return e(t,j);var c=function(n){return e.call(this,n,j)};return c.source="function("+(r.variable||"obj")+"){\n"+a+"}",c},j.chain=function(n){return j(n).chain()};var z=function(n){return this._chain?j(n).chain():n};j.mixin(j),A(["pop","push","reverse","shift","sort","splice","unshift"],function(n){var t=e[n];j.prototype[n]=function(){var r=this._wrapped;return t.apply(r,arguments),"shift"!=n&&"splice"!=n||0!==r.length||delete r[0],z.call(this,r)}}),A(["concat","join","slice"],function(n){var t=e[n];j.prototype[n]=function(){return z.call(this,t.apply(this._wrapped,arguments))}}),j.extend(j.prototype,{chain:function(){return this._chain=!0,this},value:function(){return this._wrapped}})}).call(this);
//# sourceMappingURL=underscore-min.map