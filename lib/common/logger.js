"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const i18n_1 = __importDefault(require("./i18n"));
const core_1 = require("@serverless-devs/core");
class ComponentLogger {
    static setContent(content) {
        ComponentLogger.CONTENT = content;
    }
    static log(m, color) {
        core_1.Logger.log(i18n_1.default.__(m) || m, color);
    }
    static info(m) {
        core_1.Logger.info(ComponentLogger.CONTENT, i18n_1.default.__(m) || m);
    }
    static debug(m) {
        core_1.Logger.debug(ComponentLogger.CONTENT, i18n_1.default.__(m) || m);
    }
    static error(m) {
        core_1.Logger.error(ComponentLogger.CONTENT, i18n_1.default.__(m) || m);
    }
    static warning(m) {
        core_1.Logger.warn(ComponentLogger.CONTENT, i18n_1.default.__(m) || m);
    }
    static success(m) {
        core_1.Logger.log(i18n_1.default.__(m) || m, 'green');
    }
}
exports.default = ComponentLogger;
ComponentLogger.CONTENT = 'FC-REMOTE-INVOKE';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW1vbi9sb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFDQSxrREFBMEI7QUFDMUIsZ0RBQStDO0FBRS9DLE1BQXFCLGVBQWU7SUFFbEMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPO1FBQ3ZCLGVBQWUsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0lBQ3BDLENBQUM7SUFDRCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUE2RztRQUN6SCxhQUFNLENBQUMsR0FBRyxDQUFDLGNBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDWCxhQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsY0FBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ1osYUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLGNBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNaLGFBQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxjQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFRCxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDZCxhQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsY0FBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2QsYUFBTSxDQUFDLEdBQUcsQ0FBQyxjQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN2QyxDQUFDOztBQTFCSCxrQ0EyQkM7QUExQlEsdUJBQU8sR0FBRyxrQkFBa0IsQ0FBQyJ9