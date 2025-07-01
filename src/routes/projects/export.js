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
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../../lib/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.get('/:id/export', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = (0, auth_1.verifyToken)(req);
        const userId = payload.userId;
        const { id } = req.params;
        const project = yield prisma.project.findFirst({
            where: {
                id,
                OR: [
                    { ownerId: userId },
                    { members: { some: { userId } } },
                ],
            },
            include: {
                tasks: true,
                members: {
                    include: { user: true },
                },
            },
        });
        if (!project) {
            res.status(404).json({ message: 'Project tidak ditemukan' });
            return;
        }
        res.setHeader('Content-Disposition', `attachment; filename=project-${id}.json`);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(project, null, 2));
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Gagal export project' });
    }
}));
exports.default = router; // ✅ WAJIB
