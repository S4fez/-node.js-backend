const success = (res, data, statusCode = 200) => res.status(statusCode).json(data);

const created = (res, data) => res.status(201).json(data);

module.exports = { success, created };
