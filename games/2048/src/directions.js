const DIRECTIONS = {
    LEFT : 'LEFT',
    RIGHT : 'RIGHT',
    UP : 'UP',
    DOWN : 'DOWN'
}

export const isHorizontalMove = direction => direction == DIRECTIONS.LEFT || direction === DIRECTIONS.RIGHT;

export const isVerticalMove = direction => direction == DIRECTIONS.UP || direction === DIRECTIONS.DOWN;

export const isReversedMove = direction => direction === DIRECTIONS.LEFT || direction === DIRECTIONS.UP; 

export default DIRECTIONS;