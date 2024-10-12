const { poolPromise } = require("../../config/database");
const { getUrl } = require("../../config/awsConfig");

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

        const photos = await Promise.all(
          result.map(async (p) => {
            const signedUrl = await getUrl("checkin-photos", p.s3Filename);
            return { ...p, signedUrl };
          })
        );

        resolve(photos);
      } catch (e) {
        reject(e);
      }
    });
  },

  async changePose(photoId, poseId) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const [result] = await pool.query(
          `
          update checkInsAttachments set poseId = ? where id = ?
          `,
          [poseId === "" ? null : poseId, photoId]
        );
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  },

  async addPhotos(checkInId, filenames) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;

        const attachmentPromises = filenames.map((name) => {
          return pool.query(
            `
            insert into checkInsAttachments (checkInId, s3Filename)
            values (?, ?)
            `,
            [checkInId, name]
          );
        });

        await Promise.all(attachmentPromises);
        resolve("success");
      } catch (e) {
        reject(e);
      }
    });
  },

  async getPhotoDetails(id) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const [result] = await pool.query(
          `
          select * from checkInsAttachments
          where id = ?
          `,
          [id]
        );
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  },

  async deletePhysiquePhoto(id) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        await pool.query(
          `
              delete from checkInsAttachments
              where id = ?
              `,
          [id]
        );

        resolve("success");
      } catch (e) {
        reject(e);
      }
    });
  },
};

module.exports = physiqueFunctions;
