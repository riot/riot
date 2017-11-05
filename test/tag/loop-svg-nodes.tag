<loop-svg-nodes>
  <svg>
    <g data-is='loop-svg-nodes-custom-circle' each={data in circles}></g>
    <circle each={ points } riot-cx={ x * 10 + 5 } riot-cy={ y * 10 + 5 } r="2" fill="black"></circle>
  </svg>
  <p>Description</p>

  this.points = [{'x': 1,'y': 0}, {'x': 9, 'y': 6}, {'x': 4, 'y': 7}]
  this.circles = [
    {'x': 40, 'y': 20, 'fill': 'red'},
    {'x': 60, 'y': 20, 'fill': 'yellow'},
  ]
</loop-svg-nodes>

<loop-svg-nodes-custom-circle>
  <circle
    ref='circle'
    riot-cx={data.x}
    riot-cy={data.y}
    r="10"
    fill={data.fill} />
</loop-svg-nodes-custom-circle>