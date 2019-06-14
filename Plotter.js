

let visualizer = {
    ctx: plotter.getContext('2d'),
    width: plotter.width,
    height: plotter.height,

    init : function(){ 
        //bind bounds inputs.
        xMin.oninput = this.boundChange.bind(this, xMin)
        xMax.oninput = this.boundChange.bind(this, xMax)
        yMin.oninput = this.boundChange.bind(this, yMin)
        yMax.oninput = this.boundChange.bind(this, yMax)
        xMin.value = this.bounds.xMin;
        xMax.value = this.bounds.xMax;
        yMin.value = this.bounds.yMin;
        yMax.value = this.bounds.yMax;
    },

    boundChange : function(input){
        // console.log(input.value, input.name);
        this.bounds[input.name] = Number(input.value)
        this.middle = [
            
            (this.xmin + this.xmax)/2, //x
            (this.ymin + this.ymax)/2  //y
        ]
    },
        
    pdf: function(x){
        return Math.tan(x)
    },


    origin: {x:plotter.width/2, y:plotter.height/2 },


    wmtx: function(x, y){

        
        //discover the range of the bounds. (how much 'distance is between xmin, xmax')
        xrange = (this.bounds.xMax - this.bounds.xMin)// range of x
        yrange = (this.bounds.yMax - this.bounds.yMin)// range of y
        
        //move x y back on the ranges
        x = x-this.bounds.xMin
        y = y-this.bounds.yMin


        rx = x/xrange
        ry = y/yrange 

        x = rx * plotter.width
        y = ry * plotter.height
        
        return [
            x,
            plotter.height-y 
        ];
     
    },

   
    bounds: {
        xMax: 4,
        xMin: -4,
        yMax: 2,
        yMin: -2
    },

    middle: [0, 0],

    scale: 0.01,




    update: function(){

        //plot the grid and the axis
        this.PrepGraph();
        

        //plot the functions
        for (let i = 0; i < functionList.length; i++) {
            const fObject = functionList[i];

            if(!fObject.enabled){
                continue;
            }

            this.ctx.strokeStyle = fObject.color;
    
            this.ctx.beginPath()
            for(var x = this.bounds.xMin+this.scale; x < this.bounds.xMax; x+=this.scale){
                
                let former = fObject.pdf(x-this.scale)
                let yVal = fObject.pdf(x) //, mean.value, sigma.value)
                
                this.moCtx( this.wmtx(x-this.scale, former)) ;
                this.liTo(  this.wmtx(x, yVal) )
                
            }
            this.ctx.stroke();  
            this.ctx.closePath()
            
        }

        

        requestAnimationFrame(this.update.bind(this))

    },

    PrepGraph: function(){
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0,0, this.width, this.height)
        

        lhs = this.wmtx(this.bounds.xMin,0);
        rhs = this.wmtx(this.bounds.xMax, 0);
        ths = this.wmtx(0, this.bounds.yMin);
        bhs = this.wmtx(0, this.bounds.yMax);
        
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.moveTo(lhs[0], lhs[1]);
        this.ctx.lineTo(rhs[0], rhs[1]);
        this.ctx.moveTo(ths[0], ths[1]);
        this.ctx.lineTo(bhs[0], bhs[1]);
        this.ctx.stroke()
        this.ctx.closePath()


        
        this.ctx.strokeStyle = '#006000';

        this.ctx.beginPath()
        let notchLen = Math.max(Math.max(this.bounds.xMax, this.bounds.xMin), Math.max(this.bounds.yMin, this.bounds.yMax))
        
        //notches
        for(var i = this.bounds.yMin - (this.bounds.yMin % 1); i < this.bounds.yMax ; i+=0.25){
            let loc = this.wmtx(0, i)[1]
            //create line from far-left to far right
            this.moCtx([0, loc])
            this.liTo([plotter.width, loc])
            // conditionally draw number
            if(i%1 == 0){
                this.ctx.fillStyle = "#00F000"
                this.ctx.font = "8px";
                let xy = this.wmtx(0.25, i)
                this.ctx.fillText(i, xy[0], xy[1]-4);
            }
        }
        
        for(var i = this.bounds.xMin - (this.bounds.xMin % 1); i < this.bounds.xMax; i+=0.25){
            let loc = this.wmtx(i, 0)[0]
            this.moCtx([loc, 0])//this.wmtx(i, notchLen));
            this.liTo([loc, plotter.height])//this.wmtx(i, -notchLen));
            
            if(i%1 == 0 && i!=0){
                this.ctx.fillStyle = "#00F000"
                this.ctx.font = "8px";
                let xy = this.wmtx(i, 0.1)
                this.ctx.fillText(i, xy[0]-4, xy[1]-4);
            }
        }

        this.ctx.stroke();
        this.ctx.closePath()

    },
    

    moCtx: function(pos){
        this.ctx.moveTo(pos[0], pos[1])
    },
    liTo: function(pos){
        this.ctx.lineTo(pos[0], pos[1])
    }



}
visualizer.init()
visualizer.update()

