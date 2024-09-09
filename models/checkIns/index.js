const { poolPromise } = require("../../config/database");
const { getUrl } = require("../../config/awsConfig");

const checkInFunctions = {
  async getCheckIns(userId) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        // get checkIns
        const [checkIns] = await pool.query(
          `
            select date, id from checkIns
            where userId = ?
            `,
          [userId]
        );

        // get questions/answers
        const [questions] = await pool.query(
          `
            select ans.*, qst.question, qst.type, qst.fullWidth, qst.textArea
            from checkInsQuestionsAnswers ans
            left join checkInsQuestions qst
              on ans.questionId = qst.id
            left join checkIns chk
              on ans.checkInId = chk.id
            where chk.userId = ?
            `,
          [userId]
        );

        const [photoFiles] = await pool.query(
          `
          select att.s3Url, att.checkInId
          from checkInsAttachments att
          left join checkIns chk
            on chk.id = att.checkInId
          where chk.userId = ?
          `,
          userId
        );

        const photos = await Promise.all(
          photoFiles.map(async (p) => {
            const signedUrl = await getUrl("prepro-test-bucket", p.s3Url);
            return { ...p, signedUrl };
          })
        );

        const checkInObjs = checkIns.reduce((acc, val) => {
          const retArr = [...acc];

          const matchingQuestions = questions.filter(
            (q) => q.checkInId === val.id
          );

          const matchingPhotos = photos.filter((p) => p.checkInId === val.id);

          retArr.push({
            ...val,
            questions: matchingQuestions,
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
  async getCheckInsTemplates() {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        // get templates
        const [templates] = await pool.query(
          `
            select id, name, isDefault from checkInsTemplates
            `
        );

        // get questions
        const [questions] = await pool.query(
          `
            select tmp.templateId, tmp.questionId, tmp.orderId, qst.question, qst.type, qst.fullWidth, qst.textArea
            from checkInsTemplatesQuestions tmp
            left join checkInsQuestions qst
              on tmp.questionId = qst.id
            `
        );

        const templateObjs = templates.reduce((acc, val) => {
          const retArr = [...acc];

          const matchingQuestions = questions.filter(
            (q) => q.templateId === val.id
          );

          retArr.push({ ...val, questions: matchingQuestions });

          return retArr;
        }, []);
        resolve(templateObjs);
      } catch (e) {
        reject(e);
      }
    });
  },
  async editCheckIn(date, userId, checkInId, questions) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        if (!checkInId) {
          //   // insert
          const result = await pool.query(
            `
              insert into checkIns (userId, date)
              values (?, ?)
              `,
            [userId, date]
          );

          const newId = result[0].insertId;

          const questionPromises = questions.map((q) => {
            return pool.query(
              `
                insert into checkInsQuestionsAnswers
                (checkInId, questionId, answer, orderId)
                values (?, ?, ?, ?)
                `,
              [newId, q.questionId, q.answer, q.orderId]
            );
          });

          await Promise.all(questionPromises);
          resolve("insert");
        } else {
          // edit
          const questionPromises = questions.map((q) => {
            return pool.query(
              `
                update checkInsQuestionsAnswers
                set answer = ? where id = ?
                `,
              [q.answer, q.id]
            );
          });

          await Promise.all(questionPromises);
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
  async deleteCheckIn(id) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
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
  async addCheckInAttachments(checkInId, filepaths) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;

        const attachmentPromises = filepaths.map((path) => {
          return pool.query(
            `
            insert into checkInsAttachments (checkInId, s3Url)
            values (?, ?)
            `,
            [checkInId, path]
          );
        });

        await Promise.all(attachmentPromises);
        resolve("success");
      } catch (e) {
        reject(e);
      }
    });
  },
};

module.exports = checkInFunctions;
