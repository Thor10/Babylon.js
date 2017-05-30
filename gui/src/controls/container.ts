/// <reference path="../../../dist/preview release/babylon.d.ts"/>

module BABYLON.GUI {
    export class Container extends Control {
        protected _children = new Array<Control>();
        protected _measureForChildren = Measure.Empty();  
        protected _background: string;   

        public get background(): string {
            return this._background;
        }

        public set background(value: string) {
            if (this._background === value) {
                return;
            }

            this._background = value;
            this._markAsDirty();
        }  

        public get children(): Control[] {
            return this._children;
        }        

        constructor(public name: string) {
            super(name);
        }

        public containsControl(control: Control): boolean {
            return this._children.indexOf(control) !== -1;
        }

        public addControl(control: Control): Container {
           var index = this._children.indexOf(control);

            if (index !== -1) {
                return this;
            }
            control._link(this, this._host);

            this._reOrderControl(control);

            this._markAsDirty();
            return this;
        }

        public removeControl(control: Control): Container {
            var index = this._children.indexOf(control);

            if (index !== -1) {
                this._children.splice(index, 1);
            }

            this._markAsDirty();
            return this;
        }

        public _reOrderControl(control: Control): void {
            this.removeControl(control);

            for (var index = 0; index < this._children.length; index++) {
                if (this._children[index].zIndex > control.zIndex) {
                    this._children.splice(index, 0, control);
                    return;
                }
            }

            this._children.push(control);

            this._markAsDirty();
        }

        public _markMatrixAsDirty(): void {
            super._markMatrixAsDirty();

            for (var index = 0; index < this._children.length; index++) {
                this._children[index]._markMatrixAsDirty();
            }
        }

        protected _localDraw(context: CanvasRenderingContext2D): void {
            if (this._background) {
                context.fillStyle = this._background;
                context.fillRect(this._currentMeasure.left, this._currentMeasure.top, this._currentMeasure.width, this._currentMeasure.height);
            }
        }

        public _link(root: Container, host: AdvancedDynamicTexture): void {
            super._link(root, host);

            for (var child of this._children) {
                child._link(root, host);
            }
        }

        public _draw(parentMeasure: Measure, context: CanvasRenderingContext2D): void {
            context.save();
            super._processMeasures(parentMeasure, context);
           
            this._applyStates(context);

            this._localDraw(context);

            this._clipForChildren(context);
            for (var child of this._children) {
                child._draw(this._measureForChildren, context);
            }
            context.restore();
        }

        public _processPicking(x: number, y: number, type: number): boolean {
            if (!super.contains(x, y)) {
                return false;
            }

            // Checking backwards to pick closest first
            for (var index = this._children.length - 1; index >= 0; index--) {
                var child = this._children[index];
                if (child._processPicking(x, y, type)) {
                    return true;
                }
            }

            return this._processObservables(type);
        }

        protected _clipForChildren(context: CanvasRenderingContext2D): void {
            // DO nothing
        }

        protected _additionalProcessing(parentMeasure: Measure, context: CanvasRenderingContext2D): void {  
            super._additionalProcessing(parentMeasure, context);

            this._measureForChildren.copyFrom(this._currentMeasure);
        }
    }    
}