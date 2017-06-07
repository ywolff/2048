import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'

import './2048.scss'

export const _2048 = ({ values, pointerMove, keyUp, click, gameover }) => (
  <div className='_2048'>
    <input
      className='_2048__input'
      autoFocus
      onKeyPress={(e) => { e.preventDefault() }}
      onKeyUp={(e) => keyUp(e.key)}
      onMouseMove={(e) => (e.buttons === 1) && pointerMove(e.screenX, e.screenY)}
      onClick={click}
    />
    <table className='_2048__table' >
      <tbody>
        {values.map((line, index) => (
          <tr key={index}>
            {line.map((cell, index) => (
              <td key={index} className={`_2048__table__cell _2048__table__cell__${cell}`}>
                {(cell > 0) && cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    {gameover && <div className='_2048__game-over'>
      Game over!
    </div>}
  </div>
)

_2048.propTypes = {
  values: ImmutablePropTypes.listOf(ImmutablePropTypes.listOf(React.PropTypes.number)),
  pointerMove: React.PropTypes.func,
  keyUp: React.PropTypes.func,
  click: React.PropTypes.func,
  gameover: React.PropTypes.bool
}

export default _2048
