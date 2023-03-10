const uuid = require('uuid')
const path = require('path');
const {Device, DeviceInfo} = require('../models/models')
const ApiError = require('../error/ApiError');

class DeviceController {
    async create(req, res, next) {
        try {
            let {name, price, brandId, typeId, info} = req.body
            const {img} = req.files
            let fileName = uuid.v4() + ".jpg"
            img.mv(path.resolve(__dirname, '..', 'static', fileName))
            const device = await Device.create({name, price, brandId, typeId, img: fileName});

            if (info) {
                info = JSON.parse(info)
                info.forEach(i =>
                    DeviceInfo.create({
                        title: i.title,
                        description: i.description,
                        deviceId: device.id
                    })
                )
            }

            return res.json(device)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }

    }

    async getAll(req, res) {
        const { brandId, typeId, limit, page } = req.query;
        const countPage = page || 1;
        const currentLimit = limit || 9;
        let offset = countPage * currentLimit - currentLimit;
        let devices;
        if (!brandId && !typeId) { 
            devices = await Device.findAndCountAll({ currentLimit, offset }) 
        }
        if (!brandId && typeId) { 
            devices = await Device.findAndCountAll({ where: { typeId }, currentLimit, offset }) 
        }
        if (brandId && !typeId) { 
            devices = await Device.findAndCountAll({ where: { brandId }, currentLimit, offset }) 
        }
        if (brandId && typeId) { 
            devices = await Device.findAndCountAll({ where: { brandId, typeId}, currentLimit, offset }) 
        }

        return res.json(devices)
    }

    async getOne(req, res) {
        const { id } = req.params;
        const device = await Device.findOne({
            where: { id },
            include: [{ model: DeviceInfo, as: 'info'}]
        })
        
        return res.json(device)
    }

}

module.exports = new DeviceController();