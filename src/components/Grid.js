import {Container, Text, Graphics, Point} from 'pixi.js';
import { gsap } from "gsap";
import { Cell } from './Cell';
import directions, {isHorizontalMove, isReversedMove} from '../directions';
import { forEach } from '../utils';

const log_cells = cells => console.log(cells.map( arr => arr.map(s=> s ? s.value : null)))
export class Grid extends Container{

    constructor(columns = 4, rows = 4, cellSize = 120, vGap = 10, hGap = 10){
        super();

        this._columns = columns;
        this._rows = rows;
        this._cellSize = cellSize;
        this._vGap = vGap;
        this._hGap = hGap;
        this._time = 0.2;

        // grid bg creation 
        this._bg = this._drawGridBackground();
        this.addChild(this._bg);

        this._cells = new Array(columns * rows).fill(null);

        /**
         * to keep track real active cells amount 
         */
        this._cellsCurrentAmount = 0;
    }


    /**
     * 
     */
    move(direction = directions.RIGHT){
        let moveResolver;
        const promise = new Promise(r => moveResolver = r);
        const isHorzlMove = isHorizontalMove(direction);
        const isReversed = isReversedMove(direction);
        const posProp = isHorzlMove ? 'x' : 'y';

        const tl = gsap.timeline({onComplete : moveResolver});

        // console.clear();

        const linesBefore = isHorzlMove ? this._getHorizontalLines() : this._getVerticalLines();

        log_cells(linesBefore);

        const linesAfterMerges = linesBefore.slice()
            .map(line => this._findMerges(line.slice(), isReversed))

        log_cells(linesAfterMerges);
          
        const linesAfter = linesAfterMerges.slice(0).map(line =>{
            const notEmptyCells = line.filter(cell => cell !== null),
                notEmptyCellsLen = notEmptyCells.length;

          

            if (notEmptyCellsLen === 0 || notEmptyCellsLen === line.length) return line;


            const newLine = isReversed ? 
            [...notEmptyCells, ...this._getEmptyArray(line.length - notEmptyCellsLen)]:
            [...this._getEmptyArray(line.length - notEmptyCellsLen), ...notEmptyCells] 


            newLine.forEach((cell, i)=>{
                if (!cell) return;

                const prevIndex = line.indexOf(cell);
                tl.add(
                    this._moveCell(cell, posProp, this._getHorizontalPosionInTheRow(prevIndex), this._getHorizontalPosionInTheRow(i)),
                    0
                )
            });

            return newLine;
        });

        log_cells(linesAfter);
      
        // console.log(linesBefore);
        // console.log(linesAfterMerges);
        // console.log(linesAfter);
        
       
        
        if (isHorzlMove){
            this._cells = linesAfter.flat();
        } else {
            const {_rows, _columns} = this;

            this._cells = [];
            for (let i = 0; i < _rows; i++){
                for (let j = 0; j < _columns; j++){
                    this._cells.push(linesAfter[j][i])
                }
            }
        }

        return promise;
    }

    _findMerges(line, isReversed = false){
        let candidate = null;
        let candidateIndex = null;

        forEach(line, !isReversed, (cell, i)=>{

            if (cell && !candidate){
                candidate = cell;
                candidateIndex = i;
            } else if (cell && candidate){

                if (cell.value === candidate.value){
                    candidate.explode();
                    cell.setValue(cell.value * 2);
                    line[candidateIndex] = null;
                    candidate = null;
                    candidateIndex = null;
                } else {
                    candidate = cell;
                    candidateIndex = i;
                }
            }

        })

        return line;
    }

    /**
     * add cell to the grid 
     * @param {Number} index 
     * @param {Number} value 
     */
    addCell(index, value = 2){
        const {x, y} = this._getCellPosition(index);

        const cell = new Cell(value, this._drawCellShape.bind(this), this._cellSize);
        this.addChild(cell);
        cell.x = x;
        cell.y = y;


        if (!this._cells[index]){
            this._cells[index] = cell;
            this._cellsCurrentAmount++;
        } else {
            console.error(`Index ${index} already has the Cell`);
        }

    }


    /**
     * get available options 
     * @returns {Number}
     */
    getOptionsIndexes(){
        return this._cells.map((e, i) => e ? null : i).filter(e => e !== null);
    }

 
    /**
     * 
     * @param {Cell} cell 
     * @param {String} prop 
     * @param {Number} from 
     * @param {Number} to 
     */
    _moveCell(cell, prop, from, to){

        return gsap.fromTo(cell, 
            {
                [prop] : from
            },
            {
                [prop] : to,
                duration : this._time
            }
        )
    }


    _getEmptyArray(len = 1, fill = null){
        return new Array(len).fill(fill)
    }

    _getHorizontalLines(){
        const {_rows, _columns, _cells} = this;

        const lines = new Array(_rows)
        .fill(null)
        .map((_, i)=>{
            return _cells.slice(i * _columns, i * _columns + _columns)
        })

        return lines;
    }


    _getVerticalLines(){
        const {_rows, _columns, _cells} = this;
        const lines = new Array(_columns)
            .fill(null)
            .map((_, i)=>{
                const line = [];
                for (let j = 0; j < _rows; j++){
                    line.push(_cells[i + (j * _columns)]);
                }

                return line;
            })

        return lines;
    }



    _drawGridBackground(){
        const {_columns, _rows, _cellSize} = this;
        const g = new Graphics();
        g.beginFill(0x6d7171);


        for (let i = 0; i < _columns * _rows; i++){
            const {x, y} = this._getCellPosition(i);

            this._drawCellShape(g, x, y);
        }

        return g;

    }


    _drawCellShape(g, x, y){
        const {_cellSize} = this;

        g.drawRoundedRect(x, y, _cellSize, _cellSize, 14);
    }

    _getCellPosition(i){
        const {_columns, _rows} = this;

        return new Point(
            this._getHorizontalPosionInTheRow(i % _columns),
            this._getVerticalPositionInTheColumn(Math.floor(i / _rows))
        )
    }

    _getHorizontalPosionInTheRow(indexInTheRow){
        const {_cellSize, _hGap} = this;

        return indexInTheRow * (_cellSize + _hGap)
    }

    _getVerticalPositionInTheColumn(indexInTheColumn){
        const {_cellSize, _vGap} = this;
        return indexInTheColumn * (_cellSize + _vGap)
    }
}