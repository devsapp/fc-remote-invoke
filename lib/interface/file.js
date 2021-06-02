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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const get_stdin_1 = __importDefault(require("get-stdin"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const readline_1 = __importDefault(require("readline"));
const logger_1 = __importDefault(require("../common/logger"));
class File {
    static getEvent(eventFile) {
        return __awaiter(this, void 0, void 0, function* () {
            let event = yield get_stdin_1.default(); // read from pipes
            if (!eventFile)
                return event;
            return yield new Promise((resolve, reject) => {
                let input;
                if (eventFile === '-') { // read from stdin
                    logger_1.default.log(`Reading event data from stdin, which can be ended with Enter then Ctrl+D
    (you can also pass it from file with -e)`);
                    input = process.stdin;
                }
                else {
                    input = fs_extra_1.default.createReadStream(eventFile, {
                        encoding: 'utf-8'
                    });
                }
                const rl = readline_1.default.createInterface({
                    input,
                    output: process.stdout
                });
                event = '';
                rl.on('line', (line) => {
                    event += line;
                });
                rl.on('close', () => resolve(event));
                rl.on('SIGINT', () => reject(new Error('^C')));
            });
        });
    }
    static eventPriority(eventPriority) {
        return __awaiter(this, void 0, void 0, function* () {
            let eventFile;
            if (eventPriority.event) {
                return eventPriority.event;
            }
            else if (eventPriority.eventStdin) {
                eventFile = '-';
            }
            else if (eventPriority.eventFile) {
                eventFile = path_1.default.resolve(process.cwd(), eventPriority.eventFile);
            }
            return yield this.getEvent(eventFile);
        });
    }
}
exports.default = File;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbnRlcmZhY2UvZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLGdEQUF3QjtBQUN4QiwwREFBaUM7QUFDakMsd0RBQTBCO0FBQzFCLHdEQUFnQztBQUNoQyw4REFBc0M7QUFFdEMsTUFBcUIsSUFBSTtJQUV2QixNQUFNLENBQU8sUUFBUSxDQUFDLFNBQVM7O1lBQzdCLElBQUksS0FBSyxHQUFHLE1BQU0sbUJBQVEsRUFBRSxDQUFDLENBQUMsa0JBQWtCO1lBRWhELElBQUksQ0FBQyxTQUFTO2dCQUFFLE9BQU8sS0FBSyxDQUFDO1lBRTdCLE9BQU8sTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtnQkFDM0MsSUFBSSxLQUFLLENBQUM7Z0JBRVYsSUFBSSxTQUFTLEtBQUssR0FBRyxFQUFFLEVBQUUsa0JBQWtCO29CQUN6QyxnQkFBTSxDQUFDLEdBQUcsQ0FBQzs2Q0FDMEIsQ0FBQyxDQUFBO29CQUN0QyxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztpQkFDdkI7cUJBQU07b0JBQ0wsS0FBSyxHQUFHLGtCQUFFLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFO3dCQUNyQyxRQUFRLEVBQUUsT0FBTztxQkFDbEIsQ0FBQyxDQUFBO2lCQUNIO2dCQUNELE1BQU0sRUFBRSxHQUFHLGtCQUFRLENBQUMsZUFBZSxDQUFDO29CQUNsQyxLQUFLO29CQUNMLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTTtpQkFDdkIsQ0FBQyxDQUFBO2dCQUVGLEtBQUssR0FBRyxFQUFFLENBQUM7Z0JBQ1gsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtvQkFDckIsS0FBSyxJQUFJLElBQUksQ0FBQTtnQkFDZixDQUFDLENBQUMsQ0FBQTtnQkFDRixFQUFFLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtnQkFFcEMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNoRCxDQUFDLENBQUMsQ0FBQTtRQUNKLENBQUM7S0FBQTtJQUVELE1BQU0sQ0FBTyxhQUFhLENBQUMsYUFBYTs7WUFDdEMsSUFBSSxTQUFpQixDQUFDO1lBRXRCLElBQUksYUFBYSxDQUFDLEtBQUssRUFBRTtnQkFDdkIsT0FBTyxhQUFhLENBQUMsS0FBSyxDQUFDO2FBQzVCO2lCQUFNLElBQUksYUFBYSxDQUFDLFVBQVUsRUFBRTtnQkFDbkMsU0FBUyxHQUFHLEdBQUcsQ0FBQzthQUNqQjtpQkFBTSxJQUFJLGFBQWEsQ0FBQyxTQUFTLEVBQUU7Z0JBQ2xDLFNBQVMsR0FBRyxjQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDbEU7WUFFRCxPQUFPLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQTtRQUN2QyxDQUFDO0tBQUE7Q0FDRjtBQS9DRCx1QkErQ0MifQ==