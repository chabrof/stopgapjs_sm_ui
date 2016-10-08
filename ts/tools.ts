/// <reference path='./i_dot.d.ts' />

export default class Tools {

  static getDistanceBwDots(dot1 :IDot, dot2 :IDot) :number {
    let a = dot1.x - dot2.x
    let b = dot1.y - dot2.y

    return Math.sqrt(a * a + b * b)
  }
}
