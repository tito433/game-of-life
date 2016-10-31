function GameOfLife(canvas){
	var parent=canvas.parentNode;
	
	canvas.width=parent.clientWidth;
    canvas.height=parent.clientHeight;

    var size=10;
    this.bounds=canvas.getBoundingClientRect();
    this.width=canvas.width;
    this.height=canvas.height;
	this._ctx=canvas.getContext("2d");
	this.speed=100;

	this.draw=function(){
		this._ctx.clearRect(0,0,this.width,this.height);
		for (var y = 0,ny=this.cells.length; y < ny; y++) {
			for(var x=0,nx=this.cells[y].length;x<nx;x++){
				var dx=x*size,dy=y*size;
				this._ctx.beginPath();;
				this._ctx.rect(dx,dy,size,size);
				if(this.cells[y][x]===true){
					this._ctx.fill();
				}else{
					this._ctx.stroke();
				}
				
			}
		}
	}
	this.run=function(){
		var cells=this._createCells();

		var deltas =[{x:-1, y:-1}, {x:0, y:-1}, {x:1, y:-1},
               {x:-1, y:0},               {x:1, y:0},
               {x:-1, y:1},  {x:0, y:1},  {x:1, y:1}];

		for (var y = 0,ny=this.cells.length; y < ny; y++) {
			for(var x=0,nx=this.cells[y].length;x<nx;x++){
				
				var neighbours=[];
				for(var di in deltas){
					var delta=deltas[di];
				    if (x+delta.x >= 0 && x + delta.x < nx &&
				        y+delta.y >= 0 && y + delta.y < ny){
				    	var val=this.cells[y + delta.y][x + delta.x];
				    	val=val==undefined || val==false?0:1;
					    neighbours.push(val);
					}
				}
				
				var nl=neighbours.reduce((a,b)=>a+b,0);
				var life=this.cells[y][x]||false;
				
				if(life && nl<2) life=false;
				else if(life && nl>3) life=false;
				else if(!life && nl==3) life=true;

				cells[y][x]=life;
			}
		}
		this.cells=cells;
		this.draw();
	}

	this._createCells=function(){
		var cells=new Array(Math.floor(this.height/size));
		for (var i = 0; i < cells.length; i++) {
		  cells[i] = new Array(Math.floor(this.width/size));
		}
		return cells;
	}
	this.randomize=function(){
		this.cells=this._createCells();

		var initLife=20,
			my=this.cells.length,
			mx=this.cells[0].length;

		while(initLife--){
			var x=Math.floor(Math.random()*mx),
				y=Math.floor(Math.random()*my);
			if(this.cells[x] !=undefined)
				this.cells[x][y]=true;	
		}

	}

	this.start=function(){
		this._timer=setInterval(this.run.bind(this),this.speed);
	}
	this.step=function(){
		this.run();
	}
	this.stop=function(){
		clearInterval(this._timer);
	}

	this._onClick=function(evt){
		var x=evt.clientX - this.bounds.left,
            y=evt.clientY - this.bounds.top,
        	xt=Math.floor(x/size),
        	yt=Math.floor(y/size);
        if(this.cells[xt]){
        	var v=this.cells[yt][xt]||false;
        	this.cells[yt][xt]=!v;
        }
        this.draw();
	}

	this.cells=this._createCells();
	canvas.addEventListener("mouseup", this._onClick.bind(this), false);
}
