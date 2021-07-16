"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProperties = void 0;
function isProperties(args) {
    if (!args) {
        return false;
    }
    return args.domainName || (args.region && args.serviceName && args.functionName);
}
exports.isProperties = isProperties;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ludGVyZmFjZS9lbnRpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBOEJBLFNBQWdCLFlBQVksQ0FBQyxJQUFTO0lBQ3BDLElBQUksQ0FBQyxJQUFJLEVBQUU7UUFDVCxPQUFPLEtBQUssQ0FBQztLQUNkO0lBQ0QsT0FBTyxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBRTtBQUNwRixDQUFDO0FBTEQsb0NBS0MifQ==