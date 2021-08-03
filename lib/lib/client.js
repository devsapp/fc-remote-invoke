"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const fc2_1 = __importDefault(require("@alicloud/fc2"));
const core = __importStar(require("@serverless-devs/core"));
class Client {
    static buildFcClient(region, credentials) {
        return __awaiter(this, void 0, void 0, function* () {
            return new fc2_1.default(credentials.AccountID, {
                accessKeyID: credentials.AccessKeyID,
                accessKeySecret: credentials.AccessKeySecret,
                securityToken: credentials.SecurityToken,
                region,
                endpoint: yield this.getFcEndpoint(),
                timeout: 6000000,
            });
        });
    }
    static getFcEndpoint() {
        return __awaiter(this, void 0, void 0, function* () {
            const fcDefault = yield core.loadComponent('devsapp/fc-default');
            const fcEndpoint = yield fcDefault.get({ args: 'fc-endpoint' });
            if (!fcEndpoint) {
                return undefined;
            }
            const enableFcEndpoint = yield fcDefault.get({ args: 'enable-fc-endpoint' });
            return (enableFcEndpoint === true || enableFcEndpoint === 'true') ? fcEndpoint : undefined;
        });
    }
}
exports.default = Client;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpYi9jbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsd0RBQStCO0FBQy9CLDREQUE4QztBQUc5QyxNQUFxQixNQUFNO0lBQ3pCLE1BQU0sQ0FBTyxhQUFhLENBQUMsTUFBYyxFQUFFLFdBQXlCOztZQUNsRSxPQUFPLElBQUksYUFBRSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUU7Z0JBQ25DLFdBQVcsRUFBRSxXQUFXLENBQUMsV0FBVztnQkFDcEMsZUFBZSxFQUFFLFdBQVcsQ0FBQyxlQUFlO2dCQUM1QyxhQUFhLEVBQUUsV0FBVyxDQUFDLGFBQWE7Z0JBQ3hDLE1BQU07Z0JBQ04sUUFBUSxFQUFFLE1BQU0sSUFBSSxDQUFDLGFBQWEsRUFBRTtnQkFDcEMsT0FBTyxFQUFFLE9BQU87YUFDakIsQ0FBQyxDQUFBO1FBQ0osQ0FBQztLQUFBO0lBRU8sTUFBTSxDQUFPLGFBQWE7O1lBQ2hDLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sVUFBVSxHQUFXLE1BQU0sU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQUUsT0FBTyxTQUFTLENBQUM7YUFBRTtZQUN0QyxNQUFNLGdCQUFnQixHQUFRLE1BQU0sU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxvQkFBb0IsRUFBRSxDQUFDLENBQUM7WUFDbEYsT0FBTyxDQUFDLGdCQUFnQixLQUFLLElBQUksSUFBSSxnQkFBZ0IsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDN0YsQ0FBQztLQUFBO0NBQ0Y7QUFuQkQseUJBbUJDIn0=