function GameOfLife(canvas){
	var parent=canvas.parentNode;
	
	canvas.width=parent.clientWidth;
    canvas.height=parent.clientHeight;
    var size=10;
    this.width=canvas.width;
    this.height=canvas.height;
	this._ctx=canvas.getContext("2d");
	this.cells=new Array(Math.floor(this.height/size));
	for (var i = 0; i < this.cells.length; i++) {
	  this.cells[i] = new Array(Math.floor(this.width/size));
	}

	this.draw=function(){
		this._ctx.clearRect(0,0,this.width,this.height);

		for (var y = 0,ny=this.cells.length; y < ny; y++) {
			for(var x=0,nx=this.cells[y].length;x<nx;x++){
				var dx=x*size,dy=y*size;
				this._ctx.beginPath();;
				this._ctx.rect(dx,dy,size,size);
				this._ctx.stroke();
			}
		}
	}
}
