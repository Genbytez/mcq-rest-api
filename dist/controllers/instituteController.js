"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInstitute = exports.updateInstitute = exports.getInstituteById = exports.getInstitutes = exports.createInstitute = void 0;
const db_1 = require("../config/db");
const institute_1 = require("../entities/institute");
const appProperties_1 = __importDefault(require("../config/appProperties"));
const pagination_1 = require("../utils/pagination");
const toBoolean = (value, fallback) => {
    if (typeof value === "boolean")
        return value;
    if (value === "true" || value === "1" || value === 1)
        return true;
    if (value === "false" || value === "0" || value === 0)
        return false;
    return fallback;
};
const formatLogoPath = (logo) => {
    if (!logo)
        return null;
    // If it's already a full URL, return as is
    if (logo.startsWith("http"))
        return logo;
    const baseUrl = `http://localhost:${appProperties_1.default.PORT}`;
    // If it starts with /assets/, prepend the baseUrl
    if (logo.startsWith("/assets/"))
        return `${baseUrl}${logo}`;
    // If it starts with assets/, prepend baseUrl and a slash
    if (logo.startsWith("assets/"))
        return `${baseUrl}/${logo}`;
    // Otherwise, prepend /assets/
    return `${baseUrl}/assets/${logo}`;
};
const createInstitute = async (req, res) => {
    try {
        const actorId = req.decoded?.userId ?? null;
        const repo = db_1.AppDataSource.getRepository(institute_1.Institute);
        const { code, name, address, isActive, phoneNumber, email } = req.body;
        const logo = req.file ? `/assets/logos/${req.file.filename}` : null;
        const existing = await repo.findOne({ where: { code } });
        if (existing) {
            return res.status(409).json({ success: false, error: "Institute code already exists" });
        }
        const institute = repo.create({
            code,
            name,
            address: address ?? null,
            phoneNumber: phoneNumber ?? null,
            email: email ?? null,
            logo,
            isActive: toBoolean(isActive, true),
            createdBy: actorId,
            updatedBy: actorId,
        });
        const saved = await repo.save(institute);
        return res.status(201).json({ success: true, data: { ...saved, logo: formatLogoPath(saved.logo) } });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to create institute" });
    }
};
exports.createInstitute = createInstitute;
const getInstitutes = async (req, res) => {
    try {
        const { page, limit, skip, q } = (0, pagination_1.parsePaginationQuery)(req);
        const isActive = (0, pagination_1.parseBooleanQuery)(req.query.isActive);
        const repo = db_1.AppDataSource.getRepository(institute_1.Institute);
        const items = await repo.find({ order: { id: "ASC" } });
        const search = q?.toLowerCase();
        const filtered = items.filter((item) => {
            if (item.isDeleted)
                return false;
            if (isActive !== undefined && item.isActive !== isActive)
                return false;
            if (search) {
                return (item.code.toLowerCase().includes(search) ||
                    item.name.toLowerCase().includes(search) ||
                    (item.address ?? "").toLowerCase().includes(search));
            }
            return true;
        });
        const total = filtered.length;
        const data = (0, pagination_1.paginateArray)(filtered, skip, limit).map((item) => ({
            ...item,
            logo: formatLogoPath(item.logo),
        }));
        return res.json({ success: true, data, pagination: (0, pagination_1.buildPagination)(page, limit, total) });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to fetch institutes" });
    }
};
exports.getInstitutes = getInstitutes;
const getInstituteById = async (req, res) => {
    try {
        const repo = db_1.AppDataSource.getRepository(institute_1.Institute);
        const item = await repo.findOne({ where: { id: req.params.id } });
        if (!item)
            return res.status(404).json({ success: false, error: "Institute not found" });
        return res.json({ success: true, data: { ...item, logo: formatLogoPath(item.logo) } });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to fetch institute" });
    }
};
exports.getInstituteById = getInstituteById;
const updateInstitute = async (req, res) => {
    try {
        const actorId = req.decoded?.userId ?? null;
        const repo = db_1.AppDataSource.getRepository(institute_1.Institute);
        const item = await repo.findOne({ where: { id: req.params.id } });
        if (!item)
            return res.status(404).json({ success: false, error: "Institute not found" });
        const { code, name, address, isActive, email, phoneNumber } = req.body;
        if (req.file) {
            item.logo = `/assets/logos/${req.file.filename}`;
        }
        if (code !== undefined && code !== item.code) {
            const existing = await repo.findOne({ where: { code } });
            if (existing) {
                return res.status(409).json({ success: false, error: "Institute code already exists" });
            }
            item.code = code;
        }
        if (name !== undefined)
            item.name = name;
        if (address !== undefined)
            item.address = address ?? null;
        if (phoneNumber !== undefined)
            item.phoneNumber = phoneNumber ?? null;
        if (email !== undefined)
            item.email = email ?? null;
        if (isActive !== undefined)
            item.isActive = toBoolean(isActive, item.isActive);
        item.updatedBy = actorId;
        const saved = await repo.save(item);
        return res.json({ success: true, data: { ...saved, logo: formatLogoPath(saved.logo) } });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to update institute" });
    }
};
exports.updateInstitute = updateInstitute;
const deleteInstitute = async (req, res) => {
    try {
        const actorId = req.decoded?.userId ?? null;
        const repo = db_1.AppDataSource.getRepository(institute_1.Institute);
        const item = await repo.findOne({ where: { id: req.params.id } });
        if (!item)
            return res.status(404).json({ success: false, error: "Institute not found" });
        item.isDeleted = true;
        item.isActive = false;
        item.updatedBy = actorId;
        await repo.save(item);
        return res.json({ success: true, message: "Institute deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to delete institute" });
    }
};
exports.deleteInstitute = deleteInstitute;
