
function DB(key) {
   var store = window.localStorage;

   return {
      get: function() {
         return JSON.parse(store.getItem(key) || '{}')
      },

      put: function(data) {
         store.setItem(key, JSON.stringify(data))
      }
   }
}