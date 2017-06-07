import { Map, fromJS } from 'immutable'

// ------------------------------------
// Constants
// ------------------------------------
export const POINTER_MOVE = 'POINTER_MOVE'
export const KEY_UP = 'KEY_UP'
export const CLICK = 'CLICK'

const TABLE_SIZE = 4
const EMPTY_TABLE = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0]
]
const POINTER_GAP = 10
const FOUR_PROBABILITY = 0.125

// ------------------------------------
// Functions
// ------------------------------------
const updateOnPointerMove = (state, action) => {
  if (state.get('pointer').isEmpty()) {
    return updatePointer(state, action)
  }
  if (!state.get('moved')) {
    const values = state.get('values')
    let movedValues = values
    if (action.y - state.getIn(['pointer', 'y']) < -POINTER_GAP) {
      movedValues = moveNumbersUp(values)
    } else if (action.y - state.getIn(['pointer', 'y']) > POINTER_GAP) {
      movedValues = moveNumbersDown(values)
    } else if (action.x - state.getIn(['pointer', 'x']) > POINTER_GAP) {
      movedValues = moveNumbersRight(values)
    } else if (action.x - state.getIn(['pointer', 'x']) < -POINTER_GAP) {
      movedValues = moveNumbersLeft(values)
    }
    if (!movedValues.equals(values)) {
      return updatePointer(addNumber(state.set('values', movedValues)), action).set('moved', true)
    }
    if (gameover(values)) {
      return state.set('willBeGameover', true).set('moved', true)
    }
  }
  return state
}

const updateOnClick = (state) => {
  if (state.get('gameover')) {
    return newGameState()
  }
  if (state.get('willBeGameover')) {
    return state.set('gameover', true)
  }
  return state.set('pointer', new Map()).set('moved', false)
}

const updateOnKeyUp = (state, action) => {
  if (state.get('gameover')) {
    return newGameState()
  }
  const values = state.get('values')
  let movedValues = values
  switch (action.key) {
    case 'Escape':
      return newGameState()
    case 'ArrowUp':
      movedValues = moveNumbersUp(values)
      break
    case 'ArrowDown':
      movedValues = moveNumbersDown(values)
      break
    case 'ArrowLeft':
      movedValues = moveNumbersLeft(values)
      break
    case 'ArrowRight':
      movedValues = moveNumbersRight(values)
      break
  }
  if (!movedValues.equals(values)) {
    return addNumber(state.set('values', movedValues))
  }
  if (gameover(values)) {
    return state.set('gameover', true)
  }
  return state
}

const gameover = (values) =>
  moveNumbersUp(values).equals(values) &&
  moveNumbersDown(values).equals(values) &&
  moveNumbersLeft(values).equals(values) &&
  moveNumbersRight(values).equals(values)

const updatePointer = (state, action) => state.set('pointer', new Map({ x: action.x, y: action.y }))

const addNumber = (state) => {
  const emptyCells = state.get('values')
    .map((line, y) => line.map(
      (value, x) => ({ value, pos: [y, x] })
    ))
    .flatten()
    .filter(cell => cell.value === 0)
  const randomEmptyCell = emptyCells.get(Math.floor(Math.random() * (emptyCells.size)))
  const newValue = Math.random() > FOUR_PROBABILITY ? 2 : 4

  return state.setIn(['values'].concat(randomEmptyCell.pos), newValue)
}

const moveNumbersUp = (values) =>
  values.map(line => line.map(value => ({ value, doubled: false }))).withMutations(newValues => {
    for (let x = 0; x < TABLE_SIZE; x++) {
      for (let y = 1; y < TABLE_SIZE; y++) {
        for (let i = y; i > 0; i--) {
          let cell = newValues.getIn([i, x])
          if (newValues.getIn([i - 1, x]).value === 0) {
            newValues.setIn([i - 1, x], cell)
            newValues.setIn([i, x], { value: 0, doubled: false })
          } else if (
            !cell.doubled &&
            !newValues.getIn([i - 1, x]).doubled &&
            newValues.getIn([i - 1, x]).value === cell.value
          ) {
            newValues.setIn([i - 1, x], { value: 2 * cell.value, doubled: true })
            newValues.setIn([i, x], { value: 0, doubled: false })
          }
        }
      }
    }
  }).map(line => line.map(cell => cell.value))

