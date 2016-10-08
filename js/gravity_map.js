define(["require", "exports", "./tools", "../node_modules/stopgapjs_curve/main"], function (require, exports, tools_1) {
    "use strict";
    var Curve = require("../node_modules/stopgapjs_curve/main");
    var Mustache;
    var EltPrototype = Object.create(HTMLElement.prototype);
    EltPrototype._init = function () {
        this._movingDotId = 0;
        this._movingDots = [];
        this.initNestedSvg();
        this._getGravityDots();
        this._initAttributesMgmt();
        this._addElementToNestedSvg();
    };
    EltPrototype.refreshInnerSvg = function () {
    };
    EltPrototype._getGravityDots = function () {
        var self = this;
        var dotsStr = this.getAttribute('dots') ? this.getAttribute('dots') : "";
        this._dots = [];
        var _storeDotCoords = function (dotStr) {
            console.log('dotSTR', dotStr);
            if (dotStr !== '') {
                var coordsStr = dotStr.split(',');
                console.assert(coordsStr.length === 2, coordsStr);
                var coords = {
                    x: parseInt(coordsStr[0]),
                    y: parseInt(coordsStr[1])
                };
                self._dots.push(coords);
            }
        };
        dotsStr.split(' ').forEach(_storeDotCoords);
        console.log('dots', this._dots);
    };
    EltPrototype._initAttributesMgmt = function () {
        this._gravitRadius = this.getAttribute('gravit_radius') ? parseInt(this.getAttribute('gravit_radius')) : 30;
        this._g = this.getAttribute('g') ? parseInt(this.getAttribute('g')) : 1;
    };
    EltPrototype._addElementToNestedSvg = function () {
        var self = this;
        var gradTpl = document.getElementById('gravit_gradient').innerHTML;
        this._nestedSvg.innerSVG = Mustache.render(gradTpl) + this._nestedSvg.innerSVG;
        var dotTpl = document.getElementById('gravit_dot').innerHTML;
        function displayDot(dotCoords) {
            self._nestedSvg.innerSVG = Mustache.render(dotTpl, {
                x: dotCoords.x,
                y: dotCoords.y,
                gravit_radius: self._gravitRadius
            }) + self._nestedSvg.innerSVG;
        }
        this._dots.forEach(displayDot);
        this._svgCustomElt.refreshInnerSvg();
    };
    EltPrototype.initNestedSvg = function () {
        var curElt = this;
        while (curElt.parentElement) {
            curElt = curElt.parentElement;
            if (curElt.tagName === "SGJ-SVG") {
                this._svgCustomElt = curElt;
                this._nestedSvg = curElt.getNestedSvgDomElt();
                break;
            }
        }
        this._svgCustomElt.registerElement(this);
    };
    EltPrototype.attachedCallback = function () {
        console.log("attach");
        this._init();
    };
    EltPrototype.detachedCallback = function () {
    };
    EltPrototype.attributeChangedCallback = function (attrName) {
        console.error('attrib', attrName);
    };
    EltPrototype.createMovingDot = function () {
        this._movingDotId++;
        this._movingDots[this._movingDotId] = new MovingDot();
        return this._movingDots[this._movingDotId];
    };
    var MovingDot = function () {
        this._history = [];
    };
    MovingDot.prototype._isDotAffectedByGravity = function (dot) {
        for (var ct = 0, dotLength = this._dots.length; ct < dotLength; ct++) {
            return tools_1.default.getDistanceBwDots(dot, this._dots[ct]);
        }
    };
    MovingDot.prototype._storeDotInHistory = function (dot) {
        var dotHistoryItem = {
            dot: dot,
            time: Date.now()
        };
        this._history.unshift(dotHistoryItem);
        this._history.splice(4, 1);
    };
    MovingDot.prototype.computePos = function (dot) {
        var dotHistoryItem = {
            dot: dot,
            time: Date.now()
        };
        this._history.unshift(dotHistoryItem);
        this._history.splice(4, 1);
        return dotHistoryItem.dot;
    };
    function register(mustache) {
        Mustache = mustache;
        document.registerElement('sgj-gravit-map', { prototype: EltPrototype });
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = register;
});
//# sourceMappingURL=gravity_map.js.map