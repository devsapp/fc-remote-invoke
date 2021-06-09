"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fc2_1 = __importDefault(require("@alicloud/fc2"));
class Client {
    static buildFcClient(region, credentials) {
        return new fc2_1.default(credentials.AccountID, {
            accessKeyID: credentials.AccessKeyID,
            accessKeySecret: credentials.AccessKeySecret,
            securityToken: credentials.SecurityToken,
            region,
            timeout: 6000000,
        });
    }
}
exports.default = Client;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpYi9jbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSx3REFBK0I7QUFHL0IsTUFBcUIsTUFBTTtJQUN6QixNQUFNLENBQUMsYUFBYSxDQUFDLE1BQWMsRUFBRSxXQUF5QjtRQUM1RCxPQUFPLElBQUksYUFBRSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUU7WUFDbkMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxXQUFXO1lBQ3BDLGVBQWUsRUFBRSxXQUFXLENBQUMsZUFBZTtZQUM1QyxhQUFhLEVBQUUsV0FBVyxDQUFDLGFBQWE7WUFDeEMsTUFBTTtZQUNOLE9BQU8sRUFBRSxPQUFPO1NBQ2pCLENBQUMsQ0FBQTtJQUNKLENBQUM7Q0FDRjtBQVZELHlCQVVDIn0=