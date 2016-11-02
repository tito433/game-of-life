"use strict";

function GameOfLife(canvas){
	var parent=canvas.parentNode;
	
	canvas.width=parent.clientWidth;
    canvas.height=parent.clientHeight;

    
    this.bounds=canvas.getBoundingClientRect();
    this.width=canvas.width;
    this.height=canvas.height;
	this._ctx=canvas.getContext("2d");
	this.speed=100;
	this._mdouwn=false;
	this.size=10;
	this._settings={grid:true};

	this.draw=function(){
		this._ctx.clearRect(0,0,this.width,this.height);
		this._visitCells(function(cell,x,y){
			var dx=x*this.size,dy=y*this.size;
				this._ctx.beginPath();
				this._ctx.strokeStyle='#808080';
				this._ctx.fillStyle='#000000';
				this._ctx.lineWidth=0.3;
				this._ctx.rect(dx,dy,this.size,this.size);
				if(cell===true){
					this._ctx.fill();
				}else{
					if(this._settings.grid)
						this._ctx.stroke();
				}

		}.bind(this));
	}

	this.run=function(){
		var ny=this.cells.length,nx=this.cells[0].length,
			cells=this._createCells(nx,ny),
			deltas =[{x:-1, y:-1}, {x:0, y:-1}, {x:1, y:-1},
               		{x:-1, y:0},{x:1, y:0},
               		{x:-1, y:1},  {x:0, y:1},  {x:1, y:1}];

        for(var y=0;y<ny;y++){
        	for(var x=0;x<nx;x++){
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
	this._visitCells=function(callback){
		for (var y = 0,ny=this.cells.length; y < ny; y++) {
			for(var x=0,nx=this.cells[y].length;x<nx;x++){
				callback(this.cells[y][x],x,y,nx,ny);
			}
		}
	}
	this._createCells=function(xc,yc){
		
		xc=xc||Math.floor(this.width/this.size);
		yc=yc||Math.floor(this.height/this.size);

		this.size=this.width/xc;

		var cells=new Array(yc);
		for(var y=0;y<yc;y++){
			var arr=new Array(Math.floor(xc));
			arr=arr.fill(false);
		  cells[y]=arr;
		}
		return cells;
	}
	this.randomize=function(){
		this.cells=this._createCells();

		var my=this.cells.length,
			mx=this.cells[0].length,
			pr=Math.floor(Math.random()*90),
			initLife=Math.floor((mx*my)*(pr/100));

		while(initLife--){
			var x=Math.floor(Math.random()*mx),
				y=Math.floor(Math.random()*my);
			if(this.cells[y] !=undefined)
				this.cells[y][x]=true;	
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
	this.reset=function(){
		this.stop();
		this.cells=this._createCells();
		this.draw();
		this.size=10;
	}
	this.data=function(){
		if(arguments.length==0){
			var prev=-1,run=0,
				my=this.cells.length,
				mx=this.cells[0].length,
				result='x = '+mx+', y = '+my+', rule = B3/S23'+"\n",
				typ='';

			for(var y=0;y<my;y++){
				run=0;
				for(var x=0;x<mx;x++){
					typ=this.cells[y][x]?'o':'b';
					if(x>0 && prev!==typ){
						if(run<2){
							result+=prev;
						}else{
							result+=run+prev;
							run=0;
						}
						
					}else{
						run++;
					}
					prev=typ;
				}
				if(run>0){
					result+=run+typ;
				}
				result+='$';
			}
			
			return result+'!';
		}else{
			var data=arguments[0];
			
			var my=Math.floor(this.width/this.size), mx=Math.floor(this.height/this.size),
				lines=data.split('\n'),
				rle=lines[lines.length-1],
				d="",i=0,y=0,x=0,
				setR=/x\s*=\s*(\d+),\s*y\s*=\s*(\d+)/;

			//check dimension
			lines.forEach(function(line){
				var match=setR.exec(line);
				if(match){ mx=match[1];	my=match[2];}
			})
			this.cells=this._createCells(mx,my);
			

			while(i<rle.length){
				var ch=rle[i++];
				if(ch==='!'){
					break;
				}else if(ch==='$'){
					y++;x=0;
				}else if(ch==='b'||ch==='o'){
					var dx=parseInt(d)||1;
					var t=ch==='o';
					while(dx>0 && x+dx<mx){
						if(this.cells[y][x]!==undefined)
						this.cells[y][x]=t;
						dx--;x++;
					}
					d="";
				}else{
					d+=ch;
				}

			}
		}
	}
	this._onClick=function(evt){
		var x=evt.clientX - this.bounds.left,
            y=evt.clientY - this.bounds.top,
        	xt=Math.floor(x/this.size),
        	yt=Math.floor(y/this.size);
        if(this.cells[xt]){
        	this.cells[yt][xt]=!this.cells[yt][xt];
        }
        this.draw();
	}

	this.cells=this._createCells();

	this._onMouseDown=function(evt){
		var x=evt.clientX - this.bounds.left,
            y=evt.clientY - this.bounds.top;
		this._mdouwn={x:x,y:y};
	}
	this._onMouseMove=function(evt){
		if(this._mdouwn){
			var x=evt.clientX - this.bounds.left,
            	y=evt.clientY - this.bounds.top;

            if(Math.abs(this._mdouwn.x-x)>this.size || Math.abs(this._mdouwn.y-y)>this.size)
				this._onClick(evt);

		}
	}
	this._onMouseUp=function(evt){
		this._mdouwn=false;
		this._onClick(evt);
	}
	
	this.settings=function(name,val){
		if(val===undefined){
			return this._settings[name];
		}else{
			this._settings[name]=val;
			this.draw();
		}
	}

	canvas.addEventListener("mousedown", this._onMouseDown.bind(this), false);
	canvas.addEventListener("mouseup", this._onMouseUp.bind(this), false);
	canvas.addEventListener("mousemove", this._onMouseMove.bind(this), false);
}
