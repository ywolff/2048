import { injectReducer } from '../../store/reducers'

export default (store) => ({
  /*  Async getComponent is only invoked when route matches   */
  getComponent (nextState, cb) {
    /*  Webpack - use 'require.ensure' to create a split point
        and embed an async module loader (jsonp) when bundling   */
    require.ensure([], (require) => {
      /*  Webpack - use require callback to define
          dependencies for bundling   */
      const _2048 = require('./containers/2048Container').default
      const reducer = require('./modules/2048').default

      /*  Add the reducer to the store on key '2048'  */
      injectReducer(store, { key: '_2048', reducer })

      /*  Return getComponent   */
      cb(null, _2048)

    /* Webpack named bundle   */
    }, '2048')
  }
})
