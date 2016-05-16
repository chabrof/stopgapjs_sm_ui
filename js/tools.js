define(["require", "exports"], function (require, exports) {
    "use strict";
    var Tools = (function () {
        function Tools() {
        }
        Tools.getDistanceBwDots = function (dot1, dot2) {
            var a = dot1.x - dot2.x;
            var b = dot1.y - dot2.y;
            return Math.sqrt(a * a + b * b);
        };
        return Tools;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Tools;
});
//# sourceMappingURL=tools.js.map