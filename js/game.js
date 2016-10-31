function GameOfLife(canvas){
	var parent=canvas.parentNode;
	
	canvas.width=parent.clientWidth;
    canvas.height=parent.clientHeight;
    var size=10;
    this.width=canvas.width;
    this.height=canvas.height;
	this._ctx=canvas.getContext("2d");
	

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
	this._createCells();
}
