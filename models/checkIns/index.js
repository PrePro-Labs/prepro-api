const { poolPromise } = require("../../config/database");
const { getUrl, deleteFile, lambdaKey } = require("../../config/awsConfig");
const axios = require("axios");

const checkInFunctions = {
  async getCheckIns(userId) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        // get checkIns
        const [checkIns] = await pool.query(
          `
            select * from checkIns
            where userId = ?
            `,
          [userId]
        );

        const [photoFiles] = await pool.query(
          `
          select att.s3Filename, att.checkInId, att.id, att.poseId
          from checkInsAttachments att
          left join checkIns chk
            on chk.id = att.checkInId
          where chk.userId = ?
          `,
          userId
        );

        const photos = await Promise.all(
          photoFiles.map(async (p) => {
            const signedUrl = await getUrl("checkin-photos", p.s3Filename);
            return { ...p, signedUrl };
          })
        );

        const checkInObjs = checkIns.reduce((acc, val) => {
          const retArr = [...acc];

          const matchingPhotos = photos.filter((p) => p.checkInId === val.id);

          retArr.push({
            ...val,
            photos: matchingPhotos,
          });

          return retArr;
        }, []);
        resolve(checkInObjs);
      } catch (e) {
        reject(e);
      }
    });
  },
  async editCheckIn(userId, values) {
    return new Promise(async function (resolve, reject) {
      try {
        const {
          id: checkInId,
          date,
          hormones,
          phase,
          timeline,
          cheats,
          comments,
          cardio,
          training,
        } = values;
        const pool = await poolPromise;
        if (!checkInId) {
          // insert
          await pool.query(
            `
              insert into checkIns (userId, date, hormones, phase, timeline, cheats, comments, cardio, training)
              values (?, ?, ?, ?, ?, ?, ?, ?, ?)
              `,
            [
              userId,
              date,
              hormones,
              phase,
              timeline,
              cheats,
              comments,
              cardio,
              training,
            ]
          );
          resolve("insert");
        } else {
          // edit
          await pool.query(
            `
              update checkIns
              set hormones = ?, phase = ?, timeline = ?, cheats = ?, comments = ?, cardio = ?, training = ?
              where id = ?
              `,
            [
              hormones,
              phase,
              timeline,
              cheats,
              comments,
              cardio,
              training,
              checkInId,
            ]
          );
          resolve("update");
        }
      } catch (e) {
        reject(e);
      }
    });
  },
  async deleteCheckIn(id) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        // get attachments for s3
        const [attachments] = await pool.query(
          `
          select s3Filename
          from checkInsAttachments
          where checkInId = ?
          `,
          [id]
        );

        // delete attachments from s3
        if (attachments.length) {
          const attachmentPromises = attachments.map(async (a) => {
            return await deleteFile("checkin-photos", a.s3Filename);
          });

          await Promise.all(attachmentPromises);
        }

        // delete checkin data from db
        await pool.query(
          `
              delete from checkIns 
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

  async deleteCheckInAttachment(id) {
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

  async getCheckInCommentary(id) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const [result] = await pool.query(
          `
          select * from checkInsCommentary
          where checkInId = ?
          `,
          [id]
        );
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  },

  async addCheckInComment(checkInId, userId, comment) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;

        await pool.query(
          `
            insert into checkInsCommentary (checkInId, userId, comment, date)
            values (?, ?, ?, now())
            `,
          [checkInId, userId, comment]
        );

        resolve("success");
      } catch (e) {
        reject(e);
      }
    });
  },

  async generateSleepSummary(userId, date) {
    return new Promise(async function (resolve, reject) {
      try {
        await axios.post(
          "https://da4jip6eiyzx5p3jwxtaww7d2e0vcurd.lambda-url.us-east-2.on.aws/",
          {
            userId,
            date,
            lambdaKey,
          }
        );
        resolve("success");
      } catch (e) {
        reject(e);
      }
    });
  },
};

module.exports = checkInFunctions;
