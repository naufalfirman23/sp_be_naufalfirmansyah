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
router.get('/:projectId/tasks', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = (0, auth_1.verifyToken)(req);
        const userId = payload.userId;
        const projectId = req.params.projectId;
        const isMember = yield prisma.project.findFirst({
            where: {
                id: projectId,
                OR: [
                    { ownerId: userId },
                    { members: { some: { userId } } },
                ],
            },
        });
        if (!isMember) {
            res.status(403).json({ message: 'Tidak punya akses' });
            return;
        }
        const tasks = yield prisma.task.findMany({ where: { projectId } });
        res.status(200).json(tasks);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
router.post('/:projectId/tasks', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = (0, auth_1.verifyToken)(req);
        const userId = payload.userId;
        const projectId = req.params.projectId;
        const { title, description, status, assigneeId } = req.body;
        const isMember = yield prisma.project.findFirst({
            where: {
                id: projectId,
                OR: [
                    { ownerId: userId },
                    { members: { some: { userId } } },
                ],
            },
        });
        if (!isMember) {
            res.status(403).json({ message: 'Tidak punya akses' });
            return;
        }
        const task = yield prisma.task.create({
            data: {
                title,
                description,
                status,
                assigneeId,
                projectId,
            },
        });
        res.status(201).json(task);
    }
    catch (error) {
        res.status(500).json({ message: 'Gagal membuat task' });
    }
}));
router.put('/:projectId/tasks/:taskId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = (0, auth_1.verifyToken)(req);
        const userId = payload.userId;
        const { projectId, taskId } = req.params;
        const { title, description, status, assigneeId } = req.body;
        const isMember = yield prisma.project.findFirst({
            where: {
                id: projectId,
                OR: [{ ownerId: userId }, { members: { some: { userId } } }],
            },
        });
        if (!isMember) {
            res.status(403).json({ message: 'Tidak punya akses' });
            return;
        }
        const updated = yield prisma.task.update({
            where: { id: taskId },
            data: {
                title,
                description,
                status,
                assigneeId,
            },
        });
        res.status(200).json(updated);
    }
    catch (err) {
        res.status(500).json({ message: 'Gagal update task' });
    }
}));
router.delete('/:projectId/tasks/:taskId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = (0, auth_1.verifyToken)(req);
        const userId = payload.userId;
        const { projectId, taskId } = req.params;
        const isMember = yield prisma.project.findFirst({
            where: {
                id: projectId,
                OR: [{ ownerId: userId }, { members: { some: { userId } } }],
            },
        });
        if (!isMember) {
            res.status(403).json({ message: 'Tidak punya akses' });
            return;
        }
        yield prisma.task.delete({ where: { id: taskId } });
        res.status(200).json({ message: 'Task berhasil dihapus' });
    }
    catch (err) {
        res.status(500).json({ message: 'Gagal hapus task' });
    }
}));
exports.default = router;
