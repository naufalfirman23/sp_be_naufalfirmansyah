"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Import routes
const login_1 = __importDefault(require("./routes/auth/login"));
const register_1 = __importDefault(require("./routes/auth/register"));
const projects_1 = __importDefault(require("./routes/projects"));
const invite_1 = __importDefault(require("./routes/projects/invite"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const export_1 = __importDefault(require("./routes/projects/export"));
app.use('/api/projects', export_1.default);
app.use('/api/auth/login', login_1.default);
app.use('/api/auth/register', register_1.default);
app.use('/api/projects', projects_1.default);
app.use('/api/projects', invite_1.default);
app.use('/api/projects', tasks_1.default);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
