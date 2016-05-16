define(["require", "exports"], function (require, exports) {
    "use strict";
    var Mustache;
    var EltPrototype = Object.create(HTMLElement.prototype);
    EltPrototype._init = function () {
        this._customElements = [];
        this._initAttributesMgmt();
    };
    EltPrototype._initAttributesMgmt = function () {
        var nestedSvgId = this.getAttribute('svg_id');
        console.assert(nestedSvgId, 'Nested SVG id must be given in the "svg_id" custom element attribute');
        this._nestedSvg = document.getElementById(nestedSvgId);
        console.assert(this._nestedSvg, 'Nested SVG must exist in DOM before inserting a <sgj-svg> element');
    };
    EltPrototype.getNestedSvgDomElt = function () {
        return this._nestedSvg;
    };
    EltPrototype.attachedCallback = function () {
        console.log('attach');
        this._init();
    };
    EltPrototype.detachedCallback = function () {
        this._nestedSvg.innerSVG = '';
    };
    EltPrototype.registerElement = function (elt) {
        this._customElements.push(elt);
    };
    EltPrototype.refreshInnerSvg = function () {
        this._customElements.forEach(function (custElt) {
            custElt.refreshInnerSvg();
        });
    };
    EltPrototype.attributeChangedCallback = function (attrName /*, oldVal, newVal*/) {
        console.error('attrib', attrName);
    };
    function register(mustache) {
        Mustache = mustache;
        document.registerElement('sgj-svg', { prototype: EltPrototype });
    }
    exports.register = register;
});
//# sourceMappingURL=svg.js.map