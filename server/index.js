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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const icp_1 = __importDefault(require("./routes/icp"));
const leads_1 = require("./routes/leads");
const enrich_1 = require("./routes/enrich");
const email_1 = require("./routes/email");
const upload_1 = require("./routes/upload");
const salesIntelligence_1 = __importDefault(require("./routes/salesIntelligence"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://yourdomain.com']
        : ['http://localhost:3000'],
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '0.1.0-alpha'
    });
});
// API routes
app.use('/api/icp', icp_1.default);
app.use('/api/leads', leads_1.leadsRoutes);
app.use('/api/enrich', enrich_1.enrichRoutes);
app.use('/api/email', email_1.emailRoutes);
app.use('/api/upload', upload_1.uploadRoutes);
app.use('/api/sales-intelligence', salesIntelligence_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});
// Initialize database and start server
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Supabase is now used for all persistence. No local DB init required.
            console.log('✅ Supabase is now the primary database. No local DB init.');
            app.listen(PORT, () => {
                console.log(`🚀 PersonaOps API server running on http://localhost:${PORT}`);
                console.log(`📊 Health check: http://localhost:${PORT}/health`);
                console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
            });
        }
        catch (error) {
            console.error('❌ Failed to start server:', error);
            process.exit(1);
        }
    });
}
startServer();
