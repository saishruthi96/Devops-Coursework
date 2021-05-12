const Random = require('random-js');

class fuzzer {
    static random() {
        return fuzzer._random || fuzzer.seed(0)
    }
    
    static seed(kernel) {
        fuzzer._random = new Random.Random(Random.MersenneTwister19937.seed(kernel));
        return fuzzer._random;
    }

    static mutateFile(filePath) {
        //calculate the 10% contribution        
        var file_content = filePath.split("\n");
        var tc = 0.1 * file_content.length;
        var counter = 0;
        //Pick subset of operation
        // var pick_operation = Math.floor((Math.random() * 2) );      
        for(var i = 0; i < file_content.length; i++) {
            var line = file_content[i];            
            if(counter == tc) {
                break;
            }
            
                if(line.includes("==")) {
                    line = line.replace("==", "!=");
                    counter++;
                }
                else if(line.includes("!=")) {
                    line = line.replace("!=", "==");
                    counter++;
                }
                if(counter >= tc) {
                    break;
                }

                var regex = /(?<=\")(.)+(?=\")/i;
                var randomString = fuzzer.random().string(10)
                var next = line.replace(regex, randomString);
                if(line != next) {
                    line = next;
                    counter++;
                }
                if(counter >= tc) {
                    break;
                }

                if(fuzzer.random().bool(0.3)) 
                {
                    var regex = /(?<![a-z>?\-])(>)|(<)(?![a-z?<]+)/i;
                    var result = regex.exec(line)
                    if(result != null) {
                        if(line.includes(">")) {
                            line = line.replace(">", "<");
                            counter++;
                        } else if(line.includes("<")) {
                            line = line.replace("<", ">");
                            counter++;
                        }
                    }
                    if(counter >= tc) {
                        break;
                    }

                    if(line.includes("true")) {
                        line = line.replace("true", "false");
                        counter++;
                    } else if(line.includes("false")) {
                        line = line.replace("false", "true");
                        counter++;
                    }
                    if(counter >= tc) {
                        break;
                    }
            } 
             else if(fuzzer.random().bool(0.7)) 
             {
                if(line.includes("0")) {
                    line = line.replace("0", "1");
                    counter++;
                } else if(line.includes("1")) {
                    line = line.replace("1", "0");
                    counter++;
                }
                if(counter >= tc) {
                    break;
                }
                if(line.includes("||")) {
                    line = line.replace("||", "&&");
                    counter++;
                } else if(line.includes("&&")) {
                    line = line.replace("&&", "||");
                    counter++;
                }
                if(counter >= tc) {
                    break;
                }                
            }

            if(line != '\r'){
                line += '\n';
            }     
            file_content[i] = line;           
        }
        var mod_file = file_content.join("");        
        return mod_file;
    }

    
};

exports.fuzzer = fuzzer;
exports.mutateFile = fuzzer.mutateFile;
exports.random = fuzzer.random;