<select-test>
  <form id="select-test-form">
    <!--One single option, without expressions-->
    <select riot-tag="select-single-option"/>
    <!--Looped option, no group-->
    <select riot-tag="select-each-option"/>
    <!--Single option + looped option, no group-->
    <select riot-tag="select-each-option-prompt"/>
    <!--Two looped options, no group-->
    <select riot-tag="select-each-two-options"/>
    <!--One group with one looped option-->
    <select riot-tag="select-optgroup-each-option"/>
    <!--Single option + one group with one looped option-->
    <select riot-tag="select-optgroup-each-option-prompt"/>
    <!--Two groups with one looped option each-->
    <select riot-tag="select-two-optgroup-each-option"/>
    <!--Looped group (2 items) with looped options-->
    <select riot-tag="select-each-optgroup"/>
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
  <option>(choose)
  <option each={ opt, i in theOptions } selected={ i == 1 }>{ opt }</option>
</select-each-option-prompt>

<select-each-two-options>
  <option each={ opt, i in theOptions }>{ opt }
  <option each={ opt, i in theOptions } selected={ i == 1 }>{ opt }</option>
</select-each-two-options>

<select-optgroup-each-option>
  <optgroup label="Group 1">
    <option each={ opt in theOptions }>{ opt }
  </optgroup>
</select-optgroup-each-option>

<select-optgroup-each-option-prompt>
  <option selected>(choose)
  <optgroup label="Group 1">
    <option each={ opt in theOptions }>{ opt }
  </optgroup>
</select-optgroup-each-option-prompt>

<select-two-optgroup-each-option>
  <optgroup label="Group 1">
    <option each={ opt in theOptions }>{ opt }
  </optgroup>
  <option selected>(choose)</option>
  <optgroup label="Group 2">
    <option each={ opt in theOptions }>{ opt }
  </optgroup>
</select-two-optgroup-each-option>

<select-each-optgroup>
  <optgroup each={ group in groups } label={ group }>
    <option each={ opt in theOptions }>{ opt }
  </optgroup>
  <script>
    this.groups = ['Group 1', 'Group 2']
  </script>
</select-each-optgroup>
