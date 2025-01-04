const { poolPromise } = require("../../../config/database");

const supplementFunctions = {
  async getSupplementItems() {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const [result] = await pool.query(
          `
            select 
	            itm.name,
              itm.description,
              cat.name as categoryName
            from supplementItems itm
            left join supplementItemsCategories cat
              on cat.id = itm.category
            `
        );
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  },
};

module.exports = supplementFunctions;
