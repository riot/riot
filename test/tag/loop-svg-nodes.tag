<loop-svg-nodes>
  <h1>Hi svg!</h1>
  <svg>
    <circle each={ points } riot-cx="{ x * 10 + 5 }" riot-cy="{ y * 10 + 5 }" r="2" fill="black"></circle>
  </svg>

  this.points = [{'x': 1,'y': 0}, {'x': 9, 'y': 6}, {'x': 4, 'y': 7}]

</loop-svg-nodes>