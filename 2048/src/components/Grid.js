import {Container,  Graphics, Point } from 'pixi.js';
import { gsap } from "gsap";
import { Cell } from './Cell';
import directions, {isHorizontalMove, isReversedMove} from '../directions';
import { forEach, generateArray, arrayEquals } from '../utils';

const log_cells = cells => console.log(cells.map( arr => arr.map(s=> s ? s.value : null)))
export class Grid extends Container{

    constructor(columns = 4, rows = 4, cellSize = 90, vGap = 10, hGap = 10){
        super();
        this._columns = columns;
        this._rows = rows;
        this._cellSize = cellSize;
        this._vGap = vGap;
        this._hGap = hGap;
        this._time = 0.09;

        // grid bg creation
        this._bg = this._drawGridBackground();
        this.addChild(this._bg);
        this._cells = generateArray(columns * rows, null);

        /**
         * to keep track real active cells amount
         */
        this._cellsCurrentAmount = 0;

        this._currentTimeLine = null;
    }


    reset(){
        if (this._currentTimeLine){
            this._currentTimeLine.seek(this._currentTimeLine.endTime(), true);
            this._currentTimeLine = null;
        }

        this._cells.forEach((cell)=>{
            cell && cell.destroy({children : true})
        })
        this._cells = [];
        this._cells = generateArray(this._columns * this._rows, null);
    }


    moveDemo(direction, cellsBefore){
        this._syncCellsState(cellsBefore);
        return this.move(direction);
    }

    _syncCellsState(cellsIndexes){
        const {_cells} = this;
        if (this._currentTimeLine){
            this._currentTimeLine.seek(this._currentTimeLine.endTime(), true);
            this._currentTimeLine = null;
        }

        for (let i = 0, len = _cells.length; i < len; i++){
            if (cellsIndexes[i] === null && _cells[i]){
                _cells[i].destroy();
                _cells[i] == null;
            } else if (cellsIndexes[i] !== null && _cells[i] === null){
                this.addCell(i, cellsIndexes[i]);
            } else if (cellsIndexes[i] !== null && _cells[i].value !== cellsIndexes[i]){
                _cells[i].setValue(cellsIndexes[i])
            }
        }
    }

    /**
     *
     */
    move(direction){
        const
            {hasMove, stepScore, cellsBefore, cellsAfter, linesAfterMerges, linesAfter, isHorzlMove, newCells}
                = this.checkMove(direction);

        this._cells = newCells;

        const promise = this._move(linesAfterMerges, linesAfter, isHorzlMove)

        return {
            promise,
            data :  {hasMove, stepScore, cellsBefore, cellsAfter}
        }
    }

    skip(){
        if (this._currentTimeLine){
            this._currentTimeLine.seek(this._currentTimeLine.endTime(), false);
            this._currentTimeLine = null;
        }
    }


    checkMove(direction = directions.RIGHT){
        const isHorzlMove = isHorizontalMove(direction);
        const isReversed = isReversedMove(direction);

        // get lined before movement
        const linesBefore = isHorzlMove ? this._getHorizontalLines() : this._getVerticalLines();

        const cellsBefore = this._cells.map(cell => cell ? cell.value : null);

        // find matches (merges per line)
        const [linesAfterMerges, stepScore] = this._findMerges(linesBefore, isReversed)

        // perform all possible moves and calculate new array
        const linesAfter = this._moveInArray(linesAfterMerges, isReversed);

        const prevCells = this._cells.slice();
        let newCells = [];

        if (isHorzlMove){
            newCells = linesAfter.flat();
        } else {
            const {_rows, _columns} = this;
            for (let i = 0; i < _rows; i++){
                for (let j = 0; j < _columns; j++){
                    newCells.push(linesAfter[j][i])
                }
            }
        }

        const hasMove = !arrayEquals(newCells, prevCells);

        const cellsAfter = newCells.map(cell => cell ? cell.value : null);

        return {hasMove, stepScore, cellsBefore, cellsAfter, linesAfterMerges, linesAfter, isHorzlMove, newCells};
    }

    hasAnyMove() {
        // if has any null element
        if (this._cells.some(s => s === null)) return true;
        return [
            ...this._getHorizontalLines(),
            ...this._getVerticalLines()
        ].some(line => line.some((s,i)=>{
           if (i >= line.length-1) return false
           return s.value === line[i+1].value;
        }))
    }

    _findMerges(lines, isReversed = false){
        let score = 0;
        return [
            lines.slice(0)
            .map((line)=>{

                let candidate = null;
                let candidateIndex = null;

                forEach(line, !isReversed, (cell, i)=>{

                    if (cell && !candidate){
                        candidate = cell;
                        candidateIndex = i;
                    } else if (cell && candidate){

                        if (cell.value === candidate.value){
                            candidate.explode();
                            score += (cell.value * 2);
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
            }),
        score
    ]

    }

    _moveInArray(lines, isReversed){
        return lines.slice(0).map(line =>{

            const lineCells = line.filter(cell => cell !== null),
                lineCellsLen = lineCells.length;

            // if line has no cells to move or line is fully loaded
            if (lineCellsLen === 0 || lineCellsLen === line.length) return line;

            // generate empty (null) cells array
            const emptyCells = generateArray(line.length - lineCellsLen);

            // create new line depends on reversed move or not
            const newLine = isReversed ?
                [...lineCells, ...emptyCells]:
                [...emptyCells, ...lineCells]

            return newLine;
        });

    }

    /**
     * play move animation
     * @param {} linesBefore
     * @param {*} linesAfter
     */
    _move(linesBefore, linesAfter, isHorzlMove){
        let moveResolver;
        const promise = new Promise(r => moveResolver = r);
        const tl = gsap.timeline({onComplete : moveResolver});
        const posProp = isHorzlMove ? 'x' : 'y';

        linesBefore.forEach((line, i)=>{
            const newLine = linesAfter[i];

            newLine.forEach((cell, i)=>{
                if (!cell) return;
                const prevIndex = line.indexOf(cell);
                if (prevIndex === i) return;

                tl.add(
                    this._moveCell(cell, posProp, this._getHorizontalPosionInTheRow(prevIndex), this._getHorizontalPosionInTheRow(i)),
                    0
                )
            });
        });

        this._currentTimeLine = tl;
        return promise
            .then(()=>{
                this._currentTimeLine = null;
            })
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
            console.error(this._name, `Index ${index} already has the Cell`);
        }

    }


    /**
     * get available options
     * @returns {Number}
     */
    getOptionsIndexes(){
        return this._cells.map((e, i) => e ? null : i).filter(e => e !== null);
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
        const {_columns, _rows, _hGap, _vGap, _cellSize} = this;
        const g = new Graphics();

        g.beginFill(0xBBAE9E);
        const width = _columns * (_hGap + _cellSize) - _hGap;
        const height = _rows * (_vGap + _cellSize) - _vGap;
        const radius = 8;
        const offset = 10;
        g.drawRoundedRect(-offset,-offset,  width + offset * 2, height + offset * 2,  radius)
        g.endFill();


        g.beginFill(0xFFFFFF, 0.1);


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

    toIndexes(){
        return this._cells.map(cell => cell ? cell.value : null);
    }
}
