/* Minimalny silnik szablonów dla podglądu statycznego.
   Obsługuje składnię z Claude Design: {{ścieżka}}, <sc-if value>, <sc-for list as>, onClick / onChange.
   Dzięki temu logika konfiguratora (js/konfigurator-logika.js) jest 1:1 z projektu.
   W WordPressie zostanie zastąpiony zwykłym modułem vanilla JS (patrz PLAN.md, faza 4). */
(function () {
  function get(scope, path) {
    path = path.trim();
    if (path === 'true') return true;
    if (path === 'false') return false;
    return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, scope);
  }
  var ONE = /^\{\{([^}]*)\}\}$/;
  var ANY = /\{\{([^}]*)\}\}/g;
  var BOOL = { checked: 1, disabled: 1 };

  function renderNodes(nodes, scope, out) {
    nodes.forEach(function (n) {
      if (n.nodeType === 3) {
        out.push(document.createTextNode(n.nodeValue.replace(ANY, function (_, p) { var v = get(scope, p); return v == null ? '' : v; })));
        return;
      }
      if (n.nodeType !== 1) return;
      var tag = n.tagName.toLowerCase();
      if (tag === 'sc-if') {
        var m = (n.getAttribute('value') || '').match(ONE);
        if (m && get(scope, m[1])) renderNodes([].slice.call(n.childNodes), scope, out);
        return;
      }
      if (tag === 'sc-for') {
        var lm = (n.getAttribute('list') || '').match(ONE), as = n.getAttribute('as');
        var list = lm ? get(scope, lm[1]) || [] : [];
        list.forEach(function (item) {
          var s = Object.create(scope); s[as] = item;
          renderNodes([].slice.call(n.childNodes), s, out);
        });
        return;
      }
      var el = n.namespaceURI === 'http://www.w3.org/2000/svg'
        ? document.createElementNS(n.namespaceURI, n.tagName)
        : document.createElement(n.tagName);
      [].slice.call(n.attributes).forEach(function (a) {
        var name = a.name, val = a.value, one = val.match(ONE);
        if (/^on[a-z]+$/i.test(name) && one) {
          var fn = get(scope, one[1]);
          if (typeof fn !== 'function') return;
          el._h = el._h || {};
          if (/^onclick$/i.test(name)) el._h.click = fn;
          else {
            var t = (n.getAttribute('type') || '').toLowerCase();
            el._h[(t === 'number' || t === 'checkbox' || t === 'radio') ? 'change' : 'input'] = fn;
          }
          return;
        }
        if (one) {
          var v = get(scope, one[1]);
          if (BOOL[name]) { if (v) el.setAttribute(name, ''); el[name] = !!v; return; }
          if (name === 'value') { el.value = v == null ? '' : v; if (n.tagName !== 'TEXTAREA') el.setAttribute('value', el.value); return; }
          if (v == null || v === false) return;
          el.setAttribute(name, v);
          return;
        }
        el.setAttribute(name, val.replace(ANY, function (_, p) { var v = get(scope, p); return v == null ? '' : v; }));
      });
      var kids = [];
      renderNodes([].slice.call((n.content || n).childNodes), scope, kids);
      kids.forEach(function (k) { el.appendChild(k); });
      if (n.tagName === 'TEXTAREA') { var vm = (n.getAttribute('value') || '').match(ONE); if (vm) el.value = get(scope, vm[1]) || ''; }
      out.push(el);
    });
  }

  /* Aktualizacja DOM w miejscu (bez podmiany elementów), żeby nie gubić fokusu i kursora. */
  function morph(o, n) {
    if (o.nodeType !== n.nodeType || o.nodeName !== n.nodeName) { o.parentNode.replaceChild(n, o); return; }
    if (o.nodeType === 3) { if (o.nodeValue !== n.nodeValue) o.nodeValue = n.nodeValue; return; }
    var i, at;
    for (i = o.attributes.length - 1; i >= 0; i--) { at = o.attributes[i]; if (!n.hasAttribute(at.name)) o.removeAttribute(at.name); }
    for (i = 0; i < n.attributes.length; i++) { at = n.attributes[i]; if (o.getAttribute(at.name) !== at.value) o.setAttribute(at.name, at.value); }
    o._h = n._h;
    if ('value' in n && (n.tagName === 'INPUT' || n.tagName === 'TEXTAREA')) {
      if (o !== document.activeElement && o.value !== n.value) o.value = n.value;
      if (o.checked !== n.checked) o.checked = n.checked;
    }
    if (n.tagName !== 'TEXTAREA') morphKids(o, [].slice.call(n.childNodes));
  }
  function morphKids(parent, kids) {
    var old = [].slice.call(parent.childNodes), i;
    for (i = 0; i < kids.length; i++) { if (i < old.length) morph(old[i], kids[i]); else parent.appendChild(kids[i]); }
    for (; i < old.length; i++) parent.removeChild(old[i]);
  }

  window.DCLogic = function (props) { this.props = props || {}; this.state = {}; };
  window.DCLogic.prototype.setState = function (o) {
    Object.assign(this.state, typeof o === 'function' ? o(this.state) : o);
    if (this._render) this._render();
  };

  window.dcMount = function (Comp, tpl, root, init) {
    var c = new Comp({});
    var src = [].slice.call(tpl.content.childNodes);
    var first = true;
    ['click', 'input', 'change'].forEach(function (type) {
      root.addEventListener(type, function (e) {
        for (var el = e.target; el && el !== root; el = el.parentNode) {
          if (el._h && el._h[type]) { if (type === 'click' && el.tagName === 'A') e.preventDefault(); el._h[type](e); return; }
        }
      });
    });
    c._render = function () {
      var out = [];
      renderNodes(src, c.renderVals(), out);
      if (first) { root.replaceChildren.apply(root, out); first = false; } else morphKids(root, out);
    };
    if (init) init(c);
    c._render();
    return c;
  };
})();
