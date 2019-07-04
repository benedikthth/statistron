

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
		sampling_frequency.addEventListener('input', this.changeSamplingFrequency.bind(this))
		this.represent()
		plotter.addEventListener('mousemove' , this.onHover.bind(this))
		plotter.addEventListener('mousedown', this.onMouseDown.bind(this))
		plotter.addEventListener('mouseup', this.onMouseUp.bind(this))
		plotter.addEventListener('wheel', this.zoom.bind(this))
	},

	mouse : {x: 0, y: 0},
	mouse_down : false,
	mouse_down_pos : null,
	mouse_down_bounds : null,

	changeSamplingFrequency: function(event){
		this.scale = Number(sampling_frequency.value)
	},

	/**
	 * Converts from view space to world space.
	 * @param {*} x position of mouse in view matrix space
	 * @param {*} y position -||- 
	 */
	vtwc: function(x, y ){
		
		xrange = (this.bounds.xMax - this.bounds.xMin);
		yrange = (this.bounds.yMax - this.bounds.yMin);
		
		xptct = (x/this.width);
		yptct = ((this.height-y)/this.height);
		
		return {
			x: (xptct * xrange)+this.bounds.xMin, 
			y: (yptct * yrange)+this.bounds.yMin
		}
		
	},


	zoom: function(ev){
		console.log(ev);
		delta = ev.deltaY
		zoomAmount = 1.5
		zoomOut = 1/zoomAmount
		if(Math.sign(delta) == 1){
			this.bounds.xMax *= zoomAmount
			this.bounds.xMin *= zoomAmount
			this.bounds.yMax *= zoomAmount
			this.bounds.yMin *= zoomAmount
		} else {
			this.bounds.xMax *= zoomOut 
			this.bounds.xMin *= zoomOut
			this.bounds.yMax *= zoomOut
			this.bounds.yMin *= zoomOut
		}
		this.represent()
	},

	onHover: function(ev){
		this.mouse = this.vtwc(event.offsetX, event.offsetY);
		// console.log(this.mouse_down_pos)
		// console.log(event)
		if(this.mouse_down){
			if( Math.sqrt( Math.pow(ev.movementX, 2) + Math.pow(ev.movementY, 2)  ) < 1.5){
				return;
			}
			delta = posAdd(this.mouse_down_pos, posNeg(this.mouse)) // mdpos - mouse -> vector of mag. 
			dwi = 0.001

			this.bounds.xMin = (this.mouse_down_bounds.xMin + delta.x)
			this.bounds.yMin = (this.mouse_down_bounds.yMin + delta.y)
			this.bounds.xMax = (this.bounds.xMin + (this.mouse_down_bounds.xMax - this.mouse_down_bounds.xMin))
			this.bounds.yMax = (this.bounds.yMin + (this.mouse_down_bounds.yMax - this.mouse_down_bounds.yMin)) 
			
			this.represent()
			// console.log(this.bounds)	
		}

	},


	represent: function(){

		xMax.value = this.bounds.xMax;
		xMin.value = this.bounds.xMin;
		yMax.value = this.bounds.yMax;
		yMin.value = this.bounds.yMin;
	},
	
	onMouseDown: function(ev){
		this.mouse_down = true;
		this.mouse_down_pos = this.vtwc(event.offsetX, event.offsetY)
		this.mouse_down_bounds = {
			xMax: this.bounds.xMax, xMin: this.bounds.xMin,
			yMax: this.bounds.yMax, yMin: this.bounds.yMin, 
		}
	},
	
	onMouseUp: function(ev){
		this.mouse_down = false;
		this.mouse_down_pos = null;
		this.mouse_down_bounds = null;
	},

	reflect: function(){
		
	},
	
	boundChange : function(input){
		this.bounds[input.name] = Number(input.value)
		this.middle = [
			
			(this.xmin + this.xmax)/2, //x
			(this.ymin + this.ymax)/2  //y
		]
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

	scale: Number(sampling_frequency.value),




	update: function(){
		mouseColor = "#AA0000"
		//plot the grid and the axis
		this.PrepGraph();
		
		this.ctx.beginPath()
		mou = this.wmtx(this.mouse.x, this.mouse.y)

		this.ctx.strokeStyle = mouseColor;
		this.moCtx(this.wmtx(this.mouse.x, this.bounds.yMax))
		this.liTo(this.wmtx(this.mouse.x, this.bounds.yMin))
		this.ctx.stroke()
		this.ctx.closePath()
		
		//plot the functions
		for (let i = 0; i < functionList.length; i++) {
			const fObject = functionList[i];
			this.plotFunc(fObject)
		}

		requestAnimationFrame(this.update.bind(this))

	},

	plotFunc: function(fObject){ 

			if(!fObject.enabled){
				return;
			}

			if(typeof(fObject.pdf) == 'undefined'){
				return
			}

			this.ctx.strokeStyle = fObject.color;
	
			this.ctx.beginPath()
			for(var x = this.bounds.xMin+this.scale; x < this.bounds.xMax; x+=this.scale){
				try{ 
				let former = fObject.pdf(x-this.scale)
				let yVal = fObject.pdf(x) //, mean.value, sigma.value)
				
				this.moCtx( this.wmtx(x-this.scale, former)) ;
				this.liTo(  this.wmtx(x, yVal) )
				} catch(e){

					return;
				}
			}
			this.ctx.stroke();  
			this.ctx.closePath();

			this.ctx.beginPath();
			// this.ctx.strokeStyle = mouseColor;
			posY = fObject.pdf(this.mouse.x) 
			if(typeof(posY) != 'number'){
				return
			}
			po = this.wmtx(this.mouse.x, posY )

			//find tangent line 
			dxdy = [fObject.pdf(this.mouse.x+this.scale) - fObject.pdf(this.mouse.x-this.scale), 2*this.scale]
			ldxdy = Math.sqrt(Math.pow(dxdy[0],2)+Math.pow(dxdy[1], 2))
			dxdy = [dxdy[0]/ldxdy, dxdy[1]/ldxdy]
			lilen = 30
			dxdy = [dxdy[0]*lilen, dxdy[1]*lilen]
			textpos = [po[0]-dxdy[0], po[1]-dxdy[1]]
			this.ctx.beginPath()
			this.moCtx(po)
			this.liTo(textpos)
			this.ctx.stroke()
			this.ctx.closePath()

			this.ctx.fillStyle = "#FFFFFF"
			// this.ctx.strokeText(posY.toPrecision(1), po[0]-11, po[1]+5);
			this.ctx.font = "14px Georgia";
			this.ctx.fillText(posY.toFixed(2), textpos[0]-20, textpos[1]);
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
		for(var i = this.bounds.yMin - (this.bounds.yMin % 0.25); i < this.bounds.yMax ; i+=0.25){
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
		
		for(var i = this.bounds.xMin - (this.bounds.xMin % 0.25); i < this.bounds.xMax; i+=0.25){
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

/**
 * Adds a vector to another vector
 * @param {{x, y}} p1 
 * @param {{x, y}} p2 
 */
function posAdd(p1, p2){
	return {
		x: p1.x + p2.x,
		y: p1.y + p2.y
	}
}

/**
 * Negates a vector
 * @param {{x, y}} p1 
 */
function posNeg(p1){
	return {
		x: -p1.x,
		y: -p1.y
	}
}

visualizer.init()
visualizer.update()

