require('yargs')
  .usage('$0 <cmd> [args]')
  .command('area [type]', "calc area", (yargs) => 
  {
    yargs.positional('type', {
      type: 'string',
      default: 'rect',
      describe: 'The type of shape to calculate area.'
    })
    .option("w", {
      describe: "The width of the area.",
      type: "number"
    })
    .option("h", {
      describe: "The height of the area.",
      type: "number"
    })
    .option("r", {
      describe:" The radius of the circle",
      type:"number"
      })
    .option("v", {
      describe:"The arguments received",
      nargs:0
      })
  }, function (argv) { calc(argv) } )
  .help()
  .argv
  
function calc(argv) {
  // Unpack into variables
  let {v,w,h,r,type} = argv;
  console.log("--------------------");
  if( type == "rect") {
    if(v)
    {      
      console.log("Arguments received:");
      console.log("Type:"+type);
      console.log("Width:"+w);
      console.log("Height:"+h);
    }
    console.log( `The calculated Area: ${w * h}`);
  }
  if(type == "circle") {
    if(v)
    {
    console.log("Arguments received:");
    console.log("Type:"+type);
    console.log("Radius:"+r);
    }
    console.log(`The calculated Area: ${Math.PI * r * r}`);
  }
}