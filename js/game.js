function GameOfLife(canvas){
	var parent=canvas.parentNode;
	
	canvas.width=parent.clientWidth;
    canvas.height=parent.clientHeight;

    var size=10;
    this.bounds=canvas.getBoundingClientRect();
    this.width=canvas.width;
    this.height=canvas.height;
	this._ctx=canvas.getContext("2d");
	this.speed=500;

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
		var deltas =[
				{x:-1, y:-1}, {x:0, y:-1}, {x:1, y:-1},
               {x:-1, y:0},               {x:1, y:0},
               {x:-1, y:1},  {x:0, y:1},  {x:1, y:1}];

		for (var y = 0,ny=this.cells.length; y < ny; y++) {
			for(var x=0,nx=this.cells[y].length;x<nx;x++){
				var neighbours=[];
				for(var di in deltas){
					var delta=deltas[di];
				    if (x+delta.x < 0 || x + delta.x >= nx ||
				        y+delta.y < 0 || y + delta.y >= ny)
				        continue;

				    neighbours.push(this.cells[x + delta.x][y + delta.y]);
				}
				
				var nl=neighbours.map((i)=>i?1:0).reduce((a,b)=>a+b,0);
				var life=this.cells[x,y]||false;
				if(life && nl<2) life=false;
				else if(life && nl>3) life=false;
				else if(!life && nl==3) life=true;

				this.cells[x][y]=life;

			}
		}

		this.draw();
	}

	this._createCells=function(){
		this.cells=new Array(Math.floor(this.height/size));
		for (var i = 0; i < this.cells.length; i++) {
		  this.cells[i] = new Array(Math.floor(this.width/size));
		}
	}
	this.randomize=function(){
		this._createCells();

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
	this.stop=function(){
		clearInterval(this._timer);
	}

	this._onClick=function(evt){
		var x=evt.clientX - this.bounds.left,
            y=evt.clientY - this.bounds.top,
        	xt=Math.floor(x/size),
        	yt=Math.floor(y/size);
        if(this.cells[xt]){
        	this.cells[yt][xt]=!this.cells[yt][xt];
        }
        this.draw();
	}

	this._createCells();
	canvas.addEventListener("mouseup", this._onClick.bind(this), false);
}
