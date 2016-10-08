/// <amd-dependency path="../node_modules/stopgapjs_curve/main"/>
/// <reference path='./i_dot.d.ts' />
/// <reference path='./i_gravity_map.d.ts' />
declare let document :any

import Tools from "./tools"
declare let require :(moduleId :string) => any;

let Curve = require("../node_modules/stopgapjs_curve/main")
let Mustache
let EltPrototype = <any>Object.create(HTMLElement.prototype)

EltPrototype._init = function() {
  this._movingDotId = 0
  this._movingDots = []
  this.initNestedSvg()
  this._getGravityDots()
  this._initAttributesMgmt()
  this._addElementToNestedSvg()
}

EltPrototype.refreshInnerSvg = function() {
  //this._initDomElts()
  //this._initListeners();
}

EltPrototype._getGravityDots = function() {
  let self = this
  let  dotsStr = this.getAttribute('dots') ? this.getAttribute('dots') : ""
  this._dots = []

  let _storeDotCoords = function(dotStr) {
    console.log('dotSTR', dotStr);
    if (dotStr !== '') {
      let coordsStr = dotStr.split(',')
      console.assert(coordsStr.length === 2, coordsStr)

      let coords = {
        x : parseInt(coordsStr[0]),
        y : parseInt(coordsStr[1])
      }
      self._dots.push(coords)
    }
  }
  dotsStr.split(' ').forEach(_storeDotCoords)
  console.log('dots', this._dots)
}

EltPrototype._initAttributesMgmt = function() {
  this._gravitRadius = this.getAttribute('gravit_radius') ? parseInt(this.getAttribute('gravit_radius')) : 30
  this._g = this.getAttribute('g') ? parseInt(this.getAttribute('g')) : 1
}

EltPrototype._addElementToNestedSvg = function() {
  let self = this

  let gradTpl = document.getElementById('gravit_gradient').innerHTML
  this._nestedSvg.innerSVG = Mustache.render(gradTpl) + this._nestedSvg.innerSVG

  let dotTpl = document.getElementById('gravit_dot').innerHTML

  function displayDot(dotCoords) {
    self._nestedSvg.innerSVG = Mustache.render(dotTpl,
      {
        x : dotCoords.x,
        y : dotCoords.y,
        gravit_radius : self._gravitRadius
      }) + self._nestedSvg.innerSVG
  }
  this._dots.forEach(displayDot)
  this._svgCustomElt.refreshInnerSvg()
}

EltPrototype.initNestedSvg = function() {
  let curElt = this;
  while (curElt.parentElement) {
    curElt = curElt.parentElement
    if (curElt.tagName === "SGJ-SVG") {

      this._svgCustomElt = curElt
      this._nestedSvg = curElt.getNestedSvgDomElt()
      break;
    }
  }
  this._svgCustomElt.registerElement(this)
}

EltPrototype.attachedCallback = function() {
  console.log("attach");
  this._init();
}

EltPrototype.detachedCallback = function() {
  //this._removeListeners();
}

EltPrototype.attributeChangedCallback = function(attrName/*, oldVal, newVal*/) {
  console.error('attrib', attrName);
}

EltPrototype.createMovingDot = function() {
  this._movingDotId++

  this._movingDots[this._movingDotId] = new MovingDot()
  return this._movingDots[this._movingDotId]
}

let MovingDot = function() {
  this._history = []
}

MovingDot.prototype._isDotAffectedByGravity = function(dot :IDot) {
  // need optimisation ! in case of numerous gravity dots
  for (let ct = 0, dotLength = this._dots.length; ct < dotLength; ct++) {
    return Tools.getDistanceBwDots(dot, this._dots[ct])
  }
}

MovingDot.prototype._storeDotInHistory = function(dot :IDot) {
  let dotHistoryItem = {
    dot : dot,
    time : Date.now()
  }
  this._history.unshift(dotHistoryItem)
  this._history.splice(4, 1)
}

MovingDot.prototype.computePos = function(dot :IDot) {
  let dotHistoryItem = {
    dot : dot,
    time : Date.now()
  }
  this._history.unshift(dotHistoryItem)
  this._history.splice(4, 1)

  return dotHistoryItem.dot
}

export default function register (mustache) {
  Mustache = mustache
  document.registerElement('sgj-gravit-map', { prototype: EltPrototype });
}
