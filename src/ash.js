module.exports = {
  mount: (root, app) => {
    const { view, model, update } = app;
    let m;

    const make = node => {
      if (typeof node === "string") return document.createTextNode(node);
      const e = document.createElement(node[0]);
      Object.entries(node[1]).forEach(pair => {
        const k = pair[0];
        const v = pair[1];
        if (/^on/.test(k)) {
          e.addEventListener(k.slice(2).toLowerCase(), (...args) =>
            render(v(...args))
          );
        } else {
          if (v) e.setAttribute(k === "className" ? "class" : k, v);
          else e.removeAttribute(k);
        }
      });
      node[2].map(make).forEach(c => e.appendChild(c));
      return e;
    };

    const render = action => {
      if ((!update && m) || !action) return;
      m = m ? update(action, m) : model && model();
      while (root.firstChild) root.removeChild(root.firstChild);
      root.appendChild(make(view(m)));
    };

    render(1);

    return {
      update: render
    };
  }
};