const moveNumbersDown = (values) =>
  values.map(line => line.map(value => ({ value, doubled: false }))).withMutations(newValues => {
    for (let x = 0; x < TABLE_SIZE; x++) {
      for (let y = TABLE_SIZE - 2; y >= 0; y--) {
        for (let i = y; i < TABLE_SIZE - 1; i++) {
          let cell = newValues.getIn([i, x])
          if (newValues.getIn([i + 1, x]).value === 0) {
            newValues.setIn([i + 1, x], cell)
            newValues.setIn([i, x], { value: 0, doubled: false })
          } else if (
            !cell.doubled &&
            !newValues.getIn([i + 1, x]).doubled &&
            newValues.getIn([i + 1, x]).value === cell.value
          ) {
            newValues.setIn([i + 1, x], { value: 2 * cell.value, doubled: true })
            newValues.setIn([i, x], { value: 0, doubled: false })
          }
        }
      }
    }
  }).map(line => line.map(cell => cell.value))

const moveNumbersLeft = (values) =>
  values.map(line => line.map(value => ({ value, doubled: false }))).withMutations(newValues => {
    for (let y = 0; y < TABLE_SIZE; y++) {
      for (let x = 1; x < TABLE_SIZE; x++) {
        for (let i = x; i > 0; i--) {
          let cell = newValues.getIn([y, i])
          if (newValues.getIn([y, i - 1]).value === 0) {
            newValues.setIn([y, i - 1], cell)
            newValues.setIn([y, i], { value: 0, doubled: false })
          } else if (
            !cell.doubled &&
            !newValues.getIn([y, i - 1]).doubled &&
            newValues.getIn([y, i - 1]).value === cell.value
          ) {
            newValues.setIn([y, i - 1], { value: 2 * cell.value, doubled: true })
            newValues.setIn([y, i], { value: 0, doubled: false })
          }
        }
      }
    }
  }).map(line => line.map(cell => cell.value))

const moveNumbersRight = (values) =>
  values.map(line => line.map(value => ({ value, doubled: false }))).withMutations(newValues => {
    for (let y = 0; y < TABLE_SIZE; y++) {
      for (let x = TABLE_SIZE - 2; x >= 0; x--) {
        for (let i = x; i < TABLE_SIZE - 1; i++) {
          let cell = newValues.getIn([y, i])
          if (newValues.getIn([y, i + 1]).value === 0) {
            newValues.setIn([y, i + 1], cell)
            newValues.setIn([y, i], { value: 0, doubled: false })
          } else if (
            !cell.doubled &&
            !newValues.getIn([y, i + 1]).doubled &&
            newValues.getIn([y, i + 1]).value === cell.value
          ) {
            newValues.setIn([y, i + 1], { value: 2 * cell.value, doubled: true })
            newValues.setIn([y, i], { value: 0, doubled: false })
          }
        }
      }
    }
  }).map(line => line.map(cell => cell.value))

// ------------------------------------
// Actions
// ------------------------------------
export function pointerMove (x, y) {
  return {
    type    : POINTER_MOVE,
    x       : x,
    y       : y
  }
}

export function keyUp (key) {
  return {
    type    : KEY_UP,
    key     : key
  }
}

export function click (key) {
  return {
    type    : CLICK
  }
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [POINTER_MOVE]    : (state, action) => updateOnPointerMove(state, action),
  [KEY_UP]          : (state, action) => updateOnKeyUp(state, action),
  [CLICK]          : (state, action) => updateOnClick(state, action),
}

// ------------------------------------
// Reducer
// ------------------------------------
const newGameState = () => addNumber(addNumber(fromJS({
  values: EMPTY_TABLE,
  pointer: {}
})))

const initialState = localStorage.getItem('state')
  ? fromJS(JSON.parse(localStorage.getItem('state')))
  : newGameState()

export default function counterReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  const newState = handler ? handler(state, action) : state

  localStorage.setItem('state', JSON.stringify(newState.toJS()))
  return newState
}
