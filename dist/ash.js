"use strict";

function ash(name, props) {
  return [name, props || {}, [].slice.call(arguments, 2)];
}

ash.mount = function(root, app, m) {
  function make(node) {
    if (node.split) return document.createTextNode(node);
    var e = document.createElement(node[0]);
    Object.keys(node[1]).forEach(function(k) {
      var v = node[1][k];
      if (/^on/.test(k)) {
        e.addEventListener(k.slice(2).toLowerCase(), function() {
          render(v.apply(this, arguments));
        });
      } else {
        if (v) e.setAttribute(k === "className" ? "class" : k, v);
        else e.removeAttribute(k);
      }
    });
    node[2].map(make).forEach(e.appendChild.bind(e));
    return e;
  }

  function render(action) {
    if ((!app.update && m) || !action) return;
    m = m ? app.update(action, m) : app.model && app.model();
    while (root.firstChild) root.removeChild(root.firstChild);
    root.appendChild(make(app.view(m)));
  }
  render(1);
  return render;
};
