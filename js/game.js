"use strict";

function GameOfLife(canvas,sett){
	var parent=canvas.parentNode;
	
	canvas.width=parent.clientWidth;
    canvas.height=parent.clientHeight;

    var options={lifeSpan:100,grid:true,frameRate:1000/60,gridSize:36};
    this.bounds=canvas.getBoundingClientRect();
    this.width=canvas.width;
    this.height=canvas.height;
	this._ctx=canvas.getContext("2d");
	this.cells=[];
	this._isRunning=false;
	this._mdouwn=false;
	this._settings=options.extendEx(sett||{});

	this.draw=function(){
		this._ctx.clearRect(0,0,this.width,this.height);
		this._ctx.save();
		this._ctx.strokeStyle='#808080';
		this._ctx.fillStyle='#000000';
		this._ctx.lineWidth=0.3;
		if(this._settings.grid){
			var pos=0;
			while(pos<this.width){
				this._ctx.beginPath();
				this._ctx.moveTo(pos,0);
				this._ctx.lineTo(pos,this.height);
				this._ctx.stroke();
				pos+=this._settings.gridSize;
			}
			pos=0;
			while(pos<this.height){
				this._ctx.beginPath();
				this._ctx.moveTo(0,pos);
				this._ctx.lineTo(this.width,pos);
				this._ctx.stroke();
				pos+=this._settings.gridSize;
			}

		}
		//draw cells
		for (var y in this.cells) {
			var row=this.cells[y];
			for(var x in row){
				var cell=row[x];
				if(cell){
					var dx=x*this._settings.gridSize,dy=y*this._settings.gridSize;
					this._ctx.beginPath();
					this._ctx.fillRect(dx,dy,this._settings.gridSize,this._settings.gridSize);
				}
			}
		}
		this._ctx.restore();
	}

	this.run=function(){
		var ny=this.cells.length,nx=this.cells.reduce((a,b)=>a.length>b.length?a:b).length,
			cells=[],
			deltas =[[-1,-1],[0,-1], [1,-1],
               		 [-1,0],[1,0],
               		 [-1,1],  [0,1],  [1,1]];

        for(var y in this.cells){
        	var row=this.cells[y];
        	for(var x in row){
        		var life=row[x],nl=0;

				for(var di in deltas){
					var delta=deltas[di],dy=parseInt(y) + delta[1],dx=parseInt(x) + delta[0];
				    if (dx >= 0 && dx < nx && dy >= 0 && dy < ny){
				    	nl+=this.cells[dy] && this.cells[dy][dx]?1:0;
					}
				}

				if(life && nl<2) life=false;
				else if(life && nl>3) life=false;
				else if(!life && nl==3) life=true;
				if(cells[y]===undefined) cells[y]=[];
				cells[y][x]=life;
        	}
        }

		this.cells=cells;
	}
	this._createCells=function(xc,yc){

		if(xc!==undefined) this._settings.gridSize=this.width/xc;

		xc=xc||Math.floor(this.width/this._settings.gridSize);
		yc=yc||Math.floor(this.height/this._settings.gridSize);

		
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
		this._timer=setInterval(this.run.bind(this),this._settings.lifeSpan);
		this._isRunning=true;
	}
	this.step=function(){
		this.run();
	}
	this.stop=function(){
		clearInterval(this._timer);
		this._isRunning=false;
	}
	this.reset=function(){
		this.stop();
		this.cells=this._createCells();
		this._settings=options.extendEx(sett||{});
	}
	this.data=function(){
		if(arguments.length==0){
			if(this.cells.length<1) return [];
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
			
			var mx=Math.floor(this.width/this._settings.gridSize), 
				my=Math.floor(this.height/this._settings.gridSize),
				lines=data.split('\n'),
				rle=false,
				d="",i=0,y=0,x=0,
				rs=/x\s*=\s*(\d+),\s*y\s*=\s*(\d+)/,
				rl=/[\$\dbo]+\!/;

			//check data
			lines.forEach(function(line){
				var match=rs.exec(line);
				if(match){ 
					mx=Math.max(mx,match[1]);
					my=Math.max(my,match[2]);
				}
				if(match=rl.exec(line)){rle=line;}
			});
			
			if(!rle) throw "Invalid RLE data! check RLE is in single line.";

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
        	xt=Math.floor(x/this._settings.gridSize),
        	yt=Math.floor(y/this._settings.gridSize);
        if(this.cells[xt]){
        	this.cells[yt][xt]=!this.cells[yt][xt];
        }
	}


	this._onMouseDown=function(evt){
		var x=evt.clientX - this.bounds.left,
            y=evt.clientY - this.bounds.top;
		this._mdouwn={x:x,y:y};
	}
	this._onMouseMove=function(evt){
		if(this._mdouwn){
			var x=evt.clientX - this.bounds.left,
            	y=evt.clientY - this.bounds.top;

            if(Math.abs(this._mdouwn.x-x)>this._settings.gridSize || Math.abs(this._mdouwn.y-y)>this._settings.gridSize)
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
			if(name=='lifeSpan' && this._isRunning){
				this.stop();
				this.start();
			}
		}
	}
	setInterval(this.draw.bind(this),this._settings.frameRate);

	canvas.addEventListener("mousedown", this._onMouseDown.bind(this), false);
	canvas.addEventListener("mouseup", this._onMouseUp.bind(this), false);
	canvas.addEventListener("mousemove", this._onMouseMove.bind(this), false);
}

Object.prototype.extendEx=function(){
  var dst=this;
    for(var i=0; i<arguments.length; i++)
        for(var key in arguments[i])
            if(arguments[i].hasOwnProperty(key))
                dst[key] = arguments[i][key];
    return dst;
}