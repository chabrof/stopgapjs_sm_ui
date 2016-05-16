export default class Tools {

	static getDistanceBwDots(dot1, dot2): number {
		let a = dot1.x - dot2.x
  	let b = dot1.y - dot2.y

  	return Math.sqrt( a*a + b*b )
	}
}
