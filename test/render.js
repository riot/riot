
describe("$.render", function() {

   it("Simple ", function() {
      assert($.render("|hi|") == "|hi|");
      assert($.render("|hi|", {}) == "|hi|");
      assert($.render("|{hi}|", { hi: "hi" }) == "|hi|");
   })

})