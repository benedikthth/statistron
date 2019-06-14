let functionPresets = [


{name: 'plain', f: 'return x'},


{name: 'pdf', f:
`let sigma = 1; let mean = 0;
let t = ( 1 / ( Math.sqrt( 2*Math.PI*(sigma*sigma) )))
let e = ( (-Math.pow(x-mean, 2)/ 2*sigma*sigma ))

return (t * Math.pow(Math.E,e) )`},



{name: 'funky_sine', f:
`return (
    sin( x +now()/1000) +
    sin( x*10 + now()/250)/4 
)`},
    

{name: 'boobie_func', f: 
`return Math.max(
    Math.max( Math.max(0, sin(x)), -(((4*x)-(2*Math.PI))**2)+1.1),
    Math.max( Math.max(0, sin(-x)), -(((4*x)+(2*Math.PI))**2)+1.1),
    0.1
)`},
    
    
{name:'sawtooth', f:
`let n = now()/1000
x = x-n
let p = 1 //+ (sin(now()/100)+1)/2;

let txp = Math.floor((2*x/p) + 0.5)

let fp = x - (p/2) * txp 
let sp = (-1)**txp 

return (4/p * fp * sp)`},

{name: 'timed_sine', f: 
`return sin(x + now()/1000)`}
]
