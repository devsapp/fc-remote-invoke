"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@serverless-devs/core");
class StdoutFormatter {
    static initStdout() {
        return __awaiter(this, void 0, void 0, function* () {
            this.stdoutFormatter = yield core_1.loadComponent('devsapp/stdout-formatter');
        });
    }
}
exports.default = StdoutFormatter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3Rkb3V0LWZvcm1hdHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tb24vc3Rkb3V0LWZvcm1hdHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLGdEQUFzRDtBQUV0RCxNQUFxQixlQUFlO0lBR2xDLE1BQU0sQ0FBTyxVQUFVOztZQUNyQixJQUFJLENBQUMsZUFBZSxHQUFHLE1BQU0sb0JBQWEsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQ3pFLENBQUM7S0FBQTtDQUNGO0FBTkQsa0NBTUMifQ==