import Tools from "./tools"
declare var document: any

var Mustache
var EltPrototype = Object.create(HTMLElement.prototype)
interface IDot {
	x: number
	y: number
}
EltPrototype._approximateBezierTime = function (mousePos) {
  var mouseToLeftDotLength = Tools.getDistanceBwDots(mousePos, this._dots[0])
  var mouseToRightDotLength = Tools.getDistanceBwDots(mousePos, this._dots[1])
  return mouseToLeftDotLength / (mouseToLeftDotLength + mouseToRightDotLength)
}

EltPrototype.displayDotMoveIndics = function(dotIdx/*, evt*/) {
	this._setVisibilityOfHandyDots(dotIdx, true);
	this._setVisibilityOfControlDot(false);
}

EltPrototype.hideDotMoveIndics = function(dotIdx/*, *evt*/) {
  if (! this._dotMoveActivated) {
    this._setVisibilityOfHandyDots(dotIdx, false);
  }
}

EltPrototype.displayCtrlMoveIndics = function(/*evt*/) {
  this._setVisibilityOfControlDot(true);
	this._setVisibilityOfHandyDots(0, false);
	this._setVisibilityOfHandyDots(1, false);
}

EltPrototype.hideCtrlMoveIndics = function(/*evt*/) {
  if (! this._ctrlMoveActivated) {
    this._setVisibilityOfControlDot(false);
  }
}
// Control dot
EltPrototype._startCtrlMoving = function(evt) {
	console.log('Start');
  this._ctrlMoveActivated = true;
  document.addEventListener("mousemove", this._ctrlMoveCbk, false)
  document.addEventListener("mouseup", this._stopCtrlMovingCbk, true)
  this._setVisibilityOfControlDot(true)
  this._ctrlMoveOrigin.x = evt.offsetX
  this._ctrlMoveOrigin.y = evt.offsetY
}

EltPrototype._stopCtrlMoving = function(/*evt*/) {
  this._ctrlMoveActivated = false
  this._setVisibilityOfControlDot(false)
  document.removeEventListener('mousemove', this._ctrlMoveCbk)
  document.removeEventListener('mouseup', this._stopCtrlMovingCbk)
}

EltPrototype._ctrlMove = function(evt) {
  var bezierTime = this._approximateBezierTime({ x : evt.offsetX, y : evt.offsetY })
  this._ctrlDot.x = (evt.offsetX - (1 - bezierTime) * (1 - bezierTime) * this._dots[0].x - bezierTime * bezierTime * this._dots[1].x) /
    (2 * bezierTime * (1 - bezierTime))
  this._ctrlDot.y = (evt.offsetY - (1 - bezierTime) * (1 - bezierTime) * this._dots[0].y - bezierTime * bezierTime * this._dots[1].y) /
    (2 * bezierTime * (1 - bezierTime))

	this.repaint()
}

// Dots at the ends of the curve
EltPrototype._startDotMoving = function(dotIdx: number/*, evt*/) {
	console.log('Start Dot');
	this._dotMoveActivated = true
	document.addEventListener("mousemove", this._dotMoveCbks[dotIdx], false)
  document.addEventListener("mouseup", this._stopDotMovingCbks[dotIdx], true)
  this._setVisibilityOfHandyDots(dotIdx, true)
}

EltPrototype._stopDotMoving = function(dotIdx: number/*, evt*/) {
	console.log('stop dot');

	this._dotMoveActivated = false
  this._setVisibilityOfHandyDots(dotIdx, false)
  document.removeEventListener('mousemove', this._dotMoveCbks[dotIdx])
  document.removeEventListener('mouseup', this._stopDotMovingCbks[dotIdx])
}

EltPrototype._dotMove = function(dotIdx, evt) {
	var potentialDot:IDot = <IDot>{}
	potentialDot.x =  evt.offsetX
	potentialDot.y =  evt.offsetY
	var newDot= <IDot>{}
	console.log('dotMove', potentialDot, this._rightDot)
	newDot = this._computePos(dotIdx, potentialDot)
	if (newDot) {
		this._dots[dotIdx] = newDot
		this.repaint()
	}
}

EltPrototype._computePosWGrMap = function(dotIdx, potentialDot) {
	let newDot: IDot = this._gravitMovingDots[dotIdx].computePos(potentialDot)
	return newDot
}

EltPrototype._computePosWoGrMap = function(dotIdx, potentialDot) {
	return potentialDot
}

