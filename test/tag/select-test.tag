<select-test>
  <form id="select-test-form">
    <!--One single option, without expressions-->
    <select data={theOptions} data-is="select-single-option"></select>
    <!--Looped option, no group-->
    <select data={theOptions} data-is="select-each-option"></select>
    <!--Single option + looped option, no group-->
    <select data={theOptions} data-is="select-each-option-prompt"></select>
    <!--Two looped options, no group-->
    <select data={theOptions} data-is="select-each-two-options"></select>
    <!--One group with one looped option-->
    <select data={theOptions} data-is="select-optgroup-each-option"></select>
    <!--Single option + one group with one looped option-->
    <select data={theOptions} data-is="select-optgroup-each-option-prompt"></select>
    <!--Two groups with one looped option each-->
    <select data={theOptions} data-is="select-two-optgroup-each-option"></select>
    <!--Looped group (2 items) with looped options-->
    <select data={theOptions} data-is="select-each-optgroup"></select>
  </form>
  <script>
    this.theOptions = ['Opt1', 'Opt2', 'Opt3']
  </script>
</select-test>

<select-single-option>
  <option selected>(choose)</option>
</select-single-option>

<select-each-option>
  <option each={ opt, i in opts.data } selected={ i == 1 }>{ opt }</option>
</select-each-option>

<select-each-option-prompt>
  <option>(choose)</option>
  <option each={ opt, i in opts.data } selected={ i == 1 }>{ opt }</option>
</select-each-option-prompt>

<select-each-two-options>
  <option each={ opt, i in opts.data }>{ opt }</option>
  <option each={ opt, i in opts.data } selected={ i == 1 }>{ opt }</option>
</select-each-two-options>

<select-optgroup-each-option>
  <optgroup label="Group 1">
    <option each={ opt in opts.data }>{ opt }</option>
  </optgroup>
</select-optgroup-each-option>

<select-optgroup-each-option-prompt>
  <optgroup label="Group 1">
    <option each={ opt in opts.data }>{ opt }</option>
  </optgroup>
  <option selected>(choose)</option>
</select-optgroup-each-option-prompt>

<select-two-optgroup-each-option>
  <optgroup label="Group 1">
    <option each={ opt in opts.data }>{ opt }</option>
  </optgroup>
  <option selected>(choose)</option>
  <optgroup label="Group 2">
    <option each={ opt in opts.data }>{ opt }</option>
  </optgroup>
</select-two-optgroup-each-option>

<select-each-optgroup>
  <optgroup each={ group in groups } label={ group }>
    <option each={ opt in parent.opts.data }>{ opt }</option>
  </optgroup>
  <script>
    this.groups = ['Group 1', 'Group 2']
  </script>
</select-each-optgroup>
