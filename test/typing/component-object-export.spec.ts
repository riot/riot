import { RiotComponentWrapper, RiotComponent, withTypes } from '../../riot'

export interface RandomComponentState {
  number: number | null
  logs: { text: string }[]
}

export interface RandomComponentProps {
  title: string
}

export interface RandomComponent
  extends RiotComponent<RandomComponentProps, RandomComponentState> {
  generate(event: MouseEvent): void

  clearLogs(): void

  state: RandomComponentState
}

const Random = withTypes<RandomComponent>({
  state: {
    number: null,
    logs: [],
  },

  generate(event) {
    this.update({
      number: Math.floor(Math.random() * 10000),
      logs: this.state.logs.concat({
        text: `Generate button clicked. Event type is ${event.type}`,
      }),
    })
  },

  clearLogs(): void {
    this.update({
      logs: [],
    })
  },
})

export default {
  css: undefined,
  exports: Random,
  template: function (template, expressionTypes, bindingTypes, getComponent) {
    return template(
      '<h3 expr1="expr1"> </h3><button expr2="expr2">\n    Generate\n  </button><h1 expr3="expr3"> </h1><logs expr4="expr4"></logs>',
      [
        {
          redundantAttribute: 'expr1',
          selector: '[expr1]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,

              evaluate: function (_scope) {
                return _scope.props.title
              },
            },
          ],
        },
        {
          redundantAttribute: 'expr2',
          selector: '[expr2]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',

              evaluate: function (_scope) {
                return _scope.generate
              },
            },
          ],
        },
        {
          redundantAttribute: 'expr3',
          selector: '[expr3]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,

              evaluate: function (_scope) {
                return [_scope.state.number].join('')
              },
            },
          ],
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,

          evaluate: function (_scope) {
            return 'logs'
          },

          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'logs',

              evaluate: function (_scope) {
                return _scope.state.logs
              },
            },
            {
              type: expressionTypes.EVENT,
              name: 'onclear',

              evaluate: function (_scope) {
                return _scope.clearLogs
              },
            },
          ],

          redundantAttribute: 'expr4',
          selector: '[expr4]',
        },
      ],
    )
  },

  name: 'random',
} as RiotComponentWrapper<RandomComponent>