EltPrototype.repaint = function() {
	this._needsRepaint = true
}

EltPrototype._repaint = function(/*fullRepaintFlg*/) {
	if (this._needsRepaint) {
		let data: string = "M " + this._dots[0].x + ',' + this._dots[0].y + " Q " + this._ctrlDot.x +
			"," + this._ctrlDot.y + " " + this._dots[1].x + ', ' + this._dots[1].y

    this._domBezierCurve.setAttribute("d", data)
    this._domHandyCurve.setAttribute("d", data)

		this._domCurveControlDot.setAttribute("cx", this._ctrlDot.x + "px")
    this._domCurveControlDot.setAttribute("cy", this._ctrlDot.y + "px")

    this._domLeftLine.setAttribute("x1", this._dots[0].x + "px")
    this._domLeftLine.setAttribute("y1", this._dots[0].y + "px")
		this._domLeftLine.setAttribute("x2", this._ctrlDot.x + "px")
    this._domLeftLine.setAttribute("y2", this._ctrlDot.y + "px")

    this._domRightLine.setAttribute("x1", this._dots[1].x + "px")
    this._domRightLine.setAttribute("y1", this._dots[1].y + "px")
		this._domRightLine.setAttribute("x2", this._ctrlDot.x + "px")
    this._domRightLine.setAttribute("y2", this._ctrlDot.y + "px")

		if (true /*fullRepaintFlg*/) {
			this._domLeftDot.setAttribute("cx", this._dots[0].x + "px")
    	this._domLeftDot.setAttribute("cy", this._dots[0].y + "px")
			this._domRightDot.setAttribute("cx", this._dots[1].x + "px")
	    this._domRightDot.setAttribute("cy", this._dots[1].y + "px")

			this._domLeftHandyDot.setAttribute("cx", this._dots[0].x + "px")
    	this._domLeftHandyDot.setAttribute("cy", this._dots[0].y + "px")
			this._domRightHandyDot.setAttribute("cx", this._dots[1].x + "px")
	    this._domRightHandyDot.setAttribute("cy", this._dots[1].y + "px")
		}
	}
	this._needsRepaint = false;
	requestAnimationFrame(this._repainCbk)
}

EltPrototype._setVisibilityOfHandyDots = function(dotIdx: number, visible: boolean) {
  let opacity: string = visible ? '0.2' : '0.0'
	if (dotIdx === 0) {
  	this._domLeftHandyDot.setAttribute('opacity', opacity)
	}
	else {
		this._domRightHandyDot.setAttribute('opacity', opacity)
	}
}

EltPrototype._setVisibilityOfControlDot = function(visible: boolean) {
  var opacity = visible ? '0.2' : '0.0'
  this._domCurveControlDot.setAttribute('opacity', opacity)
  this._domLeftLine.setAttribute('opacity', opacity)
  this._domRightLine.setAttribute('opacity', opacity)
}

EltPrototype._computeLength = function(dot1, dot2) {
  var a = dot1.x - dot2.x
  var b = dot1.y - dot2.y

  return Math.sqrt( a*a + b*b )
}

// The unic ID is stored in Prototype in order to be unic in all instances
EltPrototype._domIdInSvg = 0;

EltPrototype._init = function() {
	this.initNestedSvg()
	this._initAttributesMgmt()
  this._ctrlMoveOrigin = { x : 0, y : 0 }

	this._initPotentialGravityMap()
  this._initUsableCbks()
	this._addElementToNestedSvg()
	this._initDomElts()
	this._initListeners()

	requestAnimationFrame(this._repainCbk)
}

