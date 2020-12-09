class Canvas {
    constructor(canvasId, croppedImgId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.img = null;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.drag = false;
        this.canvas.onmousedown = (e) => this.mouseDown(e);
        this.canvas.onmousemove = null;
        this.canvas.onmouseup = (e) => this.mouseUp(e);
        this.rect = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        }
        this.imgCropped = document.getElementById(croppedImgId);
        this._imgSrc = new Image();
        this._imgSrc.onload = () => {
            this.render();
        }
    }
    aspectRatio() {
        return this._imgSrc.naturalWidth / this.imgSrc.naturalHeight;
    }
    get imgSrc() {
        return this._imgSrc;
    }
    set imgSrc(val) {
        this._imgSrc.src = val;
    }
    get width() {
        return this.canvas.parentElement.clientWidth;
    }
    get height() {
        return this.canvas.parentElement.clientWidth;
    }
    get blurRect() {
        return {
            x: 0,
            y: 0,
            width: this.width,
            height: this.height,
            s: 3
        };
    }
    drawRect() {
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([8, 4]);
        this.ctx.strokeRect(this.rect.x, this.rect.y,this.rect.width, this.rect.height);
    }
    drawImg() {
        this.ctx.drawImage(this._imgSrc, 
            0, 0, this._imgSrc.naturalWidth, this._imgSrc.naturalHeight,
            0, 0, this.canvas.width, this.canvas.height);
    }
    mouseDown(e) {
        let x = e.pageX - this.canvas.offsetLeft;
        let y = e.pageY - this.canvas.offsetTop;

        // if width is negative the min value is x - width
        const inX = this.rect.width > 0 ? 
            this.between(x, this.rect.x, this.rect.x + this.rect.width) :
            this.between(x, this.rect.x + this.rect.width, this.rect.x);
        const inY = this.rect.height > 0 ? 
            this.between(y, this.rect.y, this.rect.y + this.rect.height) :
            this.between(y, this.rect.y + this.rect.height, this.rect.y);
        if (inX && inY) {
            let offset = {
                x: this.rect.x - x,
                y: this.rect.y - y
            }
            // had to swap these two lines, firefox wasn't happy
            this.drag = true;
            this.canvas.onmousemove = (e) => this.mouseMoveDrag(e, offset);
            //this.render();
        } else {
            this.rect.x = x;
            this.rect.y = y;
            this.rect.width = 0;
            this.rect.height = 0;
            // had to swap these two lines, firefox wasn't happy
            this.drag = true;
            this.canvas.onmousemove = (e) => this.mouseMove(e);
            this.render();
        }
    }
    mouseMove(e) {
        if (this.drag) {
            let x = e.pageX - this.canvas.offsetLeft;
            let y = e.pageY - this.canvas.offsetTop;
            this.rect.width = x - this.rect.x;
            this.rect.height = y - this.rect.y;
            this.render();
            this.imgCropped.src = this.croppedImg();
            this.cancelMouseMove(x,y);
        }
    }
    mouseMoveDrag(e,offset) {
        if (this.drag) {
            let x = e.pageX - this.canvas.offsetLeft;
            let y = e.pageY - this.canvas.offsetTop;
            this.rect.x = this.collisionDetection(x + offset.x, this.rect.x, 'width');
            this.rect.y = this.collisionDetection(y + offset.y, this.rect.y, 'height');
            this.render();
            this.imgCropped.src = this.croppedImg();
            this.cancelMouseMove(x,y);
        }
    }
    mouseUp(e) {
        this.drag = false;
        this.imgCropped.src = this.croppedImg();
        this.canvas.onmousemove = null;
    }
    cancelMouseMove(x,y) {
        console.log('x', x);
        console.log('y', y);
        console.log('w', this.canvas.width);
        console.log('h', this.canvas.height);
        if (!this.between(x, 5, this.canvas.width - 5) || !this.between(y, 5, this.canvas.height - 5)) {
            this.mouseUp();
        }
    }
    collisionDetection(newVal, oldVal, dimension) {
        if (newVal < (newVal + this.rect[dimension])) {
            return newVal <= 0 || (newVal + this.rect[dimension]) > this.canvas[dimension] - 1 ? oldVal : newVal;
        } else {
            return (newVal + this.rect[dimension]) <= 0 || newVal > this.canvas[dimension] - 1 ? oldVal : newVal;
        }
    }
    
    scaleUp() {
        return {
            x: this.rect.x/this.canvas.width * this._imgSrc.width,
            y: this.rect.y/this.canvas.height * this._imgSrc.height,
            width: this.rect.width/this.canvas.width * this._imgSrc.width,
            height: this.rect.height/this.canvas.height * this._imgSrc.height,
        }
    }
    blurImg() {
        this.ctx.filter = 'blur(' + this.blurRect.s + 'px)';
        this.ctx.drawImage(this.canvas,
                    this.blurRect.x, this.blurRect.y, this.blurRect.width, this.blurRect.height,
                    this.blurRect.x, this.blurRect.y, this.blurRect.width, this.blurRect.height);  
        // draw the coloring (white-ish) layer, without blur
        this.ctx.filter = 'none'; // remove filter
        this.ctx.fillStyle = 'rgba(255,255,255,0.1)';
        this.ctx.fillRect(this.blurRect.x, this.blurRect.y, this.blurRect.width, this.blurRect.height);

        this.drawRect();

        let scaled = this.scaleUp();
        this.ctx.drawImage(this._imgSrc,
            scaled.x, scaled.y, scaled.width, scaled.height,
            this.rect.x, this.rect.y, this.rect.width, this.rect.height);
    }
    croppedImg() {
        let canvas = document.createElement('canvas');
        canvas.width = this.rect.width;
        canvas.height = this.rect.height;
        let ctx = canvas.getContext('2d');
        let scaled = this.scaleUp();
        ctx.drawImage(this._imgSrc,
            scaled.x, scaled.y, scaled.width, scaled.height,    // source img
            0, 0, canvas.width, canvas.height);                 // destination image
        return canvas.toDataURL("image/png");
    }
    // This returns true if value is between min and max.
    between(value,min,max) {
        return value > min && value < max;
    }
    render() {
        if (this._imgSrc) {
            let ar = this.aspectRatio();
            if (this._imgSrc.naturalWidth > this._imgSrc.naturalHeight) {
                this.canvas.width = this.width;
                this.canvas.height = this.width / ar;
            } else {
                this.canvas.height = this.height;
                this.canvas.width = this.height * ar;
            }
            this.drawImg();
            if (!this.between(this.rect.width, -5, 5) && !this.between(this.rect.height, -5, 5)) {
                this.blurImg();
            }
        }
    }
}

export default Canvas;