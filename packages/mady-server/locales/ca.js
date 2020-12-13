var ca = function(n, ord
) {
  var s = String(n).split('.'), v0 = !s[1];
  if (ord) return ((n == 1
          || n == 3)) ? 'one'
      : (n == 2) ? 'two'
      : (n == 4) ? 'few'
      : 'other';
  return (n == 1 && v0) ? 'one' : 'other';
};
var number = function (value, name, offset) {
  if (!offset) return value;
  if (isNaN(value)) throw new Error("Can't apply offset:" + offset + ' to argument `' + name + '` with non-numerical value ' + JSON.stringify(value) + '.');
  return value - offset;
};
var plural = function (value, offset, lcfunc, data, isOrdinal) {
  if ({}.hasOwnProperty.call(data, value)) return data[value];
  if (offset) value -= offset;
  var key = lcfunc(value, isOrdinal);
  return key in data ? data[key] : data.other;
};

module.exports = {
  c29tZUNvbnRleHRfTWVzc2FnZSB3aXRoIGludGVycG9sYXRpb246IHtOVU19: function(d) { return "Message with interpolation: " + d.NUM; },
  c29tZUNvbnRleHRfe05VTSwgcGx1cmFsLCBvbmV7MSBoYW1idXJnZXJ9IG90aGVyeyMgaGFtYnVyZ2Vyc319: function(d) { return plural(d.NUM, 0, ca, { one: "1 hamburger", other: number(d.NUM, "NUM") + " hamburgers" }); },
  "c29tZUNvbnRleHRfTWVzc2FnZSB3aXRoIGEgZml4ZWQgZXJyb3Ige01JU1NJTkdfQlJBQ0tFVH0=": function(d) { return "Message with a fixed error " + d.MISSING_BRACKET; },
  "c29tZUNvbnRleHRfTWVzc2FnZSB3aXRoIGVtb2ppIPCfpbA=": function(d) { return "Missatge amb emoji 🥰"; }
};
