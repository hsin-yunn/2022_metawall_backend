const appErrorHandle = require('../service/appErrorHandle');

module.exports = {
  checkRequiredField(data, requiredFields = [], next) {
    requiredFields.forEach((field) => {
      if (data && !data[field]) {
        next(appErrorHandle(400, `${field} is required`, next));
      }
    });
  },
};
