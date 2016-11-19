<virtual-nested-component>
  <div>
    <virtual each={ person in people }>
      <not-virtual-component2 name={ person.name } age={ person.age }></not-virtual-component2>
    </virtual>
  </div>
  <script>
    this.people = [
      { name: 'Jack', age: 10 },
      { name: 'Susy', age: 5 },
      { name: 'Mel', age: 15 },
      { name: 'Fred', age: 20 }
    ]
  </script>

</virtual-nested-component>

<not-virtual-component2>
  <span>{ opts.name } - { opts.age } <br/></span>
</not-virtual-component2>
