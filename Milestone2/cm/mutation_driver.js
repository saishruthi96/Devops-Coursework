var fs = require('fs');
var xml2js = require('xml2js');
var child  = require('child_process'); 
var parser = new xml2js.Parser();
var Bluebird = require('bluebird')
const path = require('path');
const fuzzer = require('./fuzzer')
const chalk = require('chalk');
const codePath = 'iTrust2-v8/iTrust2/src/main/java/edu/ncsu/csc/iTrust2';
const testPath = 'iTrust2-v8/iTrust2/target/surefire-reports';
var count =0; 
var dirPath=null;

if( process.env.NODE_ENV != "test")
{   
    iterations = Number.parseInt(process.argv[2], 10);
    run(iterations);
}

async function run(iterations=100) {

    var files = [];
    var fuzzfiles=[];
    await getFiles(codePath, files);
    await findFuzzFiles(files,fuzzfiles);  
    testResults = await mutation_driver(fuzzfiles, iterations);
    orderedTestNames = await test_prioritization(testResults);
    await saveReports(orderedTestNames, testResults,iterations); 
}

// Finding the files that are Fuzzable
function findFuzzFiles(files,fuzzfiles)
{
    for(var fpath of files){        
        var data = fs.readFileSync(fpath, 'utf-8');
        var regex = /==|&&|!=|^[0-1]|true|false/g;
        var generic_regrx = /(?<![a-z>?\-])(>)|(<)(?![a-z?<]+)/gi;      
        if(generic_regrx.test(data) || regex.test(data) || (data.includes("||")))
            fuzzfiles.push(fpath);            
        }        
    }  
function reset_repo(){
    try{
        console.log('....... RESETTING ITRUST2 REPOSITORY\n');
        child.execSync('cd / && cd /home/vagrant/iTrust2-v8/iTrust2 && git reset --hard HEAD');
    }
    catch(e) {
        console.log(chalk.redBright(e));
    }
}

function getFiles(directory, files, regex=null){
    var dir = fs.readdirSync(directory, 'utf8')
    dir.forEach(file => {
        var pathOfCurrentItem = path.join(directory + '/' + file);
        if (fs.statSync(pathOfCurrentItem).isFile() && (regex == null || regex.exec(file) != null)) {
            files.push(pathOfCurrentItem);
        }
        else if (!fs.statSync(pathOfCurrentItem).isFile()){
            var directorypath = path.join(directory + '/' + file);
            getFiles(directorypath, files, regex);
        }
    });
}

async function mutation_driver(filePaths,iterations)
{           
    var testMap = {}
    if( !fs.existsSync('.mutations') )
        {
            fs.mkdirSync('.mutations');
        }
        
    for (var i = 1; i <= iterations; i++) {
        console.log(chalk(`=========== ITERATION ${i}/${iterations} ===========\n`));
        var error = null
        file_num = fuzzer.random().integer(0, filePaths.length-1);
         dirPath = `    - .mutations/${i}/iTrust2/`;
        
        try
        {
            console.log('....... Dropping existing database');
            await child.execSync(`mysql --defaults-extra-file=/home/vagrant/mysql_config.txt -e 'DROP DATABASE IF EXISTS iTrust2_test'`);
          
            file = fs.readFileSync(filePaths[file_num], 'utf-8');
            fs.writeFileSync(filePaths[file_num], fuzzer.mutateFile(file));   
            console.log("Selected file"+filePaths[file_num]);       
          
            
            console.log(chalk.cyan('....... Running the tests'));
            await child.execSync('cd / && cd /home/vagrant/iTrust2-v8/iTrust2/src/main/resources && cp /home/vagrant/application.yml . && cd / && cd /home/vagrant/iTrust2-v8/iTrust2 && mvn clean test');
        }
        catch(e){
            error = e.stdout
        }
        finally {
            var regex = /compilation (error|failure)/i;
            var result = regex.exec(error);            
            if (result == null && fs.existsSync(testPath)) {
                var testReports = [];
                getFiles(testPath, testReports, /^TEST/);                
                testMap = await updateResultMap(testMap, testReports,i);
            }           
            else {
                if (result != null) {
                    console.log(chalk.redBright('..............COMPILATION ERROR.............. '));
                }
                else {
                    console.log(chalk.redBright('...............UNEXPECTED ERROR..............'));
                }
                console.log(chalk.redBright(`...............RE-RUNNING ITERATION ${i}...............`));             
                i--;
            }
            reset_repo(); 
        }   
    }
    return testMap;
}


async function updateResultMap(testMap, testReports,iteration){
  var created=false;
    for (testReport of testReports) {
        var contents = fs.readFileSync(testReport)       
        let xml2json = await Bluebird.fromCallback(cb => parser.parseString(contents, cb));
        var tests = readResults(xml2json);      
        for (var test of tests) {
            if (!testMap.hasOwnProperty(test.name)){
                testMap[test.name] = {name: test.name, passed: 0, failed: 0, paths:[]}
            }
            if (test.status == 'passed')
            {
                testMap[test.name].passed++;
            }
            else 
            {
                testMap[test.name].failed++;
                testMap[test.name].paths.push(dirPath);    
                if(!created){
                    count++;
                child.execSync(`cd /home/vagrant/.mutations && mkdir -p ${iteration} && cd ${iteration} && cp -R /home/vagrant/iTrust2-v8/iTrust2 .`);                
                created =true;
                }                
            }           
        }
    }
    return testMap;
}

function readResults(result)
{
    var tests = [];
    var classname = result.testsuite['$'].name;
    for( var i = 0; i < result.testsuite['$'].tests; i++ )
    {   
        var testcase = result.testsuite.testcase[i];
        var testname = testcase['$'].name;
        tests.push({
        name:   classname.concat('.', testname), 
        time:   testcase['$'].time, 
        status: testcase.hasOwnProperty('failure') ? "failed": "passed"
        });
    }    
    return tests;
}


async function insert(element, array, testMap) {
    array.splice(await locationOf(element, array, testMap), 0, element);
}

async function locationOf(element, array, testMap, start=0, end=array.length) {

    var pivot = Math.floor(start + (end - start) / 2);

    if (start == end) {
      return pivot
    }
    else if (testMap[array[pivot]].failed < testMap[element].failed) 
    {
      return locationOf(element, array, testMap, start, pivot);
    } 
    else if (testMap[array[pivot]].failed > testMap[element].failed)
    {
      return locationOf(element, array, testMap, pivot + 1, end);
    } 
    else {
        return pivot + 1
    }
  }

async function test_prioritization(testResults){
    var tests = [];
    for (test in testResults){
        if (tests.length == 0)
            tests.push(testResults[test].name)
        else {
            await insert(testResults[test].name, tests, testResults)
        }
    }
    return tests;
}
function saveReports(names, testResults,iterations) {
    var data = "";  
    var coverage = (count/iterations)*100;
    data +=`Overall mutation coverage: ${count}/${iterations} (${coverage}%) mutations caught by the test suite.\n`
    data +=`Useful tests\n`;
    data +=`============\n`;
    for (let name of names) {
        passed = Math.max(testResults[name].passed, iterations - testResults[name].failed);
        failed = testResults[name].failed;   
        data += `${failed}/${passed} ${name}\n`
        for(var p=0;p< testResults[name].paths.length;p++)
        {
          data += `${testResults[name].paths[p]} \n`;
        }
    } 
    console.log(chalk.green(data))
    fs.writeFileSync('mutation_report.txt', data, 'utf-8');
}