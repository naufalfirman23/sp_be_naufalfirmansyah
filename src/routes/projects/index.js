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
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = (0, auth_1.verifyToken)(req);
        const userId = payload.userId;
        const projects = yield prisma.project.findMany({
            where: {
                OR: [
                    { ownerId: userId },
                    { members: { some: { userId: userId } } },
                ],
            },
        });
        res.status(200).json(projects);
    }
    catch (err) {
        res.status(401).json({ message: 'Unauthorized' });
    }
}));
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = (0, auth_1.verifyToken)(req);
        const userId = payload.userId;
        const { name } = req.body;
        const newProject = yield prisma.project.create({
            data: {
                name,
                ownerId: userId,
            },
        });
        res.status(201).json(newProject);
    }
    catch (err) {
        console.error(err);
        res.status(401).json({ message: 'Unauthorized' });
    }
}));
exports.default = router;
