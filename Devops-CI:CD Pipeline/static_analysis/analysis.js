const esprima = require("esprima");
const options = { tokens: true, tolerant: true, loc: true, range: true };
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

function main() {
  var args = process.argv.slice(2);
  var folderPath = '';
  var filesAnalyze = [];
  if (args.length == 0) {
    args = ["analysis.js"];
    filesAnalyze = args;
  } else {
   folderPath = args[0];
   filesAnalyze = getAllFiles(folderPath);
  }
//   console.log(filesAnalyze);
  var totalViolation = [];
  for(var i in filesAnalyze) {
    var builders = {};
    var selectFile = filesAnalyze[i];
    var check = selectFile.split(".")[1] == "js"; 
    if(check) {
      complexity(selectFile, builders);

        for (var node in builders) {
            var builder = builders[node];
            if(builder.violator != undefined && builder.violator.length > 0) {
                totalViolation.push(builder.violator);
            }
            builder.report();
        }
    }

  }
  if(totalViolation.length > 0) {
      console.log("=============== Violations Detected ===============");
      for(var i in totalViolation) {
          console.log(" " + totalViolation[i] );
      }
      console.log();
      process.exit(1);
  } 
  console.log("Complete.");
}

const getAllFiles = function(dirPath, arrayOfFiles) {
    if(dirPath != 'server-side/site/node_modules') {
    files = fs.readdirSync(dirPath)
  
    arrayOfFiles = arrayOfFiles || []
  
    files.forEach(function(file) {
      if (fs.statSync(dirPath + "/" + file).isDirectory()) {
        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
      } else {
        var fPath = dirPath + "/"+ file;
        arrayOfFiles.push(fPath);
      }
    })
    }
    return arrayOfFiles
  }

function complexity(filePath, builders) {
  var buf = fs.readFileSync(filePath, "utf8");
  var ast = esprima.parse(buf, options);

  var i = 0;

  var fileBuilder = new FileBuilder();
  fileBuilder.FileName = filePath;
  builders[filePath] = fileBuilder;

  traverseWithParents(ast, function (node) {
    // File level calculations
    // 1. Strings
    if (node.type == "Literal" && typeof node.value == "string") {
      fileBuilder.Strings++;
    }

    // 2. Packages
    if (
      node.type == "CallExpression" &&
      node.callee.type == "Identifier" &&
      node.callee.name == "require"
    ) {
      fileBuilder.ImportCount++;
    }

    if (node.type === "FunctionDeclaration") {
      var builder = new FunctionBuilder();

      builder.FunctionName = functionName(node);
      builder.StartLine = node.loc.start.line;
      // Calculate function level properties.
      // 3. Parameters
      builder.ParameterCount = node.params.length;
      // 4. Method Length
      builder.Length = node.loc.end.line - node.loc.start.line;
      builder.LongMethod = builder.Length+1;
      maxNestedIf(node, 0, builder);
      var maximumlength = 0;
      var chainlength=0;
      // With new visitor(s)...
      // 5. CyclomaticComplexity
      traverseWithParents(node, function (child) {
        if (child.type == "IfStatement") {
          builder.SimpleCyclomaticComplexity++;
        }
      });

      // 6. Halstead
      map = {};
      traverseWithParents(node.body, function (child) {
        if (child.type === "BinaryExpression" || child.type === "LogicalExpression" || child.type === "Identifier") {
          if (child.operator != undefined) {
            if (!(child.operator in map)) {
              map[child.operator] = true;
              builder.Halstead++;
            }
          }
          if (child.name != undefined) {
            if (!(child.name in map)) {
              map[child.name] = true;
              builder.Halstead++;
            }
          }
        }
      });
    traverseWithParents(node, function (child) 
			{
				if (child.type === "MemberExpression")
				{
					chainlength = 1;
					traverseWithParents(child.object, function(child)
					{
						if (child.type === 'MemberExpression') 
						{
							chainlength++;	
						}							
					});
          if(maximumlength<chainlength) {
                        maximumlength = chainlength;
          }
				}
            builder.MaxMessageChains = maximumlength;
		});
        if(builder.LongMethod > 100 || builder.MaxMessageChains > 10 || builder.MaxNestingDepth > 5) {
            // builder.violator.push();
            var violate = builder.FunctionName + " : LongMethod [" + builder.LongMethod + "], MaxMessageChains [" + builder.MaxMessageChains + 
            "], MaxNestingDepth [" + builder.MaxNestingDepth + "]";
            builder.violator.push(violate);
        }
      builders[builder.FunctionName] = builder;
    }
  });
}

function maxNestedIf(node, clvl, builder) {
	var key, child;
	var lvl = 0;
	for (key in node) {
		if (node.hasOwnProperty(key)) {
				child = node[key];
				if (typeof child === 'object' && child !== null && key != 'parent') {
					lvl++;
					if( key == "alternate"){
						maxNestedIf(child,clvl,builder)
					} else if( child.type == 'IfStatement'){
							maxNestedIf(child, clvl+1, builder);
					}	else {
							maxNestedIf(child, clvl, builder);
				}
			}
		}
	}
	if( lvl == 0 ) {
    	if( builder.MaxNestingDepth < clvl ) {
			builder.MaxNestingDepth = clvl;
    	}
	}
}

