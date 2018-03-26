const test = require("tape");
const JSDOM = require("jsdom").JSDOM;
const DOM = new JSDOM("<html><div id='root'></div></html>");
const root = DOM.window.document.getElementById("root");
global.window = DOM.window;
global.document = DOM.window.document;

["../src/ash", "../src/ash.min"].forEach(f => {
  const ash = require(f);

  test("View without model", assert => {
    ash.mount(root, {
      view: model => ["p", { className: "greet" }, ["Hello, world!"]]
    });
    assert.equal(root.innerHTML, '<p class="greet">Hello, world!</p>');
    assert.end();
  });

  test("View using model", assert => {
    ash.mount(root, {
      model: () => ({ greetString: "Hello, world!" }),
      view: model => ["p", { className: "greet" }, [model.greetString]]
    });
    assert.equal(root.innerHTML, '<p class="greet">Hello, world!</p>');
    assert.end();
  });

  test("View using JSX-compatible templating", assert => {
    ash.mount(root, {
      model: () => ({ greetString: "Hello, world!" }),
      view: model => ash("p", { className: "greet" }, "Hello, world!")
    });
    assert.equal(root.innerHTML, '<p class="greet">Hello, world!</p>');
    assert.end();
  });

  test("Handling event properties", assert => {
    let eventCalled = false;
    ash.mount(root, {
      view: model => [
        "p",
        {
          onClick() {
            eventCalled = true;
          }
        },
        []
      ]
    });
    assert.equal(root.innerHTML, "<p></p>");
    root.firstChild.click();
    assert.true(eventCalled);
    assert.end();
  });

  test("Handling external updates", assert => {
    const app = ash.mount(root, {
      model: () => ({ msg: "Hello" }),
      view: ({ msg }) => ["p", {}, [msg]],
      update: () => ({ msg: "Goodbye" })
    });
    assert.equal(root.innerHTML, "<p>Hello</p>");
    app(true);
    assert.equal(root.innerHTML, "<p>Goodbye</p>");
    assert.end();
  });

  test("Iterating on model", assert => {
    const app = ash.mount(root, {
      model: () => ({ i: 0 }),
      view: ({ i }) => ["p", {}, [i.toString()]],
      update: (_, model) => ({ i: model.i + 1 })
    });
    app(true);
    app(true);
    assert.equal(root.innerHTML, "<p>2</p>");
    assert.end();
  });

  test("Update action dispatch", assert => {
    const app = ash.mount(root, {
      model: () => ({ i: 0 }),
      view: ({ i }) => ["p", {}, [i.toString()]],
      update: (action, { i }) => ({
        i: action === "inc" ? i + 1 : i - 1
      })
    });
    app("inc");
    app("inc");
    app("dec");
    assert.equal(root.innerHTML, "<p>1</p>");
    assert.end();
  });

  test("Handle event-driven updates", assert => {
    ash.mount(root, {
      model: () => ({ i: 0 }),
      view: ({ i }) => [
        "p",
        {
          onClick() {
            return "inc";
          }
        },
        [i.toString()]
      ],
      update: (_, { i }) => ({ i: i + 1 })
    });
    root.firstChild.click();
    root.firstChild.click();
    assert.equal(root.innerHTML, "<p>2</p>");
    assert.end();
  });

  test("Skips render on no event return", assert => {
    let clickCalled = 0;
    ash.mount(root, {
      model: () => ({ i: 0 }),
      view: ({ i }) => [
        "p",
        {
          onClick() {
            clickCalled += 1;
          }
        },
        [i.toString()]
      ],
      update: (_, { i }) => ({ i: i + 1 })
    });
    root.firstChild.click();
    root.firstChild.click();
    assert.equal(clickCalled, 2);
    assert.equal(root.innerHTML, "<p>0</p>");
    assert.end();
  });

  test("Handling boolean attributes", assert => {
    const app = ash.mount(root, {
      model: () => ({ checked: true }),
      view: ({ checked }) => ["p", { checked }, []],
      update: (_, { checked }) => ({ checked: !checked })
    });
    assert.equal(root.innerHTML, '<p checked="true"></p>');
    app(true);
    assert.equal(root.innerHTML, "<p></p>");
    assert.end();
  });
});
