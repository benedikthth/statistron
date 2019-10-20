

let visualizer = {
	ctx: plotter.getContext('2d'),
	width: plotter.scrollWidth,
	height: plotter.scrollHeight,
	aspect_ratio: this.width/this.height,
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
		plotter.addEventListener('onresize', this.changeSize.bind(this))
		this.get_plot_dimension()
	},

	get_plot_dimension: function(){
		this.width = plotter.scrollWidth;
		this.height= plotter.scrollHeight;
		this.aspect_ratio = this.width/ this.height;
		plotter.height = this.height
		plotter.width = this.width
	},

	mouse : {x: 0, y: 0},
	mouse_down : false,
	mouse_down_pos : null,
	mouse_down_bounds : null,

	changeSize: function(event){
		console.log(event);
		
	},

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
		
		xptct = (x/this.width)
		yptct = ((this.height-y)/this.height) 
		
		return {
			x: ((xptct * xrange)+this.bounds.xMin) , 
			y: (yptct * yrange)+this.bounds.yMin
		}
		
	},


	zoom: function(ev){
		ev.preventDefault()
		delta = ev.deltaY
		zoomAmount = 1.5
		zoom = (Math.sign(delta) == 1) ? zoomAmount : 1/zoomAmount;

		middleY = (this.bounds.yMax + this.bounds.yMin) / 2
		middleX= (this.bounds.xMax + this.bounds.xMin) / 2
		xMaxVal = this.bounds.xMax - middleX;
		xMinVal = middleX - this.bounds.xMin; 
		yMaxVal = this.bounds.yMax - middleY;
		yMinVal = middleY - this.bounds.yMin; 

		this.bounds.xMax = middleX + (zoom * xMaxVal)
		this.bounds.xMin = middleX - (zoom * xMinVal)
		this.bounds.yMax = middleY + (zoom * yMaxVal)
		this.bounds.yMin = middleY - (zoom * yMinVal) 


		// if(Math.sign(delta) == 1){
		// 	this.bounds.xMax  zoomAmount
		// 	this.bounds.xMin *= zoomAmount
		// 	this.bounds.yMax *= zoomAmount
		// 	this.bounds.yMin *= zoomAmount
		// } else {
		// 	this.bounds.xMax *= zoomOut 
		// 	this.bounds.xMin *= zoomOut
		// 	this.bounds.yMax *= zoomOut
		// 	this.bounds.yMin *= zoomOut
		// }
		this.represent()
	},

	onHover: function(ev){
		// console.log(event.offsetX, event.offsetY);
		
		this.mouse = this.vtwc(event.offsetX, event.offsetY);
		if(this.mouse_down){
			if( Math.sqrt( Math.pow(ev.movementX, 2) + Math.pow(ev.movementY, 2)  ) < 1.5){
				return;
			}
			delta = posAdd(this.mouse_down_pos, posNeg(this.mouse)) // mdpos - mouse -> vector of mag. 
			dwi = 0.001

			this.bounds.xMin = (this.mouse_down_bounds.xMin + delta.x*0.7)
			this.bounds.yMin = (this.mouse_down_bounds.yMin + delta.y*0.7)
			this.bounds.xMax = (this.bounds.xMin + (this.mouse_down_bounds.xMax - this.mouse_down_bounds.xMin))
			this.bounds.yMax = (this.bounds.yMin + (this.mouse_down_bounds.yMax - this.mouse_down_bounds.yMin)) 
			
			this.represent()
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

	
	boundChange : function(input){
		this.bounds[input.name] = Number(input.value)
		this.middle = [
			
			(this.xmin + this.xmax)/2, //x
			(this.ymin + this.ymax)/2  //y
		]
	},
		
	


	origin: {x:plotter.scrollWidth/2, y:plotter.scrollHeight/2 },

	/**
	 * World to window coordinates. 
	 * @param {*} x 
	 * @param {*} y 
	 */
	wmtx: function(x, y){

		
		//discover the range of the bounds. (how much 'distance is between xmin, xmax')
		xrange = (this.bounds.xMax - this.bounds.xMin)// range of x
		yrange = (this.bounds.yMax - this.bounds.yMin)// range of y
		//move x y back on the ranges
		x = x-this.bounds.xMin
		y = y-this.bounds.yMin


		rx = x/xrange

		ry = y/yrange 

		x = rx * this.width 
		y = ry * this.height 
		
		return [
			x, 
			(this.height-y) 
		];
	 
	},

   
	bounds: {
		xMax: 4,
		xMin: -4,
		yMax: 4,
		yMin: -4
	},

	middle: [0, 0],

	scale: Number(sampling_frequency.value),

	/**
	 * Change the y boundaries to match the aspect ratio of the cavas.
	 */
	change_ybound_to_AR: function(){
		this.get_plot_dimension();
		let xrange = this.bounds.yMax - this.bounds.xMin;
		let yrange = this.bounds.yMax - this.bounds.yMin;
		// this.aspect_ratio = width / height
		let desired_yrange = xrange / this.aspect_ratio
		let ratio = yrange / desired_yrange
		this.bounds.yMax /= ratio;
		this.bounds.yMin /= ratio;
		this.represent()
	},

	/**
	 * Change the x boundaries to match AR of canvas
	 */
	change_xbound_to_AR: function(){

		this.get_plot_dimension();
		let xrange = this.bounds.yMax - this.bounds.xMin;
		let yrange = this.bounds.yMax - this.bounds.yMin;
		// this.aspect_ratio = width / height
		let desired_xrange = yrange * this.aspect_ratio
		let ratio = xrange / desired_xrange
		this.bounds.xMax /= ratio;
		this.bounds.xMin /= ratio;
		this.represent()
	},

	update: function(){
		
		this.ctx.font = "14px Cascadia Code";

		this.get_plot_dimension()
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
		
		let sf = Number(sampling_frequency.value);
		if(sf > 0){
			//plot the functions
			for (let i = 0; i < functionList.length; i++) {
				const fObject = functionList[i];
				this.plotFunc(fObject, sf)
			}
		}


		this.ctx.fillStyle = "#FFFFFF"
		// this.ctx.strokeText(posY.toPrecision(1), po[0]-11, po[1]+5);
		// this.ctx.font = "14px Cascadia Code";
		
		this.ctx.fillText(`${this.mouse.x.toFixed(2)}, ${this.mouse.y.toFixed(2)}`, mou[0], mou[1]);
		
		requestAnimationFrame(this.update.bind(this))

	},
	/**
	 * Takes a function object with some options and a pdf and sampling_frequency which is the number of datapoints per unit. 
	 */
	plotFunc: function(fObject, sampling_frequency){ 

			if(!fObject.enabled){
				return;
			}

			if(typeof(fObject.pdf) == 'undefined'){
				return
			}
			let oldLineWidth = this.ctx.lineWidth; 
			// let screen_width = this.bounds.xMax - this.bounds.xMin;
			//let no_data_points = sampling_frequency * screen_width;

			let scale = 1/sampling_frequency; 

			this.ctx.strokeStyle = fObject.color;
			
			this.ctx.lineWidth = fObject.width;
			this.ctx.beginPath()
			this.ctx.lineCap = "round"
			for(var x = this.bounds.xMin-scale; x < this.bounds.xMax+ (1/scale) ; x+=scale){
				try{ 
					let former = fObject.pdf(x-scale)
					let yVal = fObject.pdf(x)
					
					// let xy = this.wmtx(x-scale, former)
					// this.ctx.arc(xy[0], xy[1], 1, 0, 2*Math.PI)
					
					this.moCtx( this.wmtx(x-scale, former)) ;
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
			this.ctx.lineWidth = oldLineWidth;	
			if(typeof(posY) != 'number'){
				return
			}
			po = this.wmtx(this.mouse.x, posY )

			//find tangent line 
			dxdy = [fObject.pdf(this.mouse.x+ (1/this.scale) ) - fObject.pdf(this.mouse.x-(1/this.scale)), 2*(1/this.scale)]
			
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
			this.ctx.font = "14px Cascadia code";
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
		this.ctx.strokeStyle = '#05633f7F';
		this.ctx.lineWidth = 3
		this.ctx.moveTo(lhs[0], lhs[1]);
		this.ctx.lineTo(rhs[0], rhs[1]);
		this.ctx.moveTo(ths[0], ths[1]);
		this.ctx.lineTo(bhs[0], bhs[1]);
		this.ctx.stroke()
		this.ctx.closePath()
		this.ctx.lineWidth = 1;

		
		this.ctx.strokeStyle = '#006000';

		this.ctx.beginPath()


		maxNotch = 9;
		let height = this.bounds.yMax - this.bounds.yMin;
		let notchDist = height / maxNotch; 
		if(height > 4){
			notchDist = notchDist - (notchDist%0.25)
		} else { 
			notchDist = 0.25;
		}
			
		//notches
		for(var i = this.bounds.yMin - (this.bounds.yMin % notchDist); i < this.bounds.yMax ; i+=notchDist){
			if (i == 0){
				continue;
			}
			let loc = this.wmtx(0, i)[1]
			//create line from far-left to far right
			this.moCtx([0, loc])
			this.liTo([plotter.scrollWidth, loc])
			// conditionally draw number
			if(i%1 == 0){
				this.ctx.fillStyle = "#00F000"
				this.ctx.font = "4px";
				let xy = this.wmtx(0.25, i)
				this.ctx.fillText(i, xy[0], xy[1]-4);
			}
		}
		

		let width = this.bounds.xMax - this.bounds.xMin;
		//max 100 notches . 

		notchDist = width/maxNotch;
		notchDist = (width > 4)? notchDist - (notchDist % 0.25) : 0.25; 

		for(var i = this.bounds.xMin - (this.bounds.xMin % notchDist); i < this.bounds.xMax; i+=notchDist){
			if(i == 0 ){
				continue;
			}	
			let loc = this.wmtx(i, 0)[0]
			this.moCtx([loc, 0])//this.wmtx(i, notchLen));
			this.liTo([loc, plotter.scrollHeight])//this.wmtx(i, -notchLen));
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