// Represent a reusable "class" following the Builder pattern.
class FunctionBuilder {
  constructor() {
    this.StartLine = 0;
    this.FunctionName = "";
    // The number of parameters for functions
    this.ParameterCount = 0;
    // The number of lines.
    this.Length = 0;
    // Number of if statements/loops + 1
    this.SimpleCyclomaticComplexity = 1;
    // Number of unique symbols + operators
    this.Halstead = 0;
    // The max depth of scopes (nested ifs, loops, etc)
    this.MaxNestingDepth = 0;
    // The max number of conditions if one decision statement.
    this.MaxConditions = 0;
    // Number of lines of code in a function
	this.LongMethod = 0;
    // Violatiom
    this.violator = [];
  }

  threshold() {
    const thresholds = {
      SimpleCyclomaticComplexity: [
        { t: 10, color: "red" },
        { t: 4, color: "yellow" },
      ],
      Halstead: [
        { t: 10, color: "red" },
        { t: 3, color: "yellow" },
      ],
      ParameterCount: [
        { t: 10, color: "red" },
        { t: 3, color: "yellow" },
      ],
      Length: [
        { t: 100, color: "red" },
        { t: 10, color: "yellow" },
      ],
      Length: [
        { t: 100, color: "red" },
        { t: 10, color: "yellow" },
      ],
    };

    const showScore = (id, value) => {
      let scores = thresholds[id];
      const lowestThreshold = { t: 0, color: "green" };
      const score =
        scores
          .sort((a, b) => {
            a.t - b.t;
          })
          .find((score) => score.t <= value) || lowestThreshold;
      return score.color;
    };

    this.Halstead = chalk`{${showScore("Halstead", this.Halstead)} ${
      this.Halstead
    }}`;
    this.Length = chalk`{${showScore("Length", this.Length)} ${this.Length}}`;
    this.ParameterCount = chalk`{${showScore(
      "ParameterCount",
      this.ParameterCount
    )} ${this.ParameterCount}}`;
    this.SimpleCyclomaticComplexity = chalk`{${showScore(
      "SimpleCyclomaticComplexity",
      this.SimpleCyclomaticComplexity
    )} ${this.SimpleCyclomaticComplexity}}`;
  }

  report() {
    this.threshold();
    console.log(chalk`{blue.underline ${this.FunctionName}}(): at line #${this.StartLine}\nLongMethod: ${this.LongMethod}\t\tMaxMessageChains: ${this.MaxMessageChains}\t\tMaxNestingDepth: ${this.MaxNestingDepth}`);
//  if(this.LongMethod > 100 || this.MaxMessageChains > 10 || this.MaxNestingDepth > 5) {
//      console.log();
//      console.log("============================= Violation Detected =============================");
//  }
//  if(this.LongMethod > 100)
//  {
//      var lm_issues ="Long method detected in function - " + this.FunctionName + " (LOC: " + this.LongMethod + ")"; 
//      console.log(" " + chalk.red(lm_issues) + " ");
//      console.log("============================= ----------------------- =============================");
//  }

//  if(this.MaxMessageChains > 10)
//  {
//      var mmc_issue = "Max message chain detected in function - " + this.FunctionName + " (Chain Length: " + this.MaxMessageChains + ")"; 
//      console.log(chalk.greenBright(mmc_issue));
//      console.log("============================= ----------------------- =============================");
//  }

//  if(this.MaxNestingDepth > 5)
//  {
//      var mnd_issue = "Maximum Nesting Depth exceeded in function - " + this.FunctionName + " (Nesting Depth: " + this.MaxNestingDepth + ")";
//      console.log(chalk.blueBright(mnd_issue));
//      console.log("============================= ----------------------- =============================");
//  }

//     console.log();
  }
}

// A builder for storing file level information.
function FileBuilder() {
  this.FileName = "";
  // Number of strings in a file.
  this.Strings = 0;
  // Number of imports in a file.
  this.ImportCount = 0;

  this.report = function () {
    console.log(
      chalk`{magenta.underline ${this.FileName}}
Packages: ${this.ImportCount}
Strings ${this.Strings}
`
    );
  };
}

// A function following the Visitor pattern.
// Annotates nodes with parent objects.
function traverseWithParents(object, visitor) {
  var key, child;

  visitor.call(null, object);

  for (key in object) {
    if (object.hasOwnProperty(key)) {
      child = object[key];
      if (typeof child === "object" && child !== null && key != "parent") {
        child.parent = object;
        traverseWithParents(child, visitor);
      }
    }
  }
}

// Helper function for counting children of node.
function childrenLength(node) {
  var key, child;
  var count = 0;
  for (key in node) {
    if (node.hasOwnProperty(key)) {
      child = node[key];
      if (typeof child === "object" && child !== null && key != "parent") {
        count++;
      }
    }
  }
  return count;
}

// Helper function for checking if a node is a "decision type node"
function isDecision(node) {
  if (
    node.type == "IfStatement" ||
    node.type == "ForStatement" ||
    node.type == "WhileStatement" ||
    node.type == "ForInStatement" ||
    node.type == "DoWhileStatement"
  ) {
    return true;
  }
  return false;
}

// Helper function for printing out function name.
function functionName(node) {
  if (node.id) {
    return node.id.name;
  }
  return "anon function @" + node.loc.start.line;
}

main();
exports.main = main;