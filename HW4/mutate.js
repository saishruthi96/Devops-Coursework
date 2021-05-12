
function mutateString (mutator, val) {

    // Step 3. Replace single quotes strings with integers
    if( mutator.random().bool(0.50) )
    {
        let rand_num = mutator.random().integer(0,10);
        val = val.replace(/'/g,rand_num);
    }

    var array = val.split('');
    // array.reverse();
    do{
        if( mutator.random().bool(0.25) )
        {
            // Step 1. Randomly remove a random set of characters, from a random start position.
            var position = mutator.random().integer(0,array.length);
            var num = mutator.random().integer(0,array.length-position);
            array.splice(position,num);
        }
        if( mutator.random().bool(0.25) )
        {
            // Step 2. Randomly add a set of characters.
            let char_len = mutator.random().integer(10,20);
            let position = mutator.random().integer(0,array.length);
            let random_chars = mutator.random().string(char_len).split('');
            array.splice(position,0,...random_chars);
        }
    }while(mutator.random().bool(0.25));

    return array.join('');
}

exports.mutateString = mutateString;
