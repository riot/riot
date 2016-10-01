<select-test>
  <form id="select-test-form">
    <!--One single option, without expressions-->
    <select data-is="select-single-option"/>
    <!--Looped option, no group-->
    <select data-is="select-each-option"/>
    <!--Single option + looped option, no group-->
    <select data-is="select-each-option-prompt"/>
    <!--Two looped options, no group-->
    <select data-is="select-each-two-options"/>
    <!--One group with one looped option-->
    <select data-is="select-optgroup-each-option"/>
    <!--Single option + one group with one looped option-->
    <select data-is="select-optgroup-each-option-prompt"/>
    <!--Two groups with one looped option each-->
    <select data-is="select-two-optgroup-each-option"/>
    <!--Looped group (2 items) with looped options-->
    <select data-is="select-each-optgroup"/>
  </form>
  <script>
  (window||global).theOptions = ['Opt1', 'Opt2', 'Opt3']
  </script>
</select-test>

<select-single-option>
  <option selected>(choose)</option>
</select-single-option>

<select-each-option>
  <option each={ opt, i in theOptions } selected={ i == 1 }>{ opt }</option>
</select-each-option>

<select-each-option-prompt>
  <option>(choose)</option>
  <option each={ opt, i in theOptions } selected={ i == 1 }>{ opt }</option>
</select-each-option-prompt>

<select-each-two-options>
  <option each={ opt, i in theOptions }>{ opt }</option>
  <option each={ opt, i in theOptions } selected={ i == 1 }>{ opt }</option>
</select-each-two-options>

<select-optgroup-each-option>
  <optgroup label="Group 1">
    <option each={ opt in theOptions }>{ opt }</option>
  </optgroup>
</select-optgroup-each-option>

<select-optgroup-each-option-prompt>
  <optgroup label="Group 1">
    <option each={ opt in theOptions }>{ opt }</option>
  </optgroup>
  <option selected>(choose)</option>
</select-optgroup-each-option-prompt>

<select-two-optgroup-each-option>
  <optgroup label="Group 1">
    <option each={ opt in theOptions }>{ opt }</option>
  </optgroup>
  <option selected>(choose)</option>
  <optgroup label="Group 2">
    <option each={ opt in theOptions }>{ opt }</option>
  </optgroup>
</select-two-optgroup-each-option>

<select-each-optgroup>
  <optgroup each={ group in groups } label={ group }>
    <option each={ opt in theOptions }>{ opt }</option>
  </optgroup>
  <script>
    this.groups = ['Group 1', 'Group 2']
  </script>
</select-each-optgroup>