EltPrototype._initUsableCbks = function() {
	var self = this
	this._ctrlMoveCbk = function(evt) { return self._ctrlMove(evt) }
  this._stopCtrlMovingCbk = function(evt) { return self._stopCtrlMoving(evt) }

	this._dotMoveCbks = []
	this._dotMoveCbks[0] = function(evt) { return self._dotMove(0, evt) }
	this._dotMoveCbks[1] = function(evt) { return self._dotMove(1, evt) }

	this._stopDotMovingCbks = []
	this._stopDotMovingCbks[0] = function(evt) { return self._stopDotMoving(0, evt) }
	this._stopDotMovingCbks[1] = function(evt) { return self._stopDotMoving(1, evt) }

	this._displayCtrlMoveIndicsCbk = function (evt) { return self.displayCtrlMoveIndics(evt) }
	this._hideCtrlMoveIndicsCbk = function (evt) { return self.hideCtrlMoveIndics(evt) }
	this._startCtrlMovingCbk = function (evt) { return self._startCtrlMoving(evt) }

	this._displayLeftDotMoveIndicsCbk = function (evt) { return self.displayDotMoveIndics(0, evt) }
	this._hideLeftDotMoveIndicsCbk = function (evt) { return self.hideDotMoveIndics(0, evt) }
	this._startLeftDotMovingCbk = function (evt) { return self._startDotMoving(0, evt) }

	this._displayRightDotMoveIndicsCbk = function (evt) { return self.displayDotMoveIndics(1, evt) }
	this._hideRightDotMoveIndicsCbk = function (evt) { return self.hideDotMoveIndics(1, evt) }
	this._startRightDotMovingCbk = function (evt) { return self._startDotMoving(1, evt) }

	this._repainCbk = function() { return self._repaint() }
}

EltPrototype._initAttributesMgmt = function() {
  this._ctrlMoveActivated = false
	this._dotMoveActivated = false

  this._ctrlDot = {
		x : this.getAttribute('ctrl_dot_x') ? parseInt(this.getAttribute('ctrl_dot_x')) :  0,
		y : this.getAttribute('ctrl_dot_y') ? parseInt(this.getAttribute('ctrl_dot_y')) :  0
	}
	this._dots = []

	for (var ct = 0; ct < 2; ct++) {
    this._dots[ct] = {
			x : this.getAttribute('dot' + (ct + 1) + '_x') ? parseInt(this.getAttribute('dot' + (ct + 1) + '_x')) :  0,
			y : this.getAttribute('dot' + (ct + 1) + '_y') ? parseInt(this.getAttribute('dot' + (ct + 1) + '_y')) :  0
		}
	}
}

EltPrototype.initNestedSvg = function() {
	var curElt = this;
	while (curElt.parentElement) {
		curElt = curElt.parentElement
		if (curElt.tagName === "SGJ-SVG") {
			console.log('curElt' , curElt)
			this._svgCustomElt = curElt
			this._nestedSvg = curElt.getNestedSvgDomElt()
			break
		}
	}
	this._svgCustomElt.registerElement(this)
}

EltPrototype._initPotentialGravityMap = function() {
	this._svgGravitMap = null
	var curElt = this;
	while (curElt.parentElement) {
		curElt = curElt.parentElement
		if (curElt.tagName === "SGJ-GRAVIT-MAP") {
			var pto = curElt.__proto__
			console.log('curEltw' ,pto )
			this._svgGravitMap = curElt

			this._gravitMovingDots = []
			for (var ct = 0; ct <= 1; ct++) {
				this._gravitMovingDots[ct] = this._svgGravitMap.createMovingDot()
			}
			break;
		}
	}

	this._computePos = (this._svgGravitMap  ? this._computePosWGrMap : this._computePosWoGrMap);
}

EltPrototype.refreshInnerSvg = function() {
	this._initDomElts()
	this._initListeners();
}

EltPrototype._initDomElts = function() {
	this._domEltInSvg = document.getElementById(this._domIdInSvg);
	this._domCurveControlDot = this._domEltInSvg.querySelector('#sgj_sm_ctrl_dot')
	this._domRightLine = this._domEltInSvg.querySelector('#sgj_sm_right_line')
	this._domLeftLine = this._domEltInSvg.querySelector('#sgj_sm_left_line')
	this._domBezierCurve = this._domEltInSvg.querySelector('#sgj_sm_curve')
	this._domHandyCurve = this._domEltInSvg.querySelector('#sgj_sm_handy_curve')

	this._domLeftDot = this._domEltInSvg.querySelector('#sgj_sm_left_dot')
	this._domRightDot = this._domEltInSvg.querySelector('#sgj_sm_right_dot')
	this._domLeftHandyDot = this._domEltInSvg.querySelector('#sgj_sm_handy_left_dot')
	this._domRightHandyDot = this._domEltInSvg.querySelector('#sgj_sm_handy_right_dot')
}

