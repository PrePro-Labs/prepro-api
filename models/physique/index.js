const { poolPromise } = require("../../config/database");

const physiqueFunctions = {
  async getPoses() {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const [result] = await pool.query(
          `
          select * from checkInsPoses
          `
        );
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  },

  async getPhotos(userId) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const [result] = await pool.query(
          `
          select a.* from checkInsAttachments a
          left join checkIns c
            on a.checkInId = c.id
          where c.userId = ?
          `,
          [userId]
        );
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  },

  // async changePose(photoId, poseId) {
  //   return new Promise(async function (resolve, reject) {
  //     try {
  //       const pool = await poolPromise;
  //       const [result] = await pool.query(
  //         `
  //         update checkInsAttachments set poseId = ? where id = ?
  //         `,
  //         [poseId === "" ? null : poseId, photoId]
  //       );
  //       resolve(result);
  //     } catch (e) {
  //       reject(e);
  //     }
  //   });
  // },
};

module.exports = physiqueFunctions;
