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
router.post('/:id/invite', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = (0, auth_1.verifyToken)(req);
        const userId = payload.userId;
        const projectId = req.params.id;
        const { email } = req.body;
        const project = yield prisma.project.findFirst({
            where: { id: projectId, ownerId: userId },
        });
        if (!project) {
            res.status(403).json({ message: 'Kamu bukan pemilik project ini.' });
            return;
        }
        const targetUser = yield prisma.user.findUnique({ where: { email } });
        if (!targetUser) {
            res.status(404).json({ message: 'User tidak ditemukan.' });
            return;
        }
        const alreadyMember = yield prisma.projectMember.findFirst({
            where: {
                projectId,
                userId: targetUser.id,
            },
        });
        if (alreadyMember) {
            res.status(409).json({ message: 'User sudah jadi member.' });
            return;
        }
        const newMember = yield prisma.projectMember.create({
            data: {
                projectId,
                userId: targetUser.id,
            },
        });
        res.status(201).json({ message: 'Berhasil mengundang member.', newMember });
    }
    catch (err) {
        console.error(err);
        res.status(401).json({ message: 'Unauthorized / Error pada server' });
    }
}));
exports.default = router;