EltPrototype._initListeners = function() {
	this._domHandyCurve.addEventListener('mouseover', this._displayCtrlMoveIndicsCbk)
	this._domHandyCurve.addEventListener('mouseout', this._hideCtrlMoveIndicsCbk)
	this._domHandyCurve.addEventListener('mousedown', this._startCtrlMovingCbk)

	this._domBezierCurve.addEventListener('mouseover', this._displayCtrlMoveIndicsCbk)
	this._domBezierCurve.addEventListener('mouseout', this._hideCtrlMoveIndicsCbk)
	this._domBezierCurve.addEventListener('mousedown', this._startCtrlMovingCbk)

	this._domLeftHandyDot.addEventListener('mouseover', this._displayLeftDotMoveIndicsCbk)
	this._domLeftHandyDot.addEventListener('mouseout', this._hideLeftDotMoveIndicsCbk)
	this._domLeftHandyDot.addEventListener('mousedown', this._startLeftDotMovingCbk)

	this._domLeftDot.addEventListener('mouseover', this._displayLeftDotMoveIndicsCbk)
	this._domLeftDot.addEventListener('mouseout', this._hideLeftDotMoveIndicsCbk)
	this._domLeftDot.addEventListener('mousedown', this._startLeftDotMovingCbk)

	this._domRightHandyDot.addEventListener('mouseover', this._displayRightDotMoveIndicsCbk)
	this._domRightHandyDot.addEventListener('mouseout', this._hideRightDotMoveIndicsCbk)
	this._domRightHandyDot.addEventListener('mousedown', this._startRightDotMovingCbk)

	this._domRightDot.addEventListener('mouseover', this._displayRightDotMoveIndicsCbk)
	this._domRightDot.addEventListener('mouseout', this._hideRightDotMoveIndicsCbk)
	this._domRightDot.addEventListener('mousedown', this._startRightDotMovingCbk)
}

EltPrototype._removeListeners = function() {
	this._domHandyCurve.removeEventListener('mouseover', this._displayCtrlMoveIndicsCbk)
	this._domHandyCurve.removeEventListener('mouseout', this._hideCtrlMoveIndicsCbk)
	this._domHandyCurve.removeEventListener('mousedown', this._startCtrlMovingCbk)

	this._domBezierCurve.removeEventListener('mouseover', this._displayCtrlMoveIndicsCbk)
	this._domBezierCurve.removeEventListener('mouseout', this._hideCtrlMoveIndicsCbk)
	this._domBezierCurve.removeEventListener('mousedown', this._startCtrlMovingCbk)

	this._domLeftHandyDot.removeEventListener('mouseover', this._displayLeftDotMoveIndicsCbk)
	this._domLeftHandyDot.removeEventListener('mouseout', this._hideDotLeftMoveIndicscbk)
	this._domLeftHandyDot.removeEventListener('mousedown', this._startLeftDotMovingCbk)

	this._domLeftDot.removeEventListener('mouseover', this._displayLeftDotMoveIndicsCbk)
	this._domLeftDot.removeEventListener('mouseout', this._hideDotLeftMoveIndicscbk)
	this._domLeftDot.removeEventListener('mousedown', this._startLeftDotMovingCbk)

	this._domRightHandyDot.removeEventListener('mouseover', this._displayRightDotMoveIndicsCbk)
	this._domRightHandyDot.removeEventListener('mouseout', this._hideRightDotMoveIndicsCbk)
	this._domRightHandyDot.removeEventListener('mousedown', this._startrightDotMoving)

	this._domRightDot.removeEventListener('mouseover', this._displayRightDotMoveIndicsCbk)
	this._domRightDot.removeEventListener('mouseout', this._hideRightDotMoveIndicsCbk)
	this._domRightDot.removeEventListener('mousedown', this._startrightDotMoving)
}

EltPrototype._addElementToNestedSvg = function() {
	this._domIdInSvg = 'sgj_sm_link_' + EltPrototype._domIdInSvg++
	this._nestedSvg.innerSVG += Mustache.render(EltPrototype._svgSrc,
		{
			'id' : this._domIdInSvg,
			"dot1" : this._dots[0],
			"dot2" : this._dots[1],
			"ctrlDot" : this._ctrlDot
		})
	this._svgCustomElt.refreshInnerSvg()
}

EltPrototype._svgSrc = document.getElementById('state_link').innerHTML

EltPrototype.createdCallback = function() {
}

EltPrototype.attachedCallback = function() {
	console.log('attach');
	this._init();
}

EltPrototype.detachedCallback = function() {
	this._removeListeners();
}

EltPrototype.attributeChangedCallback = function(attrName/*, oldVal, newVal*/) {
	console.error('attrib', attrName);
}

export function	register(mustache): void {
	Mustache = mustache
	document.registerElement('sgj-sm-link', { prototype: EltPrototype });
}
