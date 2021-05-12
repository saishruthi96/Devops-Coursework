var fs = require('fs'),
    xml2js = require('xml2js'),
    child  = require('child_process'),
    chalk = require('chalk');
var parser = new xml2js.Parser();
var Bluebird = require('bluebird')


function getTestReport(testdir) {
    // '/simplecalc/target/surefire-reports/TEST-com.github.stokito.unitTestExample.calculator.CalculatorTest.xml';

    let testReportBase = `${testdir}/target/surefire-reports/`;
    const files = fs.readdirSync(testReportBase);
 
    const filename = files.find((file) => {
      // return the first xml file in directory
      return file.includes('.xml');
    });

    console.log( chalk.green(`Found test report ${filename}`) );
    return testReportBase + filename;
}

async function getTestResults(testReport)
{
    var contents = fs.readFileSync(testReport)
    let xml2json = await Bluebird.fromCallback(cb => parser.parseString(contents, cb));
    let tests = readMavenXmlResults(xml2json);
    return tests;
}

async function calculateTestPriority(testsuite_dir)
{
    try {

        return new Promise( function(resolved, rejected) 
        {
            let mvn = child.exec('mvn test', {cwd: testsuite_dir});
            mvn.stdout.pipe( process.stdout );
            mvn.stderr.pipe( process.stderr );

            mvn.once('exit', async (exitCode) => 
            {
                let testReport = getTestReport(testsuite_dir);
                let tests = await getTestResults(testReport);
                tests.sort(function (a, b) {
                    return ((a.status == b.status) ? a.time-b.time : ((a.status > b.status) ? 1 : -1 ));});
                tests.forEach( e => console.log(e));

                resolved();
            });
        });


    } catch(e) {
        console.log( chalk.red(`Error: Calculating priority of tests:\n`) + chalk.grey(e.stack));
    }
}

async function calculateFlakyTests(testsuite_dir, iterations)
{
    var flaky = new Map();   
       
        for( var i = 0; i < iterations; i++ )
        {
            try{
            child.execSync('mvn test', {cwd: testsuite_dir});
            }catch(e){}
            let testReport = getTestReport(testsuite_dir);
            let tests = await getTestResults(testReport);
            for(let test of tests){
                if(!flaky.has(test.name))
                {
                            flaky.set(test.name,[0,0]);
                }

                var val =flaky.get(test.name);               
                if(test.status== 'passed')
                {
                    val[0]+=1;
                    
                }
                else
                {
                    val[1]+=1;
                }
               
                flaky.set(test.name,val);
                
        }            
        }

            for (const [key, value] of flaky.entries()) {             
                var score = Math.min(value[0],value[1])/(value[0]+value[1]);
                    console.log(key+":"+score);
            }            
}


function readMavenXmlResults(result)
{
    var tests = [];
    for( var i = 0; i < result.testsuite['$'].tests; i++ )
    {
        var testcase = result.testsuite.testcase[i];
        
        tests.push({
        name:   testcase['$'].name, 
        time:   testcase['$'].time, 
        status: testcase.hasOwnProperty('failure') ? "failed": "passed"
        });
    }    
    return tests;
}

module.exports.calculateFlakyTests = calculateFlakyTests;
module.exports.calculateTestPriority = calculateTestPriority;